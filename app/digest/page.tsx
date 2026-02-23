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

  return (
    <div className="min-h-screen bg-[#111]">
      <header className="sticky top-0 z-10 bg-[#111] border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="网络安全日报"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="text-white font-bold text-lg tracking-tight leading-none">
              网络安全日报
            </span>
          </Link>
          <nav className="flex items-center h-full">
            <Link
              href="/"
              className="px-4 h-full flex items-center text-sm font-semibold text-[#888] hover:text-white transition-colors border-b-2 border-transparent hover:border-[#e5ff00]/40"
            >
              资讯
            </Link>
            <Link
              href="/digest"
              className="px-4 h-full flex items-center text-sm font-semibold text-white border-b-2 border-[#e5ff00]"
            >
              简报
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-7 h-7 border-2 border-[#e5ff00] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#666]">
              AI 正在深度分析今日安全态势...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-32 text-red-500 text-sm">{error}</div>
        )}

        {digest && (
          <>
            {/* Overview — full-width editorial block */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#e5ff00]">
                  威胁态势综述
                </span>
                <span className="flex-1 h-px bg-[#222]" />
                <span className="text-[11px] text-[#555]">{digest.date}</span>
              </div>
              <div className="bg-[#161616] border border-[#2a2a2a] p-6">
                <p className="text-base leading-8 text-[#ddd] font-light tracking-wide">
                  {digest.overview}
                </p>
              </div>
              {/* Threat summary stats */}
              <div className="grid grid-cols-3 border-x border-b border-[#2a2a2a]">
                {[
                  {
                    label: "严重",
                    count: digest.items.filter(
                      (i) => i.importance === "critical",
                    ).length,
                    color: "text-red-400",
                    bar: "bg-red-500",
                  },
                  {
                    label: "高危",
                    count: digest.items.filter((i) => i.importance === "high")
                      .length,
                    color: "text-orange-400",
                    bar: "bg-orange-500",
                  },
                  {
                    label: "中等",
                    count: digest.items.filter((i) => i.importance === "medium")
                      .length,
                    color: "text-yellow-400",
                    bar: "bg-yellow-500",
                  },
                ].map(({ label, count, color, bar }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center py-3 border-r border-[#2a2a2a] last:border-r-0"
                  >
                    <span className={`text-2xl font-bold ${color}`}>
                      {count}
                    </span>
                    <span className="text-[11px] text-[#555] mt-0.5">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#555]">
                重点事件
              </span>
              <span className="flex-1 h-px bg-[#222]" />
              <span className="text-[11px] text-[#555]">
                {digest.items.length} 条
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {digest.items.map((item, i) => (
                <DigestCard
                  key={item.sourceLink || item.headline}
                  item={item}
                />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/" className="text-sm text-[#e5ff00] hover:underline">
                查看全部资讯 →
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
