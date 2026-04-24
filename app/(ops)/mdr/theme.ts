import type { AlertSource, Severity, TicketStatus } from "@/lib/mdr-mock";
import type { ClientTier, DeviceStatus, OpsTicket } from "@/lib/network-mock";

export type MdrStatTone = "neutral" | "intake" | "critical" | "healthy" | "warning";
export type MdrActionTone =
  | "command"
  | "splunk"
  | "network"
  | "intel"
  | "dashboard"
  | "progress"
  | "primary"
  | "preview"
  | "success"
  | "live"
  | "secondary";
export type MdrConnectionState = "idle" | "testing" | "success" | "error";

type OpsTicketPriority = OpsTicket["priority"];
type OpsTicketStatus = OpsTicket["status"];

const MDR_SEVERITY_BADGE_CLASSES: Record<Severity, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-blue-200 bg-blue-50 text-blue-700",
};

const MDR_SEVERITY_DOT_CLASSES: Record<Severity, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
};

const MDR_SEVERITY_HEX: Record<Severity, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#3b82f6",
};

const MDR_STATUS_BADGE_CLASSES: Record<TicketStatus, string> = {
  pending: "bg-slate-100 text-slate-600",
  investigating: "bg-cyan-50 text-cyan-700",
  awaiting_feedback: "bg-violet-50 text-violet-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-slate-200 text-slate-500",
};

const MDR_TICKET_STATUS_HEX: Record<TicketStatus, string> = {
  pending: "#64748b",
  investigating: "#06b6d4",
  awaiting_feedback: "#8b5cf6",
  resolved: "#22c55e",
  closed: "#22c55e",
};

const MDR_SOURCE_TONE_CLASSES: Record<AlertSource, string> = {
  EDR: "border-blue-200 bg-blue-50 text-blue-700",
  NDR: "border-cyan-200 bg-cyan-50 text-cyan-700",
  SIEM: "border-violet-200 bg-violet-50 text-violet-700",
  Cloud: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Identity: "border-amber-200 bg-amber-50 text-amber-700",
};

const MDR_SOURCE_HEX: Record<AlertSource, string> = {
  EDR: "#3b82f6",
  NDR: "#06b6d4",
  SIEM: "#8b5cf6",
  Cloud: "#22c55e",
  Identity: "#f59e0b",
};

const MDR_STAT_TONE_CLASSES: Record<MdrStatTone, string> = {
  neutral: "text-slate-950",
  intake: "text-blue-700",
  critical: "text-red-700",
  healthy: "text-emerald-700",
  warning: "text-amber-700",
};

const MDR_ACTION_TONE_CLASSES: Record<MdrActionTone, string> = {
  command: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  splunk: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  network: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
  intel: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
  dashboard: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  progress: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
  primary: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  preview: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  live: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  secondary: "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
};

const MDR_DEVICE_STATUS_HEX: Record<DeviceStatus, string> = {
  online: "#22c55e",
  warning: "#eab308",
  critical: "#ef4444",
  offline: "#6b7280",
};

const MDR_DEVICE_STATUS_DOT_CLASSES: Record<DeviceStatus, string> = {
  online: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
  offline: "bg-slate-400",
};

const MDR_CLIENT_TIER_TONE_CLASSES: Record<ClientTier, string> = {
  platinum: "border-violet-200 bg-violet-50 text-violet-700",
  gold: "border-amber-200 bg-amber-50 text-amber-700",
  silver: "border-slate-200 bg-slate-100 text-slate-600",
};

const MDR_PRIORITY_TONE_CLASSES: Record<OpsTicketPriority, string> = {
  P1: "bg-red-50 text-red-700",
  P2: "bg-orange-50 text-orange-700",
  P3: "bg-amber-50 text-amber-700",
  P4: "bg-blue-50 text-blue-700",
};

const MDR_OPS_STATUS_TONE_CLASSES: Record<OpsTicketStatus, string> = {
  open: "bg-slate-100 text-slate-600",
  in_progress: "bg-cyan-50 text-cyan-700",
  pending: "bg-violet-50 text-violet-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

const MDR_CONNECTION_TONE_CLASSES: Record<MdrConnectionState, string> = {
  idle: "border-slate-200 bg-slate-50 text-slate-500",
  testing: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-red-200 bg-red-50 text-red-700",
};

const MDR_CONNECTION_DOT_CLASSES: Record<MdrConnectionState, string> = {
  idle: "bg-slate-400",
  testing: "bg-blue-500",
  success: "bg-emerald-500",
  error: "bg-red-500",
};

export function mdrSeverityBadgeClass(severity: Severity) {
  return MDR_SEVERITY_BADGE_CLASSES[severity];
}

export function mdrSeverityDotClass(severity: Severity) {
  return MDR_SEVERITY_DOT_CLASSES[severity];
}

export function mdrSeverityHex(severity: Severity) {
  return MDR_SEVERITY_HEX[severity];
}

export function mdrStatusBadgeClass(status: TicketStatus) {
  return MDR_STATUS_BADGE_CLASSES[status];
}

export function mdrTicketStatusHex(status: TicketStatus) {
  return MDR_TICKET_STATUS_HEX[status];
}

export function mdrSourceToneClass(source: AlertSource) {
  return MDR_SOURCE_TONE_CLASSES[source];
}

export function mdrSourceHex(source: AlertSource) {
  return MDR_SOURCE_HEX[source];
}

export function mdrStatToneClass(tone: MdrStatTone) {
  return MDR_STAT_TONE_CLASSES[tone];
}

export function mdrLoadBarClass(
  load: number,
  thresholds: {
    dangerAt?: number;
    warningAt?: number;
  } = {},
) {
  const { dangerAt = 1, warningAt = 0.8 } = thresholds;

  if (load >= dangerAt) return "bg-red-500";
  if (load >= warningAt) return "bg-amber-500";
  return "bg-emerald-500";
}

export function mdrActionToneClass(tone: MdrActionTone) {
  return MDR_ACTION_TONE_CLASSES[tone];
}

export function mdrSlaToneClass(urgent: boolean) {
  return urgent ? MDR_STAT_TONE_CLASSES.critical : "text-slate-500";
}

export function mdrDeviceStatusHex(status: DeviceStatus) {
  return MDR_DEVICE_STATUS_HEX[status];
}

export function mdrDeviceStatusDotClass(status: DeviceStatus) {
  return MDR_DEVICE_STATUS_DOT_CLASSES[status];
}

export function mdrClientTierToneClass(tier: ClientTier) {
  return MDR_CLIENT_TIER_TONE_CLASSES[tier];
}

export function mdrPriorityToneClass(priority: OpsTicketPriority) {
  return MDR_PRIORITY_TONE_CLASSES[priority];
}

export function mdrOpsStatusToneClass(status: OpsTicketStatus) {
  return MDR_OPS_STATUS_TONE_CLASSES[status];
}

export function mdrHealthScoreToneClass(score: number) {
  if (score >= 90) return "text-emerald-700";
  if (score >= 75) return "text-amber-700";
  if (score >= 60) return "text-orange-700";
  return "text-red-700";
}

export function mdrHealthScoreHex(score: number) {
  if (score >= 90) return "#22c55e";
  if (score >= 75) return "#eab308";
  if (score >= 60) return "#f97316";
  return "#ef4444";
}

export function mdrConnectionToneClass(state: MdrConnectionState) {
  return MDR_CONNECTION_TONE_CLASSES[state];
}

export function mdrConnectionDotClass(state: MdrConnectionState) {
  return MDR_CONNECTION_DOT_CLASSES[state];
}
