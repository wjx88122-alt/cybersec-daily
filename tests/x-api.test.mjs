import assert from "node:assert/strict";
import test from "node:test";

import {
  buildXPostUrl,
  fetchXUserPosts,
  getXBearerToken,
  isXApiReady,
  summarizeXPostText,
} from "../lib/x-api.ts";

test("getXBearerToken prefers X_BEARER_TOKEN over legacy Twitter variable", () => {
  process.env.X_BEARER_TOKEN = " official-token ";
  process.env.TWITTER_BEARER_TOKEN = "legacy-token";

  assert.equal(getXBearerToken(), "official-token");
  assert.equal(isXApiReady(), true);

  delete process.env.X_BEARER_TOKEN;
  delete process.env.TWITTER_BEARER_TOKEN;
  assert.equal(getXBearerToken(), "");
  assert.equal(isXApiReady(), false);
});

test("fetchXUserPosts uses official X API bearer auth and timeline endpoint", async () => {
  process.env.X_BEARER_TOKEN = "test-token";
  const calls = [];
  const fetchStub = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("/users/by/username/SwiftOnSecurity")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: { id: "12345", username: "SwiftOnSecurity" } }),
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            id: "999",
            text: "Patch your systems.\n\nDetails: https://example.com",
            created_at: "2026-06-26T01:02:03.000Z",
          },
        ],
      }),
    };
  };

  const posts = await fetchXUserPosts("@SwiftOnSecurity", {
    fetchFn: fetchStub,
    maxResults: 12,
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[0].init.headers.authorization, "Bearer test-token");
  assert.match(calls[0].url, /^https:\/\/api\.x\.com\/2\/users\/by\/username\/SwiftOnSecurity/);
  assert.match(calls[1].url, /^https:\/\/api\.x\.com\/2\/users\/12345\/tweets/);
  assert.match(calls[1].url, /max_results=12/);
  assert.match(calls[1].url, /tweet\.fields=created_at%2Centities%2Clang%2Cpublic_metrics/);
  assert.deepEqual(posts, [
    {
      id: "999",
      text: "Patch your systems.\n\nDetails: https://example.com",
      createdAt: "2026-06-26T01:02:03.000Z",
    },
  ]);

  delete process.env.X_BEARER_TOKEN;
});

test("buildXPostUrl strips leading at sign from handle", () => {
  assert.equal(
    buildXPostUrl("@briankrebs", "123"),
    "https://x.com/briankrebs/status/123",
  );
});

test("summarizeXPostText returns compact single-line title text", () => {
  assert.equal(
    summarizeXPostText("  first line\n\nsecond line  ", 30),
    "first line second line",
  );
  assert.equal(
    summarizeXPostText("a".repeat(40), 12),
    "aaaaaaaaa...",
  );
});
