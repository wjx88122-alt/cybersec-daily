import { kv } from "@/lib/kv";
import { fetchFeedsA, fetchFeedsB } from "@/lib/fetchFeeds";
import { FeedItem } from "@/lib/feeds";
import { DailyDigest } from "@/lib/digest";
import { generateSnapshot, mergeSnapshot, DailySnapshot } from "@/lib/snapshot";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

function mergeWithExisting(
  fresh: FeedItem[],
  existing: FeedItem[],
): FeedItem[] {
  const map = new Map(existing.map((i) => [i.id, i]));
  return fresh.map((item) => {
    const prev = map.get(item.id);
    if (!prev) return item;
    return {
      ...item,
      image: prev.image || item.image,
      titleZh: prev.titleZh || item.titleZh,
      summaryZh: prev.summaryZh || item.summaryZh,
      summaryAi: prev.summaryAi || item.summaryAi,
    };
  });
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const t0 = Date.now();
  const [feedA, feedB, prevA, prevB] = await Promise.all([
    fetchFeedsA(),
    fetchFeedsB(),
    kv.get<FeedItem[]>("feed-a"),
    kv.get<FeedItem[]>("feed-b"),
  ]);
  console.log(
    `fetch: ${Date.now() - t0}ms feedA=${feedA.length} feedB=${feedB.length}`,
  );

  const mergedA = mergeWithExisting(feedA, prevA ?? []);
  const mergedB = mergeWithExisting(feedB, prevB ?? []);

  await Promise.all([kv.set("feed-a", mergedA), kv.set("feed-b", mergedB)]);

  // Generate daily snapshot (best-effort, don't block on failure)
  try {
    const [digest, snapshots] = await Promise.all([
      kv.get<DailyDigest>("digest"),
      kv.get<DailySnapshot[]>("snapshots"),
    ]);
    const snapshot = generateSnapshot([...mergedA, ...mergedB], digest);
    const updated = mergeSnapshot(snapshots ?? [], snapshot);
    await kv.set("snapshots", updated);
  } catch (e) {
    console.error("snapshot generation failed:", e);
  }

  console.log(`done: ${Date.now() - t0}ms`);

  return NextResponse.json({
    ok: true,
    feedA: mergedA.length,
    feedB: mergedB.length,
  });
}
