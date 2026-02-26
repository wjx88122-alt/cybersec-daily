import { DigestItem } from "@/lib/digest";

const IMPORTANCE_CONFIG = {
  critical: {
    label: "严重",
    bar: "from-red-500 to-rose-400",
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
    accent: "text-red-400",
    border: "hover:border-red-500/30",
    glow: "hover:shadow-red-500/10",
  },
  high: {
    label: "高危",
    bar: "from-orange-500 to-amber-400",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    accent: "text-orange-400",
    border: "hover:border-orange-500/30",
    glow: "hover:shadow-orange-500/10",
  },
  medium: {
    label: "中等",
    bar: "from-yellow-500 to-yellow-400",
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    accent: "text-yellow-400",
    border: "hover:border-yellow-500/20",
    glow: "hover:shadow-yellow-500/10",
  },
};

export default function DigestCard({
  item,
  featured = false,
}: {
  item: DigestItem;
  featured?: boolean;
}) {
  const cfg = IMPORTANCE_CONFIG[item.importance] || IMPORTANCE_CONFIG.medium;
  const safeHref =
    item.sourceLink?.startsWith("http://") ||
    item.sourceLink?.startsWith("https://")
      ? item.sourceLink
      : "#";

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex flex-col rounded-xl overflow-hidden border border-black/[0.06] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/8 ${cfg.border} ${cfg.glow}`}
    >
      {/* Top gradient bar */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${cfg.bar} shrink-0`} />

      <div className={`flex flex-col flex-1 ${featured ? "p-5" : "p-4"}`}>
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badge}`}
          >
            {cfg.label}
          </span>
          <span className="text-[10px] text-[#94a3b8] bg-black/[0.03] border border-black/[0.06] px-2 py-0.5 rounded-full truncate max-w-[140px]">
            {item.category}
          </span>
        </div>

        {/* Headline */}
        <h3
          className={`font-semibold leading-snug mb-2.5 text-[#f0f6fc] group-hover:text-[#1a1a2e] transition-colors ${featured ? "text-[15px]" : "text-[13px]"}`}
        >
          {item.headline}
        </h3>

        {/* Summary */}
        <p
          className={`leading-relaxed text-[#64748b] flex-1 ${featured ? "text-[13px] line-clamp-5" : "text-[12px] line-clamp-3"}`}
        >
          {item.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
          <span className="text-[11px] text-[#94a3b8] truncate max-w-[80%]">
            {item.sourceTitle}
          </span>
          <svg
            className={`w-3.5 h-3.5 shrink-0 ${cfg.accent} opacity-0 group-hover:opacity-100 transition-opacity`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 17L17 7M17 7H7M17 7v10"
            />
          </svg>
        </div>
      </div>
    </a>
  );
}
