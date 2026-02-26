// MDR 工单派发系统 - Mock 数据

export type Severity = "critical" | "high" | "medium" | "low";
export type TicketStatus = "pending" | "investigating" | "awaiting_feedback" | "resolved" | "closed";
export type AlertSource = "EDR" | "NDR" | "SIEM" | "Cloud" | "Identity";

export interface Alert {
  id: string;
  title: string;
  titleZh: string;
  source: AlertSource;
  severity: Severity;
  timestamp: string;
  host: string;
  mitreTactic: string;
  mitreId: string;
  raw: string;
}

export interface Analyst {
  id: string;
  name: string;
  avatar: string;
  tier: 1 | 2 | 3;
  skills: AlertSource[];
  activeTickets: number;
  maxTickets: number;
  region: string;
}

export interface Ticket {
  id: string;
  alertId: string;
  title: string;
  titleZh: string;
  severity: Severity;
  status: TicketStatus;
  assignee: Analyst | null;
  source: AlertSource;
  createdAt: string;
  slaDeadline: string;
  mitreTactic: string;
  mitreId: string;
  host: string;
  actions: string[];
  timeline: { time: string; event: string }[];
}

// SLA 配置（分钟）
export const SLA_CONFIG: Record<Severity, { response: number; resolve: number }> = {
  critical: { response: 15, resolve: 240 },
  high: { response: 30, resolve: 480 },
  medium: { response: 60, resolve: 1440 },
  low: { response: 120, resolve: 2880 },
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "严重",
  high: "高",
  medium: "中",
  low: "低",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  pending: "待处理",
  investigating: "调查中",
  awaiting_feedback: "等待反馈",
  resolved: "已解决",
  closed: "已关闭",
};

export const MOCK_ANALYSTS: Analyst[] = [
  { id: "a1", name: "张明", avatar: "👨‍💻", tier: 3, skills: ["EDR", "NDR", "SIEM"], activeTickets: 2, maxTickets: 5, region: "CN-East" },
  { id: "a2", name: "李薇", avatar: "👩‍💻", tier: 2, skills: ["Cloud", "Identity", "SIEM"], activeTickets: 3, maxTickets: 6, region: "CN-East" },
  { id: "a3", name: "王强", avatar: "🧑‍💻", tier: 2, skills: ["EDR", "NDR"], activeTickets: 1, maxTickets: 6, region: "CN-South" },
  { id: "a4", name: "陈雪", avatar: "👩‍🔬", tier: 1, skills: ["EDR", "Cloud", "SIEM", "NDR", "Identity"], activeTickets: 4, maxTickets: 4, region: "CN-North" },
  { id: "a5", name: "赵磊", avatar: "🕵️", tier: 3, skills: ["Identity", "Cloud"], activeTickets: 0, maxTickets: 5, region: "CN-South" },
];

const now = Date.now();
const m = (mins: number) => new Date(now - mins * 60000).toISOString();
const future = (mins: number) => new Date(now + mins * 60000).toISOString();

