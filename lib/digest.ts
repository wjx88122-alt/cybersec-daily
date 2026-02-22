import Anthropic from "@anthropic-ai/sdk";
import { FeedItem } from "./feeds";

const client = new Anthropic({
  baseURL: "https://yunyi.rdzhvip.com/claude",
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

export async function generateDigest(items: FeedItem[]): Promise<DailyDigest> {
  // Take top 40 most recent items for analysis
  const recent = items.slice(0, 40);

  const articlesText = recent
    .map(
      (item, i) =>
        `[${i + 1}] 来源: ${item.source} | 分类: ${item.category}\n标题: ${item.title}\n摘要: ${item.summary}\n链接: ${item.link}`
    )
    .join("\n\n---\n\n");

  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 6000,
    system: `你是一位顶级网络安全分析师，为企业安全团队撰写每日威胁简报。
你的读者是 CISO 和高级安全工程师，他们需要快速判断：今天发生了什么新变化、是否需要立即行动。

写作要求：
- overview：3-4句话，概括今日整体威胁态势——哪类攻击在上升、哪些关键系统受影响
- 每条 summary：3-4句话，包含：漏洞/事件技术细节、受影响产品版本、攻击方式、建议缓解措施
- 选题标准：优先选择有实际攻击证据、影响广泛产品、有 PoC 公开、或涉及关键基础设施的事件
- 严格按照 JSON 格式输出，不要有任何额外文字`,
    messages: [
      {
        role: "user",
        content: `今天是 ${today}，以下是近48小时安全资讯，请生成专业威胁简报。

${articlesText}

选题标准（按优先级）：
- ✅ 有在野利用证据的漏洞（actively exploited）
- ✅ 影响主流产品的高危漏洞（CVSS ≥ 8.0）
- ✅ 大规模数据泄露或供应链攻击
- ✅ 新型 APT 活动或恶意软件家族
- ✅ 重要安全补丁（微软、思科、Fortinet 等）
- ❌ 排除：纯观点评论、市场新闻、无技术细节的泛泛报道

请输出如下 JSON 格式（不要有 markdown 代码块，直接输出 JSON）：
{
  "date": "${today}",
  "overview": "3-4句话的威胁态势综述：今日整体安全形势、最突出的攻击趋势、受影响最广的领域",
  "items": [
    {
      "headline": "简短标题（20字以内，突出核心威胁）",
      "summary": "3-4句话：①漏洞/事件技术细节 ②受影响产品和版本 ③攻击者利用方式 ④建议的缓解或修复措施",
      "importance": "critical|high|medium",
      "category": "分类名",
      "sourceTitle": "原文标题",
      "sourceLink": "原文链接"
    }
  ]
}

选取最重要的8-10条事件，按重要性排序。`,
      },
    ],
  });

  const response = await stream.finalMessage();

  // Extract text from response (skip thinking blocks)
  let jsonText = "";
  for (const block of response.content) {
    if (block.type === "text") {
      jsonText = block.text.trim();
      break;
    }
  }

  // Strip markdown code fences if present
  jsonText = jsonText.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  try {
    return JSON.parse(jsonText) as DailyDigest;
  } catch {
    // Fallback: return a minimal digest
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
}
