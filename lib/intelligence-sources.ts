import Parser from "rss-parser";
import {
  MOCK_INTEL_ACTORS,
  MOCK_INTEL_IOCS,
  MOCK_INTEL_REPORTS,
  type IntelActor,
  type IntelFeaturedTopic,
  type IntelIndustryAlert,
  type IntelIoc,
  type IntelSummary,
  type IntelVulnerability,
} from "./intelligence-mock";
import { buildLiveMappingLayer } from "./intelligence-mapping-sources";

const KEV_URL =
  "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
const NVD_API_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0";
const EPSS_API_BASE = "https://api.first.org/data/v1/epss";
const CISA_ADVISORIES_RSS = "https://www.cisa.gov/cybersecurity-advisories/all.xml";

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "CybersecDaily-Intelligence/1.0" },
});

type KevEntry = {
  cveID: string;
  vendorProject?: string;
  product?: string;
  vulnerabilityName?: string;
  shortDescription?: string;
  requiredAction?: string;
  dateAdded?: string;
  dueDate?: string;
  knownRansomwareCampaignUse?: string;
};

type NvdMetric = {
  cvssData?: {
    baseScore?: number;
  };
};

type NvdResponse = {
  vulnerabilities?: Array<{
    cve?: {
      descriptions?: Array<{ lang?: string; value?: string }>;
      metrics?: {
        cvssMetricV31?: NvdMetric[];
        cvssMetricV30?: NvdMetric[];
        cvssMetricV2?: NvdMetric[];
      };
      published?: string;
    };
  }>;
};

type EpssResponse = {
  data?: Array<{
    cve?: string;
    epss?: string;
    percentile?: string;
    date?: string;
  }>;
};

export type LiveSourceStatus = {
  source: string;
  ok: boolean;
  detail: string;
  count: number;
};

export type LiveIntelligencePayload = {
  updatedAt: string;
  sourceStatus: LiveSourceStatus[];
  summary: IntelSummary;
  featuredTopics: IntelFeaturedTopic[];
  actors: IntelActor[];
  vulnerabilities: IntelVulnerability[];
  iocs: IntelIoc[];
  advisories: IntelIndustryAlert[];
  subscriptions: string[];
  subscriptionStorage?: "kv" | "memory";
};

function parseScore(item?: NvdMetric[]): number | null {
  const score = item?.[0]?.cvssData?.baseScore;
  return typeof score === "number" ? score : null;
}

function scoreSeverity(baseScore: number | null, epss: number | null): IntelVulnerability["severity"] {
  if ((epss ?? 0) >= 0.9 || (baseScore ?? 0) >= 9) return "critical";
  if ((epss ?? 0) >= 0.45 || (baseScore ?? 0) >= 7) return "high";
  return "medium";
}

