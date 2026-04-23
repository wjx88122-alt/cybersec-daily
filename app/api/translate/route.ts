import { runTranslationJob } from "@/lib/feed-pipeline";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scope = req.nextUrl.searchParams.get("scope") === "recent" ? "recent" : "all";
  const reason = req.nextUrl.searchParams.get("reason") ?? null;
  try {
    const result = await runTranslationJob({ scope, reason });
    return NextResponse.json(result, {
      status: result.ok ? 200 : 503,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to translate feeds";
    return NextResponse.json(
      { error: message },
      { status: message.includes("run cron first") ? 400 : 500 },
    );
  }
}
