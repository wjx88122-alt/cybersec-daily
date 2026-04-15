export const CUTOFF_MS = 24 * 60 * 60 * 1000;

export type FeedItem = {
  id: string;
  title: string;
  summary: string;
  pubDate: string;
  titleZh?: string;
  summaryZh?: string;
  summaryAi?: string;
};

const normalize = (text?: string) => (text ?? "").trim();
const isChinese = (text: string) => /[\u4e00-\u9fff]/.test(text);

function getTimestamp(item: Pick<FeedItem, "pubDate">) {
  const value = new Date(item.pubDate).getTime();
  return Number.isNaN(value) ? 0 : value;
}

export type TranslationRepairScope = "recent" | "all";

export function clearTranslatedFieldsForRetranslation<T extends FeedItem>(
  items: T[],
  options: { scope: TranslationRepairScope; now?: number },
): {
  items: T[];
  clearedItems: number;
  clearedFields: number;
} {
  const now = options.now ?? Date.now();
  const recentCutoff = now - CUTOFF_MS;
  let clearedItems = 0;
  let clearedFields = 0;

  const nextItems = items.map((item) => {
    if (options.scope === "recent" && getTimestamp(item) < recentCutoff) {
      return item;
    }

    const titleNeedsRetranslation = Boolean(normalize(item.title)) && !isChinese(item.title);
    const summaryNeedsRetranslation =
      Boolean(normalize(item.summary)) && !isChinese(item.summary);

    let changed = false;
    const nextItem: T = { ...item };

    if (titleNeedsRetranslation && normalize(item.titleZh)) {
      nextItem.titleZh = undefined;
      clearedFields += 1;
      changed = true;
    }

    if (summaryNeedsRetranslation && normalize(item.summaryZh)) {
      nextItem.summaryZh = undefined;
      clearedFields += 1;
      changed = true;
    }

    if (summaryNeedsRetranslation && normalize(item.summaryAi)) {
      nextItem.summaryAi = undefined;
      clearedFields += 1;
      changed = true;
    }

    if (changed) {
      clearedItems += 1;
    }

    return nextItem;
  });

  return {
    items: nextItems,
    clearedItems,
    clearedFields,
  };
}
