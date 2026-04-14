import type { ExposureData } from "@/app/intelligence/data";

function StatusPill({ label, tone }: { label: string; tone?: string }) {
  return <div className={`status-pill${tone ? ` ${tone}` : ""}`}>{label}</div>;
}

export default function ExposurePriorities({
  exposures,
}: {
  exposures: ExposureData;
}) {
  const homepageExposureRows = exposures.rows.slice(0, 3);

  return (
    <section
      className="exposure-priorities section"
      id={exposures.sectionId}
      aria-label="资产暴露与漏洞优先级"
    >
      <div className="bridge-headline">
        <div>
          <div className="eyebrow">{exposures.eyebrow}</div>
          <h2>{exposures.title}</h2>
          <p>{exposures.description}</p>
        </div>
        <StatusPill label={exposures.badge} tone="critical" />
      </div>

      <div className="exposure-priority-list">
        {homepageExposureRows.map((row) => (
          <article key={row.asset} className="panel exposure-priority-row">
            <div className="panel-header">
              <div>
                <div className="meta-label">{row.scope}</div>
                <h3>{row.asset}</h3>
                <p>{row.finding}</p>
              </div>
              <StatusPill label={row.action} tone={row.actionTone} />
            </div>
            <p>{row.findingNote}</p>
            <div className="detail-list">
              <span>{`Risk score: ${row.score}`}</span>
              <span>{`Owner: ${row.owner}`}</span>
              <span>{row.ownerNote}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
