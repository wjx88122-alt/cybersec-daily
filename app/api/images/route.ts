import { kv } from "@vercel/kv";
import { extractOgImage } from "@/lib/extractImage";
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
    return NextResponse.json({ error: "No feed data, run cron first" }, { status: 400 });
  }

  const allItems = [...feedA, ...feedB];

  // Extract images for all items concurrently (4s timeout each)
  const images = await Promise.all(allItems.map((item) => extractOgImage(item.link)));
  images.forEach((img, i) => {
    if (img) allItems[i] = { ...allItems[i], image: img };
  });

  const finalA = allItems.slice(0, feedA.length);
  const finalB = allItems.slice(feedA.length);
  const imagesFound = allItems.filter((i) => i.image).length;

  await Promise.all([
    kv.set("feed-a", finalA),
    kv.set("feed-b", finalB),
  ]);

  return NextResponse.json({ ok: true, imagesFound });
}
