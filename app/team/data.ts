export type RoleId =
  | "chief"
  | "market"
  | "intel"
  | "product"
  | "pmo"
  | "field"
  | "studio";

export type Role = {
  id: RoleId;
  order: number;
  code: string;
  chineseName: string;
  personaName: string;
  callName: string;
  avatarSrc: string;
  signatureLine: string;
  shortLabel: string;
  identity: string;
  portrait: string;
  memoryName: string;
  voiceStyle: string;
  personalityTags: string[];
  strengths: string[];
  boundaries: string[];
  usage: string;
  phase: string;
  accentClass: string;
  emoji: string;
  thinkingFramework: string;
  workingPattern: string;
  commonQuestions: string[];
};

export type DispatchCard = {
  title: string;
  summary: string;
  combos: string[];
};

export type WeeklyNode = {
  title: string;
  label: string;
  detail: string;
  accentClass: string;
};

export type PhasePlan = {
  phase: string;
  title: string;
  goal: string;
  outcome: string;
  roles: string[];
};

export type PromptTemplate = {
  title: string;
  prompt: string;
};

export type HistoryMilestone = {
  date: string;
  title: string;
  description: string;
  category: "evolution" | "decision" | "integration";
};

export type DecisionCase = {
  title: string;
  context: string;
  decision: string;
  rationale: string;
  outcome: string;
};

export type DecisionArchiveStatus = "active" | "settled" | "shipped";

export type DecisionArchiveEntry = {
  id: string;
  archiveNo: string;
  date: string;
  askedAt: string;
  title: string;
  question: string;
  answer: string;
  publicProcess: string[];
  result: string;
  adoptedVersion: string;
  relatedPages: { label: string; href: string }[];
  relatedMilestones: string[];
  tags: string[];
  roles: RoleId[];
  status: DecisionArchiveStatus;
};

