import { FeedItem } from "@/lib/feeds";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  综合资讯: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-600 dark:text-blue-400" },
  深度分析: { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-600 dark:text-purple-400" },
  漏洞预警: { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-600 dark:text-red-400" },
  威胁情报: { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-600 dark:text-orange-400" },
  恶意软件: { bg: "bg-pink-100 dark:bg-pink-900/40", text: "text-pink-600 dark:text-pink-400" },
  "政府/监管": { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-600 dark:text-green-400" },
};

export default function NewsCard({ item }: { item: FeedItem }) {
  const color = CATEGORY_COLORS[item.category] || {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-500 dark:text-gray-400",
  };

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
      className="block rounded-2xl p-4 transition-all duration-200 active:scale-[0.98]"
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
          {item.category}
        </span>
        <span className="text-xs" style={{ color: "var(--secondary-text)" }}>{timeAgo}</span>
      </div>
      <h2 className="font-semibold text-[15px] leading-snug mb-1.5 line-clamp-2" style={{ color: "var(--foreground)" }}>
        {item.title}
      </h2>
      {item.summary && (
        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "var(--secondary-text)" }}>
          {item.summary}
        </p>
      )}
      <p className="text-xs mt-2 truncate" style={{ color: "var(--secondary-text)", opacity: 0.6 }}>
        {item.source}
      </p>
    </a>
  );
}
