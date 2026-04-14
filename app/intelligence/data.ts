export type Tone = string;

export interface TopbarData {
  eyebrow: string;
  title: string;
  subtitle: string;
  chips: Array<{ label: string; tone?: Tone }>;
  sections: Array<{ id: string; label: string }>;
  filters: string[];
}

export interface HeroData {
  sectionId: string;
  eyebrow: string;
  headline: string;
  body: string;
  tags: string[];
  signal: {
    title: string;
    description: string;
    items: Array<{ label: string; value: string; tone: Tone }>;
  };
  decisions: {
    title: string;
    badge: string;
    items: Array<{ title: string; description: string }>;
  };
  actionMatrix: {
    title: string;
    rows: Array<{ title: string; description: string; tone: Tone }>;
  };
}

export interface KpiData {
  label: string;
  value: string;
  delta: string;
  description: string;
  tone: Tone;
}

export interface CampaignData {
  sectionId: string;
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  panelTitle: string;
  panelDescription: string;
  panelBadge: string;
  timeline: Array<{
    tone: Tone;
    badgeTone: Tone;
    badge: string;
    meta: string;
    title: string;
    description: string;
    details: string[];
    actions?: Array<{ label: string; tone?: Tone }>;
  }>;
}

export interface ExposureData {
  sectionId: string;
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  rows: Array<{
    asset: string;
    scope: string;
    finding: string;
    findingNote: string;
    score: string;
    owner: string;
    ownerNote: string;
    actionTone: Tone;
    action: string;
  }>;
  insights: Array<{
    eyebrow: string;
    title: string;
    description: string;
    emphasis?: string;
    cards?: Array<{ title: string; description: string }>;
  }>;
}

export interface GraphData {
  sectionId: string;
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  lines: Array<{ className: string }>;
  nodes: Array<{ type: Tone; title: string; subtitle: string }>;
  relations: Array<{ title: string; description: string }>;
  legend: Array<{ label: string; tone: Tone }>;
}

export interface HuntData {
  sectionId: string;
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  panelTitle: string;
  panelDescription: string;
  panelBadge: string;
  cards: Array<{
    badgeTone: Tone;
    badge: string;
    meta: string;
    title: string;
    description: string;
    code: string;
    actions: Array<{ label: string; tone?: Tone }>;
  }>;
}

export interface PlaybookData {
  sectionId: string;
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  panelTitle: string;
  panelDescription: string;
  panelBadge: string;
  cards: Array<{
    badgeTone: Tone;
    badge: string;
    meta: string;
    title: string;
    description: string;
    details: string[];
  }>;
  footer: string;
}

export interface IntelligenceCommandCenterData {
  topbar: TopbarData;
  hero: HeroData;
  kpis: KpiData[];
  campaigns: CampaignData;
  exposures: ExposureData;
  graph: GraphData;
  hunts: HuntData;
  playbooks: PlaybookData;
}

