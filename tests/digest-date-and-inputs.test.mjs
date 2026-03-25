import assert from "node:assert/strict";
import test from "node:test";

const { getShanghaiDateStamp } = await import("../lib/date-stamp.ts");
const { buildDigestInputItems } = await import("../lib/digest-inputs.ts");

test("getShanghaiDateStamp uses Asia/Shanghai calendar day", () => {
  assert.equal(getShanghaiDateStamp("2026-03-25T15:59:59Z"), "2026-03-25");
  assert.equal(getShanghaiDateStamp("2026-03-25T16:00:00Z"), "2026-03-26");
});

test("buildDigestInputItems requires both security feed groups", () => {
  assert.throws(
    () => buildDigestInputItems(null, [], []),
    /feed-a and feed-b/,
  );
  assert.throws(
    () => buildDigestInputItems([], null, []),
    /feed-a and feed-b/,
  );
});

test("buildDigestInputItems merges and sorts all available feed items", () => {
  const items = buildDigestInputItems(
    [
      { id: "a1", pubDate: "2026-03-24T00:00:00Z" },
      { id: "a2", pubDate: "2026-03-26T00:00:00Z" },
    ],
    [{ id: "b1", pubDate: "2026-03-25T00:00:00Z" }],
    [{ id: "ai1", pubDate: "2026-03-23T00:00:00Z" }],
  );

  assert.deepEqual(
    items.map((item) => item.id),
    ["a2", "b1", "a1", "ai1"],
  );
});
