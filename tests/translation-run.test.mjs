import assert from "node:assert/strict";
import test from "node:test";

const { detectTranslationRunIssue } = await import("../lib/translation-run.ts");

test("detectTranslationRunIssue flags runs where every batch request failed", () => {
  const issue = detectTranslationRunIssue({
    queued: 24,
    batchesDone: 0,
    batchesFailed: 3,
    translated: 0,
  });

  assert.deepEqual(issue, {
    code: "all-batches-failed",
    message:
      "All translation batches failed before any item was translated. Check LLM provider keys and model settings in Vercel.",
  });
});

test("detectTranslationRunIssue flags runs with zero valid localized output", () => {
  const issue = detectTranslationRunIssue({
    queued: 20,
    batchesDone: 2,
    batchesFailed: 0,
    translated: 0,
  });

  assert.deepEqual(issue, {
    code: "no-valid-translations",
    message:
      "Translation requests completed but produced no valid Chinese localized fields.",
  });
});

test("detectTranslationRunIssue returns null when translation made progress", () => {
  const issue = detectTranslationRunIssue({
    queued: 20,
    batchesDone: 1,
    batchesFailed: 1,
    translated: 6,
  });

  assert.equal(issue, null);
});

test("detectTranslationRunIssue returns null when nothing was queued", () => {
  const issue = detectTranslationRunIssue({
    queued: 0,
    batchesDone: 0,
    batchesFailed: 0,
    translated: 0,
  });

  assert.equal(issue, null);
});
