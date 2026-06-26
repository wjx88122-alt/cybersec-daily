import Parser from "rss-parser";
import {
  FEED_SOURCES_A,
  FEED_SOURCES_B,
  FEED_SOURCES_AI,
  FEED_SOURCES_KOL,
  type FeedSource,
  FeedItem,
} from "./feeds";
import crypto from "crypto";
import { FeedFetchResult, normalizeFeedPubDate } from "./feed-refresh";
import { pickFeedImage } from "./feed-image";
import {
  buildXPostUrl,
  fetchXUserPosts,
  isXApiReady,
  summarizeXPostText,
} from "./x-api";

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

/** 解析一个 FeedSource 的实际 URL（静态 url 或动态 urlBuilder）。空串=不可用。 */
function resolveSourceUrl(source: FeedSource): string {
  if (source.urlBuilder) return source.urlBuilder();
  return source.url ?? "";
}

async function fetchXSource(source: FeedSource): Promise<FeedItem[]> {
  if (!source.xHandle) return [];
  const posts = await fetchXUserPosts(source.xHandle);
  return posts.map((post) => ({
    id: crypto
      .createHash("sha256")
      .update(`x:${source.xHandle}:${post.id}`)
      .digest("hex"),
    title: summarizeXPostText(post.text),
    link: buildXPostUrl(source.xHandle as string, post.id),
    summary: summarizeXPostText(post.text, 200),
    source: source.name,
    category: source.category,
    pubDate: normalizeFeedPubDate(post.createdAt),
  }));
}

async function fetchSources(sources: FeedSource[]): Promise<FeedFetchResult<FeedItem>> {
  // 过滤掉 URL 为空的源（如 RSSHUB_BASE 未配置时的 X/公众号源）
  const resolved = sources
    .map((source) => {
      if (source.xHandle && isXApiReady()) {
        return { source, mode: "x-api" as const, url: "" };
      }
      return { source, mode: "rss" as const, url: resolveSourceUrl(source) };
    })
    .filter((entry) => entry.mode === "x-api" || entry.url.length > 0);

  const results = await Promise.allSettled(
    resolved.map(async ({ source, mode, url }) => {
      if (mode === "x-api") return fetchXSource(source);

      const feed = await parser.parseURL(url);
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
  // A 组安全媒体 + KOL（X/公众号，经 RSSHub 桥接；未配置时自动跳过）
  const result = await fetchSources([...FEED_SOURCES_A, ...FEED_SOURCES_KOL]);
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

  const allSources = [
    ...FEED_SOURCES_A,
    ...FEED_SOURCES_KOL,
    ...FEED_SOURCES_B,
    ...FEED_SOURCES_AI,
  ].filter((source) => requested.has(source.name));
  if (allSources.length === 0) return new Map();

  // 仅处理 URL 实际可用的源
  const resolved = allSources
    .map((source) => ({ source, url: resolveSourceUrl(source) }))
    .filter((entry) => entry.url.length > 0);

  const map = new Map<string, string>();
  const results = await Promise.allSettled(
    resolved.map(async ({ url }) => {
      const feed = await parser.parseURL(url);
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
