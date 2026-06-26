import Link from "next/link";
import type { HotItem } from "@/lib/hot-rank";
import { hotItemTitle } from "@/lib/hot-page-data";
import DailyHistoryNav from "./DailyHistoryNav";
import type { DailyPageData } from "@/lib/hot-page-data";

export function formatDateLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${y} 年 ${m} 月 ${d} 日`;
}

/** 日报正文区（不含 HotShell），/daily 与 /daily/[date] 共用。 */
export default function DailyContent({ data }: { data: DailyPageData }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-0 px-5 py-8 sm:px-8 lg:grid-cols-[260px_1fr] lg:gap-8">
      {/* 左侧历史导航 */}
      <aside className="mb-8 lg:sticky lg:top-8 lg:mb-0 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:pr-2">
        <DailyHistoryNav history={data.history} currentDate={data.date} />
      </aside>

      {/* 右侧日报正文 */}
      <main className="min-w-0">
        <header className="mb-6">
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            安全日报
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            {formatDateLabel(data.date)}
          </h1>
        </header>

        {data.overview && (
          <section className="mb-8 rounded-xl border border-slate-200/70 bg-white/60 p-5 dark:border-slate-800/70 dark:bg-slate-900/40">
            <h2 className="mb-2 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
              今日综述
            </h2>
            <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
              {data.overview}
            </p>
          </section>
        )}

        {data.items.length > 0 ? (
          <section>
            <h2 className="mb-3 text-[14px] font-semibold text-slate-900 dark:text-slate-100">
              重点条目
            </h2>
            <ol className="space-y-2">
              {data.items.map((item: HotItem, idx: number) => (
                <li key={item.id}>
                  <Link
                    href={`/items/${item.id}`}
                    className="group flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-4 py-3 transition-all hover:border-slate-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:border-slate-800/70 dark:bg-slate-900/40 dark:hover:border-slate-700"
                  >
                    <span className="mt-0.5 w-5 shrink-0 text-[14px] font-bold tabular-nums text-slate-300 dark:text-slate-600">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-semibold leading-snug text-slate-900 transition-colors group-hover:text-slate-700 dark:text-slate-100 dark:group-hover:text-white">
                        {hotItemTitle(item)}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11.5px] text-slate-400 dark:text-slate-500">
                        <span>{item.source}</span>
                        {item.coverageCount > 1 && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {item.coverageCount} 个信源
                            </span>
                          </>
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/40 px-6 py-16 text-center text-[14px] text-slate-500 dark:border-slate-700 dark:bg-slate-900/30">
            {data.date} 暂无日报数据
          </div>
        )}
      </main>
    </div>
  );
}
