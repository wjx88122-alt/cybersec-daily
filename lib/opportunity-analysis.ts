import { createHash } from "node:crypto";
import { getDeepSeekClient, getLLMChatOptions, getLLMModel } from "./deepseek";
import type { DailyDigest, DigestItem } from "./digest";

export type OpportunityAnalysis = {
  headline: string;
  analysis: string;
};

export function opportunityAnalysisCacheKey(
  headline: string,
  dateStamp: string,
): string {
  const hash = createHash("sha256").update(headline.trim()).digest("hex").slice(0, 16);
  return `opp-analysis:${dateStamp}:${hash}`;
}

export function findDigestItemByHeadline(
  digest: DailyDigest | null,
  headline: string,
): DigestItem | null {
  const target = headline.trim();
  if (!digest || !target) return null;
  return digest.items.find((item) => item.headline.trim() === target) ?? null;
}

export async function runOpportunityAnalysis(item: DigestItem): Promise<string> {
  const client = getDeepSeekClient();
  const model = getLLMModel("analysis");
  const response = await client.chat.completions.create({
    model,
    ...getLLMChatOptions("analysis"),
    max_tokens: 1600,
    messages: [
      {
        role: "system",
        content:
          "你是网络安全产品线总裁的战略参谋，对单条市场机会做深度分析。只输出纯文本，固定五段，每段以标签行开头：市场判断：/竞争格局：/客户与渠道：/切入建议：/风险与前提：。每段 2-4 句。",
      },
      {
        role: "user",
        content: `请围绕以下机会条目做深度分析，结合 opportunityType、segment、action；字段缺失时按 headline 和 summary 分析。

headline: ${item.headline}
summary: ${item.summary}
opportunityType: ${item.opportunityType ?? "未提供"}
segment: ${item.segment ?? "未提供"}
action: ${item.action ?? "未提供"}
category: ${item.category}
sourceTitle: ${item.sourceTitle}

输出必须是纯文本，不要 markdown，不要 JSON。`,
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}
