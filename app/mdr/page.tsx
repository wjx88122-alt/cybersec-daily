"use client";

import { useState, useEffect, useCallback } from "react";
import NavBar from "@/components/NavBar";
import {
  MOCK_ALERTS,
  MOCK_TICKETS,
  MOCK_ANALYSTS,
  SLA_CONFIG,
  SEVERITY_LABELS,
  STATUS_LABELS,
  dispatchTicket,
  type Alert,
  type Ticket,
  type Analyst,
  type Severity,
  type TicketStatus,
} from "@/lib/mdr-mock";

/* ── helpers ── */
const sevColor: Record<Severity, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};
const sevDot: Record<Severity, string> = {
  critical: "bg-red-500", high: "bg-orange-500", medium: "bg-yellow-500", low: "bg-blue-500",
};
const statusColor: Record<TicketStatus, string> = {
  pending: "bg-gray-500/20 text-gray-400",
  investigating: "bg-cyan-500/20 text-cyan-400",
  awaiting_feedback: "bg-purple-500/20 text-purple-400",
  resolved: "bg-green-500/20 text-green-400",
  closed: "bg-gray-500/20 text-gray-500",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  return `${Math.floor(h / 24)}天前`;
}

function slaRemaining(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { text: "已超时", urgent: true };
  const m = Math.floor(diff / 60000);
  if (m < 60) return { text: `${m}分钟`, urgent: m < 10 };
  const h = Math.floor(m / 60);
  return { text: `${h}小时${m % 60}分`, urgent: false };
}

type Tab = "dashboard" | "alerts" | "tickets" | "analysts";

