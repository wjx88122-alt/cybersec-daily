import { kv } from "@vercel/kv";
import { FeedItem } from "@/lib/feeds";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await kv.get<FeedItem[]>("feed-b");
    return NextResponse.json({ items: items ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
