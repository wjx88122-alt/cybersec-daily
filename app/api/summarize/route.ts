import { kv } from "@/lib/kv";
import { FeedItem, CUTOFF_MS } from "@/lib/feeds";
import { extractArticleText } from "@/lib/extractArticle";
import { summarizeItems } from "@/lib/summarize";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

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

  // Only process recent items without an AI summary, cap at 50 per run
  const toProcess = allItems
    .map((item, idx) => ({ item, idx }))
    .filter(
      ({ item }) =>
        !item.summaryAi && new Date(item.pubDate).getTime() >= cutoff,
    )
    .slice(0, 50);

  if (toProcess.length === 0) {
    return NextResponse.json({
      ok: true,
      summarized: 0,
      skipped: true,
    });
  }

  // Fetch article text in parallel (best-effort)
  const articleTexts = await Promise.all(
    toProcess.map(({ item }) => extractArticleText(item.link)),
  );

  // Process in batches of 10
  const BATCH_SIZE = 5;
  let summarized = 0;

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batchEntries = toProcess.slice(i, i + BATCH_SIZE);
    const batchTexts = articleTexts.slice(i, i + BATCH_SIZE);

    const batch = batchEntries.map(({ item }, j) => ({
      item,
      articleText: batchTexts[j],
    }));

    const results = await summarizeItems(batch);

    batchEntries.forEach(({ idx }, j) => {
      const ai = results[j]?.summaryAi;
      if (ai) {
        allItems[idx] = { ...allItems[idx], summaryAi: ai };
        summarized++;
      }
    });
  }

  const finalA = allItems.slice(0, feedA.length);
  const finalB = allItems.slice(feedA.length);

  await Promise.all([kv.set("feed-a", finalA), kv.set("feed-b", finalB)]);

  return NextResponse.json({ ok: true, summarized, total: toProcess.length });
}
