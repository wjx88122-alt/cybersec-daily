"use client";

import { FeedItem } from "@/lib/feeds";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useState } from "react";

const CATEGORY_BG: Record<string, string> = {
  综合资讯: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  深度分析: "linear-gradient(135deg, #1a0a2e 0%, #2d1b69 100%)",
  漏洞预警: "linear-gradient(135deg, #2e0a0a 0%, #6b1a1a 100%)",
  威胁情报: "linear-gradient(135deg, #2e1a0a 0%, #6b3a1a 100%)",
  恶意软件: "linear-gradient(135deg, #2e0a1a 0%, #6b1a3a 100%)",
  "政府/监管": "linear-gradient(135deg, #0a2e0a 0%, #1a4a1a 100%)",
};

const CATEGORY_ICON: Record<string, string> = {
  综合资讯: "🌐", 深度分析: "🔍", 漏洞预警: "⚠️", 威胁情报: "🎯", 恶意软件: "🦠", "政府/监管": "🏛️",
};

export default function NewsCard({ item, hero = false }: { item: FeedItem; hero?: boolean }) {
  const [imgError, setImgError] = useState(false);

  let timeAgo = "";
  try {
    timeAgo = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true, locale: zhCN });
  } catch {
    timeAgo = item.pubDate;
  }

  const title = item.titleZh || item.title;
  const summary = item.summaryZh || item.summary;
  const imgSrc = !imgError && item.image ? item.image : null;

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block group overflow-hidden bg-[#1a1a1a] hover:bg-[#222] transition-colors"
    >
      <div className={`relative overflow-hidden bg-[#222] ${hero ? "aspect-[16/7]" : "aspect-[16/9]"}`}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: CATEGORY_BG[item.category] ?? "linear-gradient(135deg, #1a1a1a 0%, #333 100%)" }}
          >
            <span className="text-4xl">{CATEGORY_ICON[item.category] ?? "📰"}</span>
            <span className="text-xs text-[#666] font-medium">{item.source}</span>
          </div>
        )}
        <span
          className="absolute bottom-2 left-2 text-[11px] font-bold px-2 py-0.5 uppercase tracking-wide"
          style={{ background: "#e5ff00", color: "#000" }}
        >
          {item.category}
        </span>
      </div>

      <div className="p-3">
        <h2 className={`font-bold leading-snug mb-1.5 line-clamp-2 text-white ${hero ? "text-xl" : "text-[15px]"}`}>
          {title}
        </h2>
        {summary && (
          <p className="text-sm leading-relaxed line-clamp-2 text-[#999]">{summary}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-[#666]">
          <span className="truncate">{item.source}</span>
          <span>·</span>
          <span className="shrink-0">{timeAgo}</span>
        </div>
      </div>
    </a>
  );
}
