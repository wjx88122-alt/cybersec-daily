import { jsonrepair } from "jsonrepair";
import { getDeepSeekClient } from "./deepseek";
import { FeedItem } from "./feeds";

async function translateBatch(
  items: { title: string; summary: string }[],
): Promise<{ titleZh: string; summaryZh: string }[]> {
  const client = getDeepSeekClient();
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    max_tokens: 8192,
    messages: [
      {
        role: "system",
        content: `你是一位顶级网络安全分析师，负责将英文安全资讯本地化为中文，供中国安全从业者阅读。
你的任务是将给定的标题和摘要翻译成专业的中文。
要求：
1. 严格按照 JSON 格式输出，不要有任何额外文字。
2. 翻译内容中如需使用引号，必须使用中文引号「」或『』，绝对不能使用英文双引号。
3. 不要在 JSON 字符串值内部使用任何未转义的双引号。`,
      },
      {
        role: "user",
        content: `请将以下安全资讯翻译成中文，直接输出 JSON 数组（不要有 markdown 代码块）：

${JSON.stringify(items)}

输出格式（与输入等长的 JSON 数组）：
[{"titleZh": "中文标题", "summaryZh": "中文摘要"}, ...]`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "";
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

  // Single batch — caller already controls batch size (BATCH_SIZE=10)
  // No need to split further; this avoids index misalignment from parallel sub-batches
  const results = await translateBatch(input);

  // Validate result length matches input; pad with empty if LLM returned fewer
  const validated: { titleZh: string; summaryZh: string }[] = [];
  for (let i = 0; i < input.length; i++) {
    validated.push(results[i] ?? { titleZh: "", summaryZh: "" });
  }
  return validated;
}
