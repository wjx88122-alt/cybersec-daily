import { FeedItem } from "./feeds";
import { readAiFeedItems, readSecurityFeedItems } from "./feed-store";

export type FeedPageKind = "security" | "ai";

export async function loadFeedPageItems(kind: FeedPageKind): Promise<FeedItem[]> {
  if (kind === "ai") {
    return readAiFeedItems();
  }

  return readSecurityFeedItems();
}
