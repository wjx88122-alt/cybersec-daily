"use client";

import { useEffect, useState } from "react";
import { FeedItem, CUTOFF_MS } from "@/lib/feeds";
import NewsCard from "@/components/NewsCard";
import CategoryFilter, { AI_CATEGORIES } from "@/components/CategoryFilter";
import NavBar from "@/components/NavBar";

export default function AIPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("全部");
  const [search, setSearch] = useState("");
  const [cutoff] = useState(() => Date.now() - CUTOFF_MS);

  useEffect(() => {
    fetch("/api/feed-ai")
      .then((r) => r.json())
      .then((data) => {
        const all = data.items || [];
        all.sort((a: FeedItem, b: FeedItem) => {
          const ta = new Date(a.pubDate).getTime();
          const tb = new Date(b.pubDate).getTime();
          return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
        });
        setItems(all);
      })
      .catch(() => setError("加载失败，请稍后刷新重试"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    const t = new Date(item.pubDate).getTime();
    const matchTime = !isNaN(t) && t >= cutoff;
    const matchCat = category === "全部" || item.category === category;
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.titleZh || "").toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      (item.summaryZh || "").toLowerCase().includes(search.toLowerCase());
    return matchTime && matchCat && matchSearch;
  });

  const [hero, ...rest] = filtered;
  const sourceCount = new Set(filtered.map((item) => item.source)).size;
  const categoryCount = new Set(filtered.map((item) => item.category)).size;
  const latestStamp = hero?.pubDate
    ? new Date(hero.pubDate).toLocaleString("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="public-shell min-h-screen">
      <NavBar active="AI" />

      <main className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6 lg:px-8">
        <section className="grid gap-6 pb-10 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pb-14 lg:pt-16">
          <div className="reveal-rise">
            <div className="public-eyebrow">AI Watch</div>
            <h1 className="public-display mt-4 max-w-[11ch]">
              把 AI 赛道里真正影响产品与战略的变化，排进同一个视野。
            </h1>
            <p className="public-lead mt-6 max-w-2xl">
              聚焦 AI 产品、研究、商业、开发与政策变化，保留原有信息主线，
              但把阅读节奏压成更清楚的层级和更自然的浏览路径。
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-[12px] text-slate-600">
              <span className="rounded-full border border-slate-200 bg-white/75 px-4 py-2 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
                过去 24 小时 AI 更新
              </span>
              <span className="rounded-full border border-slate-200 bg-white/75 px-4 py-2 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
                产品、研究、商业并行浏览
              </span>
            </div>
          </div>

          <div className="public-panel-strong reveal-rise delay-1 rounded-[32px] p-6 sm:p-7">
            <div className="public-section-label">AI Snapshot</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                { label: "资讯数量", value: String(filtered.length) },
                { label: "信息来源", value: String(sourceCount) },
                { label: "分类覆盖", value: String(categoryCount) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {stat.label}
                  </div>
                  <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                浏览方式
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                如果你关心产品和商业，先看焦点卡片；如果你关心模型与工程变化，再用分类筛出研究与开发。
              </p>
              {latestStamp && (
                <p className="mt-3 text-[12px] text-slate-500">
                  最近一条更新于 {latestStamp}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="public-panel reveal-rise delay-2 rounded-[30px] p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="搜索 AI 产品、模型、政策或公司"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="public-input w-full rounded-full py-3 pl-11 pr-4 text-sm"
              />
            </div>
            <div className="overflow-x-auto pb-1">
              <CategoryFilter
                active={category}
                onChange={setCategory}
                categories={AI_CATEGORIES}
              />
            </div>
          </div>
        </section>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
              <div className="absolute inset-0 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-slate-500">正在抓取最新 AI 资讯...</p>
          </div>
        )}

        {error && (
          <div className="py-32 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-sm text-slate-500">近 24 小时暂无新增 AI 资讯</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 reveal-rise delay-2">
              <div className="public-section-label">Today’s Focus</div>
              <p className="mt-3 text-sm text-slate-600">
                近 24 小时 <span className="font-semibold text-slate-950">{filtered.length}</span> 条 AI 资讯，
                保留原有内容，只把阅读体验压得更干净、更接近品牌页面。
              </p>
            </div>

            {hero && (
              <div className="mb-8">
                <NewsCard item={hero} hero />
              </div>
            )}

            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <div className="public-section-label">More Stories</div>
                <p className="mt-2 text-sm text-slate-600">
                  从产品到政策，继续用同一套清晰的节奏往下看。
                </p>
              </div>
              <div className="hidden text-[12px] text-slate-500 md:block">
                按时间倒序排列
              </div>
            </div>

            <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((item, index) => (
                <div
                  key={item.id}
                  className={index < 3 ? "delay-1" : index < 6 ? "delay-2" : "delay-3"}
                >
                  <NewsCard item={item} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
