# Spec: 机会模块 LLM 分析总结(v2)

## 背景与目标

在上一轮"市场机会重构"基础上,给机会模块加两层 LLM 分析:

- **A. 看板综合分析(boardAnalysis)**:每日 digest 生成时,同一 LLM 调用追加产出跨条目综合分析
  (赛道热度、条目关联、组合式布局结论),渲染在「今日机会看板」顶部。
- **B. 单卡按需深挖**:每张机会卡加「深度分析」按钮,点击后调用新 API 路由,LLM 对该条机会
  生成结构化深度分析,内嵌展开显示。

## 安全与成本设计(必须严格实现)

- 深挖 API **只接收 `{ headline: string }`**;服务端 `readDigestFromStore()` 反查该 headline
  对应的 digest item,查不到返回 404。绝不把客户端提供的自由文本送入 LLM(防白嫖代理)。
- 结果缓存:key = `opp-analysis:${日期}:${sha256(headline).slice(0,16)}`,用 `lib/kv.ts` 的 `kv`
  (自带内存回退)。命中直接返回,不计配额。
- 全局日配额:key = `opp-analysis-count:${日期}`,默认上限 40(env `OPPORTUNITY_ANALYSIS_DAILY_LIMIT`
  可覆盖),超限返回 429 与友好中文提示。get/set 计数的竞态可接受(软上限)。
- LLM 未配置(无 API key)时返回 503 与友好中文提示,不抛栈。
- 分析结果按纯文本渲染(React 文本节点,天然转义),不使用 dangerouslySetInnerHTML。

## 红线(禁止改动)

- `app/(executive)/**`、`app/(ops)/**`、`components/shells/**` 禁改。
- `lib/feed-store.ts`、`lib/feed-pipeline.ts`、`lib/kv.ts`、`lib/kv-optional.ts` 禁改(只 import)。
- `package.json` 不得新增依赖(hash 用 `node:crypto`)。
- 不得删除测试;修改现有测试断言仅限本次合法变更覆盖的文案,逐处记录理由。
- 存量兼容:旧 digest 无 `boardAnalysis` → 面板不渲染;深挖对旧结构 item(无新字段)也要能分析。

## 任务分解(每步一个 patch ≤60 行)

### Step 1 — `lib/digest.ts`:DailyDigest 类型扩展

```ts
export type OpportunityBoardAnalysis = {
  synthesis: string;                                   // 2-3 句跨条目综合判断
  hotSegments: Array<{ name: string; reason: string }>; // 2-4 个升温赛道及原因
  portfolioMoves: string[];                            // 2-3 条组合式布局动作
};
// DailyDigest 增加可选字段 boardAnalysis?: OpportunityBoardAnalysis;
```

`enrichDigestWithFeedItems` 用 spread 已透传,确认即可。fallback digest 路径不设置该字段。

### Step 2 — `lib/digest.ts`:prompt 增补 boardAnalysis

- system prompt「写作要求」追加:输出 `boardAnalysis` 字段,基于**最终选出的条目**做跨条目综合,
  不得复述 overview 内容;`hotSegments` 按热度排序并给出一句话原因;`portfolioMoves` 是
  组合视角的动作(而非单条目的 action 重复)。
- user prompt JSON 模板在 `items` 之后追加:

```
"boardAnalysis": {
  "synthesis": "2-3句：今天这批机会合起来说明了什么",
  "hotSegments": [{ "name": "赛道名", "reason": "一句话原因" }],
  "portfolioMoves": ["组合式布局动作及理由"]
}
```

### Step 3 — 新建 `lib/opportunity-analysis.ts`

```ts
export type OpportunityAnalysis = { headline: string; analysis: string; };
export function opportunityAnalysisCacheKey(headline: string, dateStamp: string): string;
export function findDigestItemByHeadline(digest: DailyDigest | null, headline: string): DigestItem | null;
export async function runOpportunityAnalysis(item: DigestItem): Promise<string>;
```

- `findDigestItemByHeadline`:trim 后全等匹配。
- `runOpportunityAnalysis`:用 `getDeepSeekClient()` + `getLLMModel("analysis")`(参考 digest.ts 用法),
  max_tokens 1600。system:「你是网络安全产品线总裁的战略参谋,对单条市场机会做深度分析」。
  输出**纯文本**,固定五段、每段以标签行开头(便于前端分段渲染):
  `市场判断：` / `竞争格局：` / `客户与渠道：` / `切入建议：` / `风险与前提：`
  每段 2-4 句;要求结合 item 的 opportunityType/segment/action(字段缺失就按 headline+summary 分析)。
- 本文件不做网络请求以外的副作用,不读 KV(供路由层调用)。

### Step 4 — 新建 `app/api/opportunity-analysis/route.ts`

POST 流程:

