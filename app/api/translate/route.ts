import { kv } from "@vercel/kv";
import { translateItems } from "@/lib/translate";
import { FeedItem } from "@/lib/feeds";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

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
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;

  // Only translate items without existing translation and within 48h
  const toTranslate = allItems.filter(
    (i) => !i.titleZh && new Date(i.pubDate).getTime() >= cutoff,
  );

  if (toTranslate.length === 0) {
    return NextResponse.json({
      ok: true,
      withZh: allItems.filter((i) => i.titleZh).length,
      skipped: true,
    });
  }

  try {
    const translations = await translateItems(toTranslate);
    const translationMap = new Map(
      toTranslate.map((item, i) => [item.id, translations[i]]),
    );
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
