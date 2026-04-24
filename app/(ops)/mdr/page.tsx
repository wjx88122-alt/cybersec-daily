"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import MdrShell from "@/components/shells/MdrShell";
import {
  MOCK_ALERTS,
  MOCK_TICKETS,
  MOCK_ANALYSTS,
  SLA_CONFIG,
  SEVERITY_LABELS,
  STATUS_LABELS,
  dispatchTicket,
  type Alert,
  type Analyst,
  type Severity,
  type Ticket,
  type TicketStatus,
} from "@/lib/mdr-mock";
import {
  mdrActionToneClass,
  mdrLoadBarClass,
  mdrSeverityBadgeClass,
  mdrSeverityDotClass,
  mdrSlaToneClass,
  mdrSourceToneClass,
  mdrStatToneClass,
  mdrStatusBadgeClass,
  type MdrStatTone,
} from "./theme";

const severityPriority: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const WORKFLOW_STEPS = [
  { label: "告警采集", sub: "EDR / NDR / SIEM / Cloud" },
  { label: "AI 分诊", sub: "严重等级评定" },
  { label: "创建工单", sub: "SLA 计时启动" },
  { label: "智能派发", sub: "技能与负载匹配" },
  { label: "调查处置", sub: "分析师执行" },
  { label: "客户反馈", sub: "双向更新" },
  { label: "解决关闭", sub: "闭环归档" },
] as const;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;

  return `${Math.floor(hours / 24)} 天前`;
}

function slaRemainingMs(deadline: string) {
  return new Date(deadline).getTime() - Date.now();
}

function slaRemaining(deadline: string) {
  const diff = slaRemainingMs(deadline);

  if (diff <= 0) return { text: "已超时", urgent: true };

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return { text: `${minutes} 分钟`, urgent: minutes < 15 };

  const hours = Math.floor(minutes / 60);
  return { text: `${hours} 小时 ${minutes % 60} 分`, urgent: false };
}

function compareTickets(a: Ticket, b: Ticket) {
  const scoreA =
    severityPriority[a.severity] * 100 +
    (a.status === "pending" ? 30 : 0) +
    (!a.assignee ? 40 : 0) +
    (slaRemainingMs(a.slaDeadline) <= 0 ? 60 : 0) +
    (slaRemainingMs(a.slaDeadline) <= 15 * 60_000 ? 40 : 0);
  const scoreB =
    severityPriority[b.severity] * 100 +
    (b.status === "pending" ? 30 : 0) +
    (!b.assignee ? 40 : 0) +
    (slaRemainingMs(b.slaDeadline) <= 0 ? 60 : 0) +
    (slaRemainingMs(b.slaDeadline) <= 15 * 60_000 ? 40 : 0);

  if (scoreA !== scoreB) return scoreB - scoreA;

  return slaRemainingMs(a.slaDeadline) - slaRemainingMs(b.slaDeadline);
}

type Tab = "dashboard" | "alerts" | "tickets" | "analysts";

function StatsBar({
  tickets,
  alerts,
  analysts,
  nowTs,
}: {
  tickets: Ticket[];
  alerts: Alert[];
  analysts: Analyst[];
  nowTs: number;
}) {
  const open = tickets.filter((ticket) => ticket.status !== "closed" && ticket.status !== "resolved").length;
  const critical = tickets.filter(
    (ticket) =>
      ticket.severity === "critical" &&
      ticket.status !== "closed" &&
      ticket.status !== "resolved",
  ).length;
  const breached = tickets.filter((ticket) => {
    if (ticket.status === "closed" || ticket.status === "resolved") return false;
    return new Date(ticket.slaDeadline).getTime() < nowTs;
  }).length;
  const unassigned = tickets.filter((ticket) => !ticket.assignee && ticket.status === "pending").length;
  const availableSeats = analysts.reduce(
    (total, analyst) => total + Math.max(0, analyst.maxTickets - analyst.activeTickets),
    0,
  );

  const stats = [
    { label: "待分诊告警", value: alerts.length, hint: "待进入工单系统", tone: "intake" },
    { label: "活跃工单", value: open, hint: "当前班次在看", tone: "neutral" },
    { label: "严重工单", value: critical, hint: "需优先关注", tone: "critical" },
    { label: "SLA 风险", value: breached, hint: breached > 0 ? "已有超时项" : "当前可控", tone: breached > 0 ? "critical" : "healthy" },
    { label: "可用席位", value: availableSeats, hint: "分析师剩余容量", tone: availableSeats > 0 ? "healthy" : "warning" },
    { label: "待派发", value: unassigned, hint: unassigned > 0 ? "需要立即接手" : "无人滞留", tone: unassigned > 0 ? "warning" : "healthy" },
  ] satisfies Array<{ label: string; value: number; hint: string; tone: MdrStatTone }>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {stats.map((stat) => (
        <div key={stat.label} className="mdr-board-card rounded-2xl p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {stat.label}
          </div>
          <div className={`mt-3 text-3xl font-semibold tracking-[-0.04em] ${mdrStatToneClass(stat.tone)}`}>
            {stat.value}
          </div>
          <div className="mt-2 text-xs text-slate-500">{stat.hint}</div>
        </div>
      ))}
    </div>
  );
}

