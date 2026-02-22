import { kv } from "@vercel/kv";
import { fetchFeedsA, fetchFeedsB } from "@/lib/fetchFeeds";
import { generateDigest } from "@/lib/digest";
import { translateItems } from "@/lib/translate";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [feedA, feedB] = await Promise.all([fetchFeedsA(), fetchFeedsB()]);

  const allItems = [...feedA, ...feedB];
  const [translations, digest] = await Promise.all([
    translateItems(allItems),
    generateDigest(feedA),
  ]);
  translations.forEach((t, i) => {
    if (t.titleZh) allItems[i] = { ...allItems[i], titleZh: t.titleZh, summaryZh: t.summaryZh };
  });

  const finalA = allItems.slice(0, feedA.length);
  const finalB = allItems.slice(feedA.length);

  await Promise.all([
    kv.set("feed-a", finalA),
    kv.set("feed-b", finalB),
    kv.set("digest", digest),
  ]);

  return NextResponse.json({ ok: true, feedA: finalA.length, feedB: finalB.length });
}
