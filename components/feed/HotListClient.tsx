"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { SystemIcon } from "@/components/ui/SystemIcon";
import { type FeedItem } from "@/lib/feeds";
import { rankHotItems, type HotItem } from "@/lib/hot-rank";
import { matchesFeedSearch } from "@/lib/feed-search";
import { groupByDate } from "@/lib/hot-page-data";
import {
  pickDisplayTitle,
  pickLocalizedField,
} from "@/lib/translation-detection";

type HotWindow = "24h" | "7d";

const WINDOW_HOURS: Record<HotWindow, number> = {
  "24h": 24,
  "7d": 24 * 7,
};

const WINDOW_OPTIONS: Array<{ key: HotWindow; label: string }> = [
  { key: "24h", label: "24 小时" },
  { key: "7d", label: "7 天" },
];

// 安全分类（对齐 AI HOT 的分类 pills）
const HOT_CATEGORIES = [
  "全部",
  "漏洞预警",
  "威胁情报",
  "恶意软件",
  "数据泄露",
  "政府/监管",
  "综合资讯",
  "深度分析",
];

type HotListClientProps = {
  /** 服务端已按 24h 窗口排好的热榜 (首屏直出)。 */
  items: HotItem[];
  /** 原始安全 feed (切换时间窗时在客户端重排用)。不传则禁用窗口切换。 */
  rawItems?: FeedItem[];
};

export default function HotListClient(props: HotListClientProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="mt-6 space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-slate-200/60 dark:bg-slate-800/60"
              />
            ))}
          </div>
        </div>
      }
    >
      <HotListInner {...props} />
    </Suspense>
  );
}

function HotListInner({ items, rawItems }: HotListClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialWindow = searchParams.get("window") === "7d" ? "7d" : "24h";
  const initialSearch = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("cat") ?? "全部";

  const [window, setWindow] = useState<HotWindow>(initialWindow);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);

  const ranked: HotItem[] = useMemo(() => {
    if (window === "24h") return items;
    if (rawItems) return rankHotItems(rawItems, WINDOW_HOURS[window]);
    return items;
  }, [items, rawItems, window]);

  const filtered = useMemo(() => {
    return ranked.filter((item) => {
      const categoryOk = category === "全部" || item.category === category;
      const searchOk = !search || matchesFeedSearch(item, search);
      return categoryOk && searchOk;
    });
  }, [ranked, category, search]);

  // 紧凑热榜区：取覆盖信源最多 / 分数最高的前 5 条
  const hotPicks = useMemo(() => {
    return [...filtered]
      .sort((a, b) => b.coverageCount - a.coverageCount || b.score - a.score)
      .slice(0, 5);
  }, [filtered]);

  const dateGroups = useMemo(() => groupByDate(filtered), [filtered]);

  const totalSources = useMemo(
    () => new Set((rawItems ?? items).map((i) => i.source)).size,
    [items, rawItems],
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (window !== "24h") params.set("window", window);
    if (category !== "全部") params.set("cat", category);
    if (search) params.set("q", search);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window, category, search]);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-8 sm:px-8">
      {/* —— 页头 —— */}
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
            精选
          </span>
          <span className="text-[12px] text-slate-400 dark:text-slate-500">
            ·
          </span>
          <span className="text-[12px] text-slate-400 dark:text-slate-500">
            跨 {totalSources} 个信源聚合，AI 自动挑选高价值内容
          </span>
        </div>
      </header>

      {/* —— 工具栏：分类 + 搜索 + 时间窗 —— */}
      <div className="sticky top-0 z-10 -mx-5 mb-6 border-b border-slate-200/70 bg-slate-50/85 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8 dark:border-slate-800/70 dark:bg-slate-950/85">
        <div className="flex flex-wrap items-center gap-2">
          {/* 分类 pills */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {HOT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors ${
                  category === cat
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 搜索 */}
          <div className="relative">
            <SystemIcon
              name="search"
              size={14}
              className="system-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索标题/摘要/正文…"
              className="h-8 w-44 rounded-full border border-slate-200 bg-white pl-8 pr-3 text-[12.5px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          {/* 时间窗 */}
          <div className="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
            {WINDOW_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setWindow(opt.key)}
                className={`rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
                  window === opt.key
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* —— 区域 2：当前热点（紧凑热榜） —— */}
      {hotPicks.length > 0 && (
        <section aria-label="当前热点" className="mb-8">
          <div className="mb-3 flex items-center gap-1.5">
            <span aria-hidden>🔥</span>
            <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
              当前热点
            </span>
            <span className="text-[12px] text-slate-400 dark:text-slate-500">
              多信源热度 · 随时间消退
            </span>
          </div>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200/70 bg-white/60 dark:divide-slate-800 dark:border-slate-800/70 dark:bg-slate-900/40">
            {hotPicks.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/items/${item.id}`}
                  className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span className="w-5 shrink-0 text-[15px] font-bold tabular-nums text-slate-400 dark:text-slate-500">
                    {item.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-slate-800 transition-colors group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white">
                    {displayTitle(item)}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11.5px] text-slate-400 dark:text-slate-500">
                    {item.coverageCount > 1 && (
                      <>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {item.coverageCount} 个信源
                        </span>
                        <span>·</span>
                      </>
                    )}
                    {formatTimeAgo(item.pubDate)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* —— 区域 3：按日期分组的时间轴 —— */}
      {dateGroups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/40 px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900/30">
          <SystemIcon
            name="activity"
            size={36}
            className="system-icon mx-auto mb-4 text-slate-300 dark:text-slate-600"
          />
          <p className="text-[14px] text-slate-500 dark:text-slate-400">
            {search || category !== "全部"
              ? "没有匹配的热点，试试换个关键词或分类。"
              : `近 ${window === "24h" ? "24 小时" : "7 天"}暂无新增安全资讯`}
          </p>
        </div>
      ) : (
        dateGroups.map((group) => (
          <DateGroupSection key={group.date} group={group} />
        ))
      )}
    </div>
  );
}

