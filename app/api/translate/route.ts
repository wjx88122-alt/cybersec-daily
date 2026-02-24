import { kv } from "@/lib/kv";
import { translateItems } from "@/lib/translate";
import { FeedItem, CUTOFF_MS } from "@/lib/feeds";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const cutoff = Date.now() - CUTOFF_MS;

  // Helper: detect Chinese content (skip translation for Chinese sources)
  const isChinese = (text: string) => /[\u4e00-\u9fff]/.test(text);

  // Only translate items without existing translation and within cutoff
  const toTranslate = allItems
    .filter((i) => !i.titleZh && new Date(i.pubDate).getTime() >= cutoff)
    .slice(0, 100);

  const toTranslateAI = aiItems
    .filter((i) => !i.titleZh && !isChinese(i.title) && new Date(i.pubDate).getTime() >= cutoff)
    .slice(0, 100);

  // Auto-fill Chinese sources with original text as titleZh/summaryZh
  aiItems.forEach((item, i) => {
    if (!item.titleZh && isChinese(item.title)) {
      aiItems[i] = { ...item, titleZh: item.title, summaryZh: item.summary };
    }
  });

  const allToTranslate = [...toTranslate, ...toTranslateAI];

  if (allToTranslate.length === 0) {
    const totalWithZh = allItems.filter((i) => i.titleZh).length + aiItems.filter((i) => i.titleZh).length;
    // Still save AI items (Chinese sources may have been updated)
    if (feedAI) await kv.set("feed-ai", aiItems);
    return NextResponse.json({
      ok: true,
      withZh: totalWithZh,
      skipped: true,
    });
  }

  try {
    const BATCH_SIZE = 15;
    const translationMap = new Map<
      string,
      { titleZh: string; summaryZh: string }
    >();

    for (let i = 0; i < allToTranslate.length; i += BATCH_SIZE) {
      const batch = allToTranslate.slice(i, i + BATCH_SIZE);
      const results = await translateItems(batch);
      batch.forEach((item, j) => {
        if (results[j]?.titleZh) translationMap.set(item.id, results[j]);
      });
    }

    allItems.forEach((item, i) => {
      const t = translationMap.get(item.id);
      if (t?.titleZh)
        allItems[i] = { ...item, titleZh: t.titleZh, summaryZh: t.summaryZh };
    });

    aiItems.forEach((item, i) => {
      const t = translationMap.get(item.id);
      if (t?.titleZh)
        aiItems[i] = { ...item, titleZh: t.titleZh, summaryZh: t.summaryZh };
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }

  const finalA = allItems.slice(0, feedA.length);
  const finalB = allItems.slice(feedA.length);
  const withZh = allItems.filter((i) => i.titleZh).length;
  const withZhAI = aiItems.filter((i) => i.titleZh).length;

  await Promise.all([
    kv.set("feed-a", finalA),
    kv.set("feed-b", finalB),
    kv.set("feed-ai", aiItems),
  ]);

  return NextResponse.json({
    ok: true,
    withZh,
    withZhAI,
    translated: allToTranslate.length,
  });
}
