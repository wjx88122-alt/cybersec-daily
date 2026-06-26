# 部署自建 RSSHub（接 X / 公众号）

> 参照 AI HOT 的实现：它的 X 与公众号源经自建桥接服务转为 RSS。
> 本文记录如何把 RSSHub 部署到你自己的 Vercel，并接入 cybersec-daily。

## 当前状态

- ✅ **RSSHub 已 fork 到你的 GitHub**：https://github.com/wjx88122-alt/RSSHub
- ⬜ 需要你完成：Vercel 部署 + 配置 X/公众号 cookie + 填真实公众号 ID

---

## 你需要做的（3 步，约 15 分钟）

### 步骤 1：把 fork 部署到 Vercel（3 分钟）

1. 打开 https://vercel.com/new
2. Import 选择 **wjx88122-alt/RSSHub** 仓库
3. Framework Preset 选 **Other**（RSSHub 自带 vercel.json，其他默认）
4. 点 **Deploy**，等 1-2 分钟
5. 部署完成后拿到域名，形如 `https://rsshub-xxxxx.vercel.app`
6. **记下这个域名** ← 这是你的 `RSSHUB_BASE`

> 验证：浏览器打开 `https://你的域名/`，应看到 RSSHub 欢迎页。

### 步骤 2：配置 X（Twitter）cookie（2 分钟）

1. 浏览器登录你的 X（Twitter）账号
2. F12 打开 DevTools → **Application** 标签 → 左侧 **Cookies** → `https://x.com`
3. 找到名为 **`auth_token`** 的 cookie，复制它的 **Value**（一串 40 位 hex）
4. 回到 Vercel 的 RSSHub 项目 → **Settings → Environment Variables**
5. 新增：
   - Key: `TWITTER_AUTH_TOKEN`
   - Value: 上一步复制的值
   - Environment: 勾选 Production + Preview
6. **Redeploy**（Settings 里改完环境变量必须重新部署才生效）

> 验证：`curl "https://你的域名/twitter/user/briankrebs"` 应返回 RSS XML。
> 失效表现：返回空或 401 → 重新登录 X 取新 token，更新后 Redeploy。

### 步骤 3：配置公众号 cookie + 填真实 ID（10 分钟）

**3a. 获取公众号 cookie**

1. 微信 PC 版 / 微信网页版，打开「搜一搜」搜任意一个目标公众号（如"奇安信威胁情报中心"）
2. 进入公众号 → 点任一历史文章
3. 文章页右键复制链接（或在浏览器打开），URL 形如：
   `https://mp.weixin.qq.com/s?__biz=MzIxxxxxxxxxxx==&mid=...`
4. **记下 `__biz=` 后面的值**（如 `MzIxxxxxxxxxxx==`）← 这是该公众号的 biz ID
5. 浏览器 DevTools → Application → Cookies → `https://mp.weixin.qq.com`
   复制全部 cookie（或至少 `wap_sid2`）→ 拼成一行 `key=value; key=value` 格式
6. Vercel RSSHub → Settings → Environment Variables 新增：
   - Key: `WECHAT_cookies`（注意大写 WECHAT + 小写 cookies）
   - Value: 上一步的 cookie 字符串
   - Redeploy

**3b. 把 biz ID 填进代码**

打开 `lib/feeds.ts`，找到 `FEED_SOURCES_KOL` 里的 5 个公众号源，把占位符替换成真实 biz：

```ts
// 替换前：
urlBuilder: () => wechatBizUrl("REPLACE_WITH_BIZ_QIANXIN"),
// 替换后（用你查到的真实 biz）：
urlBuilder: () => wechatBizUrl("MzIxxxxxxxxxxx=="),
```

5 个占位符对应：
- `REPLACE_WITH_BIZ_QIANXIN` → 奇安信威胁情报中心
- `REPLACE_WITH_BIZ_TENCENT` → 腾讯安全威胁情报中心
- `REPLACE_WITH_BIZ_THREATBOOK` → 微步在线研究响应中心
- `REPLACE_WITH_BIZ_CHAITIN` → 长亭科技
- `REPLACE_WITH_BIZ_NSFOCUS` → 绿盟科技研究通讯

> 不想配公众号？可以暂时删掉这 5 个源或保留占位（会静默失败，不影响其他源）。

### 步骤 4：让 cybersec-daily 用上 RSSHub（1 分钟）

在 **cybersec-daily** 的 Vercel 项目（不是 RSSHub 那个）→ Settings → Environment Variables：

```
RSSHUB_BASE=https://你的rsshub域名
```

（也配到本地 `.env.local` 用于本地开发。）

配置后，`FEED_SOURCES_KOL`（8 个 X 大V + 5 个公众号）自动生效。未配置时这组源静默跳过。

---

## 架构图

```
cybersec-daily (本项目)
   │  读 RSSHUB_BASE → feeds.ts 的 KOL 源拼出 RSS URL
   ▼
你的 RSSHub (https://rsshub-xxxx.vercel.app)
   │  /twitter/user/briankrebs   → 拉 X 推文 → RSS
   │  /wechat/mp/MzIxxxx==       → 拉公众号文章 → RSS
   ▼
X / 公众号（你的 cookie 认证）
```

## 维护

- **X cookie 失效**（~30 天）：重登 X 取 `auth_token`，更新后 Redeploy
- **公众号 cookie 失效**（更频繁）：同上更新 `WECHAT_cookies`
- 失效不影响其他源（计入 failedSources，静默跳过）

## 信源清单（lib/feeds.ts 的 FEED_SOURCES_KOL）

**X 安全大V（8 个）**：Brian Krebs、SwiftOnSecurity、Troy Hunt、Kevin Beaumont、
MalwareHunterTeam、Vitali Kremez、Jake Williams、Carlos Perez

**安全公众号（5 个）**：奇安信、腾讯安全、微步在线、长亭、绿盟
