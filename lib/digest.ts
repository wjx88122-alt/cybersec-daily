import { jsonrepair } from "jsonrepair";
import { getDeepSeekClient, getLLMChatOptions, getLLMModel } from "./deepseek";
import { FeedItem } from "./feeds";
import { pickDisplayTitle, pickLocalizedField } from "./translation-detection";

export type DigestItem = {
  headline: string;
  summary: string;
  importance: "critical" | "high" | "medium";
  category: string;
  sourceTitle: string;
  sourceLink: string;
  opportunityType?: "需求信号" | "竞品动态" | "并购融资" | "政策窗口" | "技术拐点";
  segment?: string;
  action?: string;
};

export type OpportunityBoardAnalysis = {
  synthesis: string;
  hotSegments: Array<{ name: string; reason: string }>;
  portfolioMoves: string[];
};

export type DailyDigest = {
  date: string;
  overview: string;
  items: DigestItem[];
  boardAnalysis?: OpportunityBoardAnalysis;
};

function normalizeLink(link: string): string {
  try {
    const u = new URL(link);
    u.hash = "";
    // Normalize trailing slash but keep root path intact.
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return link.trim();
  }
}

function enrichDigestWithFeedItems(
  digest: DailyDigest,
  feedItems: FeedItem[],
): DailyDigest {
  const byLink = new Map(feedItems.map((item) => [normalizeLink(item.link), item]));

  return {
    ...digest,
    items: digest.items.map((entry) => {
      const matched = byLink.get(normalizeLink(entry.sourceLink));
      if (!matched) {
        return { ...entry, sourceTitle: entry.sourceTitle || entry.headline };
      }

      const resolvedSourceTitle = pickDisplayTitle({
        source: matched.title,
        candidate: matched.titleZh,
        existing: entry.sourceTitle,
        summarySource: matched.summary,
        summaryCandidate: matched.summaryZh,
        summaryExisting: matched.summaryAi,
      });

      return {
        ...entry,
        sourceTitle: resolvedSourceTitle || matched.title || entry.headline,
        category: matched.category || entry.category,
      };
    }),
  };
}

// 评分原语已迁移到 lib/hot-score.ts (自包含、可被 node --test 直接加载)。
// 这里 re-export 以保持对既有引用方的兼容 (零行为变更)。
export {
  DIGEST_LOOKBACK_HOURS,
  AI_CATEGORY_PREFIX,
  SECURITY_KEYWORDS,
  AI_KEYWORDS,
  isAiCategory,
  normalizeTitle,
  scoreFeedItem,
} from "./hot-score";
import {
  isAiCategory,
  normalizeTitle,
  scoreFeedItem,
  type ScoredItem,
} from "./hot-score";


function pickWithCoverage(
  scoredItems: ScoredItem[],
  total: number,
  maxPerSource: number,
  maxPerCategory: number,
): FeedItem[] {
  const selected: FeedItem[] = [];
  const selectedIds = new Set<string>();
  const sourceCount = new Map<string, number>();
  const categoryCount = new Map<string, number>();
  const byCategory = new Map<string, ScoredItem[]>();

  for (const entry of scoredItems) {
    if (!byCategory.has(entry.item.category)) byCategory.set(entry.item.category, []);
    byCategory.get(entry.item.category)!.push(entry);
  }

  const categoryOrder = [...byCategory.entries()]
    .sort((a, b) => (b[1][0]?.score ?? 0) - (a[1][0]?.score ?? 0))
    .map(([category]) => category);

  const canTake = (entry: ScoredItem) => {
    if (selectedIds.has(entry.item.id)) return false;
    if ((sourceCount.get(entry.item.source) ?? 0) >= maxPerSource) return false;
    if ((categoryCount.get(entry.item.category) ?? 0) >= maxPerCategory)
      return false;
    return true;
  };

  const take = (entry: ScoredItem) => {
    selected.push(entry.item);
    selectedIds.add(entry.item.id);
    sourceCount.set(entry.item.source, (sourceCount.get(entry.item.source) ?? 0) + 1);
    categoryCount.set(
      entry.item.category,
      (categoryCount.get(entry.item.category) ?? 0) + 1,
    );
  };

  // Pass 1: guarantee category coverage
  for (const category of categoryOrder) {
    if (selected.length >= total) break;
    const candidate = byCategory.get(category)?.find(canTake);
    if (candidate) take(candidate);
  }

  // Pass 2: fill remaining slots by score
  for (const entry of scoredItems) {
    if (selected.length >= total) break;
    if (canTake(entry)) take(entry);
  }

  return selected;
}

