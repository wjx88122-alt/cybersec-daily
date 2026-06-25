"use client";

import { useMemo, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import { SEC_CATEGORIES } from "@/components/CategoryFilter";
import { SystemIcon } from "@/components/ui/SystemIcon";
import { type FeedItem } from "@/lib/feeds";
import { rankHotItems, type HotItem } from "@/lib/hot-rank";
import { matchesFeedSearch } from "@/lib/feed-search";

type HotWindow = "24h" | "7d";

const WINDOW_HOURS: Record<HotWindow, number> = {
  "24h": 24,
  "7d": 24 * 7,
};

const WINDOW_OPTIONS: Array<{ key: HotWindow; label: string; hint: string }> = [
  { key: "24h", label: "24 小时", hint: "今日热点" },
  { key: "7d", label: "7 天", hint: "本周热门" },
];

type HotListClientProps = {
  items: FeedItem[];
};

/** 热度分数 → 徽章颜色档位 (从冷到热)。 */
function scoreTier(score: number): {
  label: string;
  className: string;
  ring: string;
} {
  if (score >= 50)
    return {
      label: "爆",
      className: "bg-red-500 text-white",
      ring: "ring-red-500/20",
    };
  if (score >= 35)
    return {
      label: "热",
      className: "bg-orange-500 text-white",
      ring: "ring-orange-500/20",
    };
  if (score >= 22)
    return {
      label: "温",
      className: "bg-amber-400 text-amber-950",
      ring: "ring-amber-400/20",
    };
  return {
    label: "新",
    className: "bg-slate-200 text-slate-600",
    ring: "ring-slate-200/40",
  };
}

/** 排名 → 角标颜色 (前三名突出)。 */
function rankBadge(rank: number): string {
  if (rank === 1) return "bg-red-500 text-white";
  if (rank === 2) return "bg-orange-500 text-white";
  if (rank === 3) return "bg-amber-500 text-white";
  return "bg-slate-200/80 text-slate-500";
}

/**
 * 排名 → 卡片视觉强调 (TOP 3 专属红/橙/黄底色 + 左侧色条 + 加重阴影)。
 * rank 4+ 维持中性白卡，避免色彩过载。
 */
function cardAccent(rank: number): {
  card: string;
  rail: string;
} {
  if (rank === 1)
    return {
      card: "border-red-200 bg-gradient-to-br from-red-50/80 via-white to-white shadow-[0_18px_50px_rgba(239,68,68,0.12)]",
      rail: "bg-gradient-to-b from-red-500 to-red-300",
    };
  if (rank === 2)
    return {
      card: "border-orange-200 bg-gradient-to-br from-orange-50/80 via-white to-white shadow-[0_18px_50px_rgba(249,115,22,0.12)]",
      rail: "bg-gradient-to-b from-orange-500 to-orange-300",
    };
  if (rank === 3)
    return {
      card: "border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-white shadow-[0_18px_50px_rgba(245,158,11,0.12)]",
      rail: "bg-gradient-to-b from-amber-500 to-amber-300",
    };
  return {
    card: "border-slate-200/80 bg-white/82 shadow-[0_16px_44px_rgba(15,23,42,0.06)]",
    rail: "bg-gradient-to-b from-amber-400/60 to-transparent",
  };
}

export default function HotListClient({ items }: HotListClientProps) {
  const [window, setWindow] = useState<HotWindow>("24h");
  const [category, setCategory] = useState("全部");
  const [search, setSearch] = useState("");

  // 计算热榜：聚合 + 打分 + 排序 (随 window 变化重算)
  const ranked: HotItem[] = useMemo(
    () => rankHotItems(items, WINDOW_HOURS[window]),
    [items, window],
  );

  // 客户端二次过滤：分类 + 搜索
  const filtered = useMemo(() => {
    return ranked.filter((item) => {
      const categoryOk =
        category === "全部" || item.category === category;
      const searchOk = !search || matchesFeedSearch(item, search);
      return categoryOk && searchOk;
    });
  }, [ranked, category, search]);

  const totalSources = useMemo(
    () => new Set(items.map((i) => i.source)).size,
    [items],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      {/* —— 页头 —— */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600">
          <SystemIcon name="activity" size={14} className="system-icon" />
          安全热榜 · Security Hot
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[2.6rem]">
          今天安全圈最值得关注的事
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-8 text-slate-600">
          跨 {totalSources} 个信源聚合 · 同一事件多来源自动合并 · 按热度排序，
          而不是按时间。先看最热的，再往下深挖。
        </p>
      </header>

      {/* —— 控制栏：时间窗 + 搜索 —— */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* 时间窗切换 */}
        <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 p-1 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          {WINDOW_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setWindow(opt.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                window === opt.key
                  ? "bg-slate-900 text-white shadow-[0_6px_16px_rgba(15,23,42,0.18)]"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {opt.label}
              <span
                className={`text-[10px] ${
                  window === opt.key ? "text-slate-300" : "text-slate-400"
                }`}
              >
                {opt.hint}
              </span>
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <div className="relative flex-1 min-w-[200px]">
          <SystemIcon
            name="search"
            size={16}
            className="system-icon pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索标题、摘要或关键词"
            className="h-10 w-full rounded-full border border-slate-200 bg-white/80 pl-11 pr-4 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="text-[12px] text-slate-500">
          共 <span className="font-semibold text-slate-800">{filtered.length}</span>{" "}
          条热榜
        </div>
      </div>

      {/* —— 分类筛选 —— */}
      <div className="mb-8">
        <CategoryFilter
          active={category}
          onChange={setCategory}
          categories={SEC_CATEGORIES}
        />
      </div>

      {/* —— 热榜列表 —— */}
      {filtered.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/50 px-6 py-20 text-center">
          <SystemIcon
            name="activity"
            size={40}
            className="system-icon mx-auto mb-4 text-slate-300"
          />
          <p className="text-[15px] font-medium text-slate-600">
            {search || category !== "全部"
              ? "没有匹配的热点，试试换个关键词或分类。"
              : `近 ${window === "24h" ? "24 小时" : "7 天"}暂无新增安全资讯`}
          </p>
        </div>
      ) : (
        <ol className="space-y-4">
          {filtered.map((item) => (
            <HotRow key={item.id} item={item} />
          ))}
        </ol>
      )}
    </div>
  );
}

/** 单条热榜行：排名角标 + 卡片 + 覆盖信源条。 */
function HotRow({ item }: { item: HotItem }) {
  const tier = scoreTier(item.score);
  const accent = cardAccent(item.rank);
  const [expanded, setExpanded] = useState(false);
  const hasCoverage = item.coverageCount > 1;
  // 展开时展示除主条目外的其他信源链接
  const extraSources = item.sources.slice(1);

  return (
    <li className="relative">
      <div className="flex gap-3 sm:gap-4">
        {/* 排名角标 */}
        <div className="flex flex-col items-center pt-1">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums ${rankBadge(
              item.rank,
            )}`}
          >
            {String(item.rank).padStart(2, "0")}
          </span>
          {/* 热度分竖向条 (TOP 3 用对应主题色) */}
          <span className={`mt-1.5 h-10 w-1 rounded-full ${accent.rail}`} />
        </div>

        {/* 卡片主体 */}
        <div className="min-w-0 flex-1">
          <div
            className={`rounded-[26px] border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)] ${accent.card}`}
          >
            {/* 标题行：热度徽章 + 分类 */}
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${tier.className} ring-1 ${tier.ring}`}
              >
                <span aria-hidden>🔥</span>
                {tier.label} {item.score}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                <SystemIcon name="filter" size={11} className="system-icon" />
                {item.category}
              </span>
              {hasCoverage && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                  <SystemIcon name="radar" size={11} className="system-icon" />
                  {item.coverageCount} 个信源
                </span>
              )}
            </div>

            {/* 标题 + 链接 */}
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group/title block"
            >
              <h2 className="text-[17px] font-semibold leading-[1.4] tracking-[-0.02em] text-slate-950 transition-colors group-hover/title:text-slate-700 sm:text-[18px]">
                {item.title}
              </h2>
            </a>

            {/* 摘要 */}
            {item.summaryAi && (
              <p className="mt-2 line-clamp-2 text-[14px] leading-7 text-slate-600">
                {item.summaryAi}
              </p>
            )}

            {/* footer：主信源 + 时间 + 阅读原文 */}
            <div className="mt-4 flex items-center gap-2 border-t border-slate-200/80 pt-3 text-[11px] text-slate-500">
              <SystemIcon
                name="globe"
                size={13}
                className="system-icon shrink-0 text-slate-400"
              />
              <span className="truncate font-medium text-slate-700">
                {item.source}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1">
                <SystemIcon name="clock" size={13} className="system-icon" />
                {formatTimeAgo(item.pubDate)}
              </span>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex shrink-0 items-center gap-1 font-medium text-slate-900 transition-colors hover:text-amber-600"
              >
                阅读原文
                <SystemIcon
                  name="external"
                  size={12}
                  className="system-icon"
                />
              </a>
            </div>
          </div>

          {/* 覆盖信源展开条 */}
          {hasCoverage && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 ml-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <SystemIcon
                name={expanded ? "x" : "radar"}
                size={12}
                className="system-icon"
              />
              {expanded ? "收起" : `还有 ${item.coverageCount - 1} 个信源报道了此事`}
              <SystemIcon
                name="arrowRight"
                size={11}
                className={`system-icon transition-transform ${
                  expanded ? "rotate-90" : "rotate-90"
                }`}
              />
            </button>
          )}

          {/* 展开的信源列表 */}
          {hasCoverage && expanded && (
            <ul className="mt-2 space-y-1.5 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3">
              {extraSources.map((src, idx) => {
                const link = item.relatedLinks[idx + 1] ?? item.link;
                return (
                  <li key={`${src}-${idx}`}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
                    >
                      <SystemIcon
                        name="globe"
                        size={11}
                        className="system-icon shrink-0 text-slate-400"
                      />
                      <span className="truncate">{src}</span>
                      <SystemIcon
                        name="external"
                        size={10}
                        className="system-icon ml-auto shrink-0 text-slate-400"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

/** 轻量相对时间格式化 (与 NewsCard 一致，但避免引入 date-fns 重复)。 */
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
