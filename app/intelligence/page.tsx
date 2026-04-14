import NavBar from "@/components/NavBar";
import { intelligenceCommandCenterData } from "@/app/intelligence/data";
import Topbar from "@/app/intelligence/components/Topbar";
import ExecutiveBrief from "@/app/intelligence/components/ExecutiveBrief";
import WhatChanged from "@/app/intelligence/components/WhatChanged";
import ExposurePriorities from "@/app/intelligence/components/ExposurePriorities";
import AnalystDrilldown from "@/app/intelligence/components/AnalystDrilldown";

export default function IntelligencePage() {
  return (
    <div className="min-h-screen intelligence-command-center">
      <NavBar active="情报中心" />
      <div className="homepage-shell">
        <Topbar topbar={intelligenceCommandCenterData.topbar} />
        <main className="dashboard">
          <ExecutiveBrief
            hero={intelligenceCommandCenterData.hero}
            kpis={intelligenceCommandCenterData.kpis}
          />
          <WhatChanged campaigns={intelligenceCommandCenterData.campaigns} />
          <ExposurePriorities exposures={intelligenceCommandCenterData.exposures} />
          <AnalystDrilldown
            graph={intelligenceCommandCenterData.graph}
            hunts={intelligenceCommandCenterData.hunts}
            playbooks={intelligenceCommandCenterData.playbooks}
            exposures={intelligenceCommandCenterData.exposures}
          />
        </main>
      </div>
    </div>
  );
}