function selectRepresentativeItems(
  items: FeedItem[],
  total: number,
): FeedItem[] {
  const now = Date.now();
  const sortedByTime = [...items].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );

  const seenTitles = new Set<string>();
  const deduped = sortedByTime.filter((item) => {
    const title = pickLocalizedField({
      source: item.title,
      candidate: item.titleZh,
      existing: item.title,
    });
    const key = normalizeTitle(title || item.title);
    if (!key || seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  const scored = deduped
    .map((item) => ({ item, score: scoreFeedItem(item, now) }))
    .sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.item.pubDate).getTime() - new Date(a.item.pubDate).getTime();
    });

  const scoredSecurity = scored.filter((s) => !isAiCategory(s.item.category));
  const scoredAI = scored.filter((s) => isAiCategory(s.item.category));

  // Keep a mixed pool: mostly security events, plus meaningful AI updates.
  const desiredAi = scoredAI.length > 0 ? Math.max(6, Math.round(total * 0.3)) : 0;
  const aiTarget = Math.min(desiredAi, scoredAI.length);
  const securityTarget = Math.min(total - aiTarget, scoredSecurity.length);

  const selectedSecurity = pickWithCoverage(scoredSecurity, securityTarget, 2, 6);
  const selectedAI = pickWithCoverage(scoredAI, aiTarget, 2, 4);

  const selected = [...selectedSecurity, ...selectedAI];
  const selectedIds = new Set(selected.map((i) => i.id));
  for (const entry of scored) {
    if (selected.length >= total) break;
    if (selectedIds.has(entry.item.id)) continue;
    selected.push(entry.item);
    selectedIds.add(entry.item.id);
  }

  const scoreById = new Map(scored.map((entry) => [entry.item.id, entry.score]));
  return selected
    .sort((a, b) => {
      const scoreDiff = (scoreById.get(b.id) ?? 0) - (scoreById.get(a.id) ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    })
    .slice(0, total);
}

