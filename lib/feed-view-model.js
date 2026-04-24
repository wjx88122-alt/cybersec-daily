import { matchesFeedSearch } from "./feed-search.ts";
import { CUTOFF_MS } from "./feeds.ts";

/**
 * @typedef {import("./feeds.ts").FeedItem} FeedItem
 */

/**
 * @param {FeedItem} item
 * @param {string} category
 */
function matchesCategory(item, category) {
  return category === "全部" || item.category === category;
}

/**
 * @param {FeedItem} item
 * @param {number} cutoff
 */
function hasFreshTimestamp(item, cutoff) {
  const timestamp = new Date(item.pubDate).getTime();
  return !Number.isNaN(timestamp) && timestamp >= cutoff;
}

/**
 * @param {FeedItem[]} items
 * @param {{ category: string; search: string; now?: number; cutoffMs?: number }} options
 */
export function buildFeedLandingState(
  items,
  { category, search, now = Date.now(), cutoffMs = CUTOFF_MS },
) {
  const cutoff = now - cutoffMs;
  const matchingItems = items.filter(
    (item) => matchesCategory(item, category) && matchesFeedSearch(item, search),
  );
  const freshItems = matchingItems.filter((item) => hasFreshTimestamp(item, cutoff));
  const filtered = freshItems.length > 0 ? freshItems : matchingItems;
  const isFallback = freshItems.length === 0 && matchingItems.length > 0;

  return {
    filtered,
    isFallback,
    scopeLabel: isFallback ? "最近可用" : "过去 24 小时",
    freshCount: freshItems.length,
    matchingCount: matchingItems.length,
  };
}
