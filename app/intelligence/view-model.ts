import {
  MOCK_INTEL_ACTORS,
  MOCK_INTEL_FEATURED_TOPICS,
  MOCK_INTEL_INDUSTRY_ALERTS,
  MOCK_INTEL_IOCS,
  MOCK_INTEL_REPORTS,
  MOCK_INTEL_SUBSCRIPTIONS,
  MOCK_INTEL_SUMMARY,
  MOCK_INTEL_VULNERABILITIES,
  type IntelActor,
  type IntelFeaturedTopic,
  type IntelIndustryAlert,
  type IntelIoc,
  type IntelReport,
  type IntelSummary,
  type IntelVulnerability,
} from "@/lib/intelligence-mock";
import type { GraphSnapshot, IntelligenceListEntry, RelevanceSnapshot } from "@/lib/intelligence-ops";
import type { LiveIntelligencePayload, LiveSourceStatus } from "@/lib/intelligence-sources";

export type SearchScope =
  | "all"
  | "campaigns"
  | "vulnerabilities"
  | "iocs"
  | "reports";

export type IntelligenceDisplayData = {
  summary: IntelSummary;
  featuredTopics: IntelFeaturedTopic[];
  actors: IntelActor[];
  vulnerabilities: IntelVulnerability[];
  iocs: IntelIoc[];
  alerts: IntelIndustryAlert[];
  reports: IntelReport[];
  sourceStatus: LiveSourceStatus[];
  subscriptions: string[];
  relevance: RelevanceSnapshot | null;
  graph: GraphSnapshot | null;
  threatList: IntelligenceListEntry[];
  safelist: IntelligenceListEntry[];
};

export function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

export function formatClock(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    hour12: false,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function includesQuery(query: string, values: Array<string | undefined>) {
  if (!query) return true;
  return values.some((value) => value?.toLowerCase().includes(query));
}

export function selectDisplayData(
  liveData: LiveIntelligencePayload | null,
  threatList: IntelligenceListEntry[],
  safelist: IntelligenceListEntry[],
  subscriptions: string[],
): IntelligenceDisplayData {
  return {
    summary: liveData?.summary ?? MOCK_INTEL_SUMMARY,
    featuredTopics:
      liveData?.featuredTopics?.length ? liveData.featuredTopics : MOCK_INTEL_FEATURED_TOPICS,
    actors: liveData?.actors?.length ? liveData.actors : MOCK_INTEL_ACTORS,
    vulnerabilities:
      liveData?.vulnerabilities?.length ? liveData.vulnerabilities : MOCK_INTEL_VULNERABILITIES,
    iocs: liveData?.iocs?.length ? liveData.iocs : MOCK_INTEL_IOCS,
    alerts: liveData?.advisories?.length ? liveData.advisories : MOCK_INTEL_INDUSTRY_ALERTS,
    reports: MOCK_INTEL_REPORTS,
    sourceStatus: liveData?.sourceStatus ?? [],
    subscriptions: liveData?.subscriptions?.length ? liveData.subscriptions : subscriptions,
    relevance: liveData?.relevance ?? null,
    graph: liveData?.graph ?? null,
    threatList,
    safelist,
  };
}

export function buildTimelineTopics(
  topics: IntelFeaturedTopic[],
  actors: IntelActor[],
  vulnerabilities: IntelVulnerability[],
) {
  const actorMap = new Map(actors.map((item) => [item.id, item]));
  const vulnerabilityMap = new Map(vulnerabilities.map((item) => [item.id, item]));

  return topics.map((topic) => ({
    ...topic,
    actorNames: topic.actorIds.map((id) => actorMap.get(id)?.name).filter(Boolean),
    vulnerabilityNames: topic.vulnerabilityIds
      .map((id) => vulnerabilityMap.get(id)?.cve)
      .filter(Boolean),
  }));
}

export function buildHuntCards(
  vulnerability: IntelVulnerability | undefined,
  ioc: IntelIoc | undefined,
  actor: IntelActor | undefined,
) {
  if (!vulnerability || !ioc || !actor) return [];

  return [
    {
      id: "hunt-vuln",
      badge: "Hunt Guide",
      badgeTone: "critical",
      meta: "边界访问 / EDR / 代理",
      title: `围绕 ${vulnerability.cve} 的初始入侵链开展排查`,
      description: "先验证公网暴露、再核查有效账户、最后回放外连与横向移动痕迹。",
      code: `event.dataset in ("vpn","proxy","edr")\n| where message contains "${vulnerability.cve}"\n| join kind=leftouter identity_events on user.name\n| summarize hits=count() by device.name, source.ip`,
      actions: [
        { label: "Run Sweep", tone: "primary" },
        { label: "导出规则", tone: "warning" },
        { label: "升级处置", tone: "danger" },
      ],
    },
    {
      id: "hunt-ioc",
      badge: "IOC Pivot",
      badgeTone: "info",
      meta: `${ioc.type} / ThreatFox`,
      title: `围绕 ${ioc.value} 扩展 IOC 关联分析`,
      description: "适合在流量、DNS、邮件和主机日志里快速确认关联命中范围。",
      code: `network.indicator == "${ioc.value}"\n| summarize first_seen=min(timestamp), last_seen=max(timestamp), assets=make_set(asset.name)`,
      actions: [
        { label: "复制 IOC", tone: "primary" },
        { label: "加入 Threat List", tone: "warning" },
      ],
    },
    {
      id: "hunt-actor",
      badge: "Actor Focus",
      badgeTone: "warning",
      meta: "MITRE ATT&CK",
      title: `按 ${actor.name} 的攻击偏好回溯 TTP`,
      description: "用组织画像驱动排查，而不是单纯围绕单个 IOC 做被动搜索。",
      code: actor.ttp.join("\n"),
      actions: [
        { label: "映射 ATT&CK", tone: "primary" },
        { label: "订阅组织更新" },
      ],
    },
  ];
}

export function buildPlaybookCards(
  alerts: IntelIndustryAlert[],
  subscriptions: string[],
  threatList: IntelligenceListEntry[],
  safelist: IntelligenceListEntry[],
) {
  return [
    {
      id: "playbook-priority",
      badge: "Playbook",
      badgeTone: "critical",
      meta: "Now",
      title: "暴露资产 + Threat List 联动处置",
      description:
        "当高危漏洞与 Threat List 中实体重叠时，触发工单、EDR Sweep 与责任人确认。",
      details: [
        `Threat List: ${threatList.length}`,
        `Safelist: ${safelist.length}`,
        "动作：工单 / 封禁 / 责任人确认",
      ],
    },
    {
      id: "playbook-alerts",
      badge: "Industry Alert",
      badgeTone: "warning",
      meta: `${alerts.length} 条预警`,
      title: "行业预警驱动的面向客户通报",
      description: "把外部预警、客户相关性和建议动作收敛成可发送的运营通报。",
      details: [
        alerts[0]?.title ?? "暂无预警",
        alerts[1]?.title ?? "待同步新增预警",
        "动作：客户通报 / 处置建议",
      ],
    },
    {
      id: "playbook-subs",
      badge: "Subscription",
      badgeTone: "info",
      meta: `${subscriptions.length} 项订阅`,
      title: "订阅驱动的持续跟踪",
      description: "围绕重点组织、漏洞和行业主题，形成连续跟踪而不是一次性浏览。",
      details: subscriptions.slice(0, 3),
    },
  ];
}
