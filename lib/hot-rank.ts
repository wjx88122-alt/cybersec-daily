/**
 * 安全热榜数据层 (Security Hot ranking)
 *
 * 复用 digest.ts 的 scoreFeedItem 打分逻辑，叠加跨信源聚合 (clustering)，
 * 产出带热度分、排名、覆盖信源数的热榜数据。
 *
 * 设计取舍：
 * - 聚类用确定性 Jaccard 相似度 (token 级)，零依赖、SSR 安全、即时生效。
 *   相同 CVE 编号强制同簇，保证漏洞类强合并。
 *   未来若效果不够，可在 extractTokens 内接嵌入模型做语义回退，接口不变。
 * - score 不持久化，每次 SSR 重算 (数据来自 KV 缓存，无 IO 开销)，与现有 digest 一致。
 */
import type { FeedItem } from "./feeds.ts";
import {
  scoreFeedItem,
  normalizeTitle,
} from "./hot-score.ts";
import { pickLocalizedField } from "./translation-detection.ts";

/** 热榜条目：在 FeedItem 基础上叠加热度元信息。 */
export type HotItem = FeedItem & {
  /** 热度分 (基础分 + 覆盖信源数加权)，保留一位小数。 */
  score: number;
  /** 排名，从 1 开始。 */
  rank: number;
  /** 该事件被多少个信源报道 (聚合后)。未聚合的条目为 1。 */
  coverageCount: number;
  /** 覆盖该事件的所有信源名 (去重)。 */
  sources: string[];
  /** 聚合簇内所有条目的链接 (主条目在前)。 */
  relatedLinks: string[];
  /** AI 推荐理由: 一句话说明这条为什么值得看 (热度/多信源/严重度维度)。 */
  reason: string;
};

/** 聚类相似度阈值：token 集合 Jaccard ≥ 此值视为同一事件。 */
const SIMILARITY_THRESHOLD = 0.5;

/** 覆盖信源数的加权系数：score + log2(coverage) * COVERAGE_WEIGHT。 */
const COVERAGE_WEIGHT = 4;

/** 强信号 token：出现在标题里会单独抽出来作为高权重 token。 */
const STRONG_TOKENS = [
  "cve",
  "zero-day",
  "0-day",
  "ransomware",
  "勒索",
  "breach",
  "泄露",
  "backdoor",
  "后门",
  "apt",
  "botnet",
  "供应链",
  "supply",
  "patch",
  "补丁",
];

/**
 * 从 (本地化) 标题里抽取聚类 token。
 * token 来源：
 *  1. CVE 编号 (强信号，精确匹配)
 *  2. ≥3 字符的英文词 (通常是产品/厂商/技术名)
 *  3. 强关键词词干 (勒索/泄露/apt 等中英文强信号)
 */
function extractTokens(item: FeedItem): Set<string> {
  const title = pickLocalizedField({
    source: item.title,
    candidate: item.titleZh,
    existing: item.title,
  });
  const raw = `${title || item.title}`;
  const normalized = normalizeTitle(raw);
  const tokens = new Set<string>();

  // 1. CVE 编号：精确抽取并保留 (不归一化，保证强合并)
  const cveMatches = raw.match(/\bcve-\d{4}-\d+\b/gi);
  if (cveMatches) {
    for (const cve of cveMatches) tokens.add(cve.toLowerCase());
  }

  // 2. 英文词 (≥3 字符)
  const words = normalized.match(/[a-z]{3,}/g) ?? [];
  for (const word of words) {
    // 过滤掉纯噪声词
    if (!NOISE_WORDS.has(word)) tokens.add(word);
  }

  // 3. 强关键词 (中文 + 英文强信号)
  const lower = raw.toLowerCase();
  for (const token of STRONG_TOKENS) {
    if (lower.includes(token.toLowerCase())) tokens.add(token.toLowerCase());
  }

  return tokens;
}

/** 中文连续片段也作为 token，帮助中文标题聚类。 */
function extractCjkTokens(item: FeedItem): Set<string> {
  const title = pickLocalizedField({
    source: item.title,
    candidate: item.titleZh,
    existing: item.title,
  });
  const raw = `${title || item.title}`;
  const tokens = new Set<string>();
  // 抽取 ≥2 字符的中文片段
  const cjkChunks = raw.match(/[\u4e00-\u9fff]{2,}/g) ?? [];
  for (const chunk of cjkChunks) {
    // 中文做 2-gram，提升相似度稳定性
    for (let i = 0; i < chunk.length - 1; i += 1) {
      tokens.add(chunk.slice(i, i + 2));
    }
  }
  return tokens;
}

const NOISE_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "your",
  "how",
  "what",
  "why",
  "are",
  "was",
  "has",
  "new",
  "via",
]);

