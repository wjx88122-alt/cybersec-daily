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
import { after, NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runFeedRefreshJob();
    after(async () => {
      try {
        await triggerImageRepairIfNeeded({
          items: result.items,
          source: "cron:feed-refresh",
          reason: "cron-refresh",
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
          source: "cron:feed-refresh",
          reason: "cron-refresh",
          runRepair: async (scope) => {
            const translationResult = await runTranslationJob({
              scope,
              reason: "cron-refresh",
            });
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
        console.error("cron follow-up pipeline failed:", error);
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
    console.error("feed refresh failed:", error);
    return NextResponse.json(
      { error: "Feed refresh failed before cache update" },
      { status: 502 },
    );
  }

}
