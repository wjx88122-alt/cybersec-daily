import { DailyDigest } from "@/lib/digest";
import { rebuildDigestFromStore } from "@/lib/feed-pipeline";
import { readDigestFromStore } from "@/lib/feed-store";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function GET() {
  try {
    const digest = await readDigestFromStore();
    if (!digest)
      return NextResponse.json(
        { error: "No digest yet, run cron first" },
        { status: 404 },
      );
    return NextResponse.json(digest);
  } catch {
    return NextResponse.json(
      { error: "Failed to load digest" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await rebuildDigestFromStore();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const digest: DailyDigest = result.digest;
  return NextResponse.json({
    ok: true,
    items: result.items,
    date: digest.date,
  });
}
