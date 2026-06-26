import { generateDigest, type DailyDigest } from "./digest";
import { buildDigestInputItems } from "./digest-inputs";
import { extractArticleText } from "./extractArticle";
import { extractOgImage } from "./extractImage";
import {
  fetchFeedImageMapForSources,
  fetchFeedsA,
  fetchFeedsAI,
  fetchFeedsB,
} from "./fetchFeeds";
import { fetchWebpageSources, WEBPAGE_SOURCES } from "./webpage-collector";
import {
  readDigestFromStore,
  readFeedCacheState,
  readSecurityFeedItems,
  readSnapshotsFromStore,
  writeDigestToStore,
  writeFeedCacheState,
  writeSnapshotsToStore,
} from "./feed-store";
import { mergeFeedItems, resolveFeedRefresh } from "./feed-refresh";
import { CUTOFF_MS, type FeedItem } from "./feeds";
import { summarizeItems } from "./summarize";
import { generateSnapshot, mergeSnapshot } from "./snapshot";
import {
  hasMeaningfulChineseLocalization,
  isLikelyLocalizedField,
  pickLocalizedField,
} from "./translation-detection";
import {
  isLikelyUntranslated,
  recordTranslationHealthFromItems,
  saveTranslationRunStatus,
} from "./translation-health";
import { detectTranslationRunIssue } from "./translation-run";
import { translateItems } from "./translate";

export type PipelineScope = "recent" | "all";

export type FeedRefreshJobResult = {
  ok: true;
  feedA: number;
  feedB: number;
  feedAI: number;
  staleFeeds: string[];
  items: FeedItem[];
  securityItems: FeedItem[];
};

export type ImageEnrichmentJobResult = {
  ok: true;
  scope: PipelineScope;
  updated: number;
  imagesFound: number;
  pending: number;
};

export type DigestRebuildJobResult =
  | {
      ok: true;
      items: number;
      digest: DailyDigest;
    }
  | {
      ok: false;
      error: string;
    };

export type SnapshotRebuildJobResult = {
  ok: true;
  date: string;
  totalCount: number;
};

export type SummarizationJobResult = {
  ok: true;
  scope: PipelineScope;
  summarized: number;
  total: number;
  skipped: boolean;
  digestItems: number | null;
};

export type TranslationJobResult = {
  ok: boolean;
  scope: PipelineScope;
  withZh: number;
  withZhAI: number;
  translated: number;
  pending: number;
  recentPending: number;
  batchesDone: number;
  batchesFailed: number;
  elapsedSec: string;
  skipped: boolean;
  passesRun: number;
  summarizeTriggered: boolean;
  summarized: number;
  digestItems: number | null;
  summaryError?: string | null;
  code?: string;
  error?: string;
};

const TRANSLATION_TIME_BUDGET_MS = 270_000;
const TRANSLATION_BATCH_SIZE = 10;
const SUMMARY_BATCH_SIZE = 5;

const normalize = (text?: string) => (text ?? "").trim();

function getTimestamp(item: FeedItem) {
  const time = new Date(item.pubDate).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortByNewest(items: FeedItem[]) {
  return [...items].sort((a, b) => getTimestamp(b) - getTimestamp(a));
}

function ensureRequiredFeedsAvailable(state: {
  feedA: FeedItem[];
  feedB: FeedItem[];
}) {
  if (state.feedA.length === 0 || state.feedB.length === 0) {
    throw new Error("No feed data, run cron first");
  }
}

function autoFillChineseFields(items: FeedItem[]) {
  items.forEach((item, index) => {
    const patch: Partial<FeedItem> = {};
    if (!normalize(item.titleZh) && hasMeaningfulChineseLocalization(item.title)) {
      patch.titleZh = item.title;
    }
    if (!normalize(item.summaryZh) && hasMeaningfulChineseLocalization(item.summary)) {
      patch.summaryZh = item.summary;
    }
    if (Object.keys(patch).length > 0) {
      items[index] = { ...item, ...patch };
    }
  });
}

function applyTranslations(
  items: FeedItem[],
  map: Map<string, { titleZh?: string; summaryZh?: string }>,
) {
  items.forEach((item, index) => {
    const translated = map.get(item.id);
    if (!translated) {
      return;
    }

    const nextTitleZh = pickLocalizedField({
      source: item.title,
      candidate: translated.titleZh,
      existing: item.titleZh,
    });
    const nextSummaryZh = pickLocalizedField({
      source: item.summary,
      candidate: translated.summaryZh,
      existing: item.summaryZh,
    });

    if (nextTitleZh !== item.titleZh || nextSummaryZh !== item.summaryZh) {
      items[index] = {
        ...item,
        titleZh: nextTitleZh,
        summaryZh: nextSummaryZh,
      };
    }
  });
}

function splitCombinedFeedItems(
  securityItems: FeedItem[],
  aiItems: FeedItem[],
  feedALength: number,
) {
  return {
    feedA: securityItems.slice(0, feedALength),
    feedB: securityItems.slice(feedALength),
    feedAI: aiItems,
  };
}

function getItemsMissingImage(items: FeedItem[], scope: PipelineScope, cutoff: number) {
  return items
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item }) =>
        !item.image && (scope === "all" || getTimestamp(item) >= cutoff),
    );
}

