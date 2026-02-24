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

  const [feedA, feedB] = await Promise.all([
    kv.get<FeedItem[]>("feed-a"),
    kv.get<FeedItem[]>("feed-b"),
  ]);

  if (!feedA || !feedB) {
    return NextResponse.json(
      { error: "No feed data, run cron first" },
      { status: 400 },
    );
  }

  const allItems = [...feedA, ...feedB];
  const cutoff = Date.now() - CUTOFF_MS;

  // Only translate items without existing translation and within 48h, cap at 50 per run
  const toTranslate = allItems
    .filter((i) => !i.titleZh && new Date(i.pubDate).getTime() >= cutoff)
    .slice(0, 100);

  if (toTranslate.length === 0) {
    return NextResponse.json({
      ok: true,
      withZh: allItems.filter((i) => i.titleZh).length,
      skipped: true,
    });
  }

  try {
    // Process in batches of 15 sequentially to avoid token limits
    const BATCH_SIZE = 15;
    const translationMap = new Map<
      string,
      { titleZh: string; summaryZh: string }
    >();

    for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
      const batch = toTranslate.slice(i, i + BATCH_SIZE);
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
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }

  const finalA = allItems.slice(0, feedA.length);
  const finalB = allItems.slice(feedA.length);
  const withZh = allItems.filter((i) => i.titleZh).length;

  await Promise.all([kv.set("feed-a", finalA), kv.set("feed-b", finalB)]);

  return NextResponse.json({
    ok: true,
    withZh,
    translated: toTranslate.length,
  });
}