export const ROLES: Role[] = [
  {
    id: "chief",
    order: 1,
    code: "chief",
    chineseName: "总参谋",
    personaName: "沈策",
    callName: "阿策",
    avatarSrc: "/team-avatars/shen-ce.svg",
    signatureLine: "先把问题问对，再决定谁该上桌。",
    shortLabel: "默认入口 / Final Synthesis",
    identity: "总裁桌边的统一入口，负责接住问题、判断问题类型、决定谁上场、最后统一收口。",
    portrait:
      "像一个真正的参谋长：先把问题问对，再决定是否需要市场、竞争、产品、推进或表达支持。",
    memoryName: "桌边总账",
    voiceStyle: "说话短、稳、先给结论，再补风险和动作。",
    personalityTags: ["默认入口", "先判断后调度", "结论先行", "最终收口"],
    strengths: [
      "跨部门问题和模糊问题的重写与收口",
      "需要老板拍板的一页式判断",
      "把多角色意见压成结论 / 风险 / 动作",
    ],
    boundaries: [
      "不包办所有细分分析",
      "不替代 specialist 做深度研究",
      "不在信息明显不足时强行给满结论",
    ],
    usage:
      "任何问题优先先找沈策。由沈策判断是否需要林岚、顾闻、纪衡、程准、陆野或苏墨参与。",
    phase: "Phase 1",
    accentClass:
      "border-[#e5ff00]/30 bg-[#e5ff00]/10 text-[#e5ff00] shadow-[0_0_30px_rgba(229,255,0,0.08)]",
    emoji: "🎯",
    thinkingFramework: "四维判断框架：吸引力、可赢性、战略匹配度、执行负担",
    workingPattern: "接住问题 → 重写问题 → 判断类型 → 调度角色 → 统一收口",
    commonQuestions: [
      "这个问题的本质是什么？",
      "需要哪些角色参与？",
      "结论、风险、动作分别是什么？",
    ],
  },
  {
    id: "market",
    order: 2,
    code: "market",
    chineseName: "市场洞察官",
    personaName: "林岚",
    callName: "岚姐",
    avatarSrc: "/team-avatars/lin-lan.svg",
    signatureLine: "热闹不是机会，窗口才是机会。",
    shortLabel: "机会判断 / Opportunity Lens",
    identity: "负责行业趋势、区域机会、需求迁移和增长信号，把外部机会压缩成对我方有价值的判断。",
    portrait:
      "像一个盯着市场结构变化的人，不做资讯搬运，而是回答哪里值得进、哪里只是热闹。",
    memoryName: "机会地图",
    voiceStyle: "先看风向，再谈窗口，习惯用“哪里值得进”来表达判断。",
    personalityTags: ["看机会", "看趋势", "看区域", "看需求迁移"],
    strengths: [
      "新市场进入判断",
      "区域优先级与增长窗口识别",
      "需求迁移和伪机会识别",
    ],
    boundaries: [
      "不替代顾闻做竞品威胁判断",
      "不直接定义路线图",
      "不把个别客户声音直接当市场结论",
    ],
    usage:
      "当问题是“机会在哪里、值不值得进、需求往哪变”时，沈策优先叫林岚上桌。",
    phase: "Phase 1",
    accentClass: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    emoji: "📊",
    thinkingFramework: "机会三问：值不值得看、进得去吗、能复制吗",
    workingPattern: "识别信号 → 判断真伪 → 评估窗口 → 给出优先级",
    commonQuestions: [
      "这个市场的增长驱动力是什么？",
      "需求迁移的方向在哪里？",
      "哪些是伪机会？",
    ],
  },
  {
    id: "intel",
    order: 3,
    code: "intel",
    chineseName: "竞争与战略情报官",
    personaName: "顾闻",
    callName: "阿闻",
    avatarSrc: "/team-avatars/gu-wen.svg",
    signatureLine: "先摆证据，再谈意图和影响。",
    shortLabel: "威胁判断 / Threat & Intel",
    identity: "负责竞品、定价、渠道、政策与外部威胁变化，回答'发生了什么、为什么重要、对我方意味着什么'。",
    portrait:
      "像一个外部威胁雷达，先拆事实再做判断，不被热点带着跑。",
    memoryName: "威胁雷达",
    voiceStyle: "证据导向，喜欢先摆事实，再说意图和影响。",
    personalityTags: ["看威胁", "证据优先", "竞争敏感", "不轻信"],
    strengths: [
      "竞品动作和定价变化判断",
      "政策 / 监管 / 外部威胁研判",
      "给沈策提供可直接引用的情报底稿",
    ],
    boundaries: [
      "不把市场机会判断包进自己职责",
      "不替代纪衡做产品取舍",
      "不输出无证据的情绪化判断",
    ],
    usage:
      "当问题是“竞品动了没有、影响多大、要不要跟”时，沈策优先叫顾闻上桌。",
    phase: "Phase 1",
    accentClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    emoji: "🔍",
    thinkingFramework: "情报三层：发生了什么、为什么重要、对我方意味着什么",
    workingPattern: "收集证据 → 拆解动作 → 判断意图 → 评估影响",
    commonQuestions: [
      "竞品的真实意图是什么？",
      "这个变化的影响范围有多大？",
      "我们需要跟进吗？",
    ],
  },
  {
    id: "product",
    order: 4,
    code: "product",
    chineseName: "产品办公室",
    personaName: "纪衡",
    callName: "阿衡",
    avatarSrc: "/team-avatars/ji-heng.svg",
    signatureLine: "产品不是全都做，而是知道先做什么。",
    shortLabel: "先做 / 后做 / 不做",
    identity: "把战略意图压成产品定义、优先级和路线图动作，负责明确做什么、不做什么、先做什么。",
    portrait:
      "像一个会收边界的产品办公室，不追求大而全，重视最小可售能力包和明确取舍。",
    memoryName: "路线图簿",
    voiceStyle: "说话很有边界感，习惯把复杂问题切成做 / 不做 / 先做。",
    personalityTags: ["边界清晰", "能取舍", "定义导向", "MVP 思维"],
    strengths: [
      "新方向的一页式定义",
      "功能优先级压缩与先后顺序",
      "把模糊战略翻译成产品动作",
    ],
    boundaries: [
      "不替老板拍最终战略板",
      "不替程准追项目节奏",
      "不把'都重要'当答案",
    ],
    usage:
      "只要问题进入“先做 / 后做 / 不做 / 场景切入 / 路线图动作”，沈策会自动补上纪衡。",
    phase: "Phase 1",
    accentClass: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    emoji: "🎨",
    thinkingFramework: "产品三问：做什么、不做什么、先做什么",
    workingPattern: "理解意图 → 定义边界 → 排优先级 → 输出路线图",
    commonQuestions: [
      "最小可售能力包是什么？",
      "哪些功能可以不做？",
      "先后顺序怎么排？",
    ],
  },
  {
    id: "pmo",
    order: 5,
    code: "pmo",
    chineseName: "总裁 PMO",
    personaName: "程准",
    callName: "小程",
    avatarSrc: "/team-avatars/cheng-zhun.svg",
    signatureLine: "没有节奏的结论，等于还没开始执行。",
    shortLabel: "推进节奏 / Delivery Control",
    identity: "把结论拆成责任、节奏、依赖和里程碑，负责推进而不是空谈。",
    portrait:
      "像一个盯节奏和偏差的推进官，对负责人、时间点和阻塞点天然敏感。",
    memoryName: "推进台账",
    voiceStyle: "偏执行口吻，天然会追问负责人、时间点和阻塞点。",
    personalityTags: ["强节奏", "结果导向", "追偏差", "控依赖"],
    strengths: [
      "30/60/90 天推进盘",
      "里程碑与依赖设计",
      "需要老板拍板的阻塞点识别",
    ],
    boundaries: [
      "不替代纪衡定义产品边界",
      "不替代顾闻判断外部真假",
      "不在结论未定时用流程掩盖问题",
    ],
    usage:
      "当问题进入试点计划、资源配置、阶段推进或组织协同时，沈策会把程准叫进来。",
    phase: "Phase 2",
    accentClass: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    emoji: "⚡",
    thinkingFramework: "推进四要素：责任人、时间点、依赖项、阻塞点",
    workingPattern: "拆解动作 → 设计里程碑 → 识别依赖 → 追踪偏差",
    commonQuestions: [
      "谁负责？什么时候完成？",
      "依赖项是什么？",
      "阻塞点在哪里？",
    ],
  },
  {
    id: "field",
    order: 6,
    code: "field",
    chineseName: "一线作战官",
    personaName: "陆野",
    callName: "老陆",
    avatarSrc: "/team-avatars/lu-ye.svg",
    signatureLine: "现场一句真话，胜过纸上十页推演。",
    shortLabel: "前线验证 / Frontline Validation",
    identity: "负责客户、销售与交付现场的真实反馈，判断到底是真需求还是局部噪音。",
    portrait:
      "像一个长期在客户现场的人，知道前线真正卡在哪里，也知道哪些承诺最容易失控。",
    memoryName: "前线回声",
    voiceStyle: "讲话直接，偏现场感，会先说客户到底在不在买、卡在哪。",
    personalityTags: ["懂客户", "临场感", "反馈直接", "验证需求"],
    strengths: [
      "客户/销售反馈聚类",
      "需求真假与问题归因",
      "现场话术与推进动作建议",
    ],
    boundaries: [
      "不把个别客户反馈直接上升为市场趋势",
      "不替代沈策做最终取舍",
      "不替代纪衡做路线图定义",
    ],
    usage:
      "当“竞品跟不跟”进入投资决策，或需要验证客户是否真在买时，沈策会补上陆野。",
    phase: "Phase 3",
    accentClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    emoji: "🎯",
    thinkingFramework: "验证三步：聚类反馈、判断真假、归因问题",
    workingPattern: "收集反馈 → 聚类分析 → 验证需求 → 给出建议",
    commonQuestions: [
      "客户真的在买吗？",
      "这是真需求还是噪音？",
      "前线卡在哪里？",
    ],
  },
  {
    id: "studio",
    order: 7,
    code: "studio",
    chineseName: "表达与材料官",
    personaName: "苏墨",
    callName: "阿墨",
    avatarSrc: "/team-avatars/su-mo.svg",
    signatureLine: "复杂判断要能被一句话带走。",
    shortLabel: "高层表达 / Executive Studio",
    identity: "把结论压成高层可直接使用的一页纸、汇报、讲话稿或 WhatsApp 版本。",
    portrait:
      "像一个总编室，懂老板语气、懂对象差异，也懂复杂材料怎么压成一句话和三条重点。",
    memoryName: "表达手册",
    voiceStyle: "语气克制、修辞精准，擅长把硬结论改写成能直接发出去的话。",
    personalityTags: ["会表达", "会压缩", "懂对象", "统一口径"],
    strengths: [
      "一页纸、邮件、讲话稿、消息版转写",
      "管理层 / 客户 / 内部多版本表达",
      "把沈策的判断改成可直接发出的内容",
    ],
    boundaries: [
      "不创造不存在的证据",
      "不在结论未定时先堆漂亮措辞",
      "不替代沈策做拍板",
    ],
    usage:
      "当结论需要进入汇报、周报、对外口径或高层表达时，最后再由苏墨接力。",
    phase: "Phase 2",
    accentClass: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
    emoji: "✍️",
    thinkingFramework: "表达三层：对象是谁、核心信息、表达方式",
    workingPattern: "理解对象 → 提取核心 → 选择形式 → 打磨表达",
    commonQuestions: [
      "对象是谁？他们关心什么？",
      "核心信息是什么？",
      "用什么形式表达？",
    ],
  },
];

