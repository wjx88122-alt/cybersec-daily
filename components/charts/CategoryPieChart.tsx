"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DailySnapshot } from "@/lib/snapshot";

const COLORS: Record<string, string> = {
  综合资讯: "#3b82f6",
  深度分析: "#a855f7",
  漏洞预警: "#ef4444",
  威胁情报: "#f97316",
  恶意软件: "#ec4899",
  "政府/监管": "#22c55e",
};

export default function CategoryPieChart({ snapshots }: { snapshots: DailySnapshot[] }) {
  const totals: Record<string, number> = {};
  for (const s of snapshots) {
    for (const [cat, count] of Object.entries(s.byCategory)) {
      totals[cat] = (totals[cat] ?? 0) + count;
    }
  }

  const data = Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) return <Empty />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] ?? "#6e7681"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
          itemStyle={{ color: "#c9d1d9" }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#8b949e" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function Empty() {
  return <div className="h-[200px] flex items-center justify-center text-[#484f58] text-sm">暂无数据</div>;
}