export async function rebuildDailySnapshot(
  securityItems?: FeedItem[],
): Promise<SnapshotRebuildJobResult> {
  const digest = await readDigestFromStore();
  const snapshots = await readSnapshotsFromStore();
  const baseItems = securityItems ?? (await readSecurityFeedItems());
  const snapshot = generateSnapshot(baseItems, digest);
  const updated = mergeSnapshot(snapshots, snapshot);
  await writeSnapshotsToStore(updated);
  return {
    ok: true,
    date: snapshot.date,
    totalCount: snapshot.totalCount,
  };
}

export async function rebuildDigestFromStore(): Promise<DigestRebuildJobResult> {
  const state = await readFeedCacheState();
  if (state.feedA.length === 0 || state.feedB.length === 0) {
    return { ok: false, error: "Missing required feed data, run cron first" };
  }

  const allItems = buildDigestInputItems(state.feedA, state.feedB, state.feedAI);
  const digest = await generateDigest(allItems);
  await writeDigestToStore(digest);
  return {
    ok: true,
    items: digest.items.length,
    digest,
  };
}

export async function runFeedRefreshJob(): Promise<FeedRefreshJobResult> {
  const [feedAResult, feedBResult, feedAIResult, webpageResult, previousState] = await Promise.all([
    fetchFeedsA(),
    fetchFeedsB(),
    fetchFeedsAI(),
    // 网页型源（无 RSS 的厂商官网）；WEBPAGE_SOURCES 为空时为 no-op
    fetchWebpageSources(WEBPAGE_SOURCES),
    readFeedCacheState(),
  ]);

  const refreshedA = resolveFeedRefresh(feedAResult, previousState.feedA);
  // B 组 RSS 结果合并网页采集结果（对齐 AI HOT「网页」源策略）
  const combinedBResult: typeof feedBResult = webpageResult.items.length
    ? {
        items: [...feedBResult.items, ...webpageResult.items],
        succeededSources: feedBResult.succeededSources + webpageResult.succeededSources,
        failedSources: feedBResult.failedSources + webpageResult.failedSources,
      }
    : feedBResult;
  const refreshedB = resolveFeedRefresh(combinedBResult, previousState.feedB);
  const refreshedAI = resolveFeedRefresh(feedAIResult, previousState.feedAI);

  const mergedA = refreshedA.stale
    ? refreshedA.items
    : mergeFeedItems(refreshedA.items, previousState.feedA);
  const mergedB = refreshedB.stale
    ? refreshedB.items
    : mergeFeedItems(refreshedB.items, previousState.feedB);
  const mergedAI = refreshedAI.stale
    ? refreshedAI.items
    : mergeFeedItems(refreshedAI.items, previousState.feedAI);

  await writeFeedCacheState({
    feedA: mergedA,
    feedB: mergedB,
    feedAI: mergedAI,
  });

  const mergedItems = [...mergedA, ...mergedB, ...mergedAI];
  await recordTranslationHealthFromItems({
    items: mergedItems,
    source: "cron:feed-refresh",
  });

  return {
    ok: true,
    feedA: mergedA.length,
    feedB: mergedB.length,
    feedAI: mergedAI.length,
    staleFeeds: [
      refreshedA.stale ? "feed-a" : null,
      refreshedB.stale ? "feed-b" : null,
      refreshedAI.stale ? "feed-ai" : null,
    ].filter(Boolean) as string[],
    items: mergedItems,
    securityItems: [...mergedA, ...mergedB],
  };
}

