import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
const root = process.cwd();
const load = (path) => readFileSync(join(root, path), "utf8");
const { buildFeedLandingState } = await import("../lib/feed-view-model.js");
const feedItem = { id: "market-1", title: "Market story", summary: "Market summary", pubDate: "2026-07-03T00:00:00.000Z", category: "综合资讯", source: "Example", link: "https://example.com/market" };
const stateFromOverview = (digestOverview) => buildFeedLandingState([feedItem], { category: "全部", search: "", now: Date.parse("2026-07-03T02:00:00.000Z"), digestOverview });
test("digest prompt contains market opportunity contract", () => {
  const source = load("lib/digest.ts");
  for (const phrase of ["机会判断", "机会信号", "竞争与格局", "布局建议", "opportunityType", "首席市场情报官"]) assert.equal(source.includes(phrase), true, phrase);
});
test("new opportunity overview labels parse into typed sections", () => {
  const state = stateFromOverview("机会判断：AI 安全预算窗口打开。\n机会信号：\n1. 客户开始询问 Agent 权限治理。\n竞争与格局：\n- 竞品发布 AI-SPM 套件。\n布局建议：\n- 立项评估 Agent 安全能力。");
  assert.equal(state.heroSummary.judgmentLabel, "机会判断");
  assert.deepEqual(state.heroSummary.sections.map((section) => section.intent), ["signal", "impact", "action"]);
});
test("legacy industry overview labels still parse", () => {
  const state = stateFromOverview("产业判断：边界与身份治理升温。\n产业信号：\n1. 边界漏洞推动需求。\n市场影响：\n- ASM 和身份治理受益。\n关注方向：\n- 观察厂商路线图。");
  assert.equal(state.heroSummary.judgmentLabel, "产业判断");
  assert.deepEqual(state.heroSummary.sections.map((section) => section.label), ["产业信号", "市场影响", "关注方向"]);
});
test("digest card source exposes opportunity labels and action copy", () => {
  const source = load("components/DigestCard.tsx");
  for (const phrase of ["优先布局", "重点评估", "持续观察", "建议动作"]) assert.equal(source.includes(phrase), true, phrase);
});
test("public page and feeds expose market opportunity language", () => {
  assert.equal(load("app/(public)/page.tsx").includes("市场机会") && load("lib/feeds.ts").includes("市场与资本"), true);
});
