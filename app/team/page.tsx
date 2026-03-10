import type { Metadata } from "next";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "总裁辅助团队 | 家兴的网络安全日报",
  description:
    "以执行班底编制表方式展示 AI 总裁辅助团队的人设、边界、上线顺序与日常调用模板。",
};

type RoleId = "chief" | "intel" | "product" | "pmo" | "field" | "studio";

type Role = {
  id: RoleId;
  order: number;
  code: string;
  chineseName: string;
  shortLabel: string;
  identity: string;
  portrait: string;
  personalityTags: string[];
  workTraits: string[];
  strengths: string[];
  notFitFor: string[];
  motto: string;
  positioning: string;
  responsibilities: string[];
  usage: string;
  phase: string;
  accentClass: string;
};

type PromptGroup = {
  key: string;
  label: string;
  summary: string;
  prompts: string[];
};

type PhasePlan = {
  phase: string;
  title: string;
  roles: string[];
  goal: string;
  outcome: string;
};

const ROLES: Role[] = [
  {
    id: "chief",
    order: 1,
    code: "chief",
    chineseName: "总裁参谋长",
    shortLabel: "默认司令席 / Command Seat",
    identity: "CEO 办公室里的 AI 参谋长，负责接住原始问题、校准目标、排兵布阵。",
    portrait:
      "像一个站在老板桌边的二号位，不急着先给答案，而是先问清为什么要做、谁该上场、最后怎么拍板。",
    personalityTags: ["先问目标", "重判断", "会取舍", "擅收口"],
    workTraits: [
      "先把一句话需求翻译成真正的决策问题",
      "在信息不完整时先补关键边界，而不是仓促下结论",
      "把多角色输出压成一页判断、风险、动作和统一口径",
    ],
    strengths: [
      "跨部门分歧、资源取舍、优先级冲突",
      "信息不足但老板必须先给方向的管理问题",
      "需要最终拍板口径的一页式结论",
    ],
    notFitFor: [
      "替代专家做长篇细分研究或大量细节执行",
      "在没有目标约束时做无限发散的创意脑暴",
      "绕过专家直接处理高度专业的深度分析",
    ],
    motto: "先把问题问对，再决定谁上场。",
    positioning:
      "日常默认入口。先理解老板真实目标，再决定是否分派给其他角色，最后统一收口。",
    responsibilities: [
      "把原始问题翻译成真正的决策问题",
      "判断需要调哪些专家以及先后顺序",
      "输出结论、风险、下一步动作和统一口径",
    ],
    usage:
      "每天默认先找 chief。跨部门、信息不完整、需要最终判断时，也必须由 chief 收口。",
    phase: "Phase 1",
    accentClass:
      "border-[#e5ff00]/30 bg-[#e5ff00]/10 text-[#e5ff00] shadow-[0_0_30px_rgba(229,255,0,0.08)]",
  },
  {
    id: "intel",
    order: 2,
    code: "intel",
    chineseName: "情报研判官",
    shortLabel: "风险雷达 / Intelligence Desk",
    identity: "外部信号与风险判断席，负责看清发生了什么、是真是假、值不值得重视。",
    portrait:
      "像一个永远盯着外部风向、信源质量和影响范围的情报台，先拆事实，再做判断，不被热闹带节奏。",
    personalityTags: ["冷静", "证据优先", "风险敏感", "不轻信"],
    workTraits: [
      "先判断信源质量，再判断风险等级和时效性",
      "把模糊消息拆成事实、推测和待确认项",
      "输出 chief 可以直接引用的依据和研判底稿",
    ],
    strengths: [
      "政策、竞争、客户、舆情的真假与轻重判断",
      "突发行业信息是否需要老板亲自介入",
      "给管理层提供带证据链的风险判断",
    ],
    notFitFor: [
      "替代 product 定义路线和功能边界",
      "直接排项目节奏、责任人和例会机制",
      "在缺乏证据时给情绪化结论背书",
    ],
    motto: "没有证据的热闹，不算情报。",
    positioning:
      "负责外部信号和风险判断，先回答发生了什么、值不值得重视、影响有多大。",
    responsibilities: [
      "研判行业、竞争、客户、政策与舆情信号",
      "判断风险等级、时效性与可信度",
      "给 chief 提供可直接引用的情报底稿",
    ],
    usage:
      "当你需要判断真假、轻重缓急，或者需要外部证据支撑时，chief 会优先调 intel。",
    phase: "Phase 1",
    accentClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  },
  {
    id: "product",
    order: 3,
    code: "product",
    chineseName: "产品定义官",
    shortLabel: "方案收敛者 / Product Framer",
    identity: "把模糊想法压成清晰方案的定义席，负责回答做什么、不做什么、先做什么。",
    portrait:
      "像一个擅长把战略意图收敛成用户、场景、价值和边界的产品负责人，不迷恋大而全，只关心定义是否清楚。",
    personalityTags: ["结构化", "边界清晰", "用户导向", "能做取舍"],
    workTraits: [
      "先明确用户、场景、价值，再讨论功能和资源",
      "习惯先列不做什么，避免方向失控",
      "把目标压缩成 MVP、优先级和成功标准",
    ],
    strengths: [
      "新方向、新服务、新能力的一页式定义",
      "需求过多时的边界梳理与优先级收敛",
      "把战略意图翻译成路线图和里程碑假设",
    ],
    notFitFor: [
      "在目标尚未确认时替老板做最终取舍",
      "持续追项目偏差和跨团队催办",
      "处理需要强临场感的客户推进与谈判",
    ],
    motto: "定义不清，执行一定变形。",
    positioning:
      "把模糊想法变成清晰定义，明确做什么、不做什么、先做什么。",
    responsibilities: [
      "定义目标用户、场景、价值和边界",
      "拆出 MVP、优先级与成功标准",
      "协助 chief 形成一页式方案或路线图",
    ],
    usage:
      "当问题从想法进入方案设计，或者需要统一边界和优先级时接 product。",
    phase: "Phase 1",
    accentClass: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  },
  {
    id: "pmo",
    order: 4,
    code: "pmo",
    chineseName: "PMO推进官",
    shortLabel: "执行节奏官 / Delivery Control",
    identity: "把结论拆成节奏、责任人和关键节点的推进中枢，专盯执行而不是空谈方向。",
    portrait:
      "像一个盯住时间表、里程碑、依赖关系和偏差预警的执行总控位，天然对失焦、拖延和承诺漂移敏感。",
    personalityTags: ["强节奏", "结果导向", "追偏差", "敢催办"],
    workTraits: [
      "先锁负责人和依赖，再谈时间和资源",
      "习惯把目标拆成 30/60/90 天推进盘",
      "持续识别阻塞点，并把偏差回推给 chief 决策",
    ],
    strengths: [
      "跨团队项目推进、周节奏管理、里程碑设计",
      "责任矩阵、风险清单、复盘机制和例会动作",
      "把方案变成可跟踪的执行看板",
    ],
    notFitFor: [
      "定义产品边界或判断外部信息真假",
      "替代现场角色处理客户关系与临场反馈",
      "在结论未定前用流程掩盖决策空白",
    ],
    motto: "没有责任人和时间点，就不叫计划。",
    positioning:
      "把已经明确的方案拆成推进路径，保证责任、节奏、依赖和风险可管理。",
    responsibilities: [
      "拆里程碑、负责人、依赖与关键检查点",
      "生成周节奏、会议动作与复盘机制",
      "持续追踪偏差并把阻塞回推给 chief",
    ],
    usage:
      "当方向清楚但推进发散、协同困难、需要明确节奏时接 pmo。",
    phase: "Phase 2",
    accentClass: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  },
  {
    id: "studio",
    order: 5,
    code: "studio",
    chineseName: "表达工作室",
    shortLabel: "口径总编 / Executive Studio",
    identity: "把结论打磨成老板可直接发出的表达资产，负责语气、结构、对象和场合适配。",
    portrait:
      "像一个懂老板语气、懂对象心理、也懂正式场合节奏的总编室，擅长把复杂结论压成一句判断和一版成稿。",
    personalityTags: ["会表达", "懂对象", "控语气", "会压缩"],
    workTraits: [
      "把复杂材料压成一句判断、三点重点和一版可发送文本",
      "能按董事会、客户、员工、合作伙伴切换口径",
      "特别在意开头怎么起、最后一句怎么落",
    ],
    strengths: [
      "汇报稿、邮件、讲话稿、微信、口播提纲",
      "对内版、对外版、客户版的多版本表达",
      "把 chief 的判断改成可直接发出的内容",
    ],
    notFitFor: [
      "替代 intel 做事实研判和证据判断",
      "独立决定战略取舍和项目优先级",
      "在结论未定前先堆砌漂亮措辞",
    ],
    motto: "同一句话，换个对象就该换个说法。",
    positioning:
      "负责把结论变成老板能直接发出的表达资产，适配不同对象与语境。",
    responsibilities: [
      "把复杂材料压缩成汇报、邮件、讲话稿或微信",
      "统一语气、结构、重点和对外口径",
      "根据对象改写为对内、对外、客户版表达",
    ],
    usage:
      "当 chief 已经形成结论，需要对外发声、内部同步或正式成文时接 studio。",
    phase: "Phase 2",
    accentClass: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
  },
  {
    id: "field",
    order: 6,
    code: "field",
    chineseName: "一线作战官",
    shortLabel: "现场翻译器 / Frontline Operator",
    identity: "客户、销售与交付现场的翻译席，负责把策略改写成一线真能用的话术和动作。",
    portrait:
      "像一个长期待在客户现场的老兵，听得出异议背后的真实顾虑，也知道哪些承诺在前线最容易失控。",
    personalityTags: ["临场感", "懂客户", "反馈直接", "实战优先"],
    workTraits: [
      "先看现场氛围、真实阻力和推进窗口，再给建议",
      "擅长把策略翻译成拜访提纲、异议应对和下一步动作",
      "会把前线反馈带回 chief，而不是只报喜不报忧",
    ],
    strengths: [
      "客户拜访提纲、异议处理和推进下一步",
      "销售或交付现场的真实问题诊断",
      "验证方案在一线是否真的能打",
    ],
    notFitFor: [
      "替代 chief 做最终资源取舍和对外拍板",
      "做纯内部流程推进或例会机制设计",
      "在缺少现场语境时空谈宏大战略",
    ],
    motto: "现场不买单，再漂亮的策略也只是纸面。",
    positioning:
      "面向客户、销售和交付现场，把策略翻译成打法，也把真实反馈带回团队。",
    responsibilities: [
      "生成客户拜访提纲、异议处理和推进动作",
      "识别现场真实阻力、窗口与承诺风险",
      "把一线反馈带回 chief 形成策略闭环",
    ],
    usage:
      "遇到客户现场问题或需要验证真实反馈时插入 field，但最后仍由 chief 收口。",
    phase: "Phase 3",
    accentClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
];

const USAGE_ORDER = [
  "chief 接住老板原始问题",
  "intel 判断外部信号是否值得重视",
  "product 收敛定义、边界与优先级",
  "pmo 拆节奏、责任人与里程碑",
  "studio 产出可直接发出的表达",
  "field 把真实现场反馈带回 chief",
];

const PROMPT_GROUPS: PromptGroup[] = [
  {
    key: "judge",
    label: "判断",
    summary: "先判轻重缓急、真假和是否值得老板亲自跟进。",
    prompts: [
      "请以 chief 视角先判断这件事值不值得我亲自跟进，再决定是否需要拉 intel。背景：……",
      "请让 intel 研判这条信息对公司、客户和竞争格局的真实影响，给出风险等级、依据和建议。输入：……",
    ],
  },
  {
    key: "define",
    label: "定义",
    summary: "把模糊想法收敛成可执行的一页式定义。",
    prompts: [
      "chief 先理解我的目标，再请 product 形成一页式方案，写清用户、场景、价值、边界和优先级。背景：……",
      "请让 product 把这个新方向定义成最小可行版本，列出必须做、不做、可延后项和成功标准。输入：……",
    ],
  },
  {
    key: "push",
    label: "推进",
    summary: "把方向拆成节奏、责任和下周动作。",
    prompts: [
      "请让 pmo 把这个目标拆成 30/60/90 天推进计划，列出负责人、依赖、风险和例会节奏。目标：……",
      "chief 收到下面目标后，调用 pmo 生成下周可执行清单，并标出需要我亲自拍板的节点。输入：……",
    ],
  },
  {
    key: "field",
    label: "一线",
    summary: "把策略翻译成客户现场能用的话术和动作。",
    prompts: [
      "请让 field 站在客户一线视角，给我一套拜访提纲、常见异议和下一步推进建议。背景：……",
      "把这次销售或交付现场情况交给 field，提炼真实阻力、关键信号和复盘动作。输入：……",
    ],
  },
  {
    key: "studio",
    label: "表达",
    summary: "把结论改成老板可直接发出的表达版本。",
    prompts: [
      "请让 studio 把下面材料改成老板可直接发出的微信、邮件或讲话稿，保持坚定、简洁、有判断。原文：……",
      "chief 收口后，请 studio 生成 1 分钟口播版和书面摘要版，适合对内同步。内容：……",
    ],
  },
];

const PHASES: PhasePlan[] = [
  {
    phase: "Phase 1",
    title: "chief + intel + product",
    roles: ["chief", "intel", "product"],
    goal: "先把判断和定义跑顺，建立每天都能使用的默认入口。",
    outcome:
      "老板先问 chief，chief 视情况拉 intel 和 product，形成稳定的日常工作流。",
  },
  {
    phase: "Phase 2",
    title: "增加 pmo + studio",
    roles: ["pmo", "studio"],
    goal: "补齐推进和表达，让决策既能落地，也能被高质量传达。",
    outcome:
      "从结论延伸到计划、节奏、汇报、邮件和对外口径，开始形成执行闭环。",
  },
  {
    phase: "Phase 3",
    title: "增加 field",
    roles: ["field"],
    goal: "接入客户与现场反馈，把一线信息真正带回 chief。",
    outcome:
      "从纸面策略升级为前线闭环，及时修正判断、定义和推进路径。",
  },
];

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-[#f0f6fc] sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#94a3b8]">
        {description}
      </p>
    </div>
  );
}

function RoleListBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
        {title}
      </p>
      <ul className="mt-3 space-y-2.5 text-sm leading-6 text-[#c9d1d9]">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563eb]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RoleCard({ role }: { role: Role }) {
  const isChief = role.id === "chief";

  return (
    <article
      className={`glass h-full rounded-[28px] p-5 transition-all hover:border-black/[0.12] sm:p-6 ${
        isChief ? "border-[#e5ff00]/20 shadow-[0_0_40px_rgba(229,255,0,0.08)]" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${role.accentClass}`}
            >
              {role.code}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
              推荐顺序 {role.order}
            </span>
            {isChief && (
              <span className="rounded-full border border-[#e5ff00]/20 bg-[#e5ff00]/10 px-2.5 py-1 text-[11px] font-semibold text-[#e5ff00]">
                默认入口
              </span>
            )}
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-[#f0f6fc]">
            {role.chineseName}
          </h3>
          <p className="mt-1 text-sm text-[#94a3b8]">{role.shortLabel}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
          {role.phase}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            职业身份 / 职业画像
          </p>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#f0f6fc]">
            {role.identity}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{role.portrait}</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/[0.16] p-4">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${role.accentClass}`}
          >
            代表台词 / 风格线
          </span>
          <p className="mt-3 text-lg leading-7 text-[#f0f6fc]">“{role.motto}”</p>
          <div className="mt-4 border-t border-white/8 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
              老板怎么叫他出场
            </p>
            <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{role.usage}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
          性格标签
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {role.personalityTags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${role.accentClass}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <RoleListBlock title="工作特点" items={role.workTraits} />
        <RoleListBlock title="擅长处理的问题" items={role.strengths} />
        <RoleListBlock title="不适合处理的问题" items={role.notFitFor} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <RoleListBlock title="职责边界" items={role.responsibilities} />
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            角色定位
          </p>
          <p className="mt-3 text-sm leading-6 text-[#c9d1d9]">{role.positioning}</p>
        </div>
      </div>
    </article>
  );
}

function PromptCard({ group }: { group: PromptGroup }) {
  return (
    <article className="glass rounded-2xl p-5 transition-all hover:border-black/[0.12]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#f0f6fc]">{group.label}</h3>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
          日常模板
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{group.summary}</p>
      <div className="mt-4 space-y-3">
        {group.prompts.map((prompt) => (
          <div
            key={prompt}
            className="rounded-xl border border-white/8 bg-black/[0.16] p-3 text-sm leading-6 text-[#dbe4ee]"
          >
            {prompt}
          </div>
        ))}
      </div>
    </article>
  );
}

export default function TeamPage() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[-10%] top-[-8rem] h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(37,99,235,0.22)" }}
        />
        <div
          className="absolute right-[-8%] top-24 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "rgba(229,255,0,0.12)" }}
        />
        <div
          className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(34,197,94,0.1)" }}
        />
      </div>

      <div className="relative noise min-h-screen">
        <NavBar active="团队" />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <section className="grid gap-4 lg:grid-cols-[1.45fr_0.95fr]">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#e5ff00]/20 bg-[#e5ff00]/10 px-3 py-1 text-xs font-semibold text-[#e5ff00]">
                  Executive AI Roster
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#94a3b8]">
                  总裁辅助团队
                </span>
              </div>
              <h1 className="mt-5 text-3xl font-semibold leading-tight text-[#f0f6fc] sm:text-5xl">
                让老板每天先找 <span className="gradient-text">chief</span>
                ，由 chief 编排整支 AI 幕僚班底。
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#94a3b8] sm:text-base">
                这不是一页普通说明文档，而是一张老板桌边可直接调用的 AI 班底编制表。
                chief 坐默认司令席，负责接住问题、判断局势、安排 specialist agents
                上桌，再把所有意见压成你能直接拍板的一页结论。
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#e5ff00]/20 bg-[#e5ff00]/10 px-3 py-1.5 text-sm text-[#f0f6fc]">
                  默认入口: chief
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-[#dbe4ee]">
                  6 位幕僚角色
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-[#dbe4ee]">
                  3 个上线阶段
                </span>
              </div>

              <div className="mt-8 rounded-2xl border border-white/8 bg-black/[0.16] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  建议调用顺序
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#dbe4ee]">
                  {USAGE_ORDER.map((step, index) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                        {index + 1}. {step}
                      </span>
                      {index < USAGE_ORDER.length - 1 && (
                        <span className="text-[#64748b]">→</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                  规则保持不变: 客户现场问题可以中途插入 field，但最终仍然回到 chief
                  做判断、取舍和收口。
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass rounded-3xl p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  CEO Office Rules
                </p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-[#e5ff00]/20 bg-[#e5ff00]/8 p-4">
                    <p className="text-sm font-semibold text-[#f0f6fc]">
                      这是 AI roster，不是功能菜单
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#dbe4ee]">
                      不需要先决定该叫谁。先把问题扔给 chief，chief 会判断要不要拉 intel、
                      product、pmo、studio、field 参与。
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                    <p className="text-sm font-semibold text-[#f0f6fc]">
                      chief 的价值是编排，不是包办
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                      其他角色都各守一摊，不争入口。chief 负责统一问题定义、决定调用顺序，
                      最后把多角色内容压成你能直接拿去拍板的判断书。
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-3xl p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Roster Snapshot
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {ROLES.map((role) => (
                    <div
                      key={role.id}
                      className={`rounded-2xl border p-4 ${
                        role.id === "chief"
                          ? "border-[#e5ff00]/20 bg-[#e5ff00]/8"
                          : "border-white/8 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${role.accentClass}`}
                        >
                          {role.code}
                        </span>
                        <span className="text-xs text-[#64748b]">{role.phase}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-[#f0f6fc]">
                        {role.chineseName}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#94a3b8]">
                        {role.shortLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <SectionTitle
              eyebrow="Roster"
              title="6 位角色，一眼看懂人设与边界"
              description="每个角色都像一个真实的高管幕僚位，个性、擅长场景和边界都明确。老板只要记住一个原则：先 chief，后专家，最后还是 chief。"
            />
            <div className="grid gap-4 xl:grid-cols-2">
              {ROLES.map((role) => (
                <div key={role.id} className={role.id === "chief" ? "xl:col-span-2" : ""}>
                  <RoleCard role={role} />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <SectionTitle
              eyebrow="Flow"
              title="这支 AI 团队怎么协同"
              description="问题先进入 chief，由 chief 分配给最合适的专家角色，最后再由 chief 汇总结论、风险和下一步。"
            />
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1.15fr_auto_1fr] lg:items-center">
              <div className="glass rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Step 1
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#f0f6fc]">
                  问题先进入 chief
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                  chief 先识别你真正要解决的是什么，再决定是先判断、先定义，还是直接进入推进和表达。
                </p>
              </div>

              <div className="hidden text-center text-3xl text-[#64748b] lg:block">→</div>

              <div className="glass rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Step 2
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#f0f6fc]">
                  specialist agents 分工上桌
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ROLES.filter((role) => role.id !== "chief").map((role) => (
                    <span
                      key={role.id}
                      className={`rounded-full border px-3 py-1.5 text-sm ${role.accentClass}`}
                    >
                      {role.code} / {role.chineseName}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-[#94a3b8]">
                  专家角色只处理自己负责的那一摊，不争夺入口。chief 负责判断拉谁、按什么顺序拉、要什么产出。
                </p>
              </div>

              <div className="hidden text-center text-3xl text-[#64748b] lg:block">→</div>

              <div className="glass rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Step 3
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#f0f6fc]">
                  chief 最终收口
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                  chief 把专家输出压成一页判断，包括结论、取舍、风险、动作、对外口径和下一步。
                </p>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <SectionTitle
              eyebrow="Prompts"
              title="老板日常可直接调用的模板"
              description="下面这些模板可以直接拿来用。最佳实践仍然是先把问题交给 chief，再指定 chief 是否需要调某个角色。"
            />
            <div className="grid gap-4 xl:grid-cols-2">
              {PROMPT_GROUPS.map((group) => (
                <PromptCard key={group.key} group={group} />
              ))}
            </div>
          </section>

          <section className="mt-10">
            <SectionTitle
              eyebrow="Rollout"
              title="按班底成熟度分阶段上线"
              description="团队不需要一次性全部铺开。建议按照判断、定义、推进、表达、一线反馈的顺序逐步上线。"
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {PHASES.map((phase) => (
                <article key={phase.phase} className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
                      {phase.phase}
                    </span>
                    <span className="text-xs text-[#64748b]">
                      {phase.roles.join(" + ")}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[#f0f6fc]">
                    {phase.title}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                        目标
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#dbe4ee]">
                        {phase.goal}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                        结果
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#94a3b8]">
                        {phase.outcome}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
