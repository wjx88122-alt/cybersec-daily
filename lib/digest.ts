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
};

export type DailyDigest = {
  date: string;
  overview: string;
  items: DigestItem[];
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

const DIGEST_LOOKBACK_HOURS = 72;
const AI_CATEGORY_PREFIX = "AI ";
const SECURITY_KEYWORDS: Array<[RegExp, number]> = [
  [/\bcve-\d{4}-\d+\b/i, 16],
  [/(zero[- ]day|0[- ]day|在野利用|已被利用|actively exploited)/i, 14],
  [/(rce|remote code execution|提权|privilege escalation|沙箱逃逸)/i, 12],
  [/(勒索软件|ransomware|数据泄露|data breach|供应链|supply chain)/i, 10],
  [/(apt|后门|backdoor|botnet|僵尸网络|恶意软件)/i, 8],
  [/(cisa|msrc|advisory|补丁|patch|fortinet|cisco|microsoft)/i, 6],
];
const AI_KEYWORDS: Array<[RegExp, number]> = [
  [/(模型发布|model release|launch|agent|copilot|多模态|multimodal)/i, 8],
  [/(政策|监管|regulation|compliance|版权|copyright|治理|governance)/i, 10],
  [/(提示注入|prompt injection|越狱|jailbreak|泄露|data leak|abuse|滥用)/i, 12],
  [/(企业落地|enterprise|成本|roi|推理|inference|开源|open[- ]source)/i, 6],
];

type ScoredItem = { item: FeedItem; score: number };

function isAiCategory(category: string): boolean {
  return category.startsWith(AI_CATEGORY_PREFIX);
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreFeedItem(item: FeedItem, now: number): number {
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
  const text = `${title || item.title} ${summary || item.summaryAi || item.summary}`.toLowerCase();
  const patterns = isAiCategory(item.category) ? AI_KEYWORDS : SECURITY_KEYWORDS;
  const pub = new Date(item.pubDate).getTime();
  const ageHours = Number.isFinite(pub)
    ? Math.max(0, (now - pub) / 3_600_000)
    : DIGEST_LOOKBACK_HOURS;

  let score = Math.max(0, DIGEST_LOOKBACK_HOURS - ageHours) * 0.35;
  for (const [re, weight] of patterns) {
    if (re.test(text)) score += weight;
  }

  const source = item.source.toLowerCase();
  if (
    /(cisa|msrc|nvd|talos|mandiant|securityweek|the hacker news)/i.test(source)
  ) {
    score += 3;
  }
  if (
    /(openai|deepmind|google ai|microsoft ai|nvidia|hugging face|langchain)/i.test(
      source,
    )
  ) {
    score += 2;
  }
  if (
    pickLocalizedField({ source: item.title, candidate: item.titleZh }) &&
    pickLocalizedField({
      source: item.summary,
      candidate: item.summaryZh,
      existing: item.summaryAi,
    })
  )
    score += 1;

  return score;
}

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
        content: `你是一位安全产业分析师，为安全公司管理层、产品负责人、生态合作团队、CISO 和关注安全行业的投资/战略团队撰写每日安全产业观察。
你的任务不是复述安全情报，而是从「网络安全事件」和「AI 领域动态」里提炼安全产业视角：需求变化、产品能力缺口、厂商格局、客户预算、采购优先级、生态合作、AI 安全治理和中短期机会风险。

写作要求：
- overview 不是逐条资讯汇总，也不是安全情报简报；必须站在安全产业视角给出自己的优先级判断，主次分明，指出今天安全产业真正发生了什么变化、哪些赛道/能力/厂商动作值得进一步关注
- 不要围绕漏洞技术细节、IOC、修补动作展开；遇到 CVE、在野利用、攻击活动时，要解释它们反映了什么客户需求、产品能力缺口、服务机会或厂商竞争变化
- overview 必须使用以下分条结构，保留标签名：
  产业判断：1句话，给出今天最重要的产业主线判断，不要写成新闻标题
  产业信号：
  1. 2-3条，把安全事件抽象成行业需求、产品趋势、客户预算或生态变化
  市场影响：
  - 2-3条，说明哪些安全赛道、厂商能力、产品形态、渠道生态或采购优先级会受到影响
  关注方向：
  - 2-3条，说明未来 24-72 小时最值得继续观察的产业变量、机会或风险，并说明为什么
- 每条 summary：2-3 句话，结构为：发生了什么 -> 产业含义是什么 -> 对客户、厂商或产品策略的影响是什么
- 安全类与 AI 类都要覆盖，AI 类事件不能缺失
- importance 仅能是 critical/high/medium：
  - critical：会明显改变短期客户需求、采购优先级、厂商产品路线或行业监管关注
  - high：影响面较大，能代表一个重要赛道/能力方向的变化
  - medium：趋势性信息或中期产业观察事项
- 严格按照 JSON 格式输出，不要有任何额外文字`,
      },
      {
        role: "user",
        content: `今天是 ${today}。以下是近72小时候选资讯，格式为：
[序号] [SEC|AI][分类] 来源: 标题 — 摘要 | 链接

${articlesText}

选题标准（按优先级，关注产业含义而非单纯威胁严重性）：
安全方向：
- ✅ 能体现客户需求变化的高频攻击面：暴露面管理、身份权限、云安全、供应链、边界设备、数据安全
- ✅ 能推动产品路线或服务需求的重大漏洞、在野利用、数据泄露、供应链攻击
- ✅ 影响主流厂商、平台生态或渠道合作的补丁/公告/监管动态
- ✅ 能说明安全预算、采购优先级或托管服务需求变化的新型 APT 活动或恶意软件家族

AI 方向：
- ✅ 新模型/能力发布对安全产品、企业安全治理、开发流程或攻防自动化的影响
- ✅ AI 安全事件反映出的新产品需求：AI-SPM、模型安全、Agent 权限治理、数据泄露防护、MCP/插件安全
- ✅ AI 监管/合规/版权政策变动对企业落地、安全厂商产品化和客户预算的实质影响
- ✅ 影响企业部署决策和厂商格局的关键生态变化（成本、开源、基础设施、推理平台）

- ❌ 排除：纯营销、无实质信息的产品宣传、重复报道
- ❌ 避免：只写“立即修补某 CVE / 检查某 IOC / 部署某规则”这类 SOC 处置建议；如果必须提到，请转译成产业需求或产品能力缺口

请输出如下 JSON 格式（不要有 markdown 代码块，直接输出 JSON）：
{
  "date": "${today}",
  "overview": "产业判断：...\\n产业信号：\\n1. ...\\n2. ...\\n市场影响：\\n- ...\\n- ...\\n关注方向：\\n- ...\\n- ...",
  "items": [
    {
      "headline": "中文短标题（20字以内）",
      "summary": "2-3句话：发生了什么、产业含义是什么、对客户/厂商/产品策略的影响是什么",
      "importance": "critical|high|medium",
      "category": "分类名",
      "sourceTitle": "中文来源标题（若原文为英文请翻译）",
      "sourceLink": "原文链接"
    }
  ]
}

从各类别中选取最重要事件，共9-12条并按重要性排序，且满足：
- 至少 6 条安全类（SEC）
- 至少 2 条 AI 类（AI）
- 覆盖漏洞预警、威胁情报，以及至少两个 AI 子类别。`,
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
