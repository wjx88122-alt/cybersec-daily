import { pickDisplayTitle } from "./translation-detection";

export type SearchableFeedItem = {
  title: string;
  summary: string;
  titleZh?: string;
  summaryZh?: string;
  summaryAi?: string;
};

const normalizeTranslationText = (text?: string) => (text ?? "").trim();
const hasMeaningfulChineseLocalization = (text?: string) =>
  (normalizeTranslationText(text).match(/[\u4e00-\u9fff]/g) ?? []).length >= 2;
const normalizeComparable = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "");
export function pickLocalizedField(options: {
  source?: string;
  candidate?: string;
  existing?: string;
}) {
  const sourceText = normalizeTranslationText(options.source);
  const candidateText = normalizeTranslationText(options.candidate);
  const needsLocalization = Boolean(sourceText) && !hasMeaningfulChineseLocalization(sourceText);

  if (!candidateText) {
    const fallback = normalizeTranslationText(options.existing);
    return needsLocalization || !fallback ? undefined : fallback;
  }
  if (!needsLocalization) return candidateText;
  if (hasMeaningfulChineseLocalization(candidateText)) return candidateText;

  const sourceComparable = normalizeComparable(sourceText);
  const candidateComparable = normalizeComparable(candidateText);
  if (sourceComparable && sourceComparable === candidateComparable) return undefined;

  return undefined;
}

export function getLocalizedFeedTitle(item: SearchableFeedItem) {
  return (
    pickDisplayTitle({
      source: item.title,
      candidate: item.titleZh,
      existing: item.title,
      summarySource: item.summary,
      summaryCandidate: item.summaryZh,
      summaryExisting: item.summaryAi,
    }) || item.title
  );
}

export function getLocalizedFeedSummary(item: SearchableFeedItem) {
  return (
    pickLocalizedField({
      source: item.summary,
      candidate: item.summaryZh,
      existing: item.summaryAi,
    }) || item.summaryAi || item.summary
  );
}

export function matchesFeedSearch(item: SearchableFeedItem, search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return true;

  const localizedTitle = getLocalizedFeedTitle(item).toLowerCase();
  const localizedSummary = getLocalizedFeedSummary(item).toLowerCase();

  return (
    item.title.toLowerCase().includes(normalizedSearch) ||
    item.summary.toLowerCase().includes(normalizedSearch) ||
    (item.summaryAi || "").toLowerCase().includes(normalizedSearch) ||
    localizedTitle.includes(normalizedSearch) ||
    localizedSummary.includes(normalizedSearch)
  );
}
