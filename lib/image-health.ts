const IMAGE_REPAIR_LOCK_KEY = "image-repair-lock";
const IMAGE_REPAIR_COOLDOWN_SEC = 10 * 60;
const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;

type FeedLike = {
  pubDate: string;
  image?: string;
};

type LockStore = {
  set: (
    key: string,
    value: unknown,
    options?: { nx?: boolean; ex?: number },
  ) => Promise<unknown>;
};

let cachedDefaultLockStore: LockStore | null = null;

async function getDefaultLockStore(): Promise<LockStore> {
  if (cachedDefaultLockStore) {
    return cachedDefaultLockStore;
  }
  const mod = await import("./kv");
  cachedDefaultLockStore = mod.kv as unknown as LockStore;
  return cachedDefaultLockStore;
}

type FetchLike = (
  input: string,
  init?: {
    headers?: Record<string, string>;
    cache?: RequestCache;
  },
) => Promise<{
  status: number;
  json: () => Promise<unknown>;
}>;

export function countRecentMissingImages(items: FeedLike[], now = Date.now()) {
  const recentCutoff = now - RECENT_WINDOW_MS;
  return items.reduce((count, item) => {
    const ts = new Date(item.pubDate).getTime();
    if (Number.isNaN(ts) || ts < recentCutoff) {
      return count;
    }
    return item.image ? count : count + 1;
  }, 0);
}

export async function triggerImageRepairIfNeeded(args: {
  items: FeedLike[];
  appBaseUrl: string;
  source: string;
  authToken?: string;
  reason?: string;
  now?: number;
  lockStore?: LockStore;
  fetchImpl?: FetchLike;
}) {
  const recentMissingImages = countRecentMissingImages(
    args.items,
    args.now ?? Date.now(),
  );
  if (recentMissingImages === 0 || !args.authToken) {
    return {
      triggered: false as const,
      accepted: false as const,
      recentMissingImages,
    };
  }

  const lockStore = args.lockStore ?? (await getDefaultLockStore());
  const lock = await lockStore.set(
    IMAGE_REPAIR_LOCK_KEY,
    {
      source: args.source,
      requestedAt: new Date(args.now ?? Date.now()).toISOString(),
      recentMissingImages,
    },
    { nx: true, ex: IMAGE_REPAIR_COOLDOWN_SEC },
  );
  const accepted = lock === "OK";
  if (!accepted) {
    return {
      triggered: false as const,
      accepted: false as const,
      recentMissingImages,
    };
  }

  const fetchImpl = args.fetchImpl ?? (fetch as FetchLike);
  const url = `${args.appBaseUrl}/api/images?scope=recent&reason=${encodeURIComponent(args.reason ?? args.source)}`;
  try {
    const response = await fetchImpl(url, {
      headers: {
        authorization: `Bearer ${args.authToken}`,
      },
      cache: "no-store",
    });

    let payload: { imagesFound?: number } | null = null;
    try {
      payload = (await response.json()) as { imagesFound?: number };
    } catch {
      payload = null;
    }

    return {
      triggered: true as const,
      accepted: true as const,
      recentMissingImages,
      resultStatus: response.status,
      imagesFound: payload?.imagesFound ?? null,
      error: null,
    };
  } catch (error) {
    return {
      triggered: true as const,
      accepted: true as const,
      recentMissingImages,
      resultStatus: null,
      imagesFound: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
