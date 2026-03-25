import { kv } from "@/lib/kv";
import { generateDigest, DailyDigest } from "@/lib/digest";
import { buildDigestInputItems } from "@/lib/digest-inputs";
import { FeedItem } from "@/lib/feeds";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");

  // Cron/manual trigger: regenerate digest
  if (auth === `Bearer ${process.env.CRON_SECRET}`) {
    const [feedA, feedB, feedAI] = await Promise.all([
      kv.get<FeedItem[]>("feed-a"),
      kv.get<FeedItem[]>("feed-b"),
      kv.get<FeedItem[]>("feed-ai"),
    ]);

    let allItems: FeedItem[];
    try {
      allItems = buildDigestInputItems(feedA, feedB, feedAI);
    } catch {
      return NextResponse.json(
        { error: "Missing required feed data, run cron first" },
        { status: 400 },
      );
    }

    const digest = await generateDigest(allItems);
    await kv.set("digest", digest);
    return NextResponse.json({ ok: true, items: digest.items.length });
  }

  // Public read: return cached digest
  try {
    const digest = await kv.get<DailyDigest>("digest");
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
