import { getLocalizedFeedTitle, matchesFeedSearch } from "./feed-search.ts";
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

function normalizeSummaryText(text) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

const DIGEST_TITLE_MAX_LENGTH = 28;
const DIGEST_TITLE_MIN_BREAK_LENGTH = 8;

function withChinesePeriod(text) {
  return /[。！？!?]$/u.test(text) ? text : `${text}。`;
}

function compactDigestTitle(sentence) {
  const normalized = normalizeSummaryText(sentence);
  if (normalized.length <= DIGEST_TITLE_MAX_LENGTH) {
    return normalized;
  }

  const withoutEnding = normalized.replace(/[。！？!?]+$/u, "");
  const breakIndex = withoutEnding.search(/[，,、；;：:]/u);

  if (
    breakIndex >= DIGEST_TITLE_MIN_BREAK_LENGTH &&
    breakIndex <= DIGEST_TITLE_MAX_LENGTH
  ) {
    return withChinesePeriod(withoutEnding.slice(0, breakIndex).trim());
  }

  const clipped = withoutEnding
    .slice(0, DIGEST_TITLE_MAX_LENGTH)
    .replace(/[，,、；;：:\s]+$/u, "")
    .trim();

  return withChinesePeriod(clipped);
}

function splitOverview(overview) {
  const normalized = normalizeSummaryText(overview);
  if (!normalized) return null;

  const match = normalized.match(/^(.+?[。！？!?])\s*(.*)$/u);
  if (!match) {
    const title = compactDigestTitle(normalized);
    return {
      title,
      body: title === normalized ? "" : normalized,
    };
  }

  const firstSentence = match[1].trim();
  const remaining = match[2].trim();
  const title = compactDigestTitle(firstSentence);

  return {
    title,
    body: title === firstSentence ? remaining : [firstSentence, remaining].filter(Boolean).join(" "),
  };
}

function buildFallbackHeroSummary(filtered, scopeLabel) {
  if (filtered.length === 0) {
    return {
      title: "当前没有可展示的安全资讯。",
      body: "当前筛选范围下暂无匹配内容。可以清空搜索词，或切回全部分类查看最近可用的安全资讯。",
      sourceLabel: "基于当前列表生成",
    };
  }

  const categories = [...new Set(filtered.map((item) => item.category).filter(Boolean))].slice(0, 3);
  const categoryText = categories.length > 0 ? categories.join("、") : "当前筛选范围";
  const focusTitle = getLocalizedFeedTitle(filtered[0]);

  return {
    title: `当前先看 ${filtered.length} 条${scopeLabel}安全资讯。`,
    body: `当前列表集中在${categoryText}。最新焦点是“${focusTitle}”。建议先看焦点卡片，再用分类和搜索补充细节。`,
    sourceLabel: "基于当前列表生成",
  };
}

function buildHeroSummary(filtered, scopeLabel, digestOverview) {
  const digestSummary = splitOverview(digestOverview);
  if (digestSummary) {
    return {
      ...digestSummary,
      sourceLabel: "LLM 基于当前日报生成",
    };
  }

  return buildFallbackHeroSummary(filtered, scopeLabel);
}

/**
 * @param {FeedItem[]} items
 * @param {{ category: string; search: string; now?: number; cutoffMs?: number; digestOverview?: string }} options
 */
export function buildFeedLandingState(
  items,
  { category, search, now = Date.now(), cutoffMs = CUTOFF_MS, digestOverview = "" },
) {
  const cutoff = now - cutoffMs;
  const matchingItems = items.filter(
    (item) => matchesCategory(item, category) && matchesFeedSearch(item, search),
  );
  const freshItems = matchingItems.filter((item) => hasFreshTimestamp(item, cutoff));
  const filtered = freshItems.length > 0 ? freshItems : matchingItems;
  const isFallback = freshItems.length === 0 && matchingItems.length > 0;
  const scopeLabel = isFallback ? "最近可用" : "过去 24 小时";

  return {
    filtered,
    isFallback,
    scopeLabel,
    freshCount: freshItems.length,
    matchingCount: matchingItems.length,
    heroSummary: buildHeroSummary(filtered, scopeLabel, digestOverview),
  };
}
