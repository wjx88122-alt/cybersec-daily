import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();

function load(relativePath) {
  return readFileSync(join(projectRoot, relativePath), "utf8");
}

test("security page keeps key UI labels in Chinese", () => {
  const page = load("app/(public)/page.tsx");

  assert.ok(page.includes("安全日报"));
  assert.ok(page.includes("今日概览"));
  assert.ok(page.includes("今日简报"));
  assert.ok(page.includes("更多资讯"));

  assert.equal(page.includes("Security Daily"), false);
  assert.equal(page.includes("Daily Snapshot"), false);
  assert.equal(page.includes("Today’s Briefing"), false);
  assert.equal(page.includes("More Stories"), false);
});

test("ai page keeps key UI labels in Chinese", () => {
  const page = load("app/(public)/ai/page.tsx");

  assert.ok(page.includes("AI 安全"));
  assert.ok(page.includes("AI 安全概览"));
  assert.ok(page.includes("今日焦点"));
  assert.ok(page.includes("更多资讯"));

  assert.equal(page.includes("AI Watch"), false);
  assert.equal(page.includes("AI Snapshot"), false);
  assert.equal(page.includes("Today’s Focus"), false);
  assert.equal(page.includes("More Stories"), false);
});
