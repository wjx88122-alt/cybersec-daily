import assert from "node:assert/strict";
import test from "node:test";

const { normalizeFeedPubDate, resolveFeedRefresh } = await import(
  "../lib/feed-refresh.ts"
);

test("normalizeFeedPubDate keeps valid timestamps in ISO format", () => {
  assert.equal(
    normalizeFeedPubDate("2026-03-25T01:02:03Z"),
    "2026-03-25T01:02:03.000Z",
  );
});

test("normalizeFeedPubDate does not turn invalid dates into now", () => {
  assert.equal(normalizeFeedPubDate("not-a-date"), "");
  assert.equal(normalizeFeedPubDate(undefined), "");
});

test("resolveFeedRefresh keeps previous cache when all sources failed", () => {
  const previous = [{ id: "cached" }];
  const resolved = resolveFeedRefresh(
    { items: [], succeededSources: 0, failedSources: 12 },
    previous,
  );

  assert.deepEqual(resolved, { items: previous, stale: true });
});

test("resolveFeedRefresh throws when all sources failed and no cache exists", () => {
  assert.throws(
    () =>
      resolveFeedRefresh(
        { items: [], succeededSources: 0, failedSources: 5 },
        [],
      ),
    /All feed sources failed/,
  );
});

test("resolveFeedRefresh accepts empty fresh results when at least one source succeeded", () => {
  const resolved = resolveFeedRefresh(
    { items: [], succeededSources: 1, failedSources: 4 },
    [{ id: "cached" }],
  );

  assert.deepEqual(resolved, { items: [], stale: false });
});
