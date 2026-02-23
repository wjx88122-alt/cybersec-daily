import { kv } from "@/lib/kv";
import { extractOgImage } from "@/lib/extractImage";
import { FeedItem, CUTOFF_MS } from "@/lib/feeds";
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
  const cutoff = Date.now() - CUTOFF_MS;

  // Only extract images for recent items (48h) that don't already have one
  const toProcess = allItems
    .map((item, idx) => ({ item, idx }))
    .filter(
      ({ item }) => !item.image && new Date(item.pubDate).getTime() >= cutoff,
    );

  const images = await Promise.all(
    toProcess.map(({ item }) => extractOgImage(item.link)),
  );
  const updatedItems = allItems.map((item, idx) => {
    const pos = toProcess.findIndex((p) => p.idx === idx);
    return pos !== -1 && images[pos] ? { ...item, image: images[pos] } : item;
  });

  const finalA = updatedItems.slice(0, feedA.length);
  const finalB = updatedItems.slice(feedA.length);
  const imagesFound = updatedItems.filter((i) => i.image).length;

  await Promise.all([kv.set("feed-a", finalA), kv.set("feed-b", finalB)]);

  return NextResponse.json({ ok: true, imagesFound });
}
