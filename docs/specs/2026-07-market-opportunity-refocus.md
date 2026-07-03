# Spec: 市场机会重构(Market Opportunity Refocus)

## 背景与目标

站点服务对象升级为**网络安全产品线总裁**。日报核心价值从"产业观察"进一步聚焦到**市场新机会**:
哪些需求信号、竞品动态、并购融资、政策窗口、技术拐点值得产品线跟进,以及建议的动作。

改造分两层:

- **内容层**:digest 生成 prompt 重写为机会视角;评分关键词补充市场信号;新增市场类信源。
- **UI 层**:首页 hero 改为"机会雷达"语言;新增"今日机会看板"——把 digest items 渲染成机会卡片
  (现状:digest items 生成了但**没有任何页面渲染它们**,`components/DigestCard.tsx` 是死代码,本次重建并接线)。

## 红线(禁止改动)

- `app/(executive)/**`、`app/(ops)/**` 全部禁改。
- `lib/feed-store.ts`、`lib/feed-pipeline.ts`、`lib/kv.ts`、`lib/kv-optional.ts`、`lib/mdr-mock.ts`、`lib/network-mock.ts` 禁改。
- `components/shells/**` 禁改(首页复用 PublicShell,不动壳)。
- `package.json`:不得新增依赖。
- 不得删除任何现有测试文件;修改现有测试断言仅限「断言的是本次合法变更的首页文案/标签」,且每处修改要在最终报告里列出理由。
- 数据兼容:KV 里存量 digest 是旧结构(无新字段、旧 overview 标签)。所有新 UI/解析必须在缺新字段时优雅降级,禁止 crash 或渲染 `undefined`。

## 任务分解(每步一个小 patch,≤60 行;每步结束跑自检)

### Step 1 — `lib/digest.ts`:类型扩展

`DigestItem` 增加可选字段:

```ts
opportunityType?: "需求信号" | "竞品动态" | "并购融资" | "政策窗口" | "技术拐点";
segment?: string;   // 受影响赛道,如 "云安全"、"身份治理"
action?: string;    // 一句话产品动作建议(总裁视角:立项评估/跟进合作/纳入路线图/观察)
```

`enrichDigestWithFeedItems` 原样透传新字段(spread 已覆盖则无需改)。

### Step 2 — `lib/digest.ts`:system prompt 重写

角色改为:「你是网络安全产品线总裁的首席市场情报官」。核心要求:

- 不复述威胁情报;每条资讯都要回答"这对我们产品线是不是机会、是什么类型的机会、建议什么动作"。
- overview 结构改为以下标签(保留标签名,格式与现有一致):
  - `机会判断：` 1 句话,今天最值得总裁知道的市场机会主线
  - `机会信号：` 2-3 条,需求变化/新预算/新采购优先级
  - `竞争与格局：` 2-3 条,竞品发布、并购融资、厂商合纵连横
  - `布局建议：` 2-3 条,未来 24-72 小时建议的动作(评估/接触/立项/观察)及理由
- importance 语义重定义(枚举值不变,保证存量数据兼容):
  - `critical` = 建议一周内启动评估的近期机会/威胁到本产品线的竞争变化
  - `high` = 建议纳入路线图/合作讨论的方向性机会
  - `medium` = 持续跟踪的趋势信号

### Step 3 — `lib/digest.ts`:user prompt 选题标准重写

选题优先级改为(高→低):

1. 并购、融资、IPO、大额合同/中标——直接的资本与市场信号
2. 竞品/主流厂商产品发布、GA、定价、渠道策略变化
3. 监管/合规新规创造的采购窗口(合规驱动预算)
4. 重大事件(泄露/在野利用/供应链攻击)→ 转译成需求爆发点与能力缺口
5. AI 带来的新品类机会(AI-SPM、Agent 安全、模型安全)与 AI 对现有品类的重构
6. 分析师报告/市场数据(Gartner、IDC、市场规模预测)

排除:纯技术细节、IOC/修补建议、无市场含义的研究文章。
JSON 输出模板中 items 增加 `opportunityType`、`segment`、`action` 三个字段(给出与 Step 1 枚举一致的说明)。
数量约束改为:9-12 条,至少 3 条竞品/资本类,至少 2 条 AI 类,其余按机会价值排序。

### Step 4 — `lib/hot-score.ts`:市场信号关键词(纯增量)

`SECURITY_KEYWORDS` 追加市场信号条目(不修改、不删除既有条目,权重参考):

```ts
[/(acqui(?:re|sition)|merger|\bm&a\b|并购|收购)/i, 14],
[/(funding|raises?\s+\$|series\s+[a-e]\b|ipo|融资|上市)/i, 13],
[/(launches?|general availability|\bga\b|unveils?|发布|上线)/i, 8],
[/(gartner|idc|forrester|magic quadrant|market (?:share|size|forecast)|市场规模)/i, 8],
[/(partnership|alliance|渠道|合作伙伴|集成)/i, 6],
```

注意 `\bga\b` 误报风险:若测试或试跑发现误报明显,可收紧为 `general availability|generally available`。

### Step 5 — `lib/feeds.ts`:新增市场类信源

新增分类 `市场与资本`,追加信源(加到 FEED_SOURCES_A 末尾,格式与现有一致):

