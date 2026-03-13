import { NextResponse } from "next/server";
import {
  getTranslationHealth,
  loadAllFeedItemsFromKv,
  recordTranslationHealthFromItems,
} from "@/lib/translation-health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await getTranslationHealth();
    if (cached) {
      return NextResponse.json(cached);
    }

    const items = await loadAllFeedItemsFromKv();
    const health = await recordTranslationHealthFromItems({
      items,
      source: "translation-health:bootstrap",
    });

    return NextResponse.json(health);
  } catch {
    return NextResponse.json(
      { error: "Failed to load translation health" },
      { status: 500 },
    );
  }
}
