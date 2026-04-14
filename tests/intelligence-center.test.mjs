import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));

test("top-level intelligence route exists", () => {
  assert.equal(
    existsSync(join(root, "app/intelligence/page.tsx")),
    true,
    "app/intelligence/page.tsx should exist",
  );
});

test("Intelligence mock data file exists", () => {
  assert.equal(
    existsSync(join(root, "lib/intelligence-mock.ts")),
    true,
    "lib/intelligence-mock.ts should exist",
  );
});

test("MDR landing page links to the Intelligence Center", () => {
  const page = readFileSync(join(root, "app/mdr/page.tsx"), "utf8");

  assert.equal(page.includes("/intelligence"), true);
  assert.equal(page.includes("情报中心"), true);
});

test("top nav contains a first-class intelligence entry", () => {
  const nav = readFileSync(join(root, "components/NavBar.tsx"), "utf8");

  assert.equal(nav.includes('label: "情报中心"'), true);
  assert.equal(nav.includes('href: "/intelligence"'), true);
});

test("Intelligence Center top-level page exposes the main knowledge domains", () => {
  const page = readFileSync(join(root, "app/intelligence/page.tsx"), "utf8");

  assert.equal(page.includes("IntelligenceCommandCenter"), true);
  assert.equal(page.includes("Command Bridge"), true);
  assert.equal(page.includes("Graph Theater"), true);
  assert.equal(page.includes("Execution Deck"), true);
});

test("new intelligence command-center module and styles exist", () => {
  assert.equal(
    existsSync(join(root, "app/intelligence/IntelligenceCommandCenter.tsx")),
    true,
    "IntelligenceCommandCenter.tsx should exist",
  );
  assert.equal(
    existsSync(join(root, "app/intelligence/intelligence-center.module.css")),
    true,
    "intelligence-center.module.css should exist",
  );
});

test("command-center component exposes bridge, graph theater, and execution deck", () => {
  const source = readFileSync(
    join(root, "app/intelligence/IntelligenceCommandCenter.tsx"),
    "utf8",
  );

  assert.equal(source.includes("Command Bridge"), true);
  assert.equal(source.includes("Graph Theater"), true);
  assert.equal(source.includes("Execution Deck"), true);
  assert.equal(source.includes("重点攻击活动"), true);
  assert.equal(source.includes("资产暴露与漏洞优先级"), true);
  assert.equal(source.includes("实体关联图谱"), true);
  assert.equal(source.includes("狩猎与研判工作台"), true);
  assert.equal(source.includes("自动化响应剧本"), true);
});

test("command-center css module defines the new layout rails", () => {
  const css = readFileSync(
    join(root, "app/intelligence/intelligence-center.module.css"),
    "utf8",
  );

  assert.equal(css.includes(".commandShell"), true);
  assert.equal(css.includes(".commandBridge"), true);
  assert.equal(css.includes(".graphTheater"), true);
  assert.equal(css.includes(".executionDeck"), true);
});

test("Intelligence mock data exports the knowledge graph anchors", () => {
  const source = readFileSync(join(root, "lib/intelligence-mock.ts"), "utf8");

  assert.equal(source.includes("MOCK_INTEL_SUMMARY"), true);
  assert.equal(source.includes("MOCK_INTEL_FEATURED_TOPICS"), true);
  assert.equal(source.includes("MOCK_INTEL_ACTORS"), true);
  assert.equal(source.includes("MOCK_INTEL_VULNERABILITIES"), true);
  assert.equal(source.includes("MOCK_INTEL_IOCS"), true);
  assert.equal(source.includes("MOCK_INTEL_INDUSTRY_ALERTS"), true);
  assert.equal(source.includes("MOCK_INTEL_REPORTS"), true);
});