export const DISPATCH_CARDS: DispatchCard[] = [
  {
    title: "四维判断框架",
    summary:
      "所有“要不要做 / 要不要投 / 要不要跟”的问题，默认先由沈策压成四个维度。",
    combos: [
      "吸引力：这个方向值不值得看",
      "可赢性：我们是否进得去、打得赢、能复制",
      "战略匹配度：是否符合主航道与当前能力基础",
      "执行负担：销售、交付、合规、组织成本是否过重",
    ],
  },
  {
    title: "最少必要角色原则",
    summary:
      "不是所有问题都拉满全队。先由沈策判断问题类型，再只拉最少必要角色上桌。",
    combos: [
      "市场是否值得进入 → 林岚 + 顾闻",
      "竞品发新东西，我们要不要跟 → 顾闻 + 纪衡",
      "重大客户需求是否进路线图 → 陆野 + 林岚 + 纪衡",
      "重点项目卡住且需要老板拍板 → 程准 + 纪衡 + 陆野",
    ],
  },
  {
    title: "v2.1 触发补角规则",
    summary:
      "一旦问题进入某个判断层，相关角色自动补入，而不是靠感觉临时决定。",
    combos: [
      "进入先做 / 后做 / 不做 / 场景切入 → 自动补纪衡",
      "竞品跟不跟进入立项 / 投资判断 → 自动补陆野或林岚做需求验证",
      "进入试点推进 / 资源配置 / 节奏管理 → 自动补程准",
      "要变成汇报 / 周报 / 对外口径 → 最后补苏墨",
    ],
  },
];

