# Security Hot 1:1 复刻 AI HOT — 设计文档

**日期**: 2026-06-26
**目标**: 把 `/hot` 系列页面完整复刻成 `aihot.virxact.com` 的产品形态（左侧 sidebar 导航 + 紧凑热榜 + 日期分组时间轴 + 条目详情页 + 日报页 + 三态主题切换）。
**数据层**: 100% 复用现有 `lib/hot-page-data.ts` / `hot-rank.ts` / `digest.ts` / `snapshot.ts`，零改动。

---

## 1. 范围与切法

**切法：隔离的 "Security Hot" 产品面（已确认）**

- 新建 `HotShell`（左侧 sidebar）专供 Security Hot 系列：`/hot`、`/all`、`/daily`、`/daily/[date]`、`/items/[id]`、`/agent`
- 现有顶部导航页面（`/`、`/ai`、`/team`、`/intelligence`、`/mdr`）**原样不动**，继续用 `PublicShell`
- `/hot`、`/all` 等从 `PublicShell` 切换到 `HotShell`

**为什么这样切**: AI HOT 的 sidebar 是其专属产品导航；现有站点其他页面是另一种产品形态。隔离能真正 1:1 复刻 AI HOT 这个产品，同时保护已有工作、把风险圈在 Security Hot 范围内。

---

## 2. HotShell — 左侧 sidebar 导航

**文件**: `components/shells/HotShell.tsx`（client，因含主题状态）

**布局**: `lg:grid-cols-[260px_1fr]`，移动端 sidebar 收起为顶部抽屉（汉堡按钮）。

**Sidebar 内容**（自上而下，对齐 AI HOT）：
1. **品牌区**: `SECHOT` logo（`SEC` + `HOT` 双色），链接到 `/hot`
2. **内容组** (`complementary aria-label="主导航"`)：
   - 精选 → `/hot`
   - 全部安全动态 → `/all`
   - 安全日报 → `/daily`
3. **接入组**: Agent 接入 → `/agent`（已有页面）
4. **更多组**: 关于 / 更新日志 / 反馈（链接，关于/反馈可指向简单占位或外部）
5. **底部区**: 三态主题切换器 + 登录入口（登录暂为占位链接/按钮，对接 virxact login 不在本次范围）

**active 高亮**: 用 `usePathname()` 匹配当前路由。

**主题切换器**: 三选一单选组（深色/跟随系统/浅色），见第 6 节。

---

## 3. `/hot` 列表页（精选页）

**三区域结构**，替换现有 `HotListClient` 的扁平大卡片列表。

### 区域 1 · 工具栏（sticky）
- 分类筛选 pills（复用 `SEC_CATEGORIES` + `CategoryFilter`，改造为链接式）
- 搜索框（带搜索按钮）+ 时间窗（24h/7d）
- URL query 同步（`?cat=` `?q=` `?window=`）沿用现有逻辑

### 区域 2 · 当前热点（紧凑热榜排行区）
- 标题条: `🔥 当前热点 · 多信源热度 · 随时间消退`
- 紧凑横排（最多 5 条）：`排名数字 | 标题 | N个信源 · 相对时间`
- 每条可点击跳 `/items/[id]`
- 数据: `loadHotItems()` 按 `coverageCount` / `score` 取前列
- **删除**现有 TOP3 红橙黄渐变大卡片（`cardAccent` / `scoreTier` 视觉改为 AI HOT 的极简横排）

### 区域 3 · 按日期分组的时间轴
- `groupByDate(items)` 工具函数按 pubDate 分桶到 `YYYY-MM-DD`
- 每组: 可折叠日期头（`6月26日` + 展开按钮）
- 组内每条（左侧时间戳 `09:27` + 竖虚线）:
  - 信源行: 信源名 + `@handle`（从 source 解析） + `✦ 精选` 徽章（selected 时） + `AI 推荐分` 数字徽章（= `item.score`）
  - 标题（可点击跳详情）
  - 摘要（`line-clamp`）
  - 标签 pills（`category` + 关键词）
  - 分隔线
  - `推荐理由：...`（现有 `item.reason`）
- 点击整卡跳 `/items/[id]`

**数据**: 复用 `loadHotItems()`，新增 `groupByDate()` 纯函数（放 `lib/hot-page-data.ts`）。

**文件**: 重写 `components/feed/HotListClient.tsx`（保留文件名与 props 契约）。

---

## 4. `/items/[id]` 条目详情页

**路由**: `app/(public)/items/[id]/page.tsx`（server component）
**布局**: 单栏居中 `max-w-[720px]`，仍在 `HotShell` 内。

**结构**（自上而下）:
1. `← 返回` 按钮
2. 信源行: 信源名 + `@handle · 平台` + 右侧 `AI 推荐分` 徽章
3. 元信息: 完整时间 `2026-06-26 09:27` · 相对时间 `3小时前`
4. 原文 chip: `在原文查看 · {域名}` + favicon 图标（外链）
5. **AI 摘要** 块: `summaryAi` 字段
6. **AI 翻译 · 中文** 块: `titleZh`/`summaryZh`，带 `显示原文` 切换（切回 `title`/`summary` 英文）
7. 标签 pills: `category` + 关键词
8. **同一事件 · N 家报道**: `HotItem.sources` + `relatedLinks`，可展开列表，每条跳对应 `/items/[id]`

