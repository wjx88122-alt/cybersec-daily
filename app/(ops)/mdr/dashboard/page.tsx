"use client";

import { useState, useEffect, useMemo } from "react";
import { SystemIcon, type SystemIconName } from "@/components/ui/SystemIcon";
import MdrShell from "@/components/shells/MdrShell";
import { formatShanghaiDateTime } from "@/lib/threat-map";
import {
  MOCK_ALERTS, MOCK_TICKETS, MOCK_ANALYSTS,
} from "@/lib/mdr-mock";
import type {
  AttackOperationsSnapshot,
  AttackPortPressure,
  AttackSourceStatus,
} from "@/lib/attack-data-source";
import {
  MOCK_CLIENTS, MOCK_DEVICES, MOCK_NET_ALERTS, MOCK_OPS_TICKETS,
} from "@/lib/network-mock";
import ThreatMap from "@/components/ThreatMap";
import {
  mdrConnectionDotClass,
  mdrDeviceStatusHex,
  mdrHealthScoreHex,
  mdrHealthScoreToneClass,
  mdrSeverityHex,
  mdrSourceHex,
  mdrTicketStatusHex,
} from "../theme";
import type { AlertSource, Severity } from "@/lib/mdr-mock";

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
  const safeTotal = total || 1;
  const segments = data.map((d, i) => {
    const startValue = data
      .slice(0, i)
      .reduce((sum, item) => sum + item.value, 0);
    const endValue = startValue + d.value;
    return {
      ...d,
      start: (startValue / safeTotal) * 360,
      end: (endValue / safeTotal) * 360,
    };
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
      <circle cx={cx} cy={cy} r={r * 0.6} fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={20} fill="#0f172a" fontWeight={700}>{total}</text>
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
          <span className="text-[10px] text-slate-500 font-mono">{d.value}</span>
          <div className="w-8 rounded-t-sm transition-all duration-1000" style={{ height: (d.value / max) * maxH, background: d.color, minHeight: 2 }} />
          <span className="text-[9px] text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

type TickerItem = { text: string; severity: string; time: string };

/* ── Scrolling Alert Ticker ── */
function AlertTicker({ items, className = "h-[180px]" }: { items: TickerItem[]; className?: string }) {
  const [tickerReady, setTickerReady] = useState(false);
  const tickerItems = tickerReady ? [...items, ...items] : [];

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setTickerReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="animate-scroll space-y-2">
        {tickerItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: mdrSeverityHex((item.severity as Severity) || "low") }}
            />
            <span className="text-xs text-slate-700 flex-1 truncate">{item.text}</span>
            <span className="text-[10px] text-slate-500 shrink-0" suppressHydrationWarning>{item.time}</span>
          </div>
        ))}
        {!tickerReady && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-slate-200 bg-white/70 text-xs text-slate-500">
            实时安全事件同步中...
          </div>
        )}
      </div>
    </div>
  );
}

