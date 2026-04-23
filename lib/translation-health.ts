import { CUTOFF_MS, FeedItem } from "./feeds";
import { kv } from "./kv";
import {
  isLikelyLocalizedField,
  isLikelyUntranslatedItem,
} from "./translation-detection";

const TRANSLATION_HEALTH_KEY = "translation-health";
const TRANSLATION_RUN_STATUS_KEY = "translation-run-status";
const TRANSLATION_REPAIR_LOCK_KEY = "translation-repair-lock";
const TRANSLATION_REPAIR_COOLDOWN_SEC = 10 * 60;
const SAMPLE_LIMIT = 6;

type MissingField = "titleZh" | "summaryZh";

export type TranslationHealthSample = {
  id: string;
  title: string;
  source: string;
  pubDate: string;
  missing: MissingField[];
};

export type TranslationHealth = {
  updatedAt: string;
  source: string;
  recentWindowHours: number;
  recentTotal: number;
  recentMissing: number;
  recentWithTitleZh: number;
  recentWithSummaryZh: number;
  healthy: boolean;
  lastHealthyAt: string | null;
  sampleMissing: TranslationHealthSample[];
  trigger?: {
    requestedAt: string;
    source: string;
    accepted: boolean;
    cooldownSec: number;
    scope: "recent";
    reason?: string;
    resultStatus?: number | null;
    translated?: number | null;
    recentPendingAfterRun?: number | null;
    error?: string | null;
  };
  pass?: Record<string, unknown>;
};

export type TranslationRunStatus = {
  updatedAt: string;
  source: string;
  scope: "recent" | "all";
  ok: boolean;
  queued: number;
  translated: number;
  pending: number;
  recentPending: number;
  batchesDone: number;
  batchesFailed: number;
  elapsedSec: string;
  reason?: string | null;
  code?: string | null;
  error?: string | null;
  skipped?: boolean;
};

function getTimestamp(item: FeedItem) {
  const value = new Date(item.pubDate).getTime();
  return Number.isNaN(value) ? 0 : value;
}

export function isLikelyUntranslated(item: FeedItem) {
  return isLikelyUntranslatedItem(item);
}

function createTranslationHealth(
  items: FeedItem[],
  source: string,
  lastHealthyAt: string | null,
  extra?: Partial<TranslationHealth>,
): TranslationHealth {
  const recentCutoff = Date.now() - CUTOFF_MS;
  const recentItems = items
    .filter((item) => getTimestamp(item) >= recentCutoff)
    .sort((a, b) => getTimestamp(b) - getTimestamp(a));
  const recentMissingItems = recentItems.filter(isLikelyUntranslated);
  const updatedAt = new Date().toISOString();
  const healthy = recentMissingItems.length === 0;

  return {
    updatedAt,
    source,
    recentWindowHours: Math.round(CUTOFF_MS / (60 * 60 * 1000)),
    recentTotal: recentItems.length,
    recentMissing: recentMissingItems.length,
    recentWithTitleZh: recentItems.filter((item) =>
      isLikelyLocalizedField(item.title, item.titleZh),
    ).length,
    recentWithSummaryZh: recentItems.filter((item) =>
      isLikelyLocalizedField(item.summary, item.summaryZh),
    ).length,
    healthy,
    lastHealthyAt: healthy ? updatedAt : lastHealthyAt,
    sampleMissing: recentMissingItems.slice(0, SAMPLE_LIMIT).map((item) => ({
      id: item.id,
      title: item.title,
      source: item.source,
      pubDate: item.pubDate,
      missing: [
        ...(!isLikelyLocalizedField(item.title, item.titleZh)
          ? ["titleZh" as const]
          : []),
        ...(!isLikelyLocalizedField(item.summary, item.summaryZh)
          ? ["summaryZh" as const]
          : []),
      ],
    })),
    ...extra,
  };
}

async function getPreviousHealth() {
  return (await kv.get<TranslationHealth>(TRANSLATION_HEALTH_KEY)) ?? null;
}

