import type { TopbarData } from "@/app/(executive)/intelligence/data";
import { SystemIcon, type SystemIconName } from "@/components/ui/SystemIcon";

const SECTION_ICONS: SystemIconName[] = ["shield", "radar", "target", "workflow", "database", "eye"];

function Chip({ label, tone }: { label: string; tone?: string }) {
  const icon: SystemIconName = tone === "alert" ? "alert" : tone === "live" ? "activity" : "spark";

  return (
    <div className={`chip intel-icon-label${tone ? ` ${tone}` : ""}`}>
      <SystemIcon className="system-icon" name={icon} size={13} />
      {label}
    </div>
  );
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
            <div className="brand-mark" aria-hidden="true">
              <SystemIcon className="system-icon" name="shield" size={21} />
            </div>
            <div>
              <div className="eyebrow">{topbar.eyebrow}</div>
              <h1>{topbar.title}</h1>
              <p>{topbar.subtitle}</p>
            </div>
          </div>
          <div className="top-actions topbar-scroll-row">
            {topbar.chips.map((chip) => (
              <Chip key={chip.label} label={chip.label} tone={chip.tone} />
            ))}
          </div>
        </div>
      </div>
      <div className="topbar-command">
        <nav className="section-nav topbar-scroll-row" aria-label="快速跳转">
          {topbar.sections.map((section, index) => (
            <a key={section.id} className="section-link intel-icon-label" href={`#${section.id}`}>
              <SystemIcon
                className="system-icon"
                name={SECTION_ICONS[index % SECTION_ICONS.length]}
                size={13}
              />
              {section.label}
            </a>
          ))}
        </nav>
        <div className="filter-strip topbar-scroll-row" aria-label="全局过滤">
          {topbar.filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-pill intel-icon-label${activeFilters.includes(filter) ? " is-active" : ""}`}
              aria-pressed={activeFilters.includes(filter)}
            >
              <SystemIcon
                className="system-icon"
                name={activeFilters.includes(filter) ? "check" : "filter"}
                size={13}
              />
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
