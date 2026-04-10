export type IntelSeverity = "critical" | "high" | "medium";
export type IntelTopicType = "actor" | "vulnerability" | "campaign" | "industry";
export type IntelActivityStatus = "active" | "tracking" | "watch";
export type IntelIocType = "IP" | "Domain" | "URL" | "Hash" | "Email";
export type IntelConfidence = "高" | "中" | "低";

export interface IntelSummary {
  newItemsToday: number;
  activeActors: number;
  criticalVulnerabilities: number;
  newIocs: number;
  industryAlerts: number;
  weeklyReports: number;
}

export interface IntelFeaturedTopic {
  id: string;
  title: string;
  subtitle: string;
  type: IntelTopicType;
  severity: IntelSeverity;
  updatedAt: string;
  summary: string;
  tags: string[];
  focus: string[];
  actorIds: string[];
  vulnerabilityIds: string[];
  iocIds: string[];
  reportIds: string[];
}

export interface IntelActor {
  id: string;
  name: string;
  aliases: string[];
  activityStatus: IntelActivityStatus;
  riskRating: IntelSeverity;
  origin: string;
  activeSince: string;
  lastActivity: string;
  targetIndustries: string[];
  targetRegions: string[];
  objectives: string[];
  ttp: string[];
  toolset: string[];
  recentCampaigns: string[];
  description: string;
  vendorAssessment: string;
  relatedVulnerabilityIds: string[];
  relatedIocIds: string[];
  relatedReportIds: string[];
}

export interface IntelVulnerability {
  id: string;
  cve: string;
  title: string;
  severity: IntelSeverity;
  cvss: string;
  affectedProducts: string[];
  inTheWild: boolean;
  exploitMaturity: string;
  summary: string;
  detection: string[];
  mitigation: string[];
  linkedActorIds: string[];
  linkedIocIds: string[];
  linkedReportIds: string[];
}

export interface IntelIoc {
  id: string;
  value: string;
  type: IntelIocType;
  confidence: IntelConfidence;
  severity: IntelSeverity;
  source: string;
  firstSeen: string;
  lastSeen: string;
  context: string;
  tags: string[];
  linkedActorIds: string[];
  linkedVulnerabilityIds: string[];
}

export interface IntelIndustryAlert {
  id: string;
  title: string;
  industries: string[];
  severity: IntelSeverity;
  urgency: "立即" | "高" | "中";
  summary: string;
  recommendation: string[];
  linkedActorIds: string[];
  linkedVulnerabilityIds: string[];
  linkedReportIds: string[];
}

export interface IntelReport {
  id: string;
  title: string;
  period: string;
  type: string;
  summary: string;
  keyFindings: string[];
  linkedActorIds: string[];
  linkedVulnerabilityIds: string[];
}

const now = Date.now();
const hoursAgo = (hours: number) => new Date(now - hours * 3_600_000).toISOString();
const daysAgo = (days: number) => new Date(now - days * 86_400_000).toISOString();

export const MOCK_INTEL_SUMMARY: IntelSummary = {
  newItemsToday: 18,
  activeActors: 7,
  criticalVulnerabilities: 4,
  newIocs: 63,
  industryAlerts: 5,
  weeklyReports: 3,
};

