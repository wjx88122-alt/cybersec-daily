import { DailyDigest } from "./digest";
import { FeedItem } from "./feeds";
import { kv } from "./kv";
import { DailySnapshot } from "./snapshot";
import {
  MOCK_SECURITY_ITEMS,
  MOCK_AI_ITEMS,
  MOCK_SNAPSHOTS,
  hasMockEnv,
} from "./hot-mock";
import { applyAiSubcategories } from "./ai-security-classify";

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
  const real = [...feedA, ...feedB];
  // 本地无 KV env 时回退 mock 数据，保证 /hot /items /daily 有内容可渲染与截图
  if (real.length === 0 && hasMockEnv()) {
    return sortByPubDate(MOCK_SECURITY_ITEMS);
  }
  return sortByPubDate(real);
}

export async function readAiFeedItems(): Promise<FeedItem[]> {
  const { feedAI } = await readFeedCacheState();
  const real = feedAI;
  // 本地无 KV env 时回退 mock AI Security 数据
  const source = real.length === 0 && hasMockEnv() ? MOCK_AI_ITEMS : real;
  // 读取时按关键词打 AI Security 子分类（红队/对抗/提示注入/治理/隐私）
  return sortByPubDate(applyAiSubcategories(source));
}

export async function readAllFeedItems(): Promise<FeedItem[]> {
  const { feedA, feedB, feedAI } = await readFeedCacheState();
  const realSecurity = [...feedA, ...feedB];
  const security =
    realSecurity.length === 0 && hasMockEnv()
      ? MOCK_SECURITY_ITEMS
      : realSecurity;
  const ai = feedAI.length === 0 && hasMockEnv() ? MOCK_AI_ITEMS : feedAI;
  return sortByPubDate([...security, ...applyAiSubcategories(ai)]);
}

export async function readDigestFromStore() {
  return kv.get<DailyDigest>("digest");
}

export async function writeDigestToStore(digest: DailyDigest) {
  await kv.set("digest", digest);
}

export async function readSnapshotsFromStore() {
  const snapshots = (await kv.get<DailySnapshot[]>("snapshots")) ?? [];
  // 本地无 KV env 时回退 mock 日报历史
  if (snapshots.length === 0 && hasMockEnv()) {
    return MOCK_SNAPSHOTS;
  }
  return snapshots;
}

export async function writeSnapshotsToStore(snapshots: DailySnapshot[]) {
  await kv.set("snapshots", snapshots);
}
