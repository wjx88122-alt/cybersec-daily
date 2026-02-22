import Anthropic from "@anthropic-ai/sdk";
import { FeedItem } from "./feeds";

const client = new Anthropic();

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
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: `你是一位顶级网络安全分析师，负责为安全专业人员撰写每日简报。
你的任务是从大量安全资讯中提炼出最重要、最值得关注的内容。
要求：
- 语言简洁专业，面向安全从业者
- 优先突出高危漏洞、重大事件、新型攻击手法
- 每条摘要控制在2-3句话，直击要点
- 严格按照 JSON 格式输出，不要有任何额外文字`,
    messages: [
      {
        role: "user",
        content: `今天是 ${today}，以下是今日安全资讯，请分析并生成每日简报。

${articlesText}

请输出如下 JSON 格式（不要有 markdown 代码块，直接输出 JSON）：
{
  "date": "${today}",
  "overview": "今日安全态势总体概述，2-3句话",
  "items": [
    {
      "headline": "简短标题（15字以内）",
      "summary": "2-3句话的专业摘要",
      "importance": "critical|high|medium",
      "category": "分类名",
      "sourceTitle": "原文标题",
      "sourceLink": "原文链接"
    }
  ]
}

选取最重要的8-12条，按重要性排序。`,
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
