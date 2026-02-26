"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MOCK_ALERTS, MOCK_TICKETS, MOCK_ANALYSTS,
  SEVERITY_LABELS, STATUS_LABELS,
  type Severity, type TicketStatus, type AlertSource,
} from "@/lib/mdr-mock";
import {
  MOCK_CLIENTS, MOCK_DEVICES, MOCK_NET_ALERTS, MOCK_OPS_TICKETS,
  type DeviceStatus,
} from "@/lib/network-mock";
import ThreatMap from "@/components/ThreatMap";

/* ── Helpers ── */
function timeStr() {
  const d = new Date();
  return d.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });
}

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / (duration / 30));
    const iv = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(iv); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(iv);
  }, [value, duration]);
  return <>{display}</>;
}

/* ── Ring Chart (CSS) ── */
function RingChart({ data, size = 120 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const segments = data.map((d) => {
    const start = (cumulative / total) * 360;
    cumulative += d.value;
    const end = (cumulative / total) * 360;
    return { ...d, start, end };
  });
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => {
        const startRad = ((seg.start - 90) * Math.PI) / 180;
        const endRad = ((seg.end - 90) * Math.PI) / 180;
        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);
        const large = seg.end - seg.start > 180 ? 1 : 0;
        return (
          <path key={i}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={seg.color} opacity={0.85} />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.6} fill="#0a0e1a" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={20} fill="#fff" fontWeight={700}>{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill="#64748b">总计</text>
    </svg>
  );
}

/* ── Bar Chart ── */
function BarChart({ data, maxH = 80 }: { data: { label: string; value: number; color: string }[]; maxH?: number }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 justify-center" style={{ height: maxH + 24 }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-gray-400 font-mono">{d.value}</span>
          <div className="w-8 rounded-t-sm transition-all duration-1000" style={{ height: (d.value / max) * maxH, background: d.color, minHeight: 2 }} />
          <span className="text-[9px] text-gray-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Scrolling Alert Ticker ── */
function AlertTicker({ items }: { items: { text: string; severity: string; time: string }[] }) {
  const sevDot: Record<string, string> = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#3b82f6" };
  return (
    <div className="overflow-hidden h-[180px] relative">
      <div className="animate-scroll space-y-2">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sevDot[item.severity] || "#3b82f6" }} />
            <span className="text-xs text-gray-300 flex-1 truncate">{item.text}</span>
            <span className="text-[10px] text-gray-600 shrink-0">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Dashboard Main
   ══════════════════════════════════════════════ */
export default function DashboardPage() {
  const [clock, setClock] = useState(timeStr());
  useEffect(() => {
    const iv = setInterval(() => setClock(timeStr()), 1000);
    return () => clearInterval(iv);
  }, []);

  const totalClients = MOCK_CLIENTS.length;
  const totalDevices = MOCK_DEVICES.length;
  const onlineDevices = MOCK_DEVICES.filter((d) => d.status === "online").length;
  const totalAlerts = MOCK_ALERTS.length + MOCK_NET_ALERTS.length;
  const criticalAlerts = [...MOCK_ALERTS, ...MOCK_NET_ALERTS].filter((a) => a.severity === "critical").length;
  const totalTickets = MOCK_TICKETS.length + MOCK_OPS_TICKETS.length;
  const resolvedTickets = [...MOCK_TICKETS, ...MOCK_OPS_TICKETS].filter((t) => "status" in t && (t.status === "resolved" || t.status === "closed")).length;

  const sevData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    [...MOCK_ALERTS, ...MOCK_NET_ALERTS].forEach((a) => counts[a.severity]++);
    return [
      { label: "严重", value: counts.critical, color: "#ef4444" },
      { label: "高危", value: counts.high, color: "#f97316" },
      { label: "中危", value: counts.medium, color: "#eab308" },
      { label: "低危", value: counts.low, color: "#3b82f6" },
    ];
  }, []);

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    MOCK_ALERTS.forEach((a) => { counts[a.source] = (counts[a.source] || 0) + 1; });
    return Object.entries(counts).map(([k, v], i) => ({
      label: k, value: v, color: ["#06b6d4", "#8b5cf6", "#f97316", "#22c55e", "#ec4899"][i % 5],
    }));
  }, []);

  const deviceStatusData = useMemo(() => {
    const counts: Record<string, number> = { online: 0, warning: 0, critical: 0, offline: 0 };
    MOCK_DEVICES.forEach((d) => counts[d.status]++);
    return [
      { label: "正常", value: counts.online, color: "#22c55e" },
      { label: "警告", value: counts.warning, color: "#eab308" },
      { label: "严重", value: counts.critical, color: "#ef4444" },
      { label: "离线", value: counts.offline, color: "#6b7280" },
    ];
  }, []);

  const tickerItems = useMemo(() => {
    const all = [
      ...MOCK_ALERTS.map((a) => ({ text: a.titleZh, severity: a.severity, time: new Date(a.timestamp).toLocaleTimeString("zh-CN", { hour12: false }).slice(0, 5) })),
      ...MOCK_NET_ALERTS.map((a) => ({ text: a.title, severity: a.severity, time: new Date(a.timestamp).toLocaleTimeString("zh-CN", { hour12: false }).slice(0, 5) })),
    ];
    return all.sort((a, b) => b.time.localeCompare(a.time));
  }, []);

  const clientRanking = useMemo(() =>
    [...MOCK_CLIENTS].sort((a, b) => a.networkScore - b.networkScore), []);

  const analystData = useMemo(() =>
    MOCK_ANALYSTS.map((a) => ({
      label: a.name, value: a.activeTickets,
      color: a.activeTickets >= a.maxTickets ? "#ef4444" : a.activeTickets >= a.maxTickets * 0.6 ? "#eab308" : "#22c55e",
    })), []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white overflow-hidden">
      <style jsx global>{`
        @keyframes scroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        .animate-scroll { animation: scroll 20s linear infinite; }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 15px rgba(37,99,235,0.3); } 50% { box-shadow: 0 0 30px rgba(37,99,235,0.6); } }
        .glow-blue { animation: pulse-glow 3s ease-in-out infinite; }
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        .scan-line::after { content: ''; position: absolute; left: 0; width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(37,99,235,0.5), transparent); animation: scan 4s linear infinite; }
      `}</style>

      {/* Header */}
      <header className="relative h-16 flex items-center justify-between px-8 border-b border-white/[0.06] bg-[#0c1020]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-sm font-bold">M</div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">MDR 安全运营中心</h1>
            <p className="text-[10px] text-gray-500">Managed Detection & Response · Security Operations Center</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400">系统运行中</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono text-blue-400">{clock}</div>
            <div className="text-[10px] text-gray-600">Asia/Shanghai</div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </header>

      <main className="p-4 grid grid-cols-12 gap-3">
        {/* KPI Cards */}
        <div className="col-span-12 grid grid-cols-6 gap-3">
          {[
            { icon: "🏢", label: "托管客户", value: totalClients, unit: "家", color: "from-blue-600 to-blue-400" },
            { icon: "🖥️", label: "在线设备", value: onlineDevices, unit: `/${totalDevices}`, color: "from-green-600 to-green-400" },
            { icon: "🔔", label: "安全告警", value: totalAlerts, unit: "条", color: "from-orange-600 to-orange-400" },
            { icon: "🔴", label: "严重威胁", value: criticalAlerts, unit: "条", color: "from-red-600 to-red-400" },
            { icon: "📋", label: "处置工单", value: totalTickets, unit: "条", color: "from-purple-600 to-purple-400" },
            { icon: "✅", label: "已解决", value: resolvedTickets, unit: "条", color: "from-emerald-600 to-emerald-400" },
          ].map((kpi) => (
            <div key={kpi.label} className="relative rounded-xl bg-[#111827] border border-white/[0.06] p-4 overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${kpi.color}`} />
              <div className="flex items-center justify-between">
                <span className="text-xl">{kpi.icon}</span>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono">
                    <AnimatedNumber value={kpi.value} />
                    <span className="text-xs text-gray-500 ml-1">{kpi.unit}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{kpi.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Threat Map */}
        <div className="col-span-12">
          <ThreatMap />
        </div>

        {/* Threat Distribution */}
        <div className="col-span-3 rounded-xl bg-[#111827] border border-white/[0.06] p-4 relative scan-line">
          <div className="text-xs text-gray-400 font-medium mb-3">🎯 威胁等级分布</div>
          <div className="flex items-center justify-center">
            <RingChart data={sevData} size={140} />
          </div>
          <div className="flex justify-center gap-3 mt-3">
            {sevData.map((d) => (
              <div key={d.label} className="flex items-center gap-1 text-[10px]">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-gray-400">{d.label}</span>
                <span className="text-gray-300 font-mono">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Alert Feed */}
        <div className="col-span-5 rounded-xl bg-[#111827] border border-white/[0.06] p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-400 font-medium">⚡ 实时安全事件</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-red-400">LIVE</span>
            </div>
          </div>
          <AlertTicker items={tickerItems} />
        </div>

        {/* Alert Source + Device Status */}
        <div className="col-span-4 rounded-xl bg-[#111827] border border-white/[0.06] p-4">
          <div className="text-xs text-gray-400 font-medium mb-3">📡 告警来源分布</div>
          <BarChart data={sourceData} maxH={70} />
          <div className="mt-3 border-t border-white/[0.04] pt-3">
            <div className="text-xs text-gray-400 font-medium mb-2">🖥️ 设备状态</div>
            <div className="flex justify-center gap-4">
              {deviceStatusData.map((d) => (
                <div key={d.label} className="text-center">
                  <div className="text-lg font-bold font-mono" style={{ color: d.color }}>{d.value}</div>
                  <div className="text-[9px] text-gray-500">{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Client Health Ranking */}
        <div className="col-span-4 rounded-xl bg-[#111827] border border-white/[0.06] p-4">
          <div className="text-xs text-gray-400 font-medium mb-3">🏆 客户安全健康排名</div>
          <div className="space-y-2">
            {clientRanking.map((c, i) => {
              const scoreColor = c.networkScore >= 90 ? "#22c55e" : c.networkScore >= 75 ? "#eab308" : c.networkScore >= 60 ? "#f97316" : "#ef4444";
              return (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02]">
                  <span className="text-sm font-bold text-gray-600 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-200 font-medium">{c.name}</div>
                    <div className="text-[10px] text-gray-600">{c.industry} · {c.region} · {c.deviceCount} 台设备</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono" style={{ color: scoreColor }}>{c.networkScore}</div>
                    <div className="w-16 h-1 rounded-full bg-white/[0.06] mt-1">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${c.networkScore}%`, background: scoreColor }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Protection Stats */}
        <div className="col-span-4 rounded-xl bg-[#111827] border border-white/[0.06] p-4 glow-blue">
          <div className="text-xs text-gray-400 font-medium mb-3">🛡️ 安全防护能力</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "威胁检出率", value: "99.7%", icon: "🎯", desc: "AI + 规则双引擎" },
              { label: "平均响应时间", value: "< 8min", icon: "⚡", desc: "7×24 SOC 值守" },
              { label: "工单解决率", value: `${Math.round((resolvedTickets / Math.max(totalTickets, 1)) * 100)}%`, icon: "✅", desc: "闭环处置" },
              { label: "SLA 达标率", value: "98.5%", icon: "📊", desc: "严格时效管控" },
              { label: "覆盖攻击面", value: "5 维", icon: "🔍", desc: "EDR/NDR/SIEM/Cloud/ID" },
              { label: "MITRE 覆盖", value: "87%", icon: "⚔️", desc: "ATT&CK 战术覆盖" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-3 text-center">
                <div className="text-lg mb-0.5">{s.icon}</div>
                <div className="text-base font-bold text-blue-400 font-mono">{s.value}</div>
                <div className="text-[10px] text-gray-300 mt-0.5">{s.label}</div>
                <div className="text-[9px] text-gray-600">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Analyst Workload */}
        <div className="col-span-4 rounded-xl bg-[#111827] border border-white/[0.06] p-4">
          <div className="text-xs text-gray-400 font-medium mb-3">👥 分析师工作负载</div>
          <BarChart data={analystData} maxH={60} />
          <div className="mt-3 border-t border-white/[0.04] pt-3">
            <div className="text-xs text-gray-400 font-medium mb-2">📋 工单状态分布</div>
            <div className="flex justify-center gap-3">
              {[
                { label: "待处理", count: MOCK_TICKETS.filter((t) => t.status === "pending").length, color: "#6b7280" },
                { label: "调查中", count: MOCK_TICKETS.filter((t) => t.status === "investigating").length, color: "#06b6d4" },
                { label: "等待反馈", count: MOCK_TICKETS.filter((t) => t.status === "awaiting_feedback").length, color: "#8b5cf6" },
                { label: "已解决", count: MOCK_TICKETS.filter((t) => t.status === "resolved" || t.status === "closed").length, color: "#22c55e" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-base font-bold font-mono" style={{ color: s.color }}>{s.count}</div>
                  <div className="text-[9px] text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}