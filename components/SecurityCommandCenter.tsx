"use client";

/**
 * SecurityCommandCenter
 * ---------------------
 * Industrial-grade "Security Command Center" dashboard.
 *
 * Self-contained: depends only on React + Tailwind CSS.
 * Icons are inlined as Lucide-equivalent SVGs so the component is
 * copy-paste ready without pulling in `lucide-react`.
 *
 * Theme: Slate/Zinc dark-mode (pro-cybersecurity aesthetic).
 * Layout: responsive 3-column (collapses on mobile).
 *
 * State:
 *   1. currentFeed        — active category filter
 *   2. severityFilter     — 'all' | 'high-critical'
 *   3. searchQuery        — free-text search
 *   4. selectedThreatId   — drives the right context panel
 *   5. watchlistFilters   — active asset tags
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SVGProps,
} from "react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type Severity = "Critical" | "High" | "Medium" | "Low";

type FeedKey = "featured" | "all" | "threat-intel" | "vuln-alert";

type ThreatItem = {
  id: string;
  title: string;
  severity: Severity;
  source: string;
  /** Relative time label, e.g. "10 mins ago". */
  time: string;
  /** Absolute ISO-ish timestamp rendered in monospace. */
  timestamp: string;
  tags: string[];
  cve: string;
  /** AI recommendation score 0–100. */
  score: number;
  snippet: string;
  reason: string;
  /** Original link (mock). */
  url: string;
  /** Extracted Indicators of Compromise. */
  iocs?: string[];
  /** Maps into the left "Global Feeds" categories. */
  category: "威胁情报" | "漏洞预警" | "综合资讯" | "深度分析";
  featured?: boolean;
  /** Free-text haystack used by asset watchlist + search. */
  assets?: string[];
};

type SeverityFilter = "all" | "high-critical";

/* ------------------------------------------------------------------ */
/* Inline icon set (Lucide-compatible strokes)                        */
/* ------------------------------------------------------------------ */