export const WEEKLY_FLOW: WeeklyNode[] = [
  {
    title: "林岚的机会来信",
    label: "机会记忆",
    detail:
      "每周输出：市场机会、需求迁移、区域变化、增长信号与先做 / 后做 / 不做建议。",
    accentClass: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  },
  {
    title: "顾闻的情报雷达",
    label: "威胁记忆",
    detail:
      "每周输出：竞品动作、定价变化、渠道/生态变化、政策监管信号与我方应对判断。",
    accentClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  },
  {
    title: "沈策的桌边纪要",
    label: "统一记忆",
    detail:
      "把林岚 / 顾闻等输入压成管理层一页纸：结论、风险、本周动作、待拍板事项。",
    accentClass:
      "border-[#e5ff00]/30 bg-[#e5ff00]/10 text-[#e5ff00] shadow-[0_0_24px_rgba(229,255,0,0.06)]",
  },
  {
    title: "秘书处成册",
    label: "分发成稿",
    detail:
      "系统会生成 AI 安全周报汇总版，自动转成 PDF，并通过 WhatsApp 推送给家兴。",
    accentClass: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  },
];

export const PHASES: PhasePlan[] = [
  {
    phase: "Phase 1",
    title: "沈策 + 林岚 + 顾闻 + 纪衡",
    goal: "先把判断、机会、威胁和产品定义跑顺，形成每天都能使用的默认作战编组。",
    outcome:
      "老板先找沈策，再由沈策按问题类型拉林岚 / 顾闻 / 纪衡，完成最核心的判断闭环。",
    roles: ["chief", "market", "intel", "product"],
  },
  {
    phase: "Phase 2",
    title: "增加程准 + 苏墨",
    goal: "让结论不仅能判断，也能推进、能表达，形成执行与汇报闭环。",
    outcome:
      "从一页式判断延伸到推进节奏、汇报材料、对外口径和周报机制。",
    roles: ["pmo", "studio"],
  },
  {
    phase: "Phase 3",
    title: "增加陆野",
    goal: "把客户与销售现场反馈真正接回系统，完成前线验证闭环。",
    outcome:
      "竞品判断、需求判断和资源投入不再只靠内部推演，而有一线验证支撑。",
    roles: ["field"],
  },
];