export const MOCK_INTEL_FEATURED_TOPICS: IntelFeaturedTopic[] = [
  {
    id: "topic-ivanti-chain",
    title: "边界设备新利用链进入高危追踪",
    subtitle: "Ivanti 相关利用链扩大，攻击者正将公开 PoC 快速转入批量扫描。",
    type: "vulnerability",
    severity: "critical",
    updatedAt: hoursAgo(2),
    summary:
      "多个公网边界资产被纳入扫描列表，相关基础设施与既有情报样本存在交集，需要优先核查暴露面与补丁状态。",
    tags: ["边界设备", "在野利用", "公网暴露"],
    focus: ["优先排查 VPN/边界网关", "校验 PoC 命中痕迹", "补丁前先加缓解策略"],
    actorIds: ["actor-silver-harbor"],
    vulnerabilityIds: ["vuln-cve-2026-7712"],
    iocIds: ["ioc-001", "ioc-002"],
    reportIds: ["report-weekly-15"],
  },
  {
    id: "topic-finance-phishing",
    title: "金融行业遭遇仿冒登录页与二次验证劫持",
    subtitle: "攻击链从邮件钓鱼扩展到 OAuth 与 MFA 疲劳攻击。",
    type: "industry",
    severity: "high",
    updatedAt: hoursAgo(6),
    summary:
      "情报显示仿冒门户、钓鱼域名和 OTP 转发基础设施在 48 小时内集中活跃，面向金融与政企账号展开持续收集。",
    tags: ["金融行业", "钓鱼", "凭据窃取"],
    focus: ["关注邮箱与 IAM 告警", "监控新注册仿冒域名", "通知客户强化登录审核"],
    actorIds: ["actor-mirror-cicada"],
    vulnerabilityIds: [],
    iocIds: ["ioc-003", "ioc-004", "ioc-006"],
    reportIds: ["report-industry-finance"],
  },
  {
    id: "topic-esxi-ransomware",
    title: "针对虚拟化资产的勒索前置扫描回升",
    subtitle: "围绕 ESXi 管理面与备份系统的前置侦察明显增多。",
    type: "campaign",
    severity: "high",
    updatedAt: daysAgo(1),
    summary:
      "扫描源与历史勒索链中出现的中继节点高度相似，攻击者在打入前优先枚举备份控制台和运维入口。",
    tags: ["勒索", "ESXi", "备份系统"],
    focus: ["核查运维暴露面", "核验备份系统账户", "提高横向移动监控优先级"],
    actorIds: ["actor-ember-vault"],
    vulnerabilityIds: ["vuln-cve-2026-1180"],
    iocIds: ["ioc-005"],
    reportIds: ["report-ransomware-q2"],
  },
];

export const MOCK_INTEL_ACTORS: IntelActor[] = [
  {
    id: "actor-silver-harbor",
    name: "Silver Harbor",
    aliases: ["SH-27", "Harbor Jackal"],
    activityStatus: "active",
    riskRating: "critical",
    origin: "东亚活动组织",
    activeSince: "2022",
    lastActivity: hoursAgo(8),
    targetIndustries: ["制造", "能源", "政企"],
    targetRegions: ["东亚", "东南亚", "中东"],
    objectives: ["初始入侵", "边界设备控制", "横向渗透"],
    ttp: ["T1190 利用公网应用", "T1078 有效账户", "T1021 远程服务"],
    toolset: ["定制 WebShell", "SSH 隧道工具", "边界设备扫描器"],
    recentCampaigns: ["边界网关利用链扩展", "供应商入口打点"],
    description:
      "该组织偏好从公网边界和外包运维入口切入，再通过有效账户和运维链路扩大控制范围。",
    vendorAssessment:
      "若边界设备暴露面与弱口令治理存在短板，该组织会快速完成从扫描到驻留的转换，需优先关注外网入口和运维账户。",
    relatedVulnerabilityIds: ["vuln-cve-2026-7712"],
    relatedIocIds: ["ioc-001", "ioc-002"],
    relatedReportIds: ["report-weekly-15"],
  },
  {
    id: "actor-mirror-cicada",
    name: "Mirror Cicada",
    aliases: ["MC-Blue", "Mirror Mantis"],
    activityStatus: "tracking",
    riskRating: "high",
    origin: "跨区域凭据窃取团伙",
    activeSince: "2023",
    lastActivity: hoursAgo(4),
    targetIndustries: ["金融", "教育", "互联网"],
    targetRegions: ["中国", "新加坡", "英国"],
    objectives: ["凭据窃取", "会话接管", "业务邮箱渗透"],
    ttp: ["T1566 钓鱼", "T1111 MFA 绕过", "T1539 Web 会话 Cookie"],
    toolset: ["仿冒登录门户", "OTP 转发工具", "云邮箱 API 枚举脚本"],
    recentCampaigns: ["金融仿冒登录页", "OAuth 同意劫持"],
    description:
      "该团伙围绕身份与邮箱体系发起攻击，常与仿冒域名、短时基础设施和多阶段凭据验证链联动。",
    vendorAssessment:
      "对金融客户尤其危险，因为攻击者会同时命中邮箱、身份和业务系统，容易造成高权限账号被接管。",
    relatedVulnerabilityIds: [],
    relatedIocIds: ["ioc-003", "ioc-004", "ioc-006"],
    relatedReportIds: ["report-industry-finance"],
  },
  {
    id: "actor-ember-vault",
    name: "Ember Vault",
    aliases: ["EV-Ransom", "Ash Hopper"],
    activityStatus: "watch",
    riskRating: "high",
    origin: "勒索即服务生态团伙",
    activeSince: "2021",
    lastActivity: daysAgo(2),
    targetIndustries: ["制造", "医疗", "零售"],
    targetRegions: ["北美", "欧洲", "亚太"],
    objectives: ["双重勒索", "备份破坏", "虚拟化平台加密"],
    ttp: ["T1486 数据加密", "T1490 备份删除", "T1046 网络扫描"],
    toolset: ["ESXi 加密器", "批量扫描脚本", "备份控制台枚举器"],
    recentCampaigns: ["面向虚拟化平台的前置侦察", "备份控制台口令喷洒"],
    description:
      "该团伙高度依赖前置侦察与批量筛选，确定可加密价值后再投放勒索载荷。",
    vendorAssessment:
      "若客户的虚拟化和备份控制面存在暴露，该团伙的威胁等级会显著上升，需要把资产暴露核查纳入常规排程。",
    relatedVulnerabilityIds: ["vuln-cve-2026-1180"],
    relatedIocIds: ["ioc-005"],
    relatedReportIds: ["report-ransomware-q2"],
  },
];

