import {
  rebuildDailySnapshot,
  runFeedRefreshJob,
  runImageEnrichmentJob,
  runTranslationJob,
} from "@/lib/feed-pipeline";
import { triggerImageRepairIfNeeded } from "@/lib/image-health";
import {
  triggerTranslationRepairIfNeeded,
} from "@/lib/translation-health";
import { after, NextResponse } from "next/server";

// ⚠️ 临时端点：免认证触发一次 feed refresh，用完即删。
export const maxDuration = 300;

export async function GET() {
  try {
    const result = await runFeedRefreshJob();
    after(async () => {
      try {
        await triggerImageRepairIfNeeded({
          items: result.items,
          source: "manual:trigger",
          reason: "manual-trigger",
          runRepair: async (scope) => {
            const imageResult = await runImageEnrichmentJob({ scope });
            return {
              ok: imageResult.ok,
              status: 200,
              imagesFound: imageResult.imagesFound,
            };
          },
        });
        await triggerTranslationRepairIfNeeded({
          items: result.items,
          source: "manual:trigger",
          reason: "manual-trigger",
          runRepair: async (scope) => {
            const translationResult = await runTranslationJob({ scope, reason: "manual-trigger" });
            return {
              ok: translationResult.ok,
              status: translationResult.ok ? 200 : 503,
              translated: translationResult.translated,
              recentPending: translationResult.recentPending,
              error: translationResult.error ?? null,
            };
          },
        });
        await rebuildDailySnapshot(result.securityItems);
      } catch (error) {
        console.error("manual trigger follow-up failed:", error);
      }
    });

    return NextResponse.json({
      ok: true,
      feedA: result.feedA,
      feedB: result.feedB,
      feedAI: result.feedAI,
      staleFeeds: result.staleFeeds,
    });
  } catch (error) {
    console.error("manual trigger feed refresh failed:", error);
    return NextResponse.json(
      { error: "Feed refresh failed before cache update" },
      { status: 502 },
    );
  }
}