type IconProps = SVGProps<SVGSVGElement>;
const baseIcon = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const IconSearch = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const IconSliders = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <line x1="4" x2="4" y1="21" y2="14" />
    <line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" />
    <line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" />
    <line x1="20" x2="20" y1="12" y2="3" />
    <line x1="2" x2="6" y1="14" y2="14" />
    <line x1="10" x2="14" y1="8" y2="8" />
    <line x1="18" x2="22" y1="16" y2="16" />
  </svg>
);
const IconShieldAlert = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);
const IconRadar = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
    <path d="M4 6h.01" />
    <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
    <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" />
    <path d="M12 18h.01" />
    <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
    <circle cx="12" cy="12" r="2" />
    <path d="m13.41 10.59 5.66-5.66" />
  </svg>
);
const IconClock = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconExternal = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);
const IconCopy = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);
const IconCheck = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconSend = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </svg>
);
const IconPanelLeft = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  </svg>
);
const IconBug = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <path d="m8 2 1.88 1.88" />
    <path d="M14.12 3.88 16 2" />
    <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
    <path d="M12 20v-9" />
    <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
    <path d="M6 13H2" />
    <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
    <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
    <path d="M22 13h-4" />
    <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
  </svg>
);
const IconTerminal = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" x2="20" y1="19" y2="19" />
  </svg>
);
const IconCrosshair = (p: IconProps) => (
  <svg {...baseIcon} {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="22" x2="18" y1="12" y2="12" />
    <line x1="6" x2="2" y1="12" y2="12" />
    <line x1="12" x2="12" y1="6" y2="2" />
    <line x1="12" x2="12" y1="22" y2="18" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Mock data                                                          */
/* ------------------------------------------------------------------ */

const THREATS: ThreatItem[] = [
  {
    id: "1",
    title: "libssh2 零日漏洞 PoC 开放，允许未经身份验证的远程代码执行",
    severity: "Critical",
    source: "GitHub",
    time: "10 mins ago",
    timestamp: "2026-06-30 10:32:18 UTC",
    tags: ["0day", "libssh2", "RCE"],
    cve: "N/A",
    score: 97,
    snippet:
      "研究人员公开了 libssh2 在处理 SSH 通道数据包时的一处释放后重用缺陷的完整 PoC。由于该库被广泛集成进 curl、libgit2 与大量嵌入式 SSH 客户端，未经身份验证的攻击者可通过恶意 SSH 服务器触发远程代码执行。影响范围覆盖全平台，且补丁尚未进入多数发行版稳定源。",
    reason:
      "该 PoC 已在多处地下论坛流传，危害公共基础设施安全。利用条件低、影响面广，建议立即排查所有依赖 libssh2 的客户端与 CI 流水线，并在补丁可用前临时阻断出站 SSH 连接到不可信主机。",
    url: "https://example.com/libssh2-0day",
    iocs: [
      "ssh://185.220.101.47:22",
      "SHA256: a3f5...e21c (payload dropper)",
      "C2: carder[.]one / 91.218.114.0/24",
    ],
    category: "漏洞预警",
    featured: true,
    assets: ["SSH", "Linux Kernel", "Kubernetes"],
  },
  {
    id: "2",
    title: "Linux Kernel 'DirtyClone' 本地权限提升漏洞 (CVE-2026-43503)",
    severity: "High",
    source: "NVD",
    time: "1 hour ago",
    timestamp: "2026-06-30 09:14:02 UTC",
    tags: ["漏洞预警", "Linux", "LPE"],
    cve: "CVE-2026-43503",
    score: 88,
    snippet:
      "Linux 内核 clone() 系统调用在处理命名空间与凭据拷贝时存在双重释放缺陷。本地低权限用户可借此触发 use-after-free，最终将自身凭据提升为 root，实现稳定的本地权限提升。已确认影响 5.15 / 6.1 / 6.6 LTS 内核分支。",
    reason:
      "影响主流企业级内核版本，本地低权限用户可利用此漏洞直接获取 Root 权限。在容器与多租户环境中横向移动风险极高，建议优先为所有生产主机打内核补丁。",
    url: "https://nvd.example.gov/vuln/detail/CVE-2026-43503",
    iocs: ["kernel: 5.15.x / 6.1.x / 6.6.x", "exploit: dirty_clone (UID=0)"],
    category: "漏洞预警",
    featured: true,
    assets: ["Linux Kernel"],
  },
  {
    id: "3",
    title: "CISA 将 PTC Windchill JSP Webshell 漏洞加入已知被利用漏洞目录",
    severity: "High",
    source: "CISA",
    time: "3 hours ago",
    timestamp: "2026-06-30 07:05:41 UTC",
    tags: ["威胁情报", "PLM", "Webshell"],
    cve: "CVE-2026-12569",
    score: 84,
    snippet:
      "CISA 将 PTC Windchill 的任意文件上传漏洞（CVE-2026-12569）正式加入 KEV（Known Exploited Vulnerabilities）目录。攻击者可上传 JSP Webshell 获取服务器持久化控制，BOD 22-01 要求联邦机构在三周内完成修复。",
    reason:
      "海外已有多个针对制造行业该系统资产的 APT 定向攻击实体被捕获。Windchill 普遍暴露于制造业内网边界，是供应链攻击的高价值跳板。",
    url: "https://www.cisa.example.gov/kev",
    iocs: [
      "/servlet/WindchillGW/wt.federation.io.SSL",
      "webshell: /codebase/wtCustom/_.jsp",
    ],
    category: "威胁情报",
    featured: true,
    assets: ["Fortinet", "Kubernetes"],
  },
  {
    id: "4",
    title: "WhatsApp 推出全新用户名隐私隐藏功能以对抗大规模信息爬取",
    severity: "Low",
    source: "TechCrunch",
    time: "5 hours ago",
    timestamp: "2026-06-30 05:22:09 UTC",
    tags: ["综合资讯", "Privacy"],
    cve: "N/A",
    score: 41,
    snippet:
      "WhatsApp 开始向全球用户推出用户名隐私隐藏功能，默认对非联系人隐藏手机号关联的用户名，以对抗第三方 SDK 大规模爬取与社交图谱测绘。",
    reason: "属于常规产品隐私机制变更，无直接资产暴露风险。",
    url: "https://techcrunch.example.com/whatsapp-privacy",
    category: "综合资讯",
    assets: [],
  },
  {
    id: "5",
    title: "Fortinet FortiGate SSL-VPN 越界写入漏洞已在野利用 (CVE-2026-3091)",
    severity: "Critical",
    source: "Fortinet PSIRT",
    time: "6 hours ago",
    timestamp: "2026-06-30 04:11:55 UTC",
    tags: ["威胁情报", "FortiGate", "VPN"],
    cve: "CVE-2026-3091",
    score: 95,
    snippet:
      "FortiGate SSL-VPN 模块在处理特制 HTTP 请求时存在越界写入缺陷。未认证远程攻击者可借此在 vpn 进程上下文执行任意代码。监测显示针对 4443 端口的利用尝试在过去 48 小时激增。",
    reason:
      "VPN 边界设备直接面向互联网，且历史版本存在大量未打补丁实例。建议立即升级至 7.4.4+ 并禁用暴露在公网的 SSL-VPN，直至补丁完成。",
    url: "https://psirt.example.com/FG-IR-26-001",
    iocs: [
      "POST /remote/error?errmsg=...",
      "UA: Mozilla/5.0 (X11; Linux x86_64; rv:109.0)",
      "193.32.162.0/24",
    ],
    category: "威胁情报",
    featured: true,
    assets: ["Fortinet"],
  },
  {
    id: "6",
    title: "Kubernetes RBAC 误配置导致跨命名空间 Secret 读取被利用",
    severity: "Medium",
    source: "TheNewStack",
    time: "8 hours ago",
    timestamp: "2026-06-30 02:40:13 UTC",
    tags: ["深度分析", "Kubernetes", "RBAC"],
    cve: "N/A",
    score: 63,
    snippet:
      "针对 default ServiceAccount 的过度授权持续被攻击者利用：通过创建带有 automountServiceAccountToken 的 Pod，结合宽松的 ClusterRoleBinding，实现跨命名空间 Secret / ConfigMap 读取，进而窃取云厂商凭据。",
    reason:
      "配置缺陷而非软件漏洞，但在多云与共享集群中普遍存在。建议审计所有 RoleBinding/ClusterRoleBinding，启用 audit logging 并最小化 token 挂载。",
    url: "https://thenewstack.example.com/k8s-rbac",
    category: "深度分析",
    assets: ["Kubernetes"],
  },
  {
    id: "7",
    title: "OpenSSH ssh-agent 转发凭据劫持新攻击面披露",
    severity: "High",
    source: "ProjectZero",
    time: "11 hours ago",
    timestamp: "2026-06-29 23:09:48 UTC",
    tags: ["漏洞预警", "SSH", "凭据劫持"],
    cve: "N/A",
    score: 80,
    snippet:
      "研究披露在启用 Agent Forwarding 的场景下，恶意跳板机可借助实时会话内 ssh-agent socket 完成凭据签名请求，配合时序诱导实现未授权认证。影响所有启用 ForwardAgent 的客户端。",
    reason:
      "Agent Forwarding 是运维堡垒机场景的常见配置，凭据暴露后可横向进入整个 SSH 资产群。建议改用 ProxyJump 或临时凭据机制。",
    url: "https://bugs.example.com/ssh-agent",
    category: "漏洞预警",
    assets: ["SSH", "Linux Kernel"],
  },
  {
    id: "8",
    title: "Rhysida 勒索软件切换至 Rust 载荷以规避 EDR 静态检测",
    severity: "Medium",
    source: "BleepingComputer",
    time: "14 hours ago",
    timestamp: "2026-06-29 20:01:27 UTC",
    tags: ["威胁情报", "勒索软件", "EDR Bypass"],
    cve: "N/A",
    score: 58,
    snippet:
      "Rhysida 团伙在新一轮样本中改用 Rust 重写核心加密载荷，并引入间接系统调用与分层反调试，显著降低主流 EDR 的静态签名命中率。当前样本主要针对教育与医疗行业。",
    reason:
      "载荷形态变化使既有检测规则失效，需尽快更新 YARA 规则并强化行为检测。攻击目标集中在教育/医疗，建议相关资产方提升备份验证频次。",
    url: "https://bleepingcomputer.example.com/rhysida-rust",
    iocs: [
      "SHA256: 7c9a...3f10 (loader)",
      "C2: api[.]rhysida-press[.]team",
    ],
    category: "威胁情报",
    assets: [],
  },
];

/* ------------------------------------------------------------------ */
/* Static config                                                      */
/* ------------------------------------------------------------------ */

const FEEDS: Array<{ key: FeedKey; label: string; icon: typeof IconRadar }> = [
  { key: "featured", label: "精选", icon: IconRadar },
  { key: "all", label: "全量", icon: IconTerminal },
  { key: "threat-intel", label: "威胁情报", icon: IconCrosshair },
  { key: "vuln-alert", label: "漏洞预警", icon: IconBug },
];

const WATCHLIST = ["SSH", "Linux Kernel", "Fortinet", "Kubernetes"];

const SEVERITY_ORDER: Record<Severity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

/* ------------------------------------------------------------------ */
/* Severity styling helpers                                           */
/* ------------------------------------------------------------------ */

function severityBadgeClasses(sev: Severity): string {
  switch (sev) {
    case "Critical":
      return "border-red-500/30 text-red-400 bg-red-500/10";
    case "High":
      return "border-orange-500/30 text-orange-400 bg-orange-500/10";
    case "Medium":
    case "Low":
    default:
      return "border-zinc-700/60 text-zinc-400 bg-zinc-800";
  }
}

/** Left edge severity bar color (for the row indicator block). */
function severityBarClasses(sev: Severity): string {
  switch (sev) {
    case "Critical":
      return "bg-red-500";
    case "High":
      return "bg-orange-500";
    case "Medium":
      return "bg-zinc-500";
    case "Low":
    default:
      return "bg-zinc-600";
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function SecurityCommandCenter() {
  // 1. active category filter
  const [currentFeed, setCurrentFeed] = useState<FeedKey>("featured");
  // 2. severity filter
  const [severityFilter, setSeverityFilter] =
    useState<SeverityFilter>("all");
  // 3. search
  const [searchQuery, setSearchQuery] = useState("");
  // 4. selected threat (drives right panel)
  const [selectedThreatId, setSelectedThreatId] = useState<string | null>(
    "1",
  );
  // 5. active asset tags
  const [watchlistFilters, setWatchlistFilters] = useState<string[]>([]);

  // mobile sidebar toggle
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  /* ----- derived list ----- */
  const visibleThreats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = THREATS.filter((t) => {
      // feed / category
      if (currentFeed === "featured" && !t.featured) return false;
      if (currentFeed === "threat-intel" && t.category !== "威胁情报")
        return false;
      if (currentFeed === "vuln-alert" && t.category !== "漏洞预警")
        return false;
      // 'all' → no category restriction

      // severity
      if (
        severityFilter === "high-critical" &&
        t.severity !== "Critical" &&
        t.severity !== "High"
      )
        return false;

      // watchlist assets (AND across active tags)
      if (watchlistFilters.length > 0) {
        const assets = new Set(
          (t.assets ?? []).map((a) => a.toLowerCase()),
        );
        const matches = watchlistFilters.every((w) =>
          assets.has(w.toLowerCase()),
        );
        if (!matches) return false;
      }

      // free-text search
      if (q) {
        const haystack = [
          t.title,
          t.source,
          t.cve,
          t.category,
          ...t.tags,
          ...(t.assets ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    // stable sort: severity first, then score
    list = list.sort((a, b) => {
      const sev =
        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (sev !== 0) return sev;
      return b.score - a.score;
    });

    return list;
  }, [currentFeed, severityFilter, searchQuery, watchlistFilters]);

  const selectedThreat = useMemo(
    () =>
      THREATS.find((t) => t.id === selectedThreatId) ??
      null,
    [selectedThreatId],
  );

  // Keep selection valid when filters hide it.
  useEffect(() => {
    if (
      selectedThreatId &&
      !visibleThreats.some((t) => t.id === selectedThreatId)
    ) {
      // don't force-clear: user may still want detail open.
    }
  }, [visibleThreats, selectedThreatId]);

  /* ----- "/" focuses search ----- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleWatch = useCallback((tag: string) => {
    setWatchlistFilters((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    );
  }, []);

  const totalThreats = THREATS.length;
  const criticalCount = THREATS.filter(
    (t) => t.severity === "Critical" || t.severity === "High",
  ).length;

  /* ------------------------------ render ------------------------------ */
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 font-sans text-zinc-200">
      {/* ===== Top command bar ===== */}
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="切换导航"
            className="grid h-7 w-7 place-items-center rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 lg:hidden"
          >
            <IconPanelLeft width={16} height={16} />
          </button>
          <div className="flex items-center gap-2">
            <span className="rounded bg-red-500/15 px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest text-red-400">
              SEC
            </span>
            <span className="font-mono text-[13px] font-bold tracking-[0.2em] text-zinc-100">
              HOT
            </span>
            <span className="hidden text-[11px] text-zinc-500 sm:inline">
              / Security Command Center
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* live status */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-[11px] text-emerald-400">
              LIVE
            </span>
          </div>
          {/* metrics */}
          <div className="hidden items-center gap-4 font-mono text-[11px] sm:flex">
            <Metric label="FEEDS" value={String(totalThreats)} />
            <Metric
              label="CRIT+HIGH"
              value={String(criticalCount)}
              tone="text-red-400"
            />
            <Metric label="UTC" value={nowUtcClock()} />
          </div>
        </div>
      </header>

      {/* ===== Body: 3 columns ===== */}
      <div className="flex min-h-0 flex-1">
        {/* ---------- Left sidebar ---------- */}
        <aside
          className={`${
            mobileNavOpen ? "absolute z-30 h-[calc(100%-2.75rem)]" : "hidden"
          } w-60 shrink-0 border-r border-zinc-800 bg-zinc-900/60 lg:static lg:flex lg:h-auto`}
        >
          <div className="flex w-full flex-col gap-6 overflow-y-auto p-3">
            {/* Section A: Global Feeds */}
            <nav className="space-y-1">
              <SectionLabel>Global Feeds</SectionLabel>
              {FEEDS.map((f) => {
                const Icon = f.icon;
                const active = currentFeed === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => {
                      setCurrentFeed(f.key);
                      setMobileNavOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] transition-colors ${
                      active
                        ? "bg-zinc-800 text-zinc-50"
                        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                    }`}
                  >
                    <Icon
                      width={14}
                      height={14}
                      className={active ? "text-red-400" : "text-zinc-500"}
                    />
                    <span className="flex-1">{f.label}</span>
                    {active && (
                      <span className="h-1 w-1 rounded-full bg-red-400" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Section B: Asset Watchlist */}
            <div className="space-y-2">
              <SectionLabel>Asset Watchlist</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {WATCHLIST.map((tag) => {
                  const active = watchlistFilters.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleWatch(tag)}
                      className={`rounded border px-2 py-1 font-mono text-[11px] transition-colors ${
                        active
                          ? "border-red-500/40 bg-red-500/15 text-red-300"
                          : "border-zinc-700/70 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              {watchlistFilters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setWatchlistFilters([])}
                  className="text-[11px] text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
                >
                  清除筛选 ({watchlistFilters.length})
                </button>
              )}
            </div>

            <div className="mt-auto border-t border-zinc-800 pt-3">
              <p className="font-mono text-[10px] leading-relaxed text-zinc-600">
                Threat triage surface · v0.1
                <br />
                Demo data · 8 mock items
              </p>
            </div>
          </div>
        </aside>

        {/* ---------- Middle column ---------- */}
        <main className="flex min-w-0 flex-1 flex-col bg-zinc-950">
          {/* header: search + severity */}
          <div className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-950/90 px-3 py-2 backdrop-blur">
            {/* search */}
            <div className="relative min-w-0 flex-1">
              <IconSearch
                width={14}
                height={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索标题 / 信源 / CVE / 资产…"
                className="h-8 w-full rounded border border-zinc-800 bg-zinc-900 pl-8 pr-12 font-sans text-[13px] text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-zinc-600"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-zinc-700 bg-zinc-800 px-1.5 font-mono text-[10px] text-zinc-500 sm:block">
                /
              </kbd>
            </div>

            {/* severity filter */}
            <div className="flex items-center gap-0.5 rounded border border-zinc-800 bg-zinc-900 p-0.5">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "high-critical", label: "Critical & High" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSeverityFilter(opt.key)}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                    severityFilter === opt.key
                      ? "bg-zinc-700 text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {opt.key === "high-critical" && (
                    <IconSliders width={12} height={12} />
                  )}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* list meta */}
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/60 px-3 py-1.5">
            <span className="font-mono text-[11px] text-zinc-500">
              {visibleThreats.length} / {THREATS.length} items
              {watchlistFilters.length > 0 &&
                ` · watchlist: ${watchlistFilters.join(", ")}`}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              sev · time · src · title · cve
            </span>
          </div>

          {/* triage list */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {visibleThreats.length === 0 ? (
              <EmptyList />
            ) : (
              <ul role="list" className="divide-y divide-zinc-900">
                {visibleThreats.map((t) => {
                  const active = t.id === selectedThreatId;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedThreatId(t.id)}
                        className={`group relative flex w-full items-stretch gap-0 text-left transition-colors ${
                          active ? "bg-zinc-800/70" : "hover:bg-zinc-800/50"
                        }`}
                      >
                        {/* severity edge bar */}
                        <span
                          className={`w-0.5 shrink-0 ${severityBarClasses(
                            t.severity,
                          )}`}
                        />

                        {/* row body */}
                        <div className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-1.5">
                          {/* severity badge */}
                          <span
                            className={`w-[68px] shrink-0 truncate rounded border px-1.5 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide ${severityBadgeClasses(
                              t.severity,
                            )}`}
                          >
                            {t.severity}
                          </span>

                          {/* timestamp */}
                          <span
                            className="hidden w-24 shrink-0 font-mono text-[11px] text-zinc-500 md:block"
                            title={t.timestamp}
                          >
                            {t.time}
                          </span>

                          {/* source */}
                          <span className="w-16 shrink-0 truncate text-[11px] font-medium text-zinc-400">
                            {t.source}
                          </span>

                          {/* title */}
                          <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-200 group-hover:text-zinc-50">
                            {t.title}
                          </span>

                          {/* score */}
                          <span
                            className={`w-8 shrink-0 text-right font-mono text-[11px] font-bold tabular-nums ${
                              t.score >= 85
                                ? "text-red-400"
                                : t.score >= 70
                                  ? "text-orange-400"
                                  : "text-zinc-500"
                            }`}
                          >
                            {t.score}
                          </span>

                          {/* CVE / core tag */}
                          <span className="hidden w-28 shrink-0 truncate text-right font-mono text-[11px] text-zinc-500 lg:block">
                            {t.cve !== "N/A" ? t.cve : t.tags[0]}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </main>

        {/* ---------- Right context panel ---------- */}
        <aside className="hidden w-[400px] shrink-0 flex-col border-l border-zinc-800 bg-zinc-900/40 xl:flex">
          <DetailPanel threat={selectedThreat} />
        </aside>

        {/* Mobile detail: render below list when a row is selected */}
        <div className="xl:hidden">
          {/* rendered inline at bottom via portal-free stacking block */}
        </div>
      </div>

      {/* Mobile detail panel (stacked) */}
      <MobileDetail threat={selectedThreat} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
      {children}
    </p>
  );
}

function Metric({
  label,
  value,
  tone = "text-zinc-300",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-zinc-600">{label}</span>
      <span className={`font-bold tabular-nums ${tone}`}>{value}</span>
    </span>
  );
}

function EmptyList() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <IconShieldAlert
        width={36}
        height={36}
        className="text-zinc-700"
      />
      <p className="text-[13px] text-zinc-500">无匹配情报项</p>
      <p className="font-mono text-[11px] text-zinc-600">
        调整筛选 / 搜索 / 资产标签后重试
      </p>
    </div>
  );
}

/* ----- Right detail panel (desktop) ----- */

function DetailPanel({ threat }: { threat: ThreatItem | null }) {
  if (!threat) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <IconCrosshair width={40} height={40} className="text-zinc-700" />
        <p className="text-[13px] text-zinc-500">未选中情报项</p>
        <p className="font-mono text-[11px] text-zinc-600">
          点击左侧列表任意一行以展开上下文与处置动作
        </p>
      </div>
    );
  }
  return <DetailContent key={threat.id} threat={threat} />;
}

/* ----- Mobile detail (stacked drawer below the list) ----- */

function MobileDetail({ threat }: { threat: ThreatItem | null }) {
  if (!threat) return null;
  return (
    <div className="border-t border-zinc-800 bg-zinc-900/60 xl:hidden">
      <DetailContent key={threat.id} threat={threat} />
    </div>
  );
}

/* ----- Shared detail body (desktop + mobile) ----- */

function DetailContent({ threat }: { threat: ThreatItem }) {
  const [copied, setCopied] = useState(false);
  const [pushed, setPushed] = useState(false);

  const copyable = useMemo(() => {
    const parts: string[] = [];
    if (threat.cve !== "N/A") parts.push(threat.cve);
    if (threat.iocs && threat.iocs.length > 0)
      parts.push(...threat.iocs);
    return parts.join("\n");
  }, [threat]);

  const onCopy = useCallback(async () => {
    if (!copyable) return;
    try {
      await navigator.clipboard.writeText(copyable);
    } catch {
      /* clipboard may be blocked; visual state still reflects intent */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [copyable]);

  const onPush = useCallback(() => {
    setPushed(true);
    window.setTimeout(() => setPushed(false), 2000);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* header */}
      <div className="shrink-0 border-b border-zinc-800 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${severityBadgeClasses(
              threat.severity,
            )}`}
          >
            {threat.severity}
          </span>
          <span className="font-mono text-[11px] text-zinc-500">
            {threat.source}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-zinc-200">
            <IconRadar width={11} height={11} className="text-red-400" />
            {threat.score}
          </span>
        </div>
        <h2 className="text-[15px] font-semibold leading-snug text-zinc-50">
          {threat.title}
        </h2>
        <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
          <IconClock width={12} height={12} />
          {threat.timestamp}
          <span className="text-zinc-700">·</span>
          <span>{threat.time}</span>
        </p>
      </div>

      {/* body */}
      <div className="flex-1 space-y-4 p-4">
        {/* snippet */}
        <section>
          <DetailLabel>摘要 · Summary</DetailLabel>
          <p className="text-[13px] leading-relaxed text-zinc-300">
            {threat.snippet}
          </p>
        </section>

        {/* AI analysis card */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <IconShieldAlert
              width={13}
              height={13}
              className="text-amber-400"
            />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              AI Analysis · 推荐理由
            </span>
          </div>
          <p className="text-[12.5px] leading-relaxed text-zinc-400">
            {threat.reason}
          </p>
        </section>

        {/* IOCs / CVE code block */}
        <section>
          <DetailLabel>
            {threat.cve !== "N/A" ? "CVE & IOCs" : "Indicators (IOCs)"}
          </DetailLabel>
          <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-black/60 p-3 font-mono text-[11.5px] leading-relaxed text-emerald-300">
{threat.cve !== "N/A" ? `CVE: ${threat.cve}\n` : ""}
{(threat.iocs && threat.iocs.length > 0
  ? threat.iocs.join("\n")
  : "— no indicators extracted —")}
</pre>
        </section>

        {/* tags */}
        <section className="flex flex-wrap items-center gap-1.5">
          {threat.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-zinc-800 bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[10.5px] text-zinc-400"
            >
              {tag}
            </span>
          ))}
          {threat.assets && threat.assets.length > 0 && (
            <>
              <span className="mx-1 text-zinc-700">|</span>
              {threat.assets.map((a) => (
                <span
                  key={a}
                  className="rounded border border-sky-500/20 bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10.5px] text-sky-300"
                >
                  {a}
                </span>
              ))}
            </>
          )}
        </section>
      </div>

      {/* action footer */}
      <div className="sticky bottom-0 shrink-0 grid grid-cols-3 gap-2 border-t border-zinc-800 bg-zinc-950/95 p-3 backdrop-blur">
        <ActionButton
          onClick={onCopy}
          disabled={!copyable}
          tone={copied ? "success" : "default"}
        >
          {copied ? (
            <>
              <IconCheck width={13} height={13} />
              已复制
            </>
          ) : (
            <>
              <IconCopy width={13} height={13} />
              Copy IOC/CVE
            </>
          )}
        </ActionButton>

        <ActionButton
          onClick={onPush}
          tone={pushed ? "success" : "default"}
        >
          {pushed ? (
            <>
              <IconCheck width={13} height={13} />
              已推送
            </>
          ) : (
            <>
              <IconSend width={13} height={13} />
              Push Slack
            </>
          )}
        </ActionButton>

        <a
          href={threat.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded border border-zinc-800 bg-zinc-900 px-2 py-2 text-[11.5px] font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-50"
        >
          <IconExternal width={13} height={13} />
          Open Link
        </a>
      </div>
    </div>
  );
}

function DetailLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
      {children}
    </p>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  tone = "default",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "success";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 rounded border px-2 py-2 text-[11.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        tone === "success"
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
          : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-50"
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function nowUtcClock(): string {
  // Static-ish HH:MM rendered at mount; avoids per-second re-render noise
  // while still giving the "live terminal" feel. Safe on server render.
  try {
    return new Date().toUTCString().slice(17, 22);
  } catch {
    return "--:--";
  }
}
