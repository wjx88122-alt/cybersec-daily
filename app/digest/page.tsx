"use client";

import { useEffect, useState } from "react";
import { DailyDigest } from "@/lib/digest";
import DigestCard from "@/components/DigestCard";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-lg font-bold leading-none">网络安全日报</h1>
              <p className="text-xs text-gray-500 mt-0.5">每日最新安全资讯聚合</p>
            </div>
          </div>
          <nav className="flex gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              全部资讯
            </Link>
            <Link
              href="/digest"
              className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white"
            >
              今日简报
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">AI 正在深度分析今日安全态势...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-32 text-red-400">{error}</div>
        )}

        {digest && (
          <>
            {/* Overview banner */}
            <div className="bg-blue-950/40 border border-blue-800/50 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-blue-400 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  AI 态势分析
                </span>
                <span className="text-xs text-gray-500">{digest.date}</span>
              </div>
              <p className="text-gray-200 leading-relaxed">{digest.overview}</p>
            </div>

            {/* Digest items */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-400">
                今日重点事件 · {digest.items.length} 条
              </h2>
              <div className="flex gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />严重
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />高危
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />中等
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {digest.items.map((item, i) => (
                <DigestCard key={i} item={item} />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-400 transition-colors"
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