export async function runImageEnrichmentJob(options?: {
  scope?: PipelineScope;
}): Promise<ImageEnrichmentJobResult> {
  const scope = options?.scope ?? "recent";
  const state = await readFeedCacheState();
  ensureRequiredFeedsAvailable(state);

  const securityItems = [...state.feedA, ...state.feedB];
  const aiItems = [...state.feedAI];
  const cutoff = Date.now() - CUTOFF_MS;

  const toProcess = getItemsMissingImage(securityItems, scope, cutoff);
  const toProcessAI = getItemsMissingImage(aiItems, scope, cutoff);
  const pendingSources = [
    ...new Set([...toProcess, ...toProcessAI].map(({ item }) => item.source)),
  ];
  const feedImageMap = await fetchFeedImageMapForSources(pendingSources);

  const resolveImage = async (item: FeedItem) => {
    const key = item.link.endsWith("/") ? item.link.slice(0, -1) : item.link;
    const feedImage = feedImageMap.get(key);
    if (feedImage) {
      return feedImage;
    }
    return extractOgImage(item.link);
  };

  const images = await Promise.all(toProcess.map(({ item }) => resolveImage(item)));
  const imagesAI = await Promise.all(
    toProcessAI.map(({ item }) => resolveImage(item)),
  );

  let updated = 0;
  const updatedSecurity = securityItems.map((item, index) => {
    const position = toProcess.findIndex((entry) => entry.index === index);
    const nextImage = position === -1 ? undefined : images[position];
    if (nextImage && nextImage !== item.image) {
      updated += 1;
      return { ...item, image: nextImage };
    }
    return item;
  });
  const updatedAI = aiItems.map((item, index) => {
    const position = toProcessAI.findIndex((entry) => entry.index === index);
    const nextImage = position === -1 ? undefined : imagesAI[position];
    if (nextImage && nextImage !== item.image) {
      updated += 1;
      return { ...item, image: nextImage };
    }
    return item;
  });

  const nextState = splitCombinedFeedItems(
    updatedSecurity,
    updatedAI,
    state.feedA.length,
  );
  await writeFeedCacheState(nextState);

  const imagesFound =
    updatedSecurity.filter((item) => item.image).length +
    updatedAI.filter((item) => item.image).length;
  const pending = [...updatedSecurity, ...updatedAI].filter(
    (item) => !item.image && (scope === "all" || getTimestamp(item) >= cutoff),
  ).length;

  return {
    ok: true,
    scope,
    updated,
    imagesFound,
    pending,
  };
}

type TranslationPassResult = Omit<TranslationJobResult, "passesRun" | "summarizeTriggered" | "summarized" | "digestItems">;

