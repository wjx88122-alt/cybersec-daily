import { kv } from "@vercel/kv";
import { FeedItem } from "@/lib/feeds";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [feedA, feedB] = await Promise.all([
      kv.get<FeedItem[]>("feed-a"),
      kv.get<FeedItem[]>("feed-b"),
    ]);

    const items = [...(feedA ?? []), ...(feedB ?? [])];
    return NextResponse.json({ items, updatedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 },
    );
  }
}
