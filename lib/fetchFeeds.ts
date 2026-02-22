import Parser from "rss-parser";
import { FEED_SOURCES, FeedItem } from "./feeds";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "CybersecDaily/1.0" },
});

const client = new Anthropic({
  baseURL: "https://yunyi.rdzhvip.com/claude",
});

export async function fetchAllFeeds(): Promise<FeedItem[]> {
  const results = await Promise.allSettled(
    FEED_SOURCES.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return (feed.items || []).slice(0, 20).map((item) => ({
        id: crypto
          .createHash("md5")
          .update(item.link || item.title || "")
          .digest("hex"),
        title: item.title || "无标题",
        link: item.link || "",
        summary: stripHtml(item.contentSnippet || item.content || item.summary || ""),
        source: source.name,
        category: source.category,
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      }));
    })
  );

  const items: FeedItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
  }

  items.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  // Translate top 60 items in batches
  const toTranslate = items.slice(0, 60);
  const translated = await translateItems(toTranslate);
  return [...translated, ...items.slice(60)];
}

async function translateItems(items: FeedItem[]): Promise<FeedItem[]> {
  // Build a compact payload for Claude to translate in one call
  const payload = items.map((item, i) => `[${i}] 标题: ${item.title}\n摘要: ${item.summary}`).join("\n---\n");

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 8000,
      system: "你是专业翻译，将英文网络安全资讯的标题和摘要翻译成简体中文。保持专业术语准确。严格按照输入格式输出，不要添加任何额外内容。",
      messages: [
        {
          role: "user",
          content: `将以下内容翻译成中文，保持 [序号] 标题: / 摘要: 格式不变，只翻译内容：\n\n${payload}`,
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text")?.text || "";
    const lines = text.split("\n---\n");

    return items.map((item, i) => {
      const block = lines[i] || "";
      const titleMatch = block.match(/标题[:：]\s*(.+)/);
      const summaryMatch = block.match(/摘要[:：]\s*([\s\S]+)/);
      return {
        ...item,
        title: titleMatch?.[1]?.trim() || item.title,
        summary: summaryMatch?.[1]?.trim() || item.summary,
      };
    });
  } catch {
    // If translation fails, return originals
    return items;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 300);
}
