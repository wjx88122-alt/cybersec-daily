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

/** Apply translation map back to item arrays (mutates in place) */
function applyTranslations(
  items: FeedItem[],
  map: Map<string, { titleZh: string; summaryZh: string }>,
) {
  items.forEach((item, i) => {
    const t = map.get(item.id);
    if (t?.titleZh) items[i] = { ...item, titleZh: t.titleZh, summaryZh: t.summaryZh };
  });
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

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

  // Auto-fill Chinese sources with original text as titleZh/summaryZh
  aiItems.forEach((item, i) => {
    if (!item.titleZh && isChinese(item.title)) {
      aiItems[i] = { ...item, titleZh: item.title, summaryZh: item.summary };
    }
  });

  // Collect ALL untranslated items — no time filter here
  // (time filtering is only for frontend display, not translation eligibility)
  const toTranslate = allItems.filter((i) => !i.titleZh);
  const toTranslateAI = aiItems.filter(
    (i) => !i.titleZh && !isChinese(i.title),
  );
  const allToTranslate = [...toTranslate, ...toTranslateAI];

  if (allToTranslate.length === 0) {
    const totalWithZh = allItems.filter((i) => i.titleZh).length + aiItems.filter((i) => i.titleZh).length;
    if (feedAI) await kv.set("feed-ai", aiItems);
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
        if (results[j]?.titleZh) translationMap.set(item.id, results[j]);
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
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  return NextResponse.json({
    ok: true,
    withZh,
    withZhAI,
    translated: translationMap.size,
    pending: allToTranslate.length - translationMap.size,
    batchesDone,
    batchesFailed,
    elapsedSec: elapsed,
  });
}
