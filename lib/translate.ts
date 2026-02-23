import Anthropic from "@anthropic-ai/sdk";
import { jsonrepair } from "jsonrepair";
import { FeedItem } from "./feeds";

const client = new Anthropic({
  baseURL: "https://yunyi.rdzhvip.com/claude",
});

async function translateBatch(
  items: { title: string; summary: string }[],
): Promise<{ titleZh: string; summaryZh: string }[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50000);
  const stream = client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 16000,
    system: `你是一位顶级网络安全分析师，负责将英文安全资讯本地化为中文，供中国安全从业者阅读。
你的任务是将给定的标题和摘要翻译成专业的中文。
要求：严格按照 JSON 格式输出，不要有任何额外文字。`,
    messages: [
      {
        role: "user",
        content: `请将以下安全资讯翻译成中文，直接输出 JSON 数组（不要有 markdown 代码块）：

${JSON.stringify(items)}

输出格式（与输入等长的 JSON 数组）：
[{"titleZh": "中文标题", "summaryZh": "中文摘要"}, ...]`,
      },
    ],
  });

  const response = await stream.finalMessage();
  clearTimeout(timeout);
  let text = "";
  for (const block of response.content) {
    if (block.type === "text") {
      text = block.text.trim();
      break;
    }
  }
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  // First try standard JSON parse
  try {
    return JSON.parse(cleaned);
  } catch {
    return JSON.parse(jsonrepair(cleaned));
  }
}

export async function translateItems(
  items: FeedItem[],
): Promise<{ titleZh: string; summaryZh: string }[]> {
  const input = items.map((item) => ({
    title: item.title,
    summary: item.summary,
  }));
  const size = Math.ceil(input.length / 3);
  const batches = [
    input.slice(0, size),
    input.slice(size, size * 2),
    input.slice(size * 2),
  ].filter((b) => b.length > 0);
  const results = await Promise.all(batches.map(translateBatch));
  return results.flat();
}
