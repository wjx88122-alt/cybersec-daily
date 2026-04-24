import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildFeedLandingState } from "../lib/feed-view-model.js";

const root = process.cwd();

function load(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

test("feed landing falls back to the most recent available items when 24-hour scope is empty", () => {
  const now = Date.parse("2026-04-23T12:00:00.000Z");
  const items = [
    {
      id: "older-security-1",
      title: "Older but still relevant",
      titleZh: "较早但仍相关",
      summary: "Older summary",
      summaryZh: "较早摘要",
      summaryAi: "",
      pubDate: "2026-04-21T20:00:00.000Z",
      category: "综合资讯",
      source: "Example",
      link: "https://example.com/1",
    },
  ];

  const state = buildFeedLandingState(items, {
    category: "全部",
    search: "",
    now,
  });

  assert.equal(state.isFallback, true);
  assert.equal(state.scopeLabel, "最近可用");
  assert.deepEqual(
    state.filtered.map((item) => item.id),
    ["older-security-1"],
  );
});

test("feed landing keeps the 24-hour scope when fresh items exist", () => {
  const now = Date.parse("2026-04-23T12:00:00.000Z");
  const items = [
    {
      id: "fresh-security-1",
      title: "Fresh story",
      titleZh: "最新文章",
      summary: "Fresh summary",
      summaryZh: "最新摘要",
      summaryAi: "",
      pubDate: "2026-04-23T09:00:00.000Z",
      category: "综合资讯",
      source: "Example",
      link: "https://example.com/fresh",
    },
    {
      id: "older-security-1",
      title: "Older story",
      titleZh: "较早文章",
      summary: "Older summary",
      summaryZh: "较早摘要",
      summaryAi: "",
      pubDate: "2026-04-21T20:00:00.000Z",
      category: "综合资讯",
      source: "Example",
      link: "https://example.com/older",
    },
  ];

  const state = buildFeedLandingState(items, {
    category: "全部",
    search: "",
    now,
  });

  assert.equal(state.isFallback, false);
  assert.equal(state.scopeLabel, "过去 24 小时");
  assert.deepEqual(
    state.filtered.map((item) => item.id),
    ["fresh-security-1"],
  );
});

test("feed landing hero summary uses cached digest overview when available", () => {
  const now = Date.parse("2026-04-23T12:00:00.000Z");
  const state = buildFeedLandingState(
    [
      {
        id: "fresh-security-1",
        title: "Fresh story",
        titleZh: "边界设备漏洞被利用",
        summary: "Fresh summary",
        summaryZh: "边界设备存在被利用风险。",
        summaryAi: "",
        pubDate: "2026-04-23T09:00:00.000Z",
        category: "漏洞预警",
        source: "Example",
        link: "https://example.com/fresh",
      },
    ],
    {
      category: "全部",
      search: "",
      now,
      digestOverview:
        "今日重点是边界漏洞、凭据风险和勒索活动的连续升温。建议先查看可被利用漏洞与远程访问资产，再复核备份和身份策略。",
    },
  );

  assert.equal(state.heroSummary.sourceLabel, "LLM 基于当前日报生成");
  assert.equal(
    state.heroSummary.title,
    "今日重点是边界漏洞、凭据风险和勒索活动的连续升温。",
  );
  assert.equal(
    state.heroSummary.body,
    "建议先查看可被利用漏洞与远程访问资产，再复核备份和身份策略。",
  );
});

test("feed landing hero summary falls back to current filtered items", () => {
  const now = Date.parse("2026-04-23T12:00:00.000Z");
  const state = buildFeedLandingState(
    [
      {
        id: "fresh-security-1",
        title: "Fresh story",
        titleZh: "边界设备漏洞被利用",
        summary: "Fresh summary",
        summaryZh: "边界设备存在被利用风险。",
        summaryAi: "",
        pubDate: "2026-04-23T09:00:00.000Z",
        category: "漏洞预警",
        source: "Example",
        link: "https://example.com/fresh",
      },
      {
        id: "fresh-security-2",
        title: "Credential phishing expands",
        titleZh: "凭据钓鱼活动扩散",
        summary: "Threat actors expand credential phishing.",
        summaryZh: "攻击者扩大凭据钓鱼活动。",
        summaryAi: "",
        pubDate: "2026-04-23T08:00:00.000Z",
        category: "威胁情报",
        source: "Example",
        link: "https://example.com/credential",
      },
    ],
    {
      category: "漏洞预警",
      search: "",
      now,
      digestOverview: "",
    },
  );

  assert.equal(state.heroSummary.sourceLabel, "基于当前列表生成");
  assert.equal(state.heroSummary.title, "当前先看 1 条过去 24 小时安全资讯。");
  assert.equal(
    state.heroSummary.body,
    "当前列表集中在漏洞预警。最新焦点是“边界设备漏洞被利用”。建议先看焦点卡片，再用分类和搜索补充细节。",
  );
});

test("category filter keeps the base system pill shell off the active branch", () => {
  const source = load("components/CategoryFilter.tsx");

  assert.equal(source.includes('className={`system-pill'), false);
  assert.equal(source.includes(': `system-pill '), true);
});

test("public stylesheet stays scoped to public surfaces", () => {
  const source = load("app/styles/public.css");

  assert.equal(source.includes(".glass,"), false);
  assert.equal(source.includes(".team-card"), false);
  assert.equal(source.includes(".mdr-board-card"), false);
});

test("intelligence stylesheet keeps one theme block and uses intel token names consistently", () => {
  const source = load("app/styles/intelligence.css");
  const themeBlockCount = (source.match(/\.intelligence-command-center \{/g) ?? []).length;

  assert.equal(themeBlockCount, 1);
  assert.equal(source.includes("var(--text-"), false);
  assert.equal(source.includes("var(--cyan)"), false);
});

test("team overview grid aligns hero cards to content height instead of stretching them", () => {
  const source = load("app/(executive)/team/page.tsx");

  assert.equal(source.includes("lg:items-start"), true);
});
