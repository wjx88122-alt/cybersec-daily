"use client";

import { useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import NewsCard from "@/components/NewsCard";
import { FeedItem, CUTOFF_MS } from "@/lib/feeds";
import { matchesFeedSearch } from "@/lib/feed-search";

type FeedLandingClientProps = {
  items: FeedItem[];
  categories?: string[];
  eyebrow: string;
  headline: string;
  lead: string;
  chips: string[];
  overviewTitle: string;
  browseHint: string;
  searchPlaceholder: string;
  emptyMessage: string;
  briefLabel: string;
  briefDescription: string;
  listLabel: string;
  listDescription: string;
};

export default function FeedLandingClient({
  items,
  categories,
  eyebrow,
  headline,
  lead,
  chips,
  overviewTitle,
  browseHint,
  searchPlaceholder,
  emptyMessage,
  briefLabel,
  briefDescription,
  listLabel,
  listDescription,
}: FeedLandingClientProps) {
  const [category, setCategory] = useState("全部");
  const [search, setSearch] = useState("");
  const [cutoff] = useState(() => Date.now() - CUTOFF_MS);

  const filtered = items.filter((item) => {
    const t = new Date(item.pubDate).getTime();
    const matchTime = !Number.isNaN(t) && t >= cutoff;
    const matchCat = category === "全部" || item.category === category;
    const matchSearch = matchesFeedSearch(item, search);
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
    <main className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6 lg:px-8">
      <section className="grid gap-6 pb-10 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pb-14 lg:pt-16">
        <div className="reveal-rise">
          <div className="public-eyebrow">{eyebrow}</div>
          <h1 className="public-display mt-4 max-w-[11ch]">{headline}</h1>
          <p className="public-lead mt-6 max-w-2xl">{lead}</p>
          <div className="mt-8 flex flex-wrap gap-3 text-[12px] text-slate-600">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-slate-200 bg-white/75 px-4 py-2 shadow-[0_10px_26px_rgba(15,23,42,0.04)]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="public-panel-strong reveal-rise delay-1 rounded-[32px] p-6 sm:p-7">
          <div className="public-section-label">{overviewTitle}</div>
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
            <p className="mt-2 text-sm leading-7 text-slate-600">{browseHint}</p>
            {latestStamp && (
              <p className="mt-3 text-[12px] text-slate-500">最近一条更新于 {latestStamp}</p>
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
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="public-input w-full rounded-full py-3 pl-11 pr-4 text-sm"
            />
          </div>
          <div className="overflow-x-auto pb-1">
            <CategoryFilter
              active={category}
              onChange={setCategory}
              categories={categories}
            />
          </div>
        </div>
      </section>

      {filtered.length === 0 && (
        <div className="py-32 text-center">
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        </div>
      )}

      {filtered.length > 0 && (
        <section className="mt-12">
          <div className="mb-5 reveal-rise delay-2">
            <div className="public-section-label">{briefLabel}</div>
            <p className="mt-3 text-sm text-slate-600">
              {briefDescription}{" "}
              <span className="font-semibold text-slate-950">{filtered.length}</span> 条资讯。
            </p>
          </div>

          {hero && (
            <div className="mb-8">
              <NewsCard item={hero} hero />
            </div>
          )}

          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="public-section-label">{listLabel}</div>
              <p className="mt-2 text-sm text-slate-600">{listDescription}</p>
            </div>
            <div className="hidden text-[12px] text-slate-500 md:block">按时间倒序排列</div>
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
  );
}
