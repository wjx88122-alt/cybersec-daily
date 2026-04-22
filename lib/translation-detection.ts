export type TranslationDetectionItem = {
  title?: string;
  summary?: string;
  titleZh?: string;
  summaryZh?: string;
};

export const normalizeTranslationText = (text?: string) => (text ?? "").trim();
export const hasChineseCharacters = (text: string) => /[\u4e00-\u9fff]/.test(text);
const MIN_CHINESE_CHARS_FOR_LOCALIZATION = 2;
export const countChineseCharacters = (text: string) =>
  (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
export const hasMeaningfulChineseLocalization = (text?: string) =>
  countChineseCharacters(normalizeTranslationText(text)) >=
  MIN_CHINESE_CHARS_FOR_LOCALIZATION;
const normalizeComparable = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "");
const PRODUCTISH_TITLE_TOKEN = /^[A-Za-z0-9][A-Za-z0-9:+._-]*$/;
const VERSIONISH_TITLE_TOKEN = /^v?\d+(?:\.\d+)+(?:[a-z]\d*)?$/i;
const PRODUCT_TITLE_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "by",
  "for",
  "from",
  "how",
  "in",
  "into",
  "is",
  "new",
  "of",
  "on",
  "or",
  "the",
  "this",
  "to",
  "what",
  "when",
  "where",
  "why",
  "with",
]);

function isLikelyProductVersionTitle(text?: string) {
  const title = normalizeTranslationText(text);
  if (!title || hasMeaningfulChineseLocalization(title) || title.length > 48) {
    return false;
  }

  const tokens = title.split(/\s+/).filter(Boolean);
  if (tokens.length < 2 || tokens.length > 6) {
    return false;
  }

  if (!tokens.every((token) => PRODUCTISH_TITLE_TOKEN.test(token))) {
    return false;
  }

  if (tokens.some((token) => PRODUCT_TITLE_STOPWORDS.has(token.toLowerCase()))) {
    return false;
  }

  return (
    tokens.some((token) => VERSIONISH_TITLE_TOKEN.test(token)) &&
    tokens.some((token) => /[A-Za-z]/.test(token) && !VERSIONISH_TITLE_TOKEN.test(token))
  );
}

export function requiresChineseLocalization(source?: string) {
  const sourceText = normalizeTranslationText(source);
  return Boolean(sourceText) && !hasMeaningfulChineseLocalization(sourceText);
}

export function isLikelyLocalizedField(source?: string, localized?: string) {
  const sourceText = normalizeTranslationText(source);
  const localizedText = normalizeTranslationText(localized);

  if (!localizedText) {
    return false;
  }

  if (!requiresChineseLocalization(sourceText)) {
    return true;
  }

  if (hasMeaningfulChineseLocalization(localizedText)) {
    return true;
  }

  const sourceComparable = normalizeComparable(sourceText);
  const localizedComparable = normalizeComparable(localizedText);
  if (sourceComparable && sourceComparable === localizedComparable) {
    return false;
  }

  // For non-Chinese source text, zh fields must contain Chinese characters.
  return false;
}

export function isLikelyUntranslatedItem(item: TranslationDetectionItem) {
  const title = normalizeTranslationText(item.title);
  const summary = normalizeTranslationText(item.summary);
  const titleNeedsTranslation = requiresChineseLocalization(title);
  const summaryNeedsTranslation = requiresChineseLocalization(summary);

  const titleLocalized = isLikelyLocalizedField(title, item.titleZh);
  const summaryLocalized = isLikelyLocalizedField(summary, item.summaryZh);
  const titleTranslationOptional =
    titleNeedsTranslation &&
    !titleLocalized &&
    summaryLocalized &&
    isLikelyProductVersionTitle(title);

  return (
    (titleNeedsTranslation && !titleLocalized && !titleTranslationOptional) ||
    (summaryNeedsTranslation && !summaryLocalized)
  );
}

export function pickLocalizedField(options: {
  source?: string;
  candidate?: string;
  existing?: string;
}) {
  const candidate = normalizeTranslationText(options.candidate);
  if (isLikelyLocalizedField(options.source, candidate)) {
    return candidate;
  }

  const existing = normalizeTranslationText(options.existing);
  if (isLikelyLocalizedField(options.source, existing)) {
    return existing;
  }

  return undefined;
}
