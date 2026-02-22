import { DigestItem } from "@/lib/digest";

const IMPORTANCE_CONFIG = {
  critical: {
    label: "严重",
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
  high: {
    label: "高危",
    bg: "bg-orange-100 dark:bg-orange-900/40",
    text: "text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  medium: {
    label: "中等",
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    text: "text-yellow-600 dark:text-yellow-500",
    dot: "bg-yellow-500",
  },
};

export default function DigestCard({ item }: { item: DigestItem }) {
  const cfg = IMPORTANCE_CONFIG[item.importance] || IMPORTANCE_CONFIG.medium;

  return (
    <a
      href={item.sourceLink}
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
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <span className="text-xs" style={{ color: "var(--secondary-text)" }}>{item.category}</span>
      </div>
      <h3 className="font-semibold text-[15px] mb-1.5" style={{ color: "var(--foreground)" }}>
        {item.headline}
      </h3>
      <p className="text-sm leading-relaxed mb-2.5" style={{ color: "var(--secondary-text)" }}>
        {item.summary}
      </p>
      <p className="text-xs truncate" style={{ color: "var(--secondary-text)", opacity: 0.5 }}>
        {item.sourceTitle}
      </p>
    </a>
  );
}
