import OpenAI from "openai";
import { jsonrepair } from "jsonrepair";
import { FeedItem } from "./feeds";

const client = new OpenAI({
  apiKey: process.env.KIMI_API_KEY,
  baseURL: "https://api.kimi.com/coding/v1",
});

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

function selectRepresentativeItems(
  items: FeedItem[],
  total: number,
): FeedItem[] {
  // Group by category, take top items from each proportionally
  const byCategory = new Map<string, FeedItem[]>();
  for (const item of items) {
    if (!byCategory.has(item.category)) byCategory.set(item.category, []);
    byCategory.get(item.category)!.push(item);
  }

  const categories = [...byCategory.keys()];
  const perCategory = Math.ceil(total / categories.length);

  const selected: FeedItem[] = [];
  for (const [, catItems] of byCategory) {
    selected.push(...catItems.slice(0, perCategory));
  }

  return selected
    .sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
    )
    .slice(0, total);
}

export async function generateDigest(items: FeedItem[]): Promise<DailyDigest> {
  // Select up to 40 items with proportional category coverage
  const recent = selectRepresentativeItems(items, 40);

  const articlesText = recent
    .map(
      (item, i) =>
        `[${i + 1}] [${item.category}] ${item.source}: ${item.title} — ${(item.summaryAi || item.summary).slice(0, 150)} | ${item.link}`,
    )
    .join("\n");

  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const response = await client.chat.completions.create({
    model: "kimi-k2",
    max_tokens: 8000,
    messages: [
      {
        role: "system",
        content: `你是一位顶级网络安全分析师，为企业安全团队撰写每日威胁简报。
你的读者是 CISO 和高级安全工程师，他们需要快速掌握：今天各个安全领域发生了什么、整体威胁态势如何、是否需要立即行动。

写作要求：
- overview：5-6句话，全面覆盖今日安全态势：①整体威胁趋势 ②漏洞与补丁动态 ③威胁情报与 APT 活动 ④数据泄露与供应链风险 ⑤值得关注的新变化 ⑥整体风险判断与行动建议
- 每条 summary：2-3句话，包含：技术细节、受影响产品/版本、建议缓解措施
- 覆盖所有主要类别：综合资讯、威胁情报、漏洞预警、恶意软件、深度分析、政府/监管
- 严格按照 JSON 格式输出，不要有任何额外文字`,
      },
      {
        role: "user",
        content: `今天是 ${today}，以下是近48小时安全资讯，已按类别标注（格式：序号 [类别] 来源: 标题 — 摘要 | 链接），请生成全面的每日威胁简报。

${articlesText}

选题标准（按优先级）：
- ✅ 有在野利用证据的漏洞（actively exploited）
- ✅ 影响主流产品的高危漏洞（CVSS ≥ 8.0）
- ✅ 大规模数据泄露或供应链攻击
- ✅ 新型 APT 活动或恶意软件家族
- ✅ 重要安全补丁（微软、思科、Fortinet 等）
- ✅ 政府监管动态与行业重要公告
- ❌ 排除：纯观点评论、市场新闻、无技术细节的泛泛报道

请输出如下 JSON 格式（不要有 markdown 代码块，直接输出 JSON）：
{
  "date": "${today}",
  "overview": "5-6句话的全面威胁态势综述，覆盖今日各安全领域的主要动态、整体风险判断和行动建议",
  "items": [
    {
      "headline": "简短标题（20字以内，突出核心威胁）",
      "summary": "3-4句话：①技术细节 ②受影响产品和版本 ③攻击方式 ④建议缓解措施",
      "importance": "critical|high|medium",
      "category": "分类名",
      "sourceTitle": "原文标题",
      "sourceLink": "原文链接"
    }
  ]
}

从各类别中选取最重要的事件，共8-10条，按重要性排序，确保覆盖综合资讯、威胁情报、漏洞预警等主要类别。`,
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
    return JSON.parse(jsonText) as DailyDigest;
  } catch {
    /* fall through to repair */
  }

  try {
    return JSON.parse(jsonrepair(jsonText)) as DailyDigest;
  } catch {
    console.error("DIGEST JSON PARSE FAILED, raw:", jsonText.slice(0, 500));
    /* fall through to fallback */
  }

  // Last resort fallback
  return {
    date: today,
    overview: "今日安全资讯摘要生成失败，请直接浏览原始资讯。",
    items: recent.slice(0, 8).map((item) => ({
      headline: item.title.slice(0, 20),
      summary: item.summary || item.title,
      importance: "medium" as const,
      category: item.category,
      sourceTitle: item.title,
      sourceLink: item.link,
    })),
  };
}
