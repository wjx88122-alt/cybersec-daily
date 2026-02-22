import { fetchAllFeeds } from "@/lib/fetchFeeds";
import { NextResponse } from "next/server";

export const revalidate = 3600; // cache 1 hour

export async function GET() {
  try {
    const items = await fetchAllFeeds();
    return NextResponse.json({ items, updatedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch feeds" }, { status: 500 });
  }
}