/* ── Dashboard Stats ── */
function StatsBar({ tickets, alerts }: { tickets: Ticket[]; alerts: Alert[] }) {
  const open = tickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length;
  const critical = tickets.filter((t) => t.severity === "critical" && t.status !== "closed" && t.status !== "resolved").length;
  const breached = tickets.filter((t) => {
    if (t.status === "closed" || t.status === "resolved") return false;
    return new Date(t.slaDeadline).getTime() < Date.now();
  }).length;
  const unassigned = tickets.filter((t) => !t.assignee && t.status === "pending").length;
  const stats = [
    { label: "待处理告警", value: alerts.length, icon: "🔔", color: "text-[#e5ff00]" },
    { label: "活跃工单", value: open, icon: "📋", color: "text-cyan-400" },
    { label: "严重工单", value: critical, icon: "🔴", color: "text-red-400" },
    { label: "SLA 超时", value: breached, icon: "⏰", color: breached > 0 ? "text-red-400" : "text-green-400" },
    { label: "待派发", value: unassigned, icon: "👤", color: unassigned > 0 ? "text-orange-400" : "text-green-400" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="glass rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">{s.icon}</div>
          <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-[#8b949e] mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Alert Row ── */
function AlertRow({ alert, onCreateTicket }: { alert: Alert; onCreateTicket: (a: Alert) => void }) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 group hover:border-white/[0.15] transition-all">
      <div className="flex items-center gap-2 shrink-0">
        <span className={`w-2 h-2 rounded-full ${sevDot[alert.severity]} ${alert.severity === "critical" ? "animate-pulse" : ""}`} />
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${sevColor[alert.severity]}`}>
          {SEVERITY_LABELS[alert.severity]}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[#8b949e]">{alert.source}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{alert.titleZh}</div>
        <div className="text-xs text-[#6e7681] truncate mt-0.5">{alert.title}</div>
        <div className="flex gap-3 mt-1 text-[10px] text-[#484f58]">
          <span>🖥 {alert.host}</span>
          <span>⚔️ {alert.mitreTactic} ({alert.mitreId})</span>
          <span>🕐 {timeAgo(alert.timestamp)}</span>
        </div>
      </div>
      <button
        onClick={() => onCreateTicket(alert)}
        className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#e5ff00]/10 text-[#e5ff00] border border-[#e5ff00]/20 hover:bg-[#e5ff00]/20 transition-all"
      >
        创建工单 →
      </button>
    </div>
  );
}

/* ── Ticket Card ── */
function TicketCard({ ticket, onStatusChange }: { ticket: Ticket; onStatusChange: (id: string, s: TicketStatus) => void }) {
  const [expanded, setExpanded] = useState(false);
  const sla = slaRemaining(ticket.slaDeadline);
  const nextStatus: Partial<Record<TicketStatus, TicketStatus>> = {
    pending: "investigating",
    investigating: "awaiting_feedback",
    awaiting_feedback: "resolved",
    resolved: "closed",
  };
  const nextLabel: Partial<Record<TicketStatus, string>> = {
    pending: "开始调查",
    investigating: "等待反馈",
    awaiting_feedback: "标记解决",
    resolved: "关闭工单",
  };
  return (
    <div className="glass rounded-xl p-4 hover:border-white/[0.15] transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-[#484f58] font-mono">{ticket.id}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${sevColor[ticket.severity]}`}>
              {SEVERITY_LABELS[ticket.severity]}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[ticket.status]}`}>
              {STATUS_LABELS[ticket.status]}
            </span>
          </div>
          <div className="text-sm font-medium text-white mt-1.5">{ticket.titleZh}</div>
          <div className="text-xs text-[#6e7681] mt-0.5">{ticket.title}</div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-xs font-mono ${sla.urgent ? "text-red-400 animate-pulse" : "text-[#8b949e]"}`}>
            SLA: {sla.text}
          </div>
          {ticket.assignee && (
            <div className="text-xs text-[#6e7681] mt-1">
              {ticket.assignee.avatar} {ticket.assignee.name} (T{ticket.assignee.tier})
            </div>
          )}
          {!ticket.assignee && <div className="text-xs text-orange-400 mt-1">⚠ 未派发</div>}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 text-[10px] text-[#484f58]">
        <span>🖥 {ticket.host}</span>
        <span>📡 {ticket.source}</span>
        <span>⚔️ {ticket.mitreId}</span>
        <span>🕐 {timeAgo(ticket.createdAt)}</span>
      </div>

      <div className="flex items-center gap-2 mt-3">
        {nextStatus[ticket.status] && (
          <button
            onClick={() => onStatusChange(ticket.id, nextStatus[ticket.status]!)}
            className="px-3 py-1 text-[11px] font-medium rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
          >
            {nextLabel[ticket.status]}
          </button>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-1 text-[11px] rounded-lg bg-white/[0.04] text-[#8b949e] hover:bg-white/[0.08] transition-all"
        >
          {expanded ? "收起" : "详情"}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-3">
          {/* Actions */}
          <div>
            <div className="text-[11px] text-[#8b949e] font-medium mb-1.5">📋 处置建议</div>
            <div className="space-y-1">
              {ticket.actions.map((a, i) => (
                <div key={i} className="text-xs text-[#6e7681] flex items-start gap-1.5">
                  <span className="text-[#e5ff00] mt-0.5">▸</span> {a}
                </div>
              ))}
            </div>
          </div>
          {/* Timeline */}
          <div>
            <div className="text-[11px] text-[#8b949e] font-medium mb-1.5">📜 时间线</div>
            <div className="space-y-1.5">
              {ticket.timeline.map((t, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="text-[#484f58] shrink-0 font-mono text-[10px]">{timeAgo(t.time)}</span>
                  <span className="text-[#8b949e]">{t.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Analyst Card ── */
function AnalystCard({ analyst }: { analyst: Analyst }) {
  const load = analyst.activeTickets / analyst.maxTickets;
  const barColor = load >= 0.8 ? "bg-red-500" : load >= 0.5 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{analyst.avatar}</span>
        <div>
          <div className="text-sm font-medium text-white">{analyst.name}</div>
          <div className="text-[10px] text-[#484f58]">Tier {analyst.tier} · {analyst.region}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {analyst.skills.map((s) => (
          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-[#8b949e]">{s}</span>
        ))}
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-[#484f58] mb-1">
          <span>工单负载</span>
          <span>{analyst.activeTickets}/{analyst.maxTickets}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${load * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ── Dispatch Animation ── */
function DispatchToast({ alert, analyst, onDone }: { alert: Alert; analyst: Analyst | null; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-50 glass rounded-xl p-4 border-[#e5ff00]/30 glow-accent animate-bounce max-w-sm">
      <div className="text-xs text-[#e5ff00] font-medium mb-1">🚀 工单已创建并自动派发</div>
      <div className="text-sm text-white">{alert.titleZh}</div>
      {analyst ? (
        <div className="text-xs text-[#8b949e] mt-1">
          派发至 {analyst.avatar} {analyst.name} (Tier {analyst.tier}, {alert.source}专家)
        </div>
      ) : (
        <div className="text-xs text-orange-400 mt-1">⚠ 无可用分析师，进入待派发队列</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════ */
export default function MDRPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [analysts, setAnalysts] = useState<Analyst[]>(MOCK_ANALYSTS);
  const [alerts, setAlerts] = useState<Alert[]>(
    MOCK_ALERTS.filter((a) => !MOCK_TICKETS.some((t) => t.alertId === a.id))
  );
  const [toast, setToast] = useState<{ alert: Alert; analyst: Analyst | null } | null>(null);
  const [, setTick] = useState(0);

  // SLA countdown refresh
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(iv);
  }, []);

  const handleCreateTicket = useCallback((alert: Alert) => {
    const assigned = dispatchTicket(alert, analysts);
    const slaMin = SLA_CONFIG[alert.severity].resolve;
    const newTicket: Ticket = {
      id: `TK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(tickets.length + 1).padStart(3, "0")}`,
      alertId: alert.id,
      title: alert.title,
      titleZh: alert.titleZh,
      severity: alert.severity,
      status: assigned ? "investigating" : "pending",
      assignee: assigned,
      source: alert.source,
      createdAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + slaMin * 60000).toISOString(),
      mitreTactic: alert.mitreTactic,
      mitreId: alert.mitreId,
      host: alert.host,
      actions: ["分析告警详情", "确认影响范围", "执行处置措施", "更新工单状态"],
      timeline: [
        { time: new Date().toISOString(), event: `告警触发：${alert.titleZh}` },
        { time: new Date().toISOString(), event: `AI 分诊：${SEVERITY_LABELS[alert.severity]}等级 → 自动创建工单` },
        ...(assigned
          ? [{ time: new Date().toISOString(), event: `自动派发 → ${assigned.name} (T${assigned.tier}, ${alert.source})` }]
          : [{ time: new Date().toISOString(), event: "等待派发：无可用分析师" }]),
      ],
    };
    setTickets((prev) => [newTicket, ...prev]);
    setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    if (assigned) {
      setAnalysts((prev) =>
        prev.map((a) => (a.id === assigned.id ? { ...a, activeTickets: a.activeTickets + 1 } : a))
      );
    }
    setToast({ alert, analyst: assigned });
  }, [analysts, tickets.length]);

  const handleStatusChange = useCallback((ticketId: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const updated = { ...t, status: newStatus, timeline: [...t.timeline, { time: new Date().toISOString(), event: `状态变更 → ${STATUS_LABELS[newStatus]}` }] };
        return updated;
      })
    );
    // Free analyst on resolve/close
    if (newStatus === "resolved" || newStatus === "closed") {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket?.assignee) {
        setAnalysts((prev) =>
          prev.map((a) => (a.id === ticket.assignee!.id ? { ...a, activeTickets: Math.max(0, a.activeTickets - 1) } : a))
        );
      }
    }
  }, [tickets]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "dashboard", label: "总览", icon: "📊" },
    { key: "alerts", label: "告警", icon: "🔔" },
    { key: "tickets", label: "工单", icon: "📋" },
    { key: "analysts", label: "分析师", icon: "👥" },
  ];

  const openTickets = tickets.filter((t) => t.status !== "closed" && t.status !== "resolved");
  const closedTickets = tickets.filter((t) => t.status === "closed" || t.status === "resolved");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <NavBar active="MDR" />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">MDR 工单派发系统</h1>
          <p className="text-xs text-[#484f58] mt-1">Managed Detection & Response · 告警分诊 → 智能派发 → SLA 追踪 → 闭环处置</p>
          <a href="/mdr/splunk" className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#65A637]/10 text-[#65A637] border border-[#65A637]/20 hover:bg-[#65A637]/20 transition-all">
            <span className="w-4 h-4 rounded bg-gradient-to-br from-[#65A637] to-[#4B8A2A] flex items-center justify-center text-white text-[8px] font-bold">S</span>
            Splunk 对接配置
          </a>
          <a href="/mdr/network" className="inline-flex items-center gap-1.5 mt-2 ml-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">
            🌐 客户网络运维
          </a>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.key
                  ? "text-white bg-white/[0.08] border border-white/[0.1]"
                  : "text-[#8b949e] hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === "dashboard" && (
          <>
            <StatsBar tickets={tickets} alerts={alerts} />
            {/* Workflow diagram */}
            <div className="glass rounded-xl p-4 mb-6">
              <div className="text-xs text-[#8b949e] font-medium mb-3">🔄 MDR 工单生命周期</div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 text-[11px]">
                {[
                  { icon: "🔔", label: "告警采集", sub: "EDR/NDR/SIEM/Cloud" },
                  { icon: "🤖", label: "AI 分诊", sub: "严重等级评定" },
                  { icon: "📋", label: "创建工单", sub: "SLA 时效启动" },
                  { icon: "🎯", label: "智能派发", sub: "技能+负载匹配" },
                  { icon: "🔍", label: "调查处置", sub: "分析师响应" },
                  { icon: "💬", label: "客户反馈", sub: "双向沟通" },
                  { icon: "✅", label: "解决关闭", sub: "闭环归档" },
                ].map((step, i, arr) => (
                  <div key={i} className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] min-w-[80px]">
                      <span className="text-lg">{step.icon}</span>
                      <span className="text-white font-medium">{step.label}</span>
                      <span className="text-[9px] text-[#484f58]">{step.sub}</span>
                    </div>
                    {i < arr.length - 1 && <span className="text-[#484f58]">→</span>}
                  </div>
                ))}
              </div>
            </div>
            {/* Recent critical tickets */}
            <div className="text-xs text-[#8b949e] font-medium mb-3">🔴 活跃严重工单</div>
            <div className="space-y-3 mb-6">
              {openTickets.filter((t) => t.severity === "critical").map((t) => (
                <TicketCard key={t.id} ticket={t} onStatusChange={handleStatusChange} />
              ))}
              {openTickets.filter((t) => t.severity === "critical").length === 0 && (
                <div className="text-xs text-[#484f58] text-center py-8">暂无严重工单 ✅</div>
              )}
            </div>
          </>
        )}

        {/* Alerts */}
        {tab === "alerts" && (
          <>
            <div className="text-xs text-[#8b949e] mb-3">
              {alerts.length > 0 ? `${alerts.length} 条待处理告警` : "所有告警已处理 ✅"}
            </div>
            <div className="space-y-3">
              {alerts.map((a) => (
                <AlertRow key={a.id} alert={a} onCreateTicket={handleCreateTicket} />
              ))}
            </div>
          </>
        )}

        {/* Tickets */}
        {tab === "tickets" && (
          <>
            <div className="text-xs text-[#8b949e] mb-3">活跃工单 ({openTickets.length})</div>
            <div className="space-y-3 mb-6">
              {openTickets.map((t) => (
                <TicketCard key={t.id} ticket={t} onStatusChange={handleStatusChange} />
              ))}
            </div>
            {closedTickets.length > 0 && (
              <>
                <div className="text-xs text-[#484f58] mb-3">已关闭 ({closedTickets.length})</div>
                <div className="space-y-3 opacity-60">
                  {closedTickets.map((t) => (
                    <TicketCard key={t.id} ticket={t} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Analysts */}
        {tab === "analysts" && (
          <>
            <div className="text-xs text-[#8b949e] mb-3">SOC 分析师团队 ({analysts.length})</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analysts.map((a) => (
                <AnalystCard key={a.id} analyst={a} />
              ))}
            </div>
            {/* Dispatch rules */}
            <div className="glass rounded-xl p-4 mt-6">
              <div className="text-xs text-[#8b949e] font-medium mb-2">⚙️ 派发规则</div>
              <div className="space-y-1.5 text-xs text-[#6e7681]">
                <div>▸ 技能匹配：告警来源 (EDR/NDR/SIEM/Cloud/Identity) 匹配分析师技能标签</div>
                <div>▸ 负载均衡：优先派发给当前负载最低的分析师</div>
                <div>▸ Tier 优先：严重/高危告警优先派发给高 Tier 分析师</div>
                <div>▸ SLA 时效：严重 15min 响应/4h 解决 · 高 30min/8h · 中 1h/24h · 低 2h/48h</div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Toast */}
      {toast && <DispatchToast alert={toast.alert} analyst={toast.analyst} onDone={() => setToast(null)} />}
    </div>
  );
}
