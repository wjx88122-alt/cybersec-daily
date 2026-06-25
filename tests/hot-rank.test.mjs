import assert from "node:assert/strict";
import test from "node:test";

const now = Date.now();
const mins = (m) => new Date(now - m * 60_000).toISOString();

/** 构造 FeedItem，便于测试。 */
function mk(o) {
  return {
    id: o.id,
    title: o.title,
    link: o.link || `https://src/${o.id}`,
    summary: o.summary || "",
    source: o.source,
    category: o.category || "综合资讯",
    pubDate: o.pubDate || mins(30),
    titleZh: o.titleZh,
    summaryZh: o.summaryZh,
    summaryAi: o.summaryAi,
  };
}

test("clusterItems merges same-CVE items from different sources into one cluster", async () => {
  const { clusterItems } = await import("../lib/hot-rank.ts");

  const items = [
    mk({
      id: "1",
      title: "Critical CVE-2026-1234 in Fortinet allows RCE",
      source: "The Hacker News",
    }),
    mk({
      id: "2",
      title: "Fortinet patches actively exploited zero-day CVE-2026-1234",
      source: "Bleeping Computer",
    }),
    mk({
      id: "3",
      title: "Fortinet 零日漏洞 CVE-2026-1234 被在野利用",
      source: "SecurityWeek",
    }),
  ];

  const clusters = clusterItems(items);
  assert.equal(clusters.length, 1, "three CVE reports must merge into one cluster");
  assert.equal(clusters[0].length, 3, "cluster must contain all three members");
});

test("clusterItems keeps unrelated stories as separate clusters", async () => {
  const { clusterItems } = await import("../lib/hot-rank.ts");

  const items = [
    mk({ id: "a", title: "LockBit ransomware hits healthcare", source: "Dark Reading" }),
    mk({ id: "b", title: "New web framework for developers released", source: "TechCrunch" }),
  ];

  const clusters = clusterItems(items);
  assert.equal(clusters.length, 2, "unrelated stories must stay separate");
});

test("rankHotItems ranks a multi-source CVE cluster above single-source items", async () => {
  const { rankHotItems } = await import("../lib/hot-rank.ts");

  const items = [
    mk({
      id: "cve1",
      title: "Critical CVE-2026-9999 in Cisco allows RCE",
      source: "The Hacker News",
      pubDate: mins(20),
    }),
    mk({
      id: "cve2",
      title: "Cisco patches exploited zero-day CVE-2026-9999",
      source: "Bleeping Computer",
      pubDate: mins(60),
    }),
    mk({
      id: "solo",
      title: "Minor vendor product update announcement",
      source: "Vendor Blog",
      pubDate: mins(10),
    }),
  ];

  const ranked = rankHotItems(items, 24);
  assert.equal(ranked[0].title.includes("CVE-2026-9999"), true, "CVE cluster must rank #1");
  assert.equal(ranked[0].coverageCount, 2, "CVE cluster must report 2 sources");
  assert.ok(
    ranked[0].score > ranked.find((r) => r.id === "solo").score,
    "multi-source cluster must out-score the single-source item",
  );
});

test("rankHotItems assigns ranks starting at 1, in descending score order", async () => {
  const { rankHotItems } = await import("../lib/hot-rank.ts");

  const items = [
    mk({
      id: "hot",
      title: "Critical CVE-2026-5555 RCE zero-day actively exploited",
      source: "CISA",
      pubDate: mins(5),
    }),
    mk({
      id: "warm",
      title: "Routine patch advisory from a vendor",
      source: "Vendor Blog",
      pubDate: mins(40),
    }),
  ];

  const ranked = rankHotItems(items, 24);
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[1].rank, 2);
  assert.ok(ranked[0].score >= ranked[1].score, "rank 1 must have >= score than rank 2");
});

test("rankHotItems respects the time window — drops items older than the window", async () => {
  const { rankHotItems } = await import("../lib/hot-rank.ts");

  const items = [
    mk({ id: "recent", title: "Recent critical CVE-2026-1111 RCE", source: "CISA", pubDate: mins(30) }),
    mk({ id: "old3d", title: "Old CVE-2026-2222 story from 3 days ago", source: "Old", pubDate: mins(60 * 24 * 3) }),
  ];

  const day = rankHotItems(items, 24);
  assert.equal(
    day.length,
    1,
    "24h window must exclude the 3-day-old item",
  );
  assert.equal(day[0].id, "recent");

  const week = rankHotItems(items, 24 * 7);
  assert.equal(week.length, 2, "7d window must include both items");
});

test("rankHotItems returns an empty array for empty input without throwing", async () => {
  const { rankHotItems } = await import("../lib/hot-rank.ts");
  const ranked = rankHotItems([], 24);
  assert.deepEqual(ranked, []);
});

test("rankHotItems HotItem carries all required fields", async () => {
  const { rankHotItems } = await import("../lib/hot-rank.ts");

  const items = [
    mk({
      id: "x",
      title: "Critical CVE-2026-3333 zero-day actively exploited",
      source: "CISA",
      pubDate: mins(15),
    }),
  ];
  const ranked = rankHotItems(items, 24);
  const item = ranked[0];

  for (const key of [
    "id",
    "title",
    "link",
    "summary",
    "source",
    "category",
    "pubDate",
    "score",
    "rank",
    "coverageCount",
    "sources",
    "relatedLinks",
    "reason",
  ]) {
    assert.equal(key in item, true, `HotItem must include field: ${key}`);
  }
  assert.equal(typeof item.reason, "string", "reason must be a string");
  assert.ok(item.reason.length > 0, "reason must be non-empty");
  assert.equal(Array.isArray(item.sources), true);
  assert.equal(Array.isArray(item.relatedLinks), true);
  assert.equal(item.relatedLinks.length, item.coverageCount, "relatedLinks length must equal coverageCount");
  assert.equal(typeof item.score, "number");
  assert.equal(typeof item.rank, "number");
});

test("rankHotItems dedupes source names within a cluster", async () => {
  const { rankHotItems } = await import("../lib/hot-rank.ts");

  // 两条来自同一信源名称、讲同一 CVE → sources 去重后应为 1
  const items = [
    mk({ id: "1", title: "CVE-2026-7777 part one", source: "Same Source" }),
    mk({ id: "2", title: "CVE-2026-7777 part two", source: "Same Source" }),
  ];
  const ranked = rankHotItems(items, 24);
  assert.equal(ranked.length, 1, "same-CVE items must merge");
  assert.equal(ranked[0].coverageCount, 1, "duplicate source name must be deduped");
});

test("clusterItems merges cross-language reports of the same event using localized fields", async () => {
  const { clusterItems } = await import("../lib/hot-rank.ts");

  // 同一勒索事件: 英文条目 + 项目翻译的中文; 另一条不同信源不同措辞
  const items = [
    mk({
      id: "en1",
      title: "LockBit ransomware hits manufacturing sector",
      source: "The Hacker News",
      titleZh: "LockBit 勒索软件攻击制造业",
    }),
    mk({
      id: "zh1",
      title: "LockBit 勒索软件活动瞄准制造企业",
      source: "Help Net Security",
    }),
  ];

  const clusters = clusterItems(items);
  assert.equal(
    clusters.length,
    1,
    "cross-language reports of the same event must merge via localized-field strong tokens",
  );
});
