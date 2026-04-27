import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { getArcLiftFactor } from "../lib/threat-map.ts";

const root = process.cwd();

test("getArcLiftFactor stays finite when a new attack arc has zero progress", () => {
  assert.equal(getArcLiftFactor(0, 0), 0);
  assert.equal(Number.isFinite(getArcLiftFactor(0.2, 0.1)), true);
  assert.equal(Number.isFinite(getArcLiftFactor(0.2, 0.2)), true);
});

test("mdr dashboard clock does not initialize with server-time text", () => {
  const page = readFileSync(
    join(root, "app/(ops)/mdr/dashboard/page.tsx"),
    "utf8",
  );

  assert.equal(page.includes('useState(timeStr())'), false);
});

test("mdr routes render dynamically instead of freezing operational UI at build time", () => {
  const layout = readFileSync(
    join(root, "app/(ops)/mdr/layout.tsx"),
    "utf8",
  );

  assert.equal(layout.includes('export const dynamic = "force-dynamic";'), true);
});

test("mdr operational timestamps suppress hydration warnings", () => {
  const dashboard = readFileSync(
    join(root, "app/(ops)/mdr/dashboard/page.tsx"),
    "utf8",
  );
  const network = readFileSync(
    join(root, "app/(ops)/mdr/network/page.tsx"),
    "utf8",
  );
  const mdr = readFileSync(
    join(root, "app/(ops)/mdr/page.tsx"),
    "utf8",
  );

  assert.equal(dashboard.includes("suppressHydrationWarning"), true);
  assert.equal(network.includes("suppressHydrationWarning"), true);
  assert.equal(mdr.includes("suppressHydrationWarning"), true);
});

test("mdr dashboard alert ticker renders dynamic rows after hydration", () => {
  const dashboard = readFileSync(
    join(root, "app/(ops)/mdr/dashboard/page.tsx"),
    "utf8",
  );

  assert.equal(dashboard.includes("const [tickerReady, setTickerReady] = useState(false);"), true);
  assert.equal(dashboard.includes("setTickerReady(true);"), true);
  assert.equal(dashboard.includes("tickerReady ? [...items, ...items] : []"), true);
});

test("mdr dashboard uses the real attack feed API as its operations data source", () => {
  const dashboard = readFileSync(
    join(root, "app/(ops)/mdr/dashboard/page.tsx"),
    "utf8",
  );
  const route = readFileSync(
    join(root, "app/api/attack-feed/route.ts"),
    "utf8",
  );
  const source = readFileSync(
    join(root, "lib/attack-data-source.ts"),
    "utf8",
  );

  assert.equal(dashboard.includes("/api/attack-feed"), true);
  assert.equal(dashboard.includes("真实攻击数据源"), true);
  assert.equal(dashboard.includes("攻击雷达"), true);
  assert.equal(route.includes("fetchAttackOperationsSnapshot"), true);
  assert.equal(source.includes("https://isc.sans.edu/api/topips/records/8?json"), true);
  assert.equal(source.includes("https://isc.sans.edu/api/topports/records/8?json"), true);
  assert.equal(source.includes("known_exploited_vulnerabilities.json"), true);
});

test("mdr command deck isolates live SLA text from server hydration", () => {
  const mdr = readFileSync(
    join(root, "app/(ops)/mdr/page.tsx"),
    "utf8",
  );

  assert.equal(mdr.includes("SLA 剩余 <span suppressHydrationWarning>"), true);
});

test("mdr incoming alert rows do not switch to horizontal layout at narrow tablet widths", () => {
  const mdr = readFileSync(
    join(root, "app/(ops)/mdr/page.tsx"),
    "utf8",
  );

  assert.equal(mdr.includes("sm:flex-row sm:items-center"), false);
  assert.equal(mdr.includes("lg:flex-row lg:items-center"), true);
  assert.equal(mdr.includes("min-w-[11rem]"), true);
  assert.equal(mdr.includes("justify-center"), true);
});

test("mdr dashboard uses compact queue cards for the incoming alerts side rail", () => {
  const mdr = readFileSync(
    join(root, "app/(ops)/mdr/page.tsx"),
    "utf8",
  );

  assert.equal(mdr.includes("function AlertQueueCard"), true);
  assert.equal(mdr.includes("alert-queue-card"), true);
  assert.equal(mdr.includes("<AlertQueueCard key={alert.id} alert={alert} onCreateTicket={handleCreateTicket} index={index} />"), true);
  assert.equal(mdr.includes("grid-cols-[auto_minmax(0,1fr)]"), true);
  assert.equal(mdr.includes('className="min-w-0 space-y-5"'), true);
});

test("mdr ticket creation feedback uses a staged dispatch animation", () => {
  const mdr = readFileSync(
    join(root, "app/(ops)/mdr/page.tsx"),
    "utf8",
  );
  const system = readFileSync(join(root, "app/styles/system.css"), "utf8");

  assert.equal(mdr.includes("function DispatchAnimation"), true);
  assert.equal(mdr.includes("ticketId"), true);
  assert.equal(mdr.includes("mdr-dispatch-layer"), true);
  assert.equal(mdr.includes("mdr-dispatch-card"), true);
  assert.equal(mdr.includes("mdr-dispatch-progress"), true);
  assert.equal(mdr.includes("mdr-dispatch-step"), true);
  assert.equal(system.includes(".mdr-dispatch-layer {\n  position: fixed;"), true);
  assert.equal(system.includes("@keyframes mdr-dispatch-in"), true);
  assert.equal(system.includes("@keyframes mdr-dispatch-progress"), true);
  assert.equal(system.includes("@media (prefers-reduced-motion: reduce)"), true);
});

test("threat map does not seed random arcs during server render", () => {
  const source = readFileSync(join(root, "components/ThreatMap.tsx"), "utf8");

  assert.equal(source.includes("Math.random"), false);
  assert.equal(source.includes("mapEvents"), true);
  assert.equal(source.includes("buildVisiblePathSegments"), true);
  assert.equal(
    source.includes("function svgCoord"),
    true,
  );
  assert.equal(
    source.includes("cx={svgCoord("),
    true,
  );
});

test("mdr dashboard passes live attack snapshot into the global threat map", () => {
  const dashboard = readFileSync(
    join(root, "app/(ops)/mdr/dashboard/page.tsx"),
    "utf8",
  );

  assert.equal(
    dashboard.includes("<ThreatMap snapshot={attackSnapshot} loading={attackLoading} error={attackError} />"),
    true,
  );
});