export async function generateDigest(items: FeedItem[]): Promise<DailyDigest> {
  // Select up to 48 high-signal items with security+AI mixed coverage.
  const recent = selectRepresentativeItems(items, 48);

  const articlesText = recent
    .map(
      (item, i) => {
        const title = pickLocalizedField({
          source: item.title,
          candidate: item.titleZh,
          existing: item.title,
        });
        const summary = pickLocalizedField({
          source: item.summary,
          candidate: item.summaryZh,
          existing: item.summaryAi,
        });

        return `[${i + 1}] [${isAiCategory(item.category) ? "AI" : "SEC"}][${item.category}] ${item.source}: ${title || item.title} — ${(summary || item.summaryAi || item.summary).slice(0, 170)} | ${item.link}`;
      },
    )
    .join("\n");

  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Shanghai",
  });

  const client = getDeepSeekClient();
  const model = getLLMModel("analysis");
  const response = await client.chat.completions.create({
    model,
    ...getLLMChatOptions("analysis"),
    max_tokens: 8192,
    messages: [
      {
        role: "system",
        content: `你是网络安全产品线总裁的首席市场情报官，为产品线总裁撰写每日市场机会雷达。
你的任务不是复述威胁情报，而是从「网络安全事件」「AI 领域动态」「竞品和资本动作」里判断：这对我们产品线是不是机会、是什么类型的机会、建议什么动作。

写作要求：
- overview 不是逐条资讯汇总，也不是威胁情报简报；必须站在网络安全产品线总裁视角给出优先级判断，指出今天哪些需求信号、竞品动态、资本动作、政策窗口或技术拐点值得跟进
- 不要围绕漏洞技术细节、IOC、修补动作展开；遇到 CVE、在野利用、攻击活动时，要解释它们反映了什么客户需求、产品能力缺口、采购窗口、竞品压力或产品线机会
- overview 必须使用以下分条结构，保留标签名：
  机会判断：1句话，今天最值得总裁知道的市场机会主线
  机会信号：
  1. 2-3条，说明需求变化、新预算或新采购优先级
  竞争与格局：
  - 2-3条，说明竞品发布、并购融资或厂商合纵连横
  布局建议：
  - 2-3条，说明未来 24-72 小时建议的动作（评估/接触/立项/观察）及理由
- 输出 boardAnalysis 字段，基于最终选出的条目做跨条目综合，不得复述 overview 内容；hotSegments 按热度排序并给出一句话原因；portfolioMoves 必须是组合视角动作，不能重复单条目的 action
- 每条 summary：2-3 句话，结构为：发生了什么 -> 机会含义是什么 -> 对客户、竞品格局或产品策略的影响是什么
- 安全类与 AI 类都要覆盖，AI 类事件不能缺失
- importance 仅能是 critical/high/medium：
  - critical：建议一周内启动评估的近期机会/威胁到本产品线的竞争变化
  - high：建议纳入路线图/合作讨论的方向性机会
  - medium：持续跟踪的趋势信号
- 严格按照 JSON 格式输出，不要有任何额外文字`,
      },
      {
        role: "user",
        content: `今天是 ${today}。以下是近72小时候选资讯，格式为：
[序号] [SEC|AI][分类] 来源: 标题 — 摘要 | 链接

${articlesText}

选题标准（按优先级，关注市场机会价值而非单纯威胁严重性）：
1. 并购、融资、IPO、大额合同/中标——直接的资本与市场信号
2. 竞品/主流厂商产品发布、GA、定价、渠道策略变化
3. 监管/合规新规创造的采购窗口（合规驱动预算）
4. 重大事件（泄露/在野利用/供应链攻击）→ 转译成需求爆发点与能力缺口
5. AI 带来的新品类机会（AI-SPM、Agent 安全、模型安全）与 AI 对现有品类的重构
6. 分析师报告/市场数据（Gartner、IDC、市场规模预测）

- ❌ 排除：纯技术细节、IOC/修补建议、无市场含义的研究文章、纯营销、无实质信息的产品宣传、重复报道
- ❌ 避免：只写“立即修补某 CVE / 检查某 IOC / 部署某规则”这类 SOC 处置建议；如果必须提到，请转译成需求爆发点、能力缺口或竞品机会

请输出如下 JSON 格式（不要有 markdown 代码块，直接输出 JSON）：
{
  "date": "${today}",
  "overview": "机会判断：...\\n机会信号：\\n1. ...\\n2. ...\\n竞争与格局：\\n- ...\\n- ...\\n布局建议：\\n- ...\\n- ...",
  "items": [
    {
      "headline": "中文短标题（20字以内）",
      "summary": "2-3句话：发生了什么、机会含义是什么、对客户/竞品格局/产品策略的影响是什么",
      "importance": "critical|high|medium",
      "opportunityType": "需求信号|竞品动态|并购融资|政策窗口|技术拐点",
      "segment": "受影响赛道，如 云安全、身份治理、数据安全、AI 安全",
      "action": "一句话产品动作建议，如 立项评估/跟进合作/纳入路线图/观察",
      "category": "分类名",
      "sourceTitle": "中文来源标题（若原文为英文请翻译）",
      "sourceLink": "原文链接"
    }
  ],
  "boardAnalysis": {
    "synthesis": "2-3句：今天这批机会合起来说明了什么",
    "hotSegments": [{ "name": "赛道名", "reason": "一句话原因" }],
    "portfolioMoves": ["组合式布局动作及理由"]
  }
}

从各类别中选取最重要事件，共9-12条并按机会价值排序，且满足：
- 至少 3 条竞品/资本类（竞品动态、并购融资、合同中标、渠道策略均可）
- 至少 2 条 AI 类（AI-SPM、Agent 安全、模型安全或 AI 重构现有安全品类）
- 其余按机会价值排序，避免纯技术细节和无市场含义的研究文章。`,
      },
    ],
  });

  let jsonText = response.choices[0]?.message?.content?.trim() ?? "";

  // Strip markdown code fences if present
  jsonText = jsonText
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  // Try standard parse, then jsonrepair
  try {
    const digest = JSON.parse(jsonText) as DailyDigest;
    return enrichDigestWithFeedItems(digest, recent);
  } catch {
    /* fall through to repair */
  }

  try {
    const digest = JSON.parse(jsonrepair(jsonText)) as DailyDigest;
    return enrichDigestWithFeedItems(digest, recent);
  } catch {
    console.error("DIGEST JSON PARSE FAILED, raw:", jsonText.slice(0, 500));
    /* fall through to fallback */
  }

  // Last resort fallback
  return {
    date: today,
    overview: "今日关键资讯摘要生成失败，请直接浏览原始资讯。",
    items: recent.slice(0, 9).map((item) => ({
      headline: (pickLocalizedField({
        source: item.title,
        candidate: item.titleZh,
        existing: item.title,
      }) ||
        item.title ||
        item.summary).slice(0, 20),
      summary: (
        pickLocalizedField({
          source: item.summary,
          candidate: item.summaryZh,
          existing: item.summaryAi,
        }) ||
        item.summary ||
        item.title
      ).slice(0, 120),
      importance: "medium" as const,
      category: item.category,
      sourceTitle:
        pickLocalizedField({
          source: item.title,
          candidate: item.titleZh,
          existing: item.title,
        }) || item.title,
      sourceLink: item.link,
    })),
  };
}
