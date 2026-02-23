import { DigestItem } from "@/lib/digest";

const IMPORTANCE_CONFIG = {
  critical: {
    label: "严重",
    bar: "bg-gradient-to-r from-red-500 to-red-400",
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
    glow: "hover:shadow-red-500/10",
  },
  high: {
    label: "高危",
    bar: "bg-gradient-to-r from-orange-500 to-orange-400",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    glow: "hover:shadow-orange-500/10",
  },
  medium: {
    label: "中等",
    bar: "bg-gradient-to-r from-yellow-500 to-yellow-400",
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    glow: "hover:shadow-yellow-500/10",
  },
};

export default function DigestCard({ item }: { item: DigestItem }) {
  const cfg = IMPORTANCE_CONFIG[item.importance] || IMPORTANCE_CONFIG.medium;
  const safeHref =
    item.sourceLink?.startsWith("http://") || item.sourceLink?.startsWith("https://")
      ? item.sourceLink
      : "#";

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-xl overflow-hidden border border-white/[0.06] bg-[#0d1117] hover:border-white/[0.12] hover:bg-[#111820] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${cfg.glow} hover:shadow-black/40`}
    >
      {/* Importance bar */}
      <div className={`h-[3px] w-full ${cfg.bar}`} />

      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badge}`}>
            {cfg.label}
          </span>
          <span className="text-[10px] text-[#484f58] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">
            {item.category}
          </span>
        </div>

        {/* Headline */}
        <h3 className="font-semibold text-[14px] leading-snug mb-2 text-[#f0f6fc] group-hover:text-white transition-colors line-clamp-2">
          {item.headline}
        </h3>

        {/* Summary */}
        <p className="text-[13px] leading-relaxed text-[#8b949e] mb-3 line-clamp-4">
          {item.summary}
        </p>

        {/* Source */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#484f58]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e5ff00]/30 shrink-0" />
          <span className="truncate">{item.sourceTitle}</span>
        </div>
      </div>
    </a>
  );
}
