import { readSecurityFeedItems } from "@/lib/feed-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await readSecurityFeedItems();
    return NextResponse.json({ items, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 },
    );
  }
}
