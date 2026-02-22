import { DigestItem } from "@/lib/digest";

const IMPORTANCE_CONFIG = {
  critical: { label: "严重", bar: "bg-red-500", text: "text-red-400" },
  high: { label: "高危", bar: "bg-orange-500", text: "text-orange-400" },
  medium: { label: "中等", bar: "bg-yellow-500", text: "text-yellow-400" },
};

export default function DigestCard({ item }: { item: DigestItem }) {
  const cfg = IMPORTANCE_CONFIG[item.importance] || IMPORTANCE_CONFIG.medium;

  return (
    <a
      href={item.sourceLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#1a1a1a] hover:bg-[#222] transition-colors overflow-hidden"
    >
      <div className={`h-1 w-full ${cfg.bar}`} />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[11px] font-bold uppercase tracking-wide ${cfg.text}`}>
            {cfg.label}
          </span>
          <span className="text-[11px] text-[#555]">·</span>
          <span className="text-[11px] text-[#555]">{item.category}</span>
        </div>
        <h3 className="font-bold text-[15px] leading-snug mb-2 text-white">
          {item.headline}
        </h3>
        <p className="text-sm leading-relaxed text-[#999] mb-3 line-clamp-6">
          {item.summary}
        </p>
        <p className="text-xs text-[#555] truncate">{item.sourceTitle}</p>
      </div>
    </a>
  );
}
