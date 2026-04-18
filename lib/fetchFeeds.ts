import Parser from "rss-parser";
import { FEED_SOURCES_A, FEED_SOURCES_B, FEED_SOURCES_AI, FeedItem } from "./feeds";
import crypto from "crypto";
import { FeedFetchResult, normalizeFeedPubDate } from "./feed-refresh";
import { pickFeedImage } from "./feed-image";

const parser = new Parser({
  timeout: 5000,
  headers: { "User-Agent": "CybersecDaily/1.0" },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["content:encoded", "contentEncoded"],
      ["enclosure", "enclosure", { keepArray: true }],
    ],
  },
});

type Source = { name: string; url: string; category: string };

async function fetchSources(sources: Source[]): Promise<FeedFetchResult<FeedItem>> {
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return (feed.items || []).slice(0, 20).map((item) => ({
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
        pubDate: normalizeFeedPubDate(item.pubDate || item.isoDate),
        image: pickFeedImage({
          link: item.link,
          content: item.content,
          summary: item.summary,
          contentEncoded: (item as unknown as { contentEncoded?: string }).contentEncoded,
          mediaContent: (item as unknown as { mediaContent?: unknown }).mediaContent,
          mediaThumbnail: (item as unknown as { mediaThumbnail?: unknown }).mediaThumbnail,
          enclosure: (item as unknown as { enclosure?: unknown }).enclosure,
        }),
      }));
    }),
  );

  const items: FeedItem[] = [];
  let succeededSources = 0;
  let failedSources = 0;
  for (const result of results) {
    if (result.status === "fulfilled") {
      succeededSources++;
      items.push(...result.value);
    } else {
      failedSources++;
    }
  }
  return { items, succeededSources, failedSources };
}

function sortFeedItems(items: FeedItem[]): FeedItem[] {
  return items.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );
}

export async function fetchFeedsA(): Promise<FeedFetchResult<FeedItem>> {
  const result = await fetchSources(FEED_SOURCES_A);
  return { ...result, items: sortFeedItems(result.items) };
}

export async function fetchFeedsB(): Promise<FeedFetchResult<FeedItem>> {
  const result = await fetchSources(FEED_SOURCES_B);
  return { ...result, items: sortFeedItems(result.items) };
}

export async function fetchAllFeeds(): Promise<FeedItem[]> {
  const [a, b] = await Promise.all([fetchFeedsA(), fetchFeedsB()]);
  return [...a.items, ...b.items].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );
}

export async function fetchFeedsAI(): Promise<FeedFetchResult<FeedItem>> {
  const result = await fetchSources(FEED_SOURCES_AI);
  return { ...result, items: sortFeedItems(result.items) };
}

function normalizeLinkKey(link: string) {
  const trimmed = link.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

export async function fetchFeedImageMapForSources(
  sourceNames: string[],
): Promise<Map<string, string>> {
  const requested = new Set(sourceNames.map((name) => name.trim()).filter(Boolean));
  if (requested.size === 0) return new Map();

  const sources = [...FEED_SOURCES_A, ...FEED_SOURCES_B, ...FEED_SOURCES_AI].filter(
    (source) => requested.has(source.name),
  );
  if (sources.length === 0) return new Map();

  const map = new Map<string, string>();
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      (feed.items || []).slice(0, 30).forEach((item) => {
        const link = normalizeLinkKey(item.link || "");
        if (!link) return;
        if (map.has(link)) return;

        const image = pickFeedImage({
          link: item.link,
          content: item.content,
          summary: item.summary,
          contentEncoded: (item as unknown as { contentEncoded?: string }).contentEncoded,
          mediaContent: (item as unknown as { mediaContent?: unknown }).mediaContent,
          mediaThumbnail: (item as unknown as { mediaThumbnail?: unknown }).mediaThumbnail,
          enclosure: (item as unknown as { enclosure?: unknown }).enclosure,
        });
        if (image) {
          map.set(link, image);
        }
      });
    }),
  );

  if (results.every((result) => result.status === "rejected")) {
    return new Map();
  }

  return map;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}
