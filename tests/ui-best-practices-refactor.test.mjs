import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildFeedLandingState } from "../lib/feed-view-model.js";

const root = process.cwd();

function load(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

test("feed landing falls back to the most recent available items when 24-hour scope is empty", () => {
  const now = Date.parse("2026-04-23T12:00:00.000Z");
  const items = [
    {
      id: "older-security-1",
      title: "Older but still relevant",
      titleZh: "较早但仍相关",
      summary: "Older summary",
      summaryZh: "较早摘要",
      summaryAi: "",
      pubDate: "2026-04-21T20:00:00.000Z",
      category: "综合资讯",
      source: "Example",
      link: "https://example.com/1",
    },
  ];

  const state = buildFeedLandingState(items, {
    category: "全部",
    search: "",
    now,
  });

  assert.equal(state.isFallback, true);
  assert.equal(state.scopeLabel, "最近可用");
  assert.deepEqual(
    state.filtered.map((item) => item.id),
    ["older-security-1"],
  );
});

test("feed landing keeps the 24-hour scope when fresh items exist", () => {
  const now = Date.parse("2026-04-23T12:00:00.000Z");
  const items = [
    {
      id: "fresh-security-1",
      title: "Fresh story",
      titleZh: "最新文章",
      summary: "Fresh summary",
      summaryZh: "最新摘要",
      summaryAi: "",
      pubDate: "2026-04-23T09:00:00.000Z",
      category: "综合资讯",
      source: "Example",
      link: "https://example.com/fresh",
    },
    {
      id: "older-security-1",
      title: "Older story",
      titleZh: "较早文章",
      summary: "Older summary",
      summaryZh: "较早摘要",
      summaryAi: "",
      pubDate: "2026-04-21T20:00:00.000Z",
      category: "综合资讯",
      source: "Example",
      link: "https://example.com/older",
    },
  ];

  const state = buildFeedLandingState(items, {
    category: "全部",
    search: "",
    now,
  });

  assert.equal(state.isFallback, false);
  assert.equal(state.scopeLabel, "过去 24 小时");
  assert.deepEqual(
    state.filtered.map((item) => item.id),
    ["fresh-security-1"],
  );
});

test("feed landing hero summary uses cached digest overview when available", () => {
  const now = Date.parse("2026-04-23T12:00:00.000Z");
  const state = buildFeedLandingState(
    [
      {
        id: "fresh-security-1",
        title: "Fresh story",
        titleZh: "边界设备漏洞被利用",
        summary: "Fresh summary",
        summaryZh: "边界设备存在被利用风险。",
        summaryAi: "",
        pubDate: "2026-04-23T09:00:00.000Z",
        category: "漏洞预警",
        source: "Example",
        link: "https://example.com/fresh",
      },
    ],
    {
      category: "全部",
      search: "",
      now,
      digestOverview:
        "今日重点是边界漏洞、凭据风险和勒索活动的连续升温。建议先查看可被利用漏洞与远程访问资产，再复核备份和身份策略。",
    },
  );

  assert.equal(state.heroSummary.sourceLabel, "LLM 安全产业观察生成");
  assert.equal(
    state.heroSummary.title,
    "今日重点是边界漏洞、凭据风险和勒索活动的连续升温。",
  );
  assert.equal(
    state.heroSummary.body,
    "建议先查看可被利用漏洞与远程访问资产，再复核备份和身份策略。",
  );
});

test("feed landing hero summary keeps long digest sentences out of the display title", () => {
  const now = Date.parse("2026-04-23T12:00:00.000Z");
  const state = buildFeedLandingState(
    [
      {
        id: "fresh-security-1",
        title: "Fresh story",
        titleZh: "CISA 批量标记已利用漏洞",
        summary: "Fresh summary",
        summaryZh: "CISA 标记多项已被利用的企业产品漏洞。",
        summaryAi: "",
        pubDate: "2026-04-23T09:00:00.000Z",
        category: "漏洞预警",
        source: "Example",
        link: "https://example.com/fresh",
      },
    ],
    {
      category: "全部",
      search: "",
      now,
      digestOverview:
        "近72小时安全威胁态势急剧升温，CISA批量标记8个已利用漏洞，涵盖思科、Fortinet、PaperCut等核心企业产品，供应链攻击成为焦点，axios npm库遭朝鲜关联组织入侵，Vercel员工AI工具权限泄露引发连锁反应。",
    },
  );

  assert.equal(state.heroSummary.title, "近72小时安全威胁态势急剧升温。");
  assert.equal(
    state.heroSummary.body,
    "近72小时安全威胁态势急剧升温，CISA批量标记8个已利用漏洞，涵盖思科、Fortinet、PaperCut等核心企业产品，供应链攻击成为焦点，axios npm库遭朝鲜关联组织入侵，Vercel员工AI工具权限泄露引发连锁反应。",
  );
});

test("feed landing hero summary renders structured expert brief points", () => {
  const now = Date.parse("2026-04-23T12:00:00.000Z");
  const state = buildFeedLandingState(
    [
      {
        id: "fresh-security-1",
        title: "Fresh story",
        titleZh: "供应链攻击扩大",
        summary: "Fresh summary",
        summaryZh: "供应链风险正在扩大。",
        summaryAi: "",
        pubDate: "2026-04-23T09:00:00.000Z",
        category: "威胁情报",
        source: "Example",
        link: "https://example.com/fresh",
      },
    ],
    {
      category: "全部",
      search: "",
      now,
      digestOverview:
        "专家判断：今天的主线是供应链与身份风险同步升温，AI 工具权限暴露正在扩大企业攻击面。\n重点变化：\n1. CISA 新增已利用漏洞，边界产品仍是攻击入口。\n2. npm 依赖与 OAuth 权限事件说明开发链路风险上升。\n进一步关注：\n- 远程访问资产是否暴露在公网。\n- AI 工具是否拿到了过宽令牌。\n行动建议：\n- 先修 KEV 漏洞，再隔离受影响依赖。\n- 对 MCP 与 OAuth 集成做权限复核。",
    },
  );

  assert.equal(state.heroSummary.title, "今天的主线是供应链与身份风险同步升温。");
  assert.equal(
    state.heroSummary.body,
    "AI 工具权限暴露正在扩大企业攻击面。",
  );
  assert.deepEqual(
    state.heroSummary.sections.map((section) => section.label),
    ["重点变化", "进一步关注", "行动建议"],
  );
  assert.equal(state.heroSummary.sections[0].items[0].startsWith("CISA 新增"), true);
});

test("structured expert brief exposes section intent for visual hierarchy", () => {
  const now = Date.parse("2026-04-23T12:00:00.000Z");
  const state = buildFeedLandingState(
    [
      {
        id: "fresh-security-1",
        title: "Fresh story",
        titleZh: "AI 供应链风险升温",
        summary: "Fresh summary",
        summaryZh: "AI 供应链风险正在扩大。",
        summaryAi: "",
        pubDate: "2026-04-23T09:00:00.000Z",
        category: "威胁情报",
        source: "Example",
        link: "https://example.com/fresh",
      },
    ],
    {
      category: "全部",
      search: "",
      now,
      digestOverview:
        "专家判断：AI 供应链已经从潜在风险变成现实攻击面，今天最该优先看身份权限和外部暴露。\n重点变化：\n1. 已利用漏洞数量继续增加，边界设备风险抬升。\n进一步关注：\n- AI 工具令牌是否越权。\n行动建议：\n- 立即收敛公网暴露资产并复核 OAuth 权限。",
    },
  );

  assert.equal(state.heroSummary.judgmentLabel, "专家判断");
  assert.deepEqual(
    state.heroSummary.sections.map(({ label, intent, icon, priority }) => ({
      label,
      intent,
      icon,
      priority,
    })),
    [
      { label: "重点变化", intent: "change", icon: "radar", priority: "P1" },
      { label: "进一步关注", intent: "watch", icon: "target", priority: "P2" },
      { label: "行动建议", intent: "action", icon: "check", priority: "NEXT" },
    ],
  );
});

test("structured brief accepts security industry perspective labels", () => {
  const now = Date.parse("2026-04-23T12:00:00.000Z");
  const state = buildFeedLandingState(
    [
      {
        id: "fresh-security-1",
        title: "Fresh story",
        titleZh: "AI 安全平台需求升温",
        summary: "Fresh summary",
        summaryZh: "AI 安全治理需求正在扩大。",
        summaryAi: "",
        pubDate: "2026-04-23T09:00:00.000Z",
        category: "AI 安全",
        source: "Example",
        link: "https://example.com/fresh",
      },
    ],
    {
      category: "全部",
      search: "",
      now,
      digestOverview:
        "产业判断：今天最重要的变化不是单个漏洞升温，而是 AI 与边界资产治理正在推动安全预算从被动响应转向平台化能力建设。\n产业信号：\n1. 边界设备和 AI 开发工具事件共同指向暴露面管理需求上升。\n市场影响：\n- 客户会更关注 ASM、AI-SPM 和身份权限治理的一体化能力。\n关注方向：\n- 继续观察安全厂商如何把 AI 治理能力产品化，而不是只发布检测规则。",
    },
  );

  assert.equal(state.heroSummary.judgmentLabel, "产业判断");
  assert.deepEqual(
    state.heroSummary.sections.map(({ label, intent, icon, priority }) => ({
      label,
      intent,
      icon,
      priority,
    })),
    [
      { label: "产业信号", intent: "signal", icon: "chart", priority: "SIGNAL" },
      { label: "市场影响", intent: "impact", icon: "network", priority: "IMPACT" },
      { label: "关注方向", intent: "opportunity", icon: "spark", priority: "WATCH" },
    ],
  );
});

test("content summary hero uses compact title styling instead of display typography", () => {
  const source = load("components/feed/FeedLandingClient.tsx");
  const stylesheet = load("app/styles/public.css");

  assert.equal(source.includes("public-summary-title"), true);
  assert.equal(stylesheet.includes(".public-summary-title"), true);
  assert.equal(source.includes("public-summary-sections"), true);
  assert.equal(stylesheet.includes(".public-summary-sections"), true);
});

test("content summary hero uses a dedicated expert brief board", () => {
  const source = load("components/feed/FeedLandingClient.tsx");
  const stylesheet = load("app/styles/public.css");

  for (const phrase of [
    "public-summary-brief",
    "public-summary-judgment",
    "public-summary-card",
    "public-summary-card-meta",
  ]) {
    assert.equal(source.includes(phrase), true, `expected component to render ${phrase}`);
    assert.equal(stylesheet.includes(`.${phrase}`), true, `expected stylesheet for ${phrase}`);
  }
});

test("security industry summary uses a hierarchy board instead of equal columns", () => {
  const source = load("components/feed/FeedLandingClient.tsx");
  const stylesheet = load("app/styles/public.css");

  for (const phrase of [
    "public-summary-focus",
    "public-summary-focus-chip",
    "public-summary-sections-heading",
    "is-primary",
    "产业雷达",
    "产业样本",
  ]) {
    assert.equal(source.includes(phrase), true, `expected component to render ${phrase}`);
  }

  for (const selector of [
    ".public-summary-focus",
    ".public-summary-focus-chip",
    ".public-summary-sections-heading",
    ".public-summary-card.is-primary",
    ".public-summary-card.is-primary ol",
  ]) {
    assert.equal(stylesheet.includes(selector), true, `expected stylesheet for ${selector}`);
  }
});

test("daily digest prompt asks for security industry judgment instead of threat intel", () => {
  const source = load("lib/digest.ts");

  for (const phrase of [
    "安全产业视角",
    "不是安全情报简报",
    "产业判断",
    "产业信号",
    "市场影响",
    "关注方向",
    "不要围绕漏洞技术细节、IOC、修补动作展开",
    "客户预算",
    "厂商格局",
  ]) {
    assert.equal(source.includes(phrase), true, `expected digest prompt phrase ${phrase}`);
  }
});

test("feed landing hero summary falls back to current filtered items", () => {
  const now = Date.parse("2026-04-23T12:00:00.000Z");
  const state = buildFeedLandingState(
    [
      {
        id: "fresh-security-1",
        title: "Fresh story",
        titleZh: "边界设备漏洞被利用",
        summary: "Fresh summary",
        summaryZh: "边界设备存在被利用风险。",
        summaryAi: "",
        pubDate: "2026-04-23T09:00:00.000Z",
        category: "漏洞预警",
        source: "Example",
        link: "https://example.com/fresh",
      },
      {
        id: "fresh-security-2",
        title: "Credential phishing expands",
        titleZh: "凭据钓鱼活动扩散",
        summary: "Threat actors expand credential phishing.",
        summaryZh: "攻击者扩大凭据钓鱼活动。",
        summaryAi: "",
        pubDate: "2026-04-23T08:00:00.000Z",
        category: "威胁情报",
        source: "Example",
        link: "https://example.com/credential",
      },
    ],
    {
      category: "漏洞预警",
      search: "",
      now,
      digestOverview: "",
    },
  );

  assert.equal(state.heroSummary.sourceLabel, "基于当前列表生成");
  assert.equal(state.heroSummary.title, "当前先看 1 条过去 24 小时安全资讯。");
  assert.equal(
    state.heroSummary.body,
    "当前列表集中在漏洞预警。最新焦点是“边界设备漏洞被利用”。建议先看焦点卡片，再用分类和搜索补充细节。",
  );
});

test("category filter keeps the base system pill shell off the active branch", () => {
  const source = load("components/CategoryFilter.tsx");

  assert.equal(source.includes('className={`system-pill'), false);
  assert.equal(source.includes(': `system-pill '), true);
});

test("public stylesheet stays scoped to public surfaces", () => {
  const source = load("app/styles/public.css");

  assert.equal(source.includes(".glass,"), false);
  assert.equal(source.includes(".team-card"), false);
  assert.equal(source.includes(".mdr-board-card"), false);
});

test("intelligence stylesheet keeps one theme block and uses intel token names consistently", () => {
  const source = load("app/styles/intelligence.css");
  const themeBlockCount = (source.match(/\.intelligence-command-center \{/g) ?? []).length;

  assert.equal(themeBlockCount, 1);
  assert.equal(source.includes("var(--text-"), false);
  assert.equal(source.includes("var(--cyan)"), false);
});

test("team overview grid aligns hero cards to content height instead of stretching them", () => {
  const source = load("app/(executive)/team/page.tsx");

  assert.equal(source.includes("lg:items-start"), true);
});