/** 合并两套 token 集合。 */
function buildTokenSet(item: FeedItem): Set<string> {
  const a = extractTokens(item);
  const b = extractCjkTokens(item);
  for (const t of b) a.add(t);
  return a;
}

/**
 * 跨语言强信号 token 集 (用于 OOC 跨语言合并)。
 * 与 buildTokenSet 的区别：
 *  - 不含中文 2-gram (会稀释跨语言相似度)
 *  - 同时抽取英文标题 + 中文翻译(titleZh) 的强 token，合并成一套
 *    → 使"英文条目"与"中文条目"能共享 lockbit / 勒索 / 软件 等跨语言锚点
 * 这样无需 embedding，也能合并同事件的中英文不同信源报道。
 */
function buildStrongTokenSet(item: FeedItem): Set<string> {
  const zhTitle = pickLocalizedField({
    source: item.title,
    candidate: item.titleZh,
    existing: item.title,
  });
  // 英文标题 + 中文标题 各抽一次强 token (走同一个 extractTokens)
  const a = extractTokens({ ...item, title: item.title });
  const zh = extractTokens({ ...item, title: `${zhTitle || ""}` });
  for (const t of zh) a.add(t);
  return a;
}

/** 强 token 相似度阈值 (独立于 SIMILARITY_THRESHOLD)。 */
const STRONG_SIMILARITY_THRESHOLD = 0.5;