export const PROMPTS: PromptTemplate[] = [
  {
    title: "市场进入判断",
    prompt:
      "请先让沈策（chief）判断这个市场值不值得进入；若需要，再叫林岚（market）和顾闻（intel）一起上桌，最后输出结论 / 依据 / 风险 / 动作。",
  },
  {
    title: "竞品跟进判断",
    prompt:
      "请由沈策（chief）先处理：核心竞品刚发布新产品，我们要不要跟？若进入产品动作，自动补纪衡（product）；若进入投资决策，补陆野（field）或林岚（market）做需求验证。",
  },
  {
    title: "路线图取舍",
    prompt:
      "请先让沈策（chief）理解目标，再请纪衡（product）给出先做 / 后做 / 不做和最小可售能力包；必要时再由程准（pmo）拆 30/60/90 天推进。",
  },
  {
    title: "高层表达",
    prompt:
      "沈策（chief）收口后，请苏墨（studio）把结果改成一页纸或老板可直接发出的消息版，保留结论、风险与动作。",
  },
];

export const HISTORY_TIMELINE: HistoryMilestone[] = [
  {
    date: "2024-12",
    title: "6 角色模型上线",
    description:
      "初始团队包含沈策、顾闻、纪衡、程准、陆野、苏墨六个角色，建立基础调度机制。",
    category: "evolution",
  },
  {
    date: "2025-01",
    title: "新增林岚",
    description:
      "识别到机会判断与威胁判断需要分离，新增林岚作为独立的市场洞察官，专注行业趋势、区域机会和需求迁移。",
    category: "evolution",
  },
  {
    date: "2025-01",
    title: "顾闻职责收窄",
    description:
      "将顾闻从泛情报官收窄为竞争与战略情报官，专注竞品、定价、渠道、政策与外部威胁，不再承担市场机会判断。",
    category: "evolution",
  },
  {
    date: "2025-02",
    title: "沈策定位升级",
    description:
      "明确沈策作为默认入口与最终收口角色，负责问题重写、角色调度和结论统一，不再包办所有分析。",
    category: "decision",
  },
  {
    date: "2025-02",
    title: "v2.1 调度规则发布",
    description:
      "推出四维判断框架（吸引力、可赢性、战略匹配度、执行负担）和触发补角规则，实现最少必要角色原则。",
    category: "decision",
  },
  {
    date: "2025-03",
    title: "周报流水线上线",
    description:
      "建立林岚来信 → 顾闻雷达 → 沈策纪要 → 成册分发的自动化流程，实现 AI 安全周报机制。",
    category: "integration",
  },
  {
    date: "2025-03",
    title: "cybersec-daily 同步",
    description:
      "将团队架构、调度规则和历史决策同步到 cybersec-daily 项目，建立公开展示页面。",
    category: "integration",
  },
];

