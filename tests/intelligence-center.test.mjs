import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));
const INTELLIGENCE_COMPONENT_FILES = [
  "app/intelligence/components/Topbar.tsx",
  "app/intelligence/components/ExecutiveBrief.tsx",
  "app/intelligence/components/WhatChanged.tsx",
  "app/intelligence/components/ExposurePriorities.tsx",
  "app/intelligence/components/AnalystDrilldown.tsx",
  "app/intelligence/components/OpsExtensions.tsx",
];

const ROUTE_COMPONENT_ORDER = [
  "Topbar",
  "ExecutiveBrief",
  "WhatChanged",
  "ExposurePriorities",
  "AnalystDrilldown",
  "OpsExtensions",
];

const RETIRED_PHRASES = [
  "威胁组织库",
  "漏洞专题",
  "IOC 情报库",
  "行业预警",
  "报告与订阅",
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

test("route-local intelligence command center components exist", () => {
  for (const relativePath of INTELLIGENCE_COMPONENT_FILES) {
    assert.equal(
      existsSync(join(root, relativePath)),
      true,
      `${relativePath} should exist`,
    );
  }
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

test("Intelligence route composes the command-center page in the approved order", () => {
  const page = readFileSync(join(root, "app/intelligence/page.tsx"), "utf8");
  const expectedImports = [
    'from "@/app/intelligence/data"',
    'from "@/app/intelligence/components/Topbar"',
    'from "@/app/intelligence/components/ExecutiveBrief"',
    'from "@/app/intelligence/components/WhatChanged"',
    'from "@/app/intelligence/components/ExposurePriorities"',
    'from "@/app/intelligence/components/AnalystDrilldown"',
    'from "@/app/intelligence/components/OpsExtensions"',
  ];

  for (const importText of expectedImports) {
    assert.equal(page.includes(importText), true, `expected ${importText} in app/intelligence/page.tsx`);
  }

  const orderedPositions = ROUTE_COMPONENT_ORDER.map((componentName) =>
    page.indexOf(`<${componentName}`),
  );
  orderedPositions.forEach((position, index) => {
    assert.equal(position >= 0, true, `expected ${ROUTE_COMPONENT_ORDER[index]} to exist`);
  });
  for (let index = 1; index < orderedPositions.length; index += 1) {
    assert.equal(
      orderedPositions[index - 1] < orderedPositions[index],
      true,
      `${ROUTE_COMPONENT_ORDER[index - 1]} should appear before ${ROUTE_COMPONENT_ORDER[index]}`,
    );
  }

  assert.equal(page.includes("intelligence-command-center"), true);
  assert.equal(page.includes("homepage-shell"), true);
});

test("command-center component files expose the new homepage domains and retire the old portal taxonomy", () => {
  const componentSource = INTELLIGENCE_COMPONENT_FILES
    .filter((relativePath) => existsSync(join(root, relativePath)))
    .map((relativePath) => readFileSync(join(root, relativePath), "utf8"))
    .join("\n");
  const dataSource = readFileSync(join(root, "app/intelligence/data.ts"), "utf8");
  const combinedSource = `${componentSource}\n${dataSource}`;

  for (const phrase of [
    "组织威胁态势",
    "今日需要决策",
    "重点攻击活动",
    "资产暴露与漏洞优先级",
    "实体关联图谱",
    "狩猎与研判工作台",
    "自动化响应剧本",
    "统一结论分",
    "协作对象与复用上下文",
    "标准化情报接入层",
    "威胁到检测内容流水线",
    "证据可追溯 AI 总结",
  ]) {
    assert.equal(combinedSource.includes(phrase), true, `expected phrase ${phrase} in intelligence route assets`);
  }

  for (const phrase of RETIRED_PHRASES) {
    assert.equal(combinedSource.includes(phrase), false, `did not expect retired phrase ${phrase}`);
  }
});
