# cybersec-daily

一个面向中文读者的网络安全与 AI 日报产品套件，既包含真实可部署的资讯聚合链路，也包含面向演示和产品化探索的情报、MDR、团队工作台。

- 线上地址: [cybersec-daily.vercel.app](https://cybersec-daily.vercel.app)
- 仓库地址: [wjx88122-alt/cybersec-daily](https://github.com/wjx88122-alt/cybersec-daily)
- 技术栈: Next.js 16、React 19、TypeScript、Tailwind CSS 4、Vercel Cron、Upstash Redis、OpenAI-compatible LLM providers

## 当前状态

这个仓库已经不是单一资讯站，而是 5 个入口组成的一套安全产品体验：

- `/` 安全资讯首页
- `/ai` AI 资讯页
- `/intelligence` 情报中心
- `/mdr` MDR 工作台及其子页
- `/team` Executive Team 工作台及其子页

最近一轮重构把重点放在两件事上：

- 把公共页、情报页、MDR、Team 收回到同一套系统层和 route-group 架构里
- 把 `MDR` 和 `Team` 从“展示页”继续推进到更像真实产品工作台的交互语言

对应说明见：

- [DESIGN.md](./DESIGN.md)
- [docs/2026-04-workbench-ui-refactor.md](./docs/2026-04-workbench-ui-refactor.md)
- [docs/third-party.md](./docs/third-party.md)

## 产品结构

### Public surfaces

- `/` 聚合近 24 小时网络安全资讯
- `/ai` 聚合 AI 产品、研究、政策与工程动态
- 支持分类筛选、搜索、中文翻译、图片修复和“最近可用”回退视图

### Intelligence

- `/intelligence`
- 采用 briefing-first 的 Threat Intelligence Command Center 布局
- 更偏 analyst workspace，而不是内容门户

### MDR

- `/mdr`
- `/mdr/dashboard`
- `/mdr/network`
- `/mdr/splunk`
- 现在是统一语义主题层下的运营工作台，而不是几块彼此独立的 demo 页面

### Team

- `/team`
- `/team/history`
- `/team/decisions`
- `/team/decisions/[slug]`
- 现在是统一的 Executive workbench 语言，围绕 command deck、decision lanes、archive workbench 展开

## 架构概览

### Route groups

顶层路由已经按产品职责拆到不同 route group：

- `app/(public)`：公开资讯页
- `app/(executive)`：`/intelligence` 和 `/team`
- `app/(ops)`：`/mdr*`
- `app/api`：feed、cron、translate、digest 等内部接口

### Shared shells

主要页面不再依赖各自手写外壳，而是通过共享 shell 约束页面骨架：

- `components/shells/PublicShell.tsx`
- `components/shells/MdrShell.tsx`
- `components/shells/TeamShell.tsx`
- `components/shells/ProductSectionShell.tsx`

### Style layers

全局样式已经拆成按职责分层，而不是把所有视觉规则塞进同一份文件：

- `app/styles/tokens.css`
- `app/styles/system.css`
- `app/styles/public.css`
- `app/styles/intelligence.css`
- `app/styles/mdr.css`
- `app/styles/team.css`

### Semantic themes

`MDR` 和 `Team` 的强调色、badge、状态色、统计色不再分散在页面里，而是集中到主题 helper：

- `app/(ops)/mdr/theme.ts`
- `app/(executive)/team/theme.ts`

这一步的目的不是“抽常量”，而是让各个页面在改视觉语义时只动一个中心层。

### Feed view model

公共资讯页的筛选与时间窗状态由独立 view model 管理：

- `lib/feed-view-model.js`

它现在会在“过去 24 小时没有命中内容”时自动回退到“最近可用”结果，避免首页看起来像站点失效。

## 主要能力

### 1. 多源资讯聚合

站点通过多个 API 路由拉取安全与 AI 内容：

- `/api/feed-a`
- `/api/feed-b`
- `/api/feed-ai`
- `/api/feed`

核心实现主要在：

- `lib/feed-client.ts`
- `lib/feed-page-data.ts`
- `lib/feed-pipeline.ts`
- `lib/feed-refresh.ts`

### 2. 自动翻译、自检和修复

项目会把英文资讯翻译成中文，并在最近内容缺少中文字段时自动触发修复。

核心接口和模块：

- `/api/translate`
- `/api/translation-health`
- `lib/translate.ts`
- `lib/translation-health.ts`
- `lib/translation-repair.ts`
- `scripts/repair-translations.mjs`

支持的 LLM 优先级：

1. `DEEPSEEK_API_KEY`
2. `KIMI_API_KEY`
3. `OPENAI_API_KEY`

### 3. 每日摘要与快照

站点会基于近期内容生成摘要和每日快照，供首页和后续展示消费。

相关实现：

- `/api/digest`
- `lib/digest.ts`
- `lib/digest-inputs.ts`
- `lib/snapshot.ts`

### 4. 云端定时刷新

Vercel 上只保留一个 cron 入口：

- `/api/cron`

这个入口负责：

- 刷新 feed 缓存
- 触发图片抓取
- 触发翻译修复
- 更新每日快照

相关配置见 [vercel.json](./vercel.json)。

## 项目目录

```text
app/
  (public)/
    page.tsx                  安全资讯首页
    ai/page.tsx               AI 资讯页
  (executive)/
    intelligence/page.tsx     情报中心
    team/                     Executive Team 工作台
    layout.tsx
  (ops)/
    mdr/                      MDR 工作台与子页
    layout.tsx
  api/                        Feed / cron / translate / digest 接口
  styles/                     tokens / system / public / intelligence / mdr / team

components/
  feed/FeedLandingClient.tsx
  shells/
  CategoryFilter.tsx
  NewsCard.tsx
  ThreatMap.tsx
  NetworkTopology.tsx

lib/
  feed-view-model.js          公共资讯页筛选与时间窗状态
  feed-*.ts                   feed 拉取、合并、缓存、刷新
  translate.ts
  digest.ts
  snapshot.ts
  mdr-mock.ts
  network-mock.ts
  app-url.ts

tests/
  *.test.mjs                  架构、UI 契约、回归测试

docs/
  third-party.md
  2026-04-workbench-ui-refactor.md
  superpowers/specs/
  superpowers/plans/
```

## 本地开发

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

默认访问：

- [http://localhost:3000](http://localhost:3000)

常用命令：

```bash
npm test
npm run build
npm run lint
npm run repair:translations
npm run repair:translations:all
```

## 环境变量

### 必需

- `CRON_SECRET`
  用于保护 `/api/cron`、`/api/translate`、`/api/images`、`/api/summarize` 等内部接口
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
  用于 Upstash Redis / KV 缓存

### X / 公众号信源

- `X_BEARER_TOKEN`
  官方 X API Bearer Token，用于长期稳定拉取 X KOL 公开推文。兼容旧名 `TWITTER_BEARER_TOKEN`，但推荐用 `X_BEARER_TOKEN`。
- `RSSHUB_BASE`
  可选。用于公众号 RSSHub 桥接，以及没有 `X_BEARER_TOKEN` 时的 X cookie fallback。

配置说明：

- [docs/deploy-x-api.md](./docs/deploy-x-api.md)
- [docs/deploy-rsshub.md](./docs/deploy-rsshub.md)

### LLM 提供方

至少配置一个：

- `DEEPSEEK_API_KEY`
- `KIMI_API_KEY`
- `OPENAI_API_KEY`

可选模型变量：

- `DEEPSEEK_ANALYSIS_MODEL`
- `DEEPSEEK_TRANSLATION_MODEL`
- `DEEPSEEK_MODEL`
- `KIMI_MODEL`
- `OPENAI_MODEL`

DeepSeek 未设置模型变量时，翻译类任务默认使用 `deepseek-v4-flash`，摘要和日报分析类任务默认使用 `deepseek-v4-pro`。`DEEPSEEK_ANALYSIS_MODEL` / `DEEPSEEK_TRANSLATION_MODEL` 会分别覆盖对应任务；旧的 `DEEPSEEK_MODEL` 会作为全局覆盖同时作用于两类任务。

### 站点地址

- `APP_BASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `VERCEL_URL`

项目会通过 `lib/app-url.ts` 优先解析云端可达地址，尽量避免内部任务退回到本地回环地址。

## 测试与质量

当前测试覆盖重点包括：

- feed 合并、排序、回退和搜索逻辑
- cron 配置与刷新策略
- 翻译修复与检测逻辑
- URL 安全性与应用基地址解析
- route group 与共享 shell 契约
- public、intelligence、team、mdr 的 UI 回归约束
- 历史功能移除回归

验证命令：

```bash
npm test
npm run build
```

## 部署

项目设计为优先部署到 Vercel。

推荐流程：

1. 在 Vercel 导入仓库
2. 配置上面的环境变量
3. 确认 cron 已启用
4. 用生产域名配置 `APP_BASE_URL`
5. 推送 `main` 触发生产部署

本地提交前建议先跑：

```bash
npm test
npm run build
```

如果需要确认远端：

```bash
git remote -v
git push origin main
```

## 后续建议

如果接着往下做，最值当的方向通常是：

- 把 `MDR` 和 `Intelligence` 从 mock 数据逐步换成真实数据源
- 给 digest 增加更明确的人工审阅流程
- 为工作台增加更细的观测、失败重试和任务状态面板
- 继续收紧页面级 copy 和状态文案，让不同产品面的语言也统一起来
