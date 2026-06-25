/**
 * Security Hot 共享数据层 —— 页面 / RSS / API 的单一数据源。
 *
 * 所有消费方 (hot 页面、feed.xml、api/hot/items) 都走这里，
 * 避免聚合逻辑重复实现、保证排序契约一致。
 */
import { readSecurityFeedItems } from "./feed-store.ts";
import { rankHotItems } from "./hot-rank.ts";
import type { HotItem } from "./hot-rank.ts";
import { pickDisplayTitle, pickLocalizedField } from "./translation-detection.ts";

/** 热榜时间窗选项。 */
export type HotWindow = "24h" | "7d";

export const HOT_WINDOW_HOURS: Record<HotWindow, number> = {
  "24h": 24,
  "7d": 24 * 7,
};

/** 默认精选窗口 (页面首屏 + 精选 RSS 用)。 */
export const HOT_DEFAULT_WINDOW: HotWindow = "24h";

/** 精选 RSS / 首屏最多条目数。 */
export const HOT_SELECTED_LIMIT = 30;
/** 全量 RSS / /all 时间线最大条目数。 */
export const HOT_ALL_LIMIT = 80;
/** API 单次翻页上限。 */
export const HOT_API_PAGE_SIZE = 50;

/**
 * 取热榜 (聚合+排序后) 的 HotItem 列表。
 * @param window 时间窗，默认 24h
 * @param limit 最大条目数 (默认不截断)
 */
export async function loadHotItems(
  window: HotWindow = HOT_DEFAULT_WINDOW,
  limit?: number,
): Promise<HotItem[]> {
  const items = await readSecurityFeedItems();
  const ranked = rankHotItems(items, HOT_WINDOW_HOURS[window]);
  return typeof limit === "number" ? ranked.slice(0, limit) : ranked;
}

/**
 * 取全量时间线 (按时间倒序、不聚合、不截断到窗口)。
 * 供 /all 页和全量 RSS 使用。
 */
export async function loadAllTimeline(
  limit: number = HOT_ALL_LIMIT,
): Promise<HotItem[]> {
  // 用 7d 窗口拉满，但每个 item 仍是 HotItem 形态 (rank/coverage 等字段存在)
  return loadHotItems("7d", limit);
}

/** 取一个 HotItem 的展示标题 (中文化优先)。 */
export function hotItemTitle(item: HotItem): string {
  return (
    pickDisplayTitle({
      source: item.title,
      candidate: item.titleZh,
      existing: item.title,
      summarySource: item.summary,
      summaryCandidate: item.summaryZh,
      summaryExisting: item.summaryAi,
    }) || item.title
  );
}

/** 取一个 HotItem 的展示摘要 (中文化优先)。 */
export function hotItemSummary(item: HotItem): string {
  return (
    pickLocalizedField({
      source: item.summary,
      candidate: item.summaryZh,
      existing: item.summaryAi,
    }) ||
    item.summaryAi ||
    item.summary
  );
}

/** HotItem 序列化为 RSS <item> XML 片段。 */
export function hotItemToRssXml(item: HotItem): string {
  const title = escapeXml(hotItemTitle(item));
  const link = escapeXml(item.link);
  const description = escapeXml(hotItemSummary(item).slice(0, 300));
  const sourceLine =
    item.coverageCount > 1
      ? `（${item.coverageCount} 个信源报道）`
      : "";
  const guid = escapeXml(item.id);
  const pubDate = new Date(item.pubDate).toUTCString();
  return [
    "    <item>",
    `      <title><![CDATA[${title}${sourceLine ? " " + sourceLine : ""}]]></title>`,
    `      <link>${link}</link>`,
    `      <description><![CDATA[${description}]]></description>`,
    `      <category>${escapeXml(item.category)}</category>`,
    `      <pubDate>${pubDate}</pubDate>`,
    `      <guid isPermaLink="false">${guid}</guid>`,
    `      <author>${escapeXml(item.source)} (Security Hot)</author>`,
    "    </item>",
  ].join("\n");
}

/** HotItem 序列化为 JSON API 对象 (与 AI HOT /api/public/items 对齐)。 */
export function hotItemToJson(item: HotItem) {
  return {
    id: item.id,
    rank: item.rank,
    score: item.score,
    coverageCount: item.coverageCount,
    title: hotItemTitle(item),
    title_en: item.titleZh ? item.title : null,
    summary: hotItemSummary(item),
    url: item.link,
    permalink: `https://cybersec-daily.vercel.app/hot#${item.id}`,
    source: item.source,
    sources: item.sources,
    relatedLinks: item.relatedLinks,
    category: item.category,
    publishedAt: item.pubDate,
    selected: item.rank <= HOT_SELECTED_LIMIT,
  };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * cursor 翻页编码: 把 (rank 末尾, id) 编成不透明 base64。
 * 与 AI HOT 的契约一致: cursor 失效/篡改 → 静默回首屏。
 */
export function encodeCursor(rank: number, id: string): string {
  return Buffer.from(JSON.stringify({ r: rank, i: id }), "utf8").toString(
    "base64url",
  );
}

export function decodeCursor(cursor: string): { r: number; i: string } | null {
  try {
    const json = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as { r?: unknown; i?: unknown };
    if (
      typeof json.r === "number" &&
      typeof json.i === "string" &&
      Number.isFinite(json.r)
    ) {
      return { r: json.r, i: json.i };
    }
    return null;
  } catch {
    return null;
  }
}
