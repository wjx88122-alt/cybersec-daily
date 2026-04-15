import type { HeroData, KpiData } from "@/app/intelligence/data";

function Chip({ label, tone }: { label: string; tone?: string }) {
  return <div className={`chip${tone ? ` ${tone}` : ""}`}>{label}</div>;
}

function StatusPill({ label, tone }: { label: string; tone?: string }) {
  return <div className={`status-pill${tone ? ` ${tone}` : ""}`}>{label}</div>;
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
      <div className="briefing-row">
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

        <aside className="decision-rail" aria-label="今日需要决策">
          <section className="panel verdict-panel">
            <div className="panel-header">
              <div>
                <div className="meta-label">Unified verdict</div>
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
                  <span>{factor.label}</span>
                  <strong>{factor.score}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="panel decision-panel">
            <div className="panel-header">
              <div>
                <div className="meta-label">Decision rail</div>
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
                    <span>{`Owner: ${item.owner ?? "N/A"}`}</span>
                    <span>{`SLA: ${item.sla ?? "N/A"}`}</span>
                    <span>{`Action: ${item.recommendedAction ?? "N/A"}`}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel priority-sequence">
            <div className="panel-header">
              <div>
                <div className="meta-label">Decision support</div>
                <h3>{hero.actionMatrix.title}</h3>
              </div>
            </div>
            <div className="matrix-list">
              {hero.actionMatrix.rows.map((row) => (
                <div key={row.title} className="matrix-row">
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
          </section>
        </aside>
      </div>

      <section className="posture-snapshot" aria-label="Posture Snapshot">
        <div className="kpis">
          {kpis.map((kpi) => (
            <article key={kpi.label} className="kpi-card" style={{ ["--accent" as string]: `var(--${kpi.tone})` }}>
              <h4>{kpi.label}</h4>
              <div className="kpi-value">
                <strong>{kpi.value}</strong>
                <span>{kpi.delta}</span>
              </div>
              <p>{kpi.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="why-this-matters">
        <article className="panel change-drivers">
          <div className="panel-header">
            <div>
              <div className="meta-label">Why this matters</div>
              <h3>{hero.signal.title}</h3>
            </div>
            <StatusPill label="Live" tone="info" />
          </div>
          <p>{hero.signal.description}</p>
          <div className="signal-grid">
            {hero.signal.items.map((item) => (
              <div key={item.label} className="signal-item" style={{ ["--tone" as string]: `var(--${item.tone})` }}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel action-sequence">
          <div className="panel-header">
            <div>
              <div className="meta-label">Recommended sequence</div>
              <h3>建议动作顺序</h3>
            </div>
          </div>
          <div className="tiny-stack">
            {hero.decisions.items.map((item, index) => (
              <div key={item.title} className="tiny-card">
                <strong>{`${index + 1}. ${item.title}`}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}
