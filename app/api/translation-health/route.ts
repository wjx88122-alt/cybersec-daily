import { NextResponse } from "next/server";
import {
  getTranslationHealth,
  getLastTranslationRunStatus,
  loadAllFeedItemsFromKv,
  recordTranslationHealthFromItems,
} from "@/lib/translation-health";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [cached, lastRun] = await Promise.all([
      getTranslationHealth(),
      getLastTranslationRunStatus(),
    ]);
    if (cached) {
      return NextResponse.json({ ...cached, lastRun });
    }

    const items = await loadAllFeedItemsFromKv();
    const health = await recordTranslationHealthFromItems({
      items,
      source: "translation-health:bootstrap",
    });

    return NextResponse.json({ ...health, lastRun });
  } catch {
    return NextResponse.json(
      { error: "Failed to load translation health" },
      { status: 500 },
    );
  }
}