```
- Return on Security — https://www.returnonsecurity.com/feed — 安全行业融资/并购周报
- CRN Security News — https://www.crn.com/rss — 渠道与厂商市场动态
- Help Net Security — https://www.helpnetsecurity.com/feed/ — 含行业新闻与新品发布
```

若某 URL 在代码层无法验证可用性,照常加入(管线对失效 feed 已有容错);验收阶段由验收方 curl 验证。
若 Help Net Security 已存在于信源列表,跳过它,不要重复添加。

### Step 6 — `lib/feed-view-model.js`:解析新标签(纯增量,保留旧标签)

- `JUDGMENT_LABEL_PATTERN` 追加 `机会判断|市场判断`。
- `SECTION_LABEL_PATTERN` 追加 `机会信号|竞争与格局|布局建议`。
- `SECTION_META` 追加:
  - `机会信号`: intent "signal", icon "chart", priority "SIGNAL"
  - `竞争与格局`: intent "impact", icon "network", priority "MARKET"
  - `布局建议`: intent "action", icon "check", priority "NEXT"
- `sourceLabel` 文案 `"LLM 安全产业观察生成"` → `"LLM 市场机会雷达生成"`。
- 旧标签(产业判断/产业信号/市场影响/关注方向等)全部保留——存量 digest 必须照常渲染。

### Step 7 — `components/DigestCard.tsx`:重建为机会卡片

保持文件名与默认导出签名(`{ item, featured }`)。改动:

- `IMPORTANCE_CONFIG` 标签与色系改为机会语言(告别威胁红):
  - `critical` → 标签 `优先布局`,indigo/blue 系
  - `high` → 标签 `重点评估`,teal/cyan 系
  - `medium` → 标签 `持续观察`,slate 系
  - 渐变条、badge、hover 边框、glow 同步换色,结构不变。
- badges 行:importance badge 后追加 `opportunityType` chip(字段存在才渲染);category chip 保留。
- summary 下方新增可选 action 行:`item.action` 存在时渲染,格式
  `建议动作:{action}`,前置 `check` 图标,小字号、与 footer 风格一致。
- `segment` 存在时渲染在 category chip 旁(同样式的小 chip)。
- 所有新字段缺失时布局与旧数据完全兼容。

### Step 8 — 首页接线:机会看板

- `app/(public)/page.tsx`:
  - 把 `digest?.items ?? []` 作为新 prop `digestItems` 传入 `FeedLandingClient`。
  - 文案更新:eyebrow `市场机会日报`;headline `今日市场机会`;chips 改为
    `["过去 24 小时市场信号", "先看机会,再看动态"]`;`briefLabel` `今日机会`;
    `browseHint`、`listDescription` 相应改写(围绕"机会/竞争/布局"用语)。
- `components/feed/FeedLandingClient.tsx`:
  - props 增加 `digestItems?: DigestItem[]`(从 `@/lib/digest` 导入类型)。
  - hero 区之后、新闻列表(briefLabel section)之前,渲染新 section「今日机会看板」:
    - 有 items 时:第一条 `featured` 大卡 + 其余按 2-3 列 grid 渲染 `DigestCard`。
    - 空数组/undefined 时整个 section 不渲染。
    - section 标题行样式复用页面现有 section 标签样式(`public-section-label` 或临近既有模式)。
  - hero 内 `产业雷达` 标题及副句改为 `机会雷达` / `从机会信号、竞争格局和布局建议拆解今天的市场主线`。

### Step 9 — 测试

新增 `tests/market-opportunity-refocus.test.mjs`(node --test,参考现有测试风格,读源码文本断言 + 直接 import feed-view-model):

1. `lib/digest.ts` 源码含 `机会判断`、`机会信号`、`竞争与格局`、`布局建议`、`opportunityType`、`首席市场情报官`。
2. `buildFeedLandingState`(或直接测 overview 解析路径)对含新标签的 overview 文本能解析出 3 个 section,intent 分别为 signal/impact/action;judgmentLabel 为 `机会判断`。
3. 旧标签 overview(产业判断/产业信号/市场影响/关注方向)仍能解析——回归保护。
4. `components/DigestCard.tsx` 含 `优先布局`、`重点评估`、`持续观察`、`建议动作`。
5. `app/(public)/page.tsx` 含 `市场机会`;`lib/feeds.ts` 含 `市场与资本`。

若现有测试(如 `security-ui-optimization.test.mjs`、`ui-localization.test.mjs`、`apple-system-redesign.test.mjs`)断言了被本次合法修改的首页文案/标签,允许最小幅度更新断言,并逐处记录理由。

## 自检命令(每步跑,最后全绿)

```bash
npm test
npm run lint
npm run build
```

## 验收标准

1. `npm test`、`npm run lint`、`npm run build` 全部通过。
2. 首页(存量旧 digest 或无 digest)渲染不报错——降级路径可用。
3. 新 overview 标签可被 view-model 解析为带正确 intent 的 sections。
4. DigestCard 新旧数据均可渲染;机会看板在无 items 时不出现。
5. 红线文件 `git diff` 零改动。
6. 未删除测试;所有测试断言改动均有逐条理由。