/** Jaccard 相似度：|A ∩ B| / |A ∪ B|。任一为空返回 0。 */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  const smaller = a.size <= b.size ? a : b;
  const larger = a.size <= b.size ? b : a;
  for (const t of smaller) {
    if (larger.has(t)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** 两条 item 是否含相同 CVE 编号 (强制同簇)。 */
function shareCve(a: FeedItem, b: FeedItem): boolean {
  const cveA = (a.title || "").match(/\bcve-\d{4}-\d+\b/i);
  const cveB = (b.title || "").match(/\bcve-\d{4}-\d+\b/i);
  return !!cveA && !!cveB && cveA[0].toLowerCase() === cveB[0].toLowerCase();
}

type Cluster = FeedItem[];

/**
 * 跨信源聚合：把报道同一事件的多条 item 合并成一簇。
 * 双信号聚类 (dual-signal)：
 *  1) 完整 token 集 (含中文 2-gram) Jaccard ≥ 阈值 → 同语言相似
 *  2) 强 token 集 (跨语言锚点，无 2-gram) Jaccard ≥ 阈值 → 跨语言相似
 *  3) 共享 CVE 编号 → 强制同簇
 * 任一命中即并入簇。这样既保留纯中文/纯英文的同事件合并，
 * 又能合并中英文跨语言报道，且无需引入 embedding。
 * O(n·k)，k 为簇数，对几百条规模足够快。
 */
export function clusterItems(items: FeedItem[]): Cluster[] {
  const clusters: Array<{
    members: FeedItem[];
    tokenSets: Set<string>[];
    strongSets: Set<string>[];
  }> = [];

  for (const item of items) {
    const tokens = buildTokenSet(item);
    const strong = buildStrongTokenSet(item);
    let merged = false;

    for (const cluster of clusters) {
      // 信号 1: 完整 token 相似 (同语言)
      const lexHit = cluster.tokenSets.some(
        (set) => jaccard(tokens, set) >= SIMILARITY_THRESHOLD,
      );
      // 信号 2: 强 token 相似 (跨语言)
      const strongHit = cluster.strongSets.some(
        (set) => jaccard(strong, set) >= STRONG_SIMILARITY_THRESHOLD,
      );
      // 信号 3: 共享 CVE
      const cveHit = cluster.members.some((m) => shareCve(m, item));
      if (lexHit || strongHit || cveHit) {
        cluster.members.push(item);
        cluster.tokenSets.push(tokens);
        cluster.strongSets.push(strong);
        merged = true;
        break;
      }
    }

    if (!merged) {
      clusters.push({
        members: [item],
        tokenSets: [tokens],
        strongSets: [strong],
      });
    }
  }

  return clusters.map((c) => c.members);
}

/**
 * 生成「推荐理由」: 一句话说明这条为什么值得看。
 *
 * 设计取舍: 这里用确定性规则生成 (热度/多信源/严重度/分类维度)，
 * 不在 SSR 路径调 LLM (会拖慢页面、增加成本，违背 ISR 设计)。
 * 若未来要更强的语义理由，可在 cron 流水线预计算 reason 后存入 FeedItem，
 * 这里优先读取已存值，接口不变。
 */
function buildReason(
  primary: FeedItem,
  score: number,
  coverageCount: number,
): string {
  // 优先使用已预计算的 reason (未来 LLM 预计算路径写入)
  const precomputed = (primary as FeedItem & { reason?: string }).reason;
  if (precomputed && precomputed.trim()) return precomputed.trim();

  const title = pickLocalizedField({
    source: primary.title,
    candidate: primary.titleZh,
    existing: primary.title,
  });
  const lower = `${title || primary.title} ${primary.summary || ""}`.toLowerCase();

  // 维度 1: 严重度 (CVE/在野利用/勒索)
  if (/\bcve-\d{4}-\d+\b/i.test(lower)) {
    const cve = (lower.match(/\bcve-\d{4}-\d+\b/i) || [])[0]?.toUpperCase();
    if (/(zero[- ]day|0[- ]day|在野利用|actively exploited)/i.test(lower)) {
      return `${cve ?? "该漏洞"}已被证实在野利用，建议立即排查受影响资产。`;
    }
    return `${cve ?? "该漏洞"}值得跟进，关注厂商补丁与影响范围。`;
  }
  if (/(ransomware|勒索|data breach|数据泄露)/i.test(lower)) {
    return coverageCount > 1
      ? `重大${/ransomware|勒索/.test(lower) ? "勒索" : "泄露"}事件，已被 ${coverageCount} 个信源广泛报道，行业关注度高。`
      : `${/ransomware|勒索/.test(lower) ? "勒索" : "泄露"}事件，关注受影响范围与攻击手法。`;
  }

  // 维度 2: 多信源 (行业共识信号)
  if (coverageCount >= 5) {
    return `已被 ${coverageCount} 个信源报道，是今日安全圈共识性热点。`;
  }
  if (coverageCount >= 3) {
    return `获 ${coverageCount} 个信源关注，热度持续上升。`;
  }

  // 维度 3: 热度档位
  if (score >= 45) return `今日高热度话题，反映当前安全趋势值得关注。`;
  if (score >= 30) return `有代表性的安全动态，可作为日常关注参考。`;

  // 维度 4: 分类兜底
  const cat = primary.category;
  if (cat === "威胁情报" || cat === "漏洞预警") {
    return `${cat}类信息，对研判当前威胁态势有参考价值。`;
  }
  return `${cat}类动态，提供安全行业的最新视角。`;
}

/**
 * 把一个聚合簇折叠成一条 HotItem。
 * - 主条目取簇内最新 (pubDate 最大) 的一条
 * - score 用主条目基础分 + 覆盖信源数加权
 */
function collapseCluster(members: FeedItem[], now: number): HotItem {
  const byDesc = [...members].sort((a, b) => {
    const ta = new Date(a.pubDate).getTime();
    const tb = new Date(b.pubDate).getTime();
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });
  const primary = byDesc[0];

  // 信源去重 (同名信源只算一次)
  const sources = [...new Set(members.map((m) => m.source))];
  const coverageCount = sources.length;

  const baseScore = scoreFeedItem(primary, now);
  const coverageBonus =
    coverageCount > 1 ? Math.log2(coverageCount) * COVERAGE_WEIGHT : 0;
  const score = Math.round((baseScore + coverageBonus) * 10) / 10;

  const relatedLinks = [
    primary.link,
    ...byDesc.slice(1).map((m) => m.link),
  ];

  const reason = buildReason(primary, score, coverageCount);

  return {
    ...primary,
    score,
    rank: 0, // 由 rankHotItems 统一赋值
    coverageCount,
    sources,
    relatedLinks,
    reason,
  };
}

/**
 * 热榜主入口：聚合 → 打分 → 排序 → 赋 rank。
 * @param items 原始安全 feed 条目
 * @param windowHours 时间窗 (小时)，仅保留窗口内 pubDate 的条目
 * @param now 当前时间戳，默认 Date.now()
 */
export function rankHotItems(
  items: FeedItem[],
  windowHours: number,
  now: number = Date.now(),
): HotItem[] {
  const cutoff = now - windowHours * 3_600_000;

  // 1. 时间窗过滤
  const inWindow = items.filter((item) => {
    const t = new Date(item.pubDate).getTime();
    return Number.isFinite(t) && t >= cutoff;
  });

  // 2. 跨信源聚合
  const clusters = clusterItems(inWindow);

  // 3. 折叠成 HotItem + 打分
  const ranked = clusters
    .map((members) => collapseCluster(members, now))
    .sort((a, b) => {
      const diff = b.score - a.score;
      if (Math.abs(diff) > 0.05) return diff;
      // 同分按时间倒序
      const ta = new Date(a.pubDate).getTime();
      const tb = new Date(b.pubDate).getTime();
      return tb - ta;
    });

  // 4. 赋 rank
  return ranked.map((item, index) => ({ ...item, rank: index + 1 }));
}
