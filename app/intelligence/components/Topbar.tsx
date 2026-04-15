import type { TopbarData } from "@/app/intelligence/data";

function Chip({ label, tone }: { label: string; tone?: string }) {
  return <div className={`chip${tone ? ` ${tone}` : ""}`}>{label}</div>;
}

export default function Topbar({
  topbar,
  filterStats = {},
  activeFilters = [],
}: {
  topbar: TopbarData;
  filterStats?: Record<string, number>;
  activeFilters?: string[];
}) {
  const summaryText = activeFilters.length > 0 ? `已启用 ${activeFilters.length} 个筛选` : "筛选：全部";

  return (
    <header className="topbar">
      <div className="topbar-inner intel-ribbon">
        <div className="brand-cluster">
          <div className="brand">
            <div className="brand-mark" />
            <div>
              <div className="eyebrow">{topbar.eyebrow}</div>
              <h1>{topbar.title}</h1>
              <p>{topbar.subtitle}</p>
            </div>
          </div>
          <div className="top-actions">
            {topbar.chips.map((chip) => (
              <Chip key={chip.label} label={chip.label} tone={chip.tone} />
            ))}
          </div>
        </div>
      </div>
      <div className="topbar-command">
        <nav className="section-nav" aria-label="快速跳转">
          {topbar.sections.map((section) => (
            <a key={section.id} className="section-link" href={`#${section.id}`}>
              {section.label}
            </a>
          ))}
        </nav>
        <div className="filter-strip" aria-label="全局过滤">
          {topbar.filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-pill${activeFilters.includes(filter) ? " is-active" : ""}`}
              aria-pressed={activeFilters.includes(filter)}
            >
              <span>{filter}</span>
              <em>{filterStats[filter] ?? 0}</em>
            </button>
          ))}
        </div>
        <div className="filter-summary">{summaryText}</div>
      </div>
    </header>
  );
}
