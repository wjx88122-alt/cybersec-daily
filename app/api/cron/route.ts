import { kv } from "@/lib/kv";
import { fetchFeedsA, fetchFeedsB, fetchFeedsAI } from "@/lib/fetchFeeds";
import { FeedItem } from "@/lib/feeds";
import { DailyDigest } from "@/lib/digest";
import { generateSnapshot, mergeSnapshot, DailySnapshot } from "@/lib/snapshot";
import { resolveAppBaseUrl } from "@/lib/app-url";
import { mergeFeedItems, resolveFeedRefresh } from "@/lib/feed-refresh";
import {
  recordTranslationHealthFromItems,
  triggerTranslationRepairIfNeeded,
} from "@/lib/translation-health";
import { after, NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const t0 = Date.now();
  const [feedAResult, feedBResult, feedAIResult, prevA, prevB, prevAI] = await Promise.all([
    fetchFeedsA(),
    fetchFeedsB(),
    fetchFeedsAI(),
    kv.get<FeedItem[]>("feed-a"),
    kv.get<FeedItem[]>("feed-b"),
    kv.get<FeedItem[]>("feed-ai"),
  ]);
  console.log(
    `fetch: ${Date.now() - t0}ms feedA=${feedAResult.items.length} feedB=${feedBResult.items.length} feedAI=${feedAIResult.items.length}`,
  );

  const previousA = prevA ?? [];
  const previousB = prevB ?? [];
  const previousAI = prevAI ?? [];

  let refreshedA;
  let refreshedB;
  let refreshedAI;
  try {
    refreshedA = resolveFeedRefresh(feedAResult, previousA);
    refreshedB = resolveFeedRefresh(feedBResult, previousB);
    refreshedAI = resolveFeedRefresh(feedAIResult, previousAI);
  } catch (error) {
    console.error("feed refresh failed:", error);
    return NextResponse.json(
      { error: "Feed refresh failed before cache update" },
      { status: 502 },
    );
  }

  if (refreshedA.stale) console.warn("feed-a refresh failed, keeping previous cache");
  if (refreshedB.stale) console.warn("feed-b refresh failed, keeping previous cache");
  if (refreshedAI.stale) console.warn("feed-ai refresh failed, keeping previous cache");

  const mergedA = refreshedA.stale
    ? refreshedA.items
    : mergeFeedItems(refreshedA.items, previousA);
  const mergedB = refreshedB.stale
    ? refreshedB.items
    : mergeFeedItems(refreshedB.items, previousB);
  const mergedAI = refreshedAI.stale
    ? refreshedAI.items
    : mergeFeedItems(refreshedAI.items, previousAI);

  await Promise.all([
    kv.set("feed-a", mergedA),
    kv.set("feed-b", mergedB),
    kv.set("feed-ai", mergedAI),
  ]);

  await recordTranslationHealthFromItems({
    items: [...mergedA, ...mergedB, ...mergedAI],
    source: "cron:feed-refresh",
  });

  const appBaseUrl = resolveAppBaseUrl(req.nextUrl.origin);
  const authHeaders = {
    authorization: `Bearer ${process.env.CRON_SECRET}`,
  };

  after(async () => {
    const selfImagesUrl = `${appBaseUrl}/api/images`;
    try {
      const imageRes = await fetch(selfImagesUrl, {
        headers: authHeaders,
        cache: "no-store",
      });
      if (!imageRes.ok) {
        console.error("image enrichment trigger failed:", imageRes.status);
      }
    } catch (e) {
      console.error("image enrichment trigger failed:", e);
    }

    await triggerTranslationRepairIfNeeded({
      items: [...mergedA, ...mergedB, ...mergedAI],
      appBaseUrl,
      source: "cron:feed-refresh",
      reason: "cron-refresh",
      authToken: process.env.CRON_SECRET,
    });
  });

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
    feedAI: mergedAI.length,
    staleFeeds: [
      refreshedA.stale ? "feed-a" : null,
      refreshedB.stale ? "feed-b" : null,
      refreshedAI.stale ? "feed-ai" : null,
    ].filter(Boolean),
  });
}
