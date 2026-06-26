# 部署自建 RSSHub 实例（接 X / 公众号）

参照 AI HOT 的实现方式：它的 X 与公众号源高度疑似通过自建桥接服务转为 RSS。
本文档记录如何在 Vercel 自建一个 RSSHub 实例，并接入 cybersec-daily。

## 为什么需要

X / 公众号没有官方 RSS，免费公共桥接（Nitter / RSSHub.app 公共实例）不稳定或被封禁。
自建 RSSHub 实例是你完全控制的桥接服务，用你自己的 cookie 拉取，稳定可控。

## 架构

```
cybersec-daily (本项目)
   │  读取 RSSHUB_BASE 环境变量
   │  feeds.ts 的 FEED_SOURCES_KOL 用 xUserUrl()/wechatUrl() 拼出 RSS URL
   ▼
你自建的 RSSHub 实例 (https://your-rsshub.vercel.app)
   │  /twitter/user/briankrebs  → 拉 X 推文 → 转 RSS
   │  /wechat/ggh/gh_xxxx       → 拉公众号文章 → 转 RSS
   ▼
X / 公众号（你的 cookie 认证）
```

## 部署步骤

### 1. Fork RSSHub

到 https://github.com/DIYgod/RSSHub 点 Fork。

### 2. Vercel 部署

到 https://vercel.com/new，导入你 fork 的 RSSHub 仓库。
- Framework Preset: 选 **Other**
- 其他默认，点 Deploy。
- 部署完成后拿到域名，如 `https://rsshub-xxxx.vercel.app`。

### 3. 配置 X（Twitter）访问

RSSHub 的 X 路由需要认证 cookie。在 Vercel 项目 → Settings → Environment Variables 添加：

| 变量 | 值 | 说明 |
|------|----|------|
| `TWITTER_AUTH_TOKEN` | 你的 X 登录 token | 浏览器登录 X → DevTools → Application → Cookies → `auth_token` |

> 也可用 `TWITTER_COOKIE`（完整 cookie 字符串）。详见 RSSHub 文档的 Twitter 路由配置。

### 4. 配置公众号访问

RSSHub 的公众号路由需要微信 cookie。添加：

| 变量 | 值 | 说明 |
|------|----|------|
| `WECHAT.cookies` | 你的微信公众号平台 cookie | 见 RSSHub 文档微信公众号路由（需 mp.weixin.qq.com 的 cookie） |

> 公众号路由较脆弱，cookie 需定期刷新。若稳定性不足，可先用 X 源。

### 5. Redeploy

改完环境变量后在 Vercel 点 Redeploy，使环境变量生效。

### 6. 验证实例

```bash
# 应返回 RSS XML
curl "https://your-rsshub.vercel.app/twitter/user/briankrebs"
curl "https://your-rsshub.vercel.app/wechat/ggh/gh_xxxx"
```

### 7. 接入 cybersec-daily

在 cybersec-daily 的 Vercel 项目（或本地 `.env.local`）配置：

```
RSSHUB_BASE=https://your-rsshub.vercel.app
```

配置后，`feeds.ts` 里的 `FEED_SOURCES_KOL`（8 个 X 大V + 5 个公众号）会自动生效。
未配置时这组源会被静默跳过，不影响其他源。

## 维护

- **X cookie 失效**：重新登录 X 取 `auth_token`，更新 `TWITTER_AUTH_TOKEN` 后 Redeploy。
- **公众号 cookie 失效**：同上，更新 `WECHAT.cookies`。
- 失效表现：对应源返回空或 401，cybersec-daily 会把它们计入 failedSources，不影响其他源。

## 信源清单（在 lib/feeds.ts 的 FEED_SOURCES_KOL）

**X 安全大V**：Brian Krebs、SwiftOnSecurity、Troy Hunt、Kevin Beaumont、
MalwareHunterTeam、Vitali Kremez、Jake Williams、Carlos Perez

**安全公众号**：奇安信威胁情报中心、腾讯安全威胁情报中心、微步在线、长亭科技、绿盟科技

> 公众号 `ggh` id（如 `gh_xxxx`）需替换为真实值。获取方式：
> 微信搜一搜 → 进入公众号 → 右上角... → 查看历史消息 → URL 中的 `__biz` 或公众号设置页的原始 ID。