function PriorityQueueRow({ ticket }: { ticket: Ticket }) {
  const sla = slaRemaining(ticket.slaDeadline);

  return (
    <div className="mdr-board-soft rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500">{ticket.id}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${mdrSeverityBadgeClass(ticket.severity)}`}>
              {SEVERITY_LABELS[ticket.severity]}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${mdrStatusBadgeClass(ticket.status)}`}>
              {STATUS_LABELS[ticket.status]}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-950">{ticket.titleZh}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {ticket.host} · {ticket.source} · {ticket.mitreId}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-xs font-mono ${mdrSlaToneClass(sla.urgent)}`}>
            SLA {sla.text}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {ticket.assignee ? `${ticket.assignee.name} · T${ticket.assignee.tier}` : "待派发"}
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-600">
        下一步动作：{ticket.actions[0]}
      </div>
    </div>
  );
}

function AnalystCapacityRow({ analyst }: { analyst: Analyst }) {
  const load = analyst.activeTickets / analyst.maxTickets;
  const barColor = mdrLoadBarClass(load);
  const status =
    load >= 1 ? "满载" : load >= 0.8 ? "高压" : load >= 0.5 ? "紧凑" : "可承接";

  return (
    <div className="mdr-board-soft rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{analyst.avatar}</span>
            <div>
              <p className="text-sm font-semibold text-slate-950">{analyst.name}</p>
              <p className="text-[11px] text-slate-500">
                Tier {analyst.tier} · {analyst.region}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {analyst.skills.map((skill) => (
              <span
                key={skill}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${mdrSourceToneClass(skill)}`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
          {status}
        </span>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
          <span>负载</span>
          <span>
            {analyst.activeTickets}/{analyst.maxTickets}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(load, 1) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function AlertRow({ alert, onCreateTicket }: { alert: Alert; onCreateTicket: (alert: Alert) => void }) {
  return (
    <div className="glass rounded-2xl p-4 transition-all hover:border-black/[0.12]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${mdrSeverityDotClass(alert.severity)} ${
              alert.severity === "critical" ? "animate-pulse" : ""
            }`}
          />
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${mdrSeverityBadgeClass(alert.severity)}`}>
            {SEVERITY_LABELS[alert.severity]}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${mdrSourceToneClass(alert.source)}`}>
            {alert.source}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-950">{alert.titleZh}</div>
          <div className="mt-0.5 text-xs text-slate-500">{alert.title}</div>
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-slate-500">
            <span>Host {alert.host}</span>
            <span>MITRE {alert.mitreTactic} ({alert.mitreId})</span>
            <span suppressHydrationWarning>发现于 {timeAgo(alert.timestamp)}</span>
          </div>
        </div>
        <button
          onClick={() => onCreateTicket(alert)}
          className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${mdrActionToneClass("dashboard")}`}
        >
          创建工单
        </button>
      </div>
    </div>
  );
}

function TicketCard({
  ticket,
  onStatusChange,
}: {
  ticket: Ticket;
  onStatusChange: (id: string, next: TicketStatus) => void;
}) {
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
    <div className="glass rounded-2xl p-4 transition-all hover:border-black/[0.12]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500">{ticket.id}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${mdrSeverityBadgeClass(ticket.severity)}`}>
              {SEVERITY_LABELS[ticket.severity]}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${mdrStatusBadgeClass(ticket.status)}`}>
              {STATUS_LABELS[ticket.status]}
            </span>
          </div>
          <div className="mt-2 text-sm font-medium text-slate-950">{ticket.titleZh}</div>
          <div className="mt-0.5 text-xs text-slate-500">{ticket.title}</div>
        </div>
        <div className="shrink-0 text-right">
          <div suppressHydrationWarning className={`text-xs font-mono ${mdrSlaToneClass(sla.urgent)}`}>
            SLA {sla.text}
          </div>
          {ticket.assignee ? (
            <div className="mt-1 text-xs text-slate-500">
              {ticket.assignee.avatar} {ticket.assignee.name} (T{ticket.assignee.tier})
            </div>
          ) : (
            <div className={`mt-1 text-xs ${mdrStatToneClass("warning")}`}>待派发</div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-500">
        <span>Host {ticket.host}</span>
        <span>Source {ticket.source}</span>
        <span>MITRE {ticket.mitreId}</span>
        <span suppressHydrationWarning>创建于 {timeAgo(ticket.createdAt)}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {nextStatus[ticket.status] ? (
          <button
            onClick={() => onStatusChange(ticket.id, nextStatus[ticket.status]!)}
            className={`rounded-xl border px-3 py-1 text-[11px] font-medium transition-all ${mdrActionToneClass("progress")}`}
          >
            {nextLabel[ticket.status]}
          </button>
        ) : null}
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-500 transition-all hover:bg-slate-50"
        >
          {expanded ? "收起详情" : "查看详情"}
        </button>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-4 border-t border-black/[0.06] pt-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">处置建议</div>
            <div className="mt-2 space-y-1.5">
              {ticket.actions.map((action) => (
                <div key={action} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className={`mt-1 h-1.5 w-1.5 rounded-full ${mdrSeverityDotClass("low")}`} />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">时间线</div>
            <div className="mt-2 space-y-2">
              {ticket.timeline.map((item, index) => (
                <div key={`${item.time}-${index}`} className="flex gap-2 text-xs">
                  <span suppressHydrationWarning className="shrink-0 font-mono text-[10px] text-slate-400">
                    {timeAgo(item.time)}
                  </span>
                  <span className="text-slate-600">{item.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AnalystCard({ analyst }: { analyst: Analyst }) {
  const load = analyst.activeTickets / analyst.maxTickets;
  const barColor = mdrLoadBarClass(load, { dangerAt: 0.8, warningAt: 0.5 });

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{analyst.avatar}</span>
        <div>
          <div className="text-sm font-medium text-slate-950">{analyst.name}</div>
          <div className="text-[10px] text-slate-500">
            Tier {analyst.tier} · {analyst.region}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {analyst.skills.map((skill) => (
          <span key={skill} className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${mdrSourceToneClass(skill)}`}>
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[10px] text-slate-500">
          <span>工单负载</span>
          <span>
            {analyst.activeTickets}/{analyst.maxTickets}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(load, 1) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function DispatchToast({
  alert,
  analyst,
  onDone,
}: {
  alert: Alert;
  analyst: Analyst | null;
  onDone: () => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(onDone, 3000);
    return () => clearTimeout(timeout);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-blue-200 bg-white/95 p-4 shadow-[0_24px_60px_rgba(37,99,235,0.16)] backdrop-blur">
      <div className={`text-xs font-medium ${mdrStatToneClass("intake")}`}>工单已创建并自动派发</div>
      <div className="mt-1 text-sm text-slate-950">{alert.titleZh}</div>
      {analyst ? (
        <div className="mt-1 text-xs text-slate-500">
          派发至 {analyst.avatar} {analyst.name} (Tier {analyst.tier}, {alert.source} 专家)
        </div>
      ) : (
        <div className={`mt-1 text-xs ${mdrStatToneClass("warning")}`}>暂无可用分析师，已进入待派发队列</div>
      )}
    </div>
  );
}

export default function MDRPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [analysts, setAnalysts] = useState<Analyst[]>(MOCK_ANALYSTS);
  const [alerts, setAlerts] = useState<Alert[]>(
    MOCK_ALERTS.filter((alert) => !MOCK_TICKETS.some((ticket) => ticket.alertId === alert.id)),
  );
  const [toast, setToast] = useState<{ alert: Alert; analyst: Analyst | null } | null>(null);
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNowTs(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateTicket = useCallback(
    (alert: Alert) => {
      const assigned = dispatchTicket(alert, analysts);
      const slaMinutes = SLA_CONFIG[alert.severity].resolve;
      const now = new Date().toISOString();
      const newTicket: Ticket = {
        id: `TK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(tickets.length + 1).padStart(3, "0")}`,
        alertId: alert.id,
        title: alert.title,
        titleZh: alert.titleZh,
        severity: alert.severity,
        status: assigned ? "investigating" : "pending",
        assignee: assigned,
        source: alert.source,
        createdAt: now,
        slaDeadline: new Date(Date.now() + slaMinutes * 60000).toISOString(),
        mitreTactic: alert.mitreTactic,
        mitreId: alert.mitreId,
        host: alert.host,
        actions: ["分析告警详情", "确认影响范围", "执行处置措施", "更新工单状态"],
        timeline: [
          { time: now, event: `告警触发：${alert.titleZh}` },
          { time: now, event: `AI 分诊：${SEVERITY_LABELS[alert.severity]} 等级 → 自动创建工单` },
          ...(assigned
            ? [{ time: now, event: `自动派发 → ${assigned.name} (T${assigned.tier}, ${alert.source})` }]
            : [{ time: now, event: "等待派发：暂无可用分析师" }]),
        ],
      };

      setTickets((previous) => [newTicket, ...previous]);
      setAlerts((previous) => previous.filter((item) => item.id !== alert.id));

      if (assigned) {
        setAnalysts((previous) =>
          previous.map((analyst) =>
            analyst.id === assigned.id
              ? { ...analyst, activeTickets: analyst.activeTickets + 1 }
              : analyst,
          ),
        );
      }

      setToast({ alert, analyst: assigned });
    },
    [analysts, tickets.length],
  );

  const handleStatusChange = useCallback(
    (ticketId: string, newStatus: TicketStatus) => {
      setTickets((previous) =>
        previous.map((ticket) => {
          if (ticket.id !== ticketId) return ticket;

          return {
            ...ticket,
            status: newStatus,
            timeline: [
              ...ticket.timeline,
              { time: new Date().toISOString(), event: `状态变更 → ${STATUS_LABELS[newStatus]}` },
            ],
          };
        }),
      );

      if (newStatus === "resolved" || newStatus === "closed") {
        const ticket = tickets.find((item) => item.id === ticketId);

        if (ticket?.assignee) {
          setAnalysts((previous) =>
            previous.map((analyst) =>
              analyst.id === ticket.assignee!.id
                ? { ...analyst, activeTickets: Math.max(0, analyst.activeTickets - 1) }
                : analyst,
            ),
          );
        }
      }
    },
    [tickets],
  );

  const tabs: { key: Tab; label: string; note: string }[] = [
    { key: "dashboard", label: "总览", note: "Workbench" },
    { key: "alerts", label: "告警", note: "Incoming" },
    { key: "tickets", label: "工单", note: "Cases" },
    { key: "analysts", label: "分析师", note: "Capacity" },
  ];

  const openTickets = tickets.filter((ticket) => ticket.status !== "closed" && ticket.status !== "resolved");
  const closedTickets = tickets.filter((ticket) => ticket.status === "closed" || ticket.status === "resolved");
  const priorityQueue = [...openTickets].sort(compareTickets).slice(0, 4);
  const criticalTickets = openTickets.filter((ticket) => ticket.severity === "critical").sort(compareTickets);
  const analystCapacity = [...analysts].sort((a, b) => {
    const loadA = a.activeTickets / a.maxTickets;
    const loadB = b.activeTickets / b.maxTickets;

    if (loadA !== loadB) return loadB - loadA;
    return b.tier - a.tier;
  });
  const sourceSummary = (["EDR", "NDR", "SIEM", "Cloud", "Identity"] as const).map((source) => ({
    source,
    pendingAlerts: alerts.filter((alert) => alert.source === source).length,
    activeTickets: openTickets.filter((ticket) => ticket.source === source).length,
    availableAnalysts: analysts.filter(
      (analyst) => analyst.skills.includes(source) && analyst.activeTickets < analyst.maxTickets,
    ).length,
  }));
  const nextTicket = priorityQueue[0];
  const highPressureAnalysts = analystCapacity.filter(
    (analyst) => analyst.activeTickets / analyst.maxTickets >= 0.8,
  );
  const availableSeats = analysts.reduce(
    (total, analyst) => total + Math.max(0, analyst.maxTickets - analyst.activeTickets),
    0,
  );
  const atRiskCount = openTickets.filter(
    (ticket) => slaRemainingMs(ticket.slaDeadline) <= 15 * 60_000,
  ).length;
  const activeSources = sourceSummary.filter((item) => item.pendingAlerts > 0).map((item) => item.source);
  const heroStats = [
    { label: "活跃工单", value: openTickets.length, tone: "neutral" },
    { label: "待分诊告警", value: alerts.length, tone: "intake" },
    { label: "SLA 风险", value: atRiskCount, tone: atRiskCount > 0 ? "critical" : "healthy" },
    { label: "可用席位", value: availableSeats, tone: availableSeats > 0 ? "healthy" : "warning" },
  ] satisfies Array<{ label: string; value: number; tone: MdrStatTone }>;

  return (
    <MdrShell>
      <main className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="glass rounded-[32px] p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${mdrActionToneClass("command")}`}>
                Command Deck
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                MDR 工单派发系统
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                告警分诊 → SLA 追踪 → 闭环处置
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              先把当前班次最该处理的工单推到桌面，再看告警、派发和容量。
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              这页不再只是把告警、工单和分析师平铺出来，而是优先告诉你现在要先盯什么、谁还有承接能力、哪些来源正在堆积，减少值班台“看到了很多，但不知道先做什么”的停顿。
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/mdr/splunk"
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${mdrActionToneClass("splunk")}`}
              >
                Splunk 对接配置
              </Link>
              <Link
                href="/mdr/network"
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${mdrActionToneClass("network")}`}
              >
                客户网络运维
              </Link>
              <Link
                href="/intelligence"
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${mdrActionToneClass("intel")}`}
              >
                情报中心
              </Link>
              <Link
                href="/mdr/dashboard"
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${mdrActionToneClass("dashboard")}`}
              >
                运营大屏
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {heroStats.map((item) => (
                <div key={item.label} className="mdr-board-card rounded-2xl p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {item.label}
                  </div>
                  <div className={`mt-3 text-3xl font-semibold tracking-[-0.04em] ${mdrStatToneClass(item.tone)}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="mdr-board-soft rounded-[24px] p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Shift Brief
                  </p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                    {priorityQueue.length} 项待看
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">
                  {nextTicket
                    ? `${nextTicket.host} 是当前班次的首要焦点`
                    : "当前班次没有需要优先升级的工单"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {nextTicket
                    ? `${nextTicket.titleZh} 目前处于 ${STATUS_LABELS[nextTicket.status]}，SLA 剩余 ${slaRemaining(nextTicket.slaDeadline).text}。值班台会优先把严重、待派发、逼近时限的事项推到队首。`
                    : "当前班次没有活跃工单，工作台会在新告警进入时自动把最需要接手的事项推到顶部。"}
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      首要动作
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      {nextTicket ? nextTicket.actions[0] : "暂无需要立即触发的处置动作"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      容量提示
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      {highPressureAnalysts.length > 0
                        ? `${highPressureAnalysts[0].name} 等 ${highPressureAnalysts.length} 位分析师已进入高压区，优先考虑把新工单派给剩余容量更充足的席位。`
                        : "当前分析师负载整体可控，可继续按技能优先和负载均衡派单。"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      覆盖提示
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      {activeSources.length > 0
                        ? `当前有待分诊积压的来源：${activeSources.join(" / ")}。`
                        : "当前各来源没有未入单的积压告警。"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mdr-board-card rounded-[24px] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Routing Notes
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    "严重与高危告警优先派给高 Tier 且当前仍有容量的分析师。",
                    "没有合适承接人时，工单会先停留在待派发队列，而不是静默丢失。",
                    "值班工作台优先展示等待动作、逼近时限和仍未分配的事项。",
                  ].map((note) => (
                    <div key={note} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-[30px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Priority Queue
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    当前最值得盯的工单
                  </h2>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                  Top 4
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {priorityQueue.length > 0 ? (
                  priorityQueue.map((ticket) => <PriorityQueueRow key={ticket.id} ticket={ticket} />)
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
                    当前没有活跃工单，队列会在新告警进入后自动补齐。
                  </div>
                )}
              </div>
            </div>

            <div className="glass rounded-[30px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Analyst Capacity
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    席位负载与承接能力
                  </h2>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                  {availableSeats} 个空余席位
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {analystCapacity.slice(0, 4).map((analyst) => (
                  <AnalystCapacityRow key={analyst.id} analyst={analyst} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <StatsBar tickets={tickets} alerts={alerts} analysts={analysts} nowTs={nowTs} />
        </section>

        <section className="mt-6 glass rounded-[28px] p-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`min-w-[132px] rounded-[20px] border px-4 py-3 text-left transition-all ${
                  tab === item.key
                    ? "border-slate-200 bg-white text-slate-950 shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
                    : "border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-white/70 hover:text-slate-900"
                }`}
              >
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {item.note}
                </div>
              </button>
            ))}
          </div>
        </section>

        {tab === "dashboard" ? (
          <section className="mt-6 grid gap-5 xl:grid-cols-[1.06fr_0.94fr]">
            <div className="space-y-5">
              <div className="glass rounded-[30px] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Response Board
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      需要立即动作的工单
                    </h2>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${mdrSeverityBadgeClass("critical")}`}>
                    严重 {criticalTickets.length}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {criticalTickets.length > 0 ? (
                    criticalTickets.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} onStatusChange={handleStatusChange} />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
                      当前没有严重工单，工作台会把高危和逼近时限的事项补到优先位。
                    </div>
                  )}
                </div>
              </div>

              <div className="glass rounded-[30px] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Workflow
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      工单生命周期
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">班次阅读顺序</span>
                </div>
                <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 text-[11px]">
                  {WORKFLOW_STEPS.map((step, index) => (
                    <div key={step.label} className="flex items-center gap-2">
                      <div className="flex min-w-[108px] flex-col rounded-2xl border border-slate-200 bg-white/80 px-3 py-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Step {index + 1}
                        </span>
                        <span className="mt-2 text-sm font-semibold text-slate-950">{step.label}</span>
                        <span className="mt-1 text-[10px] leading-5 text-slate-500">{step.sub}</span>
                      </div>
                      {index < WORKFLOW_STEPS.length - 1 ? <span className="text-slate-400">→</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="glass rounded-[30px] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Coverage Matrix
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      来源覆盖与积压情况
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">按来源阅读</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {sourceSummary.map((item) => (
                    <div key={item.source} className="mdr-board-soft rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${mdrSourceToneClass(item.source)}`}>
                          {item.source}
                        </span>
                        <span className="text-[11px] text-slate-500">{item.availableAnalysts} 位可接手</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            待分诊
                          </div>
                          <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                            {item.pendingAlerts}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            活跃工单
                          </div>
                          <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                            {item.activeTickets}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-[30px] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Incoming Alerts
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      还未入单的告警
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">{alerts.length} 条待处理</span>
                </div>
                <div className="mt-4 space-y-3">
                  {alerts.slice(0, 4).map((alert) => (
                    <AlertRow key={alert.id} alert={alert} onCreateTicket={handleCreateTicket} />
                  ))}
                  {alerts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
                      当前所有告警都已进入工单流程。
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {tab === "alerts" ? (
          <section className="mt-6">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Incoming Alerts
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {alerts.length > 0 ? `${alerts.length} 条待分诊告警` : "当前所有告警都已处理"}
              </h2>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} onCreateTicket={handleCreateTicket} />
              ))}
              {alerts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500">
                  当前没有待分诊告警。
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {tab === "tickets" ? (
          <section className="mt-6">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Active Cases
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                活跃工单 {openTickets.length}
              </h2>
            </div>
            <div className="space-y-3">
              {openTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} onStatusChange={handleStatusChange} />
              ))}
            </div>
            {closedTickets.length > 0 ? (
              <>
                <div className="mt-8 mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Closed Cases
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">已关闭工单 {closedTickets.length}</h3>
                </div>
                <div className="space-y-3 opacity-70">
                  {closedTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        {tab === "analysts" ? (
          <section className="mt-6">
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Analyst Bench
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                SOC 分析师团队 {analysts.length}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analysts.map((analyst) => (
                <AnalystCard key={analyst.id} analyst={analyst} />
              ))}
            </div>
            <div className="glass mt-6 rounded-[28px] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Dispatch Rules
              </p>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {[
                  "技能匹配：告警来源与分析师技能标签优先对齐。",
                  "负载均衡：优先派发给当前负载更低的分析师。",
                  "Tier 优先：严重和高危告警优先给高 Tier 席位。",
                  "SLA 时效：严重 15 分钟响应 / 4 小时解决；高危 30 分钟 / 8 小时。",
                ].map((rule) => (
                  <div key={rule} className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm leading-6 text-slate-600">
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      {toast ? <DispatchToast alert={toast.alert} analyst={toast.analyst} onDone={() => setToast(null)} /> : null}
    </MdrShell>
  );
}