1. 解析 body,`headline` 非空字符串且 ≤200 字符,否则 400。
2. `readDigestFromStore()` → `findDigestItemByHeadline`,查不到 404 `{ error: "该机会条目不存在或已过期" }`。
3. 日期戳用 `Asia/Shanghai`(参考 `lib/date-stamp.ts`,有现成函数就复用)。缓存命中 → 200 `{ analysis, cached: true }`。
4. 配额:`kv.get` 计数 ≥ 上限 → 429 `{ error: "今日深度分析次数已用完，请明天再试" }`。
5. `runOpportunityAnalysis` → 写缓存、计数+1 → 200 `{ analysis, cached: false }`。
6. LLM key 缺失或调用失败 → 503/500,中文 error,不泄漏内部细节。
7. `export const maxDuration = 60;` 只导出 POST。

### Step 5 — `vercel.json`:functions 增加

`"app/api/opportunity-analysis/route.ts": { "maxDuration": 60 }`

### Step 6 — `components/DigestCard.tsx`:链接结构重构(交互前置)

- 文件顶部加 `"use client";`。
- 最外层 `<a>` 改为 `<div>`(保留全部样式类;删除整卡 href/target)。
- headline `<h3>` 内容包 `<a href={safeHref} target="_blank" rel="noopener noreferrer">`,
  hover 下划线;footer 的 sourceTitle 一侧同样改为可点击外链(带原 external 图标)。
- 视觉与布局不变;`featured` 行为不变。

### Step 7 — `components/DigestCard.tsx`:深度分析交互

- `useState`:`panel: "closed" | "loading" | "open" | "error"` + `analysis: string`。
- footer 右侧加按钮「深度分析」(带 `spark` 图标,cfg.accent 色);点击:
  - 已 open → 收起;否则 POST `/api/opportunity-analysis`,body `{ headline: item.headline }`。
  - loading 态显示「分析中…」;非 200 显示返回的中文 error 并提供「重试」。
- 展开面板渲染在卡片底部(border-t 分隔):把返回文本按行拆分,匹配
  `/^(市场判断|竞争格局|客户与渠道|切入建议|风险与前提)：/` 的行作为小节标题(加粗),
  其余行为正文段落;整体 12-13px,与卡片风格一致。
- 请求进行中防重复点击;组件卸载后 setState 防护(用 ignore 标志)。

### Step 8 — 看板综合分析面板接线

- `app/(public)/page.tsx`:传 `digestBoardAnalysis={digest?.boardAnalysis}`。
- `components/feed/FeedLandingClient.tsx`:
  - props 增加 `digestBoardAnalysis?: OpportunityBoardAnalysis`(类型从 `@/lib/digest` 导入)。
  - 「今日机会看板」标题行之下、卡片 grid 之上渲染分析面板(字段存在且 synthesis 非空才渲染):
    - synthesis 段落(15px,面板主体);
    - hotSegments:chip 行,`name` 加粗 + `reason` 小字;
    - portfolioMoves:编号列表。
  - 面板样式复用 `public-panel`/现有 rounded 面板模式,顶部小标签「AI 综合分析」带 `spark` 图标。

### Step 9 — 测试 `tests/opportunity-llm-analysis.test.mjs`

1. `lib/digest.ts` 含 `boardAnalysis`、`hotSegments`、`portfolioMoves`、`跨条目`。
2. `lib/opportunity-analysis.ts`:`opportunityAnalysisCacheKey` 同输入稳定、不同 headline 不同 key、
   含日期戳;`findDigestItemByHeadline` 命中/未命中/trim 行为(直接 import .ts,node 25 可去类型运行;
   若 import 失败则降级为源码文本断言并说明)。
3. `app/api/opportunity-analysis/route.ts` 源码含:`readDigestFromStore`、429、404、
   `OPPORTUNITY_ANALYSIS_DAILY_LIMIT`、`maxDuration`;不含 `dangerouslySetInnerHTML`。
4. `components/DigestCard.tsx` 含 `"use client"`、`深度分析`、`分析中`;整卡不再是 `<a`
   开头的根元素(断言根元素为 div 的合理文本特征)。
5. `components/feed/FeedLandingClient.tsx` 含 `AI 综合分析`、`digestBoardAnalysis`。

## 自检命令

```bash
npm test
npm run lint
npm run build
```

## 验收标准

1. 三命令全绿;红线文件零 diff;无新增依赖。
2. 无 digest / 旧 digest(无 boardAnalysis)时首页与看板渲染不变、不 crash。
3. 深挖 API:非法 body→400;未知 headline→404;配额超限→429;无 LLM key→503。
4. DigestCard 无嵌套交互元素(a 内无 button),hydration 无警告。
5. 面板与深挖文案全中文,分析文本纯文本渲染。
