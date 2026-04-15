"use client";

import { FeedItem } from "@/lib/feeds";
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
  | "news";

const CATEGORY_GRADIENT: Record<string, string> = {
  综合资讯: "from-[#eff6ff] via-[#dbeafe] to-[#bfdbfe]",
  深度分析: "from-[#f5f3ff] via-[#ede9fe] to-[#ddd6fe]",
  漏洞预警: "from-[#fef2f2] via-[#fee2e2] to-[#fecaca]",
  威胁情报: "from-[#fff7ed] via-[#ffedd5] to-[#fed7aa]",
  恶意软件: "from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8]",
  "政府/监管": "from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]",
  "AI 产品": "from-[#ecfeff] via-[#cffafe] to-[#a5f3fc]",
  "AI 研究": "from-[#eef2ff] via-[#e0e7ff] to-[#c7d2fe]",
  "AI 商业": "from-[#fffbeb] via-[#fef3c7] to-[#fde68a]",
  "AI 开发": "from-[#ecfdf5] via-[#ccfbf1] to-[#99f6e4]",
  "AI 政策": "from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]",
  "AI 洞察": "from-[#fefce8] via-[#fef9c3] to-[#fde047]",
};

const CATEGORY_ACCENT: Record<string, string> = {
  综合资讯: "bg-blue-50 text-blue-700 border-blue-100",
  深度分析: "bg-violet-50 text-violet-700 border-violet-100",
  漏洞预警: "bg-red-50 text-red-700 border-red-100",
  威胁情报: "bg-orange-50 text-orange-700 border-orange-100",
  恶意软件: "bg-pink-50 text-pink-700 border-pink-100",
  "政府/监管": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "AI 产品": "bg-cyan-50 text-cyan-700 border-cyan-100",
  "AI 研究": "bg-indigo-50 text-indigo-700 border-indigo-100",
  "AI 商业": "bg-amber-50 text-amber-700 border-amber-100",
  "AI 开发": "bg-teal-50 text-teal-700 border-teal-100",
  "AI 政策": "bg-slate-100 text-slate-700 border-slate-200",
  "AI 洞察": "bg-yellow-50 text-yellow-700 border-yellow-100",
};

const CATEGORY_ICON: Record<string, CategoryIconKind> = {
  综合资讯: "globe",
  深度分析: "search",
  漏洞预警: "alert",
  威胁情报: "target",
  恶意软件: "shield",
  "政府/监管": "building",
  "AI 产品": "cpu",
  "AI 研究": "flask",
  "AI 商业": "briefcase",
  "AI 开发": "code",
  "AI 政策": "scroll",
  "AI 洞察": "bulb",
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
}: {
  item: FeedItem;
  hero?: boolean;
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

  const title = item.titleZh || item.title;
  const summary = item.summaryZh || item.summaryAi || item.summary;
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
                <span className="system-pill rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  今日焦点
                </span>
                <span
                  className={`system-pill rounded-full border px-3 py-1 text-[10px] font-semibold ${catAccent}`}
                >
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
              <span className="system-pill inline-flex h-8 items-center rounded-full border border-slate-200 bg-white px-3 font-medium text-slate-700">
                {item.source}
              </span>
              <span>{timeAgo}</span>
              <span className="ml-auto inline-flex items-center gap-2 font-medium text-slate-900">
                阅读详情
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M17 7H8M17 7v9" />
                </svg>
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
              <span
                className={`system-pill rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm ${catAccent}`}
              >
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
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400/70 shrink-0" />
              <span className="truncate font-medium text-slate-700">{item.source}</span>
              <span className="ml-auto shrink-0">{timeAgo}</span>
            </div>
          </div>
        </>
      )}
    </a>
  );
}
