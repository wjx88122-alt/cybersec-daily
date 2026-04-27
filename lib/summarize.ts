import { jsonrepair } from "jsonrepair";
import { getDeepSeekClient, getLLMChatOptions, getLLMModel } from "./deepseek";
import { FeedItem } from "./feeds";

type SummaryResult = { summaryAi: string };

export async function summarizeItems(
  batch: { item: FeedItem; articleText: string }[],
): Promise<SummaryResult[]> {
  const inputText = batch
    .map(({ item, articleText }, i) => {
      const content = (articleText || item.summary).slice(0, 1500);
      return `[${i + 1}] 标题: ${item.title}\n内容: ${content}`;
    })
    .join("\n\n---\n\n");

  try {
    const client = getDeepSeekClient();
    const model = getLLMModel("analysis");
    const response = await client.chat.completions.create({
      model,
      ...getLLMChatOptions("analysis"),
      max_tokens: 3000,
      messages: [
        {
          role: "system",
          content: `你是网络安全新闻编辑，为每篇文章生成简洁的中文摘要。
摘要要求：
- 3-4句话，100-150字
- 第一句：核心事件或发现
- 第二句：技术细节或影响范围
- 第三句：危害程度或重要意义
- 第四句（可选）：建议措施或后续影响
- 使用专业但易懂的中文
- 严格按 JSON 数组格式输出，不要有任何额外文字`,
        },
        {
          role: "user",
          content: `为以下 ${batch.length} 篇网络安全文章生成中文摘要，直接输出 JSON 数组：

${inputText}

输出格式：
[
  {"summaryAi": "第1篇摘要"},
  {"summaryAi": "第2篇摘要"}
]`,
        },
      ],
    });

    let jsonText = response.choices[0]?.message?.content?.trim() ?? "";
    jsonText = jsonText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    try {
      return JSON.parse(jsonText) as SummaryResult[];
    } catch {
      return JSON.parse(jsonrepair(jsonText)) as SummaryResult[];
    }
  } catch {
    return batch.map(() => ({ summaryAi: "" }));
  }
}
