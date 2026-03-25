type DigestInputItem = {
  pubDate: string;
};

export function buildDigestInputItems<T extends DigestInputItem>(
  feedA: T[] | null | undefined,
  feedB: T[] | null | undefined,
  feedAI: T[] | null | undefined,
): T[] {
  if (!feedA || !feedB) {
    throw new Error("Missing required feed-a and feed-b data");
  }

  return [...feedA, ...feedB, ...(feedAI ?? [])].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
  );
}