function ThreatIntelRail({
  snapshot,
  loading,
  error,
  tickerItems,
  attackReportTotal,
}: {
  snapshot: AttackOperationsSnapshot | null;
  loading: boolean;
  error: string;
  tickerItems: TickerItem[];
  attackReportTotal: number;
}) {
  const topAttacker = snapshot?.topAttackers[0];
  const topPorts = snapshot?.topPorts.slice(0, 3) ?? [];
  const topPort = topPorts[0];
  const maxPortRecords = Math.max(...topPorts.map((port) => port.records), 1);
  const telemetryCards = [
    {
      label: "攻击源",
      value: snapshot?.topAttackers.length ?? 0,
      unit: "个",
      icon: "target",
      color: mdrSeverityHex("high"),
    },
    {
      label: "扫描报告",
      value: attackReportTotal,
      unit: "次",
      icon: "activity",
      color: mdrSeverityHex("critical"),
    },
    {
      label: "高压端口",
      value: snapshot?.topPorts.length ?? 0,
      unit: "个",
      icon: "network",
      color: "#0891b2",
    },
    {
      label: "在野漏洞",
      value: snapshot?.kevHighlights.length ?? 0,
      unit: "项",
      icon: "alert",
      color: "#7c3aed",
    },
  ] satisfies Array<{
    label: string;
    value: number;
    unit: string;
    icon: SystemIconName;
    color: string;
  }>;

  return (
    <aside className="threat-intel-rail mdr-board-card flex h-full min-h-[640px] flex-col gap-3 overflow-hidden rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <SystemIcon className="system-icon" name="activity" size={14} />
          实时安全事件
        </div>
        <div className="flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${mdrConnectionDotClass(error ? "error" : "success")}`} />
          <span className={`text-[10px] font-bold ${error ? "text-red-700" : "text-emerald-700"}`}>LIVE</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
        <AlertTicker items={tickerItems} className="h-[260px]" />
      </div>

      <div className="attack-telemetry-strip grid grid-cols-2 gap-2">
        {telemetryCards.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-slate-500">{item.label}</span>
              <SystemIcon className="system-icon text-slate-400" name={item.icon} size={12} />
            </div>
            <div className="mt-2 font-mono text-lg font-black text-slate-950">
              <span style={{ color: item.color }}>{formatCompactNumber(item.value)}</span>
              <span className="ml-1 text-[10px] font-semibold text-slate-500">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
            <SystemIcon className="system-icon" name="radar" size={13} />
            当前攻击面焦点
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
            {formatFeedTime(snapshot?.updatedAt)}
          </span>
        </div>

        {topAttacker ? (
          <div className="rounded-lg border border-red-100 bg-red-50/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-mono text-sm font-black text-slate-950">{topAttacker.indicator}</div>
                <div className="mt-1 text-[11px] leading-5 text-slate-600">
                  Top #{topAttacker.rank} · {topAttacker.mitreId} · {formatCompactNumber(topAttacker.targets ?? 0)} targets
                </div>
              </div>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: mdrSeverityHex(topAttacker.severity) }}>
                {formatCompactNumber(topAttacker.reports ?? 0)}
              </span>
            </div>
          </div>
        ) : (
          <EmptyLiveFeed label={loading ? "正在同步攻击源焦点..." : "暂无攻击源焦点"} />
        )}

        <div className="mt-2 grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          {topPorts.length > 0 ? topPorts.map((port) => (
            <PortPressureCard key={port.port} port={port} maxRecords={maxPortRecords} />
          )) : (
            <EmptyLiveFeed label={loading ? "正在同步端口热区..." : "暂无端口压力数据"} />
          )}
        </div>
      </div>

      <div className="source-health-grid grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <AttackSourceBadge
          icon="globe"
          label="DShield 攻击遥测"
          status={snapshot?.sourceStatus.dshield ?? (loading ? "degraded" : "offline")}
        />
        <AttackSourceBadge
          icon="shield"
          label="CISA KEV 在野利用"
          status={snapshot?.sourceStatus.cisaKev ?? (loading ? "degraded" : "offline")}
        />
      </div>

      <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
          <SystemIcon className="system-icon" name="workflow" size={12} />
          Ops next
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          {topAttacker && topPort
            ? `先核查 ${topAttacker.indicator} 是否触达客户边界，再把 :${topPort.port} 端口压力同步给防火墙、NDR 和 SIEM 规则观察项。`
            : "等待攻击遥测补齐后，右侧会自动生成攻击源、端口和来源健康的联动研判。"}
        </p>
      </div>
    </aside>
  );
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatFeedTime(value?: string) {
  if (!value) return "等待同步";
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "等待同步";

  return new Date(parsed).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function sourceStatusText(status?: AttackSourceStatus) {
  if (status === "online") return "在线";
  if (status === "degraded") return "降级";
  return "离线";
}

function sourceStatusClass(status?: AttackSourceStatus) {
  if (status === "online") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "degraded") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

function AttackSourceBadge({
  label,
  status,
  icon,
}: {
  label: string;
  status?: AttackSourceStatus;
  icon: SystemIconName;
}) {
  return (
    <div className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${sourceStatusClass(status)}`}>
      <span className="flex min-w-0 items-center gap-2 text-xs font-semibold">
        <SystemIcon className="system-icon shrink-0" name={icon} size={14} />
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 text-[10px] font-bold">{sourceStatusText(status)}</span>
    </div>
  );
}

function EmptyLiveFeed({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
      {label}
    </div>
  );
}

function AttackRadarPanel({
  snapshot,
  loading,
  error,
}: {
  snapshot: AttackOperationsSnapshot | null;
  loading: boolean;
  error: string;
}) {
  const topAttackers = snapshot?.topAttackers.slice(0, 6) ?? [];
  const topPorts = snapshot?.topPorts.slice(0, 6) ?? [];
  const kevHighlights = snapshot?.kevHighlights.slice(0, 2) ?? [];
  const maxPortRecords = Math.max(...topPorts.map((port) => port.records), 1);

  return (
    <section className="mdr-board-card col-span-12 overflow-hidden rounded-2xl p-4">
      <div className="grid grid-cols-12 items-start gap-4">
        <div className="col-span-12 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 xl:col-span-3">
          <div className="flex items-start gap-3">
            <span className="system-icon-badge h-11 min-w-11 w-11 border-blue-200 bg-white text-blue-700">
              <SystemIcon className="system-icon" name="radar" size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-700">真实攻击数据源</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">攻击雷达</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                基于 DShield 全球攻击遥测刷新攻击源、端口热度，并用 CISA KEV 标注正在被利用的漏洞压力。
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <AttackSourceBadge
              icon="globe"
              label="DShield 攻击遥测"
              status={snapshot?.sourceStatus.dshield ?? (loading ? "degraded" : "offline")}
            />
            <AttackSourceBadge
              icon="shield"
              label="CISA KEV 在野利用"
              status={snapshot?.sourceStatus.cisaKev ?? (loading ? "degraded" : "offline")}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                <SystemIcon className="system-icon" name="activity" size={12} />
                InfoCon
              </div>
              <div className="mt-2 text-xl font-black text-emerald-700">{snapshot?.infocon ?? "..."}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                <SystemIcon className="system-icon" name="clock" size={12} />
                Last Sync
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">{formatFeedTime(snapshot?.updatedAt)}</div>
            </div>
          </div>

          {(error || snapshot?.degraded) && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {error || "部分攻击源暂时降级，已保留可用源继续刷新。"}
            </div>
          )}

          <div className="mt-4 rounded-xl border border-blue-100 bg-white/80 p-3">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              <SystemIcon className="system-icon" name="workflow" size={12} />
              Ops Action
            </div>
            <div className="space-y-2 text-xs leading-5 text-slate-600">
              <div className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>优先核查 Top IP 是否命中客户边界、VPN、邮件网关或蜜罐。</span>
              </div>
              <div className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                <span>对端口热区同步生成防火墙、NDR、SIEM 规则观察项。</span>
              </div>
              <div className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                <span>KEV 高亮用于校准补丁优先级和客户暴露面巡检。</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 rounded-xl border border-slate-200 bg-white p-4 xl:col-span-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="system-icon-badge h-9 min-w-9 w-9 border-blue-100 bg-blue-50 text-blue-700">
                <SystemIcon className="system-icon" name="target" size={16} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Top Offensive IPs</p>
                <h3 className="text-base font-black text-slate-950">全球攻击源排行</h3>
              </div>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-500">
              DShield
            </span>
          </div>

          <div className="grid gap-2">
            {topAttackers.length > 0 ? topAttackers.map((attacker) => (
              <div key={attacker.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white"
                  style={{ background: mdrSeverityHex(attacker.severity) }}
                >
                  {attacker.rank}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-mono text-sm font-black text-slate-950">{attacker.indicator}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                    <span>{attacker.mitreId}</span>
                    <span>Targets {formatCompactNumber(attacker.targets ?? 0)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-black text-slate-950">{formatCompactNumber(attacker.reports ?? 0)}</div>
                  <div className="text-[10px] text-slate-500">reports</div>
                </div>
              </div>
            )) : (
              <EmptyLiveFeed label={loading ? "正在同步 DShield 攻击源..." : "暂无可用攻击源数据"} />
            )}
          </div>
        </div>

        <div className="col-span-12 grid gap-4 xl:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="system-icon-badge h-9 min-w-9 w-9 border-cyan-100 bg-cyan-50 text-cyan-700">
                  <SystemIcon className="system-icon" name="network" size={16} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Port Pressure</p>
                  <h3 className="text-base font-black text-slate-950">被扫端口热区</h3>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500">{topPorts.length} ports</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {topPorts.length > 0 ? topPorts.map((port) => (
                <PortPressureCard key={port.port} port={port} maxRecords={maxPortRecords} />
              )) : (
                <div className="col-span-2">
                  <EmptyLiveFeed label={loading ? "正在同步端口热区..." : "暂无端口压力数据"} />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="system-icon-badge h-9 min-w-9 w-9 border-rose-100 bg-rose-50 text-rose-700">
                <SystemIcon className="system-icon" name="alert" size={16} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Exploited CVEs</p>
                <h3 className="text-base font-black text-slate-950">最新在野利用</h3>
              </div>
            </div>

            <div className="grid gap-2">
              {kevHighlights.length > 0 ? kevHighlights.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-black text-slate-950">{item.indicator}</div>
                      <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{item.titleZh}</div>
                    </div>
                    <span
                      className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: mdrSeverityHex(item.severity) }}
                    />
                  </div>
                </div>
              )) : (
                <EmptyLiveFeed label={loading ? "正在同步 CISA KEV..." : "暂无 KEV 高亮信息"} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PortPressureCard({ port, maxRecords }: { port: AttackPortPressure; maxRecords: number }) {
  const ratio = Math.max(8, Math.min(100, (port.records / maxRecords) * 100));

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-lg font-black text-slate-950">:{port.port}</div>
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: mdrSeverityHex(port.severity) }}
        />
      </div>
      <div className="mt-1 truncate text-xs font-bold text-slate-600">{port.labelZh}</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-cyan-500 transition-all duration-700"
          style={{ width: `${ratio}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>{formatCompactNumber(port.sources)} sources</span>
        <span>{formatCompactNumber(port.records)} records</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Dashboard Main
   ══════════════════════════════════════════════ */
export default function DashboardPage() {
  const [clock, setClock] = useState("");
  const [attackSnapshot, setAttackSnapshot] = useState<AttackOperationsSnapshot | null>(null);
  const [attackLoading, setAttackLoading] = useState(true);
  const [attackError, setAttackError] = useState("");

  useEffect(() => {
    const updateClock = () => setClock(formatShanghaiDateTime());
    const frame = requestAnimationFrame(updateClock);
    const iv = setInterval(updateClock, 1000);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(iv);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAttackFeed = async () => {
      try {
        setAttackError("");
        const response = await fetch("/api/attack-feed", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Attack feed responded ${response.status}`);
        }
        const snapshot = (await response.json()) as AttackOperationsSnapshot;
        if (!cancelled) {
          setAttackSnapshot(snapshot);
          setAttackLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setAttackError(error instanceof Error ? error.message : "真实攻击源暂时不可用");
          setAttackLoading(false);
        }
      }
    };

    loadAttackFeed();
    const interval = setInterval(loadAttackFeed, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const liveAlerts = attackSnapshot?.alerts.length ? attackSnapshot.alerts : MOCK_ALERTS;
  const allAlerts = useMemo(() => [...liveAlerts, ...MOCK_NET_ALERTS], [liveAlerts]);
  const totalClients = MOCK_CLIENTS.length;
  const totalDevices = MOCK_DEVICES.length;
  const onlineDevices = MOCK_DEVICES.filter((d) => d.status === "online").length;
  const attackReportTotal = attackSnapshot?.topAttackers.reduce((sum, attacker) => sum + (attacker.reports ?? 0), 0) ?? 0;
  const totalTickets = MOCK_TICKETS.length + MOCK_OPS_TICKETS.length;
  const resolvedTickets = [...MOCK_TICKETS, ...MOCK_OPS_TICKETS].filter((t) => "status" in t && (t.status === "resolved" || t.status === "closed")).length;

  const sevData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    allAlerts.forEach((a) => counts[a.severity]++);
    return [
      { label: "严重", value: counts.critical, color: mdrSeverityHex("critical") },
      { label: "高危", value: counts.high, color: mdrSeverityHex("high") },
      { label: "中危", value: counts.medium, color: mdrSeverityHex("medium") },
      { label: "低危", value: counts.low, color: mdrSeverityHex("low") },
    ];
  }, [allAlerts]);

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    liveAlerts.forEach((a) => { counts[a.source] = (counts[a.source] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({
      label: k, value: v, color: mdrSourceHex(k as AlertSource),
    }));
  }, [liveAlerts]);

  const deviceStatusData = useMemo(() => {
    const counts: Record<string, number> = { online: 0, warning: 0, critical: 0, offline: 0 };
    MOCK_DEVICES.forEach((d) => counts[d.status]++);
    return [
      { label: "正常", value: counts.online, color: mdrDeviceStatusHex("online") },
      { label: "警告", value: counts.warning, color: mdrDeviceStatusHex("warning") },
      { label: "严重", value: counts.critical, color: mdrDeviceStatusHex("critical") },
      { label: "离线", value: counts.offline, color: mdrDeviceStatusHex("offline") },
    ];
  }, []);

  const tickerItems = useMemo(() => {
    const all = [
      ...liveAlerts.map((a) => ({ text: a.titleZh, severity: a.severity, time: new Date(a.timestamp).toLocaleTimeString("zh-CN", { hour12: false }).slice(0, 5) })),
      ...MOCK_NET_ALERTS.map((a) => ({ text: a.title, severity: a.severity, time: new Date(a.timestamp).toLocaleTimeString("zh-CN", { hour12: false }).slice(0, 5) })),
    ];
    return all.sort((a, b) => b.time.localeCompare(a.time));
  }, [liveAlerts]);

  const clientRanking = useMemo(() =>
    [...MOCK_CLIENTS].sort((a, b) => a.networkScore - b.networkScore), []);

  const analystData = useMemo(() =>
    MOCK_ANALYSTS.map((a) => ({
      label: a.name, value: a.activeTickets,
      color:
        a.activeTickets >= a.maxTickets
          ? mdrSeverityHex("critical")
          : a.activeTickets >= a.maxTickets * 0.6
            ? mdrSeverityHex("medium")
            : mdrDeviceStatusHex("online"),
    })), []);

  return (
    <MdrShell className="text-slate-900 overflow-hidden" showNav={false}>
      <style jsx global>{`
        @keyframes scroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        .animate-scroll { animation: scroll 20s linear infinite; }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 15px rgba(37,99,235,0.3); } 50% { box-shadow: 0 0 30px rgba(37,99,235,0.6); } }
        .glow-blue { animation: pulse-glow 3s ease-in-out infinite; }
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
        .scan-line::after { content: ''; position: absolute; left: 0; width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(37,99,235,0.5), transparent); animation: scan 4s linear infinite; }
      `}</style>

      {/* Header */}
      <header className="relative h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white/85 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-sm font-bold">M</div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-slate-950">MDR 安全运营中心</h1>
            <p className="text-[10px] text-slate-500">Managed Detection & Response · Security Operations Center</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${mdrConnectionDotClass("success")}`} />
            <span className="text-xs text-emerald-700">系统运行中</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono text-blue-600" suppressHydrationWarning>
              {clock}
            </div>
            <div className="text-[10px] text-slate-500">Asia/Shanghai</div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </header>

      <main className="p-4 grid grid-cols-12 gap-3">
        {/* KPI Cards */}
        <div className="col-span-12 grid grid-cols-6 gap-3">
          {[
            { icon: "briefcase", label: "托管客户", value: totalClients, unit: "家", color: "from-blue-600 to-blue-400" },
            { icon: "server", label: "在线设备", value: onlineDevices, unit: `/${totalDevices}`, color: "from-green-600 to-green-400" },
            { icon: "target", label: "攻击源", value: attackSnapshot?.topAttackers.length ?? 0, unit: "个", color: "from-orange-600 to-orange-400" },
            { icon: "activity", label: "扫描报告", value: attackReportTotal, unit: "次", color: "from-red-600 to-red-400" },
            { icon: "network", label: "高压端口", value: attackSnapshot?.topPorts.length ?? 0, unit: "个", color: "from-cyan-600 to-cyan-400" },
            { icon: "alert", label: "在野漏洞", value: attackSnapshot?.kevHighlights.length ?? 0, unit: "项", color: "from-purple-600 to-purple-400" },
          ].map((kpi) => (
            <div key={kpi.label} className="mdr-board-card relative rounded-xl p-4 overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${kpi.color}`} />
              <div className="flex items-center justify-between">
                <span className="system-icon-badge h-9 min-w-9 w-9">
                  <SystemIcon className="system-icon" name={kpi.icon as SystemIconName} size={17} />
                </span>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-slate-950">
                    <AnimatedNumber value={kpi.value} />
                    <span className="text-xs text-slate-500 ml-1">{kpi.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{kpi.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AttackRadarPanel snapshot={attackSnapshot} loading={attackLoading} error={attackError} />

        {/* Global Threat Map + Intelligence Rail */}
        <section className="global-threat-overview col-span-12 grid gap-3 xl:grid-cols-[minmax(0,1.36fr)_minmax(360px,0.64fr)] xl:items-stretch">
          <div className="min-w-0">
            <ThreatMap snapshot={attackSnapshot} loading={attackLoading} error={attackError} />
          </div>
          <ThreatIntelRail
            snapshot={attackSnapshot}
            loading={attackLoading}
            error={attackError}
            tickerItems={tickerItems}
            attackReportTotal={attackReportTotal}
          />
        </section>

        {/* Threat Distribution */}
        <div className="mdr-board-card col-span-3 rounded-xl p-4 relative scan-line">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-600">
            <SystemIcon className="system-icon" name="target" size={14} />
            威胁等级分布
          </div>
          <div className="flex items-center justify-center">
            <RingChart data={sevData} size={140} />
          </div>
          <div className="flex justify-center gap-3 mt-3">
            {sevData.map((d) => (
              <div key={d.label} className="flex items-center gap-1 text-[10px]">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-slate-600">{d.label}</span>
                <span className="text-slate-800 font-mono">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Source + Device Status */}
        <div className="mdr-board-card col-span-5 rounded-xl p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-600">
            <SystemIcon className="system-icon" name="radar" size={14} />
            告警来源分布
          </div>
          <BarChart data={sourceData} maxH={70} />
          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600">
              <SystemIcon className="system-icon" name="server" size={14} />
              设备状态
            </div>
            <div className="flex justify-center gap-4">
              {deviceStatusData.map((d) => (
                <div key={d.label} className="text-center">
                  <div className="text-lg font-bold font-mono" style={{ color: d.color }}>{d.value}</div>
                  <div className="text-[9px] text-slate-500">{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Client Health Ranking */}
        <div className="mdr-board-card col-span-4 rounded-xl p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-600">
            <SystemIcon className="system-icon" name="chart" size={14} />
            客户安全健康排名
          </div>
          <div className="space-y-2">
            {clientRanking.map((c, i) => {
              const scoreColor = mdrHealthScoreHex(c.networkScore);
              return (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="text-sm font-bold text-slate-500 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-800 font-medium">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.industry} · {c.region} · {c.deviceCount} 台设备</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold font-mono ${mdrHealthScoreToneClass(c.networkScore)}`}>{c.networkScore}</div>
                    <div className="w-16 h-1 rounded-full bg-slate-200 mt-1">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${c.networkScore}%`, background: scoreColor }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Protection Stats */}
        <div className="mdr-board-card glow-blue col-span-6 rounded-xl p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-600">
            <SystemIcon className="system-icon" name="shield" size={14} />
            安全防护能力
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "威胁检出率", value: "99.7%", icon: "target", desc: "AI + 规则双引擎" },
              { label: "平均响应时间", value: "< 8min", icon: "clock", desc: "7×24 SOC 值守" },
              { label: "工单解决率", value: `${Math.round((resolvedTickets / Math.max(totalTickets, 1)) * 100)}%`, icon: "check", desc: "闭环处置" },
              { label: "SLA 达标率", value: "98.5%", icon: "chart", desc: "严格时效管控" },
              { label: "覆盖攻击面", value: "5 维", icon: "search", desc: "EDR/NDR/SIEM/Cloud/ID" },
              { label: "MITRE 覆盖", value: "87%", icon: "workflow", desc: "ATT&CK 战术覆盖" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-700">
                  <SystemIcon className="system-icon" name={s.icon as SystemIconName} size={14} />
                </div>
                <div className="text-base font-bold text-blue-700 font-mono">{s.value}</div>
                <div className="text-[10px] text-slate-700 mt-0.5">{s.label}</div>
                <div className="text-[9px] text-slate-500">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Analyst Workload */}
        <div className="mdr-board-card col-span-6 rounded-xl p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-600">
            <SystemIcon className="system-icon" name="users" size={14} />
            分析师工作负载
          </div>
          <BarChart data={analystData} maxH={60} />
          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600">
              <SystemIcon className="system-icon" name="case" size={14} />
              工单状态分布
            </div>
            <div className="flex justify-center gap-3">
              {[
                { label: "待处理", count: MOCK_TICKETS.filter((t) => t.status === "pending").length, color: mdrTicketStatusHex("pending") },
                { label: "调查中", count: MOCK_TICKETS.filter((t) => t.status === "investigating").length, color: mdrTicketStatusHex("investigating") },
                { label: "等待反馈", count: MOCK_TICKETS.filter((t) => t.status === "awaiting_feedback").length, color: mdrTicketStatusHex("awaiting_feedback") },
                { label: "已解决", count: MOCK_TICKETS.filter((t) => t.status === "resolved" || t.status === "closed").length, color: mdrTicketStatusHex("resolved") },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-base font-bold font-mono" style={{ color: s.color }}>{s.count}</div>
                  <div className="text-[9px] text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </MdrShell>
  );
}
