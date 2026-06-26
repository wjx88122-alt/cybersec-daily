"use client";

import { SystemIcon, type SystemIconName } from "@/components/ui/SystemIcon";

const SEC_CATEGORIES = ["全部", "综合资讯", "深度分析", "漏洞预警", "威胁情报", "恶意软件", "政府/监管"];
const AI_CATEGORIES = ["全部", "AI 红队与攻击", "AI 对抗与鲁棒", "AI 提示注入", "AI 治理与标准", "AI 隐私与数据", "AI 安全"];

const CATEGORY_ACTIVE: Record<string, string> = {
  全部: "bg-slate-900 text-white border-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.12)]",
  综合资讯: "bg-blue-50 text-blue-700 border-blue-100",
  深度分析: "bg-violet-50 text-violet-700 border-violet-100",
  漏洞预警: "bg-red-50 text-red-700 border-red-100",
  威胁情报: "bg-orange-50 text-orange-700 border-orange-100",
  恶意软件: "bg-pink-50 text-pink-700 border-pink-100",
  "政府/监管": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "AI 红队与攻击": "bg-red-50 text-red-700 border-red-100",
  "AI 对抗与鲁棒": "bg-orange-50 text-orange-700 border-orange-100",
  "AI 提示注入": "bg-pink-50 text-pink-700 border-pink-100",
  "AI 治理与标准": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "AI 隐私与数据": "bg-violet-50 text-violet-700 border-violet-100",
  "AI 安全": "bg-slate-100 text-slate-700 border-slate-200",
};

const CATEGORY_ICON: Record<string, SystemIconName> = {
  全部: "list",
  综合资讯: "globe",
  深度分析: "search",
  漏洞预警: "alert",
  威胁情报: "target",
  恶意软件: "shield",
  "政府/监管": "briefcase",
  "AI 红队与攻击": "alert",
  "AI 对抗与鲁棒": "shield",
  "AI 提示注入": "target",
  "AI 治理与标准": "file",
  "AI 隐私与数据": "lock",
  "AI 安全": "spark",
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
          className={`system-control inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-200 ${
            active === cat
              ? CATEGORY_ACTIVE[cat] ?? "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/30"
              : `system-pill bg-white/78 text-slate-500 border-slate-200 hover:bg-white hover:text-slate-900 hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]`
          }`}
        >
          <SystemIcon className="system-icon" name={CATEGORY_ICON[cat] ?? "filter"} size={13} />
          {cat}
        </button>
      ))}
    </div>
  );
}
