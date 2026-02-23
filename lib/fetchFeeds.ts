import Parser from "rss-parser";
import { FEED_SOURCES_A, FEED_SOURCES_B, FeedItem } from "./feeds";
import crypto from "crypto";

const parser = new Parser({
  timeout: 5000,
  headers: { "User-Agent": "CybersecDaily/1.0" },
});

type Source = { name: string; url: string; category: string };

async function fetchSources(sources: Source[]): Promise<FeedItem[]> {
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return (feed.items || []).slice(0, 10).map((item) => ({
        id: crypto
          .createHash("sha256")
          .update(item.link || item.title || "")
          .digest("hex"),
        title: item.title || "无标题",
        link: item.link || "",
        summary: stripHtml(
          item.contentSnippet || item.content || item.summary || "",
        ),
        source: source.name,
        category: source.category,
        pubDate: (() => {
          const d = item.pubDate || item.isoDate;
          return d && !isNaN(new Date(d).getTime())
            ? new Date(d).toISOString()
            : new Date().toISOString();
        })(),
      }));
    }),
  );

  const items: FeedItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") items.push(...result.value);
  }
  return items;
}

export async function fetchFeedsA(): Promise<FeedItem[]> {
  const items = await fetchSources(FEED_SOURCES_A);
  return items.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );
}

export async function fetchFeedsB(): Promise<FeedItem[]> {
  const items = await fetchSources(FEED_SOURCES_B);
  return items.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );
}

export async function fetchAllFeeds(): Promise<FeedItem[]> {
  const [a, b] = await Promise.all([fetchFeedsA(), fetchFeedsB()]);
  return [...a, ...b].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}