async function runTranslationPass(options: {
  scope: PipelineScope;
  reason?: string | null;
}): Promise<TranslationPassResult> {
  const scope = options.scope;
  const reason = options.reason ?? null;
  const startTime = Date.now();
  const state = await readFeedCacheState();
  ensureRequiredFeedsAvailable(state);

  const securityItems = [...state.feedA, ...state.feedB];
  const aiItems = [...state.feedAI];
  const recentCutoff = Date.now() - CUTOFF_MS;

  autoFillChineseFields(securityItems);
  autoFillChineseFields(aiItems);

  const toTranslate = securityItems.filter(isLikelyUntranslated);
  const toTranslateAI = aiItems.filter(isLikelyUntranslated);
  const recentToTranslate = sortByNewest(
    toTranslate.filter((item) => getTimestamp(item) >= recentCutoff),
  );
  const backlogToTranslate = sortByNewest(
    toTranslate.filter((item) => getTimestamp(item) < recentCutoff),
  );
  const recentToTranslateAI = sortByNewest(
    toTranslateAI.filter((item) => getTimestamp(item) >= recentCutoff),
  );
  const backlogToTranslateAI = sortByNewest(
    toTranslateAI.filter((item) => getTimestamp(item) < recentCutoff),
  );
  const queuedItems =
    scope === "recent"
      ? [...recentToTranslate, ...recentToTranslateAI]
      : [
          ...recentToTranslate,
          ...backlogToTranslate,
          ...recentToTranslateAI,
          ...backlogToTranslateAI,
        ];

  if (queuedItems.length === 0) {
    const withZh = securityItems.filter((item) =>
      isLikelyLocalizedField(item.title, item.titleZh),
    ).length;
    const withZhAI = aiItems.filter((item) =>
      isLikelyLocalizedField(item.title, item.titleZh),
    ).length;

    await writeFeedCacheState(
      splitCombinedFeedItems(securityItems, aiItems, state.feedA.length),
    );

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    await saveTranslationRunStatus({
      updatedAt: new Date().toISOString(),
      source: `translate:${scope}`,
      scope,
      ok: true,
      queued: 0,
      translated: 0,
      pending: 0,
      recentPending: 0,
      batchesDone: 0,
      batchesFailed: 0,
      elapsedSec,
      reason,
      skipped: true,
    });
    await recordTranslationHealthFromItems({
      items: [...securityItems, ...aiItems],
      source: `translate:${scope}`,
      extra: {
        pass: {
          scope,
          translated: 0,
          pending: 0,
          recentPending: 0,
          batchesDone: 0,
          batchesFailed: 0,
          elapsedSec,
          reason,
          skipped: true,
        },
      },
    });

    return {
      ok: true,
      scope,
      withZh,
      withZhAI,
      translated: 0,
      pending: 0,
      recentPending: 0,
      batchesDone: 0,
      batchesFailed: 0,
      elapsedSec,
      skipped: true,
      summaryError: null,
    };
  }

  const translationMap = new Map<string, { titleZh?: string; summaryZh?: string }>();
  let batchesDone = 0;
  let batchesFailed = 0;

  for (let index = 0; index < queuedItems.length; index += TRANSLATION_BATCH_SIZE) {
    if (Date.now() - startTime > TRANSLATION_TIME_BUDGET_MS) {
      break;
    }

    try {
      const batch = queuedItems.slice(index, index + TRANSLATION_BATCH_SIZE);
      const results = await translateItems(batch);
      batch.forEach((item, batchIndex) => {
        const result = results[batchIndex];
        const titleZh = pickLocalizedField({
          source: item.title,
          candidate: result?.titleZh,
        });
        const summaryZh = pickLocalizedField({
          source: item.summary,
          candidate: result?.summaryZh,
        });

        if (titleZh || summaryZh) {
          translationMap.set(item.id, { titleZh, summaryZh });
        }
      });
      batchesDone += 1;
    } catch (error) {
      batchesFailed += 1;
      console.error(`translate[${scope}] batch ${index} failed:`, error);
    }

    if (batchesDone > 0 && batchesDone % 5 === 0) {
      applyTranslations(securityItems, translationMap);
      applyTranslations(aiItems, translationMap);
      await writeFeedCacheState(
        splitCombinedFeedItems(securityItems, aiItems, state.feedA.length),
      );
    }
  }

  applyTranslations(securityItems, translationMap);
  applyTranslations(aiItems, translationMap);
  await writeFeedCacheState(
    splitCombinedFeedItems(securityItems, aiItems, state.feedA.length),
  );

  const withZh = securityItems.filter((item) =>
    isLikelyLocalizedField(item.title, item.titleZh),
  ).length;
  const withZhAI = aiItems.filter((item) =>
    isLikelyLocalizedField(item.title, item.titleZh),
  ).length;
  const unresolved = [...securityItems, ...aiItems].filter(isLikelyUntranslated);
  const pending = unresolved.length;
  const recentPending = unresolved.filter(
    (item) => getTimestamp(item) >= recentCutoff,
  ).length;
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const runIssue = detectTranslationRunIssue({
    queued: queuedItems.length,
    batchesDone,
    batchesFailed,
    translated: translationMap.size,
  });
  const pass = {
    scope,
    translated: translationMap.size,
    pending,
    recentPending,
    batchesDone,
    batchesFailed,
    elapsedSec,
    reason,
  };

  await saveTranslationRunStatus({
    updatedAt: new Date().toISOString(),
    source: `translate:${scope}`,
    scope,
    ok: !runIssue,
    queued: queuedItems.length,
    translated: translationMap.size,
    pending,
    recentPending,
    batchesDone,
    batchesFailed,
    elapsedSec,
    reason,
    code: runIssue?.code ?? null,
    error: runIssue?.message ?? null,
  });

  if (runIssue) {
    await recordTranslationHealthFromItems({
      items: [...securityItems, ...aiItems],
      source: `translate:${scope}`,
      extra: {
        pass: {
          ...pass,
          issueCode: runIssue.code,
          issueMessage: runIssue.message,
        },
      },
    });

    return {
      ok: false,
      scope,
      withZh,
      withZhAI,
      translated: translationMap.size,
      pending,
      recentPending,
      batchesDone,
      batchesFailed,
      elapsedSec,
      skipped: false,
      code: runIssue.code,
      error: runIssue.message,
      summaryError: null,
    };
  }

  await recordTranslationHealthFromItems({
    items: [...securityItems, ...aiItems],
    source: `translate:${scope}`,
    extra: {
      pass,
    },
  });

  return {
    ok: true,
    scope,
    withZh,
    withZhAI,
    translated: translationMap.size,
    pending,
    recentPending,
    batchesDone,
    batchesFailed,
    elapsedSec,
    skipped: false,
    summaryError: null,
  };
}

