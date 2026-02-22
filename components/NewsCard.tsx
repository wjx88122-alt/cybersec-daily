import { FeedItem } from "@/lib/feeds";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

const CATEGORY_COLORS: Record<string, string> = {
  综合: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  深度分析: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  漏洞预警: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function NewsCard({ item }: { item: FeedItem }) {
  const colorClass =
    CATEGORY_COLORS[item.category] ||
    "bg-gray-500/20 text-gray-300 border-gray-500/30";

  let timeAgo = "";
  try {
    timeAgo = formatDistanceToNow(new Date(item.pubDate), {
      addSuffix: true,
      locale: zhCN,
    });
  } catch {
    timeAgo = item.pubDate;
  }

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 hover:bg-gray-800/60 transition-all duration-200 group"
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colorClass}`}
        >
          {item.category}
        </span>
        <span className="text-xs text-gray-500">{item.source}</span>
        <span className="text-xs text-gray-600 ml-auto">{timeAgo}</span>
      </div>
      <h2 className="text-white font-semibold text-base leading-snug mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
        {item.title}
      </h2>
      {item.summary && (
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
          {item.summary}
        </p>
      )}
    </a>
  );
}
