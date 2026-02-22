import { kv } from "@vercel/kv";
import { fetchFeedsA, fetchFeedsB } from "@/lib/fetchFeeds";
import { generateDigest } from "@/lib/digest";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const t0 = Date.now();
  const [feedA, feedB] = await Promise.all([fetchFeedsA(), fetchFeedsB()]);
  console.log(`fetch: ${Date.now() - t0}ms feedA=${feedA.length} feedB=${feedB.length}`);

  const digest = await generateDigest(feedA);
  console.log(`digest: ${Date.now() - t0}ms`);

  await Promise.all([
    kv.set("feed-a", feedA),
    kv.set("feed-b", feedB),
    kv.set("digest", digest),
  ]);
  console.log(`done: ${Date.now() - t0}ms`);

  return NextResponse.json({ ok: true, feedA: feedA.length, feedB: feedB.length });
}
