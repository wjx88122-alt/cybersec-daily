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
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: `你是一位顶级网络安全分析师，负责为安全专业人员撰写每日简报。
你的核心任务是识别并报告"今日新发生"的安全事件，而非持续性跟踪报道。
要求：
- 只选取今日首次披露的漏洞、攻击事件、数据泄露、新型威胁
- 跳过"持续监测中"、"仍在调查"、"更新报道"等持续性内容
- 语言简洁专业，面向安全从业者
- 每条摘要控制在2-3句话，直击要点：是什么、影响谁、严重程度
- 严格按照 JSON 格式输出，不要有任何额外文字`,
    messages: [
      {
        role: "user",
        content: `今天是 ${today}，以下是今日安全资讯，请筛选出今日新披露的事件生成简报。

${articlesText}

筛选标准：
- ✅ 今日首次披露的漏洞（新 CVE、新 PoC）
- ✅ 今日新发现的攻击活动、数据泄露、恶意软件
- ✅ 今日发布的安全补丁、紧急预警
- ❌ 排除：持续跟踪报道、背景介绍、观点评论、已知事件更新

请输出如下 JSON 格式（不要有 markdown 代码块，直接输出 JSON）：
{
  "date": "${today}",
  "overview": "今日新增威胁概述，2-3句话，突出最关键的新变化",
  "items": [
    {
      "headline": "简短标题（15字以内）",
      "summary": "2-3句话：是什么漏洞/事件、影响范围、建议行动",
      "importance": "critical|high|medium",
      "category": "分类名",
      "sourceTitle": "原文标题",
      "sourceLink": "原文链接"
    }
  ]
}

选取最重要的8-12条今日新增事件，按重要性排序。`,
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
