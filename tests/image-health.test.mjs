import assert from "node:assert/strict";
import test from "node:test";

const { triggerImageRepairIfNeeded } = await import("../lib/image-health.ts");

function recentIso(now, deltaMs = 60_000) {
  return new Date(now - deltaMs).toISOString();
}

test("triggerImageRepairIfNeeded triggers image repair when recent items are missing images", async () => {
  const now = Date.now();
  const calls = [];
  const repairCalls = [];

  const result = await triggerImageRepairIfNeeded({
    items: [
      {
        id: "x1",
        pubDate: recentIso(now),
        image: undefined,
      },
    ],
    source: "feed-a:read",
    reason: "public-feed-read",
    now,
    lockStore: {
      async set(key, value, options) {
        calls.push({ key, value, options });
        return "OK";
      },
    },
    runRepair: async (scope) => {
      repairCalls.push(scope);
      return { ok: true, status: 200, imagesFound: 7 };
    },
  });

  assert.equal(calls.length, 1);
  assert.deepEqual(repairCalls, ["recent"]);
  assert.deepEqual(result, {
    triggered: true,
    accepted: true,
    recentMissingImages: 1,
    resultStatus: 200,
    imagesFound: 7,
    error: null,
  });
});

test("triggerImageRepairIfNeeded does not trigger when lock is not acquired", async () => {
  const now = Date.now();
  let repairCount = 0;

  const result = await triggerImageRepairIfNeeded({
    items: [
      {
        id: "x2",
        pubDate: recentIso(now),
        image: undefined,
      },
    ],
    source: "feed-b:read",
    now,
    lockStore: {
      async set() {
        return null;
      },
    },
    runRepair: async () => {
      repairCount++;
      return { ok: true, status: 200, imagesFound: 0 };
    },
  });

  assert.equal(repairCount, 0);
  assert.deepEqual(result, {
    triggered: false,
    accepted: false,
    recentMissingImages: 1,
  });
});

test("triggerImageRepairIfNeeded does not trigger when recent items already have images", async () => {
  const now = Date.now();
  let setCount = 0;
  let repairCount = 0;

  const result = await triggerImageRepairIfNeeded({
    items: [
      {
        id: "x3",
        pubDate: recentIso(now),
        image: "https://cdn.example.com/a.jpg",
      },
    ],
    source: "feed-ai:read",
    now,
    lockStore: {
      async set() {
        setCount++;
        return "OK";
      },
    },
    runRepair: async () => {
      repairCount++;
      return { ok: true, status: 200, imagesFound: 0 };
    },
  });

  assert.equal(setCount, 0);
  assert.equal(repairCount, 0);
  assert.deepEqual(result, {
    triggered: false,
    accepted: false,
    recentMissingImages: 0,
  });
});
