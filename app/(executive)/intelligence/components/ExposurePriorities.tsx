import type { ExposureData } from "@/app/(executive)/intelligence/data";

function StatusPill({ label, tone }: { label: string; tone?: string }) {
  return <div className={`status-pill${tone ? ` ${tone}` : ""}`}>{label}</div>;
}

export default function ExposurePriorities({
  exposures,
  surfaceScope = "all",
  scopeStats = {},
}: {
  exposures: ExposureData;
  surfaceScope?: "all" | "easm" | "iasm";
  scopeStats?: Record<string, number>;
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
        <div className="bridge-right">
          <StatusPill label={exposures.badge} tone="critical" />
          <div className="surface-toggle-row" role="group" aria-label="Attack surface scope">
            {[
              { key: "all", label: "All surfaces" },
              { key: "easm", label: "EASM" },
              { key: "iasm", label: "IASM" },
            ].map((scope) => (
              <button
                key={scope.key}
                type="button"
                className={`surface-toggle${surfaceScope === scope.key ? " is-active" : ""}`}
                aria-pressed={surfaceScope === scope.key}
              >
                <span>{scope.label}</span>
                <em>{scopeStats[scope.key] ?? 0}</em>
              </button>
            ))}
          </div>
        </div>
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
              <span>{`Surface: ${row.surface ?? "N/A"}`}</span>
              <span>{`Owner: ${row.owner}`}</span>
              <span>{`Ticket: ${row.ticketId ?? "Untracked"}`}</span>
              <span>{`Status: ${row.ticketStatus ?? "Unknown"}`}</span>
              <span>{row.ownerNote}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
