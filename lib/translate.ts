import Anthropic from "@anthropic-ai/sdk";
import { FeedItem } from "./feeds";

const client = new Anthropic({
  baseURL: "https://yunyi.rdzhvip.com/claude",
});

export async function translateItems(
  items: FeedItem[]
): Promise<{ titleZh: string; summaryZh: string }[]> {
  const input = items.map((item) => ({
    title: item.title,
    summary: item.summary,
  }));

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: `将以下网络安全新闻的标题和摘要翻译成中文。直接输出 JSON 数组，不要有任何额外文字或代码块。

输入：
${JSON.stringify(input)}

输出格式（JSON 数组，与输入等长）：
[{"titleZh": "中文标题", "summaryZh": "中文摘要"}, ...]`,
        },
      ],
    });

    const text =
      (message.content.find((b) => b.type === "text") as { type: "text"; text: string } | undefined)
        ?.text?.trim() ?? "";
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return items.map(() => ({ titleZh: "", summaryZh: "" }));
  }
}
