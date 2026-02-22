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

  const t0 = Date.now();
  const [feedA, feedB] = await Promise.all([fetchFeedsA(), fetchFeedsB()]);
  const t1 = Date.now();
  console.log(`fetch: ${t1 - t0}ms feedA=${feedA.length} feedB=${feedB.length}`);

  const allItems = [...feedA, ...feedB];
  const [translations, digest] = await Promise.all([
    translateItems(allItems),
    generateDigest(feedA),
  ]);
  const t2 = Date.now();
  console.log(`translate+digest: ${t2 - t1}ms`);

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
  const t3 = Date.now();
  console.log(`kv write: ${t3 - t2}ms total: ${t3 - t0}ms`);

  const withZh = allItems.filter((i) => i.titleZh).length;
  return NextResponse.json({ ok: true, feedA: finalA.length, feedB: finalB.length, withZh });
}
