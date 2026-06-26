"use client";

import { useTheme, type Theme } from "./ThemeProvider";
import { SystemIcon } from "@/components/ui/SystemIcon";

const OPTIONS: Array<{ key: Theme; label: string; icon: "spark" | "eye" | "globe" }> = [
  { key: "dark", label: "深色", icon: "spark" },
  { key: "system", label: "跟随系统", icon: "eye" },
  { key: "light", label: "浅色", icon: "globe" },
];

/**
 * 三态主题单选组（深色 / 跟随系统 / 浅色）。
 * 对齐 AI HOT sidebar 底部的 radiogroup 样式。
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="主题"
      className="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-100/80 p-0.5 dark:border-slate-700 dark:bg-slate-800/80"
    >
      {OPTIONS.map((opt) => {
        const active = theme === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => setTheme(opt.key)}
            className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-[11px] font-medium transition-colors ${
              active
                ? "bg-white text-slate-900 shadow-[0_4px_12px_rgba(15,23,42,0.1)] dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <SystemIcon name={opt.icon} size={13} className="system-icon" />
            <span className="ml-1 hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
