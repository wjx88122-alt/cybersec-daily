import { kv } from "@/lib/kv";
import { FeedItem } from "@/lib/feeds";
import { resolveInternalAppBaseUrl } from "@/lib/app-url";
import {
  loadAllFeedItemsFromKv,
  triggerTranslationRepairIfNeeded,
} from "@/lib/translation-health";
import { after, NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const items = await kv.get<FeedItem[]>("feed-ai");
    const safeItems = items ?? [];
    const appBaseUrl = resolveInternalAppBaseUrl(req.nextUrl.origin);

    after(async () => {
      const allItems = await loadAllFeedItemsFromKv();
      await triggerTranslationRepairIfNeeded({
        items: allItems,
        appBaseUrl,
        source: "feed-ai:read",
        reason: "public-feed-read",
        authToken: process.env.CRON_SECRET,
      });
    });

    return NextResponse.json({ items: safeItems });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
