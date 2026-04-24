import type { HeroData, KpiData } from "@/app/(executive)/intelligence/data";
import { SystemIcon } from "@/components/ui/SystemIcon";

function Chip({ label, tone }: { label: string; tone?: string }) {
  return (
    <div className={`chip intel-icon-label${tone ? ` ${tone}` : ""}`}>
      <SystemIcon className="system-icon" name={tone === "alert" ? "alert" : "target"} size={13} />
      {label}
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone?: string }) {
  return (
    <div className={`status-pill intel-icon-label${tone ? ` ${tone}` : ""}`}>
      <SystemIcon
        className="system-icon"
        name={tone === "critical" ? "alert" : tone === "warning" ? "clock" : "activity"}
        size={13}
      />
      {label}
    </div>
  );
}

function toneToken(tone: string) {
  return `var(--intel-${tone}, var(--intel-cyan))`;
}

export default function ExecutiveBrief({
  hero,
  kpis,
  verdict,
}: {
  hero: HeroData;
  kpis: KpiData[];
  verdict?: {
    total: number;
    factors: Array<{ label: string; score: number }>;
    metadata: { scope: string; activeFilters: string[] };
  };
}) {
  const effectiveVerdict = verdict ?? {
    total: 72,
    factors: [
      { label: "威胁相关性", score: 74 },
      { label: "利用活跃度", score: 68 },
      { label: "暴露可达性", score: 71 },
      { label: "处置可执行度", score: 76 },
      { label: "证据置信度", score: 72 },
    ],
    metadata: { scope: "ALL", activeFilters: [] },
  };

  return (
    <section className="executive-brief section" id={hero.sectionId} aria-label="组织威胁态势">
      <div className="executive-brief-flow">
        <div className="brief-overview-grid">
          <article className="brief-hero panel">
            <div className="eyebrow">{hero.eyebrow}</div>
            <h2>{hero.headline}</h2>
            <p>{hero.body}</p>
            <div className="hero-tags">
              {hero.tags.map((tag) => (
                <Chip key={tag} label={tag} />
              ))}
            </div>
          </article>

          <section className="panel verdict-panel">
            <div className="panel-header">
              <div>
                <div className="meta-label intel-icon-label">
                  <SystemIcon className="system-icon" name="chart" size={13} />
                  Unified verdict
                </div>
                <h3>统一结论分</h3>
              </div>
              <StatusPill
                label={`${effectiveVerdict.total} / 100`}
                tone={
                  effectiveVerdict.total >= 80
                    ? "critical"
                    : effectiveVerdict.total >= 65
                      ? "warning"
                      : "info"
                }
              />
            </div>
            <div className="verdict-meta">
              <span>{`Scope: ${effectiveVerdict.metadata.scope}`}</span>
              <span>{`Filters: ${effectiveVerdict.metadata.activeFilters.join(" / ") || "none"}`}</span>
            </div>
            <div className="verdict-factors">
              {effectiveVerdict.factors.map((factor) => (
                <div key={factor.label} className="verdict-factor">
                  <span className="intel-icon-label">
                    <SystemIcon className="system-icon" name="target" size={13} />
                    {factor.label}
                  </span>
                  <strong>{factor.score}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="posture-snapshot" aria-label="Posture Snapshot">
          <div className="posture-snapshot-header">
            <div>
              <div className="meta-label intel-icon-label">
                <SystemIcon className="system-icon" name="activity" size={13} />
                Priority snapshot
              </div>
              <h3>今日优先级快照</h3>
            </div>
            <StatusPill label="Context filled" tone="info" />
          </div>
          <div className="kpis">
            {kpis.map((kpi) => (
              <article key={kpi.label} className="kpi-card" style={{ ["--accent" as string]: toneToken(kpi.tone) }}>
                <h4 className="intel-icon-label">
                  <SystemIcon className="system-icon" name="activity" size={13} />
                  {kpi.label}
                </h4>
                <div className="kpi-value">
                  <strong>{kpi.value}</strong>
                  <span>{kpi.delta}</span>
                </div>
                <p>{kpi.description}</p>
              </article>
            ))}
          </div>
          <div className="posture-followup">
            <article className="signal-heatmap">
              <div className="posture-mini-header">
                <div>
                  <div className="meta-label intel-icon-label">
                    <SystemIcon className="system-icon" name="eye" size={13} />
                    Why this matters
                  </div>
                  <h4>{hero.signal.title}</h4>
                </div>
              </div>
              <p>{hero.signal.description}</p>
              <div className="signal-meter-list">
                {hero.signal.items.map((item) => (
                  <div
                    key={item.label}
                    className="signal-meter"
                    style={{
                      ["--tone" as string]: toneToken(item.tone),
                      ["--score" as string]: `${item.value}%`,
                    }}
                  >
                    <span>{item.label}</span>
                    <div className="signal-track" aria-hidden="true">
                      <i />
                    </div>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="action-runway">
              <div className="posture-mini-header">
                <div>
                  <div className="meta-label intel-icon-label">
                    <SystemIcon className="system-icon" name="timeline" size={13} />
                    Recommended sequence
                  </div>
                  <h4>{hero.actionMatrix.title}</h4>
                </div>
              </div>
              <div className="action-runway-list">
                {hero.actionMatrix.rows.map((row) => (
                  <div key={row.title} className="action-runway-row">
                    <StatusPill
                      label={
                        row.tone === "critical" ? "Now" : row.tone === "warning" ? "Next" : "Watch"
                      }
                      tone={row.tone}
                    />
                    <div>
                      <strong>{row.title}</strong>
                      <p>{row.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="decision-section" aria-label="今日需要决策">
          <section className="panel decision-panel">
            <div className="panel-header">
              <div>
                <div className="meta-label intel-icon-label">
                  <SystemIcon className="system-icon" name="workflow" size={13} />
                  Decision rail
                </div>
                <h3>{hero.decisions.title}</h3>
              </div>
              <StatusPill label={hero.decisions.badge} tone="warning" />
            </div>
            <div className="decision-list">
              {hero.decisions.items.map((item) => (
                <article key={item.title} className="decision-item">
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <div className="decision-meta">
                    <span className="intel-icon-label">
                      <SystemIcon className="system-icon" name="user" size={13} />
                      {`Owner: ${item.owner ?? "N/A"}`}
                    </span>
                    <span className="intel-icon-label">
                      <SystemIcon className="system-icon" name="clock" size={13} />
                      {`SLA: ${item.sla ?? "N/A"}`}
                    </span>
                    <span className="intel-icon-label">
                      <SystemIcon className="system-icon" name="arrowRight" size={13} />
                      {`Action: ${item.recommendedAction ?? "N/A"}`}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </section>
  );
}
