import type {
  AssistantData,
  CollaborationData,
  DetectionPipelineData,
  IntakeData,
} from "@/app/intelligence/data";

function StatusPill({ label, tone }: { label: string; tone?: string }) {
  return <div className={`status-pill${tone ? ` ${tone}` : ""}`}>{label}</div>;
}

function CoverageRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="coverage-row">
      <span>{label}</span>
      <div className="coverage-track">
        <div className="coverage-fill" style={{ width: `${value}%` }} />
      </div>
      <strong>{`${value}%`}</strong>
    </div>
  );
}

export default function OpsExtensions({
  collaboration,
  intake,
  detectionPipeline,
  assistant,
}: {
  collaboration: CollaborationData;
  intake: IntakeData;
  detectionPipeline: DetectionPipelineData;
  assistant: AssistantData;
}) {
  return (
    <>
      <section className="collaboration-workspace section" id={collaboration.sectionId}>
        <div className="bridge-headline">
          <div>
            <div className="eyebrow">{collaboration.eyebrow}</div>
            <h2>{collaboration.title}</h2>
            <p>{collaboration.description}</p>
          </div>
          <StatusPill label={collaboration.badge} tone="info" />
        </div>

        <div className="collab-grid">
          <article className="panel collab-card">
            <div className="meta-label">Projects</div>
            <div className="tiny-stack">
              {collaboration.projects.map((project) => (
                <div key={project.name} className="tiny-card">
                  <strong>{project.name}</strong>
                  <p>{`Owner: ${project.owner} · SLA: ${project.sla}`}</p>
                  <div className="detail-list">
                    <span>{`Status: ${project.status}`}</span>
                    <span>{`IOCs: ${project.iocCount}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel collab-card">
            <div className="meta-label">Collections</div>
            <div className="tiny-stack">
              {collaboration.collections.map((collection) => (
                <div key={collection.name} className="tiny-card">
                  <strong>{collection.name}</strong>
                  <p>{`${collection.type} · ${collection.sharing}`}</p>
                  <div className="detail-list">
                    <span>{collection.freshness}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel collab-card">
            <div className="meta-label">Cases</div>
            <div className="tiny-stack">
              {collaboration.cases.map((caseItem) => (
                <div key={caseItem.id} className="tiny-card">
                  <strong>{caseItem.id}</strong>
                  <p>{caseItem.summary}</p>
                  <div className="detail-list">
                    <span>{`Severity: ${caseItem.severity}`}</span>
                    <span>{`Owner: ${caseItem.owner}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="intake-layer section" id={intake.sectionId}>
        <div className="bridge-headline">
          <div>
            <div className="eyebrow">{intake.eyebrow}</div>
            <h2>{intake.title}</h2>
            <p>{intake.description}</p>
          </div>
        </div>

        <article className="panel">
          <div className="meta-label">Connector health</div>
          <div className="table-wrap">
            <table className="intel-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Format</th>
                  <th>Freshness</th>
                  <th>Confidence</th>
                  <th>Records</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {intake.connectors.map((connector) => (
                  <tr key={connector.name}>
                    <td>{connector.name}</td>
                    <td>{connector.format}</td>
                    <td>{connector.freshness}</td>
                    <td>{`${Math.round(connector.confidence * 100)}%`}</td>
                    <td>{connector.records}</td>
                    <td>{connector.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="detection-pipeline section" id={detectionPipeline.sectionId}>
        <div className="bridge-headline">
          <div>
            <div className="eyebrow">{detectionPipeline.eyebrow}</div>
            <h2>{detectionPipeline.title}</h2>
            <p>{detectionPipeline.description}</p>
          </div>
        </div>

        <article className="panel">
          <div className="pipeline-stages">
            {detectionPipeline.stages.map((stage) => (
              <span key={stage} className="stage-pill">
                {stage}
              </span>
            ))}
          </div>
          <div className="table-wrap">
            <table className="intel-table">
              <thead>
                <tr>
                  <th>Threat</th>
                  <th>MITRE</th>
                  <th>Sigma</th>
                  <th>YARA</th>
                  <th>KQL</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {detectionPipeline.mappings.map((mapping) => (
                  <tr key={mapping.threat}>
                    <td>{mapping.threat}</td>
                    <td>{mapping.mitre}</td>
                    <td>{mapping.sigma}</td>
                    <td>{mapping.yara}</td>
                    <td>{mapping.kql}</td>
                    <td>{mapping.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="coverage-grid">
            <CoverageRow label="Sigma" value={detectionPipeline.coverage.sigma} />
            <CoverageRow label="YARA" value={detectionPipeline.coverage.yara} />
            <CoverageRow label="KQL" value={detectionPipeline.coverage.kql} />
          </div>
        </article>
      </section>

      <section className="evidence-assistant section" id={assistant.sectionId}>
        <div className="bridge-headline">
          <div>
            <div className="eyebrow">{assistant.eyebrow}</div>
            <h2>{assistant.title}</h2>
            <p>{assistant.summary}</p>
          </div>
          <StatusPill label={`Confidence ${Math.round(assistant.confidence * 100)}%`} tone="info" />
        </div>

        <div className="assistant-grid">
          <article className="panel">
            <div className="meta-label">Key findings</div>
            <div className="tiny-stack">
              {assistant.findings.map((finding) => (
                <div key={finding} className="tiny-card">
                  <strong>{finding}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="meta-label">Evidence chain</div>
            <div className="tiny-stack">
              {assistant.evidence.map((item) => (
                <a
                  key={item.title}
                  className="tiny-card evidence-item"
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <strong>{item.title}</strong>
                  <p>{`${item.source} · ${item.timestamp}`}</p>
                  <p>{item.note}</p>
                </a>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="meta-label">Action feed</div>
            <div className="tiny-stack">
              <div className="tiny-card">
                <strong>No actions yet</strong>
                <p>已合并 command center 数据与模型，后续可接事件回写。</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
