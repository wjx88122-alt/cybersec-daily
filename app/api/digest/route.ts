import { fetchFeedsA } from "@/lib/fetchFeeds";
import { generateDigest } from "@/lib/digest";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await fetchFeedsA();
    const digest = await generateDigest(items);
    return NextResponse.json(digest);
  } catch (e) {
    console.error("Digest generation failed:", e);
    return NextResponse.json(
      { error: "Failed to generate digest" },
      { status: 500 }
    );
  }
}