export async function saveTranslationHealth(health: TranslationHealth) {
  await kv.set(TRANSLATION_HEALTH_KEY, health);
  return health;
}

export async function saveTranslationRunStatus(status: TranslationRunStatus) {
  await kv.set(TRANSLATION_RUN_STATUS_KEY, status);
  return status;
}

export async function recordTranslationHealthFromItems(args: {
  items: FeedItem[];
  source: string;
  extra?: Partial<TranslationHealth>;
}) {
  const previous = await getPreviousHealth();
  const health = createTranslationHealth(
    args.items,
    args.source,
    previous?.lastHealthyAt ?? null,
    args.extra,
  );
  await saveTranslationHealth(health);
  return health;
}

export async function getTranslationHealth() {
  return kv.get<TranslationHealth>(TRANSLATION_HEALTH_KEY);
}

export async function getLastTranslationRunStatus() {
  return kv.get<TranslationRunStatus>(TRANSLATION_RUN_STATUS_KEY);
}

export async function loadAllFeedItemsFromKv() {
  const [feedA, feedB, feedAI] = await Promise.all([
    kv.get<FeedItem[]>("feed-a"),
    kv.get<FeedItem[]>("feed-b"),
    kv.get<FeedItem[]>("feed-ai"),
  ]);

  return [...(feedA ?? []), ...(feedB ?? []), ...(feedAI ?? [])];
}

export async function triggerTranslationRepairIfNeeded(args: {
  items: FeedItem[];
  source: string;
  reason?: string;
  runRepair?: (
    scope: "recent" | "all",
  ) => Promise<{
    ok?: boolean;
    status?: number | null;
    translated?: number | null;
    recentPending?: number | null;
    error?: string | null;
  }>;
}) {
  const previous = await getPreviousHealth();
  const requestedAt = new Date().toISOString();
  const baseHealth = createTranslationHealth(
    args.items,
    args.source,
    previous?.lastHealthyAt ?? null,
  );

  if (baseHealth.recentMissing === 0 || !args.runRepair) {
    await saveTranslationHealth(baseHealth);
    return { triggered: false, health: baseHealth };
  }

  const lock = await kv.set(
    TRANSLATION_REPAIR_LOCK_KEY,
    {
      source: args.source,
      requestedAt,
      recentMissing: baseHealth.recentMissing,
    },
    { nx: true, ex: TRANSLATION_REPAIR_COOLDOWN_SEC },
  );

  const accepted = lock === "OK";
  if (!accepted) {
    const health = {
      ...baseHealth,
      trigger: {
        requestedAt,
        source: args.source,
        accepted: false,
        cooldownSec: TRANSLATION_REPAIR_COOLDOWN_SEC,
        scope: "recent" as const,
        reason: args.reason,
      },
    };
    await saveTranslationHealth(health);
    return { triggered: false, health };
  }

  try {
    const payload = await args.runRepair("recent");
    const latest = (await getPreviousHealth()) ?? baseHealth;

    const health = {
      ...latest,
      trigger: {
        requestedAt,
        source: args.source,
        accepted: true,
        cooldownSec: TRANSLATION_REPAIR_COOLDOWN_SEC,
        scope: "recent" as const,
        reason: args.reason,
        resultStatus: payload.status ?? null,
        translated: payload?.translated ?? null,
        recentPendingAfterRun: payload?.recentPending ?? null,
      },
    };

    await saveTranslationHealth(health);
    return { triggered: true, health };
  } catch (error) {
    const health = {
      ...baseHealth,
      trigger: {
        requestedAt,
        source: args.source,
        accepted: true,
        cooldownSec: TRANSLATION_REPAIR_COOLDOWN_SEC,
        scope: "recent" as const,
        reason: args.reason,
        error: error instanceof Error ? error.message : String(error),
      },
    };

    await saveTranslationHealth(health);
    return { triggered: true, health };
  }
}
