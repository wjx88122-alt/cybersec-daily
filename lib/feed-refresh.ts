export type FeedFetchResult<T> = {
  items: T[];
  succeededSources: number;
  failedSources: number;
};

export type FeedRefreshResolution<T> = {
  items: T[];
  stale: boolean;
};

export function normalizeFeedPubDate(value?: string | null): string {
  const raw = value?.trim();
  if (!raw) return "";

  const timestamp = new Date(raw).getTime();
  if (Number.isNaN(timestamp)) return "";

  return new Date(timestamp).toISOString();
}

export function resolveFeedRefresh<T>(
  result: FeedFetchResult<T>,
  previous: T[],
): FeedRefreshResolution<T> {
  if (result.succeededSources > 0) {
    return { items: result.items, stale: false };
  }

  if (previous.length > 0) {
    return { items: previous, stale: true };
  }

  throw new Error("All feed sources failed and no previous cache is available");
}
