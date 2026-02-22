import { kv } from "@vercel/kv";
import { fetchFeedsA } from "@/lib/fetchFeeds";
import { FeedItem } from "@/lib/feeds";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let items = await kv.get<FeedItem[]>("feed-a");
    if (!items) {
      items = await fetchFeedsA();
      await kv.set("feed-a", items);
    }
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