function toIsoDate(value?: string) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { "User-Agent": "CybersecDaily-Intelligence/1.0" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function fetchKevCatalog(limit = 6): Promise<KevEntry[]> {
  const payload = await fetchJson<{ vulnerabilities?: KevEntry[] }>(KEV_URL);

  return (payload.vulnerabilities ?? [])
    .sort(
      (a, b) =>
        new Date(b.dateAdded ?? 0).getTime() - new Date(a.dateAdded ?? 0).getTime(),
    )
    .slice(0, limit);
}

async function fetchNvdDetail(cveId: string) {
  const payload = await fetchJson<NvdResponse>(
    `${NVD_API_BASE}?cveId=${encodeURIComponent(cveId)}`,
  );
  const cve = payload.vulnerabilities?.[0]?.cve;
  const description =
    cve?.descriptions?.find((item) => item.lang === "en")?.value ??
    cve?.descriptions?.[0]?.value ??
    "";
  const baseScore =
    parseScore(cve?.metrics?.cvssMetricV31) ??
    parseScore(cve?.metrics?.cvssMetricV30) ??
    parseScore(cve?.metrics?.cvssMetricV2);

  return {
    description,
    baseScore,
    published: toIsoDate(cve?.published),
  };
}

async function fetchEpssScore(cveId: string) {
  const payload = await fetchJson<EpssResponse>(
    `${EPSS_API_BASE}?cve=${encodeURIComponent(cveId)}`,
  );
  const item = payload.data?.[0];
  return {
    score: item?.epss ? Number(item.epss) : null,
    percentile: item?.percentile ? Number(item.percentile) : null,
  };
}

async function fetchAdvisories(limit = 6): Promise<IntelIndustryAlert[]> {
  const feed = await parser.parseURL(CISA_ADVISORIES_RSS);

  return (feed.items ?? []).slice(0, limit).map((item, index) => ({
    id: `live-alert-${index + 1}`,
    title: item.title ?? "CISA 安全公告",
    industries: ["跨行业", "关键基础设施"],
    severity: index < 2 ? "critical" : index < 4 ? "high" : "medium",
    urgency: index < 2 ? "立即" : index < 4 ? "高" : "中",
    summary:
      (item.contentSnippet ?? item.content ?? item.summary ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 180) || "官方预警摘要暂不可用，请进入原文查看。",
    recommendation: [
      "核对受影响资产是否暴露在公网",
      "结合现有检测规则审计异常访问",
      "将该公告纳入客户通报与加固清单",
    ],
    linkedActorIds: [],
    linkedVulnerabilityIds: [],
    linkedReportIds: [],
  }));
}

function buildFeaturedTopics(
  vulnerabilities: IntelVulnerability[],
): IntelFeaturedTopic[] {
  return vulnerabilities.slice(0, 3).map((item, index) => ({
    id: `live-topic-${index + 1}`,
    title: `${item.cve} 高优先级跟踪`,
    subtitle: item.title,
    type: "vulnerability",
    severity: item.severity,
    updatedAt: new Date().toISOString(),
    summary: item.summary,
    tags: item.affectedProducts.slice(0, 3),
    focus: [
      item.inTheWild ? "已进入在野利用观察" : "进入高危利用跟踪",
      item.exploitMaturity,
      item.mitigation[0] ?? "优先核对资产暴露与修复窗口",
    ],
    actorIds: item.linkedActorIds,
    vulnerabilityIds: [item.id],
    iocIds: item.linkedIocIds,
    reportIds: item.linkedReportIds,
  }));
}

function summarizeLiveData(
  actors: IntelActor[],
  vulnerabilities: IntelVulnerability[],
  iocs: IntelIoc[],
  advisories: IntelIndustryAlert[],
): IntelSummary {
  const addedWithin24h = vulnerabilities.filter((item) =>
    item.summary.includes("新增") || item.inTheWild,
  ).length;

  return {
    newItemsToday: addedWithin24h + advisories.length,
    activeActors: actors.length || MOCK_INTEL_ACTORS.length,
    criticalVulnerabilities: vulnerabilities.filter(
      (item) => item.severity === "critical",
    ).length,
    newIocs: iocs.length || MOCK_INTEL_IOCS.length,
    industryAlerts: advisories.length,
    weeklyReports: MOCK_INTEL_REPORTS.length,
  };
}

export async function buildLiveIntelligenceSnapshot(): Promise<
  Omit<LiveIntelligencePayload, "subscriptions" | "subscriptionStorage">
> {
  const sourceStatus: LiveSourceStatus[] = [];
  let actors: IntelActor[] = [];
  let vulnerabilities: IntelVulnerability[] = [];
  let iocs: IntelIoc[] = [];
  let advisories: IntelIndustryAlert[] = [];

  try {
    const kevEntries = await fetchKevCatalog();
    const vulnerabilityResults = await Promise.allSettled(
      kevEntries.map(async (entry, index) => {
        const [nvd, epss] = await Promise.all([
          fetchNvdDetail(entry.cveID),
          fetchEpssScore(entry.cveID),
        ]);

        const severity = scoreSeverity(nvd.baseScore, epss.score);
        const linkedActorIds =
          index === 0
            ? [MOCK_INTEL_ACTORS[0]?.id].filter(Boolean)
            : index === 1
              ? [MOCK_INTEL_ACTORS[1]?.id].filter(Boolean)
              : [];
        const linkedIocIds =
          index === 0 ? MOCK_INTEL_IOCS.slice(0, 2).map((item) => item.id) : [];

        return {
          id: `live-${entry.cveID.toLowerCase()}`,
          cve: entry.cveID,
          title:
            entry.vulnerabilityName ??
            `${entry.vendorProject ?? "未知厂商"} ${entry.product ?? ""}`.trim(),
          severity,
          cvss: nvd.baseScore ? nvd.baseScore.toFixed(1) : "N/A",
          affectedProducts: [
            [entry.vendorProject, entry.product].filter(Boolean).join(" / "),
          ].filter(Boolean),
          inTheWild: true,
          exploitMaturity:
            epss.score !== null
              ? `EPSS ${(epss.score * 100).toFixed(1)}% · 百分位 ${(
                  (epss.percentile ?? 0) * 100
                ).toFixed(1)}%`
              : "CISA KEV 已确认存在真实利用",
          summary:
            nvd.description ||
            entry.shortDescription ||
            "官方描述暂不可用，请结合厂商与 NVD 详情核验。",
          detection: [
            "优先核对受影响产品的暴露面与版本范围",
            "回溯边界访问日志与异常管理接口请求",
            "将该 CVE 加入近期高优先级检测与通报列表",
          ],
          mitigation: [
            entry.requiredAction || "尽快应用官方补丁或临时缓解措施",
            entry.dueDate ? `建议最晚于 ${entry.dueDate} 前完成修复` : "安排紧急修复窗口",
            entry.knownRansomwareCampaignUse === "Known"
              ? "存在勒索攻击利用记录，应提高通报和处置优先级"
              : "结合业务影响评估补丁顺序",
          ],
          linkedActorIds,
          linkedIocIds,
          linkedReportIds: linkedActorIds.length ? [MOCK_INTEL_REPORTS[0]?.id].filter(Boolean) : [],
        } satisfies IntelVulnerability;
      }),
    );

    vulnerabilities = vulnerabilityResults.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );

    sourceStatus.push({
      source: "CISA KEV / NVD / FIRST EPSS",
      ok: vulnerabilities.length > 0,
      detail:
        vulnerabilities.length > 0
          ? "已合成实时漏洞专题"
          : "漏洞数据暂不可用，已回退到知识库内容",
      count: vulnerabilities.length,
    });
  } catch (error) {
    sourceStatus.push({
      source: "CISA KEV / NVD / FIRST EPSS",
      ok: false,
      detail: error instanceof Error ? error.message : "未知错误",
      count: 0,
    });
  }

  try {
    advisories = await fetchAdvisories();
    sourceStatus.push({
      source: "CISA Advisories RSS",
      ok: advisories.length > 0,
      detail:
        advisories.length > 0 ? "已同步官方预警摘要" : "未获取到公告条目",
      count: advisories.length,
    });
  } catch (error) {
    sourceStatus.push({
      source: "CISA Advisories RSS",
      ok: false,
      detail: error instanceof Error ? error.message : "未知错误",
      count: 0,
    });
  }

  const mappingLayer = await buildLiveMappingLayer();
  actors = mappingLayer.actors;
  iocs = mappingLayer.iocs;
  sourceStatus.push(...mappingLayer.status);

  return {
    updatedAt: new Date().toISOString(),
    sourceStatus,
    summary: summarizeLiveData(actors, vulnerabilities, iocs, advisories),
    featuredTopics: buildFeaturedTopics(vulnerabilities),
    actors,
    vulnerabilities,
    iocs,
    advisories,
  };
}
