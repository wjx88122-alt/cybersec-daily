"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { DailySnapshot } from "@/lib/snapshot";

export default function SourceBarChart({ snapshots }: { snapshots: DailySnapshot[] }) {
  const totals: Record<string, number> = {};
  for (const s of snapshots) {
    for (const [src, count] of Object.entries(s.bySource)) {
      totals[src] = (totals[src] ?? 0) + count;
    }
  }

  const data = Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  if (data.length === 0) return <Empty />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#484f58", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#8b949e", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
          itemStyle={{ color: "#e5ff00" }}
          labelStyle={{ color: "#8b949e" }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} name="资讯数">
          {data.map((_, i) => (
            <Cell key={i} fill={`rgba(229,255,0,${0.9 - i * 0.07})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function Empty() {
  return <div className="h-[200px] flex items-center justify-center text-[#484f58] text-sm">暂无数据</div>;
}
