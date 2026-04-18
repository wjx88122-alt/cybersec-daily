import { kv } from "@/lib/kv";
import { FeedItem, CUTOFF_MS } from "@/lib/feeds";
import { extractArticleText } from "@/lib/extractArticle";
import { resolveInternalAppBaseUrl } from "@/lib/app-url";
import { summarizeItems } from "@/lib/summarize";
import { after, NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appBaseUrl = resolveInternalAppBaseUrl(req.nextUrl.origin);
  const triggerDigestRebuild = () => {
    const digestUrl = `${appBaseUrl}/api/digest`;
    after(() => {
      void fetch(digestUrl, {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
        cache: "no-store",
      }).catch((e) => console.error("summarize: trigger digest failed:", e));
    });
  };

  const [feedA, feedB, feedAI] = await Promise.all([
    kv.get<FeedItem[]>("feed-a"),
    kv.get<FeedItem[]>("feed-b"),
    kv.get<FeedItem[]>("feed-ai"),
  ]);

  if (!feedA || !feedB) {
    return NextResponse.json(
      { error: "No feed data, run cron first" },
      { status: 400 },
    );
  }

  const allItems = [...feedA, ...feedB];
  const aiItems = feedAI ?? [];
  const cutoff = Date.now() - CUTOFF_MS;

  // Only process recent items without an AI summary
  const toProcess = allItems
    .map((item, idx) => ({ item, idx }))
    .filter(
      ({ item }) =>
        !item.summaryAi && new Date(item.pubDate).getTime() >= cutoff,
    )
    .slice(0, 50);

  const toProcessAI = aiItems
    .map((item, idx) => ({ item, idx }))
    .filter(
      ({ item }) =>
        !item.summaryAi && new Date(item.pubDate).getTime() >= cutoff,
    )
    .slice(0, 50);

  if (toProcess.length === 0 && toProcessAI.length === 0) {
    triggerDigestRebuild();
    return NextResponse.json({
      ok: true,
      summarized: 0,
      skipped: true,
    });
  }

  const allToProcess = [...toProcess, ...toProcessAI.map(({ item, idx }) => ({ item, idx: idx + allItems.length }))];
  const combinedItems = [...allItems, ...aiItems];

  // Fetch article text in parallel (best-effort)
  const articleTexts = await Promise.all(
    allToProcess.map(({ item }) => extractArticleText(item.link)),
  );

  // Process in batches of 5
  const BATCH_SIZE = 5;
  let summarized = 0;

  for (let i = 0; i < allToProcess.length; i += BATCH_SIZE) {
    const batchEntries = allToProcess.slice(i, i + BATCH_SIZE);
    const batchTexts = articleTexts.slice(i, i + BATCH_SIZE);

    const batch = batchEntries.map(({ item }, j) => ({
      item,
      articleText: batchTexts[j],
    }));

    const results = await summarizeItems(batch);

    batchEntries.forEach(({ idx }, j) => {
      const ai = results[j]?.summaryAi;
      if (ai) {
        combinedItems[idx] = { ...combinedItems[idx], summaryAi: ai };
        summarized++;
      }
    });
  }

  const finalA = combinedItems.slice(0, feedA.length);
  const finalB = combinedItems.slice(feedA.length, feedA.length + feedB.length);
  const finalAI = combinedItems.slice(feedA.length + feedB.length);

  await Promise.all([
    kv.set("feed-a", finalA),
    kv.set("feed-b", finalB),
    kv.set("feed-ai", finalAI),
  ]);

  triggerDigestRebuild();

  return NextResponse.json({ ok: true, summarized, total: allToProcess.length });
}
