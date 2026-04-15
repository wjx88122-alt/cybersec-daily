import assert from "node:assert/strict";
import test from "node:test";

const { normalizeFeedPubDate, resolveFeedRefresh, mergeFeedItems } = await import(
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

test("mergeFeedItems preserves cached timestamps when fresh items lose pubDate", () => {
  const merged = mergeFeedItems(
    [
      {
        id: "same",
        title: "Old title",
        link: "https://example.com/post",
        summary: "Old summary",
        source: "Example",
        category: "综合资讯",
        pubDate: "",
      },
    ],
    [
      {
        id: "same",
        title: "Old title",
        link: "https://example.com/post",
        summary: "Old summary",
        source: "Example",
        category: "综合资讯",
        pubDate: "2026-03-24T00:00:00.000Z",
        image: "https://cdn.example.com/old.png",
        titleZh: "旧标题",
        summaryZh: "旧摘要",
        summaryAi: "旧AI摘要",
      },
    ],
  );

  assert.deepEqual(merged, [
    {
      id: "same",
      title: "Old title",
      link: "https://example.com/post",
      summary: "Old summary",
      source: "Example",
      category: "综合资讯",
      pubDate: "2026-03-24T00:00:00.000Z",
      image: "https://cdn.example.com/old.png",
      titleZh: "旧标题",
      summaryZh: "旧摘要",
      summaryAi: "旧AI摘要",
    },
  ]);
});

test("mergeFeedItems drops stale translated fields when source title or summary changes", () => {
  const merged = mergeFeedItems(
    [
      {
        id: "same",
        title: "Fresh title",
        link: "https://example.com/post",
        summary: "Fresh summary",
        source: "Example",
        category: "综合资讯",
        pubDate: "2026-03-25T00:00:00.000Z",
      },
    ],
    [
      {
        id: "same",
        title: "Old title",
        link: "https://example.com/post",
        summary: "Old summary",
        source: "Example",
        category: "综合资讯",
        pubDate: "2026-03-24T00:00:00.000Z",
        image: "https://cdn.example.com/old.png",
        titleZh: "旧标题",
        summaryZh: "旧摘要",
        summaryAi: "旧AI摘要",
      },
    ],
  );

  assert.deepEqual(merged, [
    {
      id: "same",
      title: "Fresh title",
      link: "https://example.com/post",
      summary: "Fresh summary",
      source: "Example",
      category: "综合资讯",
      pubDate: "2026-03-25T00:00:00.000Z",
      image: "https://cdn.example.com/old.png",
      titleZh: undefined,
      summaryZh: undefined,
      summaryAi: undefined,
    },
  ]);
});
