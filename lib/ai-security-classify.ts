/**
 * AI Security 子分类器：把原始 "AI 安全" feed 条目按内容关键词归入更细的子分类。
 *
 * 设计：按优先级匹配关键词组，第一个命中即返回。
 * 所有子分类均以 "AI " 前缀，与 hot-score.ts 的 isAiCategory(AI_CATEGORY_PREFIX) 契约一致。
 *
 * 参考 AI HOT 的内容组织：它把 AI 资讯按 模型/产品/行业/论文/技巧 分区；
 * 这里对应把 AI Security 按 攻击手法/防御研究/治理 数据 维度分区。
 */
import type { FeedItem } from "./feeds.ts";

/** AI 子分类常量（均带 "AI " 前缀）。 */
export const AI_SUBCATEGORIES = [
  "AI 安全",
  "AI 红队与攻击",
  "AI 对抗与鲁棒",
  "AI 提示注入",
  "AI 治理与标准",
  "AI 隐私与数据",
] as const;

type Rule = { cat: string; re: RegExp };

// 顺序即优先级：先匹配最具体/高信号的维度，再落到宽泛的红队兜底。
// 注意：privacy/governance 排在 red-team 之前，避免 "training data extraction attack"
// 这类数据维度条目被宽泛的 attack 关键词抢走。
const RULES: Rule[] = [
  // 提示注入 / 越狱 / 间接注入（最具体的攻击手法，优先判）
  {
    cat: "AI 提示注入",
    re: /(prompt injection|indirect prompt injection|jailbreak|越狱|提示注入|诱导|payload smuggling|template injection)/i,
  },
  // 隐私 / 数据 / 训练数据泄露（具体维度，优先于泛红队）
  {
    cat: "AI 隐私与数据",
    re: /(privacy|隐私|data leak|数据泄露|data breach|training data|训练数据|memoriz|记忆|pii|个人信息|gdpr|unlearn|机器遗忘|membership inference|成员推断|reconstruction|重建攻击|differential privacy|差分隐私|model extraction|模型抽取)/i,
  },
  // 治理 / 标准 / 合规 / 政策（具体维度，优先于泛红队）
  {
    cat: "AI 治理与标准",
    re: /(governance|治理|regulation|监管|regulat|compliance|合规|policy|政策|standard|标准|framework|框架|eu ai act|ai act|nist ai|rmf|executive order|行政令|copyright|版权|audit|审计|risk management)/i,
  },
  // 对抗样本 / 鲁棒性 / 可信 ML / 防御
  {
    cat: "AI 对抗与鲁棒",
    re: /(adversarial|对抗样本|对抗攻击|robustness|鲁棒|evasion|逃避攻击|defenses?|防御|defending|secure (?:ml|ai)|trusted (?:ai|ml)|可信|safety|alignment|对齐|interpretability|可解释|guardrails?|护栏|sandbox escape|沙箱逃逸|owasp (?:top 10 )?(?:for )?llm)/i,
  },
  // 红队 / 攻击 / 滥用 / 诈骗 / deepfake 武器化（宽泛兜底，放最后）
  {
    cat: "AI 红队与攻击",
    re: /(red team|red-team|红队|red teaming|offensive|attack|攻击|exploit|漏洞利用|abuse|滥用|fraud|诈骗|deepfake|深度伪造|malicious|weaponiz|武器化|data poisoning|投毒|backdoor|后门|模型窃取|model stealing|exfiltrat|逆向)/i,
  },
];

/**
 * 把一个 AI 条目归类到子分类。
 * 输入条目应来自 FEED_SOURCES_AI（原始 category 已是 "AI 安全"）。
 * 无命中 → 返回 "AI 安全"（兜底）。
 */
export function classifyAiSecurityItem(item: FeedItem): string {
  const text = `${item.title} ${item.summary ?? ""} ${item.summaryAi ?? ""}`;
  for (const rule of RULES) {
    if (rule.re.test(text)) return rule.cat;
  }
  return "AI 安全";
}

/**
 * 就地为 AI feed 条目打子分类标签（返回新数组，不改原对象）。
 * 仅处理原始 category 为 "AI 安全"（或以 "AI " 开头）的条目，安全类条目原样保留。
 */
export function applyAiSubcategories(items: FeedItem[]): FeedItem[] {
  return items.map((item) => {
    if (item.category !== "AI 安全" && !item.category.startsWith("AI ")) {
      return item;
    }
    const sub = classifyAiSecurityItem(item);
    return sub === item.category ? item : { ...item, category: sub };
  });
}
