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
  MOCK_INTEL_IOCS,
  MOCK_INTEL_SUBSCRIPTIONS,
  MOCK_INTEL_VULNERABILITIES,
  MOCK_INTEL_WATCHLIST,
  type IntelSeverity,
} from "@/lib/intelligence-mock";
import type { IntelligenceListEntry } from "@/lib/intelligence-ops";
import type { LiveIntelligencePayload } from "@/lib/intelligence-sources";
import styles from "./intelligence-center.module.css";
import {
  buildHuntCards,
  buildPlaybookCards,
  buildTimelineTopics,
  formatClock,
  formatTimeAgo,
  includesQuery,
  selectDisplayData,
  type SearchScope,
} from "./view-model";

type Config = {
  liveSnapshotEndpoint: string;
  exportJsonHref: string;
  exportMarkdownHref: string;
  subscriptionsEndpoint: string;
  exportRuleEndpoint: string;
  listsEndpoint: string;
  liveSourcesTitle: string;
  mitreLabel: string;
  threatFoxLabel: string;
  threatFoxKeyLabel: string;
  relevanceLabel: string;
  graphTitle: string;
  threatListLabel: string;
  safeListLabel: string;
  commandBridgeLabel: string;
  graphTheaterLabel: string;
  executionDeckLabel: string;
  huntDeckTitle: string;
  playbookDeckTitle: string;
  exportJsonLabel: string;
};

const severityTone: Record<IntelSeverity, string> = {
  critical: styles.critical,
  high: styles.high,
  medium: styles.medium,
};

const SEARCH_SCOPES: Array<{ id: SearchScope; label: string }> = [
  { id: "all", label: "全部" },
  { id: "campaigns", label: "活动" },
  { id: "vulnerabilities", label: "漏洞" },
  { id: "iocs", label: "IOC" },
  { id: "reports", label: "报告" },
];

const GRAPH_THEATER_TITLE = "实体关联图谱";
const HUNT_DECK_TITLE = "狩猎与研判工作台";
const PLAYBOOK_DECK_TITLE = "自动化响应剧本";

function StatusPill({
  label,
  tone = styles.info,
}: {
  label: string;
  tone?: string;
}) {
  return <span className={`${styles.statusPill} ${tone}`}>{label}</span>;
}

