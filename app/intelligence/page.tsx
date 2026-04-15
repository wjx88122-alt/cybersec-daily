import NavBar from "@/components/NavBar";
import { intelligenceCommandCenterData } from "@/app/intelligence/data";
import Topbar from "@/app/intelligence/components/Topbar";
import ExecutiveBrief from "@/app/intelligence/components/ExecutiveBrief";
import WhatChanged from "@/app/intelligence/components/WhatChanged";
import ExposurePriorities from "@/app/intelligence/components/ExposurePriorities";
import AnalystDrilldown from "@/app/intelligence/components/AnalystDrilldown";
import OpsExtensions from "@/app/intelligence/components/OpsExtensions";
import { buildSurfaceStats, computeUnifiedVerdict, filterExposureBySurface } from "@/app/intelligence/intel-engine";

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
    <div className="min-h-screen intelligence-command-center system-shell system-shell-dark">
      <NavBar active="情报中心" />
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
    </div>
  );
}
