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
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header
        className="sticky top-0 z-10"
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--separator)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="font-semibold text-base" style={{ color: "var(--foreground)" }}>
              家兴的网络安全日报
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ color: "#007aff" }}
            >
              资讯
            </Link>
            <Link
              href="/digest"
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ background: "#007aff", color: "#fff" }}
            >
              简报
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm" style={{ color: "var(--secondary-text)" }}>
              AI 正在深度分析今日安全态势...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-32 text-red-500 text-sm">{error}</div>
        )}

        {digest && (
          <>
            {/* Overview card */}
            <div
              className="rounded-2xl p-5 mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(0,122,255,0.12), rgba(88,86,214,0.12))",
                border: "1px solid rgba(0,122,255,0.2)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(0,122,255,0.15)", color: "#007aff" }}
                >
                  AI 态势分析
                </span>
                <span className="text-xs" style={{ color: "var(--secondary-text)" }}>
                  {digest.date}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                {digest.overview}
              </p>
            </div>

            {/* Legend + count */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs" style={{ color: "var(--secondary-text)" }}>
                今日重点 · {digest.items.length} 条
              </p>
              <div className="flex gap-3 text-xs" style={{ color: "var(--secondary-text)" }}>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />严重
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />高危
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />中等
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {digest.items.map((item, i) => (
                <DigestCard key={i} item={item} />
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm"
                style={{ color: "#007aff" }}
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
