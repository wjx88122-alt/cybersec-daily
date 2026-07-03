import { SystemIcon } from "@/components/ui/SystemIcon";
import { DigestItem } from "@/lib/digest";
import { resolveSafeExternalHref } from "@/lib/remote-url";

const IMPORTANCE_CONFIG = {
  critical: {
    label: "优先布局",
    bar: "from-indigo-500 to-blue-400",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
    accent: "text-indigo-600",
    border: "hover:border-indigo-200",
    glow: "hover:shadow-[0_26px_70px_rgba(79,70,229,0.10)]",
  },
  high: {
    label: "重点评估",
    bar: "from-teal-500 to-cyan-400",
    badge: "bg-teal-50 text-teal-700 border-teal-100",
    accent: "text-teal-600",
    border: "hover:border-teal-200",
    glow: "hover:shadow-[0_26px_70px_rgba(20,184,166,0.10)]",
  },
  medium: {
    label: "持续观察",
    bar: "from-slate-500 to-slate-400",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    accent: "text-slate-600",
    border: "hover:border-slate-300",
    glow: "hover:shadow-[0_26px_70px_rgba(15,23,42,0.08)]",
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
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badge}`}
          >
            <SystemIcon className="system-icon" name="alert" size={12} />
            {cfg.label}
          </span>
          {item.opportunityType && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">
              <SystemIcon className="system-icon shrink-0" name="spark" size={12} />
              {item.opportunityType}
            </span>
          )}
          <span className="inline-flex max-w-[140px] items-center gap-1.5 truncate rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">
            <SystemIcon className="system-icon shrink-0" name="filter" size={12} />
            {item.category}
          </span>
          {item.segment && (
            <span className="inline-flex max-w-[140px] items-center gap-1.5 truncate rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500">
              <SystemIcon className="system-icon shrink-0" name="chart" size={12} />
              {item.segment}
            </span>
          )}
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
        {item.action && (
          <div className="mt-3 flex items-start gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-[12px] leading-5 text-slate-600">
            <SystemIcon className={`system-icon mt-0.5 shrink-0 ${cfg.accent}`} name="check" size={13} />
            <span>
              <strong className="font-semibold text-slate-800">建议动作：</strong>{item.action}
            </span>
          </div>
        )}

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
