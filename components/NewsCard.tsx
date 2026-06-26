"use client";

import { SystemIcon } from "@/components/ui/SystemIcon";
import { FeedItem } from "@/lib/feeds";
import { pickDisplayTitle, pickLocalizedField } from "@/lib/translation-detection";
import { resolveSafeExternalHref, resolveSafeImageUrl } from "@/lib/remote-url";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useState } from "react";

type CategoryIconKind =
  | "globe"
  | "search"
  | "alert"
  | "target"
  | "shield"
  | "building"
  | "cpu"
  | "flask"
  | "briefcase"
  | "code"
  | "scroll"
  | "bulb"
  | "news"
  | "spark"
  | "file"
  | "lock";

const CATEGORY_GRADIENT: Record<string, string> = {
  综合资讯: "from-[#eff6ff] via-[#dbeafe] to-[#bfdbfe]",
  深度分析: "from-[#f5f3ff] via-[#ede9fe] to-[#ddd6fe]",
  漏洞预警: "from-[#fef2f2] via-[#fee2e2] to-[#fecaca]",
  威胁情报: "from-[#fff7ed] via-[#ffedd5] to-[#fed7aa]",
  恶意软件: "from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8]",
  "政府/监管": "from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]",
  "AI 安全": "from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]",
  "AI 红队与攻击": "from-[#fef2f2] via-[#fee2e2] to-[#fecaca]",
  "AI 对抗与鲁棒": "from-[#fff7ed] via-[#ffedd5] to-[#fed7aa]",
  "AI 提示注入": "from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8]",
  "AI 治理与标准": "from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]",
  "AI 隐私与数据": "from-[#f5f3ff] via-[#ede9fe] to-[#ddd6fe]",
};

const CATEGORY_ACCENT: Record<string, string> = {
  综合资讯: "bg-blue-50 text-blue-700 border-blue-100",
  深度分析: "bg-violet-50 text-violet-700 border-violet-100",
  漏洞预警: "bg-red-50 text-red-700 border-red-100",
  威胁情报: "bg-orange-50 text-orange-700 border-orange-100",
  恶意软件: "bg-pink-50 text-pink-700 border-pink-100",
  "政府/监管": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "AI 安全": "bg-slate-100 text-slate-700 border-slate-200",
  "AI 红队与攻击": "bg-red-50 text-red-700 border-red-100",
  "AI 对抗与鲁棒": "bg-orange-50 text-orange-700 border-orange-100",
  "AI 提示注入": "bg-pink-50 text-pink-700 border-pink-100",
  "AI 治理与标准": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "AI 隐私与数据": "bg-violet-50 text-violet-700 border-violet-100",
};

const CATEGORY_ICON: Record<string, CategoryIconKind> = {
  综合资讯: "globe",
  深度分析: "search",
  漏洞预警: "alert",
  威胁情报: "target",
  恶意软件: "shield",
  "政府/监管": "briefcase",
  "AI 安全": "spark",
  "AI 红队与攻击": "alert",
  "AI 对抗与鲁棒": "shield",
  "AI 提示注入": "target",
  "AI 治理与标准": "file",
  "AI 隐私与数据": "lock",
};

