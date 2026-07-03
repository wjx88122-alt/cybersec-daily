/**
 * 评分原语 (scoring primitives) —— 自包含模块，仅依赖 translation-detection。
 * 从 digest.ts 抽出，使 scoreFeedItem 可被 node --test 直接测试，
 * 也让 hot-rank.ts 不再间接依赖 digest.ts 的重依赖 (deepseek/openai)。
 *
 * 行为与原 digest.ts 内联实现完全一致，仅做位置迁移 + export。
 */
import { pickLocalizedField } from "./translation-detection.ts";

export const DIGEST_LOOKBACK_HOURS = 72;
export const AI_CATEGORY_PREFIX = "AI ";
export const SECURITY_KEYWORDS: Array<[RegExp, number]> = [
  [/\bcve-\d{4}-\d+\b/i, 16],
  [/(zero[- ]day|0[- ]day|在野利用|已被利用|actively exploited)/i, 14],
  [/(rce|remote code execution|提权|privilege escalation|沙箱逃逸)/i, 12],
  [/(勒索软件|ransomware|数据泄露|data breach|供应链|supply chain)/i, 10],
  [/(apt|后门|backdoor|botnet|僵尸网络|恶意软件)/i, 8],
  [/(cisa|msrc|advisory|补丁|patch|fortinet|cisco|microsoft)/i, 6],
  [/(acqui(?:re|sition)|merger|\bm&a\b|并购|收购)/i, 14],
  [/(funding|raises?\s+\$|series\s+[a-e]\b|ipo|融资|上市)/i, 13],
  [/(launches?|general availability|\bga\b|unveils?|发布|上线)/i, 8],
  [/(gartner|idc|forrester|magic quadrant|market (?:share|size|forecast)|市场规模)/i, 8],
  [/(partnership|alliance|渠道|合作伙伴|集成)/i, 6],
];
export const AI_KEYWORDS: Array<[RegExp, number]> = [
  // AI 安全高信号：提示注入 / 越狱 / 在野利用
  [/(prompt injection|indirect prompt injection|提示注入|jailbreak|越狱|sandbox escape|沙箱逃逸)/i, 14],
  // 红队 / 攻击 / 滥用 / deepfake
  [/(red team|red-team|红队|adversarial|对抗|attack|攻击|abuse|滥用|deepfake|深度伪造|data poisoning|投毒|model stealing|模型窃取|exfiltrat)/i, 10],
  // 数据泄露 / 隐私
  [/(data leak|数据泄露|data breach|training data|训练数据|memoriz|记忆|pii|个人信息|membership inference|成员推断)/i, 10],
  // 治理 / 标准 / 合规
  [/(governance|治理|regulation|监管|regulat|compliance|合规|nist|rmf|eu ai act|ai act|owasp|standard|标准)/i, 8],
  // 鲁棒性 / 对齐 / 可信
  [/(robustness|鲁棒|alignment|对齐|guardrails?|护栏|safety research|安全研究|trusted (?:ai|ml)|可信)/i, 6],
];

export type ScoredItem = { item: import("./feeds").FeedItem; score: number };

export function isAiCategory(category: string): boolean {
  return category.startsWith(AI_CATEGORY_PREFIX);
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 与原 digest.ts 内联实现逐行一致的热度评分。 */
export function scoreFeedItem(
  item: import("./feeds").FeedItem,
  now: number,
): number {
  const title = pickLocalizedField({
    source: item.title,
    candidate: item.titleZh,
    existing: item.title,
  });
  const summary = pickLocalizedField({
    source: item.summary,
    candidate: item.summaryZh,
    existing: item.summaryAi,
  });
  const text = `${title || item.title} ${summary || item.summaryAi || item.summary}`.toLowerCase();
  const patterns = isAiCategory(item.category) ? AI_KEYWORDS : SECURITY_KEYWORDS;
  const pub = new Date(item.pubDate).getTime();
  const ageHours = Number.isFinite(pub)
    ? Math.max(0, (now - pub) / 3_600_000)
    : DIGEST_LOOKBACK_HOURS;

  let score = Math.max(0, DIGEST_LOOKBACK_HOURS - ageHours) * 0.35;
  for (const [re, weight] of patterns) {
    if (re.test(text)) score += weight;
  }

  const source = item.source.toLowerCase();
  if (/(cisa|msrc|nvd|talos|mandiant|securityweek|the hacker news)/i.test(source)) {
    score += 3;
  }
  if (
    /(openai|deepmind|google ai|microsoft ai|nvidia|hugging face|langchain)/i.test(source)
  ) {
    score += 2;
  }
  if (
    pickLocalizedField({ source: item.title, candidate: item.titleZh }) &&
    pickLocalizedField({
      source: item.summary,
      candidate: item.summaryZh,
      existing: item.summaryAi,
    })
  ) {
    score += 1;
  }

  return score;
}