export const MOCK_INTEL_VULNERABILITIES: IntelVulnerability[] = [
  {
    id: "vuln-cve-2026-7712",
    cve: "CVE-2026-7712",
    title: "边界设备认证链绕过导致未授权远程执行",
    severity: "critical",
    cvss: "9.8",
    affectedProducts: ["Ivanti Secure Access", "边界接入控制设备"],
    inTheWild: true,
    exploitMaturity: "PoC 已公开，扫描与利用同步活跃",
    summary:
      "攻击者可绕过前置认证逻辑写入恶意配置，再通过设备自身服务链完成远程命令执行。",
    detection: ["检查异常管理接口访问", "核对新建系统任务与配置漂移", "监控边界设备外连"],
    mitigation: ["立即应用厂商补丁", "临时收敛公网暴露面", "增加管理入口访问控制"],
    linkedActorIds: ["actor-silver-harbor"],
    linkedIocIds: ["ioc-001", "ioc-002"],
    linkedReportIds: ["report-weekly-15"],
  },
  {
    id: "vuln-cve-2026-1180",
    cve: "CVE-2026-1180",
    title: "虚拟化管理接口命令注入",
    severity: "high",
    cvss: "8.6",
    affectedProducts: ["VMware ESXi 管理服务", "第三方备份控制台插件"],
    inTheWild: true,
    exploitMaturity: "小范围利用样本已出现",
    summary:
      "管理接口对特定参数缺少约束，攻击者可借此执行系统级操作并推进勒索前置动作。",
    detection: ["关注管理接口异常 POST 请求", "排查备份控制台异常登录", "监控临时 shell 落地"],
    mitigation: ["限制管理面公网访问", "加固运维账户 MFA", "验证备份策略完整性"],
    linkedActorIds: ["actor-ember-vault"],
    linkedIocIds: ["ioc-005"],
    linkedReportIds: ["report-ransomware-q2"],
  },
  {
    id: "vuln-cve-2026-4421",
    cve: "CVE-2026-4421",
    title: "邮件协作平台 OAuth 同意滥用",
    severity: "high",
    cvss: "8.1",
    affectedProducts: ["企业邮箱 SaaS", "身份平台 OAuth 应用"],
    inTheWild: false,
    exploitMaturity: "利用模板流出，仿冒活动上升",
    summary:
      "攻击者通过社会工程诱导用户授权恶意应用，获取长期邮箱和文件访问能力。",
    detection: ["审计异常 OAuth 应用授权", "关注新租户来源重定向", "监控短期异常登录后授权行为"],
    mitigation: ["限制第三方应用授权", "提高高权限用户审计频次", "强化品牌域监控"],
    linkedActorIds: ["actor-mirror-cicada"],
    linkedIocIds: ["ioc-003", "ioc-006"],
    linkedReportIds: ["report-industry-finance"],
  },
];

