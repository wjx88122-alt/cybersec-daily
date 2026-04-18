export type TranslationRunStats = {
  queued: number;
  batchesDone: number;
  batchesFailed: number;
  translated: number;
};

export type TranslationRunIssueCode =
  | "all-batches-failed"
  | "no-valid-translations";

export type TranslationRunIssue = {
  code: TranslationRunIssueCode;
  message: string;
};

export function detectTranslationRunIssue(
  stats: TranslationRunStats,
): TranslationRunIssue | null {
  if (stats.queued <= 0) {
    return null;
  }

  const attemptedBatches = stats.batchesDone + stats.batchesFailed;
  if (attemptedBatches <= 0) {
    return null;
  }

  if (stats.translated > 0) {
    return null;
  }

  if (stats.batchesDone === 0 && stats.batchesFailed > 0) {
    return {
      code: "all-batches-failed",
      message:
        "All translation batches failed before any item was translated. Check LLM provider keys and model settings in Vercel.",
    };
  }

  return {
    code: "no-valid-translations",
    message:
      "Translation requests completed but produced no valid Chinese localized fields.",
  };
}