**数据**: 新增 `getItemDetail(id)`（放 `lib/hot-page-data.ts`）：
- 从 `readSecurityFeedItems()` 找原始条目
- 用 `clusterItems()` 重算簇，拿到同事件所有成员
- 返回 `{ item: FeedItem, siblings: FeedItem[], score, coverageCount }`

**404**: id 不存在 → `notFound()`。

---

## 5. `/daily` 安全日报页

**路由**: `app/(public)/daily/page.tsx`（最新一期）+ `app/(public)/daily/[date]/page.tsx`（指定日期）

**双栏布局**:
- **左侧 `<aside>` (sticky, ~280px)**: `最新一期` 链接 + 月份折叠组（`› 2026 年 6 月` 展开，列出每天 `26 日 + 头条标题`，点击跳 `/daily/[date]`）
- **右侧**: 日期大标题 + `DailyDigest` 正文（`overview` 专家综述 + 重点条目列表，每条可跳 `/items/[id]`）

**数据**: 新增 `loadDailyDigest(date?)`（放 `lib/hot-page-data.ts`）:
- 读 `readSnapshotsFromStore()` 的 `DailySnapshot[]` 枚举历史日期
- 读 `readDigestFromStore()` 取 `DailyDigest`
- 指定 date: 取该日 snapshot/digest（当前实现 daily digest 无按日存储，用最新 digest + snapshot 列表做日期导航；detail 正文用最新 digest 渲染，标注日期）

**降级**: KV 无数据（本地）→ 用 mock 数据渲染一期骨架，保证可截图验证。

---

## 6. 主题系统（深色/系统/浅色）

**存储**: `localStorage.theme` ∈ `dark | system | light`，默认 `system`。`<html>` 加 `class="dark"` 控制深色。

**防 FOUC**: `app/layout.tsx` 的 `<head>` 内联阻塞脚本，hydrate 前读 localStorage 设 class。

**Tailwind v4 dark mode**: 在 `app/globals.css` 加 `@custom-variant dark (&:where(.dark, .dark *));`，使 `dark:` 前缀基于 `.dark` class 生效。

**组件**:
- `ThemeProvider`（client）: 管理 state + 监听 `prefers-color-scheme`
- `ThemeToggle`: 三态单选组，放 HotShell sidebar 底部

**配色**: 浅色沿用现有 slate 系；深色 bg `#0a0a0a`/`slate-950`，卡片 `slate-900`，文字 `slate-100/400`，边框 `slate-800`。**所有新组件从第一天写双态 `dark:` 前缀**。

**范围**: HotShell + 列表/详情/日报页全双态。现有 PublicShell 页面只加防 FOUC 脚本 + html class hook，不逐页改色（隔离原则）。

---

## 7. Mock 数据

**问题**: 本地无 KV env → API 0 条 → 列表空。
**方案**: 新增 `lib/hot-mock.ts`，导出 `getMockSecurityFeedItems(): FeedItem[]`，约 15-20 条逼真安全样本（CVE、勒索软件、APT、数据泄露，跨多信源制造聚合簇）。`readSecurityFeedItems()` 检测到 KV 空时回退 mock（仅 dev/空态，不影响线上）。同时为 detail/daily 提供对应 mock。
**目的**: 本地开发与 Playwright 截图验证有真实内容。

---

## 8. 复用清单（零改动）

| 现有模块 | 用途 |
|---------|------|
| `lib/hot-page-data.ts` | `loadHotItems` / `hotItemTitle` / `hotItemSummary` |
| `lib/hot-rank.ts` | `rankHotItems` / `clusterItems`（详情页重算簇） |
| `lib/hot-score.ts` | 打分 |
| `lib/digest.ts` | `DailyDigest` 类型（日报页） |
| `lib/snapshot.ts` | `DailySnapshot` / `readSnapshotsFromStore`（日报历史导航） |
| `lib/feeds.ts` | `FeedItem` 类型 + `FEED_SOURCES` |
| `lib/translation-detection.ts` | `pickDisplayTitle` / `pickLocalizedField` |
| `components/CategoryFilter.tsx` | 分类 pills |

---

## 9. 实施阶段（每阶段可独立验证 + 截图）

1. **Phase 1**: HotShell（sidebar）+ 主题系统（provider/toggle/防FOUC/globals.css dark variant）。`/hot` 先接 HotShell 跑通空壳。
2. **Phase 2**: `/hot` 列表页（工具栏 + 紧凑热榜 + 日期分组时间轴）+ mock 数据。
3. **Phase 3**: `/items/[id]` 详情页。
4. **Phase 4**: `/daily` + `/daily/[date]` 日报页。
5. **收尾**: `npm test`、Playwright 截图对比 AI HOT（浅/深双态）。

---

## 10. 不做（YAGNI）

- 不改现有 PublicShell 页面（`/`、`/ai`、`/team`、`/intelligence`、`/mdr`）的布局/配色
- 不做真实登录对接（virxact login）—— 登录为占位
- 不做 AI HOT 的评论/点赞等社区功能（AI HOT 本身也是只读展示）
- 不引入 `next-themes`（手写更可控，零依赖）
