import { DailyDigest } from "./digest";
import { FeedItem } from "./feeds";
import { kv } from "./kv";
import { DailySnapshot } from "./snapshot";

export type FeedGroupKey = "feed-a" | "feed-b" | "feed-ai";

export type FeedCacheState = {
  feedA: FeedItem[];
  feedB: FeedItem[];
  feedAI: FeedItem[];
};

function sortByPubDate(items: FeedItem[]): FeedItem[] {
  return [...items].sort((a, b) => {
    const ta = new Date(a.pubDate).getTime();
    const tb = new Date(b.pubDate).getTime();
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });
}

export async function readFeedGroup(key: FeedGroupKey): Promise<FeedItem[]> {
  return (await kv.get<FeedItem[]>(key)) ?? [];
}

export async function readFeedCacheState(): Promise<FeedCacheState> {
  const [feedA, feedB, feedAI] = await Promise.all([
    readFeedGroup("feed-a"),
    readFeedGroup("feed-b"),
    readFeedGroup("feed-ai"),
  ]);

  return { feedA, feedB, feedAI };
}

export async function writeFeedCacheState(state: FeedCacheState) {
  await Promise.all([
    kv.set("feed-a", state.feedA),
    kv.set("feed-b", state.feedB),
    kv.set("feed-ai", state.feedAI),
  ]);
}

export async function readSecurityFeedItems(): Promise<FeedItem[]> {
  const { feedA, feedB } = await readFeedCacheState();
  return sortByPubDate([...feedA, ...feedB]);
}

export async function readAiFeedItems(): Promise<FeedItem[]> {
  const { feedAI } = await readFeedCacheState();
  return sortByPubDate(feedAI);
}

export async function readAllFeedItems(): Promise<FeedItem[]> {
  const { feedA, feedB, feedAI } = await readFeedCacheState();
  return sortByPubDate([...feedA, ...feedB, ...feedAI]);
}

export async function readDigestFromStore() {
  return kv.get<DailyDigest>("digest");
}

export async function writeDigestToStore(digest: DailyDigest) {
  await kv.set("digest", digest);
}

export async function readSnapshotsFromStore() {
  return (await kv.get<DailySnapshot[]>("snapshots")) ?? [];
}

export async function writeSnapshotsToStore(snapshots: DailySnapshot[]) {
  await kv.set("snapshots", snapshots);
}