export const MOCK_ALERTS: Alert[] = [
  {
    id: "ALT-001", title: "Cobalt Strike Beacon Detected", titleZh: "检测到 Cobalt Strike 信标通信",
    source: "EDR", severity: "critical", timestamp: m(5), host: "WS-FIN-032",
    mitreTactic: "Command & Control", mitreId: "T1071.001",
    raw: "Process: rundll32.exe → beacon.dll | Dest: 185.xx.xx.42:443 | Interval: 60s jitter",
  },
  {
    id: "ALT-002", title: "Lateral Movement via PsExec", titleZh: "通过 PsExec 横向移动",
    source: "NDR", severity: "high", timestamp: m(12), host: "DC-CORE-01",
    mitreTactic: "Lateral Movement", mitreId: "T1570",
    raw: "SMB session from WS-FIN-032 → DC-CORE-01 | PsExec service installed | ADMIN$ share accessed",
  },
  {
    id: "ALT-003", title: "Suspicious AWS IAM Role Assumption", titleZh: "可疑 AWS IAM 角色切换",
    source: "Cloud", severity: "high", timestamp: m(25), host: "aws:cn-east-1",
    mitreTactic: "Privilege Escalation", mitreId: "T1078.004",
    raw: "AssumeRole: arn:aws:iam::role/AdminAccess | Source IP: 103.xx.xx.15 (TOR exit) | MFA: not used",
  },
  {
    id: "ALT-004", title: "Brute Force on Azure AD", titleZh: "Azure AD 暴力破解攻击",
    source: "Identity", severity: "medium", timestamp: m(45), host: "aad:tenant-prod",
    mitreTactic: "Credential Access", mitreId: "T1110.003",
    raw: "500+ failed logins in 10min | Target: admin@corp.com | Sources: 12 unique IPs | Geo: distributed",
  },
  {
    id: "ALT-005", title: "Data Exfiltration via DNS Tunneling", titleZh: "DNS 隧道数据外泄",
    source: "NDR", severity: "critical", timestamp: m(8), host: "DB-PROD-05",
    mitreTactic: "Exfiltration", mitreId: "T1048.001",
    raw: "DNS queries: 4500 TXT records/min → susp-domain.xyz | Encoded payload avg 200bytes/query | Total: ~50MB",
  },
  {
    id: "ALT-006", title: "Ransomware Encryption Activity", titleZh: "勒索软件加密行为",
    source: "EDR", severity: "critical", timestamp: m(2), host: "FS-SHARE-01",
    mitreTactic: "Impact", mitreId: "T1486",
    raw: "Process: svchost.exe (injected) | 1200 files renamed to .locked in 30s | Shadow copies deleted",
  },
  {
    id: "ALT-007", title: "SIEM Correlation: Multi-stage Attack", titleZh: "SIEM 关联：多阶段攻击链",
    source: "SIEM", severity: "high", timestamp: m(18), host: "Multiple",
    mitreTactic: "Multiple", mitreId: "T1059",
    raw: "Chain: Phishing(T1566) → Execution(T1059) → Discovery(T1087) → Lateral(T1021) | 4 hosts affected",
  },
  {
    id: "ALT-008", title: "Cloud Storage Bucket Public Exposure", titleZh: "云存储桶公开暴露",
    source: "Cloud", severity: "medium", timestamp: m(60), host: "oss:prod-backup",
    mitreTactic: "Collection", mitreId: "T1530",
    raw: "Bucket ACL changed to public-read | Contains: database backups, config files | Changed by: unknown-key",
  },
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: "TK-20260226-001", alertId: "ALT-006", title: "Ransomware Encryption Activity",
    titleZh: "勒索软件加密行为", severity: "critical", status: "investigating",
    assignee: MOCK_ANALYSTS[0], source: "EDR", createdAt: m(2), slaDeadline: future(13),
    mitreTactic: "Impact", mitreId: "T1486", host: "FS-SHARE-01",
    actions: ["立即隔离主机 FS-SHARE-01", "检查备份完整性", "排查感染源头", "通知 IR 团队"],
    timeline: [
      { time: m(2), event: "告警触发：检测到大规模文件加密" },
      { time: m(1.5), event: "AI 分诊：严重等级 → 自动创建工单" },
      { time: m(1), event: "自动派发 → 张明 (T3, EDR专家)" },
      { time: m(0.5), event: "EDR 自动隔离主机 FS-SHARE-01" },
    ],
  },
  {
    id: "TK-20260226-002", alertId: "ALT-001", title: "Cobalt Strike Beacon Detected",
    titleZh: "检测到 Cobalt Strike 信标通信", severity: "critical", status: "investigating",
    assignee: MOCK_ANALYSTS[2], source: "EDR", createdAt: m(5), slaDeadline: future(10),
    mitreTactic: "Command & Control", mitreId: "T1071.001", host: "WS-FIN-032",
    actions: ["隔离 WS-FIN-032", "封锁 C2 IP: 185.xx.xx.42", "内存取证", "排查横向移动"],
    timeline: [
      { time: m(5), event: "告警触发：Cobalt Strike beacon 通信" },
      { time: m(4.5), event: "AI 分诊：严重等级 → 自动创建工单" },
      { time: m(4), event: "自动派发 → 王强 (T2, EDR/NDR)" },
    ],
  },
  {
    id: "TK-20260226-003", alertId: "ALT-005", title: "Data Exfiltration via DNS Tunneling",
    titleZh: "DNS 隧道数据外泄", severity: "critical", status: "pending",
    assignee: null, source: "NDR", createdAt: m(8), slaDeadline: future(7),
    mitreTactic: "Exfiltration", mitreId: "T1048.001", host: "DB-PROD-05",
    actions: ["阻断 DNS 隧道域名", "隔离 DB-PROD-05", "评估数据泄露范围", "启动数据泄露响应流程"],
    timeline: [
      { time: m(8), event: "告警触发：异常 DNS 隧道流量" },
      { time: m(7.5), event: "AI 分诊：严重等级 → 自动创建工单" },
      { time: m(7), event: "等待派发：NDR 专家负载已满" },
    ],
  },
  {
    id: "TK-20260226-004", alertId: "ALT-002", title: "Lateral Movement via PsExec",
    titleZh: "通过 PsExec 横向移动", severity: "high", status: "awaiting_feedback",
    assignee: MOCK_ANALYSTS[0], source: "NDR", createdAt: m(12), slaDeadline: future(18),
    mitreTactic: "Lateral Movement", mitreId: "T1570", host: "DC-CORE-01",
    actions: ["确认 PsExec 使用是否授权", "检查域控完整性", "重置受影响账户凭据"],
    timeline: [
      { time: m(12), event: "告警触发：PsExec 横向移动" },
      { time: m(11), event: "自动派发 → 张明 (T3)" },
      { time: m(8), event: "分析完成，等待客户确认是否为授权操作" },
    ],
  },
  {
    id: "TK-20260226-005", alertId: "ALT-003", title: "Suspicious AWS IAM Role Assumption",
    titleZh: "可疑 AWS IAM 角色切换", severity: "high", status: "investigating",
    assignee: MOCK_ANALYSTS[1], source: "Cloud", createdAt: m(25), slaDeadline: future(5),
    mitreTactic: "Privilege Escalation", mitreId: "T1078.004", host: "aws:cn-east-1",
    actions: ["撤销可疑会话", "审计 CloudTrail 日志", "启用 MFA 强制策略"],
    timeline: [
      { time: m(25), event: "告警触发：TOR 出口 IP 切换管理员角色" },
      { time: m(24), event: "自动派发 → 李薇 (T2, Cloud)" },
      { time: m(20), event: "开始 CloudTrail 日志审计" },
    ],
  },
  {
    id: "TK-20260226-006", alertId: "ALT-004", title: "Brute Force on Azure AD",
    titleZh: "Azure AD 暴力破解攻击", severity: "medium", status: "resolved",
    assignee: MOCK_ANALYSTS[4], source: "Identity", createdAt: m(45), slaDeadline: future(15),
    mitreTactic: "Credential Access", mitreId: "T1110.003", host: "aad:tenant-prod",
    actions: ["封锁攻击源 IP", "重置目标账户密码", "启用条件访问策略"],
    timeline: [
      { time: m(45), event: "告警触发：暴力破解检测" },
      { time: m(44), event: "自动派发 → 赵磊 (T3, Identity)" },
      { time: m(30), event: "已封锁 12 个攻击源 IP" },
      { time: m(20), event: "确认无账户被攻破，标记已解决" },
    ],
  },
];

// 派发算法：按技能匹配 → 负载均衡 → Tier 优先
export function dispatchTicket(alert: Alert, analysts: Analyst[]): Analyst | null {
  const candidates = analysts
    .filter((a) => a.skills.includes(alert.source) && a.activeTickets < a.maxTickets)
    .sort((a, b) => {
      // 严重告警优先高 Tier
      if (alert.severity === "critical" || alert.severity === "high") {
        if (a.tier !== b.tier) return b.tier - a.tier;
      }
      // 负载均衡
      const loadA = a.activeTickets / a.maxTickets;
      const loadB = b.activeTickets / b.maxTickets;
      return loadA - loadB;
    });
  return candidates[0] || null;
}
