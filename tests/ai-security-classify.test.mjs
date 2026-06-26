import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyAiSecurityItem,
  applyAiSubcategories,
} from "../lib/ai-security-classify.ts";

/** 构造最小 FeedItem。 */
function mk(title, summary = "", category = "AI 安全") {
  return {
    id: title,
    title,
    link: `https://x/${encodeURIComponent(title)}`,
    summary,
    source: "Test",
    category,
    pubDate: new Date().toISOString(),
  };
}

test("classifyAiSecurityItem tags prompt injection into AI 提示注入", () => {
  assert.equal(
    classifyAiSecurityItem(
      mk("Indirect prompt injection via tool outputs", "An LLM agent was hijacked"),
    ),
    "AI 提示注入",
  );
  assert.equal(
    classifyAiSecurityItem(mk("新研究：越狱 GPT 的新手法")),
    "AI 提示注入",
  );
});

test("classifyAiSecurityItem tags red team / attack into AI 红队与攻击", () => {
  assert.equal(
    classifyAiSecurityItem(mk("Microsoft AI Red Team finds new abuse vectors")),
    "AI 红队与攻击",
  );
  assert.equal(
    classifyAiSecurityItem(mk("Deepfake 诈骗案例上升")),
    "AI 红队与攻击",
  );
});

test("classifyAiSecurityItem tags adversarial robustness into AI 对抗与鲁棒", () => {
  assert.equal(
    classifyAiSecurityItem(mk("Adversarial examples evade image classifier")),
    "AI 对抗与鲁棒",
  );
  assert.equal(
    classifyAiSecurityItem(mk("新对齐方法提升模型 safety")),
    "AI 对抗与鲁棒",
  );
});

test("classifyAiSecurityItem tags governance into AI 治理与标准", () => {
  assert.equal(
    classifyAiSecurityItem(mk("EU AI Act compliance roadmap")),
    "AI 治理与标准",
  );
  assert.equal(
    classifyAiSecurityItem(mk("NIST 发布 AI RMF 新版本")),
    "AI 治理与标准",
  );
});

test("classifyAiSecurityItem tags privacy into AI 隐私与数据", () => {
  assert.equal(
    classifyAiSecurityItem(mk("Training data extraction attack on LLMs")),
    "AI 隐私与数据",
  );
  assert.equal(
    classifyAiSecurityItem(mk("差分隐私在模型训练中的应用")),
    "AI 隐私与数据",
  );
});

test("classifyAiSecurityItem falls back to AI 安全 when nothing matches", () => {
  assert.equal(
    classifyAiSecurityItem(mk("某公司发布新模型", "性能提升 10%")),
    "AI 安全",
  );
});

test("classifyAiSecurityItem prefers prompt injection over red team when both appear", () => {
  // 同时含 prompt injection 和 red team → 注入优先
  assert.equal(
    classifyAiSecurityItem(
      mk("Red team demonstrates prompt injection chain"),
    ),
    "AI 提示注入",
  );
});

test("applyAiSubcategories only reclassifies AI items, leaves security items untouched", () => {
  const items = [
    mk("Prompt injection attack", "", "AI 安全"),
    { ...mk("CVE-2026-1234 RCE"), category: "漏洞预警" },
  ];
  const out = applyAiSubcategories(items);
  assert.equal(out[0].category, "AI 提示注入", "AI item should be reclassified");
  assert.equal(
    out[1].category,
    "漏洞预警",
    "security item must keep its category",
  );
});

test("applyAiSubcategories returns equal reference for already-correct items", () => {
  const item = mk("某公司发布新模型", "", "AI 安全");
  const out = applyAiSubcategories([item]);
  assert.equal(out[0], item, "fallback item should keep same reference");
});
