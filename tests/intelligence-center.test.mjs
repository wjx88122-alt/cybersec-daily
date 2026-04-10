import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root =
  "/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/intelligence-center";

test("Intelligence MDR route exists", () => {
  assert.equal(
    existsSync(join(root, "app/mdr/intelligence/page.tsx")),
    true,
    "app/mdr/intelligence/page.tsx should exist",
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

  assert.equal(page.includes("/mdr/intelligence"), true);
  assert.equal(page.includes("情报中心"), true);
});

test("Intelligence Center page exposes the main knowledge domains", () => {
  const page = readFileSync(join(root, "app/mdr/intelligence/page.tsx"), "utf8");

  assert.equal(page.includes("威胁组织库"), true);
  assert.equal(page.includes("漏洞专题"), true);
  assert.equal(page.includes("IOC 情报库"), true);
  assert.equal(page.includes("行业预警"), true);
  assert.equal(page.includes("报告与订阅"), true);
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
