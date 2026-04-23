import { runSummarizationJob } from "@/lib/feed-pipeline";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scope = req.nextUrl.searchParams.get("scope") === "all" ? "all" : "recent";

  try {
    const result = await runSummarizationJob({ scope });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to summarize feeds";
    return NextResponse.json(
      { error: message },
      { status: message.includes("run cron first") ? 400 : 500 },
    );
  }
}
