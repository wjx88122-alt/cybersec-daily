import { fetchFeedsB } from "@/lib/fetchFeeds";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await fetchFeedsB();
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
