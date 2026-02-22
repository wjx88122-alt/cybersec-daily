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

  const [feedA, feedB] = await Promise.all([fetchFeedsA(), fetchFeedsB()]);
  const digest = await generateDigest(feedA);

  await Promise.all([
    kv.set("feed-a", feedA),
    kv.set("feed-b", feedB),
    kv.set("digest", digest),
  ]);

  return NextResponse.json({ ok: true, feedA: feedA.length, feedB: feedB.length });
}
