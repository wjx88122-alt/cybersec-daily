"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DailySnapshot } from "@/lib/snapshot";

export default function SeverityStackChart({ snapshots }: { snapshots: DailySnapshot[] }) {
  const data = snapshots.map((s) => ({
    date: s.date.slice(5),
    critical: s.bySeverity.critical,
    high: s.bySeverity.high,
    medium: s.bySeverity.medium,
  }));

  if (data.length === 0) return <Empty />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="date" tick={{ fill: "#484f58", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#484f58", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#8b949e" }}
        />
        <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="rgba(239,68,68,0.3)" name="严重" />
        <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="rgba(249,115,22,0.3)" name="高危" />
        <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="rgba(234,179,8,0.2)" name="中等" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Empty() {
  return <div className="h-[200px] flex items-center justify-center text-[#484f58] text-sm">暂无数据</div>;
}
