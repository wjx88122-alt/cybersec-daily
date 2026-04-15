export type FeedFetchResult<T> = {
  items: T[];
  succeededSources: number;
  failedSources: number;
};

export type FeedRefreshResolution<T> = {
  items: T[];
  stale: boolean;
};

type MergeableFeedItem = {
  id: string;
  pubDate: string;
  title?: string;
  summary?: string;
  image?: string;
  titleZh?: string;
  summaryZh?: string;
  summaryAi?: string;
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

export function mergeFeedItems<T extends MergeableFeedItem>(
  fresh: T[],
  existing: T[],
): T[] {
  const map = new Map(existing.map((item) => [item.id, item]));

  return fresh.map((item) => {
    const prev = map.get(item.id);
    if (!prev) return item;

    const titleChanged = item.title !== prev.title;
    const summaryChanged = item.summary !== prev.summary;

    return {
      ...item,
      pubDate: item.pubDate || prev.pubDate,
      image: prev.image || item.image,
      // If upstream English content changed, stale translated fields must be cleared
      // so the translation pipeline can regenerate them from the new source text.
      titleZh: titleChanged ? item.titleZh : prev.titleZh || item.titleZh,
      summaryZh: summaryChanged ? item.summaryZh : prev.summaryZh || item.summaryZh,
      summaryAi: summaryChanged ? item.summaryAi : prev.summaryAi || item.summaryAi,
    };
  });
}
