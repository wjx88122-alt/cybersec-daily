import ProductSectionShell from "@/components/shells/ProductSectionShell";
import { intelligenceCommandCenterData } from "@/app/(executive)/intelligence/data";
import Topbar from "@/app/(executive)/intelligence/components/Topbar";
import ExecutiveBrief from "@/app/(executive)/intelligence/components/ExecutiveBrief";
import WhatChanged from "@/app/(executive)/intelligence/components/WhatChanged";
import ExposurePriorities from "@/app/(executive)/intelligence/components/ExposurePriorities";
import AnalystDrilldown from "@/app/(executive)/intelligence/components/AnalystDrilldown";
import OpsExtensions from "@/app/(executive)/intelligence/components/OpsExtensions";
import { buildSurfaceStats, computeUnifiedVerdict, filterExposureBySurface } from "@/app/(executive)/intelligence/intel-engine";

export default function IntelligencePage() {
  const activeFilters: string[] = [];
  const filterStats = intelligenceCommandCenterData.topbar.filters.reduce<Record<string, number>>((acc, filter) => {
    const baseCount =
      intelligenceCommandCenterData.campaigns.timeline.length +
      intelligenceCommandCenterData.exposures.rows.length +
      intelligenceCommandCenterData.hunts.cards.length +
      intelligenceCommandCenterData.playbooks.cards.length;
    acc[filter] = baseCount;
    return acc;
  }, {});

  const surfaceScope = "all" as const;
  const scopeStats = buildSurfaceStats(intelligenceCommandCenterData.exposures.rows);
  const scopedExposureRows = filterExposureBySurface(intelligenceCommandCenterData.exposures.rows, surfaceScope);
  const verdict = computeUnifiedVerdict(
    {
      ...intelligenceCommandCenterData,
      exposures: { ...intelligenceCommandCenterData.exposures, rows: scopedExposureRows },
    },
    { activeFilters, surfaceScope, actionFeedSize: 0 },
  );

  return (
    <ProductSectionShell
      shellClassName="intelligence-command-center"
      systemTone="system-shell-light"
    >
      <div className="homepage-shell">
        <Topbar
          topbar={intelligenceCommandCenterData.topbar}
          activeFilters={activeFilters}
          filterStats={filterStats}
        />
        <main className="dashboard">
          <ExecutiveBrief
            hero={intelligenceCommandCenterData.hero}
            kpis={intelligenceCommandCenterData.kpis}
            verdict={verdict}
          />
          <WhatChanged campaigns={intelligenceCommandCenterData.campaigns} />
          <ExposurePriorities
            exposures={{ ...intelligenceCommandCenterData.exposures, rows: scopedExposureRows }}
            surfaceScope={surfaceScope}
            scopeStats={scopeStats}
          />
          <AnalystDrilldown
            graph={intelligenceCommandCenterData.graph}
            hunts={intelligenceCommandCenterData.hunts}
            playbooks={intelligenceCommandCenterData.playbooks}
            exposures={{ ...intelligenceCommandCenterData.exposures, rows: scopedExposureRows }}
          />
          <OpsExtensions
            collaboration={intelligenceCommandCenterData.collaboration}
            intake={intelligenceCommandCenterData.intake}
            detectionPipeline={intelligenceCommandCenterData.detectionPipeline}
            assistant={intelligenceCommandCenterData.assistant}
          />
        </main>
      </div>
    </ProductSectionShell>
  );
}
