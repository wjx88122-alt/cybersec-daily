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

test("threat map does not seed random arcs during server render", () => {
  const source = readFileSync(join(root, "components/ThreatMap.tsx"), "utf8");

  assert.equal(
    source.includes("useState<AttackArc[]>(() =>"),
    false,
  );
  assert.equal(
    source.includes("createInitialArcs(INITIAL_ARC_COUNT)"),
    true,
  );
  assert.equal(
    source.includes("function svgCoord"),
    true,
  );
  assert.equal(
    source.includes("cx={svgCoord("),
    true,
  );
});