export const DECISION_CASES: DecisionCase[] = [
  {
    title: "为什么要把顾闻从市场判断里拆出来？",
    context:
      "早期顾闻同时承担市场机会、竞品威胁、政策监管等多重职责，导致角色边界模糊，输出质量不稳定。",
    decision:
      "把机会判断交给林岚，把威胁判断留给顾闻，形成两个独立角色。",
    rationale:
      "机会判断和威胁判断的思维模式完全不同：前者看增长、看窗口、看需求迁移；后者看竞品、看风险、看外部变化。合并在一起会导致角色人格分裂。",
    outcome:
      "林岚专注“值不值得进”，顾闻专注“要不要跟”，两者配合形成完整的外部环境判断。",
  },
  {
    title: "为什么沈策要做默认入口，而不是让老板直接找专家？",
    context:
      "老板面对问题时，往往不清楚应该找哪个角色，或者会同时拉上所有角色导致效率低下。",
    decision:
      "将沈策设为默认入口，负责问题重写、角色调度和最终收口。",
    rationale:
      "老板的核心价值是做决策，而不是判断应该找谁。沈策作为参谋长，先把问题问对，再决定最少必要角色，最后统一收口，让老板只需要看结论、风险、动作。",
    outcome:
      "老板只需要“先找沈策”，沈策会自动判断是否需要林岚 / 顾闻 / 纪衡等角色参与，并最终给出一页式判断。",
  },
  {
    title: "为什么要建立 v2.1 触发补角规则？",
    context:
      "早期调度依赖沈策的临时判断，导致有时会漏掉关键角色，或者拉上不必要的角色。",
    decision:
      "建立明确的触发补角规则：进入某个判断层时，自动补入相关角色。",
    rationale:
      "通过规则化减少随机性，确保关键角色不会被遗漏。例如，一旦问题进入“先做 / 后做 / 不做”，纪衡必须参与；一旦进入投资决策，陆野或林岚必须做需求验证。",
    outcome:
      "调度更加稳定和可预测，减少了因角色缺失导致的判断偏差。",
  },
];

export const ROLE_NAME_MAP: Record<RoleId, string> = {
  chief: "沈策（总参谋）",
  market: "林岚（市场洞察官）",
  intel: "顾闻（竞争与战略情报官）",
  product: "纪衡（产品办公室）",
  pmo: "程准（总裁 PMO）",
  field: "陆野（一线作战官）",
  studio: "苏墨（表达与材料官）",
};

export const ARCHIVE_STATUS_LABELS: Record<DecisionArchiveStatus, string> = {
  active: "进行中",
  settled: "已定版",
  shipped: "已落地",
};

export const DECISION_ARCHIVE_SCOPE = "只收录网络安全相关的问答档案";

