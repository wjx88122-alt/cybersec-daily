"use client";

import { FeedItem } from "@/lib/feeds";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useState } from "react";

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
          <div className="w-full h-full flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="4" fill="#333" />
              <path d="M12 32l8-10 6 7 4-5 6 8H12z" fill="#444" />
              <circle cx="32" cy="18" r="4" fill="#444" />
            </svg>
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
