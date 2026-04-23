"use client";

import { useState, useMemo } from "react";
import MdrShell from "@/components/shells/MdrShell";
import NetworkTopology from "@/components/NetworkTopology";
import {
  MOCK_CLIENTS, MOCK_DEVICES, MOCK_NET_ALERTS, MOCK_OPS_TICKETS,
  DEVICE_TYPE_LABELS, DEVICE_TYPE_ICONS, TIER_LABELS, TIER_COLORS,
  STATUS_COLORS,
  type Client, type NetworkDevice,
  type DeviceStatus,
} from "@/lib/network-mock";

/* ── helpers ── */
const sevColor: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};
const prioColor: Record<string, string> = {
  P1: "bg-red-500/20 text-red-400", P2: "bg-orange-500/20 text-orange-400",
  P3: "bg-yellow-500/20 text-yellow-400", P4: "bg-blue-500/20 text-blue-400",
};
const opsStatusLabel: Record<string, string> = { open: "待处理", in_progress: "处理中", pending: "挂起", resolved: "已解决" };
const opsStatusColor: Record<string, string> = {
  open: "bg-gray-500/20 text-gray-400", in_progress: "bg-cyan-500/20 text-cyan-400",
  pending: "bg-purple-500/20 text-purple-400", resolved: "bg-green-500/20 text-green-400",
};
const opsTypeLabel: Record<string, string> = { incident: "故障", change: "变更", maintenance: "维护", request: "需求" };
const opsTypeIcon: Record<string, string> = { incident: "🔥", change: "🔄", maintenance: "🔧", request: "📝" };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}小时前`;
  return `${Math.floor(h / 24)}天前`;
}

function scoreColor(s: number) {
  if (s >= 90) return "text-green-400";
  if (s >= 75) return "text-yellow-400";
  if (s >= 60) return "text-orange-400";
  return "text-red-400";
}

function UsageBar({ value, label }: { value: number; label: string }) {
  const color = value >= 85 ? "bg-red-500" : value >= 65 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="flex-1">
      <div className="flex justify-between text-[10px] text-[#94a3b8] mb-0.5">
        <span>{label}</span><span>{value}%</span>
      </div>
      <div className="h-1 rounded-full bg-black/[0.04] overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

type NetTab = "overview" | "devices" | "alerts" | "ops";

/* ── Client Card ── */
function ClientCard({ client, selected, onClick, alertCount }: { client: Client; selected: boolean; onClick: () => void; alertCount: number }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left glass rounded-xl p-4 transition-all ${selected ? "border-[#2563eb]/30 glow-accent" : "hover:border-black/[0.1]"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-[#1a1a2e]">{client.name}</div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${TIER_COLORS[client.tier]}`}>{TIER_LABELS[client.tier]}</span>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-[#94a3b8]">
        <span>🏢 {client.industry}</span>
        <span>📍 {client.region}</span>
        <span>🖥 {client.deviceCount} 台</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <span className={`text-lg font-bold ${scoreColor(client.networkScore)}`}>{client.networkScore}</span>
          <span className="text-[10px] text-[#94a3b8]">健康分</span>
        </div>
        {alertCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{alertCount} 告警</span>
        )}
      </div>
    </button>
  );
}

