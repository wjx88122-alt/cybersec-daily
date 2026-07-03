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

function normalizeSummaryLine(text) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

const DIGEST_TITLE_MAX_LENGTH = 28;
const DIGEST_TITLE_MIN_BREAK_LENGTH = 8;
const JUDGMENT_LABEL_PATTERN = /^(机会判断|市场判断|产业判断|产业观察|行业判断|行业观察|专家判断|核心判断|总体判断|判断)[:：]\s*(.+)$/u;
const SECTION_LABEL_PATTERN = /^(机会信号|竞争与格局|布局建议|产业信号|市场影响|关注方向|机会与风险|产业建议|重点变化|进一步关注|行动建议|值得关注|专家建议)[:：]?\s*(.*)$/u;
const LIST_ITEM_PATTERN = /^([-*•]|\d+[.、)])\s*(.+)$/u;
const SECTION_META = {
  机会信号: {
    intent: "signal",
    icon: "chart",
    priority: "SIGNAL",
  },
  竞争与格局: {
    intent: "impact",
    icon: "network",
    priority: "MARKET",
  },
  布局建议: {
    intent: "action",
    icon: "check",
    priority: "NEXT",
  },
  产业信号: {
    intent: "signal",
    icon: "chart",
    priority: "SIGNAL",
  },
  市场影响: {
    intent: "impact",
    icon: "network",
    priority: "IMPACT",
  },
  关注方向: {
    intent: "opportunity",
    icon: "spark",
    priority: "WATCH",
  },
  机会与风险: {
    intent: "opportunity",
    icon: "spark",
    priority: "WATCH",
  },
  产业建议: {
    intent: "opportunity",
    icon: "spark",
    priority: "WATCH",
  },
  重点变化: {
    intent: "change",
    icon: "radar",
    priority: "P1",
  },
  进一步关注: {
    intent: "watch",
    icon: "target",
    priority: "P2",
  },
  值得关注: {
    intent: "watch",
    icon: "target",
    priority: "P2",
  },
  行动建议: {
    intent: "action",
    icon: "check",
    priority: "NEXT",
  },
  专家建议: {
    intent: "action",
    icon: "check",
    priority: "NEXT",
  },
};

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

function splitStructuredJudgment(judgment) {
  const title = compactDigestTitle(judgment);
  const titleStem = title.replace(/[。！？!?]+$/u, "");
  const remainder = judgment
    .replace(titleStem, "")
    .replace(/^[，,、；;：:\s]+/u, "")
    .trim();

  return {
    title,
    body: remainder ? withChinesePeriod(remainder) : "",
  };
}

function enrichSummarySection(section, index) {
  const fallback = {
    intent: "context",
    icon: "list",
    priority: `P${index + 1}`,
  };

  return {
    ...section,
    ...(SECTION_META[section.label] ?? fallback),
  };
}

function parseStructuredOverview(overview) {
  const lines = (overview ?? "")
    .split(/\r?\n/u)
    .map(normalizeSummaryLine)
    .filter(Boolean);

  if (lines.length === 0) return null;

  let judgment = "";
  let judgmentLabel = "产业判断";
  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    const judgmentMatch = line.match(JUDGMENT_LABEL_PATTERN);
    if (judgmentMatch) {
      judgmentLabel = judgmentMatch[1];
      judgment = judgmentMatch[2].trim();
      currentSection = null;
      continue;
    }

    const sectionMatch = line.match(SECTION_LABEL_PATTERN);
    if (sectionMatch) {
      currentSection = {
        label: sectionMatch[1],
        items: [],
      };
      sections.push(currentSection);
      const inlineItem = sectionMatch[2]?.trim();
      if (inlineItem) currentSection.items.push(inlineItem);
      continue;
    }

    const itemMatch = line.match(LIST_ITEM_PATTERN);
    if (itemMatch && currentSection) {
      currentSection.items.push(itemMatch[2].trim());
    }
  }

  const filledSections = sections.filter((section) => section.items.length > 0);
  if (!judgment || filledSections.length === 0) return null;

  return {
    ...splitStructuredJudgment(judgment),
    judgmentLabel,
    sections: filledSections.map(enrichSummarySection),
  };
}

function splitOverview(overview) {
  const structured = parseStructuredOverview(overview);
  if (structured) return structured;

  const normalized = normalizeSummaryText(overview);
  if (!normalized) return null;

  const match = normalized.match(/^(.+?[。！？!?])\s*(.*)$/u);
  if (!match) {
    const title = compactDigestTitle(normalized);
    return {
      title,
      body: title === normalized ? "" : normalized,
      judgmentLabel: "今日概览",
      sections: [],
    };
  }

  const firstSentence = match[1].trim();
  const remaining = match[2].trim();
  const title = compactDigestTitle(firstSentence);

  return {
    title,
    body: title === firstSentence ? remaining : [firstSentence, remaining].filter(Boolean).join(" "),
    judgmentLabel: "今日概览",
    sections: [],
  };
}

function buildFallbackHeroSummary(filtered, scopeLabel) {
  if (filtered.length === 0) {
    return {
      title: "当前没有可展示的安全资讯。",
      body: "当前筛选范围下暂无匹配内容。可以清空搜索词，或切回全部分类查看最近可用的安全资讯。",
      judgmentLabel: "当前概览",
      sections: [],
      sourceLabel: "基于当前列表生成",
    };
  }

  const categories = [...new Set(filtered.map((item) => item.category).filter(Boolean))].slice(0, 3);
  const categoryText = categories.length > 0 ? categories.join("、") : "当前筛选范围";
  const focusTitle = getLocalizedFeedTitle(filtered[0]);

  return {
    title: `当前先看 ${filtered.length} 条${scopeLabel}安全资讯。`,
    body: `当前列表集中在${categoryText}。最新焦点是“${focusTitle}”。建议先看焦点卡片，再用分类和搜索补充细节。`,
    judgmentLabel: "当前概览",
    sections: [],
    sourceLabel: "基于当前列表生成",
  };
}

function buildHeroSummary(filtered, scopeLabel, digestOverview) {
  const digestSummary = splitOverview(digestOverview);
  if (digestSummary) {
    return {
      ...digestSummary,
      sourceLabel: "LLM 市场机会雷达生成",
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
