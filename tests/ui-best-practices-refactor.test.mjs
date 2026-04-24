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
