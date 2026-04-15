import assert from "node:assert/strict";
import test from "node:test";

const { clearTranslatedFieldsForRetranslation } = await import(
  "../lib/translation-repair.ts"
);

test("clearTranslatedFieldsForRetranslation clears recent translated fields for english items", () => {
  const now = Date.now();
  const recentIso = new Date(now - 60_000).toISOString();

  const { items, clearedItems, clearedFields } = clearTranslatedFieldsForRetranslation(
    [
      {
        id: "recent-en",
        title: "English headline",
        summary: "English summary",
        titleZh: "旧标题",
        summaryZh: "旧摘要",
        summaryAi: "旧AI摘要",
        pubDate: recentIso,
      },
    ],
    { scope: "recent", now },
  );

  assert.equal(clearedItems, 1);
  assert.equal(clearedFields, 3);
  assert.deepEqual(items, [
    {
      id: "recent-en",
      title: "English headline",
      summary: "English summary",
      titleZh: undefined,
      summaryZh: undefined,
      summaryAi: undefined,
      pubDate: recentIso,
    },
  ]);
});

test("clearTranslatedFieldsForRetranslation keeps older english items when scope is recent", () => {
  const now = Date.now();
  const oldIso = new Date(now - 25 * 60 * 60 * 1000).toISOString();

  const { items, clearedItems, clearedFields } = clearTranslatedFieldsForRetranslation(
    [
      {
        id: "old-en",
        title: "Old English headline",
        summary: "Old English summary",
        titleZh: "旧标题",
        summaryZh: "旧摘要",
        summaryAi: "旧AI摘要",
        pubDate: oldIso,
      },
    ],
    { scope: "recent", now },
  );

  assert.equal(clearedItems, 0);
  assert.equal(clearedFields, 0);
  assert.equal(items[0].titleZh, "旧标题");
  assert.equal(items[0].summaryZh, "旧摘要");
  assert.equal(items[0].summaryAi, "旧AI摘要");
});

test("clearTranslatedFieldsForRetranslation keeps chinese-source items intact", () => {
  const now = Date.now();
  const recentIso = new Date(now - 60_000).toISOString();

  const { items, clearedItems, clearedFields } = clearTranslatedFieldsForRetranslation(
    [
      {
        id: "recent-zh",
        title: "中文标题",
        summary: "中文摘要",
        titleZh: "中文标题",
        summaryZh: "中文摘要",
        summaryAi: undefined,
        pubDate: recentIso,
      },
    ],
    { scope: "all", now },
  );

  assert.equal(clearedItems, 0);
  assert.equal(clearedFields, 0);
  assert.equal(items[0].titleZh, "中文标题");
  assert.equal(items[0].summaryZh, "中文摘要");
});