/** 一个日期分组：可折叠的日期头 + 时间轴卡片。 */
function DateGroupSection({
  group,
}: {
  group: { date: string; label: string; items: HotItem[] };
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="mb-2">
      {/* 日期头 */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        className="mb-3 flex w-full items-center gap-1.5 text-left"
      >
        <span className="text-[13.5px] font-semibold text-slate-900 dark:text-slate-100">
          {group.label}
        </span>
        <SystemIcon
          name="arrowRight"
          size={12}
          className={`system-icon text-slate-400 transition-transform ${
            collapsed ? "" : "rotate-90"
          }`}
        />
        <span className="text-[11.5px] text-slate-400 dark:text-slate-500">
          {collapsed ? `展开 ${group.items.length} 条` : `收起 ${group.label}`}
        </span>
      </button>

      {/* 时间轴卡片 */}
      {!collapsed && (
        <div className="relative">
          {group.items.map((item) => (
            <TimelineCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

/** 时间轴单条卡片：左侧时间戳 + 竖虚线 + 文章内容。 */
function TimelineCard({ item }: { item: HotItem }) {
  const time = formatHHmm(item.pubDate);
  const selected = item.rank <= 30; // 精选标记
  const title = displayTitle(item);
  const summary = displaySummary(item);

  // 从 source 解析 handle（如 "X：宝玉 (@dotey)" → @dotey）
  const handle = parseHandle(item.source);

  return (
    <div className="group flex gap-3 pb-1 sm:gap-4">
      {/* 左侧时间 + 竖虚线 */}
      <div className="flex w-12 shrink-0 flex-col items-end pt-3 sm:w-14">
        <span className="text-[11.5px] tabular-nums text-slate-400 dark:text-slate-500">
          {time}
        </span>
        <span className="mt-2 w-px flex-1 border-l border-dashed border-slate-200 dark:border-slate-700" />
      </div>

      {/* 文章卡 */}
      <Link
        href={`/items/${item.id}`}
        className="mb-3 block min-w-0 flex-1 rounded-xl border border-slate-200/70 bg-white/70 p-4 transition-all hover:-translate-y-px hover:border-slate-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:border-slate-800/70 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
      >
        {/* 信源行 */}
        <div className="mb-1.5 flex items-center gap-2">
          <span className="max-w-[60%] truncate text-[12.5px] font-medium text-slate-500 dark:text-slate-400">
            {item.source}
          </span>
          {handle && (
            <span className="hidden truncate text-[11.5px] text-slate-400 dark:text-slate-500 sm:inline">
              · {handle}
            </span>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            {selected && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                ✦ 精选
              </span>
            )}
            <span
              aria-label="AI 推荐分"
              className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {Math.round(item.score)}
            </span>
          </div>
        </div>

        {/* 标题 */}
        <h2 className="text-[15.5px] font-semibold leading-snug text-slate-900 transition-colors group-hover:text-slate-700 dark:text-slate-100 dark:group-hover:text-white">
          {title}
        </h2>

        {/* 摘要 */}
        {summary && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
            {summary}
          </p>
        )}

        {/* 标签 */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Tag>{item.category}</Tag>
          {extraTag(item) && <Tag>{extraTag(item)}</Tag>}
        </div>

        {/* 推荐理由 */}
        {item.reason && (
          <>
            <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
            <div className="flex items-start gap-1.5 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                推荐理由：
              </span>
              <span className="min-w-0">{item.reason}</span>
            </div>
          </>
        )}
      </Link>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
      {children}
    </span>
  );
}

// —— 展示文案辅助（中文化优先） ——
function displayTitle(item: HotItem): string {
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

function displaySummary(item: HotItem): string {
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

/** 从信源名里解析 @handle（仅 X 等带 @ 的源）。 */
function parseHandle(source: string): string | null {
  const m = source.match(/(@[\w.]+)/);
  return m ? m[1] : null;
}

/** 额外标签：从标题/摘要提取强信号关键词。 */
function extraTag(item: HotItem): string | null {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  if (/cve-\d{4}-\d+/i.test(text)) {
    return (text.match(/cve-\d{4}-\d+/i) || [])[0]?.toUpperCase() ?? null;
  }
  if (/ransomware|勒索/.test(text)) return "勒索软件";
  if (/zero[- ]?day|0[- ]?day|在野利用/.test(text)) return "零日漏洞";
  if (/apt/.test(text)) return "APT";
  return null;
}

/** HH:mm 格式（上海时区）。 */
function formatHHmm(pubDate: string): string {
  try {
    return new Date(pubDate).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    });
  } catch {
    return "";
  }
}

/** 轻量相对时间格式化。 */
function formatTimeAgo(pubDate: string): string {
  try {
    const now = Date.now();
    const then = new Date(pubDate).getTime();
    const diff = Math.max(0, now - then);
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} 天前`;
    return new Date(pubDate).toLocaleDateString("zh-CN");
  } catch {
    return pubDate;
  }
}
