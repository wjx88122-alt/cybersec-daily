import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = "/Users/kissbye/Projects/cybersec-daily";

test("vercel.json keeps a single scheduled cron entry", () => {
  const config = JSON.parse(
    readFileSync(join(root, "vercel.json"), "utf8"),
  );

  assert.equal(Array.isArray(config.crons), true);
  assert.equal(config.crons.length, 1);
  assert.equal(config.crons[0]?.path, "/api/cron");
});

test("loadFeedCollection throws when any feed API responds with an error status", async () => {
  const { loadFeedCollection } = await import("../lib/feed-client.ts");

  const fetchStub = async (url) => ({
    ok: url !== "/api/feed-b",
    status: url === "/api/feed-b" ? 500 : 200,
    json: async () =>
      url === "/api/feed-b"
        ? { error: "Failed to fetch feeds" }
        : { items: [{ id: url, pubDate: "2026-03-25T00:00:00Z" }] },
  });

  await assert.rejects(
    () => loadFeedCollection(fetchStub, ["/api/feed-a", "/api/feed-b"]),
    /Feed request failed/,
  );
});

test("loadFeedCollection merges and sorts successful feed payloads", async () => {
  const { loadFeedCollection } = await import("../lib/feed-client.ts");

  const fetchStub = async (url) => ({
    ok: true,
    status: 200,
    json: async () => ({
      items:
        url === "/api/feed-a"
          ? [
              { id: "older", pubDate: "2026-03-24T00:00:00Z" },
              { id: "newest", pubDate: "2026-03-26T00:00:00Z" },
            ]
          : [{ id: "middle", pubDate: "2026-03-25T00:00:00Z" }],
    }),
  });

  const items = await loadFeedCollection(fetchStub, [
    "/api/feed-a",
    "/api/feed-b",
  ]);

  assert.deepEqual(
    items.map((item) => item.id),
    ["newest", "middle", "older"],
  );
});
