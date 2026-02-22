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
      .catch(() => setError("摘要生成失败，请稍后重试"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#111]">
      <header className="sticky top-0 z-10 bg-black border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="网络安全日报" width={120} height={40} className="object-contain" />
          </Link>
          <nav className="flex items-center">
            <Link
              href="/"
              className="px-4 h-12 flex items-center text-sm font-semibold text-[#888] hover:text-white transition-colors border-b-2 border-transparent"
            >
              资讯
            </Link>
            <Link
              href="/digest"
              className="px-4 h-12 flex items-center text-sm font-semibold text-white border-b-2 border-[#e5ff00]"
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
            <p className="text-sm text-[#666]">AI 正在深度分析今日安全态势...</p>
          </div>
        )}

        {error && <div className="text-center py-32 text-red-500 text-sm">{error}</div>}

        {digest && (
          <>
            {/* Overview */}
            <div className="bg-[#1a1a1a] border-l-4 border-[#e5ff00] p-5 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#e5ff00]">
                  今日新增威胁
                </span>
                <span className="text-[11px] text-[#555]">{digest.date}</span>
              </div>
              <p className="text-sm leading-relaxed text-[#ccc]">{digest.overview}</p>
            </div>

            {/* Legend + count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-[#555]">今日新披露 · {digest.items.length} 条</p>
              <div className="flex gap-4 text-xs text-[#555]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />严重</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" />高危</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" />中等</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {digest.items.map((item, i) => (
                <DigestCard key={i} item={item} />
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