export const intelligenceCommandCenterData: IntelligenceCommandCenterData = {
  topbar: {
    eyebrow: "Threat Intelligence Command Center",
    title: "Intel Center / Organization Context: APAC Finance",
    subtitle: "围绕组织相关性、攻击活动、暴露资产和行动闭环重构的情报指挥台",
    chips: [
      { label: "Live Feed / 5m refresh", tone: "live" },
      { label: "Threat Scope / Finance · CN · Cloud" },
      { label: "2 campaigns require decision", tone: "alert" },
    ],
    sections: [
      { id: "overview", label: "态势" },
      { id: "campaigns", label: "活动" },
      { id: "exposure", label: "暴露" },
      { id: "graph", label: "图谱" },
      { id: "hunting", label: "狩猎" },
      { id: "playbooks", label: "剧本" },
    ],
    filters: ["高相关", "互联网暴露", "需决策", "自动化就绪"],
  },
  hero: {
    sectionId: "overview",
    eyebrow: "组织威胁态势",
    headline: "今天最需要关注的不是情报总量，而是与你资产和暴露面真正重叠的攻击活动。",
    body:
      "当前威胁面正在被两类活动同时拉高：一类是针对金融行业边界系统的漏洞利用链，另一类是围绕泄露凭据和品牌仿冒的外部风险。新的情报中心首页应该首先回答四个问题：谁在针对我们、哪些资产最危险、攻击链走到哪一步、现在应该先做什么。",
    tags: [
      "Active Campaigns: 2",
      "Targeted Assets: 11",
      "Critical CVEs: 4",
      "Action Queue: 6",
    ],
    signal: {
      title: "威胁热区",
      description: "用更像指挥台的方式展示哪里在升温，而不是只给静态数字。",
      items: [
        { label: "边界访问", value: "92", tone: "rose" },
        { label: "凭据泄露", value: "84", tone: "amber" },
        { label: "未知资产", value: "76", tone: "cyan" },
        { label: "剧本可执行", value: "64", tone: "green" },
      ],
    },
    decisions: {
      title: "今日需要决策",
      badge: "Urgent",
      items: [
        {
          title: "优先封堵公网暴露的 VPN 资产",
          description: "与正在活跃利用的 CVE-2025-4171 重叠，且已关联到当前金融行业 Campaign。",
        },
        {
          title: "启动凭据泄露专项狩猎",
          description: "过去 24 小时新增 31 条凭据暴露提及，其中 9 个账号与高价值资产管理域相关。",
        },
        {
          title: "将两个 IOC 集合下发 EDR Sweep",
          description: "现有规则已具备落地条件，建议从观察升级为自动化搜集与封禁。",
        },
      ],
    },
    actionMatrix: {
      title: "处置建议矩阵",
      rows: [
        {
          title: "先处置公网边界",
          description: "补丁确认 + EDR Sweep + 访问策略收紧",
          tone: "critical",
        },
        {
          title: "同步身份专项",
          description: "账号重置、MFA 复核、终端关联分析",
          tone: "warning",
        },
        {
          title: "保留外部观察",
          description: "保留被动监控并绑定 Campaign Watchlist",
          tone: "info",
        },
      ],
    },
  },
  kpis: [
    {
      label: "相关高优先级威胁",
      value: "07",
      delta: "+2 in 24h",
      description: "基于行业、地区、资产暴露和本地命中结果筛出的优先关注对象。",
      tone: "rose",
    },
    {
      label: "正在利用的关键漏洞",
      value: "04",
      delta: "2 internet-facing",
      description: "活动攻击活动、公开利用和资产可达性共同抬高了处置优先级。",
      tone: "amber",
    },
    {
      label: "高风险暴露资产",
      value: "11",
      delta: "+35% asset drift",
      description: "含未知资产、跨云边界系统和缺乏责任人确认的互联网暴露对象。",
      tone: "cyan",
    },
    {
      label: "可直接执行的动作",
      value: "06",
      delta: "4 automated",
      description: "情报已具备转换为 EDR Sweep、封禁、通知、工单或升级事件的条件。",
      tone: "green",
    },
  ],
  campaigns: {
    sectionId: "campaigns",
    eyebrow: "Campaign Intelligence",
    title: "重点攻击活动",
    description: "不再把情报中心做成新闻流，而是围绕攻击活动聚合目标行业、关联资产、常用 TTP、利用漏洞和建议动作。",
    badge: "2 active campaigns overlap with your estate",
    panelTitle: "过去 72 小时的相关攻击活动",
    panelDescription: "优先展示与你行业、区域、暴露资产和已有告警上下文重叠的攻击活动。",
    panelBadge: "Synced {time} CST",
    timeline: [
      {
        tone: "rose",
        badgeTone: "critical",
        badge: "Critical overlap",
        meta: "09:20 / 2h ago",
        title: "Silver Meridian targeting internet-facing VPN gateways in finance",
        description: "利用链涉及公开 PoC、凭据收集与后续横向移动，目标资产与你暴露的两个边界系统高度重叠。",
        details: ["Actor: Silver Meridian", "CVE-2025-4171", "MITRE: T1190 / T1078", "Suggested: EDR Sweep + patch validation"],
        actions: [
          { label: "Run Sweep", tone: "primary" },
          { label: "Patch Window", tone: "warning" },
          { label: "Escalate", tone: "danger" },
        ],
      },
      {
        tone: "amber",
        badgeTone: "warning",
        badge: "Exposure-driven",
        meta: "Yesterday",
        title: "Credential broker cluster advertising APAC banking access bundles",
        description: "新增泄露提及与品牌仿冒线索同时上升，需结合凭据泄露与外部品牌面板做联动确认。",
        details: ["Dark web chatter", "Credential leakage", "Brand impersonation"],
        actions: [
          { label: "Reset Accounts", tone: "warning" },
          { label: "Open Brand Case" },
          { label: "Notify IAM", tone: "primary" },
        ],
      },
      {
        tone: "violet",
        badgeTone: "info",
        badge: "Watchlist",
        meta: "2 days ago",
        title: "Loader family expands infrastructure across cloud object storage",
        description: "当前尚未直接命中你的环境，但其 C2 基础设施与已观察域名存在邻近关系，建议持续观察。",
        details: ["Malware: Aster Loader", "Infra cluster overlap", "Recommended: passive monitoring"],
        actions: [
          { label: "Pivot", tone: "primary" },
          { label: "Watchlist" },
          { label: "Retain Passive Monitor", tone: "warning" },
        ],
      },
    ],
  },
  exposures: {
    sectionId: "exposure",
    eyebrow: "Exposure Intelligence",
    title: "资产暴露与漏洞优先级",
    description: "把外部攻击面、活动利用、业务关键性和内部命中合并成一个真正可用的优先级面板，而不是单纯 CVSS 排序。",
    badge: "11 assets require owner confirmation",
    rows: [
      {
        asset: "gw-prod-vpn-03",
        scope: "公网边界 / 华东",
        finding: "CVE-2025-4171 · SSL VPN RCE",
        findingNote: "关联 Campaign: Silver Meridian / 已见公开利用 / 当前端口可达",
        score: "97",
        owner: "NetOps-A",
        ownerNote: "Owner confirmed",
        actionTone: "critical",
        action: "Patch now",
      },
      {
        asset: "sso-admin-apac",
        scope: "身份入口 / 全球",
        finding: "Leaked credential overlap",
        findingNote: "暗网提及 + 品牌仿冒 + 9 个高价值账号命中",
        score: "91",
        owner: "IAM-Core",
        ownerNote: "Escalation pending",
        actionTone: "warning",
        action: "Reset + hunt",
      },
      {
        asset: "k8s-observe-east",
        scope: "观察集群 / 云原生",
        finding: "Unmanaged exposed dashboard",
        findingNote: "未知资产 + 第三方集成遗留 + 缺少 WAF 保护",
        score: "83",
        owner: "Unknown",
        ownerNote: "Needs ownership",
        actionTone: "warning",
        action: "Assign owner",
      },
      {
        asset: "legacy-pay-api",
        scope: "支付接口 / 历史系统",
        finding: "CVE-2024-9932 · Deserialization",
        findingNote: "暂无本地命中，但已被相邻行业 Campaign 采用",
        score: "69",
        owner: "Payments-B",
        ownerNote: "Owner confirmed",
        actionTone: "info",
        action: "Validate",
      },
    ],
    insights: [
      {
        eyebrow: "Exposure drift",
        title: "暴露面变化",
        emphasis: "+35%",
        description: "最近 14 天新增互联网可见资产主要来自云侧临时实例与遗留运维入口。",
      },
      {
        eyebrow: "Vulnerability context",
        title: "漏洞上下文",
        description: "页面里应该同时解释漏洞被利用、资产可达性、业务关键性和处置责任人。",
        cards: [
          {
            title: "Top exploited CVEs",
            description: "CVE-2025-4171, CVE-2025-2998, CVE-2024-9932, CVE-2024-8013",
          },
          {
            title: "运营建议",
            description: "页面内要同时显示“已知利用 / 本地暴露 / 业务关键性 / 责任人”。",
          },
        ],
      },
    ],
  },
  graph: {
    sectionId: "graph",
    eyebrow: "Relationship Graph",
    title: "实体关联图谱",
    description: "把行为体、Campaign、恶意家族、漏洞、IOC 和资产拉到同一张图里，允许分析师沿着攻击链快速 pivot。",
    badge: "Actor ↔ Campaign ↔ Vulnerability ↔ Asset",
    lines: [{ className: "l1" }, { className: "l2" }, { className: "l3" }, { className: "l4" }, { className: "l5" }],
    nodes: [
      { type: "actor", title: "Silver Meridian", subtitle: "Threat Actor" },
      { type: "campaign", title: "APAC VPN Burst", subtitle: "Campaign" },
      { type: "malware", title: "Aster Loader", subtitle: "Malware / Loader" },
      { type: "cve", title: "CVE-2025-4171", subtitle: "Initial Access" },
      { type: "asset", title: "gw-prod-vpn-03", subtitle: "Internet-facing Asset" },
      { type: "ioc", title: "198.51.100.47", subtitle: "IOC / C2 endpoint" },
    ],
    relations: [
      {
        title: "关键关系 01",
        description: "Silver Meridian 在最近活动中多次使用该漏洞作为初始入口，并在 8 小时内切换到有效账户利用。",
      },
      {
        title: "关键关系 02",
        description: "IOC 集合与当前资产所在公网段出现基础设施邻近关系，需在边界日志中立即执行 sweep。",
      },
      {
        title: "关键关系 03",
        description: "Campaign 中出现的 Loader 与你当前云侧观测到的对象存储通信模式具备相似特征。",
      },
      {
        title: "为什么要做成图谱",
        description: "列表只会告诉你“有多少条”；图谱才能告诉你“这一条为什么重要、它会连到哪里、下一步该查什么”。",
      },
    ],
    legend: [
      { label: "Threat Actor", tone: "rose" },
      { label: "Campaign / CVE", tone: "amber" },
      { label: "Asset Pivot", tone: "cyan" },
      { label: "IOC / Coverage", tone: "green" },
      { label: "Analytic Context", tone: "violet" },
    ],
  },
  hunts: {
    sectionId: "hunting",
    eyebrow: "Analyst Workbench",
    title: "狩猎与研判工作台",
    description: "把情报直接接到查询、规则、命中结果和分析笔记，不再让分析师从情报页面复制 IOC 再去别处手工拼接。",
    badge: "3 ready-to-run hunting guides",
    panelTitle: "从情报直接进入调查",
    panelDescription: "每张卡片都同时给出适用场景、数据域、预置查询和下一步动作。",
    panelBadge: "Collections / Notes / Rule sharing",
    cards: [
      {
        badgeTone: "critical",
        badge: "Hunt Guide",
        meta: "EDR / VPN / Proxy",
        title: "追踪针对 VPN 初始访问后的有效账户滥用",
        description: "面向当前高相关 Campaign，优先确认边界设备被利用后 30 分钟内的账号和会话异常。",
        code:
          'event.type in ("vpn_login","auth_success")\n| where device.name == "gw-prod-vpn-03"\n| summarize count(), make_set(user.name), make_set(source.ip) by bin(timestamp, 15m)',
        actions: [
          { label: "Run Sweep", tone: "primary" },
          { label: "Pin to Collection", tone: "warning" },
          { label: "Open Detection Rule" },
        ],
      },
      {
        badgeTone: "warning",
        badge: "Credential Watch",
        meta: "Identity / Email / Browser",
        title: "核验凭据泄露后是否出现异常访问与新终端注册",
        description: "适用于品牌仿冒和暗网凭据线索场景，先看身份异常，再看终端与邮箱侧联动异常。",
        code:
          'identity.risk == "high"\n| where user.group in ("finance-admin","payment-ops")\n| join kind=leftouter endpoint.enrollment on user.id\n| project timestamp, user.name, source.ip, device.name, risk.reason',
        actions: [
          { label: "Run Sweep", tone: "primary" },
          { label: "Force Reset", tone: "danger" },
          { label: "Notify IAM" },
        ],
      },
      {
        badgeTone: "info",
        badge: "Threat Pivot",
        meta: "DNS / Netflow / WAF",
        title: "沿 IOC 与基础设施邻近关系向外扩展观察",
        description: "当直接命中不充分时，可围绕域名、证书、解析变化和相邻出口行为做扩展确认。",
        code:
          'network.dest.ip in ("198.51.100.47","203.0.113.11")\n| summarize first_seen=min(timestamp), last_seen=max(timestamp), hits=count() by asset.name, tls.sni, dns.query',
        actions: [
          { label: "Pivot", tone: "primary" },
          { label: "Save Query" },
          { label: "Escalate to IR", tone: "warning" },
        ],
      },
      {
        badgeTone: "good",
        badge: "Analyst Note",
        meta: "Workbench / Notes",
        title: "研判结论摘要",
        description: "建议把 AI 或分析师摘要嵌在工作台侧，而不是单独做聊天框：这里直接解释变化、相关性和建议动作。",
        code:
          "Summary:\n- 当前高优先级威胁与 VPN 暴露和凭据泄露同时重叠\n- 建议先执行边界 sweep、账号重置、Owner 确认\n- 若 4 小时内新增命中，自动升级事件等级",
        actions: [{ label: "Share" }, { label: "Attach to Incident" }, { label: "Convert to Project", tone: "warning" }],
      },
    ],
  },
  playbooks: {
    sectionId: "playbooks",
    eyebrow: "Operational Response",
    title: "自动化响应剧本",
    description: "让情报不止停留在“知道了”，而是直接驱动 IOC 封禁、EDR 搜索、责任人确认、工单升级和跨团队通知。",
    badge: "4 playbooks can be auto-triggered",
    panelTitle: "自动化响应剧本",
    panelDescription: "把每个行动对象和触发条件写清楚，页面里就能自然形成从情报到响应的闭环。",
    panelBadge: "SOAR-ready",
    cards: [
      {
        badgeTone: "critical",
        badge: "Auto",
        meta: "4 steps",
        title: "IOC 封禁与代理/WAF 联动",
        description: "当 IOC 命中来源可信度高且已关联活动 Campaign 时，自动生成封禁建议并下发审批流。",
        details: ["Trigger: IOC confidence ≥ 0.85", "Scope: Proxy / WAF / Email", "Owner: SecOps"],
      },
      {
        badgeTone: "warning",
        badge: "Semi-auto",
        meta: "3 steps",
        title: "暴露资产负责人确认与补丁推进",
        description: "对未知 owner 或长时间未处置的暴露资产自动生成工单并升级到资产归属链路。",
        details: ["Trigger: exposure score > 85", "Scope: Asset / CMDB / Ticket", "Owner: Infra Lead"],
      },
      {
        badgeTone: "info",
        badge: "Analyst assist",
        meta: "2 steps",
        title: "基于情报的一键 EDR Sweep",
        description: "从 Campaign、IOC 或漏洞详情直接发起预置查询，自动回填命中数量、资产列表和调查状态。",
        details: ["Trigger: analyst initiated", "Scope: EDR / SIEM", "Output: hits + evidence"],
      },
      {
        badgeTone: "danger",
        badge: "Escalation",
        meta: "5 steps",
        title: "凭据泄露与品牌风险升级事件",
        description: "将外部风险、身份高危事件和业务关键域统一收敛为一个专项事件，推动品牌、IAM、SOC 协同。",
        details: ["Trigger: credential + brand overlap", "Scope: IAM / Brand / IR", "Priority: High"],
      },
    ],
    footer:
      "这版实际代码的核心变化不是“卡片更好看”，而是页面逻辑被重排成了一个真正可工作的情报中心：首页先讲相关性和优先级，中段承接攻击活动与暴露面，随后用图谱解释关系，再把研判和剧本放到最后一跳。这样分析师进入页面后能直接判断先看什么、为什么看、怎么查、怎么处置。",
  },
};
