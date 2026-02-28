"use client";

import { useEffect, useState } from "react";
import { DailyDigest } from "@/lib/digest";
import DigestCard from "@/components/DigestCard";
import NavBar from "@/components/NavBar";
import Link from "next/link";

const IMPORTANCE_ORDER = ["critical", "high", "medium"] as const;
const SECTION_CONFIG = {
  critical: { label: "严重威胁", dot: "bg-red-500", text: "text-red-400" },
  high: { label: "高危事件", dot: "bg-orange-500", text: "text-orange-400" },
  medium: { label: "中等风险", dot: "bg-yellow-500", text: "text-yellow-400" },
};

export default function DigestPage() {
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/digest")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setDigest(data);
      })
      .catch((e) => setError(e.message || "摘要加载失败，请稍后重试"))
      .finally(() => setLoading(false));
  }, []);

  const grouped = digest
    ? {
        critical: digest.items.filter((i) => i.importance === "critical"),
        high: digest.items.filter((i) => i.importance === "high"),
        medium: digest.items.filter((i) => i.importance === "medium"),
      }
    : null;

  const critical = grouped?.critical.length ?? 0;
  const high = grouped?.high.length ?? 0;
  const medium = grouped?.medium.length ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <NavBar active="简报" />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-[#e5ff00]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-[#e5ff00] border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-[#484f58]">
              AI 正在深度分析今日安全态势...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-32">
            <p className="text-sm text-red-400/80">{error}</p>
          </div>
        )}

        {digest && grouped && (
          <>
            {/* Page title */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#e5ff00]">
                  每日威胁简报
                </span>
                <span className="text-[11px] text-[#484f58]">
                  {digest.date}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                今日安全态势综述
              </h1>
            </div>

            {/* Overview + stats */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] overflow-hidden mb-8">
              <div className="p-6">
                <p className="text-[14px] leading-8 text-[#c9d1d9] font-light">
                  {digest.overview}
                </p>
              </div>
              <div className="grid grid-cols-3 border-t border-white/[0.06]">
                {[
                  {
                    label: "严重",
                    count: critical,
                    color: "text-red-400",
                    dot: "bg-red-500",
                  },
                  {
                    label: "高危",
                    count: high,
                    color: "text-orange-400",
                    dot: "bg-orange-500",
                  },
                  {
                    label: "中等",
                    count: medium,
                    color: "text-yellow-400",
                    dot: "bg-yellow-500",
                  },
                ].map(({ label, count, color, dot }, i) => (
                  <div
                    key={label}
                    className={`flex flex-col items-center py-4 gap-1 bg-white/[0.02] ${i < 2 ? "border-r border-white/[0.06]" : ""}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      <span
                        className={`text-2xl font-bold tabular-nums ${color}`}
                      >
                        {count}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#484f58]">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grouped sections */}
            {IMPORTANCE_ORDER.map((level) => {
              const items = grouped[level];
              if (items.length === 0) return null;
              const sec = SECTION_CONFIG[level];
              const isCritical = level === "critical";

              return (
                <section key={level} className="mb-8">
                  {/* Section header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className={`w-2 h-2 rounded-full ${sec.dot}`} />
                    <span
                      className={`text-[11px] font-bold uppercase tracking-widest ${sec.text}`}
                    >
                      {sec.label}
                    </span>
                    <span className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-[11px] text-[#484f58]">
                      {items.length} 条
                    </span>
                  </div>

                  {/* Cards grid */}
                  <div
                    className={`grid gap-3 ${
                      isCritical
                        ? "sm:grid-cols-2"
                        : "sm:grid-cols-2 lg:grid-cols-3"
                    }`}
                  >
                    {items.map((item) => (
                      <DigestCard
                        key={item.sourceLink || item.headline}
                        item={item}
                        featured={isCritical}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-[#e5ff00]/70 hover:text-[#e5ff00] transition-colors"
              >
                查看全部资讯 →
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
