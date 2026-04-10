"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import NavBar from "@/components/NavBar";
import {
  MOCK_INTEL_ACTORS,
  MOCK_INTEL_FEATURED_TOPICS,
  MOCK_INTEL_INDUSTRY_ALERTS,
  MOCK_INTEL_IOCS,
  MOCK_INTEL_RECENT_VIEWS,
  MOCK_INTEL_REPORTS,
  MOCK_INTEL_SUBSCRIPTIONS,
  MOCK_INTEL_SUMMARY,
  MOCK_INTEL_VULNERABILITIES,
  MOCK_INTEL_WATCHLIST,
  type IntelSeverity,
  type IntelVulnerability,
} from "@/lib/intelligence-mock";
import type { LiveIntelligencePayload, LiveSourceStatus } from "@/lib/intelligence-sources";

const severityBadge: Record<IntelSeverity, string> = {
  critical: "bg-red-500/12 text-red-500 border-red-500/20",
  high: "bg-orange-500/12 text-orange-500 border-orange-500/20",
  medium: "bg-amber-500/12 text-amber-600 border-amber-500/20",
};

const activityBadge = {
  active: "bg-red-500/10 text-red-500 border-red-500/20",
  tracking: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  watch: "bg-slate-500/10 text-slate-500 border-slate-500/20",
} as const;

const activityLabel = {
  active: "活跃",
  tracking: "跟踪中",
  watch: "观察",
} as const;

const topicTypeLabel = {
  actor: "组织",
  vulnerability: "漏洞",
  campaign: "活动",
  industry: "行业",
} as const;

type SearchScope =
  | "all"
  | "actors"
  | "vulnerabilities"
  | "iocs"
  | "alerts"
  | "reports";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    hour12: false,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function includesQuery(query: string, values: Array<string | undefined>) {
  if (!query) return true;
  return values.some((value) => value?.toLowerCase().includes(query));
}

function DomainCard({
  title,
  icon,
  description,
  href,
}: {
  title: string;
  icon: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="glass rounded-2xl p-4 transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#94a3b8]">
          Entry
        </span>
      </div>
      <div className="mt-3 text-sm font-semibold text-[#1a1a2e]">{title}</div>
      <p className="mt-1 text-xs leading-5 text-[#64748b]">{description}</p>
    </a>
  );
}

