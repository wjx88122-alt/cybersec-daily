/**
 * RSSHub 桥接层 —— 把 X / 公众号 / Telegram 等无官方 RSS 的源，
 * 经自建 RSSHub 实例转成标准 RSS feed URL。
 *
 * 对齐 AI HOT 的实现：它的 X 与公众号源高度疑似同样走自建桥接服务。
 * 自建 RSSHub 部署见 docs/deploy-rsshub.md。
 *
 * 配置：环境变量 RSSHUB_BASE（如 https://your-rsshub.vercel.app）。
 * 未配置时 RSSHub 型源会被 fetchSources 跳过（见 isRssHubReady）。
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
  const h = handle.replace(/^@/, "");
  return `${getRssHubBase()}/twitter/user/${h}`;
}

/**
 * 微信公众号 RSS。
 * @param id 公众号 id。RSSHub 支持多种路由：
 *   - ggh: 公众号gh_id（如 gh_xxxx）
 *   - mp:  公众号biz（Mzxxxx）
 *   - ceaseunique: 公众号名称
 * 这里默认用 ggh 路由（最稳定，需在 RSSHub 配 cookie）。
 */
export function wechatUrl(id: string): string {
  return `${getRssHubBase()}/wechat/ggh/${id}`;
}

/** Telegram 频道 RSS（备用，频道名不带 @）。 */
export function telegramChannelUrl(name: string): string {
  const n = name.replace(/^@/, "");
  return `${getRssHubBase()}/telegram/channel/${n}`;
}
