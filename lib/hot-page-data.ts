/**
 * Security Hot 共享数据层 —— 页面 / RSS / API 的单一数据源。
 *
 * 所有消费方 (hot 页面、feed.xml、api/hot/items) 都走这里，
 * 避免聚合逻辑重复实现、保证排序契约一致。
 */
import { readSecurityFeedItems, readSnapshotsFromStore } from "./feed-store.ts";
import { rankHotItems } from "./hot-rank.ts";
import type { HotItem } from "./hot-rank.ts";
import { pickDisplayTitle, pickLocalizedField } from "./translation-detection.ts";
import { getShanghaiDateStamp } from "./date-stamp.ts";

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

/** 日报数据：历史 snapshot 列表 + 指定日期的日报正文。 */
export type DailyPageData = {
  /** 全部历史日期（YYYY-MM-DD，倒序），供侧边栏导航。 */
  history: Array<{ date: string; headline: string }>;
  /** 当前展示日期。 */
  date: string;
  /** 日报正文（当日热榜精选 + 综述）。无数据时为 null。 */
  overview: string | null;
  /** 当日重点条目（取当日窗口热榜前 N）。 */
  items: HotItem[];
};

/** mock 日报头条（本地无 KV 时用）。 */
import { MOCK_DAILY_HEADLINES } from "./hot-mock.ts";

/**
 * 取日报数据。
 * @param date 指定日期 YYYY-MM-DD；省略则取最新一期。
 */
export async function loadDailyDigest(date?: string): Promise<DailyPageData> {
  const snapshots = await readSnapshotsFromStore();
  const sorted = [...snapshots].sort((a, b) => b.date.localeCompare(a.date));

  const target =
    (date && sorted.find((s) => s.date === date)?.date) ||
    sorted[0]?.date ||
    getShanghaiDateStamp();

  const history = sorted.map((s) => ({
    date: s.date,
    headline:
      MOCK_DAILY_HEADLINES[s.date] ??
      `${s.date} 共 ${s.totalCount} 条安全动态`,
  }));

  // 当日重点条目：用 7d 窗口热榜筛出当日的
  const ranked = await loadHotItems("7d");
  const dayItems = ranked.filter(
    (it) => getShanghaiDateStamp(it.pubDate) === target,
  );

  return {
    history,
    date: target,
    overview:
      MOCK_DAILY_HEADLINES[target] ??
      (dayItems.length > 0
        ? `${target} 共收录 ${dayItems.length} 条安全动态，下文按热度精选呈现。`
        : `${target} 暂无安全日报数据。`),
    items: dayItems.slice(0, 12),
  };
}

/** 条目详情：主条目 + 同事件（聚合簇）的其他信源成员。 */
export type ItemDetail = {
  item: HotItem;
  /** 同事件的其他条目（不含主条目本身），按时间倒序。 */
  siblings: HotItem[];
  score: number;
  coverageCount: number;
};

/**
 * 取一个条目的详情：在足够大的时间窗内重算聚合簇，
 * 找到 id 对应的主条目及其同事件兄弟条目。
 * id 不存在 → 返回 null（由调用方 notFound）。
 */
export async function getItemDetail(id: string): Promise<ItemDetail | null> {
  const all = await readSecurityFeedItems();
  // 用 7d 窗口覆盖足够多同事件条目
  const ranked = rankHotItems(all, HOT_WINDOW_HOURS["7d"]);
  const main = ranked.find((it) => it.id === id);
  if (!main) return null;

  // 主条目已带聚合元信息（score/coverageCount/sources/relatedLinks）。
  // siblings：以 relatedLinks 为锚，匹配 ranked 中 link 相同的条目（不含主条目）。
  const byLink = new Map<string, HotItem>();
  for (const it of ranked) byLink.set(it.link, it);

  const seenIds = new Set<string>([id]);
  const siblings: HotItem[] = [];
  for (const link of main.relatedLinks) {
    if (link === main.link) continue;
    const sib = byLink.get(link);
    if (sib && !seenIds.has(sib.id)) {
      seenIds.add(sib.id);
      siblings.push(sib);
    }
  }

  // siblings 按时间倒序
  siblings.sort((a, b) => {
    const ta = new Date(a.pubDate).getTime();
    const tb = new Date(b.pubDate).getTime();
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });

  return {
    item: main,
    siblings,
    score: main.score,
    coverageCount: main.coverageCount,
  };
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

/**
 * 把热榜按日期 (上海时区，YYYY-MM-DD) 分桶，用于时间轴列表展示。
 * 返回数组按日期倒序（最新在前），桶内保持传入顺序（已按热度/时间排好）。
 */
export type DateGroup = { date: string; label: string; items: HotItem[] };

const CN_DATE_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  timeZone: "Asia/Shanghai",
});

/** 取一个 pubDate 的上海时区 YYYY-MM-DD。复用 lib/date-stamp。 */
export const shanghaiDateStamp = (iso: string): string => getShanghaiDateStamp(iso);

export function groupByDate(items: HotItem[]): DateGroup[] {
  const buckets = new Map<string, HotItem[]>();
  const order: string[] = [];
  for (const item of items) {
    const key = getShanghaiDateStamp(item.pubDate);
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(item);
  }
  return order
    .sort((a, b) => b.localeCompare(a))
    .map((date) => ({
      date,
      label: CN_DATE_FORMATTER.format(new Date(`${date}T00:00:00+08:00`)),
      items: buckets.get(date)!,
    }));
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
    reason: item.reason,
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
