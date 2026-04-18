import assert from "node:assert/strict";
import test from "node:test";

const { triggerImageRepairIfNeeded } = await import("../lib/image-health.ts");

function recentIso(now, deltaMs = 60_000) {
  return new Date(now - deltaMs).toISOString();
}

test("triggerImageRepairIfNeeded triggers image repair when recent items are missing images", async () => {
  const now = Date.now();
  const calls = [];
  const fetchCalls = [];

  const result = await triggerImageRepairIfNeeded({
    items: [
      {
        id: "x1",
        pubDate: recentIso(now),
        image: undefined,
      },
    ],
    appBaseUrl: "https://example.com",
    source: "feed-a:read",
    reason: "public-feed-read",
    authToken: "secret",
    now,
    lockStore: {
      async set(key, value, options) {
        calls.push({ key, value, options });
        return "OK";
      },
    },
    fetchImpl: async (url, init) => {
      fetchCalls.push({ url, init });
      return {
        status: 200,
        async json() {
          return { ok: true, imagesFound: 7 };
        },
      };
    },
  });

  assert.equal(calls.length, 1);
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].url.includes("/api/images"), true);
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
  let fetchCount = 0;

  const result = await triggerImageRepairIfNeeded({
    items: [
      {
        id: "x2",
        pubDate: recentIso(now),
        image: undefined,
      },
    ],
    appBaseUrl: "https://example.com",
    source: "feed-b:read",
    authToken: "secret",
    now,
    lockStore: {
      async set() {
        return null;
      },
    },
    fetchImpl: async () => {
      fetchCount++;
      return {
        status: 200,
        async json() {
          return {};
        },
      };
    },
  });

  assert.equal(fetchCount, 0);
  assert.deepEqual(result, {
    triggered: false,
    accepted: false,
    recentMissingImages: 1,
  });
});

test("triggerImageRepairIfNeeded does not trigger when recent items already have images", async () => {
  const now = Date.now();
  let setCount = 0;
  let fetchCount = 0;

  const result = await triggerImageRepairIfNeeded({
    items: [
      {
        id: "x3",
        pubDate: recentIso(now),
        image: "https://cdn.example.com/a.jpg",
      },
    ],
    appBaseUrl: "https://example.com",
    source: "feed-ai:read",
    authToken: "secret",
    now,
    lockStore: {
      async set() {
        setCount++;
        return "OK";
      },
    },
    fetchImpl: async () => {
      fetchCount++;
      return {
        status: 200,
        async json() {
          return {};
        },
      };
    },
  });

  assert.equal(setCount, 0);
  assert.equal(fetchCount, 0);
  assert.deepEqual(result, {
    triggered: false,
    accepted: false,
    recentMissingImages: 0,
  });
});
