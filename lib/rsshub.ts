/**
 * RSSHub 桥接层 —— 把公众号 / Telegram / X fallback 等无官方 RSS 的源，
 * 经自建 RSSHub 实例转成标准 RSS feed URL。
 *
 * X 长期稳定主路径走官方 X API（见 lib/x-api.ts），RSSHub 只作为 fallback。
 * 自建 RSSHub 部署见 docs/deploy-rsshub.md。
 *
 * 配置：环境变量 RSSHUB_BASE（如 https://your-rsshub.vercel.app）。
 * 未配置时 RSSHub 型源会被 fetchSources 跳过。
 */

/** 取自建 RSSHub 实例根地址（无尾斜杠）。未配置返回空串。 */
export function getRssHubBase(): string {
  return (process.env.RSSHUB_BASE ?? "").trim().replace(/\/+$/, "");
}

/** RSSHub 是否可用（已配置 RSSHUB_BASE）。 */
export function isRssHubReady(): boolean {
  return getRssHubBase().length > 0;
}

/** X / Twitter 用户时间线 RSS。handle 不带 @。 */
export function xUserUrl(handle: string): string {
  const base = getRssHubBase();
  if (!base) return "";
  const h = handle.replace(/^@/, "");
  return `${base}/twitter/user/${h}`;
}

/**
 * 微信公众号 RSS（ggh 路由，用 gh_ 原始 ID）。
 * @param ghId 公众号原始 ID，形如 gh_xxxxxxxxxx。
 *   获取：微信打开该公众号任一文章 → 右上角...→ 复制链接 → URL 取 __biz
 *   或在公众号设置页查看"原始ID"。需在 RSSHub 实例配微信 cookie。
 */
export function wechatUrl(ghId: string): string {
  const base = getRssHubBase();
  if (!base) return "";
  return `${base}/wechat/ggh/${ghId}`;
}

/**
 * 微信公众号 RSS（biz 路由，用 __biz base64 ID）。
 * @param biz 公众号 __biz，形如 MzIxxxxxxxxxxx==
 *   获取：微信打开该公众号任一文章 → URL 里 __biz= 后的值。
 *   注意 biz 路由需 URL 编码（== 要转义），RSSHub 内部已处理。
 */
export function wechatBizUrl(biz: string): string {
  const base = getRssHubBase();
  if (!base) return "";
  return `${base}/wechat/mp/${encodeURIComponent(biz)}`;
}

/** Telegram 频道 RSS（备用，频道名不带 @）。 */
export function telegramChannelUrl(name: string): string {
  const base = getRssHubBase();
  if (!base) return "";
  const n = name.replace(/^@/, "");
  return `${base}/telegram/channel/${n}`;
}
