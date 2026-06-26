# 配置官方 X API（长期稳定）

`auth_token` 是浏览器 Cookie，只适合临时补源。长期稳定的 X 信源应走官方 X API v2：

- `lib/feeds.ts` 的 X KOL 源配置 `xHandle`
- `lib/fetchFeeds.ts` 在 `X_BEARER_TOKEN` 存在时优先调用官方 API
- `RSSHUB_BASE` 只作为没有官方 token 时的 X fallback，以及公众号桥接

## 1. 获取 Bearer Token

1. 打开 X Developer Portal，创建 Project / App。
2. 在 App 的 `Keys and tokens` 里找到 Bearer Token。
3. 复制 Bearer Token，后续只放进环境变量，不提交到 Git。

官方参考：

- https://docs.x.com/fundamentals/authentication/oauth-2-0/application-only
- https://docs.x.com/x-api/users/get-user-by-username
- https://docs.x.com/x-api/users/get-posts
- https://docs.x.com/x-api/getting-started/pricing

## 2. 配置 cybersec-daily

在 Vercel 的 `cybersec-daily` 项目里新增环境变量：

```bash
X_BEARER_TOKEN=你的 X API Bearer Token
```

本地开发放到 `.env.local`。兼容旧命名时也可用 `TWITTER_BEARER_TOKEN`，但推荐统一用 `X_BEARER_TOKEN`。

配置后重新部署。X 源会优先走官方 API，不再依赖 RSSHub 的 `TWITTER_AUTH_TOKEN`。

## 3. 验证官方 API

先查 username 对应的 user id：

```bash
curl -H "Authorization: Bearer $X_BEARER_TOKEN" \
  "https://api.x.com/2/users/by/username/briankrebs?user.fields=username"
```

再用返回的 `data.id` 拉推文：

```bash
curl -H "Authorization: Bearer $X_BEARER_TOKEN" \
  "https://api.x.com/2/users/<USER_ID>/tweets?max_results=5&tweet.fields=created_at,entities,lang,public_metrics&exclude=retweets,replies"
```

如果这里返回 401，token 不对或已被撤销；如果返回 403 / 429，通常是当前 X API 套餐、权限或额度限制。

## 4. RSSHub 仍然保留的用途

`RSSHUB_BASE` 仍可配置，但现在定位是：

- X：没有 `X_BEARER_TOKEN` 时的可选 fallback，不建议作为长期主路径
- 公众号：继续依赖 RSSHub + `WECHAT_cookies`

也就是说，长期稳定的 X 方案只需要在 `cybersec-daily` 配 `X_BEARER_TOKEN`，不用再给 RSSHub 配 `TWITTER_AUTH_TOKEN`。