export default function IntelligenceCommandCenter({ config }: { config: Config }) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [liveData, setLiveData] = useState<LiveIntelligencePayload | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [liveError, setLiveError] = useState("");
  const [subscriptions, setSubscriptions] = useState(MOCK_INTEL_SUBSCRIPTIONS);
  const [threatList, setThreatList] = useState<IntelligenceListEntry[]>([]);
  const [safelist, setSafelist] = useState<IntelligenceListEntry[]>([]);
  const [watchlist, setWatchlist] = useState(MOCK_INTEL_WATCHLIST);
  const [feedback, setFeedback] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    const controller = new AbortController();

    async function loadLiveData() {
      try {
        const response = await fetch(config.liveSnapshotEndpoint, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`live intelligence load failed: ${response.status}`);
        }

        const payload = (await response.json()) as LiveIntelligencePayload;
        startTransition(() => {
          setLiveData(payload);
          setSubscriptions(
            payload.subscriptions?.length ? payload.subscriptions : MOCK_INTEL_SUBSCRIPTIONS,
          );
          setThreatList(payload.threatList ?? []);
          setSafelist(payload.safelist ?? []);
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
              : "真实情报源加载失败，当前展示回退内容。",
          );
        });
      }
    }

    loadLiveData();
    return () => controller.abort();
  }, [config.liveSnapshotEndpoint]);

  const display = useMemo(
    () => selectDisplayData(liveData, threatList, safelist, subscriptions),
    [liveData, safelist, subscriptions, threatList],
  );

  const filteredTopics = useMemo(
    () =>
      display.featuredTopics.filter((topic) =>
        includesQuery(deferredQuery, [
          topic.title,
          topic.subtitle,
          topic.summary,
          ...topic.tags,
        ]),
      ),
    [deferredQuery, display.featuredTopics],
  );

  const filteredVulnerabilities = useMemo(
    () =>
      display.vulnerabilities.filter((item) =>
        includesQuery(deferredQuery, [
          item.cve,
          item.title,
          item.summary,
          ...item.affectedProducts,
        ]),
      ),
    [deferredQuery, display.vulnerabilities],
  );

  const filteredIocs = useMemo(
    () =>
      display.iocs.filter((item) =>
        includesQuery(deferredQuery, [
          item.value,
          item.context,
          item.source,
          ...item.tags,
        ]),
      ),
    [deferredQuery, display.iocs],
  );

  const filteredReports = useMemo(
    () =>
      display.reports.filter((item) =>
        includesQuery(deferredQuery, [item.title, item.summary, item.type, item.period]),
      ),
    [deferredQuery, display.reports],
  );

  const timeline = useMemo(
    () => buildTimelineTopics(filteredTopics, display.actors, filteredVulnerabilities),
    [display.actors, filteredTopics, filteredVulnerabilities],
  );

  const focusTopic = timeline[0] ?? buildTimelineTopics(display.featuredTopics, display.actors, display.vulnerabilities)[0];
  const focusVulnerability = filteredVulnerabilities[0] ?? display.vulnerabilities[0] ?? MOCK_INTEL_VULNERABILITIES[0];
  const focusIoc = filteredIocs[0] ?? display.iocs[0] ?? MOCK_INTEL_IOCS[0];
  const focusActor = display.actors[0] ?? MOCK_INTEL_ACTORS[0];

  const huntCards = useMemo(
    () => buildHuntCards(focusVulnerability, focusIoc, focusActor),
    [focusActor, focusIoc, focusVulnerability],
  );

  const playbookCards = useMemo(
    () => buildPlaybookCards(display.alerts, display.subscriptions, display.threatList, display.safelist),
    [display.alerts, display.safelist, display.subscriptions, display.threatList],
  );

  async function addSubscription(topic: string) {
    try {
      const response = await fetch(config.subscriptionsEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      if (!response.ok) {
        throw new Error(`subscribe failed: ${response.status}`);
      }
      const payload = (await response.json()) as { items?: string[] };
      startTransition(() => {
        if (Array.isArray(payload.items)) {
          setSubscriptions(payload.items);
        }
        setFeedback(`已订阅 ${topic} 的后续更新。`);
      });
    } catch (error) {
      startTransition(() => {
        setFeedback(
          error instanceof Error ? `订阅失败：${error.message}` : "订阅失败，请稍后再试。",
        );
      });
    }
  }

  async function updateOperationalList(
    list: "threat" | "safelist",
    entry: IntelligenceListEntry,
  ) {
    try {
      const response = await fetch(config.listsEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ list, entry }),
      });
      if (!response.ok) {
        throw new Error(`list update failed: ${response.status}`);
      }
      const payload = (await response.json()) as {
        threatList?: IntelligenceListEntry[];
        safelist?: IntelligenceListEntry[];
      };
      startTransition(() => {
        setThreatList(payload.threatList ?? []);
        setSafelist(payload.safelist ?? []);
        setFeedback(`已更新 ${list === "threat" ? config.threatListLabel : config.safeListLabel}。`);
      });
    } catch (error) {
      startTransition(() => {
        setFeedback(
          error instanceof Error ? `列表更新失败：${error.message}` : "列表更新失败。",
        );
      });
    }
  }

  async function copyIoc(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      startTransition(() => setFeedback(`已复制 IOC：${value}`));
    } catch {
      startTransition(() =>
        setFeedback(`已选定 IOC：${value}，当前环境未授予剪贴板权限。`),
      );
    }
  }

  const searchHits = useMemo(() => {
    const hits: Array<{ title: string; meta: string }> = [];
    if (scope === "all" || scope === "campaigns") {
      timeline.slice(0, 2).forEach((item) =>
        hits.push({ title: item.title, meta: `活动 · ${formatTimeAgo(item.updatedAt)}` }),
      );
    }
    if (scope === "all" || scope === "vulnerabilities") {
      filteredVulnerabilities.slice(0, 2).forEach((item) =>
        hits.push({ title: item.cve, meta: `漏洞 · ${item.title}` }),
      );
    }
    if (scope === "all" || scope === "iocs") {
      filteredIocs.slice(0, 2).forEach((item) =>
        hits.push({ title: item.value, meta: `IOC · ${item.type}` }),
      );
    }
    if (scope === "all" || scope === "reports") {
      filteredReports.slice(0, 2).forEach((item) =>
        hits.push({ title: item.title, meta: `报告 · ${item.type}` }),
      );
    }
    return hits.slice(0, 6);
  }, [filteredIocs, filteredReports, filteredVulnerabilities, scope, timeline]);

  const summaryStats = [
    { label: "今日新增", value: String(display.summary.newItemsToday), tone: styles.info },
    { label: "活跃组织", value: String(display.summary.activeActors), tone: styles.critical },
    { label: "高危漏洞", value: String(display.summary.criticalVulnerabilities), tone: styles.warning },
    { label: "新增 IOC", value: String(display.summary.newIocs), tone: styles.good },
  ];

  return (
    <div className={styles.commandShell}>
      <NavBar active="情报中心" />

      <main className={styles.page}>
        <section className={styles.intelRibbon}>
          <div className={styles.ribbonIntro}>
            <div className={styles.eyebrow}>{config.commandBridgeLabel}</div>
            <h1>情报中心</h1>
            <p>
              把原本分散的研究、漏洞、IOC、行业预警与运营动作整合为一张真正可操作的威胁情报指挥台。
            </p>
          </div>
          <div className={styles.ribbonActions}>
            <a href={config.exportJsonHref} target="_blank" rel="noreferrer" className={styles.primaryAction}>
              {config.exportJsonLabel}
            </a>
            <a href={config.exportMarkdownHref} target="_blank" rel="noreferrer" className={styles.secondaryAction}>
              导出 Markdown
            </a>
            <a href={config.exportRuleEndpoint} target="_blank" rel="noreferrer" className={styles.secondaryAction}>
              导出规则模板
            </a>
          </div>
          <div className={styles.ribbonStats}>
            {summaryStats.map((item) => (
              <div key={item.label} className={styles.statTile}>
                <span>{item.label}</span>
                <strong className={item.tone}>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.commandBridge} data-layout="Command Bridge">
          <div className={styles.commandBrief}>
            <div className={styles.eyebrow}>Command Bridge</div>
            <h2>{focusTopic?.title ?? "把重点情报拉回日常运营视角"}</h2>
            <p>{focusTopic?.summary ?? "当前暂无重点情报，建议检查源数据状态。"}</p>
            <div className={styles.tagRow}>
              {(focusTopic?.tags ?? []).slice(0, 4).map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
            <div className={styles.searchPanel}>
              <div className={styles.searchHeader}>
                <strong>统一检索入口</strong>
                <span>{isLoadingLive ? "同步中" : liveError ? "回退模式" : "真实情报源"}</span>
              </div>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索活动、漏洞、IOC、报告"
                className={styles.searchInput}
              />
              <div className={styles.scopeRow}>
                {SEARCH_SCOPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={scope === item.id ? styles.scopeActive : styles.scopeButton}
                    onClick={() => setScope(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className={styles.hitList}>
                {searchHits.map((hit) => (
                  <div key={`${hit.title}-${hit.meta}`} className={styles.hitItem}>
                    <strong>{hit.title}</strong>
                    <span>{hit.meta}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.campaignColumn}>
            <div className={styles.sectionHeading}>
              <div>
                <div className={styles.eyebrow}>重点攻击活动</div>
                <h3>把重点活动放到第一屏中央</h3>
              </div>
              <StatusPill label={focusTopic ? formatClock(focusTopic.updatedAt) : "待更新"} />
            </div>
            <div className={styles.timeline}>
              {timeline.map((topic) => (
                <article key={topic.id} className={styles.timelineCard}>
                  <div className={styles.timelineMeta}>
                    <StatusPill label={topic.type} tone={severityTone[topic.severity]} />
                    <span>{formatTimeAgo(topic.updatedAt)}</span>
                  </div>
                  <h4>{topic.title}</h4>
                  <p>{topic.subtitle}</p>
                  <div className={styles.cardList}>
                    {topic.actorNames.map((name) => (
                      <span key={name} className={styles.inlinePill}>{name}</span>
                    ))}
                    {topic.vulnerabilityNames.map((name) => (
                      <span key={name} className={styles.inlinePill}>{name}</span>
                    ))}
                  </div>
                  <div className={styles.cardActions}>
                    <button type="button" onClick={() => addSubscription(topic.title)} className={styles.smallAction}>
                      订阅更新
                    </button>
                    <button type="button" onClick={() => setWatchlist((prev) => [topic.title, ...prev.filter((item) => item !== topic.title)].slice(0, 6))} className={styles.smallGhost}>
                      加入观察
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.operationsColumn}>
            <div className={styles.sectionHeading}>
              <div>
                <div className={styles.eyebrow}>资产暴露与漏洞优先级</div>
                <h3>风险优先级直接对接动作</h3>
              </div>
              <StatusPill label={`${display.vulnerabilities.length} 条候选`} tone={styles.warning} />
            </div>
            <div className={styles.riskGrid}>
              {filteredVulnerabilities.slice(0, 3).map((item) => (
                <article key={item.id} className={styles.riskCard}>
                  <div className={styles.timelineMeta}>
                    <StatusPill label={item.cve} tone={severityTone[item.severity]} />
                    <span>{item.inTheWild ? "在野利用" : "待验证"}</span>
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.exploitMaturity}</p>
                  <div className={styles.cardList}>
                    {item.affectedProducts.slice(0, 3).map((product) => (
                      <span key={product} className={styles.inlinePill}>{product}</span>
                    ))}
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.smallAction}
                      onClick={() =>
                        updateOperationalList("threat", {
                          id: item.id,
                          label: item.cve,
                          kind: "vulnerability",
                          severity: item.severity,
                          source: "live-vuln",
                          updatedAt: new Date().toISOString(),
                        })
                      }
                    >
                      加入 {config.threatListLabel}
                    </button>
                    <button type="button" className={styles.smallGhost}>
                      查看缓解建议
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.matrixCard}>
              <div className={styles.eyebrow}>Action Matrix</div>
              <h4>处置建议矩阵</h4>
              <div className={styles.matrixList}>
                <div className={styles.matrixRow}>
                  <StatusPill label="Now" tone={styles.critical} />
                  <p>优先围绕 {focusVulnerability?.cve ?? "重点漏洞"} 检查外部暴露面与补丁窗口。</p>
                </div>
                <div className={styles.matrixRow}>
                  <StatusPill label="Next" tone={styles.warning} />
                  <p>围绕 {focusActor?.name ?? "重点组织"} 的 TTP 补做告警审查和狩猎。</p>
                </div>
                <div className={styles.matrixRow}>
                  <StatusPill label="Watch" tone={styles.info} />
                  <p>将 {focusIoc?.value ?? "关键 IOC"} 和行业预警挂入持续观察。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.graphTheater} data-layout="Graph Theater">
          <div className={styles.sectionTopline}>
            <div>
              <div className={styles.eyebrow}>{config.graphTheaterLabel}</div>
              <h2>{config.graphTitle || GRAPH_THEATER_TITLE}</h2>
              <p>把 live graph、客户相关性、MITRE ATT&CK 和 ThreatFox 上下文收敛到同一屏。</p>
            </div>
            <div className={styles.liveBadge}>
              <StatusPill label={config.liveSourcesTitle} tone={liveError ? styles.warning : styles.good} />
            </div>
          </div>

          <div className={styles.theaterGrid}>
            <aside className={styles.theaterSide}>
              <article className={styles.sideCard}>
                <div className={styles.eyebrow}>{config.relevanceLabel}</div>
                <h4>客户相关性</h4>
                <div className={styles.relevanceList}>
                  {[display.relevance?.topActor, display.relevance?.topVulnerability, display.relevance?.topIoc]
                    .filter(Boolean)
                    .map((item) => (
                      <div key={item!.id} className={styles.relevanceItem}>
                        <strong>{item!.label}</strong>
                        <span>{item!.reasons.join(" / ")}</span>
                      </div>
                    ))}
                </div>
              </article>

              <article className={styles.sideCard}>
                <div className={styles.eyebrow}>{config.liveSourcesTitle}</div>
                <h4>真实情报源</h4>
                <div className={styles.sourceList}>
                  {display.sourceStatus.slice(0, 4).map((item) => (
                    <div key={item.source} className={styles.sourceItem}>
                      <strong>{item.source}</strong>
                      <span>{item.detail}</span>
                    </div>
                  ))}
                </div>
              </article>
            </aside>

            <div className={styles.graphStage}>
              <div className={styles.graphLegend}>
                <span>{config.mitreLabel}</span>
                <span>{config.threatFoxLabel}</span>
                <span>{config.threatFoxKeyLabel}</span>
              </div>
              <div className={styles.graphCenter}>
                <div className={styles.graphFocus}>
                  <span className={styles.graphKind}>Focus</span>
                  <strong>{display.graph?.focus?.label ?? focusVulnerability?.cve ?? "No focus"}</strong>
                  <small>{display.graph?.title ?? "实体关系图谱"}</small>
                </div>
                <div className={styles.graphOrbit}>
                  {(display.graph?.nodes ?? []).slice(0, 8).map((node) => (
                    <div key={node.id} className={styles.graphNode}>
                      <span>{node.kind}</span>
                      <strong>{node.label}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className={styles.theaterSide}>
              <article className={styles.sideCard}>
                <div className={styles.eyebrow}>{config.threatListLabel}</div>
                <h4>Threat List</h4>
                <div className={styles.inlineList}>
                  {display.threatList.length === 0 ? (
                    <span className={styles.emptyNote}>暂无条目</span>
                  ) : (
                    display.threatList.map((entry) => (
                      <span key={entry.id} className={styles.inlinePill}>
                        {entry.label}
                      </span>
                    ))
                  )}
                </div>
              </article>
              <article className={styles.sideCard}>
                <div className={styles.eyebrow}>{config.safeListLabel}</div>
                <h4>Safelist</h4>
                <div className={styles.inlineList}>
                  {display.safelist.length === 0 ? (
                    <span className={styles.emptyNote}>暂无条目</span>
                  ) : (
                    display.safelist.map((entry) => (
                      <span key={entry.id} className={styles.inlinePill}>
                        {entry.label}
                      </span>
                    ))
                  )}
                </div>
              </article>
              <article className={styles.sideCard}>
                <div className={styles.eyebrow}>IOC</div>
                <h4>ThreatFox / IOC Pivot</h4>
                <div className={styles.sourceList}>
                  {display.iocs.slice(0, 3).map((item) => (
                    <div key={item.id} className={styles.sourceItem}>
                      <strong>{item.value}</strong>
                      <span>{item.context}</span>
                      <div className={styles.cardActions}>
                        <button type="button" className={styles.smallAction} onClick={() => copyIoc(item.value)}>
                          复制 IOC
                        </button>
                        <button
                          type="button"
                          className={styles.smallGhost}
                          onClick={() =>
                            updateOperationalList("safelist", {
                              id: item.id,
                              label: item.value,
                              kind: "ioc",
                              severity: item.severity,
                              source: item.source,
                              updatedAt: item.lastSeen,
                            })
                          }
                        >
                          加入 {config.safeListLabel}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </aside>
          </div>
        </section>

        <section className={styles.executionDeck} data-layout="Execution Deck">
          <div className={styles.sectionTopline}>
            <div>
              <div className={styles.eyebrow}>{config.executionDeckLabel}</div>
              <h2>{config.huntDeckTitle || HUNT_DECK_TITLE}</h2>
              <p>把漏洞、IOC 和组织画像直接转成可执行狩猎卡与剧本动作。</p>
            </div>
            <StatusPill label="Execution Deck" tone={styles.info} />
          </div>

          <div className={styles.deckGrid}>
            <section className={styles.deckPanel}>
              <div className={styles.sectionHeading}>
                <div>
                  <div className={styles.eyebrow}>Hunt Deck</div>
                  <h3>{config.huntDeckTitle || HUNT_DECK_TITLE}</h3>
                </div>
              </div>
              <div className={styles.deckCards}>
                {huntCards.map((card) => (
                  <article key={card.id} className={styles.deckCard}>
                    <div className={styles.deckMeta}>
                      <StatusPill label={card.badge} tone={card.badgeTone === "critical" ? styles.critical : card.badgeTone === "warning" ? styles.warning : styles.info} />
                      <span>{card.meta}</span>
                    </div>
                    <h4>{card.title}</h4>
                    <p>{card.description}</p>
                    <pre className={styles.codeBlock}>{card.code}</pre>
                    <div className={styles.cardActions}>
                      {card.actions.map((action) => (
                        <button key={action.label} type="button" className={action.tone === "primary" ? styles.smallAction : action.tone === "danger" ? styles.dangerAction : styles.smallGhost}>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.deckPanel}>
              <div className={styles.sectionHeading}>
                <div>
                  <div className={styles.eyebrow}>Playbook Deck</div>
                  <h3>{config.playbookDeckTitle || PLAYBOOK_DECK_TITLE}</h3>
                </div>
              </div>
              <div className={styles.deckCards}>
                {playbookCards.map((card) => (
                  <article key={card.id} className={styles.deckCard}>
                    <div className={styles.deckMeta}>
                      <StatusPill label={card.badge} tone={card.badgeTone === "critical" ? styles.critical : card.badgeTone === "warning" ? styles.warning : styles.info} />
                      <span>{card.meta}</span>
                    </div>
                    <h4>{card.title}</h4>
                    <p>{card.description}</p>
                    <div className={styles.inlineList}>
                      {card.details.map((detail) => (
                        <span key={detail} className={styles.inlinePill}>
                          {detail}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className={styles.footerStrip}>
          <div className={styles.footerMeta}>
            <strong>最近查看</strong>
            <div className={styles.inlineList}>
              {watchlist.map((item) => (
                <span key={item} className={styles.inlinePill}>{item}</span>
              ))}
            </div>
          </div>
          <div className={styles.footerMeta}>
            <strong>反馈</strong>
            <span>{feedback || "指挥台已启用，后续可继续接入更细粒度客户视图。"}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
