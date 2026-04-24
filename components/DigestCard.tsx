import { SystemIcon } from "@/components/ui/SystemIcon";
import { DigestItem } from "@/lib/digest";
import { resolveSafeExternalHref } from "@/lib/remote-url";

const IMPORTANCE_CONFIG = {
  critical: {
    label: "严重",
    bar: "from-red-500 to-rose-400",
    badge: "bg-red-50 text-red-700 border-red-100",
    accent: "text-red-600",
    border: "hover:border-red-200",
    glow: "hover:shadow-[0_26px_70px_rgba(239,68,68,0.08)]",
  },
  high: {
    label: "高危",
    bar: "from-orange-500 to-amber-400",
    badge: "bg-orange-50 text-orange-700 border-orange-100",
    accent: "text-orange-600",
    border: "hover:border-orange-200",
    glow: "hover:shadow-[0_26px_70px_rgba(249,115,22,0.08)]",
  },
  medium: {
    label: "中等",
    bar: "from-yellow-500 to-yellow-400",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-100",
    accent: "text-yellow-600",
    border: "hover:border-yellow-200",
    glow: "hover:shadow-[0_26px_70px_rgba(234,179,8,0.08)]",
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
  const safeHref = resolveSafeExternalHref(item.sourceLink);

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`group public-panel relative flex flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/88 transition-all duration-300 hover:-translate-y-1 ${cfg.border} ${cfg.glow}`}
    >
      {/* Top gradient bar */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${cfg.bar} shrink-0`} />

      <div className={`flex flex-col flex-1 ${featured ? "p-5" : "p-4"}`}>
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badge}`}
          >
            <SystemIcon className="system-icon" name="alert" size={12} />
            {cfg.label}
          </span>
          <span className="inline-flex max-w-[140px] items-center gap-1.5 truncate rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">
            <SystemIcon className="system-icon shrink-0" name="filter" size={12} />
            {item.category}
          </span>
        </div>

        {/* Headline */}
        <h3
          className={`mb-2.5 font-semibold leading-snug text-slate-950 transition-colors group-hover:text-slate-800 ${featured ? "text-[18px]" : "text-[15px]"}`}
        >
          {item.headline}
        </h3>

        {/* Summary */}
        <p
          className={`flex-1 leading-relaxed text-slate-600 ${featured ? "text-[14px] line-clamp-5" : "text-[13px] line-clamp-3"}`}
        >
          {item.summary}
        </p>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-200/80 pt-3">
          <span className="inline-flex max-w-[80%] items-center gap-1.5 truncate text-[11px] text-slate-500">
            <SystemIcon className="system-icon shrink-0" name="globe" size={13} />
            {item.sourceTitle}
          </span>
          <SystemIcon
            className={`system-icon shrink-0 ${cfg.accent} opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100`}
            name="external"
            size={14}
          />
        </div>
      </div>
    </a>
  );
}
