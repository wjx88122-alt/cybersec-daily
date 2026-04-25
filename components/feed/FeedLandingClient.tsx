"use client";

import { useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import NewsCard from "@/components/NewsCard";
import { SystemIcon, type SystemIconName } from "@/components/ui/SystemIcon";
import { type FeedItem } from "@/lib/feeds";
import { buildFeedLandingState } from "@/lib/feed-view-model.js";

type SummarySection = {
  label: string;
  items: string[];
  intent?: string;
  icon?: SystemIconName;
  priority?: string;
};

type FeedLandingClientProps = {
  items: FeedItem[];
  categories?: string[];
  heroMode?: "static" | "contentSummary";
  digestOverview?: string;
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
  heroMode = "static",
  digestOverview = "",
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
  const landingState = buildFeedLandingState(items, {
    category,
    search,
    digestOverview: heroMode === "contentSummary" ? digestOverview : "",
  });
  const { filtered, heroSummary, isFallback, scopeLabel } = landingState;

  const [hero, ...rest] = filtered;
  const usesContentSummary = heroMode === "contentSummary";
  const heroTitle = usesContentSummary ? heroSummary.title : headline;
  const heroLead = usesContentSummary ? heroSummary.body || lead : lead;
  const heroSections: SummarySection[] = usesContentSummary ? heroSummary.sections ?? [] : [];
  const judgmentLabel = usesContentSummary ? heroSummary.judgmentLabel ?? "专家判断" : "";
  const heroTitleClass = usesContentSummary
    ? "public-summary-title mt-4"
    : "public-display mt-4 max-w-[11ch]";
  const heroLeadClass = usesContentSummary
    ? "public-summary-lead mt-5"
    : "public-lead mt-6 max-w-3xl";
  const displayChips = usesContentSummary
    ? [heroSummary.sourceLabel, ...chips]
    : chips;
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
  const overviewStats = [
    { label: "资讯数量", value: String(filtered.length), icon: "list" as const },
    { label: "信息来源", value: String(sourceCount), icon: "globe" as const },
    { label: "分类覆盖", value: String(categoryCount), icon: "filter" as const },
  ];

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6 lg:px-8">
      <section className="grid gap-6 pb-10 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pb-14 lg:pt-16">
        <div className="reveal-rise">
          <div className="public-eyebrow">{eyebrow}</div>
          {usesContentSummary ? (
            <div className="public-summary-brief mt-5">
              <section className="public-summary-judgment">
                <div className="flex items-center gap-3">
                  <span className="system-icon-badge h-10 min-w-10 w-10 text-blue-700">
                    <SystemIcon className="system-icon" name="spark" size={17} />
                  </span>
                  <div className="public-summary-card-meta">
                    <span>{judgmentLabel}</span>
                    <strong>{heroSummary.sourceLabel}</strong>
                  </div>
                </div>
                <h1 className={heroTitleClass}>{heroTitle}</h1>
                {heroLead && <p className={heroLeadClass}>{heroLead}</p>}
              </section>

              {heroSections.length > 0 && (
                <div className="public-summary-sections">
                  {heroSections.map((section) => (
                    <section
                      key={section.label}
                      className={`public-summary-card is-${section.intent ?? "context"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="system-icon-badge h-9 min-w-9 w-9">
                            <SystemIcon
                              className="system-icon"
                              name={section.icon ?? "list"}
                              size={16}
                            />
                          </span>
                          <div className="public-summary-card-meta">
                            <span>{section.priority ?? "INFO"}</span>
                            <h2>{section.label}</h2>
                          </div>
                        </div>
                        <span className="public-summary-count">
                          {section.items.length} 条
                        </span>
                      </div>
                      <ol>
                        {section.items.map((item, index) => (
                          <li key={item}>
                            <span>{index + 1}</span>
                            <p>{item}</p>
                          </li>
                        ))}
                      </ol>
                    </section>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <h1 className={heroTitleClass}>{heroTitle}</h1>
              {heroLead && <p className={heroLeadClass}>{heroLead}</p>}
            </>
          )}
          <div className="mt-8 flex flex-wrap gap-3 text-[12px] text-slate-600">
            {displayChips.map((chip) => (
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
            {overviewStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {stat.label}
                  </div>
                  <span className="system-icon-badge h-8 min-w-8 w-8 text-slate-600">
                    <SystemIcon className="system-icon" name={stat.icon} size={15} />
                  </span>
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <SystemIcon className="system-icon text-slate-500" name="workflow" size={14} />
              浏览方式
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-600">{browseHint}</p>
            {latestStamp && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-slate-500">
                <SystemIcon className="system-icon" name="clock" size={13} />
                最近一条更新于 {latestStamp}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="public-panel reveal-rise delay-2 rounded-[30px] p-4 sm:p-5">
        <div className={`public-state-banner ${isFallback ? "fallback" : "live"}`}>
          <div className="flex items-start gap-3">
            <span className="system-icon-badge mt-1 h-9 min-w-9 w-9">
              <SystemIcon
                className="system-icon"
                name={isFallback ? "refresh" : "activity"}
                size={16}
              />
            </span>
            <div>
            <div className="public-section-label">当前展示范围</div>
            <p>
              {isFallback
                ? "近 24 小时暂无新增，已自动切换为最近可用内容，避免首页出现“空站”感。"
                : "优先展示过去 24 小时内的最新内容，让首屏先给你可执行的扫描视角。"}
            </p>
            </div>
          </div>
          <strong>{scopeLabel}</strong>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative">
            <SystemIcon
              className="system-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              name="search"
              size={16}
            />
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
        <div className="public-empty py-24 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
            <SystemIcon className="system-icon" name="search" size={20} />
          </div>
          <div className="public-section-label">暂无可展示内容</div>
          <p className="mt-3 text-base font-medium text-slate-900">
            {search.trim() || category !== "全部" ? "当前筛选下没有匹配内容" : emptyMessage}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            {search.trim() || category !== "全部"
              ? "可以清空搜索词，或切回“全部”查看最近可用的安全资讯。"
              : "数据源暂时没有符合条件的内容时，页面会在下次刷新后自动恢复。"}
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <section className="mt-12">
          <div className="mb-5 reveal-rise delay-2">
            <div className="public-section-label">{briefLabel}</div>
            <p className="mt-3 text-sm text-slate-600">
              {briefDescription}
              {" · "}
              <span className="font-semibold text-slate-950">{scopeLabel}</span>
              {" · "}
              <span className="font-semibold text-slate-950">{filtered.length}</span> 条资讯。
            </p>
            {isFallback && (
              <p className="mt-2 text-[13px] leading-6 text-slate-500">
                暂无 24 小时内新增内容时，优先保留最近仍值得浏览的条目，避免用户把空状态误判为站点异常。
              </p>
            )}
          </div>

          {hero && (
            <div className="mb-8">
              <NewsCard item={hero} hero />
            </div>
          )}

          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="public-section-label inline-flex items-center gap-2">
                <SystemIcon className="system-icon" name="list" size={14} />
                {listLabel}
              </div>
              <p className="mt-2 text-sm text-slate-600">{listDescription}</p>
            </div>
            <div className="hidden items-center gap-1.5 text-[12px] text-slate-500 md:flex">
              <SystemIcon className="system-icon" name="clock" size={13} />
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
  );
}
