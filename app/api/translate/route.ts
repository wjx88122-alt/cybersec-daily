import { kv } from "@/lib/kv";
import { translateItems } from "@/lib/translate";
import { CUTOFF_MS, FeedItem } from "@/lib/feeds";
import { resolveAppBaseUrl } from "@/lib/app-url";
import {
  isLikelyUntranslated,
  recordTranslationHealthFromItems,
} from "@/lib/translation-health";
import {
  isLikelyLocalizedField,
  pickLocalizedField,
} from "@/lib/translation-detection";
import { after, NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

// Stop translating at 270s to leave time for final save
const TIME_BUDGET_MS = 270_000;
const BATCH_SIZE = 10;

/** Helper: detect Chinese content (skip translation for Chinese sources) */
const isChinese = (text: string) => /[\u4e00-\u9fff]/.test(text);
const normalize = (text?: string) => (text ?? "").trim();
const getTimestamp = (item: FeedItem) => {
  const time = new Date(item.pubDate).getTime();
  return Number.isNaN(time) ? 0 : time;
};

function sortByNewest(items: FeedItem[]) {
  return [...items].sort((a, b) => getTimestamp(b) - getTimestamp(a));
}

function autoFillChineseFields(items: FeedItem[]) {
  items.forEach((item, i) => {
    const patch: Partial<FeedItem> = {};
    if (!normalize(item.titleZh) && isChinese(item.title)) {
      patch.titleZh = item.title;
    }
    if (!normalize(item.summaryZh) && isChinese(item.summary)) {
      patch.summaryZh = item.summary;
    }
    if (Object.keys(patch).length > 0) {
      items[i] = { ...item, ...patch };
    }
  });
}

/** Apply translation map back to item arrays (mutates in place) */
function applyTranslations(
  items: FeedItem[],
  map: Map<string, { titleZh?: string; summaryZh?: string }>,
) {
  items.forEach((item, i) => {
    const t = map.get(item.id);
    if (!t) return;

    const nextTitleZh = pickLocalizedField({
      source: item.title,
      candidate: t.titleZh,
      existing: item.titleZh,
    });
    const nextSummaryZh = pickLocalizedField({
      source: item.summary,
      candidate: t.summaryZh,
      existing: item.summaryZh,
    });

    if (nextTitleZh !== item.titleZh || nextSummaryZh !== item.summaryZh) {
      items[i] = {
        ...item,
        titleZh: nextTitleZh,
        summaryZh: nextSummaryZh,
      };
    }
  });
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const appBaseUrl = resolveAppBaseUrl(req.nextUrl.origin);
  const recentCutoff = Date.now() - CUTOFF_MS;
  const scope = req.nextUrl.searchParams.get("scope") === "recent" ? "recent" : "all";
  const triggerSummarize = () => {
    const summarizeUrl = `${appBaseUrl}/api/summarize`;
    after(() => {
      void fetch(summarizeUrl, {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
        cache: "no-store",
      }).catch((e) => console.error("translate: trigger summarize failed:", e));
    });
  };

  const [feedA, feedB, feedAI] = await Promise.all([
    kv.get<FeedItem[]>("feed-a"),
    kv.get<FeedItem[]>("feed-b"),
    kv.get<FeedItem[]>("feed-ai"),
  ]);

  if (!feedA || !feedB) {
    return NextResponse.json(
      { error: "No feed data, run cron first" },
      { status: 400 },
    );
  }

  const allItems = [...feedA, ...feedB];
  const aiItems = feedAI ?? [];

  // Auto-fill Chinese source content into zh fields to avoid unnecessary LLM calls.
  autoFillChineseFields(allItems);
  autoFillChineseFields(aiItems);

  const toTranslate = allItems.filter(isLikelyUntranslated);
  const toTranslateAI = aiItems.filter(isLikelyUntranslated);
  const recentToTranslate = sortByNewest(
    toTranslate.filter((item) => getTimestamp(item) >= recentCutoff),
  );
  const backlogToTranslate = sortByNewest(
    toTranslate.filter((item) => getTimestamp(item) < recentCutoff),
  );
  const recentToTranslateAI = sortByNewest(
    toTranslateAI.filter((item) => getTimestamp(item) >= recentCutoff),
  );
  const backlogToTranslateAI = sortByNewest(
    toTranslateAI.filter((item) => getTimestamp(item) < recentCutoff),
  );
  const allToTranslate =
    scope === "recent"
      ? [...recentToTranslate, ...recentToTranslateAI]
      : [
          ...recentToTranslate,
          ...backlogToTranslate,
          ...recentToTranslateAI,
          ...backlogToTranslateAI,
        ];

  if (allToTranslate.length === 0) {
    const totalWithZh =
      allItems.filter((i) => isLikelyLocalizedField(i.title, i.titleZh)).length +
      aiItems.filter((i) => isLikelyLocalizedField(i.title, i.titleZh)).length;
    if (feedAI) await kv.set("feed-ai", aiItems);
    triggerSummarize();
    return NextResponse.json({
      ok: true,
      scope,
      withZh: totalWithZh,
      recentPending: 0,
      skipped: true,
    });
  }

  console.log(
    `translate[${scope}]: ${allToTranslate.length} items queued (${recentToTranslate.length} recent sec + ${recentToTranslateAI.length} recent ai + ${backlogToTranslate.length} backlog sec + ${backlogToTranslateAI.length} backlog ai)`,
  );

  const translationMap = new Map<string, { titleZh?: string; summaryZh?: string }>();
  let batchesDone = 0;
  let batchesFailed = 0;

  for (let i = 0; i < allToTranslate.length; i += BATCH_SIZE) {
    // Time budget check — stop before we run out of time
    if (Date.now() - startTime > TIME_BUDGET_MS) {
      console.log(`translate: time budget reached after ${batchesDone} batches, saving progress`);
      break;
    }

    try {
      const batch = allToTranslate.slice(i, i + BATCH_SIZE);
      const results = await translateItems(batch);
      batch.forEach((item, j) => {
        const result = results[j];
        const titleZh = pickLocalizedField({
          source: item.title,
          candidate: result?.titleZh,
        });
        const summaryZh = pickLocalizedField({
          source: item.summary,
          candidate: result?.summaryZh,
        });

        if (titleZh || summaryZh) {
          translationMap.set(item.id, { titleZh, summaryZh });
        }
      });
      batchesDone++;
    } catch (batchErr) {
      batchesFailed++;
      console.error(`Batch ${i} failed, continuing:`, batchErr);
    }

    // Incremental save every 5 batches (50 items) to avoid losing progress
    if (batchesDone > 0 && batchesDone % 5 === 0) {
      applyTranslations(allItems, translationMap);
      applyTranslations(aiItems, translationMap);
      await Promise.all([
        kv.set("feed-a", allItems.slice(0, feedA.length)),
        kv.set("feed-b", allItems.slice(feedA.length)),
        kv.set("feed-ai", aiItems),
      ]);
      console.log(`translate: checkpoint saved after ${batchesDone} batches`);
    }
  }

  // Final save
  applyTranslations(allItems, translationMap);
  applyTranslations(aiItems, translationMap);

  await Promise.all([
    kv.set("feed-a", allItems.slice(0, feedA.length)),
    kv.set("feed-b", allItems.slice(feedA.length)),
    kv.set("feed-ai", aiItems),
  ]);

  const withZh = allItems.filter((i) => isLikelyLocalizedField(i.title, i.titleZh)).length;
  const withZhAI = aiItems.filter((i) => isLikelyLocalizedField(i.title, i.titleZh)).length;
  const unresolved = [...allItems, ...aiItems].filter(isLikelyUntranslated);
  const pending = unresolved.length;
  const recentPending = unresolved.filter(
    (item) => getTimestamp(item) >= recentCutoff,
  ).length;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  await recordTranslationHealthFromItems({
    items: [...allItems, ...aiItems],
    source: `translate:${scope}`,
    extra: {
      pass: {
        scope,
        translated: translationMap.size,
        pending,
        recentPending,
        batchesDone,
        batchesFailed,
        elapsedSec: elapsed,
        reason: req.nextUrl.searchParams.get("reason") ?? null,
      },
    },
  });

  const chainCount = parseInt(req.nextUrl.searchParams.get("chain") ?? "0");
  const MAX_CHAINS = scope === "recent" ? 4 : 3;
  if (scope === "recent" && recentPending > 0 && chainCount < MAX_CHAINS) {
    const selfUrl = `${appBaseUrl}/api/translate?scope=recent&chain=${chainCount + 1}`;
    after(() => {
      void fetch(selfUrl, {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
        cache: "no-store",
      }).catch((e) => console.error("translate: recent chained run failed:", e));
    });
    console.log(
      `translate[recent]: ${recentPending} recent items still pending, chained run ${chainCount + 1}/${MAX_CHAINS}`,
    );
  }
  if (scope === "all" && pending > 0 && chainCount < MAX_CHAINS) {
    const selfUrl = `${appBaseUrl}/api/translate?chain=${chainCount + 1}`;
    after(() => {
      void fetch(selfUrl, {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
        cache: "no-store",
      }).catch((e) => console.error("translate: chained run failed:", e));
    });
    console.log(
      `translate[all]: ${pending} items still pending, chained run ${chainCount + 1}/${MAX_CHAINS}`,
    );
  }
  if (recentPending === 0) {
    triggerSummarize();
  }

  return NextResponse.json({
    ok: true,
    scope,
    withZh,
    withZhAI,
    translated: translationMap.size,
    pending,
    recentPending,
    batchesDone,
    batchesFailed,
    elapsedSec: elapsed,
  });
}
