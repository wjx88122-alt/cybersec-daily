import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));
const INTELLIGENCE_COMPONENT_FILES = [
  "app/(executive)/intelligence/components/Topbar.tsx",
  "app/(executive)/intelligence/components/ExecutiveBrief.tsx",
  "app/(executive)/intelligence/components/WhatChanged.tsx",
  "app/(executive)/intelligence/components/ExposurePriorities.tsx",
  "app/(executive)/intelligence/components/AnalystDrilldown.tsx",
  "app/(executive)/intelligence/components/OpsExtensions.tsx",
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
    existsSync(join(root, "app/(executive)/intelligence/page.tsx")),
    true,
    "app/(executive)/intelligence/page.tsx should exist",
  );
});

test("route-local intelligence command center data file exists", () => {
  assert.equal(
    existsSync(join(root, "app/(executive)/intelligence/data.ts")),
    true,
    "app/(executive)/intelligence/data.ts should exist",
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
  const page = readFileSync(join(root, "app/(ops)/mdr/page.tsx"), "utf8");

  assert.equal(page.includes("/intelligence"), true);
  assert.equal(page.includes("情报中心"), true);
});

test("top nav contains a first-class intelligence entry", () => {
  const nav = readFileSync(join(root, "components/NavBar.tsx"), "utf8");

  assert.equal(nav.includes('label: "情报中心"'), true);
  assert.equal(nav.includes('href: "/intelligence"'), true);
});

test("Intelligence route composes the command-center page in the approved order", () => {
  const page = readFileSync(join(root, "app/(executive)/intelligence/page.tsx"), "utf8");
  const expectedImports = [
    'from "@/app/(executive)/intelligence/data"',
    'from "@/app/(executive)/intelligence/components/Topbar"',
    'from "@/app/(executive)/intelligence/components/ExecutiveBrief"',
    'from "@/app/(executive)/intelligence/components/WhatChanged"',
    'from "@/app/(executive)/intelligence/components/ExposurePriorities"',
    'from "@/app/(executive)/intelligence/components/AnalystDrilldown"',
    'from "@/app/(executive)/intelligence/components/OpsExtensions"',
  ];

  for (const importText of expectedImports) {
    assert.equal(page.includes(importText), true, `expected ${importText} in app/(executive)/intelligence/page.tsx`);
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
  const dataSource = readFileSync(join(root, "app/(executive)/intelligence/data.ts"), "utf8");
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

test("executive brief turns the KPI area into a filled posture snapshot", () => {
  const componentSource = readFileSync(
    join(root, "app/(executive)/intelligence/components/ExecutiveBrief.tsx"),
    "utf8",
  );
  const stylesheet = readFileSync(join(root, "app/styles/intelligence.css"), "utf8");

  for (const phrase of [
    "posture-followup",
    "signal-heatmap",
    "action-runway",
    "signal-meter",
  ]) {
    assert.equal(
      `${componentSource}\n${stylesheet}`.includes(phrase),
      true,
      `expected filled posture snapshot affordance ${phrase}`,
    );
  }

  assert.equal(
    componentSource.includes('className="why-this-matters"'),
    false,
    "the old detached lower band should not leave an empty gap below KPI cards",
  );
  assert.equal(
    componentSource.includes('className="panel priority-sequence"'),
    false,
    "the action matrix should live in the filled posture snapshot instead of repeating in the rail",
  );
});
