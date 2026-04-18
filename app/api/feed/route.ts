import { kv } from "@/lib/kv";
import { FeedItem } from "@/lib/feeds";
import { resolveInternalAppBaseUrl } from "@/lib/app-url";
import { triggerTranslationRepairIfNeeded } from "@/lib/translation-health";
import { after, NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const [feedA, feedB] = await Promise.all([
      kv.get<FeedItem[]>("feed-a"),
      kv.get<FeedItem[]>("feed-b"),
    ]);

    const items = [...(feedA ?? []), ...(feedB ?? [])];
    const appBaseUrl = resolveInternalAppBaseUrl(req.nextUrl.origin);

    after(async () => {
      const feedAI = await kv.get<FeedItem[]>("feed-ai");
      await triggerTranslationRepairIfNeeded({
        items: [...items, ...(feedAI ?? [])],
        appBaseUrl,
        source: "feed:read",
        reason: "public-feed-read",
        authToken: process.env.CRON_SECRET,
      });
    });

    return NextResponse.json({ items, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 },
    );
  }
}
