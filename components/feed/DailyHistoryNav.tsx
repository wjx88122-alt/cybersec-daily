"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { SystemIcon } from "@/components/ui/SystemIcon";

type HistoryItem = { date: string; headline: string };

type MonthGroup = {
  key: string; // "2026-6"
  label: string; // "2026 年 6 月"
  days: HistoryItem[];
};

/** 把日期列表按月份分组（倒序），对齐 AI HOT 的折叠式日历导航。 */
function groupByMonth(history: HistoryItem[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();
  for (const item of history) {
    const [y, m] = item.date.split("-");
    const key = `${y}-${Number(m)}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: `${y} 年 ${Number(m)} 月`,
        days: [],
      });
    }
    map.get(key)!.days.push(item);
  }
  return [...map.values()].sort((a, b) => b.key.localeCompare(a.key));
}

export default function DailyHistoryNav({
  history,
  currentDate,
}: {
  history: HistoryItem[];
  currentDate: string;
}) {
  const pathname = usePathname();
  const months = useMemo(() => groupByMonth(history), [history]);
  // 第一个月默认展开
  const [openMonth, setOpenMonth] = useState<string | null>(
    months[0]?.key ?? null,
  );

  const latest = history[0];

  return (
    <nav aria-label="日报历史" className="flex flex-col gap-4">
      {/* 最新一期 */}
      {latest && (
        <Link
          href="/daily"
          className={`block rounded-lg px-3 py-2 transition-colors ${
            pathname === "/daily"
              ? "bg-slate-900/5 dark:bg-slate-100/10"
              : "hover:bg-slate-900/5 dark:hover:bg-slate-100/5"
          }`}
        >
          <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
            最新一期
          </div>
          <div className="text-[11.5px] text-slate-400 dark:text-slate-500">
            {latest.date}
          </div>
        </Link>
      )}

      {/* 月份折叠组 */}
      <div className="flex flex-col gap-3">
        {months.map((month) => {
          const open = openMonth === month.key;
          return (
            <div key={month.key}>
              <button
                type="button"
                onClick={() => setOpenMonth(open ? null : month.key)}
                className="flex w-full items-center gap-1 px-3 py-1 text-left text-[12.5px] font-semibold text-slate-600 dark:text-slate-300"
              >
                <SystemIcon
                  name="arrowRight"
                  size={11}
                  className={`system-icon text-slate-400 transition-transform ${
                    open ? "rotate-90" : ""
                  }`}
                />
                {month.label}
              </button>
              {open && (
                <ul className="mt-1 flex flex-col">
                  {month.days.map((day) => {
                    const dayNum = Number(day.date.split("-")[2]);
                    const active = day.date === currentDate;
                    return (
                      <li key={day.date}>
                        <Link
                          href={`/daily/${day.date}`}
                          className={`flex items-start gap-2 rounded-lg px-3 py-1.5 transition-colors ${
                            active
                              ? "bg-slate-900/5 dark:bg-slate-100/10"
                              : "hover:bg-slate-900/5 dark:hover:bg-slate-100/5"
                          }`}
                        >
                          <span className="mt-0.5 w-8 shrink-0 text-[11.5px] tabular-nums text-slate-400 dark:text-slate-500">
                            {dayNum} 日
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                            {day.headline}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
