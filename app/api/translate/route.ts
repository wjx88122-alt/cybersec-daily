import { kv } from "@/lib/kv";
import { translateItems } from "@/lib/translate";
import { FeedItem } from "@/lib/feeds";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

// Stop translating at 270s to leave time for final save
const TIME_BUDGET_MS = 270_000;
const BATCH_SIZE = 10;

/** Helper: detect Chinese content (skip translation for Chinese sources) */
const isChinese = (text: string) => /[\u4e00-\u9fff]/.test(text);
const normalize = (text?: string) => (text ?? "").trim();

function isLikelyUntranslated(item: FeedItem) {
  const title = normalize(item.title);
  const summary = normalize(item.summary);
  const titleZh = normalize(item.titleZh);
  const summaryZh = normalize(item.summaryZh);

  const titleLooksChinese = isChinese(title);
  const summaryLooksChinese = isChinese(summary);

  // For non-Chinese source text, zh field equal to source text usually means untranslated copy.
  const titleCopiedFromSource = !titleLooksChinese && titleZh === title;
  const summaryCopiedFromSource = !summaryLooksChinese && summaryZh === summary;

  return (
    !titleZh ||
    !summaryZh ||
    titleCopiedFromSource ||
    summaryCopiedFromSource
  );
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
  map: Map<string, { titleZh: string; summaryZh: string }>,
) {
  items.forEach((item, i) => {
    const t = map.get(item.id);
    if (!t) return;

    const nextTitleZh = normalize(t.titleZh) || item.titleZh;
    const nextSummaryZh = normalize(t.summaryZh) || item.summaryZh;

    if (nextTitleZh || nextSummaryZh) {
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
  const triggerDigestRebuild = () => {
    const digestUrl = `${req.nextUrl.origin}/api/digest`;
    fetch(digestUrl, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }).catch((e) => console.error("translate: trigger digest failed:", e));
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

  // Collect ALL untranslated/incomplete items — no time filter here
  // (time filtering is only for frontend display, not translation eligibility)
  const toTranslate = allItems.filter(isLikelyUntranslated);
  const toTranslateAI = aiItems.filter(isLikelyUntranslated);
  const allToTranslate = [...toTranslate, ...toTranslateAI];

  if (allToTranslate.length === 0) {
    const totalWithZh = allItems.filter((i) => i.titleZh).length + aiItems.filter((i) => i.titleZh).length;
    if (feedAI) await kv.set("feed-ai", aiItems);
    triggerDigestRebuild();
    return NextResponse.json({ ok: true, withZh: totalWithZh, skipped: true });
  }

  console.log(`translate: ${allToTranslate.length} items pending (${toTranslate.length} sec + ${toTranslateAI.length} ai)`);

  const translationMap = new Map<string, { titleZh: string; summaryZh: string }>();
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
        if (normalize(result?.titleZh) || normalize(result?.summaryZh)) {
          translationMap.set(item.id, result);
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

  const withZh = allItems.filter((i) => i.titleZh).length;
  const withZhAI = aiItems.filter((i) => i.titleZh).length;
  const pending = allToTranslate.length - translationMap.size;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Self-chain: if there are still pending items, fire another translate run
  // Uses fire-and-forget fetch so this response returns immediately
  // Limit chain depth to prevent infinite loops
  const chainCount = parseInt(req.nextUrl.searchParams.get("chain") ?? "0");
  const MAX_CHAINS = 3;
  if (pending > 0 && chainCount < MAX_CHAINS) {
    const selfUrl = `${req.nextUrl.origin}/api/translate?chain=${chainCount + 1}`;
    fetch(selfUrl, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }).catch(() => {});
    console.log(`translate: ${pending} items still pending, chained run ${chainCount + 1}/${MAX_CHAINS}`);
  }
  if (pending === 0) {
    triggerDigestRebuild();
  }

  return NextResponse.json({
    ok: true,
    withZh,
    withZhAI,
    translated: translationMap.size,
    pending,
    batchesDone,
    batchesFailed,
    elapsedSec: elapsed,
  });
}
