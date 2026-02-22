import { kv } from "@vercel/kv";
import { fetchFeedsA } from "@/lib/fetchFeeds";
import { generateDigest } from "@/lib/digest";
import { DailyDigest } from "@/lib/digest";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let digest = await kv.get<DailyDigest>("digest");
    if (!digest) {
      const items = await fetchFeedsA();
      digest = await generateDigest(items);
      await kv.set("digest", digest);
    }
    return NextResponse.json(digest);
  } catch (e) {
    console.error("Digest generation failed:", e);
    return NextResponse.json(
      { error: "Failed to generate digest" },
      { status: 500 }
    );
  }
}
