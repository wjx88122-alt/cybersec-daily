# cybersec-daily

一个面向中文读者的网络安全与 AI 日报站点，内置资讯聚合、自动翻译、摘要生成、情报中心和 MDR 演示模块。

- 线上地址: [cybersec-daily.vercel.app](https://cybersec-daily.vercel.app)
- 仓库: [wjx88122-alt/cybersec-daily](https://github.com/wjx88122-alt/cybersec-daily)
- 技术栈: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vercel Cron, Upstash Redis, OpenAI-compatible LLM providers

## Design References

这个项目已经引入仓库级设计说明文件 [`DESIGN.md`](./DESIGN.md)，用于约束 AI agent 和人工协作时的视觉输出。

它的写法参考了：

- [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)

但实际内容已经针对 `cybersec-daily` 的 5 个产品模式做了本地化适配，而不是直接照搬上游示例。

第三方设计参考归属见 [`docs/third-party.md`](./docs/third-party.md)。

## 项目概览

这个项目不是单纯的资讯列表页，而是一个围绕“安全资讯聚合 -> 翻译与修复 -> 摘要生成 -> 情报与运营展示”串起来的站点。

当前包含 5 个顶层入口：

- `/` 安全资讯首页，聚合近 24 小时网络安全资讯
- `/ai` AI 资讯页，聚合 AI 产品、研究、政策与工程动态
- `/team` 总裁辅助团队页面，展示多角色 AI 幕僚编制
- `/intelligence` 情报中心，采用 briefing-first 的 Threat Intelligence Command Center 布局
- `/mdr` MDR 演示页，包含工单派发、SOC 仪表板和关联子页

## 主要能力

### 1. 多源资讯聚合

站点通过多个 API 路由拉取安全与 AI 内容：

- `/api/feed-a`
- `/api/feed-b`
- `/api/feed-ai`
- `/api/feed`

前端页面使用统一的 feed client 读取这些结果，并在客户端完成排序、筛选和搜索。

### 2. 自动翻译与自愈

项目会把英文资讯翻译成中文，并在最近内容缺少中文字段时自动触发修复。

相关能力包括：

- `/api/translate`
- `/api/translation-health`
- `lib/translate.ts`
- `lib/translation-health.ts`

支持的 LLM 优先级是：

1. `DEEPSEEK_API_KEY`
2. `KIMI_API_KEY`
3. `OPENAI_API_KEY`

### 3. 每日摘要与快照

站点会基于近期内容生成摘要和每日快照，供首页和后续展示消费。

相关能力包括：

- `/api/digest`
- `lib/digest.ts`
- `lib/snapshot.ts`

### 4. 云端定时刷新

Vercel 上只保留了一个 cron 入口：

- `/api/cron`

这个入口会负责：

- 刷新 feed 缓存
- 触发图片抓取
- 触发翻译修复
- 更新每日快照

相关配置见 [`vercel.json`](./vercel.json)。

### 5. 情报中心与运营演示模块

除了资讯站点本身，这个仓库还内置两个偏产品演示 / 工作台性质的模块：

- `/intelligence`
  现在是新的 Threat Intelligence Command Center，强调态势、重点活动、暴露面和 analyst drilldown
- `/mdr`
  展示 MDR 工单派发、运营中心、网络侧视图与 Splunk 映射页面

## 路由结构

### 页面路由

- `/`
- `/ai`
- `/team`
- `/team/decisions`
- `/team/decisions/[slug]`
- `/intelligence`
- `/mdr`
- `/mdr/dashboard`
- `/mdr/network`
- `/mdr/splunk`

### API 路由

- `/api/cron`
- `/api/digest`
- `/api/feed`
- `/api/feed-a`
- `/api/feed-ai`
- `/api/feed-b`
- `/api/images`
- `/api/summarize`
- `/api/translate`
- `/api/translation-health`

## 本地开发

### 依赖安装

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

默认访问：

- [http://localhost:3000](http://localhost:3000)

### 运行测试

```bash
npm test
```

### 生产构建

```bash
npm run build
```

## 环境变量

### 必需

这些变量至少应该在部署环境中配置：

- `CRON_SECRET`
  用于保护 `/api/cron`、`/api/translate`、`/api/images`、`/api/summarize` 等内部触发接口

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
  用于 Upstash Redis / KV 缓存

### LLM 提供方

至少配置一个：

- `DEEPSEEK_API_KEY`，推荐
- `KIMI_API_KEY`
- `OPENAI_API_KEY`

可选模型变量：

- `DEEPSEEK_MODEL`
- `KIMI_MODEL`
- `OPENAI_MODEL`

### 站点地址

- `APP_BASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `VERCEL_URL`

项目会通过 `lib/app-url.ts` 优先解析云端可达地址，保证 cron 和后续链路尽量走云端而不是本地回环地址。

## 目录说明

```text
DESIGN.md                   仓库级设计系统说明，供 AI agent / 贡献者读取

app/
  page.tsx                  安全资讯首页
  ai/page.tsx               AI 资讯页
  intelligence/             新情报中心
  mdr/                      MDR 演示模块
  team/                     多角色团队页
  api/                      Feed / cron / translate / digest 等接口

components/
  NavBar.tsx
  NewsCard.tsx
  CategoryFilter.tsx
  ThreatMap.tsx
  NetworkTopology.tsx

lib/
  feed-client.ts
  feed-refresh.ts
  translate.ts
  digest.ts
  snapshot.ts
  app-url.ts
  kv.ts
  deepseek.ts

tests/
  *.test.mjs                关键回归测试

docs/
  third-party.md            第三方设计参考与归属说明
```

## 设计与内容定位

这个项目目前同时承担两类职责：

- 一个真实可部署的安全 / AI 内容站点
- 一个可持续演进的安全产品界面实验场

因此仓库里既有：

- 面向资讯消费的首页与 AI 页
- 面向情报和安全运营演示的 `/intelligence` 与 `/mdr`
- 面向角色化协同展示的 `/team`

如果你只关心资讯聚合能力，从首页、AI 页和 `/api/*` 路由看即可；如果你关心安全产品 UI，重点看 `/intelligence`、`/mdr` 和 `app/globals.css`。

## 测试与质量

当前测试覆盖重点放在以下几类回归：

- feed client 合并与排序
- cron 配置与刷新策略
- 时间与摘要输入逻辑
- URL 安全性与应用基地址解析
- intelligence 路由结构契约
- 历史功能移除回归（如 Huawei 相关页面）

测试命令：

```bash
npm test
```

## 部署

项目设计为优先部署到 Vercel。

当前 `vercel.json` 中配置了：

- 单一 cron 入口
- 不同 API 路由的 `maxDuration`

推荐部署方式：

1. 在 Vercel 导入仓库
2. 配置上面的环境变量
3. 确认 cron 已启用
4. 用生产域名配置 `APP_BASE_URL`

### 正确提交到 Vercel 的推荐流程

1. 在提交前先本地自检（你本地路径不是固定路径，所以先执行）：

```bash
npm test
npm run build
```

2. 确认本地仓库已正确关联到 GitHub 仓库（不是本地路径）：

```bash
git remote -v
# 若不是 https://github.com/wjx88122-alt/cybersec-daily.git，请先设置
git remote set-url origin https://github.com/wjx88122-alt/cybersec-daily.git
```

3. 提交到远端（Vercel 推荐监听 `main` 分支）：

```bash
git add .
git commit -m "chore: fix for Vercel submission"
git push origin main
```

4. 在 Vercel 项目里确认 `Production Branch` 指向 `main`，推送后会自动触发生产部署。

5. 仅在需要手工触发时，使用 Vercel CLI：

```bash
npm i -g vercel
vercel link
vercel --prod
```

如果你只希望生成预览版，可先跑 `vercel --prebuilt` 或在链接到仓库后创建 PR 触发预览部署。

## 后续可扩展方向

- 增加更多安全 / AI 内容源
- 为 digest 增加更稳定的人工校验或审阅机制
- 将 `/intelligence` 从演示数据逐步切回真实情报源
- 将 `/mdr` 接入更真实的工单和告警模型
- 增加更完整的观测、缓存和失败重试面板
