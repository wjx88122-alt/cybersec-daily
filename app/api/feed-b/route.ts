import { kv } from "@vercel/kv";
import { fetchFeedsB } from "@/lib/fetchFeeds";
import { FeedItem } from "@/lib/feeds";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let items = await kv.get<FeedItem[]>("feed-b");
    if (!items) {
      items = await fetchFeedsB();
      await kv.set("feed-b", items);
    }
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
