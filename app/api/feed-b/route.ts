import { readFeedGroup } from "@/lib/feed-store";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ items: await readFeedGroup("feed-b") });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
