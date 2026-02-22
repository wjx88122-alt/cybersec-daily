import { DigestItem } from "@/lib/digest";

const IMPORTANCE_CONFIG = {
  critical: {
    label: "严重",
    color: "bg-red-500/20 text-red-300 border-red-500/40",
    dot: "bg-red-400",
  },
  high: {
    label: "高危",
    color: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    dot: "bg-orange-400",
  },
  medium: {
    label: "中等",
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    dot: "bg-yellow-400",
  },
};

export default function DigestCard({ item }: { item: DigestItem }) {
  const cfg = IMPORTANCE_CONFIG[item.importance] || IMPORTANCE_CONFIG.medium;

  return (
    <a
      href={item.sourceLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 hover:bg-gray-800/60 transition-all duration-200 group"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        <span className="text-xs text-gray-500">{item.category}</span>
      </div>
      <h3 className="text-white font-semibold text-base mb-2 group-hover:text-blue-400 transition-colors">
        {item.headline}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-3">
        {item.summary}
      </p>
      <p className="text-gray-600 text-xs truncate group-hover:text-gray-500 transition-colors">
        {item.sourceTitle}
      </p>
    </a>
  );
}