export async function runTranslationJob(options?: {
  scope?: PipelineScope;
  reason?: string | null;
  maxPasses?: number;
}): Promise<TranslationJobResult> {
  const scope = options?.scope ?? "all";
  const maxPasses =
    options?.maxPasses ?? (scope === "recent" ? 4 : 3);
  let passesRun = 1;
  let result = await runTranslationPass({
    scope,
    reason: options?.reason,
  });

  while (
    result.ok &&
    passesRun < maxPasses &&
    (scope === "recent" ? result.recentPending : result.pending) > 0
  ) {
    passesRun += 1;
    result = await runTranslationPass({
      scope,
      reason: options?.reason,
    });
  }

  let summarizeTriggered = false;
  let summarized = 0;
  let digestItems: number | null = null;
  let summaryError: string | null = null;

  if (result.ok && result.recentPending === 0) {
    summarizeTriggered = true;
    try {
      const summaryResult = await runSummarizationJob({
        scope: "recent",
      });
      summarized = summaryResult.summarized;
      digestItems = summaryResult.digestItems;
    } catch (error) {
      summaryError = error instanceof Error ? error.message : String(error);
      console.error("translate: summarize follow-up failed:", error);
    }
  }

  return {
    ...result,
    passesRun,
    summarizeTriggered,
    summarized,
    digestItems,
    summaryError,
  };
}

export async function runSummarizationJob(options?: {
  scope?: PipelineScope;
}): Promise<SummarizationJobResult> {
  const scope = options?.scope ?? "recent";
  const state = await readFeedCacheState();
  ensureRequiredFeedsAvailable(state);

  const securityItems = [...state.feedA, ...state.feedB];
  const aiItems = [...state.feedAI];
  const cutoff = Date.now() - CUTOFF_MS;

  const toProcess = securityItems
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item }) =>
        !item.summaryAi && (scope === "all" || getTimestamp(item) >= cutoff),
    )
    .slice(0, 50);
  const toProcessAI = aiItems
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item }) =>
        !item.summaryAi && (scope === "all" || getTimestamp(item) >= cutoff),
    )
    .slice(0, 50);

  if (toProcess.length === 0 && toProcessAI.length === 0) {
    const digestResult = await rebuildDigestFromStore();
    await rebuildDailySnapshot(securityItems);
    return {
      ok: true,
      scope,
      summarized: 0,
      total: 0,
      skipped: true,
      digestItems: digestResult.ok ? digestResult.items : null,
    };
  }

  const allToProcess = [
    ...toProcess,
    ...toProcessAI.map(({ item, index }) => ({
      item,
      index: index + securityItems.length,
    })),
  ];
  const combinedItems = [...securityItems, ...aiItems];
  const articleTexts = await Promise.all(
    allToProcess.map(({ item }) => extractArticleText(item.link)),
  );

  let summarized = 0;
  for (let index = 0; index < allToProcess.length; index += SUMMARY_BATCH_SIZE) {
    const batchEntries = allToProcess.slice(index, index + SUMMARY_BATCH_SIZE);
    const batchTexts = articleTexts.slice(index, index + SUMMARY_BATCH_SIZE);
    const batch = batchEntries.map(({ item }, batchIndex) => ({
      item,
      articleText: batchTexts[batchIndex],
    }));
    const results = await summarizeItems(batch);

    batchEntries.forEach(({ index: itemIndex }, batchIndex) => {
      const summaryAi = results[batchIndex]?.summaryAi;
      if (summaryAi) {
        combinedItems[itemIndex] = {
          ...combinedItems[itemIndex],
          summaryAi,
        };
        summarized += 1;
      }
    });
  }

  const nextState = splitCombinedFeedItems(
    combinedItems.slice(0, securityItems.length),
    combinedItems.slice(securityItems.length),
    state.feedA.length,
  );
  await writeFeedCacheState(nextState);

  const digestResult = await rebuildDigestFromStore();
  await rebuildDailySnapshot(nextState.feedA.concat(nextState.feedB));

  return {
    ok: true,
    scope,
    summarized,
    total: allToProcess.length,
    skipped: false,
    digestItems: digestResult.ok ? digestResult.items : null,
  };
}
