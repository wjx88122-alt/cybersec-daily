import { kv } from "@vercel/kv";
import { fetchFeedsA, fetchFeedsB } from "@/lib/fetchFeeds";
import { generateDigest } from "@/lib/digest";
import { extractOgImage } from "@/lib/extractImage";
import { translateItems } from "@/lib/translate";
import { FeedItem } from "@/lib/feeds";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

async function enrichWithImages(items: FeedItem[]): Promise<FeedItem[]> {
  const batchSize = 10;
  const result = [...items];
  for (let i = 0; i < result.length; i += batchSize) {
    const batch = result.slice(i, i + batchSize);
    const images = await Promise.all(batch.map((item) => extractOgImage(item.link)));
    images.forEach((img, j) => {
      if (img) result[i + j] = { ...result[i + j], image: img };
    });
  }
  return result;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [feedA, feedB] = await Promise.all([fetchFeedsA(), fetchFeedsB()]);

  const [enrichedA, enrichedB] = await Promise.all([
    enrichWithImages(feedA),
    enrichWithImages(feedB),
  ]);

  const allItems = [...enrichedA, ...enrichedB];
  const translations = await translateItems(allItems);
  translations.forEach((t, i) => {
    if (t.titleZh) allItems[i] = { ...allItems[i], titleZh: t.titleZh, summaryZh: t.summaryZh };
  });

  const finalA = allItems.slice(0, enrichedA.length);
  const finalB = allItems.slice(enrichedA.length);
  const digest = await generateDigest(finalA);
  const imagesFound = allItems.filter((item) => item.image).length;

  await Promise.all([
    kv.set("feed-a", finalA),
    kv.set("feed-b", finalB),
    kv.set("digest", digest),
  ]);

  return NextResponse.json({ ok: true, feedA: finalA.length, feedB: finalB.length, imagesFound });
}
