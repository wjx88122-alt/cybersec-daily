"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import NavBar from "@/components/NavBar";
import { DailySnapshot } from "@/lib/snapshot";
import Link from "next/link";

const TrendLineChart = dynamic(() => import("@/components/charts/TrendLineChart"), { ssr: false });
const CategoryPieChart = dynamic(() => import("@/components/charts/CategoryPieChart"), { ssr: false });
const SourceBarChart = dynamic(() => import("@/components/charts/SourceBarChart"), { ssr: false });
const SeverityStackChart = dynamic(() => import("@/components/charts/SeverityStackChart"), { ssr: false });

const DAYS_OPTIONS = [7, 14, 30] as const;

export default function TrendsPage() {
  const [days, setDays] = useState<7 | 14 | 30>(7);
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/trends?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSnapshots(data.snapshots ?? []);
      })
      .catch((e) => setError(e.message || "加载失败"))
      .finally(() => setLoading(false));
  }, [days]);

  const totalCount = snapshots.reduce((s, d) => s + d.totalCount, 0);
  const avgCount = snapshots.length > 0 ? Math.round(totalCount / snapshots.length) : 0;

  const topCategory = (() => {
    const totals: Record<string, number> = {};
    for (const s of snapshots) {
      for (const [cat, n] of Object.entries(s.byCategory)) {
        totals[cat] = (totals[cat] ?? 0) + n;
      }
    }
    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  })();

  const topSource = (() => {
    const totals: Record<string, number> = {};
    for (const s of snapshots) {
      for (const [src, n] of Object.entries(s.bySource)) {
        totals[src] = (totals[src] ?? 0) + n;
      }
    }
    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  })();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <NavBar active="趋势" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title + days selector */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#e5ff00] mb-1">威胁趋势</div>
            <h1 className="text-2xl font-bold text-white tracking-tight">安全态势仪表盘</h1>
          </div>
          <div className="flex gap-1.5">
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  days === d
                    ? "text-[#e5ff00] bg-[#e5ff00]/10 border-[#e5ff00]/30"
                    : "text-[#6e7681] bg-white/[0.04] border-white/[0.06] hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {d} 天
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-[#e5ff00]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-[#e5ff00] border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-[#484f58]">加载趋势数据...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-32">
            <p className="text-sm text-red-400/80">{error}</p>
          </div>
        )}

        {!loading && !error && snapshots.length === 0 && (
          <div className="text-center py-32">
            <p className="text-sm text-[#484f58]">暂无历史数据，数据将在每日 cron 运行后开始积累</p>
            <p className="text-xs text-[#484f58] mt-2">每天 UTC 17:00 自动更新</p>
          </div>
        )}

        {!loading && !error && snapshots.length > 0 && (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "总资讯数", value: totalCount.toLocaleString(), color: "text-[#e5ff00]" },
                { label: "日均资讯", value: avgCount.toLocaleString(), color: "text-blue-400" },
                { label: "最活跃分类", value: topCategory, color: "text-orange-400" },
                { label: "最活跃来源", value: topSource, color: "text-purple-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-4">
                  <p className="text-[11px] text-[#484f58] mb-1">{label}</p>
                  <p className={`text-lg font-bold truncate ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Charts grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#484f58] mb-4">每日资讯量</p>
                <TrendLineChart snapshots={snapshots} />
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#484f58] mb-4">分类分布</p>
                <CategoryPieChart snapshots={snapshots} />
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#484f58] mb-4">威胁等级趋势</p>
                <SeverityStackChart snapshots={snapshots} />
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#0d1117] p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#484f58] mb-4">Top 10 来源</p>
                <SourceBarChart snapshots={snapshots} />
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-[#484f58]">
              数据每日 UTC 17:00 自动更新 · 共 {snapshots.length} 天快照
            </p>
          </>
        )}
      </main>
    </div>
  );
}
