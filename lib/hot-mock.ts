/**
 * Security Hot 本地 mock 数据。
 *
 * 用途：本地开发（无 KV env）时让 /hot、/items/[id]、/daily 有真实内容可渲染和截图。
 * 线上 KV 有数据时 readSecurityFeedItems 会返回真实数据，不读这里。
 *
 * 数据特征：
 *  - 跨多个信源报道同一事件（制造聚合簇，验证 coverageCount 与详情页"同一事件 N 家报道"）
 *  - 含 CVE 编号、勒索软件、APT 等强信号，能触发不同 score 档位与推荐理由
 *  - pubDate 基于"当前时刻"动态生成，保证时间窗过滤始终命中
 */
import type { FeedItem } from "./feeds.ts";

/** 相对当前时刻偏移 N 分钟，返回 ISO 字符串。 */
function agoMinutes(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

/**
 * mock 安全 feed 条目。刻意让前几条围绕同一事件（GPT-5.6 等价 → 这里用"LockBit 3.0 复活"），
 * 由多个信源报道，触发聚合。
 */
export const MOCK_SECURITY_ITEMS: FeedItem[] = [
  // —— 簇 1：LockBit 3.0 勒索软件复活（4 信源，强聚合） ——
  {
    id: "mock-lockbit-bc",
    title: "LockBit 3.0 affiliates regroup under new infrastructure despite takedown",
    titleZh: "LockBit 3.0 勒索组织在被捣毁后利用新基础设施重新集结",
    summary:
      "Security researchers tracking LockBit confirm core affiliates have rebuilt infrastructure on alternative bulletproof hosts, resuming encryption operations within weeks of the February takedown. New samples show updated evasion modules.",
    summaryAi:
      "追踪 LockBit 的安全研究人员确认，其核心附属团伙已在备用抗封服务器上重建基础设施，并在 2 月联合执法捣毁行动后数周内恢复加密攻击。新样本显示其反检测模块已更新。建议立即排查边界设备日志与异常加密进程。",
    summaryZh:
      "追踪 LockBit 的安全研究人员确认，其核心附属团伙已在备用抗封服务器上重建基础设施，并在联合执法捣毁行动后数周内恢复加密攻击。新样本显示其反检测模块已更新。",
    link: "https://www.bleepingcomputer.com/news/security/lockbit-3-affiliates-regroup/",
    source: "Bleeping Computer",
    category: "恶意软件",
    pubDate: agoMinutes(45),
  },
  {
    id: "mock-lockbit-thn",
    title: "LockBit ransomware group resurfaces with updated LockBit 3.0 builder",
    titleZh: "LockBit 勒索组织带着更新的 LockBit 3.0 构建器重新出现",
    summary:
      "The infamous LockBit ransomware operation has re-emerged with a refreshed builder and renewed affiliate recruitment, undermining the impact of the recent international law enforcement action.",
    summaryAi:
      "臭名昭著的 LockBit 勒索组织带着刷新版的构建器和重新招募附属团伙的计划再次现身，削弱了近期国际联合执法行动的效果。关注新一轮勒索浪潮对医疗与制造行业的冲击。",
    summaryZh:
      "臭名昭著的 LockBit 勒索组织带着刷新版的构建器和重新招募附属团伙的计划再次现身，削弱了近期国际联合执法行动的效果。",
    link: "https://thehackernews.com/lockbit-resurfaces",
    source: "The Hacker News",
    category: "恶意软件",
    pubDate: agoMinutes(80),
  },
  {
    id: "mock-lockbit-sec",
    title: "LockBit 3.0 operators pivot to new affiliate program after takedown",
    titleZh: "LockBit 3.0 运营者在被捣毁后转向新附属计划",
    summary:
      "Kaspersky researchers detail how LockBit operators pivoted infrastructure and launched a revised affiliate program, with encryption activity resuming faster than prior takedown recoveries.",
    summaryAi:
      "卡巴斯基研究人员详述了 LockBit 运营者如何更换基础设施并推出修订版附属计划，其加密活动恢复速度快于此前历次捣毁后的水平。表明勒索生态韧性增强。",
    summaryZh:
      "卡巴斯基研究人员详述了 LockBit 运营者如何更换基础设施并推出修订版附属计划，其加密活动恢复速度快于此前历次捣毁后的水平。",
    link: "https://securelist.com/lockbit-affiliate-pivot",
    source: "Securelist by Kaspersky",
    category: "威胁情报",
    pubDate: agoMinutes(120),
  },
  {
    id: "mock-lockbit-record",
    title: "LockBit rebrands but keeps encrypting: ransomware resurgence analysis",
    titleZh: "LockBit 更名但继续加密：勒索软件复活分析",
    summary:
      "Analysts confirm LockBit's rebrand is cosmetic while core encryption operations continue, with victim counts climbing again across manufacturing and logistics sectors.",
    summaryAi:
      "分析人士确认 LockBit 的更名只是表面动作，核心加密活动仍在继续，制造业与物流业的受害者数量再次攀升。",
    summaryZh:
      "分析人士确认 LockBit 的更名只是表面动作，核心加密活动仍在继续，制造业与物流业的受害者数量再次攀升。",
    link: "https://therecord.media/lockbit-rebrands",
    source: "The Record",
    category: "综合资讯",
    pubDate: agoMinutes(160),
  },

  // —— 簇 2：CVE 在野利用（2 信源，CVE 强制同簇） ——
  {
    id: "mock-cve-thn",
    title: "CISA warns of actively exploited zero-day CVE-2026-1337 in widely-used VPN appliance",
    titleZh: "CISA 警告广泛使用的 VPN 设备存在已被在野利用的零日漏洞 CVE-2026-1337",
    summary:
      "CISA added CVE-2026-1337, a critical pre-auth remote code execution flaw in a widely deployed enterprise VPN appliance, to its Known Exploited Vulnerabilities catalog after confirmed active exploitation in the wild.",
    summaryAi:
      "CISA 将 CVE-2026-1337（某广泛部署的企业级 VPN 设备中的未授权前远程代码执行漏洞）加入已知被利用漏洞目录，已确认在野利用。建议立即排查暴露在公网的 VPN 设备并应用厂商补丁。",
    summaryZh:
      "CISA 将 CVE-2026-1337（某广泛部署的企业级 VPN 设备中的未授权前远程代码执行漏洞）加入已知被利用漏洞目录，已确认在野利用。",
    link: "https://thehackernews.com/cve-2026-1337-vpn",
    source: "The Hacker News",
    category: "漏洞预警",
    pubDate: agoMinutes(30),
  },
  {
    id: "mock-cve-cisa",
    title: "Known Exploited Vulnerability: CVE-2026-1337 added to KEV catalog",
    titleZh: "已知被利用漏洞：CVE-2026-1337 已加入 KEV 目录",
    summary:
      "CVE-2026-1337 has been added to the CISA Known Exploited Vulnerabilities catalog. Federal agencies are required to remediate per BOD 22-01 deadlines.",
    summaryAi:
      "CVE-2026-1337 已加入 CISA 已知被利用漏洞目录，联邦机构须按 BOD 22-01 期限完成修复。",
    summaryZh:
      "CVE-2026-1337 已加入 CISA 已知被利用漏洞目录，联邦机构须按 BOD 22-01 期限完成修复。",
    link: "https://www.cisa.gov/kev/CVE-2026-1337",
    source: "CISA Advisories",
    category: "政府/监管",
    pubDate: agoMinutes(50),
  },

  // —— 单条：APT 分析 ——
  {
    id: "mock-apt-mandiant",
    title: "UNC5325: Chinese threat actor persists in edge appliances via kernel-level rootkit",
    titleZh: "UNC5325：某威胁行为者通过内核级 rootkit 在边缘设备上持久化",
    summary:
      "Mandiant uncovers UNC5325, a Chinese espionage actor achieving long-term persistence in network edge devices through a novel kernel-level rootkit that survives factory resets and firmware rewrites.",
    summaryAi:
      "Mandiant 披露 UNC5325（某谍报行为者）通过一种新型内核级 rootkit 在网络边缘设备上实现长期持久化，该 rootkit 可在恢复出厂设置和固件重写后存活。对暴露的边缘设备构成严重持久化威胁。",
    summaryZh:
      "Mandiant 披露 UNC5325（某谍报行为者）通过一种新型内核级 rootkit 在网络边缘设备上实现长期持久化，该 rootkit 可在恢复出厂设置和固件重写后存活。",
    link: "https://www.mandiant.com/unc5325-rootkit",
    source: "Mandiant Blog",
    category: "威胁情报",
    pubDate: agoMinutes(200),
  },

  // —— 单条：数据泄露 ——
  {
    id: "mock-breach-troy",
    title: "Major password manager breach exposes 15M encrypted vaults, master keys at risk",
    titleZh: "某主流密码管理器泄露致 1500 万加密保险库暴露，主密码面临风险",
    summary:
      "A breach at a popular password manager exposed metadata for 15 million encrypted vaults. While vault contents remain encrypted, attackers may now brute-force master keys of users with weak passwords.",
    summaryAi:
      "某主流密码管理器遭遇泄露，1500 万加密保险库的元数据暴露。虽保险库内容仍加密，但攻击者可对弱主密码用户实施暴力破解。受影响用户应立即更换主密码并启用 MFA。",
    summaryZh:
      "某主流密码管理器遭遇泄露，1500 万加密保险库的元数据暴露。虽保险库内容仍加密，但攻击者可对弱主密码用户实施暴力破解。",
    link: "https://www.troyhunt.com/password-manager-breach",
    source: "Troy Hunt",
    category: "深度分析",
    pubDate: agoMinutes(300),
  },

  // —— 单条：补丁星期二 ——
  {
    id: "mock-patch-msrc",
    title: "Microsoft Patch Tuesday: 90 flaws patched including 5 critical RCEs",
    titleZh: "微软补丁星期二：修复 90 个漏洞含 5 个严重 RCE",
    summary:
      "Microsoft's monthly update resolves 90 vulnerabilities, five rated critical remote code execution. Administrators should prioritize the Hyper-V and Exchange RCEs being actively targeted.",
    summaryAi:
      "微软月度更新修复 90 个漏洞，其中 5 个为严重远程代码执行。管理员应优先处理正被在野利用的 Hyper-V 与 Exchange RCE 漏洞。",
    summaryZh:
      "微软月度更新修复 90 个漏洞，其中 5 个为严重远程代码执行。管理员应优先处理正被在野利用的 Hyper-V 与 Exchange RCE 漏洞。",
    link: "https://msrc.microsoft.com/blog/patch-tuesday",
    source: "Microsoft Security Response Center",
    category: "漏洞预警",
    pubDate: agoMinutes(400),
  },

  // —— 单条：深度评论 ——
  {
    id: "mock-schneier",
    title: "The economics of ransomware: why deterrence is failing in 2026",
    titleZh: "勒索软件的经济学：为何 2026 年威慑失效",
    summary:
      "An analysis of why current deterrence models fail against ransomware: insurance payouts, cryptocurrency laundering routes, and jurisdictional gaps combine to keep the crime profitable despite arrests.",
    summaryAi:
      "分析为何现有威慑模型对勒索软件失效：保险赔付、加密货币洗钱路径与司法管辖空白共同维持着这门犯罪的利润空间，即便有抓捕行动。",
    summaryZh:
      "分析为何现有威慑模型对勒索软件失效：保险赔付、加密货币洗钱路径与司法管辖空白共同维持着这门犯罪的利润空间，即便有抓捕行动。",
    link: "https://www.schneier.com/ransomware-economics",
    source: "Schneier on Security",
    category: "深度分析",
    pubDate: agoMinutes(600),
  },
];

/**
 * mock AI Security feed 条目。覆盖各子分类（提示注入/红队/对抗/治理/隐私），
 * 验证 ai-security-classify 子分类与 /ai 页渲染。原始 category 均为 "AI 安全"，
 * 由 applyAiSubcategories 在读取时重新打子分类标签。
 */
export const MOCK_AI_ITEMS: FeedItem[] = [
  {
    id: "mock-ai-injection",
    title: "Indirect prompt injection via tool outputs hijacks LLM agents",
    titleZh: "通过工具输出的间接提示注入可劫持 LLM 智能体",
    summary:
      "Researchers demonstrate that untrusted tool/API outputs can carry hidden instructions that hijack agentic LLM workflows, bypassing system prompts and exfiltrating data.",
    summaryAi:
      "研究人员演示，不可信的工具/API 输出可携带隐藏指令，劫持智能体 LLM 工作流，绕过系统提示并窃取数据。提示注入仍是 LLM 应用最现实的攻击面。",
    link: "https://simonwillison.net/indirect-prompt-injection",
    source: "Simon Willison",
    category: "AI 安全",
    pubDate: agoMinutes(25),
  },
  {
    id: "mock-ai-redteam",
    title: "Microsoft AI Red Team uncovers abuse vectors in production copilots",
    titleZh: "微软 AI 红队发现生产环境 Copilot 中的滥用向量",
    summary:
      "Microsoft's AI Red Team details how prompt-based copilots can be abused for data exfiltration and unauthorized actions, sharing their red-teaming methodology.",
    summaryAi:
      "微软 AI 红队详述基于提示的 Copilot 如何被滥用于数据外泄和未授权操作，并分享了其红队方法论。",
    link: "https://www.microsoft.com/en-us/security/blog/ai-red-team",
    source: "Microsoft Security：Blog",
    category: "AI 安全",
    pubDate: agoMinutes(70),
  },
  {
    id: "mock-ai-adversarial",
    title: "Adversarial patches evade multimodal model safety filters at scale",
    titleZh: "对抗补丁可大规模绕过多模态模型安全过滤器",
    summary:
      "A new study shows small adversarial image patches reliably bypass safety guardrails in vision-language models, undermining robustness of content filters.",
    summaryAi:
      "新研究表明，微小的对抗图像补丁能可靠绕过视觉语言模型的安全护栏，削弱内容过滤器的鲁棒性。对齐与防御研究需跟进。",
    link: "https://arxiv.org/abs/adversarial-patches-vlm",
    source: "arXiv：密码学与安全 (cs.CR)",
    category: "AI 安全",
    pubDate: agoMinutes(140),
  },
  {
    id: "mock-ai-governance",
    title: "NIST updates AI RMF with adversarial machine learning taxonomy",
    titleZh: "NIST 更新 AI RMF，纳入对抗机器学习分类法",
    summary:
      "NIST publishes an update to the AI Risk Management Framework incorporating the NIST AI 100-2 adversarial ML taxonomy, giving organizations a standard reference for AI threats.",
    summaryAi:
      "NIST 发布 AI 风险管理框架更新，纳入 NIST AI 100-2 对抗机器学习分类法，为组织提供 AI 威胁的标准参照。",
    link: "https://www.nist.gov/ai-rmf-update",
    source: "NIST：News",
    category: "AI 安全",
    pubDate: agoMinutes(220),
  },
  {
    id: "mock-ai-privacy",
    title: "Training data extraction attacks recover PII from production LLMs",
    titleZh: "训练数据抽取攻击可从生产 LLM 中还原个人信息",
    summary:
      "Researchers show that targeted prompts can extract memorized personally identifiable information from production language models, raising privacy concerns over training data leakage.",
    summaryAi:
      "研究人员展示定向提示可从生产语言模型中抽取被记忆的个人身份信息，引发训练数据泄露的隐私担忧。",
    link: "https://danielmiessler.com/training-data-extraction",
    source: "Daniel Miessler",
    category: "AI 安全",
    pubDate: agoMinutes(320),
  },
  {
    id: "mock-ai-jailbreak",
    title: "New jailbreak technique bypasses alignment using cipher-encoded prompts",
    titleZh: "新越狱技术利用密文编码提示绕过对齐",
    summary:
      "A novel jailbreak encodes disallowed requests as ciphers, slipping past RLHF alignment and eliciting harmful content from frontier models.",
    summaryAi:
      "一种新越狱手法将违禁请求编码为密文，绕过 RLHF 对齐，诱导前沿模型生成有害内容。",
    link: "https://www.aisnakeoil.com/cipher-jailbreak",
    source: "AI Snake Oil",
    category: "AI 安全",
    pubDate: agoMinutes(420),
  },
  {
    id: "mock-ai-deepfake",
    title: "Deepfake-powered CEO voice fraud drains $25M from multinational",
    titleZh: "Deepfake 伪造 CEO 语音诈骗致跨国公司损失 2500 万美元",
    summary:
      "A multinational lost $25M after scammers used deepfake technology to clone its CFO's voice and face in a video call, weaponizing generative AI for corporate fraud.",
    summaryAi:
      "某跨国公司因诈骗者用深度伪造技术克隆其 CFO 的声音和面部进行视频通话而损失 2500 万美元，将生成式 AI 武器化用于企业欺诈。",
    link: "https://www.wiz.io/blog/deepfake-ceo-fraud",
    source: "Wiz：Research",
    category: "AI 安全",
    pubDate: agoMinutes(520),
  },
];

/** mock 安全 feed 是否启用：仅当无 KV env 时（本地开发）。 */
export function hasMockEnv(): boolean {
  return !process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN;
}

/** mock 日报历史（最近 14 天），供 /daily 侧边栏导航。 */
import type { DailySnapshot } from "./snapshot.ts";

export const MOCK_SNAPSHOTS: DailySnapshot[] = (() => {
  const cats = ["漏洞预警", "威胁情报", "恶意软件", "综合资讯", "深度分析"];
  const srcs = [
    "The Hacker News",
    "Bleeping Computer",
    "CISA Advisories",
    "Mandiant Blog",
    "Schneier on Security",
  ];
  const out: DailySnapshot[] = [];
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(Date.now() - i * 86_400_000);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const total = 20 + ((i * 7) % 15);
    for (let j = 0; j < total; j += 1) {
      const c = cats[j % cats.length];
      const s = srcs[j % srcs.length];
      byCategory[c] = (byCategory[c] ?? 0) + 1;
      bySource[s] = (bySource[s] ?? 0) + 1;
    }
    out.push({
      date,
      totalCount: total,
      byCategory,
      bySource,
      bySeverity: {
        critical: 2 + (i % 3),
        high: 5 + (i % 4),
        medium: total - 7 - (i % 3),
      },
    });
  }
  return out;
})();

/** mock 日报头条标题（按日期），供 /daily 侧边栏每天一行标题。 */
export const MOCK_DAILY_HEADLINES: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  const headlines = [
    "LockBit 3.0 勒索组织复活，多行业受冲击",
    "CVE-2026-1337 VPN 零日漏洞被加入 KEV 目录",
    "UNC5325 APT 利用内核级 rootkit 实现持久化",
    "主流密码管理器泄露致 1500 万保险库暴露",
    "微软补丁星期二修复 90 漏洞含 5 严重 RCE",
    "勒索软件经济学：2026 年威慑为何失效",
    "供应链攻击新变种瞄准开源包仓库",
    "CISA 联合公告披露跨平台凭据窃取工具集",
    "某国家级 APT 组织渗透能源关键基础设施",
    "云存储错误配置致 3 亿条记录泄露",
  ];
  for (let i = 0; i < MOCK_SNAPSHOTS.length; i += 1) {
    out[MOCK_SNAPSHOTS[i].date] = headlines[i % headlines.length];
  }
  return out;
})();
