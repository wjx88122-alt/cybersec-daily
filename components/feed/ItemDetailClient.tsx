"use client";

import { useState } from "react";
import Link from "next/link";
import { SystemIcon } from "@/components/ui/SystemIcon";
import type { HotItem } from "@/lib/hot-rank";
import {
  pickDisplayTitle,
  pickLocalizedField,
} from "@/lib/translation-detection";

type Props = {
  item: HotItem;
  siblings: HotItem[];
};

/** 从 URL 提取域名（用于原文 chip 显示）。 */
function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 从信源名里解析 @handle。 */
function parseHandle(source: string): string | null {
  const m = source.match(/(@[\w.]+)/);
  return m ? m[1] : null;
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11.5px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </span>
  );
}

function extraTag(item: HotItem): string | null {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  if (/cve-\d{4}-\d+/i.test(text)) {
    return (text.match(/cve-\d{4}-\d+/i) || [])[0]?.toUpperCase() ?? null;
  }
  if (/ransomware|勒索/.test(text)) return "勒索软件";
  if (/zero[- ]?day|0[- ]?day|在野利用/.test(text)) return "零日漏洞";
  if (/apt/.test(text)) return "APT";
  return null;
}

function formatFull(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    });
  } catch {
    return iso;
  }
}

function formatTimeAgo(pubDate: string): string {
  try {
    const diff = Math.max(0, Date.now() - new Date(pubDate).getTime());
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} 天前`;
    return formatFull(pubDate);
  } catch {
    return pubDate;
  }
}

export default function ItemDetailClient({ item, siblings }: Props) {
  const [showOriginal, setShowOriginal] = useState(false);
  const handle = parseHandle(item.source);
  const domain = domainOf(item.link);

  // 中文翻译态 vs 英文原文态
  const zhTitle =
    pickLocalizedField({
      source: item.title,
      candidate: item.titleZh,
      existing: item.title,
    }) || item.titleZh || item.title;
  const zhSummary =
    pickLocalizedField({
      source: item.summary,
      candidate: item.summaryZh,
      existing: item.summaryAi,
    }) || item.summaryAi || item.summary;

  const hasTranslation =
    !!item.titleZh || !!item.summaryZh || !!item.summaryAi;

  return (
    <article className="mx-auto max-w-[720px] px-5 pb-20 pt-6 sm:px-8">
      {/* 返回 */}
      <Link
        href="/hot"
        className="mb-6 inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <SystemIcon name="arrowRight" size={14} className="system-icon rotate-180" />
        返回
      </Link>

      {/* 信源行 */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[13.5px] font-medium text-slate-700 dark:text-slate-200">
          {item.source}
        </span>
        {handle && (
          <span className="text-[12px] text-slate-400 dark:text-slate-500">
            · {handle}
          </span>
        )}
        <span
          aria-label="AI 推荐分"
          className="ml-auto inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[12px] font-bold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {Math.round(item.score)}
        </span>
      </div>

      {/* 标题 */}
      <h1 className="text-[22px] font-semibold leading-snug text-slate-950 dark:text-slate-50">
        {showOriginal ? item.title : zhTitle}
      </h1>

      {/* 元信息 */}
      <div className="mt-2 flex items-center gap-2 text-[12.5px] text-slate-400 dark:text-slate-500">
        <span>{formatFull(item.pubDate)}</span>
        <span>·</span>
        <span>{formatTimeAgo(item.pubDate)}</span>
      </div>

      {/* 原文 chip */}
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
      >
        <SystemIcon name="globe" size={13} className="system-icon" />
        在原文查看
        <span className="text-slate-400 dark:text-slate-500">· {domain}</span>
      </a>

      {/* AI 摘要 */}
      {item.summaryAi && (
        <section className="mt-6">
          <h2 className="mb-2 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
            AI 摘要
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
            {item.summaryAi}
          </p>
        </section>
      )}

      {/* AI 翻译 / 原文 */}
      {hasTranslation && (
        <section className="mt-6 rounded-xl border border-slate-200/70 bg-white/50 p-4 dark:border-slate-800/70 dark:bg-slate-900/30">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
              {showOriginal ? "AI 翻译 · 原文" : "AI 翻译 · 中文"}
            </h2>
            <button
              type="button"
              onClick={() => setShowOriginal((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {showOriginal ? "显示译文" : "显示原文"}
            </button>
          </div>
          <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-slate-700 dark:text-slate-300">
            {showOriginal
              ? item.summary || item.summaryAi || ""
              : zhSummary}
          </p>
        </section>
      )}

      {/* 推荐理由 */}
      {item.reason && (
        <section className="mt-6 rounded-lg bg-amber-50/70 px-4 py-3 dark:bg-amber-500/5">
          <div className="text-[13px] leading-relaxed text-amber-900 dark:text-amber-300">
            <span className="font-semibold">推荐理由：</span>
            {item.reason}
          </div>
        </section>
      )}

      {/* 标签 */}
      <div className="mt-6 flex flex-wrap items-center gap-1.5">
        <Tag>{item.category}</Tag>
        {extraTag(item) && <Tag>{extraTag(item)}</Tag>}
      </div>

      {/* 原文入口（底部） */}
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
      >
        在 {domain} 查看原文
        <SystemIcon name="external" size={12} className="system-icon" />
      </a>

      {/* 同一事件 · N 家报道 */}
      {siblings.length > 0 && (
        <section className="mt-8 border-t border-slate-200/70 pt-6 dark:border-slate-800/70">
          <h2 className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-slate-900 dark:text-slate-100">
            <span aria-hidden>📡</span>
            同一事件 · {siblings.length + 1} 家报道
          </h2>
          <ul className="space-y-1.5">
            {siblings.map((sib) => (
              <li key={sib.id}>
                <Link
                  href={`/items/${sib.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span className="w-14 shrink-0 text-[11.5px] text-slate-400 dark:text-slate-500">
                    {formatTimeAgo(sib.pubDate)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-slate-800 dark:text-slate-200">
                      {pickDisplayTitle({
                        source: sib.title,
                        candidate: sib.titleZh,
                        existing: sib.title,
                        summarySource: sib.summary,
                        summaryCandidate: sib.summaryZh,
                        summaryExisting: sib.summaryAi,
                      }) || sib.title}
                    </span>
                    <span className="block truncate text-[11.5px] text-slate-400 dark:text-slate-500">
                      {sib.source}
                    </span>
                  </span>
                  <SystemIcon
                    name="arrowRight"
                    size={12}
                    className="system-icon shrink-0 text-slate-300 dark:text-slate-600"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
