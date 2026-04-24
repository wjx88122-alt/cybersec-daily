import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function load(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

test("mdr subpages and shared visuals reuse the shared MDR theme helpers", () => {
  const themeSource = load("app/(ops)/mdr/theme.ts");
  const dashboardSource = load("app/(ops)/mdr/dashboard/page.tsx");
  const networkSource = load("app/(ops)/mdr/network/page.tsx");
  const splunkSource = load("app/(ops)/mdr/splunk/page.tsx");
  const threatMapSource = load("components/ThreatMap.tsx");
  const topologySource = load("components/NetworkTopology.tsx");

  assert.equal(themeSource.includes("mdrSeverityHex"), true);
  assert.equal(themeSource.includes("mdrSourceHex"), true);
  assert.equal(themeSource.includes("mdrDeviceStatusHex"), true);
  assert.equal(themeSource.includes("mdrClientTierToneClass"), true);
  assert.equal(themeSource.includes("mdrPriorityToneClass"), true);
  assert.equal(themeSource.includes("mdrOpsStatusToneClass"), true);
  assert.equal(themeSource.includes("mdrHealthScoreToneClass"), true);
  assert.equal(themeSource.includes("mdrConnectionToneClass"), true);

  assert.equal(dashboardSource.includes("mdrSeverityHex("), true);
  assert.equal(dashboardSource.includes("mdrSourceHex("), true);
  assert.equal(dashboardSource.includes("mdrDeviceStatusHex("), true);
  assert.equal(dashboardSource.includes("mdrHealthScoreToneClass("), true);
  assert.equal(dashboardSource.includes("const sevDot"), false);

  assert.equal(networkSource.includes("const sevColor"), false);
  assert.equal(networkSource.includes("const prioColor"), false);
  assert.equal(networkSource.includes("const opsStatusColor"), false);
  assert.equal(networkSource.includes("function scoreColor"), false);
  assert.equal(networkSource.includes("TIER_COLORS"), false);
  assert.equal(networkSource.includes("STATUS_COLORS"), false);
  assert.equal(networkSource.includes("mdrClientTierToneClass("), true);
  assert.equal(networkSource.includes("mdrPriorityToneClass("), true);
  assert.equal(networkSource.includes("mdrOpsStatusToneClass("), true);
  assert.equal(networkSource.includes("mdrDeviceStatusDotClass("), true);
  assert.equal(networkSource.includes("mdrHealthScoreToneClass("), true);

  assert.equal(splunkSource.includes("const sevColor"), false);
  assert.equal(splunkSource.includes("mdrSeverityBadgeClass("), true);
  assert.equal(splunkSource.includes("mdrConnectionToneClass("), true);
  assert.equal(splunkSource.includes("mdrActionToneClass("), true);

  assert.equal(threatMapSource.includes("const SEV_COLORS"), false);
  assert.equal(threatMapSource.includes("mdrSeverityHex("), true);
  assert.equal(threatMapSource.includes("mdrDeviceStatusHex("), true);

  assert.equal(topologySource.includes("const STATUS_SVG"), false);
  assert.equal(topologySource.includes("const SEV_SVG"), false);
  assert.equal(topologySource.includes("STATUS_COLORS"), false);
  assert.equal(topologySource.includes("mdrDeviceStatusHex("), true);
  assert.equal(topologySource.includes("mdrDeviceStatusDotClass("), true);
  assert.equal(topologySource.includes("mdrSeverityHex("), true);
});
