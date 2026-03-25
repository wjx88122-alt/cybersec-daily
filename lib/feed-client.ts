type FeedLikeItem = {
  pubDate: string;
};

type FeedApiPayload<T> = {
  items?: T[];
  error?: string;
};

type FeedResponse<T> = {
  ok: boolean;
  status: number;
  json: () => Promise<FeedApiPayload<T>>;
};

type FeedFetcher<T> = (input: string) => Promise<FeedResponse<T>>;

function sortByPubDate<T extends FeedLikeItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ta = new Date(a.pubDate).getTime();
    const tb = new Date(b.pubDate).getTime();
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });
}

export async function loadFeedCollection<T extends FeedLikeItem>(
  fetchImpl: FeedFetcher<T>,
  paths: string[],
): Promise<T[]> {
  const groups = await Promise.all(
    paths.map(async (path) => {
      const response = await fetchImpl(path);
      const payload = await response.json();

      if (!response.ok) {
        const detail = payload?.error ? `: ${payload.error}` : "";
        throw new Error(
          `Feed request failed for ${path} (${response.status})${detail}`,
        );
      }

      return payload.items ?? [];
    }),
  );

  return sortByPubDate(groups.flat());
}
