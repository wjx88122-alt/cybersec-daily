"use client";

import Link from "next/link";
import { useState } from "react";
import { ARCHIVE_STATUS_LABELS, ROLE_NAME_MAP } from "./data";
import type { DecisionArchiveEntry } from "./data";

function DecisionArchiveStackCard({ entry }: { entry: DecisionArchiveEntry }) {
  return (
    <article className="team-card team-card-strong rounded-[32px] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
              {entry.archiveNo}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
              {entry.date}
            </span>
            <span className="team-accent-surface rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-900">
              {ARCHIVE_STATUS_LABELS[entry.status]}
            </span>
          </div>
          <h3 className="mt-4 max-w-4xl text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
            {entry.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">提问时间：{entry.askedAt}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {entry.roles.map((roleId) => (
            <span
              key={roleId}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500"
            >
              {ROLE_NAME_MAP[roleId]}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
        <div className="team-soft-surface rounded-[22px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            你的问题
          </p>
          <p className="mt-3 text-base font-semibold leading-8 text-slate-950">{entry.question}</p>
        </div>

        <div className="team-accent-surface rounded-[22px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            团队回答
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-900">{entry.answer}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.04fr_0.96fr]">
        <div className="team-deep-surface rounded-[22px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            公开决策过程
          </p>
          <ol className="mt-3 space-y-3">
            {entry.publicProcess.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-500">
                  {index + 1}
                </span>
                <span className="text-sm leading-7 text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="team-accent-surface rounded-[22px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            结果 / 后续动作
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-900">{entry.result}</p>
          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              最终采用版本
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{entry.adoptedVersion}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="team-soft-surface rounded-[22px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            任务分解
          </p>
          <div className="mt-3 space-y-3">
            {entry.decomposition.map((item, index) => (
              <div key={item.title} className="team-deep-surface rounded-[18px] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-500">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold leading-7 text-slate-950">{item.title}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                    {ROLE_NAME_MAP[item.owner]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="team-soft-surface rounded-[22px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            角色执行
          </p>
          <div className="mt-3 space-y-3">
            {entry.execution.map((item) => (
              <div key={`${item.role}-${item.task}`} className="team-deep-surface rounded-[18px] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">
                    {ROLE_NAME_MAP[item.role]}
                  </span>
                  <p className="text-sm font-semibold leading-7 text-slate-950">{item.task}</p>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.output}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="team-deep-surface rounded-[22px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            最终汇总
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{entry.synthesis}</p>
        </div>

        <div className="team-soft-surface rounded-[22px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            关联页面 / 标签 / 里程碑
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.relatedPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
              >
                {page.label}
              </Link>
            ))}
            {entry.relatedMilestones.map((item) => (
              <span
                key={item}
                className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-slate-700"
              >
                {item}
              </span>
            ))}
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
        <p className="text-sm leading-6 text-slate-500">
          当前只显示一张档案卡片，切换编号即可查看下一条。
        </p>
        <Link
          href={`/team/decisions/${entry.archiveNo}`}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:text-slate-700"
        >
          查看详情
        </Link>
      </div>
    </article>
  );
}

export default function DecisionArchiveDeck({ entries }: { entries: DecisionArchiveEntry[] }) {
  const [activeId, setActiveId] = useState(entries[0]?.id ?? "");
  const activeEntry = entries.find((entry) => entry.id === activeId) ?? entries[0];

  if (!activeEntry) return null;

  const activeIndex = entries.findIndex((entry) => entry.id === activeEntry.id);
  const nextEntry = entries.length > 1 ? entries[(activeIndex + 1) % entries.length] : null;
  const laterEntry = entries.length > 2 ? entries[(activeIndex + 2) % entries.length] : null;

  return (
    <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)] xl:items-start">
      <aside className="team-card rounded-[28px] p-4 sm:p-5 xl:sticky xl:top-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Archive Index
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">按编号切换归档卡片</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          不再把所有结果顺序摊开；当前只聚焦一条，剩余条目以卡片层叠的方式留在后面。
        </p>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible">
          {entries.map((entry, index) => {
            const isActive = entry.id === activeEntry.id;

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setActiveId(entry.id)}
                aria-pressed={isActive}
                className={`min-w-[240px] rounded-[24px] border px-4 py-4 text-left transition-all xl:min-w-0 ${
                  isActive
                    ? "border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.08)]"
                    : "border-transparent bg-slate-50/76 hover:border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      isActive
                        ? "border border-slate-200 bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {entry.archiveNo}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-950">{entry.title}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{entry.question}</p>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="relative pt-8">
        {laterEntry ? (
          <div className="pointer-events-none absolute inset-x-8 top-7 hidden rounded-[32px] border border-slate-200/60 bg-white/55 shadow-[0_16px_50px_rgba(15,23,42,0.04)] sm:block">
            <div className="flex justify-end p-5">
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-400">
                {laterEntry.archiveNo}
              </span>
            </div>
          </div>
        ) : null}

        {nextEntry ? (
          <div className="pointer-events-none absolute inset-x-4 top-3 hidden rounded-[32px] border border-slate-200/80 bg-white/72 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:block">
            <div className="flex justify-end p-5">
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-400">
                {nextEntry.archiveNo}
              </span>
            </div>
          </div>
        ) : null}

        <div key={activeEntry.id} className="relative z-10 reveal-rise">
          <DecisionArchiveStackCard entry={activeEntry} />
        </div>
      </div>
    </div>
  );
}
