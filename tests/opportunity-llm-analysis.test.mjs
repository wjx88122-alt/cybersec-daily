import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const load = (path) => readFileSync(join(root, path), "utf8");
let helpers;
try {
  helpers = await import("../lib/opportunity-analysis.ts");
} catch {}

test("digest prompt and types include board analysis contract", () => {
  const source = load("lib/digest.ts");
  for (const phrase of ["boardAnalysis", "hotSegments", "portfolioMoves", "跨条目"]) {
    assert.equal(source.includes(phrase), true, phrase);
  }
});

test("opportunity analysis cache key and headline lookup are stable", () => {
  if (!helpers) {
    const source = load("lib/opportunity-analysis.ts");
    for (const phrase of ["createHash(\"sha256\")", "`opp-analysis:${dateStamp}:${hash}`", ".slice(0, 16)", "item.headline.trim() === target"]) assert.equal(source.includes(phrase), true, phrase);
    return;
  }
  const { findDigestItemByHeadline, opportunityAnalysisCacheKey } = helpers;
  const first = opportunityAnalysisCacheKey("云安全升温", "2026-07-03");
  assert.equal(first, opportunityAnalysisCacheKey("云安全升温", "2026-07-03"));
  assert.notEqual(first, opportunityAnalysisCacheKey("身份治理升温", "2026-07-03"));
  assert.match(first, /^opp-analysis:2026-07-03:[a-f0-9]{16}$/);

  const item = { headline: "云安全升温", summary: "summary", importance: "medium", category: "云安全", sourceTitle: "source", sourceLink: "https://example.com" };
  const digest = { date: "2026-07-03", overview: "", items: [item] };
  assert.equal(findDigestItemByHeadline(digest, " 云安全升温 "), item);
  assert.equal(findDigestItemByHeadline(digest, "身份治理升温"), null);
  assert.equal(findDigestItemByHeadline(null, "云安全升温"), null);
});

test("opportunity analysis route keeps server-side guardrails", () => {
  const source = load("app/api/opportunity-analysis/route.ts");
  for (const phrase of ["readDigestFromStore", "429", "404", "OPPORTUNITY_ANALYSIS_DAILY_LIMIT", "maxDuration"]) {
    assert.equal(source.includes(phrase), true, phrase);
  }
  assert.equal(source.includes("dangerouslySetInnerHTML"), false);
});

test("digest card exposes deep analysis without wrapping the whole card link", () => {
  const source = load("components/DigestCard.tsx");
  for (const phrase of ['"use client"', "深度分析", "分析中"]) {
    assert.equal(source.includes(phrase), true, phrase);
  }
  assert.equal(source.includes("return (\n    <div"), true);
  assert.equal(source.includes("return (\n    <a"), false);
});

test("feed landing client wires board analysis panel", () => {
  const source = load("components/feed/FeedLandingClient.tsx");
  assert.equal(source.includes("AI 综合分析"), true);
  assert.equal(source.includes("digestBoardAnalysis"), true);
});
