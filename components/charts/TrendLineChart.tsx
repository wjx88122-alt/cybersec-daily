"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DailySnapshot } from "@/lib/snapshot";

export default function TrendLineChart({ snapshots }: { snapshots: DailySnapshot[] }) {
  const data = snapshots.map((s) => ({
    date: s.date.slice(5), // "MM-DD"
    count: s.totalCount,
  }));

  if (data.length === 0) return <Empty />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#e5ff00" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#e5ff00" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tick={{ fill: "#484f58", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#484f58", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#8b949e" }}
          itemStyle={{ color: "#e5ff00" }}
        />
        <Area type="monotone" dataKey="count" stroke="#e5ff00" strokeWidth={2} fill="url(#accentGrad)" name="资讯数" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Empty() {
  return <div className="h-[200px] flex items-center justify-center text-[#484f58] text-sm">暂无数据</div>;
}
