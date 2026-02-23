"use client";

import { useEffect, useState } from "react";
import { DailyDigest } from "@/lib/digest";
import DigestCard from "@/components/DigestCard";
import Link from "next/link";
import Image from "next/image";

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

  const critical = digest?.items.filter((i) => i.importance === "critical").length ?? 0;
  const high = digest?.items.filter((i) => i.importance === "high").length ?? 0;
  const medium = digest?.items.filter((i) => i.importance === "medium").length ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/[0.06]" style={{ background: "rgba(8,12,20,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="网络安全日报" width={32} height={32} className="object-contain" />
            <span className="text-white font-bold text-base tracking-tight">网络安全日报</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#8b949e] hover:text-white hover:bg-white/[0.05] transition-all">
              资讯
            </Link>
            <Link href="/digest" className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-white/[0.08] border border-white/[0.1]">
              简报
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-[#e5ff00]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-[#e5ff00] border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-[#484f58]">AI 正在深度分析今日安全态势...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-32">
            <p className="text-sm text-red-400/80">{error}</p>
          </div>
        )}

        {digest && (
          <>
            {/* Overview block */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#e5ff00]">威胁态势综述</span>
                <span className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[11px] text-[#484f58]">{digest.date}</span>
              </div>

              {/* Overview text */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-6 mb-px">
                <p className="text-[15px] leading-8 text-[#c9d1d9] font-light tracking-wide">
                  {digest.overview}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 rounded-b-xl overflow-hidden border border-t-0 border-white/[0.06]">
                {[
                  { label: "严重", count: critical, color: "text-red-400", dot: "bg-red-500" },
                  { label: "高危", count: high, color: "text-orange-400", dot: "bg-orange-500" },
                  { label: "中等", count: medium, color: "text-yellow-400", dot: "bg-yellow-500" },
                ].map(({ label, count, color, dot }, i) => (
                  <div key={label} className={`flex flex-col items-center py-4 gap-1 bg-white/[0.02] ${i < 2 ? "border-r border-white/[0.06]" : ""}`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      <span className={`text-2xl font-bold tabular-nums ${color}`}>{count}</span>
                    </div>
                    <span className="text-[11px] text-[#484f58]">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#484f58]">重点事件</span>
              <span className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[11px] text-[#484f58]">{digest.items.length} 条</span>
            </div>

            {/* Items grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {digest.items.map((item) => (
                <DigestCard key={item.sourceLink || item.headline} item={item} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/" className="text-sm text-[#e5ff00]/70 hover:text-[#e5ff00] transition-colors">
                查看全部资讯 →
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
