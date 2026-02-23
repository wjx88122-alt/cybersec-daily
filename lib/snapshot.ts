import { FeedItem } from "./feeds";
import { DailyDigest } from "./digest";

export type DailySnapshot = {
  date: string; // "2026-02-23"
  totalCount: number;
  byCategory: Record<string, number>;
  bySource: Record<string, number>;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
  };
};

export function generateSnapshot(
  items: FeedItem[],
  digest: DailyDigest | null,
): DailySnapshot {
  const date = new Date().toISOString().slice(0, 10);

  const byCategory: Record<string, number> = {};
  const bySource: Record<string, number> = {};

  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
    bySource[item.source] = (bySource[item.source] ?? 0) + 1;
  }

  const bySeverity = { critical: 0, high: 0, medium: 0 };
  if (digest) {
    for (const item of digest.items) {
      if (item.importance in bySeverity) {
        bySeverity[item.importance]++;
      }
    }
  }

  return { date, totalCount: items.length, byCategory, bySource, bySeverity };
}

export function mergeSnapshot(
  existing: DailySnapshot[],
  next: DailySnapshot,
  maxDays = 30,
): DailySnapshot[] {
  const filtered = existing.filter((s) => s.date !== next.date);
  const merged = [...filtered, next].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  return merged.slice(-maxDays);
}
