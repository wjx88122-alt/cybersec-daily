import Parser from "rss-parser";
import { FEED_SOURCES, FeedItem } from "./feeds";
import crypto from "crypto";

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "CybersecDaily/1.0" },
});

export async function fetchAllFeeds(): Promise<FeedItem[]> {
  const results = await Promise.allSettled(
    FEED_SOURCES.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return (feed.items || []).slice(0, 15).map((item) => ({
        id: crypto
          .createHash("md5")
          .update(item.link || item.title || "")
          .digest("hex"),
        title: item.title || "无标题",
        link: item.link || "",
        summary: stripHtml(item.contentSnippet || item.content || item.summary || ""),
        source: source.name,
        category: source.category,
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      }));
    })
  );

  const items: FeedItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
  }

  items.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return items;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
}
