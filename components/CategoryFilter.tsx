"use client";

const CATEGORIES = ["全部", "综合", "深度分析", "漏洞预警"];

export default function CategoryFilter({
  active,
  onChange,
}: {
  active: string;
  onChange: (cat: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
            active === cat
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
