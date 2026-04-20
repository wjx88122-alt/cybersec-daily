import assert from "node:assert/strict";
import test from "node:test";

const {
  isLikelyUntranslatedItem,
  pickLocalizedField,
} = await import("../lib/translation-detection.ts");

test("isLikelyUntranslatedItem treats non-Chinese zh fields as untranslated for English source", () => {
  const untranslated = isLikelyUntranslatedItem({
    title: "Critical RCE in Popular Firewall",
    summary: "Security teams should patch immediately.",
    titleZh: "Major firewall remote code execution issue",
    summaryZh: "Patch is available from vendor advisory.",
  });

  assert.equal(untranslated, true);
});

test("isLikelyUntranslatedItem returns false once localized Chinese fields exist", () => {
  const untranslated = isLikelyUntranslatedItem({
    title: "Critical RCE in Popular Firewall",
    summary: "Security teams should patch immediately.",
    titleZh: "主流防火墙曝出高危远程代码执行漏洞",
    summaryZh: "厂商已发布补丁，建议安全团队立即完成加固。",
  });

  assert.equal(untranslated, false);
});

test("isLikelyUntranslatedItem keeps mixed English text with only one Chinese character as untranslated", () => {
  const untranslated = isLikelyUntranslatedItem({
    title: "Critical RCE in Popular Firewall",
    summary: "Security teams should patch immediately.",
    titleZh: "Critical firewall RCE patch 修",
    summaryZh: "Vendor advisory recommends immediate patching 修",
  });

  assert.equal(untranslated, true);
});

test("pickLocalizedField prefers valid Chinese candidate and drops English fallback", () => {
  assert.equal(
    pickLocalizedField({
      source: "CISA issues emergency directive",
      candidate: "CISA 发布紧急指令",
      existing: "Emergency directive from CISA",
    }),
    "CISA 发布紧急指令",
  );

  assert.equal(
    pickLocalizedField({
      source: "CISA issues emergency directive",
      candidate: "Emergency directive from CISA",
      existing: "Existing English fallback",
    }),
    undefined,
  );

  assert.equal(
    pickLocalizedField({
      source: "CISA issues emergency directive",
      candidate: "Emergency directive from CISA 修",
      existing: "CISA 发布紧急指令",
    }),
    "CISA 发布紧急指令",
  );
});
