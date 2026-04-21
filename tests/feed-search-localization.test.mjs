import assert from "node:assert/strict";
import test from "node:test";

import {
  getLocalizedFeedSummary,
  getLocalizedFeedTitle,
  matchesFeedSearch,
} from "../lib/feed-search.ts";

test("localized title helper returns Chinese copy only when it passes validation", () => {
  assert.equal(
    getLocalizedFeedTitle({
      title: "Patch released for enterprise firewall",
      titleZh: "企业防火墙发布安全补丁",
    }),
    "企业防火墙发布安全补丁",
  );

  assert.equal(
    getLocalizedFeedTitle({
      title: "Patch released for enterprise firewall",
      titleZh: "Enterprise firewall released security patch",
    }),
    "Patch released for enterprise firewall",
  );
});

test("localized summary helper falls back to summaryAi when summaryZh is invalid", () => {
  assert.equal(
    getLocalizedFeedSummary({
      title: "",
      summary:
        "The vendor provides a hotfix for multiple CVEs affecting the cloud product.",
      summaryZh: "Vendor hotfix announcement",
      summaryAi: "厂商发布补丁公告，建议立即升级。",
    }),
    "厂商发布补丁公告，建议立即升级。",
  );
});

test("search ignores untranslated zh fields when matching Chinese text", () => {
  const item = {
    title: "New vulnerability affects endpoint sensors",
    summary: "Researchers posted new indicators related to CVE exploitation.",
    titleZh: "New vulnerability affects endpoint sensors",
    summaryZh: "New vulnerability affects endpoint sensors",
  };

  assert.equal(
    matchesFeedSearch(item, "补丁"),
    false,
    "untranslated zh fields should not create false Chinese matches",
  );
});

test("search includes valid localized fields and respects trimmed query", () => {
  const item = {
    title: "Quarterly threat intelligence update",
    summary: "Annual report from multiple vendors.",
    titleZh: "季度威胁情报更新",
    summaryAi: "情报显示对 AI 访问密钥存在新增监测点。",
  };

  assert.equal(matchesFeedSearch(item, "   威胁情报   "), true);
  assert.equal(matchesFeedSearch(item, "监测点"), true);
});
