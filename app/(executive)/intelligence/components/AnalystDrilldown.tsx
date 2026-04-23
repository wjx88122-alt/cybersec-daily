import type { ExposureData, GraphData, HuntData, PlaybookData } from "@/app/(executive)/intelligence/data";

function StatusPill({ label, tone }: { label: string; tone?: string }) {
  return <div className={`status-pill${tone ? ` ${tone}` : ""}`}>{label}</div>;
}

function ActionRow({
  actions,
}: {
  actions: Array<{ label: string; tone?: string }>;
}) {
  return (
    <div className="action-row">
      {actions.map((action) => (
        <button
          key={`${action.label}-${action.tone ?? "default"}`}
          type="button"
          className={`action${action.tone ? ` ${action.tone}` : ""}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

export default function AnalystDrilldown({
  graph,
  hunts,
  playbooks,
  exposures,
}: {
  graph: GraphData;
  hunts: HuntData;
  playbooks: PlaybookData;
  exposures: ExposureData;
}) {
  return (
    <section className="analyst-drilldown section" aria-label="Analyst Drilldown">
      <div className="bridge-headline">
        <div>
          <div className="eyebrow">Analyst Drilldown</div>
          <h2>Analyst Drilldown</h2>
          <p>把图谱、狩猎和剧本放到更低优先级的工作区，承接首页简报之后的深入调查与处置。</p>
        </div>
      </div>

      <div className="drilldown-stack">
        <section className="panel drilldown-panel" id={graph.sectionId} aria-label="实体关联图谱">
          <div className="bridge-headline">
            <div>
              <div className="eyebrow">{graph.eyebrow}</div>
              <h2>{graph.title}</h2>
              <p>{graph.description}</p>
            </div>
            <StatusPill label={graph.badge} tone="info" />
          </div>
          <div className="graph-stage">
            <div className="graph-wrap">
              <div className="graph-canvas">
                <div className="graph-legend">
                  {graph.legend.map((item) => (
                    <div key={item.label} className="legend-item">
                      <span className={`legend-dot ${item.tone}`} />
                      <strong>{item.label}</strong>
                    </div>
                  ))}
                </div>
                {graph.lines.map((line) => (
                  <div key={line.className} className={`line ${line.className}`} />
                ))}
                {graph.nodes.map((node) => (
                  <div key={node.title} className={`node ${node.type}`}>
                    {node.title}
                    <small>{node.subtitle}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relation-list">
            {graph.relations.map((relation) => (
              <div key={relation.title} className="relation-item">
                <strong>{relation.title}</strong>
                <p>{relation.description}</p>
              </div>
            ))}
          </div>
          <div className="tiny-stack">
            {exposures.insights.map((insight) =>
              insight.emphasis ? (
                <article key={insight.title} className="panel side-panel">
                  <div className="panel-header">
                    <div>
                      <div className="meta-label">{insight.eyebrow}</div>
                      <h3>{insight.title}</h3>
                    </div>
                  </div>
                  <div className="insight-card">
                    <strong>{insight.emphasis}</strong>
                    <p>{insight.description}</p>
                  </div>
                </article>
              ) : (
                <article key={insight.title} className="panel side-panel">
                  <div className="panel-header">
                    <div>
                      <div className="meta-label">{insight.eyebrow}</div>
                      <h3>{insight.title}</h3>
                    </div>
                  </div>
                  <div className="tiny-stack">
                    {insight.cards?.map((card) => (
                      <div key={card.title} className="tiny-card">
                        <strong>{card.title}</strong>
                        <p>{card.description}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="panel drilldown-panel" id={hunts.sectionId} aria-label="狩猎与研判工作台">
          <div className="bridge-headline">
            <div>
              <div className="eyebrow">{hunts.eyebrow}</div>
              <h2>{hunts.title}</h2>
              <p>{hunts.description}</p>
            </div>
            <StatusPill label={hunts.badge} tone="warning" />
          </div>
          <div className="panel-header">
            <div>
              <div className="meta-label">Hunt from intelligence</div>
              <h3>{hunts.panelTitle}</h3>
              <p>{hunts.panelDescription}</p>
            </div>
            <StatusPill label={hunts.panelBadge} tone="info" />
          </div>
          <div className="query-grid">
            {hunts.cards.map((card) => (
              <article key={card.title} className="query-card">
                <div className="query-top">
                  <StatusPill label={card.badge} tone={card.badgeTone} />
                  <div className="meta-label">{card.meta}</div>
                </div>
                <h4>{card.title}</h4>
                <p>{card.description}</p>
                <code>{card.code}</code>
                <ActionRow actions={card.actions} />
              </article>
            ))}
          </div>
        </section>

        <section className="panel drilldown-panel" id={playbooks.sectionId} aria-label="自动化响应剧本">
          <div className="bridge-headline">
            <div>
              <div className="eyebrow">{playbooks.eyebrow}</div>
              <h2>{playbooks.title}</h2>
              <p>{playbooks.description}</p>
            </div>
            <StatusPill label={playbooks.badge} tone="critical" />
          </div>
          <div className="panel-header">
            <div>
              <div className="meta-label">Playbook actions</div>
              <h3>{playbooks.panelTitle}</h3>
              <p>{playbooks.panelDescription}</p>
            </div>
            <StatusPill label={playbooks.panelBadge} tone="good" />
          </div>
          <div className="playbook-grid">
            {playbooks.cards.map((card) => (
              <article key={card.title} className="playbook-card">
                <div className="playbook-top">
                  <StatusPill label={card.badge} tone={card.badgeTone} />
                  <div className="meta-label">{card.meta}</div>
                </div>
                <h4>{card.title}</h4>
                <p>{card.description}</p>
                <div className="detail-list">
                  {card.details.map((detail) => (
                    <span key={detail}>{detail}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="footer-note">{playbooks.footer}</div>
        </section>
      </div>
    </section>
  );
}
