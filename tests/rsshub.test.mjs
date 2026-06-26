import assert from "node:assert/strict";
import test from "node:test";

import {
  getRssHubBase,
  isRssHubReady,
  xUserUrl,
  wechatUrl,
  wechatBizUrl,
  telegramChannelUrl,
} from "../lib/rsshub.ts";

test("getRssHubBase reads RSSHUB_BASE and strips trailing slashes", () => {
  process.env.RSSHUB_BASE = "https://my-rsshub.vercel.app/";
  assert.equal(getRssHubBase(), "https://my-rsshub.vercel.app");
  assert.equal(isRssHubReady(), true);

  process.env.RSSHUB_BASE = "https://x.com/a/b///";
  assert.equal(getRssHubBase(), "https://x.com/a/b");
});

test("isRssHubReady is false when RSSHUB_BASE unset/empty", () => {
  delete process.env.RSSHUB_BASE;
  assert.equal(getRssHubBase(), "");
  assert.equal(isRssHubReady(), false);
});

test("xUserUrl builds twitter user route and strips leading @", () => {
  process.env.RSSHUB_BASE = "https://rh.example.com";
  assert.equal(xUserUrl("briankrebs"), "https://rh.example.com/twitter/user/briankrebs");
  assert.equal(xUserUrl("@SwiftOnSecurity"), "https://rh.example.com/twitter/user/SwiftOnSecurity");
});

test("wechatUrl builds wechat ggh route", () => {
  process.env.RSSHUB_BASE = "https://rh.example.com";
  assert.equal(wechatUrl("gh_abc123"), "https://rh.example.com/wechat/ggh/gh_abc123");
});

test("wechatBizUrl builds wechat mp route with encoded biz", () => {
  process.env.RSSHUB_BASE = "https://rh.example.com";
  assert.equal(
    wechatBizUrl("MzI1MjM=="),
    "https://rh.example.com/wechat/mp/MzI1MjM%3D%3D",
  );
});

test("telegramChannelUrl builds telegram channel route", () => {
  process.env.RSSHUB_BASE = "https://rh.example.com";
  assert.equal(telegramChannelUrl("somechannel"), "https://rh.example.com/telegram/channel/somechannel");
  assert.equal(telegramChannelUrl("@somechannel"), "https://rh.example.com/telegram/channel/somechannel");
});

test("xUserUrl returns base-less path when RSSHUB_BASE unset (relative)", () => {
  delete process.env.RSSHUB_BASE;
  // 未配置时返回空串，fetchSources 会跳过 RSSHub fallback。
  assert.equal(xUserUrl("briankrebs"), "");
});

test("FEED_SOURCES_KOL urlBuilder resolves correctly when RSSHub ready", async () => {
  process.env.RSSHUB_BASE = "https://rh.example.com";
  const { FEED_SOURCES_KOL } = await import("../lib/feeds.ts");
  assert.ok(FEED_SOURCES_KOL.length >= 10, "KOL sources should include X + wechat");
  // X 源用 urlBuilder，解出 twitter 路由
  const xSrc = FEED_SOURCES_KOL.find((s) => s.name.startsWith("X："));
  assert.ok(xSrc?.urlBuilder, "X source must use urlBuilder");
  assert.equal(xSrc.xHandle, "briankrebs");
  assert.match(xSrc.urlBuilder(), /\/twitter\/user\//);
  // 公众号源解出 wechat mp 路由（biz 路由）
  const wxSrc = FEED_SOURCES_KOL.find((s) => s.name.startsWith("公众号："));
  assert.ok(wxSrc?.urlBuilder, "wechat source must use urlBuilder");
  assert.match(wxSrc.urlBuilder(), /\/wechat\/mp\//);
});

test("FEED_SOURCES_KOL urlBuilder returns empty when RSSHub unset", async () => {
  delete process.env.RSSHUB_BASE;
  const { FEED_SOURCES_KOL } = await import("../lib/feeds.ts");
  const xSrc = FEED_SOURCES_KOL.find((s) => s.name.startsWith("X："));
  // 官方 X API 用 xHandle；RSSHub 只作为可选 fallback。
  assert.ok(xSrc?.urlBuilder, "urlBuilder should exist regardless");
  assert.equal(xSrc.xHandle, "briankrebs");
  assert.equal(xSrc.urlBuilder(), "");
});