export const DECISION_ARCHIVE: DecisionArchiveEntry[] = [
  {
    id: "ai-firewall-trend-definition",
    archiveNo: "DA-001",
    date: "2026-03",
    askedAt: "2026-03-11 11:25 GMT+8",
    title: "AI 变化下传统防火墙怎么变，以及如何定义下一代 AI 防火墙",
    question:
      "针对 AI 的变化传统的防火墙会有什么变化？我该如何抓住趋势定义下一代 AI 防火墙？",
    answer:
      "团队回答是：传统防火墙不会消失，但会从主角降级为底座。下一代 AI 防火墙不该只是“带 AI 能力的防火墙”，而应该定义为企业 AI / Agent 的执行安全控制层，核心是控制 AI 能看到什么、调用什么、说什么、做什么。",
    publicProcess: [
      "先判断问题性质：这不是单点功能问题，而是网络安全产品范式迁移问题，需要同时看技术边界和采购逻辑。",
      "把传统防火墙能力与 AI 时代新增控制对象拆开：传统层继续管流量、会话和边界；AI 层新增 prompt、context、tool call、output、action 等控制面。",
      "再从产品定义收口：下一代 AI 防火墙的价值不在“更聪明地看流量”，而在“更稳定地约束 AI 决策与执行”。",
      "最后用可落地路线图表达：先做 AI egress / 模型访问控制，再延伸到 agent tool governance、RAG / context 安全、审批审计与行为分析。",
    ],
    result:
      "形成产品定义方向：下一代 AI 防火墙 = AI Runtime Security Control Plane / AI 执行防火墙；核心模块包括模型与 agent 身份、prompt/context policy、tool use governance、output firewall、action approval、RAG security、agent behavior analytics、audit & replay。",
    adoptedVersion: "AI Firewall Product Thesis v1.0",
    relatedPages: [
      { label: "决策档案", href: "/team/decisions" },
      { label: "团队总览", href: "/team" },
    ],
    relatedMilestones: ["AI 防火墙产品定义", "网络安全问答归档"],
    tags: ["AI 防火墙", "AI 安全", "Agent 安全", "产品定义", "网络安全"],
    roles: ["chief", "intel", "product", "studio"],
    status: "settled",
  },
  {
    id: "secure-openclaw-layer-strategy",
    archiveNo: "DA-002",
    date: "2026-03",
    askedAt: "2026-03-13 08:07 GMT+8",
    title: "OpenClaw 安全问题是否值得进入，以及如何定义 Secure OpenClaw Layer",
    question:
      "OpenClaw 的安全问题能不能形成新赛道？如果值得做，Secure OpenClaw Layer 应该是什么形态，又如何避免被 OpenClaw 快速迭代拖着反复适配？",
    answer:
      "团队回答是：可以做，而且值得做，但不建议做一个深度修改 OpenClaw 内核的“安全版 fork”。更合理的方向是做 Secure OpenClaw Layer / Agent Security Layer：把 OpenClaw 当成首个适配对象，在外层增加策略、审批、沙箱、密钥隔离和审计控制面，并复用现有 EDR、防火墙和管理控制台形成联动闭环。",
    publicProcess: [
      "先判断赛道价值：Agent 具备命令执行、文件读写、工具调用和跨渠道动作能力，天然属于高风险执行体，市场真正缺的是可控、可隔离、可审计的企业级运行环境。",
      "再拆产品边界：OpenClaw 继续负责对话与工具编排，Secure Layer 负责入口鉴权、策略判断、审批、沙箱、密钥托管与全链路审计，避免把安全能力硬塞进上游内核。",
      "随后评估工程可持续性：如果深度 fork，上游快速迭代会带来持续适配成本；因此应优先选 sidecar / proxy / wrapper 的低耦合形态，只依赖稳定接口并建立自动兼容测试。",
      "最后结合现有产品做组合收口：把 EDR 升级为 Agent Runtime Security，把防火墙升级为 Agent Network Guard，把管理控制台升级为 Agent Governance Console，形成真正能拦、能审、能运营的企业方案。",
    ],
    result:
      "形成产品方向：不做深度 fork，优先做 Secure OpenClaw / Agent Security Layer；同时明确 6 个核心模块（Ingress Gateway、Policy Engine、Tool Broker、Sandbox Runtime、Secret Broker、Audit + Detection），并沉淀为首版产品策略档案。",
    adoptedVersion: "Secure OpenClaw / Agent Security Thesis v1.0",
    relatedPages: [
      { label: "决策档案", href: "/team/decisions" },
      { label: "团队总览", href: "/team" },
    ],
    relatedMilestones: ["Agent Security 产品方向", "OpenClaw 安全化归档"],
    tags: ["OpenClaw", "Agent Security", "AI 安全", "运行时安全", "EDR", "防火墙"],
    roles: ["chief", "intel", "product", "studio"],
    status: "settled",
  },
  {
    id: "china-enterprise-cybersecurity-3y-opportunity",
    archiveNo: "DA-003",
    date: "2026-03",
    askedAt: "2026-03-12",
    title: "未来三年中国政企网络安全最值得押注的方向是什么",
    question:
      "未来三年中国政企网络安全最值得押注的方向是什么？AI 驱动安全、智算安全、SASE、零信任该如何排优先级，并分别承担什么战略角色？",
    answer:
      "团队回答是：未来三年不是普遍高增长，而是结构性高增长。建议押注顺序为 AI 驱动安全 = 智算安全 > SASE > 零信任：AI 安全要升格为产品线一级战略，智算安全要尽快抢卡位，SASE 作为最清晰的规模入口，而零信任应更多作为平台底座而非单独讲故事。",
    publicProcess: [
      "先重写问题：不是在四个方向里平均分配资源，而是要判断哪些方向真正对应新增预算、可复制场景和三年战略价值。",
      "再按预算属性、商业化清晰度、客户采购逻辑和竞争强度逐项比较 AI 驱动安全、智算安全、SASE 与零信任，识别出谁是新增市场、谁是规模入口、谁更适合作为底座能力。",
      "同时把客户需求与对手动作放在一起看：客户开始从“买安全产品”转向“买业务可控、AI 可用、数据不出事、运维更省人”，而主流厂商正在围绕平台化、场景化和生态化重组竞争。",
      "最后收口为三个管理动作：把 AI 安全升级为一级战略，以 SASE / 零信任做一体化入口，并在 2026 年就提前抢占智算安全卡位。",
    ],
    result:
      "形成《2026-2028 中国政企网络安全机会分析》完整报告，并沉淀出年度战略动作：AI 安全升格、SASE/零信任一体化推进、2026 抢智算安全样板项目与生态卡位。",
    adoptedVersion: "中国政企网络安全机会分析 v1.0",
    relatedPages: [
      { label: "决策档案", href: "/team/decisions" },
      { label: "团队总览", href: "/team" },
    ],
    relatedMilestones: ["中国政企网安三年机会分析", "产品线年度战略规划"],
    tags: ["网络安全", "AI 安全", "智算安全", "SASE", "零信任", "中国政企"],
    roles: ["chief", "market", "intel", "product", "studio"],
    status: "shipped",
  },
  {
    id: "ai-vs-ai-channel-conference-system",
    archiveNo: "DA-004",
    date: "2026-03",
    askedAt: "2026-03-12",
    title: "渠道伙伴大会如何把“AI 对抗 AI”讲成可成交的业务方案",
    question:
      "渠道伙伴大会该如何把“AI 对抗 AI”讲成客户愿意买、渠道愿意推、销售愿意复制的业务方案？防火墙和 EDR 在这套叙事里应该扮演什么角色？",
    answer:
      "团队回答是：不要泛讲 AI 概念，而要把防火墙和 EDR 定义为 AI 时代最先起量的两个控制点。防火墙负责入口与访问控制，EDR 负责终端与执行闭环；“AI 对抗 AI”要被表达成一套边界 + 终端联动的标准化业务方案，而不是技术口号。",
    publicProcess: [
      "先判断大会主线：客户不会为 AI 概念付费，只会为风险降低、效率提升和结果可见付费，因此内容必须先讲威胁升级，再讲控制点重构。",
      "再锁定最容易起量的产品：在 AI 时代，防火墙仍是入口控制点，EDR 仍是执行落点，二者既有预算基础，又最容易被渠道和客户理解。",
      "随后把产品讲法改成方案讲法：围绕行业场景、组合打法、销售异议处理和渠道作战口诀，把“单品参数”压缩为“入口能拦、终端能查、事件能闭环”的业务闭环。",
      "最后收口为可直接使用的大会资产：标题、副标题、14 页 PPT 框架、行业打法、渠道话术、销售话术和 8~10 分钟演讲稿，保证销售与渠道可直接复制。",
    ],
    result:
      "产出《AI 对抗 AI：渠道伙伴大会内容体系》完整材料（Markdown / HTML / PDF），可直接用于大会演讲、销售培训和渠道复制，并明确防火墙 + EDR 是当前最适合规模化推广的两类 AI 安全产品。",
    adoptedVersion: "AI 对抗 AI 渠道大会内容体系 v1.0",
    relatedPages: [
      { label: "决策档案", href: "/team/decisions" },
      { label: "团队总览", href: "/team" },
    ],
    relatedMilestones: ["AI 对抗 AI 渠道大会内容体系", "渠道作战话术库"],
    tags: ["渠道", "防火墙", "EDR", "AI 安全", "业务方案", "销售话术"],
    roles: ["chief", "market", "intel", "field", "studio"],
    status: "shipped",
  },
];

export function getDecisionArchiveEntry(slug: string) {
  const normalized = decodeURIComponent(slug).toLowerCase();
  return DECISION_ARCHIVE.find(
    (entry) => entry.id.toLowerCase() === normalized || entry.archiveNo.toLowerCase() === normalized,
  );
}

export function getRelatedDecisionEntries(currentId: string, limit = 3) {
  const current = DECISION_ARCHIVE.find((entry) => entry.id === currentId);
  if (!current) return [];

  return DECISION_ARCHIVE.filter((entry) => entry.id !== currentId)
    .map((entry) => {
      const sharedTags = entry.tags.filter((tag) => current.tags.includes(tag)).length;
      const sharedRoles = entry.roles.filter((role) => current.roles.includes(role)).length;
      const sharedMilestones = entry.relatedMilestones.filter((item) =>
        current.relatedMilestones.includes(item),
      ).length;
      const score = sharedTags * 3 + sharedRoles * 2 + sharedMilestones * 2;
      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);
}