export const MOCK_INTEL_IOCS: IntelIoc[] = [
  {
    id: "ioc-001",
    value: "185.221.77.14",
    type: "IP",
    confidence: "高",
    severity: "critical",
    source: "边界设备蜜网",
    firstSeen: daysAgo(3),
    lastSeen: hoursAgo(7),
    context: "与边界设备管理面扫描和后续外连行为同时出现。",
    tags: ["公网扫描", "边界设备", "Silver Harbor"],
    linkedActorIds: ["actor-silver-harbor"],
    linkedVulnerabilityIds: ["vuln-cve-2026-7712"],
  },
  {
    id: "ioc-002",
    value: "cdn-sync-access[.]com",
    type: "Domain",
    confidence: "高",
    severity: "critical",
    source: "样本逆向",
    firstSeen: daysAgo(6),
    lastSeen: hoursAgo(3),
    context: "作为边界设备落地后的配置回连与任务下发域名。",
    tags: ["C2", "配置回连", "Silver Harbor"],
    linkedActorIds: ["actor-silver-harbor"],
    linkedVulnerabilityIds: ["vuln-cve-2026-7712"],
  },
  {
    id: "ioc-003",
    value: "auth-check-secure[.]net",
    type: "Domain",
    confidence: "中",
    severity: "high",
    source: "品牌监测",
    firstSeen: daysAgo(1),
    lastSeen: hoursAgo(5),
    context: "仿冒金融机构统一登录页面，诱导输入密码与 OTP。",
    tags: ["仿冒登录页", "金融行业", "Mirror Cicada"],
    linkedActorIds: ["actor-mirror-cicada"],
    linkedVulnerabilityIds: ["vuln-cve-2026-4421"],
  },
  {
    id: "ioc-004",
    value: "https://signin-safeverify[.]com/portal/login",
    type: "URL",
    confidence: "高",
    severity: "high",
    source: "邮件钓鱼样本",
    firstSeen: daysAgo(2),
    lastSeen: hoursAgo(6),
    context: "钓鱼邮件中用于收集二次验证信息的落地 URL。",
    tags: ["钓鱼", "OTP 劫持", "金融行业"],
    linkedActorIds: ["actor-mirror-cicada"],
    linkedVulnerabilityIds: [],
  },
  {
    id: "ioc-005",
    value: "d3b07384d113edec49eaa6238ad5ff00",
    type: "Hash",
    confidence: "高",
    severity: "high",
    source: "沙箱分析",
    firstSeen: daysAgo(5),
    lastSeen: daysAgo(1),
    context: "与 ESXi 前置探测模块一致的扫描器样本哈希。",
    tags: ["勒索前置", "虚拟化", "Ember Vault"],
    linkedActorIds: ["actor-ember-vault"],
    linkedVulnerabilityIds: ["vuln-cve-2026-1180"],
  },
  {
    id: "ioc-006",
    value: "notify-center@safe-message[.]org",
    type: "Email",
    confidence: "中",
    severity: "medium",
    source: "邮件网关",
    firstSeen: daysAgo(4),
    lastSeen: hoursAgo(12),
    context: "用于发送 OAuth 同意链接和 MFA 疲劳通知伪装邮件。",
    tags: ["社工邮件", "邮箱攻击", "Mirror Cicada"],
    linkedActorIds: ["actor-mirror-cicada"],
    linkedVulnerabilityIds: ["vuln-cve-2026-4421"],
  },
];

