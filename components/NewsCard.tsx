"use client";

import { FeedItem } from "@/lib/feeds";
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
  综合资讯: "from-blue-950 to-blue-900",
  深度分析: "from-purple-950 to-purple-900",
  漏洞预警: "from-red-950 to-red-900",
  威胁情报: "from-orange-950 to-orange-900",
  恶意软件: "from-pink-950 to-pink-900",
  "政府/监管": "from-green-950 to-green-900",
  "AI 产品": "from-cyan-950 to-cyan-900",
  "AI 研究": "from-indigo-950 to-indigo-900",
  "AI 商业": "from-amber-950 to-amber-900",
  "AI 开发": "from-emerald-950 to-emerald-900",
  "AI 政策": "from-slate-800 to-slate-700",
  "AI 洞察": "from-yellow-950 to-yellow-900",
};

const CATEGORY_ACCENT: Record<string, string> = {
  综合资讯: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  深度分析: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  漏洞预警: "bg-red-500/20 text-red-300 border-red-500/30",
  威胁情报: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  恶意软件: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "政府/监管": "bg-green-500/20 text-green-300 border-green-500/30",
  "AI 产品": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "AI 研究": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "AI 商业": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "AI 开发": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "AI 政策": "bg-slate-500/20 text-slate-300 border-slate-500/30",
  "AI 洞察": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
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
  const imgSrc = !imgError && item.image ? item.image : null;
  const catAccent =
    CATEGORY_ACCENT[item.category] ??
    "bg-white/10 text-white/60 border-white/10";
  const catGradient =
    CATEGORY_GRADIENT[item.category] ?? "from-gray-900 to-gray-800";

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl overflow-hidden border border-white/[0.06] bg-[#0d1117] hover:border-white/[0.12] hover:bg-[#111820] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40"
    >
      {/* Image / Placeholder */}
      <div
        className={`relative overflow-hidden ${hero ? "aspect-[16/7]" : "aspect-[16/9]"}`}
      >
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br ${catGradient}`}
          >
            <span className="opacity-70 text-[#f0f6fc]">
              <CategoryIcon kind={CATEGORY_ICON[item.category] ?? "news"} />
            </span>
            <span className="text-xs text-white/30 font-medium tracking-wide">
              {item.source}
            </span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Category badge */}
        <span
          className={`absolute bottom-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catAccent} backdrop-blur-sm`}
        >
          {item.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2
          className={`font-semibold leading-snug mb-2 line-clamp-2 text-[#f0f6fc] group-hover:text-white transition-colors ${hero ? "text-xl" : "text-[14px]"}`}
        >
          {title}
        </h2>
        {summary && (
          <p className="text-[13px] leading-relaxed text-[#8b949e]">
            {summary}
          </p>
        )}
        <div className="flex items-center gap-2 mt-3 text-[11px] text-[#484f58]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e5ff00]/40 shrink-0" />
          <span className="truncate font-medium text-[#6e7681]">
            {item.source}
          </span>
          <span className="shrink-0 ml-auto">{timeAgo}</span>
        </div>
      </div>
    </a>
  );
}