function CategoryIcon({
  kind,
  className = "w-10 h-10",
}: {
  kind: CategoryIconKind;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (kind) {
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.2-4.2" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 4 3.5 19h17L12 4Z" />
          <path d="M12 9.5v4M12 16.5h.01" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="m12 3 7 3v6c0 4.5-2.8 7.6-7 9-4.2-1.4-7-4.5-7-9V6l7-3Z" />
          <path d="m8.5 15.5 7-7" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M3 10h18M5 10V7l7-3 7 3v3M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16" />
        </svg>
      );
    case "cpu":
      return (
        <svg {...common}>
          <rect x="7" y="7" width="10" height="10" rx="2" />
          <path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
        </svg>
      );
    case "flask":
      return (
        <svg {...common}>
          <path d="M10 3h4M11 3v4l-5.5 9a2 2 0 0 0 1.7 3h9.6a2 2 0 0 0 1.7-3L13 7V3" />
          <path d="M8.2 14h7.6" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="12" rx="2" />
          <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12h18" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="m9 8-4 4 4 4M15 8l4 4-4 4M13 6l-2 12" />
        </svg>
      );
    case "scroll":
      return (
        <svg {...common}>
          <rect x="5" y="3.5" width="14" height="17" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case "bulb":
      return (
        <svg {...common}>
          <path d="M12 3a6 6 0 0 0-3.5 10.9c.9.7 1.5 1.8 1.5 3.1h4c0-1.3.6-2.4 1.5-3.1A6 6 0 0 0 12 3Z" />
          <path d="M10 20h4M10.5 17.5h3" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5.5 5.5l3 3M15.5 15.5l3 3M18.5 5.5l-3 3M8.5 15.5l-3 3" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );
  }
}

export default function NewsCard({
  item,
  hero = false,
  score,
  rank,
  coverageCount,
}: {
  item: FeedItem;
  hero?: boolean;
  /** 热度分 (热榜页传入时显示热度徽章)。 */
  score?: number;
  /** 排名 (热榜页传入时显示排名角标)。 */
  rank?: number;
  /** 覆盖信源数 (热榜页传入时显示多信源提示)。 */
  coverageCount?: number;
}) {
  const [imgError, setImgError] = useState(false);

  let timeAgo = "";
  try {
    timeAgo = formatDistanceToNow(new Date(item.pubDate), {
      addSuffix: true,
      locale: zhCN,
    });
  } catch {
    timeAgo = item.pubDate;
  }

  const title = pickDisplayTitle({
    source: item.title,
    candidate: item.titleZh,
    existing: item.title,
    summarySource: item.summary,
    summaryCandidate: item.summaryZh,
    summaryExisting: item.summaryAi,
  }) || item.title;
  const summaryZh = pickLocalizedField({
    source: item.summary,
    candidate: item.summaryZh,
  });
  const summary = summaryZh || item.summaryAi || item.summary;
  const safeHref = resolveSafeExternalHref(item.link);
  const imgSrc =
    !imgError && item.image
      ? resolveSafeImageUrl(item.image, item.link || "https://example.com")
      : null;
  const catAccent =
    CATEGORY_ACCENT[item.category] ??
    "bg-slate-100 text-slate-700 border-slate-200";
  const catGradient =
    CATEGORY_GRADIENT[item.category] ?? "from-slate-100 via-slate-200 to-slate-300";

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`system-card group block overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/82 shadow-[0_20px_60px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)] reveal-rise ${
        hero ? "public-panel-strong" : "public-panel"
      }`}
    >
      {hero ? (
        <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-between p-7 sm:p-9 lg:p-11">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="system-pill inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <SystemIcon className="system-icon" name="radar" size={12} />
                  今日焦点
                </span>
                <span
                  className={`system-pill inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold ${catAccent}`}
                >
                  <SystemIcon className="system-icon" name="filter" size={12} />
                  {item.category}
                </span>
              </div>
              <h2 className="mt-5 max-w-[14ch] text-[2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 transition-colors group-hover:text-slate-800 sm:text-[2.6rem]">
                {title}
              </h2>
              {summary && (
                <p className="mt-5 max-w-xl text-[15px] leading-8 text-slate-600 sm:text-base">
                  {summary}
                </p>
              )}
            </div>

            <div className="mt-8 flex items-center gap-3 text-[11px] text-slate-500">
              <span className="system-pill inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 font-medium text-slate-700">
                <SystemIcon className="system-icon" name="globe" size={13} />
                {item.source}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <SystemIcon className="system-icon" name="clock" size={13} />
                {timeAgo}
              </span>
              <span className="ml-auto inline-flex items-center gap-2 font-medium text-slate-900">
                阅读详情
                <SystemIcon
                  className="system-icon transition-transform duration-300 group-hover:translate-x-1"
                  name="external"
                  size={14}
                />
              </span>
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden bg-slate-100 lg:min-h-full">
            {imgSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgSrc}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br ${catGradient}`}>
                <span className="text-slate-700">
                  <CategoryIcon kind={CATEGORY_ICON[item.category] ?? "news"} className="h-12 w-12" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {item.source}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),rgba(15,23,42,0.04))]" />
          </div>
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden">
            <div className="aspect-[16/10] overflow-hidden bg-slate-100">
              {imgSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgSrc}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br ${catGradient}`}>
                  <span className="text-slate-700/80">
                    <CategoryIcon kind={CATEGORY_ICON[item.category] ?? "news"} className="h-10 w-10" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {item.source}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {typeof rank === "number" && rank > 0 && (
                <span
                  className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-bold tabular-nums shadow-sm ${
                    rank === 1
                      ? "bg-red-500 text-white"
                      : rank === 2
                        ? "bg-orange-500 text-white"
                        : rank === 3
                          ? "bg-amber-500 text-white"
                          : "bg-white/90 text-slate-700"
                  }`}
                >
                  #{rank}
                </span>
              )}
              {typeof score === "number" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-[10px] font-bold text-amber-950 shadow-sm backdrop-blur-sm">
                  <span aria-hidden>🔥</span>
                  {score}
                </span>
              )}
              <span
                className={`system-pill inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm ${catAccent}`}
              >
                <SystemIcon className="system-icon" name="filter" size={12} />
                {item.category}
              </span>
            </div>
          </div>

          <div className="p-5">
            <h2 className="mb-2.5 line-clamp-2 text-[17px] font-semibold leading-[1.35] tracking-[-0.025em] text-slate-950 transition-colors group-hover:text-slate-800">
              {title}
            </h2>
            {summary && (
              <p className="line-clamp-3 text-[14px] leading-7 text-slate-600">
                {summary}
              </p>
            )}
            <div className="mt-5 flex items-center gap-2 border-t border-slate-200/80 pt-4 text-[11px] text-slate-500">
              <SystemIcon className="system-icon shrink-0 text-slate-400" name="globe" size={13} />
              <span className="truncate font-medium text-slate-700">{item.source}</span>
              {typeof coverageCount === "number" && coverageCount > 1 && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                  +{coverageCount - 1} 信源
                </span>
              )}
              <span className="ml-auto inline-flex shrink-0 items-center gap-1.5">
                <SystemIcon className="system-icon" name="clock" size={13} />
                {timeAgo}
              </span>
            </div>
          </div>
        </>
      )}
    </a>
  );
}
