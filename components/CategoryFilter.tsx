"use client";

const SEC_CATEGORIES = ["全部", "综合资讯", "深度分析", "漏洞预警", "威胁情报", "恶意软件", "政府/监管"];
const AI_CATEGORIES = ["全部", "AI 产品", "AI 研究", "AI 商业", "AI 开发", "AI 政策", "AI 洞察"];

const CATEGORY_ACTIVE: Record<string, string> = {
  全部: "bg-[#e5ff00]/10 text-[#e5ff00] border-[#e5ff00]/30",
  综合资讯: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  深度分析: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  漏洞预警: "bg-red-500/15 text-red-300 border-red-500/30",
  威胁情报: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  恶意软件: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  "政府/监管": "bg-green-500/15 text-green-300 border-green-500/30",
  "AI 产品": "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  "AI 研究": "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  "AI 商业": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "AI 开发": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "AI 政策": "bg-slate-500/15 text-slate-300 border-slate-500/30",
  "AI 洞察": "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
};

export { SEC_CATEGORIES, AI_CATEGORIES };

export default function CategoryFilter({
  active,
  onChange,
  categories,
}: {
  active: string;
  onChange: (cat: string) => void;
  categories?: string[];
}) {
  const cats = categories ?? SEC_CATEGORIES;
  return (
    <div className="flex gap-2 flex-wrap">
      {cats.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-all duration-150 ${
            active === cat
              ? CATEGORY_ACTIVE[cat] ?? "bg-[#e5ff00]/10 text-[#e5ff00] border-[#e5ff00]/30"
              : "bg-white/[0.04] text-[#6e7681] border-white/[0.06] hover:bg-white/[0.08] hover:text-[#8b949e] hover:border-white/[0.1]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
