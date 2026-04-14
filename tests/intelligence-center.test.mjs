import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));
const HOMEPAGE_REQUIRED_CLASSES = [
  "homepage-shell",
  "executive-brief",
  "brief-hero",
  "decision-rail",
  "posture-snapshot",
  "what-changed",
  "exposure-priorities",
  "analyst-drilldown",
];

const HOMEPAGE_PHRASES = [
  "组织威胁态势",
  "今日需要决策",
  "重点攻击活动",
  "资产暴露与漏洞优先级",
  "实体关联图谱",
  "狩猎与研判工作台",
  "自动化响应剧本",
];

const RETIRED_PHRASES = [
  "威胁组织库",
  "漏洞专题",
  "IOC 情报库",
  "行业预警",
  "报告与订阅",
];

const HOMEPAGE_ORDERED_CLASSES = [
  "homepage-shell",
  "executive-brief",
  "what-changed",
  "exposure-priorities",
  "analyst-drilldown",
];

test("top-level intelligence route exists", () => {
  assert.equal(
    existsSync(join(root, "app/intelligence/page.tsx")),
    true,
    "app/intelligence/page.tsx should exist",
  );
});

test("route-local intelligence command center data file exists", () => {
  assert.equal(
    existsSync(join(root, "app/intelligence/data.ts")),
    true,
    "app/intelligence/data.ts should exist",
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

test("Intelligence Center route exposes the command-center homepage contract", () => {
  const page = readFileSync(join(root, "app/intelligence/page.tsx"), "utf8");

  for (const className of HOMEPAGE_REQUIRED_CLASSES) {
    assert.equal(page.includes(className), true, `expected ${className} in app/intelligence/page.tsx`);
  }

  for (const phrase of HOMEPAGE_PHRASES) {
    assert.equal(page.includes(phrase), true, `expected phrase ${phrase} in app/intelligence/page.tsx`);
  }

  for (const phrase of RETIRED_PHRASES) {
    assert.equal(page.includes(phrase), false, `did not expect retired phrase ${phrase}`);
  }

  const orderedPositions = HOMEPAGE_ORDERED_CLASSES.map((className) => page.indexOf(className));
  orderedPositions.forEach((position, index) => {
    assert.equal(position >= 0, true, `expected ${HOMEPAGE_ORDERED_CLASSES[index]} to exist`);
  });
  for (let index = 1; index < orderedPositions.length; index += 1) {
    assert.equal(
      orderedPositions[index - 1] < orderedPositions[index],
      true,
      `${HOMEPAGE_ORDERED_CLASSES[index - 1]} should appear before ${HOMEPAGE_ORDERED_CLASSES[index]}`,
    );
  }
});