export const MOCK_INTEL_INDUSTRY_ALERTS: IntelIndustryAlert[] = [
  {
    id: "alert-finance-login",
    title: "金融行业需重点监控仿冒登录页与 MFA 疲劳攻击",
    industries: ["金融", "保险"],
    severity: "high",
    urgency: "立即",
    summary:
      "攻击者正在复用品牌相似域名和一次性 OTP 转发页面，对高权限邮箱与统一登录入口展开批量收集。",
    recommendation: [
      "提高邮箱与 IAM 告警优先级",
      "监控新增品牌仿冒域名",
      "对高权限账户执行额外登录审计",
    ],
    linkedActorIds: ["actor-mirror-cicada"],
    linkedVulnerabilityIds: ["vuln-cve-2026-4421"],
    linkedReportIds: ["report-industry-finance"],
  },
  {
    id: "alert-manufacturing-edge",
    title: "制造业客户需复核边界设备暴露与补丁窗口",
    industries: ["制造", "能源"],
    severity: "critical",
    urgency: "立即",
    summary:
      "边界设备 PoC 扩散速度快，相关扫描源已明显增加，存在从供应商入口横向进入生产网络的风险。",
    recommendation: [
      "优先梳理边界设备资产清单",
      "缩小管理面暴露范围",
      "短期提高边界外连监控和阻断策略",
    ],
    linkedActorIds: ["actor-silver-harbor"],
    linkedVulnerabilityIds: ["vuln-cve-2026-7712"],
    linkedReportIds: ["report-weekly-15"],
  },
  {
    id: "alert-retail-ransomware",
    title: "零售与医疗行业需关注备份控制台暴露面",
    industries: ["零售", "医疗"],
    severity: "high",
    urgency: "高",
    summary:
      "勒索前置扫描活动回升，目标转向虚拟化管理面和备份平台，高价值但防护薄弱的资产最容易被优先命中。",
    recommendation: [
      "排查备份控制台弱口令与公网暴露",
      "验证恢复演练链路",
      "补充虚拟化管理日志告警",
    ],
    linkedActorIds: ["actor-ember-vault"],
    linkedVulnerabilityIds: ["vuln-cve-2026-1180"],
    linkedReportIds: ["report-ransomware-q2"],
  },
];

export const MOCK_INTEL_REPORTS: IntelReport[] = [
  {
    id: "report-weekly-15",
    title: "第 15 周边界威胁周报",
    period: "2026 W15",
    type: "周报",
    summary:
      "聚焦边界设备利用链、暴露面扫描趋势，以及从边界切入后常见的横向移动路径。",
    keyFindings: [
      "边界设备利用链响应窗口显著缩短",
      "制造与能源行业暴露资产数量持续偏高",
      "相关 IOC 已出现多次基础设施复用",
    ],
    linkedActorIds: ["actor-silver-harbor"],
    linkedVulnerabilityIds: ["vuln-cve-2026-7712"],
  },
  {
    id: "report-industry-finance",
    title: "金融行业身份威胁专题简报",
    period: "2026-04",
    type: "行业专刊",
    summary:
      "围绕金融行业的身份型攻击活动进行梳理，覆盖仿冒域名、钓鱼入口、OAuth 滥用与 MFA 攻击。",
    keyFindings: [
      "品牌仿冒域注册周期缩短",
      "OAuth 同意劫持与钓鱼入口协同增加",
      "高权限邮箱与财务系统账号为重点目标",
    ],
    linkedActorIds: ["actor-mirror-cicada"],
    linkedVulnerabilityIds: ["vuln-cve-2026-4421"],
  },
  {
    id: "report-ransomware-q2",
    title: "勒索生态与虚拟化平台风险观察",
    period: "2026 Q2",
    type: "专题报告",
    summary:
      "分析勒索团伙围绕虚拟化平台、备份系统和运维入口的前置动作，帮助客户将关注点前移。",
    keyFindings: [
      "前置侦察已明显早于实际加密阶段",
      "备份控制台和 ESXi 管理面成为优先目标",
      "运维账户与恢复链路是两大薄弱点",
    ],
    linkedActorIds: ["actor-ember-vault"],
    linkedVulnerabilityIds: ["vuln-cve-2026-1180"],
  },
];

export const MOCK_INTEL_WATCHLIST = [
  "Silver Harbor",
  "CVE-2026-7712",
  "金融仿冒域名",
  "勒索前置扫描",
];

export const MOCK_INTEL_RECENT_VIEWS = [
  "边界设备新利用链进入高危追踪",
  "金融行业身份威胁专题简报",
  "auth-check-secure[.]net",
];

export const MOCK_INTEL_SUBSCRIPTIONS = [
  "每周边界威胁周报",
  "金融行业身份专题",
  "高危漏洞快报",
];