/* ── Device Card ── */
function DeviceCard({ device }: { device: NetworkDevice }) {
  return (
    <div className="glass rounded-xl p-3 hover:border-black/[0.1] transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[device.status]} ${device.status === "critical" ? "animate-pulse" : ""}`} />
        <span className="text-lg">{DEVICE_TYPE_ICONS[device.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-[#1a1a2e] truncate">{device.name}</div>
          <div className="text-[10px] text-[#94a3b8]">{device.ip} · {DEVICE_TYPE_LABELS[device.type]}</div>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.04] text-[#78859b]">{device.zone}</span>
      </div>
      <div className="flex gap-3">
        <UsageBar value={device.cpu} label="CPU" />
        <UsageBar value={device.memory} label="内存" />
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-[#94a3b8]">
        <span>⏱ {device.uptime}</span>
        <span>📦 {device.firmware}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main Network Ops Page
   ══════════════════════════════════════════════ */
export default function NetworkPage() {
  const [tab, setTab] = useState<NetTab>("overview");
  const [selectedClient, setSelectedClient] = useState<string>("c1");
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "all">("all");

  const client = MOCK_CLIENTS.find((c) => c.id === selectedClient)!;
  const devices = MOCK_DEVICES.filter((d) => d.clientId === selectedClient);
  const alerts = MOCK_NET_ALERTS.filter((a) => a.clientId === selectedClient);
  const tickets = MOCK_OPS_TICKETS.filter((t) => t.clientId === selectedClient);
  const filteredDevices = statusFilter === "all" ? devices : devices.filter((d) => d.status === statusFilter);

  const allAlertCounts = useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_NET_ALERTS.forEach((a) => { if (!a.acknowledged) map[a.clientId] = (map[a.clientId] || 0) + 1; });
    return map;
  }, []);

  // Global stats
  const totalDevices = MOCK_DEVICES.length;
  const onlineDevices = MOCK_DEVICES.filter((d) => d.status === "online").length;
  const criticalAlerts = MOCK_NET_ALERTS.filter((a) => a.severity === "critical" && !a.acknowledged).length;
  const openTickets = MOCK_OPS_TICKETS.filter((t) => t.status !== "resolved").length;

  const tabs: { key: NetTab; label: string; icon: string }[] = [
    { key: "overview", label: "总览", icon: "📊" },
    { key: "devices", label: "设备", icon: "🖥️" },
    { key: "alerts", label: "告警", icon: "🔔" },
    { key: "ops", label: "运维工单", icon: "🔧" },
  ];

  const statusCounts: Record<DeviceStatus, number> = {
    online: devices.filter((d) => d.status === "online").length,
    warning: devices.filter((d) => d.status === "warning").length,
    critical: devices.filter((d) => d.status === "critical").length,
    offline: devices.filter((d) => d.status === "offline").length,
  };

  return (
    <MdrShell>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <a href="/mdr" className="text-xs text-[#94a3b8] hover:text-[#64748b] transition-colors">← MDR 工单系统</a>
          <h1 className="text-xl font-bold text-[#1a1a2e] mt-1">客户网络运维中心</h1>
          <p className="text-xs text-[#94a3b8] mt-1">多客户网络设备监控 · 告警管理 · 运维工单</p>
        </div>

        {/* Global stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: "🏢", label: "托管客户", value: MOCK_CLIENTS.length, color: "text-[#2563eb]" },
            { icon: "🖥️", label: "在线设备", value: `${onlineDevices}/${totalDevices}`, color: "text-green-400" },
            { icon: "🔴", label: "严重告警", value: criticalAlerts, color: criticalAlerts > 0 ? "text-red-400" : "text-green-400" },
            { icon: "🔧", label: "活跃工单", value: openTickets, color: "text-cyan-400" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-3 text-center">
              <div className="text-xl mb-0.5">{s.icon}</div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Client sidebar */}
          <div className="lg:w-64 shrink-0 space-y-2">
            <div className="text-xs text-[#64748b] font-medium mb-2">客户列表</div>
            {MOCK_CLIENTS.map((c) => (
              <ClientCard key={c.id} client={c} selected={c.id === selectedClient}
                onClick={() => setSelectedClient(c.id)} alertCount={allAlertCounts[c.id] || 0} />
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Client header */}
            <div className="glass rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#1a1a2e]">{client.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${TIER_COLORS[client.tier]}`}>{TIER_LABELS[client.tier]}</span>
                  </div>
                  <div className="flex gap-3 mt-1 text-[10px] text-[#94a3b8]">
                    <span>🏢 {client.industry}</span>
                    <span>📍 {client.region}</span>
                    <span>👤 {client.contactName} ({client.contactPhone})</span>
                    <span>📋 合同至 {client.contract}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${scoreColor(client.networkScore)}`}>{client.networkScore}</div>
                    <div className="text-[10px] text-[#94a3b8]">健康评分</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    tab === t.key ? "text-[#1a1a2e] bg-black/[0.05] border border-black/[0.08]" : "text-[#64748b] hover:text-[#1a1a2e] hover:bg-black/[0.04]"
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Overview */}
            {tab === "overview" && (
              <div className="space-y-4">
                {/* Device status summary */}
                <div className="glass rounded-xl p-4">
                  <div className="text-xs text-[#64748b] font-medium mb-3">设备状态分布</div>
                  <div className="grid grid-cols-4 gap-3">
                    {(["online", "warning", "critical", "offline"] as DeviceStatus[]).map((s) => (
                      <div key={s} className="text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[s]}`} />
                          <span className="text-[10px] text-[#64748b]">{{ online: "正常", warning: "警告", critical: "严重", offline: "离线" }[s]}</span>
                        </div>
                        <div className="text-lg font-bold text-[#1a1a2e]">{statusCounts[s]}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Network topology */}
                <NetworkTopology devices={devices} alerts={alerts} />
                {/* Recent alerts */}
                {alerts.filter((a) => !a.acknowledged).length > 0 && (
                  <div>
                    <div className="text-xs text-[#64748b] font-medium mb-2">🔴 未确认告警</div>
                    <div className="space-y-2">
                      {alerts.filter((a) => !a.acknowledged).slice(0, 3).map((a) => (
                        <div key={a.id} className="glass rounded-xl p-3 flex items-center gap-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${sevColor[a.severity]}`}>{a.severity}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-[#1a1a2e] truncate">{a.title}</div>
                            <div className="text-[10px] text-[#94a3b8]">
                              {a.deviceName} · <span suppressHydrationWarning>{timeAgo(a.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Devices */}
            {tab === "devices" && (
              <div>
                <div className="flex gap-1 mb-3 flex-wrap">
                  {(["all", "online", "warning", "critical", "offline"] as const).map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg transition-all ${statusFilter === s ? "bg-black/[0.05] text-[#1a1a2e] border border-black/[0.08]" : "text-[#64748b] hover:bg-black/[0.04]"}`}>
                      {s === "all" ? `全部 (${devices.length})` : `${{ online: "正常", warning: "警告", critical: "严重", offline: "离线" }[s]} (${statusCounts[s]})`}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredDevices.map((d) => <DeviceCard key={d.id} device={d} />)}
                </div>
                {filteredDevices.length === 0 && <div className="text-xs text-[#94a3b8] text-center py-8">无匹配设备</div>}
              </div>
            )}

            {/* Alerts */}
            {tab === "alerts" && (
              <div className="space-y-2">
                <div className="text-xs text-[#64748b] mb-2">{alerts.length} 条告警</div>
                {alerts.map((a) => (
                  <div key={a.id} className={`glass rounded-xl p-3 flex items-center gap-3 ${a.acknowledged ? "opacity-50" : ""}`}>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${sevColor[a.severity]}`}>{a.severity}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[#1a1a2e]">{a.title}</div>
                      <div className="text-[10px] text-[#94a3b8]">
                        🖥 {a.deviceName} · <span suppressHydrationWarning>{timeAgo(a.timestamp)}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${a.acknowledged ? "bg-green-500/10 text-green-400" : "bg-black/[0.04] text-[#64748b]"}`}>
                      {a.acknowledged ? "已确认" : "待确认"}
                    </span>
                  </div>
                ))}
                {alerts.length === 0 && <div className="text-xs text-[#94a3b8] text-center py-8">暂无告警 ✅</div>}
              </div>
            )}

            {/* Ops Tickets */}
            {tab === "ops" && (
              <div className="space-y-2">
                <div className="text-xs text-[#64748b] mb-2">{tickets.length} 条运维工单</div>
                {tickets.map((t) => (
                  <div key={t.id} className="glass rounded-xl p-4 hover:border-black/[0.1] transition-all">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] text-[#94a3b8] font-mono">{t.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${prioColor[t.priority]}`}>{t.priority}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${opsStatusColor[t.status]}`}>{opsStatusLabel[t.status]}</span>
                      <span className="text-[10px] text-[#94a3b8]">{opsTypeIcon[t.type]} {opsTypeLabel[t.type]}</span>
                    </div>
                    <div className="text-sm text-[#1a1a2e] font-medium">{t.title}</div>
                    <div className="flex gap-3 mt-1.5 text-[10px] text-[#94a3b8]">
                      <span>👤 {t.assignee}</span>
                      <span>📅 <span suppressHydrationWarning>{timeAgo(t.createdAt)}</span></span>
                      <span>🔄 <span suppressHydrationWarning>{timeAgo(t.updatedAt)}</span></span>
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && <div className="text-xs text-[#94a3b8] text-center py-8">暂无工单</div>}
              </div>
            )}
          </div>
        </div>
      </main>
    </MdrShell>
  );
}
