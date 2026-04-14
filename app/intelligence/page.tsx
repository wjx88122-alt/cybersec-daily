import IntelligenceCommandCenter from "./IntelligenceCommandCenter";

const INTELLIGENCE_PAGE_CONFIG = {
  liveSnapshotEndpoint: "/api/intelligence",
  exportJsonHref: "/api/intelligence/export?format=json",
  exportMarkdownHref: "/api/intelligence/export?format=markdown",
  subscriptionsEndpoint: "/api/intelligence/subscriptions",
  exportRuleEndpoint: "/api/intelligence/export-rule",
  listsEndpoint: "/api/intelligence/lists",
  liveSourcesTitle: "真实情报源",
  mitreLabel: "MITRE ATT&CK",
  threatFoxLabel: "ThreatFox",
  threatFoxKeyLabel: "THREATFOX_AUTH_KEY",
  relevanceLabel: "客户相关性",
  graphTitle: "实体关系图谱",
  threatListLabel: "Threat List",
  safeListLabel: "Safelist",
  commandBridgeLabel: "Command Bridge",
  graphTheaterLabel: "Graph Theater",
  executionDeckLabel: "Execution Deck",
  huntDeckTitle: "狩猎与研判工作台",
  playbookDeckTitle: "自动化响应剧本",
  exportJsonLabel: "导出 JSON",
} as const;

export default function IntelligencePage() {
  return <IntelligenceCommandCenter config={INTELLIGENCE_PAGE_CONFIG} />;
}