export default function IntelligencePage() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [liveData, setLiveData] = useState<LiveIntelligencePayload | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [liveError, setLiveError] = useState("");
  const [selectedActorId, setSelectedActorId] = useState(
    MOCK_INTEL_ACTORS[0]?.id ?? "",
  );
  const [selectedVulnerabilityId, setSelectedVulnerabilityId] = useState(
    MOCK_INTEL_VULNERABILITIES[0]?.id ?? "",
  );
  const [selectedIocId, setSelectedIocId] = useState(
    MOCK_INTEL_IOCS[0]?.id ?? "",
  );
  const [watchlist, setWatchlist] = useState(MOCK_INTEL_WATCHLIST);
  const [subscriptions, setSubscriptions] = useState(MOCK_INTEL_SUBSCRIPTIONS);
  const [feedback, setFeedback] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const displayedSummary = liveData?.summary ?? MOCK_INTEL_SUMMARY;
  const displayedFeaturedTopics = liveData?.featuredTopics?.length
    ? liveData.featuredTopics
    : MOCK_INTEL_FEATURED_TOPICS;
  const displayedVulnerabilities = liveData?.vulnerabilities?.length
    ? liveData.vulnerabilities
    : MOCK_INTEL_VULNERABILITIES;
  const displayedAlerts = liveData?.advisories?.length
    ? liveData.advisories
    : MOCK_INTEL_INDUSTRY_ALERTS;
  const sourceStatus: LiveSourceStatus[] = liveData?.sourceStatus ?? [];

  const actorMap = useMemo(
    () => new Map(MOCK_INTEL_ACTORS.map((item) => [item.id, item])),
    [],
  );
  const vulnerabilityLookupItems = useMemo(
    () => [...MOCK_INTEL_VULNERABILITIES, ...displayedVulnerabilities],
    [displayedVulnerabilities],
  );
  const vulnerabilityMap = useMemo(
    () => new Map(vulnerabilityLookupItems.map((item) => [item.id, item])),
    [vulnerabilityLookupItems],
  );
  const reportMap = useMemo(
    () => new Map(MOCK_INTEL_REPORTS.map((item) => [item.id, item])),
    [],
  );

  const filteredActors = useMemo(
    () =>
      MOCK_INTEL_ACTORS.filter((actor) =>
        includesQuery(deferredQuery, [
          actor.name,
          actor.origin,
          actor.description,
          ...actor.aliases,
          ...actor.targetIndustries,
          ...actor.ttp,
        ]),
      ),
    [deferredQuery],
  );

  const filteredVulnerabilities = useMemo(
    () =>
      displayedVulnerabilities.filter((item) =>
        includesQuery(deferredQuery, [
          item.cve,
          item.title,
          item.summary,
          ...item.affectedProducts,
        ]),
      ),
    [deferredQuery, displayedVulnerabilities],
  );

  const filteredIocs = useMemo(
    () =>
      MOCK_INTEL_IOCS.filter((item) =>
        includesQuery(deferredQuery, [
          item.value,
          item.type,
          item.context,
          item.source,
          ...item.tags,
        ]),
      ),
    [deferredQuery],
  );

  const filteredAlerts = useMemo(
    () =>
      displayedAlerts.filter((item) =>
        includesQuery(deferredQuery, [
          item.title,
          item.summary,
          ...item.industries,
        ]),
      ),
    [deferredQuery, displayedAlerts],
  );

  const filteredReports = useMemo(
    () =>
      MOCK_INTEL_REPORTS.filter((item) =>
        includesQuery(deferredQuery, [
          item.title,
          item.summary,
          item.type,
          item.period,
        ]),
      ),
    [deferredQuery],
  );

  const activeActor =
    filteredActors.find((item) => item.id === selectedActorId) ??
    filteredActors[0] ??
    MOCK_INTEL_ACTORS[0];

  const activeVulnerability =
    filteredVulnerabilities.find((item) => item.id === selectedVulnerabilityId) ??
    filteredVulnerabilities[0] ??
    displayedVulnerabilities[0];

  const activeIoc =
    filteredIocs.find((item) => item.id === selectedIocId) ??
    filteredIocs[0] ??
    MOCK_INTEL_IOCS[0];

  const searchResults = useMemo(() => {
    const actorHits =
      scope === "all" || scope === "actors"
        ? filteredActors.slice(0, 2).map((item) => ({
            id: item.id,
            title: item.name,
            meta: `威胁组织 · ${activityLabel[item.activityStatus]}`,
          }))
        : [];

    const vulnerabilityHits =
      scope === "all" || scope === "vulnerabilities"
        ? filteredVulnerabilities.slice(0, 2).map((item) => ({
            id: item.id,
            title: item.cve,
            meta: `漏洞专题 · ${item.title}`,
          }))
        : [];

    const iocHits =
      scope === "all" || scope === "iocs"
        ? filteredIocs.slice(0, 2).map((item) => ({
            id: item.id,
            title: item.value,
            meta: `IOC · ${item.type} · ${item.source}`,
          }))
        : [];

    const alertHits =
      scope === "all" || scope === "alerts"
        ? filteredAlerts.slice(0, 2).map((item) => ({
            id: item.id,
            title: item.title,
            meta: `行业预警 · ${item.industries.join(" / ")}`,
          }))
        : [];

    const reportHits =
      scope === "all" || scope === "reports"
        ? filteredReports.slice(0, 2).map((item) => ({
            id: item.id,
            title: item.title,
            meta: `报告 · ${item.type} · ${item.period}`,
          }))
        : [];

    return [
      ...actorHits,
      ...vulnerabilityHits,
      ...iocHits,
      ...alertHits,
      ...reportHits,
    ].slice(0, 6);
  }, [
    filteredActors,
    filteredAlerts,
    filteredIocs,
    filteredReports,
    filteredVulnerabilities,
    scope,
  ]);

  const addToWatchlist = (label: string) => {
    startTransition(() => {
      setWatchlist((prev) => (prev.includes(label) ? prev : [label, ...prev].slice(0, 6)));
      setFeedback(`已将 ${label} 加入重点关注列表。`);
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadLiveData() {
      try {
        const response = await fetch("/api/intelligence", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`live intelligence load failed: ${response.status}`);
        }

        const payload = (await response.json()) as LiveIntelligencePayload;
        startTransition(() => {
          setLiveData(payload);
          if (Array.isArray(payload.subscriptions) && payload.subscriptions.length > 0) {
            setSubscriptions(payload.subscriptions);
          }
          setLiveError("");
          setIsLoadingLive(false);
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        startTransition(() => {
          setIsLoadingLive(false);
          setLiveError(
            error instanceof Error
              ? error.message
              : "真实情报源加载失败，当前展示知识库回退内容。",
          );
        });
      }
    }

    loadLiveData();

    return () => controller.abort();
  }, []);

  async function addSubscription(label: string) {
    try {
      const response = await fetch("/api/intelligence/subscriptions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ topic: label }),
      });

      if (!response.ok) {
        throw new Error(`subscribe failed: ${response.status}`);
      }

      const payload = (await response.json()) as {
        items?: string[];
        storage?: "kv" | "memory";
      };

      startTransition(() => {
        if (Array.isArray(payload.items)) {
          setSubscriptions(payload.items);
        }
        setFeedback(
          `已订阅 ${label} 的后续更新。${
            payload.storage === "memory" ? "当前使用本地临时存储。" : "已写入持久化存储。"
          }`,
        );
      });
    } catch (error) {
      startTransition(() => {
        setFeedback(
          error instanceof Error
            ? `订阅失败：${error.message}`
            : "订阅失败，请稍后再试。",
        );
      });
    }
  }

  async function copyIoc(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      startTransition(() => {
        setFeedback(`已复制 IOC：${value}`);
      });
    } catch {
      startTransition(() => {
        setFeedback(`已选定 IOC：${value}，当前环境未授予剪贴板写入权限。`);
      });
    }
  }

  const selectedActorName = activeActor?.name ?? "";
  const selectedVulnerabilityName = activeVulnerability?.cve ?? "";
  const selectedIocValue = activeIoc?.value ?? "";

  return (
    <div className="min-h-screen mdr-shell">
      <NavBar active="MDR" />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <a
            href="/mdr"
            className="text-xs text-[#94a3b8] transition-colors hover:text-[#64748b]"
          >
            ← 返回 MDR 工单系统
          </a>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#64748b]">
                Intelligence Center
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#1a1a2e]">
                情报中心
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64748b]">
                外部威胁情报主导的知识库工作台，覆盖威胁组织库、漏洞专题、IOC
                情报库、行业预警、报告与订阅，帮助分析师从检索走到研判和下发。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/api/intelligence/export?format=markdown"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/10 px-3 py-1.5 text-xs font-medium text-[#2563eb] transition-all hover:bg-[#2563eb]/15"
              >
                导出 Markdown
              </a>
              <a
                href="/api/intelligence/export?format=json"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-black/[0.08] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#475569] transition-all hover:bg-white"
              >
                导出 JSON
              </a>
              <a
                href="/mdr"
                className="rounded-lg border border-black/[0.08] bg-white/70 px-3 py-1.5 text-xs font-medium text-[#475569] transition-all hover:bg-white"
              >
                跳转 MDR 处置
              </a>
            </div>
          </div>
        </div>

        {feedback ? (
          <div className="glass mb-6 flex items-center justify-between rounded-xl px-4 py-3">
            <div className="text-sm text-[#1a1a2e]">{feedback}</div>
            <button
              onClick={() => setFeedback("")}
              className="text-xs text-[#64748b] transition-colors hover:text-[#1a1a2e]"
            >
              关闭
            </button>
          </div>
        ) : null}

        <div className="glass mb-6 rounded-2xl p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
                Live Sources
              </div>
              <div className="mt-1 text-lg font-semibold text-[#1a1a2e]">
                真实情报源
              </div>
              <div className="mt-2 text-sm text-[#64748b]">
                CISA KEV / NVD / FIRST EPSS / CISA Advisories
                {liveData ? ` · 最近同步 ${formatTime(liveData.updatedAt)}` : ""}
              </div>
              {liveError ? (
                <div className="mt-2 text-xs text-orange-500">{liveError}</div>
              ) : null}
            </div>
            <div className="text-xs text-[#64748b]">
              {isLoadingLive ? "正在同步实时漏洞与官方预警..." : "已进入混合情报模式"}
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {sourceStatus.length > 0 ? (
              sourceStatus.map((item) => (
                <div
                  key={item.source}
                  className="rounded-xl border border-black/[0.06] bg-white/70 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#1a1a2e]">
                      {item.source}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        item.ok ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-500"
                      }`}
                    >
                      {item.ok ? "在线" : "回退中"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[#64748b]">{item.detail}</div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.24em] text-[#94a3b8]">
                    count {item.count}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-black/[0.08] px-4 py-4 text-sm text-[#94a3b8]">
                正在准备实时源状态。
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          {[
            {
              label: "今日新增情报",
              value: displayedSummary.newItemsToday,
              icon: "🛰️",
              accent: "text-[#2563eb]",
            },
            {
              label: "活跃组织",
              value: displayedSummary.activeActors,
              icon: "🎯",
              accent: "text-red-500",
            },
            {
              label: "高危漏洞专题",
              value: displayedSummary.criticalVulnerabilities,
              icon: "🧨",
              accent: "text-orange-500",
            },
            {
              label: "新增 IOC",
              value: displayedSummary.newIocs,
              icon: "🔍",
              accent: "text-cyan-500",
            },
            {
              label: "行业预警",
              value: displayedSummary.industryAlerts,
              icon: "🏭",
              accent: "text-amber-500",
            },
            {
              label: "本周报告",
              value: displayedSummary.weeklyReports,
              icon: "📚",
              accent: "text-violet-500",
            },
          ].map((item) => (
            <div key={item.label} className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xl">{item.icon}</span>
                <span className={`text-2xl font-bold ${item.accent}`}>{item.value}</span>
              </div>
              <div className="mt-2 text-xs text-[#94a3b8]">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.3fr_0.85fr]">
          <section className="glass rounded-2xl p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
                  Global Search
                </div>
                <div className="mt-1 text-lg font-semibold text-[#1a1a2e]">
                  跨对象检索
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "全部", value: "all" },
                  { label: "组织", value: "actors" },
                  { label: "漏洞", value: "vulnerabilities" },
                  { label: "IOC", value: "iocs" },
                  { label: "预警", value: "alerts" },
                  { label: "报告", value: "reports" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setScope(item.value as SearchScope)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
                      scope === item.value
                        ? "border-[#2563eb]/20 bg-[#2563eb]/10 text-[#2563eb]"
                        : "border-black/[0.08] bg-black/[0.03] text-[#64748b] hover:bg-black/[0.05]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索组织、CVE、IOC、行业、报告"
              className="mt-4 w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-[#1a1a2e] outline-none transition-all placeholder:text-[#94a3b8] focus:border-[#2563eb]/30 focus:ring-4 focus:ring-[#2563eb]/8"
            />
            <div className="mt-4 space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-black/[0.06] bg-white/70 px-4 py-3"
                  >
                    <div className="text-sm font-medium text-[#1a1a2e]">{item.title}</div>
                    <div className="mt-1 text-xs text-[#64748b]">{item.meta}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-black/[0.08] px-4 py-6 text-sm text-[#94a3b8]">
                  当前检索条件下没有命中对象。
                </div>
              )}
            </div>
          </section>

          <section className="glass rounded-2xl p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
              Watchlist
            </div>
            <div className="mt-1 text-lg font-semibold text-[#1a1a2e]">
              最近关注与订阅
            </div>

            <div className="mt-4">
              <div className="text-[11px] font-medium text-[#64748b]">重点关注</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {watchlist.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-[#0f172a]/6 px-3 py-1 text-[11px] text-[#475569]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[11px] font-medium text-[#64748b]">最近查看</div>
              <div className="mt-2 space-y-2">
                {MOCK_INTEL_RECENT_VIEWS.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-black/[0.06] bg-white/65 px-3 py-2 text-xs text-[#475569]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[11px] font-medium text-[#64748b]">订阅主题</div>
              <div className="mt-2 space-y-2">
                {subscriptions.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-white/65 px-3 py-2"
                  >
                    <span className="text-xs text-[#475569]">{item}</span>
                    <span className="text-[10px] text-[#2563eb]">已订阅</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="mb-6 grid gap-3 lg:grid-cols-5">
          <DomainCard
            title="威胁组织库"
            icon="🎯"
            description="面向 APT、勒索团伙和黑产组织的画像库与跟踪入口。"
            href="#actors"
          />
          <DomainCard
            title="漏洞专题"
            icon="🧨"
            description="把高危 CVE 从编号升级成情报专题，强调利用态势与检测建议。"
            href="#vulnerabilities"
          />
          <DomainCard
            title="IOC 情报库"
            icon="🔍"
            description="围绕 IOC 的可信度、上下文、来源和关系链进行检索。"
            href="#iocs"
          />
          <DomainCard
            title="行业预警"
            icon="🏭"
            description="针对金融、制造、能源、医疗等行业的风险提醒与厂商观点。"
            href="#alerts"
          />
          <DomainCard
            title="报告与订阅"
            icon="📚"
            description="沉淀周报、专题简报和厂商分析结论，并支持订阅跟踪。"
            href="#reports"
          />
        </div>

        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
                Featured
              </div>
              <h2 className="mt-1 text-lg font-semibold text-[#1a1a2e]">
                重点情报专题
              </h2>
            </div>
            <span className="text-xs text-[#64748b]">
              优先引导分析师关注当前最值得研判的对象
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {displayedFeaturedTopics.map((topic) => (
              <article key={topic.id} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${severityBadge[topic.severity]}`}
                  >
                    {topicTypeLabel[topic.type]} · {timeAgo(topic.updatedAt)}
                  </span>
                  <button
                    onClick={() => addToWatchlist(topic.title)}
                    className="text-[11px] font-medium text-[#2563eb]"
                  >
                    加入关注
                  </button>
                </div>
                <div className="mt-3 text-lg font-semibold leading-7 text-[#1a1a2e]">
                  {topic.title}
                </div>
                <div className="mt-2 text-sm text-[#64748b]">{topic.subtitle}</div>
                <p className="mt-3 text-sm leading-6 text-[#475569]">{topic.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {topic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] text-[#64748b]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 space-y-1.5">
                  {topic.focus.map((item) => (
                    <div key={item} className="text-xs text-[#475569]">
                      ▸ {item}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="actors" className="mb-8">
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
              Library
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#1a1a2e]">威胁组织库</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.45fr]">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 text-xs text-[#64748b]">
                {filteredActors.length} 个组织命中当前检索
              </div>
              <div className="space-y-2">
                {filteredActors.map((actor) => (
                  <button
                    key={actor.id}
                    onClick={() =>
                      startTransition(() => setSelectedActorId(actor.id))
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                      selectedActorName === actor.name
                        ? "border-[#2563eb]/20 bg-[#2563eb]/8"
                        : "border-black/[0.06] bg-white/65 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-[#1a1a2e]">{actor.name}</div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${activityBadge[actor.activityStatus]}`}
                      >
                        {activityLabel[actor.activityStatus]}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-[#64748b]">
                      {actor.targetIndustries.join(" / ")}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {activeActor ? (
              <div className="glass rounded-2xl p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold text-[#1a1a2e]">{activeActor.name}</h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${severityBadge[activeActor.riskRating]}`}
                      >
                        风险评级
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-[#64748b]">
                      别名：{activeActor.aliases.join(" / ")} · 起源：{activeActor.origin} · 最近活动：
                      {timeAgo(activeActor.lastActivity)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToWatchlist(activeActor.name)}
                      className="rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/10 px-3 py-1.5 text-xs font-medium text-[#2563eb]"
                    >
                      重点关注
                    </button>
                    <a
                      href="/api/intelligence/export?format=markdown"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-[#475569]"
                    >
                      导出专题
                    </a>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#475569]">
                  {activeActor.description}
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4">
                    <div className="text-[11px] font-medium text-[#64748b]">目标行业与区域</div>
                    <div className="mt-2 text-sm text-[#1a1a2e]">
                      行业：{activeActor.targetIndustries.join(" / ")}
                    </div>
                    <div className="mt-1 text-sm text-[#1a1a2e]">
                      区域：{activeActor.targetRegions.join(" / ")}
                    </div>
                    <div className="mt-3 text-[11px] font-medium text-[#64748b]">典型目标</div>
                    <div className="mt-2 space-y-1.5">
                      {activeActor.objectives.map((item) => (
                        <div key={item} className="text-xs text-[#475569]">
                          ▸ {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4">
                    <div className="text-[11px] font-medium text-[#64748b]">TTP 与工具链</div>
                    <div className="mt-2 space-y-1.5">
                      {activeActor.ttp.map((item) => (
                        <div key={item} className="text-xs text-[#475569]">
                          ▸ {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeActor.toolset.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] text-[#64748b]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white/70 p-4">
                  <div className="text-[11px] font-medium text-[#64748b]">厂商研判</div>
                  <p className="mt-2 text-sm leading-6 text-[#475569]">
                    {activeActor.vendorAssessment}
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <div>
                      <div className="text-[11px] font-medium text-[#64748b]">近期活动</div>
                      <div className="mt-2 space-y-1.5">
                        {activeActor.recentCampaigns.map((item) => (
                          <div key={item} className="text-xs text-[#475569]">
                            ▸ {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-[#64748b]">关联漏洞</div>
                      <div className="mt-2 space-y-1.5">
                        {activeActor.relatedVulnerabilityIds.map((id) => (
                          <div key={id} className="text-xs text-[#475569]">
                            {vulnerabilityMap.get(id)?.cve}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-[#64748b]">关联报告</div>
                      <div className="mt-2 space-y-1.5">
                        {activeActor.relatedReportIds.map((id) => (
                          <div key={id} className="text-xs text-[#475569]">
                            {reportMap.get(id)?.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section id="vulnerabilities" className="mb-8">
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
              Topics
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#1a1a2e]">漏洞专题</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.45fr]">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 text-xs text-[#64748b]">
                {filteredVulnerabilities.length} 个漏洞专题命中当前检索
              </div>
              <div className="space-y-2">
                {filteredVulnerabilities.map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      startTransition(() => setSelectedVulnerabilityId(item.id))
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                      selectedVulnerabilityName === item.cve
                        ? "border-[#2563eb]/20 bg-[#2563eb]/8"
                        : "border-black/[0.06] bg-white/65 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-[#1a1a2e]">{item.cve}</div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${severityBadge[item.severity]}`}
                      >
                        CVSS {item.cvss}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-[#64748b]">{item.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {activeVulnerability ? (
              <div className="glass rounded-2xl p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold text-[#1a1a2e]">
                        {activeVulnerability.cve}
                      </h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${severityBadge[activeVulnerability.severity]}`}
                      >
                        {activeVulnerability.inTheWild ? "在野利用" : "高危跟踪"}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-[#64748b]">
                      {activeVulnerability.title}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToWatchlist(activeVulnerability.cve)}
                      className="rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/10 px-3 py-1.5 text-xs font-medium text-[#2563eb]"
                    >
                      关注漏洞
                    </button>
                    <a
                      href={`/api/intelligence/export?format=markdown&cve=${encodeURIComponent(
                        activeVulnerability.cve,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-[#475569]"
                    >
                      导出专题
                    </a>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#475569]">
                  {activeVulnerability.summary}
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4">
                    <div className="text-[11px] font-medium text-[#64748b]">影响面与利用态势</div>
                    <div className="mt-2 text-xs text-[#475569]">
                      受影响产品：{activeVulnerability.affectedProducts.join(" / ")}
                    </div>
                    <div className="mt-2 text-xs text-[#475569]">
                      利用成熟度：{activeVulnerability.exploitMaturity}
                    </div>
                    <div className="mt-2 text-xs text-[#475569]">
                      状态：{activeVulnerability.inTheWild ? "已有在野利用" : "处于高风险跟踪"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4">
                    <div className="text-[11px] font-medium text-[#64748b]">检测建议</div>
                    <div className="mt-2 space-y-1.5">
                      {activeVulnerability.detection.map((item) => (
                        <div key={item} className="text-xs text-[#475569]">
                          ▸ {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white/70 p-4">
                  <div className="text-[11px] font-medium text-[#64748b]">缓解建议与关联对象</div>
                  <div className="mt-2 grid gap-4 md:grid-cols-3">
                    <div className="space-y-1.5">
                      {activeVulnerability.mitigation.map((item) => (
                        <div key={item} className="text-xs text-[#475569]">
                          ▸ {item}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      {activeVulnerability.linkedActorIds.map((id) => (
                        <div key={id} className="text-xs text-[#475569]">
                          {actorMap.get(id)?.name}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      {activeVulnerability.linkedReportIds.map((id) => (
                        <div key={id} className="text-xs text-[#475569]">
                          {reportMap.get(id)?.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section id="iocs" className="mb-8">
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
              Intelligence
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#1a1a2e]">IOC 情报库</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.05fr_1.15fr]">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-[#64748b]">
                  {filteredIocs.length} 个 IOC 命中当前检索
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#94a3b8]">
                  IOC Feed
                </span>
              </div>
              <div className="space-y-2">
                {filteredIocs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      startTransition(() => setSelectedIocId(item.id))
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                      selectedIocValue === item.value
                        ? "border-[#2563eb]/20 bg-[#2563eb]/8"
                        : "border-black/[0.06] bg-white/65 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-medium text-[#1a1a2e]">
                        {item.value}
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${severityBadge[item.severity]}`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-[#64748b]">
                      可信度 {item.confidence} · {item.source}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {activeIoc ? (
              <div className="glass rounded-2xl p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-[#1a1a2e]">
                        {activeIoc.value}
                      </h3>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${severityBadge[activeIoc.severity]}`}
                      >
                        {activeIoc.type}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-[#64748b]">
                      来源：{activeIoc.source} · 首次发现：{formatTime(activeIoc.firstSeen)} · 最近发现：
                      {formatTime(activeIoc.lastSeen)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyIoc(activeIoc.value)}
                      className="rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/10 px-3 py-1.5 text-xs font-medium text-[#2563eb]"
                    >
                      复制 IOC
                    </button>
                    <button
                      onClick={() => addToWatchlist(activeIoc.value)}
                      className="rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-[#475569]"
                    >
                      加入观察
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white/70 p-4">
                  <div className="text-[11px] font-medium text-[#64748b]">上下文说明</div>
                  <p className="mt-2 text-sm leading-6 text-[#475569]">{activeIoc.context}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeIoc.tags.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] text-[#64748b]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4">
                    <div className="text-[11px] font-medium text-[#64748b]">关联组织</div>
                    <div className="mt-2 space-y-1.5">
                      {activeIoc.linkedActorIds.map((id) => (
                        <div key={id} className="text-xs text-[#475569]">
                          {actorMap.get(id)?.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4">
                    <div className="text-[11px] font-medium text-[#64748b]">关联漏洞</div>
                    <div className="mt-2 space-y-1.5">
                      {activeIoc.linkedVulnerabilityIds.map((id) => (
                        <div key={id} className="text-xs text-[#475569]">
                          {vulnerabilityMap.get(id)?.cve}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section id="alerts" className="mb-8">
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
              Alerts
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#1a1a2e]">行业预警</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {filteredAlerts.map((item) => (
              <article key={item.id} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${severityBadge[item.severity]}`}
                  >
                    {item.urgency}优先
                  </span>
                  <button
                    onClick={() => addSubscription(item.title)}
                    className="text-[11px] font-medium text-[#2563eb]"
                  >
                    订阅更新
                  </button>
                </div>
                <div className="mt-3 text-lg font-semibold leading-7 text-[#1a1a2e]">
                  {item.title}
                </div>
                <div className="mt-2 text-xs text-[#64748b]">
                  影响行业：{item.industries.join(" / ")}
                </div>
                <p className="mt-3 text-sm leading-6 text-[#475569]">{item.summary}</p>
                <div className="mt-4 space-y-1.5">
                  {item.recommendation.map((line) => (
                    <div key={line} className="text-xs text-[#475569]">
                      ▸ {line}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="reports" className="pb-8">
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
              Reports
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#1a1a2e]">报告与订阅</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {filteredReports.map((item) => (
                <article key={item.id} className="glass rounded-2xl p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#94a3b8]">
                        {item.type} · {item.period}
                      </div>
                      <div className="mt-2 text-lg font-semibold text-[#1a1a2e]">
                        {item.title}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#475569]">{item.summary}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addSubscription(item.title)}
                        className="rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/10 px-3 py-1.5 text-xs font-medium text-[#2563eb]"
                      >
                        订阅
                      </button>
                      <a
                        href="/api/intelligence/export?format=markdown"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-[#475569]"
                      >
                        导出
                      </a>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {item.keyFindings.map((finding) => (
                      <div
                        key={finding}
                        className="rounded-xl border border-black/[0.06] bg-white/70 px-4 py-3 text-sm text-[#475569]"
                      >
                        {finding}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
                Subscription
              </div>
              <div className="mt-1 text-lg font-semibold text-[#1a1a2e]">
                当前订阅策略
              </div>
              <div className="mt-4 space-y-3">
                {subscriptions.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-black/[0.06] bg-white/70 px-4 py-3"
                  >
                    <div className="text-sm font-medium text-[#1a1a2e]">{item}</div>
                    <div className="mt-1 text-xs text-[#64748b]">
                      按周同步更新，适合作为情报运营和客户通报的固定产出。
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-black/[0.06] bg-white/70 p-4">
                <div className="text-[11px] font-medium text-[#64748b]">知识库页首版边界</div>
                <div className="mt-2 space-y-1.5 text-xs text-[#475569]">
                  <div>▸ 真实漏洞源与官方预警已接入页面主视图</div>
                  <div>▸ 订阅能力走 /api/intelligence/subscriptions</div>
                  <div>▸ 导出能力走 /api/intelligence/export</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
