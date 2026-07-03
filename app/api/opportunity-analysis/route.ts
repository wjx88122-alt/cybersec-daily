import { NextRequest, NextResponse } from "next/server";
import { getShanghaiDateStamp } from "@/lib/date-stamp";
import { readDigestFromStore } from "@/lib/feed-store";
import { kv } from "@/lib/kv";
import { findDigestItemByHeadline, opportunityAnalysisCacheKey, runOpportunityAnalysis } from "@/lib/opportunity-analysis";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const headline =
    body && typeof body === "object" && "headline" in body
      ? String((body as { headline?: unknown }).headline ?? "").trim()
      : "";
  if (!headline || headline.length > 200) {
    return NextResponse.json({ error: "机会标题不能为空且不能超过200字" }, { status: 400 });
  }

  const item = findDigestItemByHeadline(await readDigestFromStore(), headline);
  if (!item) {
    return NextResponse.json({ error: "该机会条目不存在或已过期" }, { status: 404 });
  }

  const dateStamp = getShanghaiDateStamp();
  const cacheKey = opportunityAnalysisCacheKey(headline, dateStamp);
  const cached = await kv.get<string>(cacheKey);
  if (cached) return NextResponse.json({ analysis: cached, cached: true });

  const countKey = `opp-analysis-count:${dateStamp}`;
  const count = Number((await kv.get<number>(countKey)) ?? 0);
  const limit = Number.parseInt(process.env.OPPORTUNITY_ANALYSIS_DAILY_LIMIT ?? "", 10);
  const dailyLimit = Number.isFinite(limit) && limit > 0 ? limit : 40;
  if (count >= dailyLimit) {
    return NextResponse.json({ error: "今日深度分析次数已用完，请明天再试" }, { status: 429 });
  }

  try {
    const analysis = await runOpportunityAnalysis(item);
    if (!analysis) throw new Error("empty analysis");
    await kv.set(cacheKey, analysis);
    await kv.set(countKey, count + 1);
    return NextResponse.json({ analysis, cached: false });
  } catch (error) {
    const missingKey = error instanceof Error && /No LLM key|API key/i.test(error.message);
    return NextResponse.json(
      {
        error: missingKey
          ? "LLM 服务未配置，请稍后再试"
          : "深度分析暂时不可用，请稍后重试",
      },
      { status: missingKey ? 503 : 500 },
    );
  }
}
