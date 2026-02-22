"use client";

const CATEGORIES = ["全部", "综合资讯", "深度分析", "漏洞预警", "威胁情报", "恶意软件", "政府/监管"];

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
          className="px-3 py-1 rounded-full text-sm font-medium transition-all duration-150"
          style={
            active === cat
              ? { background: "#007aff", color: "#fff" }
              : { background: "var(--label-bg)", color: "var(--secondary-text)" }
          }
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
