import { Fragment } from "react";
import type { Metadata } from "next";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "总裁辅助团队 | 家兴的网络安全日报",
  description:
    "展示家兴最新的 7 角色总裁辅助团队、v2.1 调度规则，以及 AI 安全周报生成机制。",
};

type RoleId =
  | "chief"
  | "market"
  | "intel"
  | "product"
  | "pmo"
  | "field"
  | "studio";

type Role = {
  id: RoleId;
  order: number;
  code: string;
  chineseName: string;
  shortLabel: string;
  identity: string;
  portrait: string;
  personalityTags: string[];
  strengths: string[];
  boundaries: string[];
  usage: string;
  phase: string;
  accentClass: string;
};

type DispatchCard = {
  title: string;
  summary: string;
  combos: string[];
};

type WeeklyNode = {
  title: string;
  label: string;
  detail: string;
  accentClass: string;
};

type PhasePlan = {
  phase: string;
  title: string;
  goal: string;
  outcome: string;
  roles: string[];
};

const ROLES: Role[] = [
  {
    id: "chief",
    order: 1,
    code: "chief",
    chineseName: "总参谋",
    shortLabel: "默认入口 / Final Synthesis",
    identity: "总裁桌边的统一入口，负责接住问题、判断问题类型、决定谁上场、最后统一收口。",
    portrait:
      "像一个真正的参谋长：先把问题问对，再决定是否需要市场、竞争、产品、推进或表达支持。",
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
      "任何问题优先先找 chief。chief 判断是否需要 market / intel / product / pmo / field / studio 参与。",
    phase: "Phase 1",
    accentClass:
      "border-[#e5ff00]/30 bg-[#e5ff00]/10 text-[#e5ff00] shadow-[0_0_30px_rgba(229,255,0,0.08)]",
  },
  {
    id: "market",
    order: 2,
    code: "market",
    chineseName: "市场洞察官",
    shortLabel: "机会判断 / Opportunity Lens",
    identity: "负责行业趋势、区域机会、需求迁移和增长信号，把外部机会压缩成对我方有价值的判断。",
    portrait:
      "像一个盯着市场结构变化的人，不做资讯搬运，而是回答哪里值得进、哪里只是热闹。",
    personalityTags: ["看机会", "看趋势", "看区域", "看需求迁移"],
    strengths: [
      "新市场进入判断",
      "区域优先级与增长窗口识别",
      "需求迁移和伪机会识别",
    ],
    boundaries: [
      "不替代 intel 做竞品威胁判断",
      "不直接定义路线图",
      "不把个别客户声音直接当市场结论",
    ],
    usage:
      "当问题是‘机会在哪里、值不值得进、需求往哪变’时，chief 优先拉 market。",
    phase: "Phase 1",
    accentClass: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  },
  {
    id: "intel",
    order: 3,
    code: "intel",
    chineseName: "竞争与战略情报官",
    shortLabel: "威胁判断 / Threat & Intel",
    identity: "负责竞品、定价、渠道、政策与外部威胁变化，回答‘发生了什么、为什么重要、对我方意味着什么’。",
    portrait:
      "像一个外部威胁雷达，先拆事实再做判断，不被热点带着跑。",
    personalityTags: ["看威胁", "证据优先", "竞争敏感", "不轻信"],
    strengths: [
      "竞品动作和定价变化判断",
      "政策 / 监管 / 外部威胁研判",
      "给 chief 提供可直接引用的情报底稿",
    ],
    boundaries: [
      "不把市场机会判断包进自己职责",
      "不替代 product 做产品取舍",
      "不输出无证据的情绪化判断",
    ],
    usage:
      "当问题是‘竞品动了没有、影响多大、要不要跟’时，chief 优先拉 intel。",
    phase: "Phase 1",
    accentClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  },
  {
    id: "product",
    order: 4,
    code: "product",
    chineseName: "产品办公室",
    shortLabel: "先做 / 后做 / 不做",
    identity: "把战略意图压成产品定义、优先级和路线图动作，负责明确做什么、不做什么、先做什么。",
    portrait:
      "像一个会收边界的产品办公室，不追求大而全，重视最小可售能力包和明确取舍。",
    personalityTags: ["边界清晰", "能取舍", "定义导向", "MVP 思维"],
    strengths: [
      "新方向的一页式定义",
      "功能优先级压缩与先后顺序",
      "把模糊战略翻译成产品动作",
    ],
    boundaries: [
      "不替老板拍最终战略板",
      "不替 pmo 追项目节奏",
      "不把‘都重要’当答案",
    ],
    usage:
      "只要问题进入‘先做 / 后做 / 不做 / 场景切入 / 路线图动作’，chief 自动补 product。",
    phase: "Phase 1",
    accentClass: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  },
  {
    id: "pmo",
    order: 5,
    code: "pmo",
    chineseName: "总裁 PMO",
    shortLabel: "推进节奏 / Delivery Control",
    identity: "把结论拆成责任、节奏、依赖和里程碑，负责推进而不是空谈。",
    portrait:
      "像一个盯节奏和偏差的推进官，对负责人、时间点和阻塞点天然敏感。",
    personalityTags: ["强节奏", "结果导向", "追偏差", "控依赖"],
    strengths: [
      "30/60/90 天推进盘",
      "里程碑与依赖设计",
      "需要老板拍板的阻塞点识别",
    ],
    boundaries: [
      "不替代 product 定义产品边界",
      "不替代 intel 判断外部真假",
      "不在结论未定时用流程掩盖问题",
    ],
    usage:
      "当问题进入试点计划、资源配置、阶段推进或组织协同时，chief 补 pmo。",
    phase: "Phase 2",
    accentClass: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  },
  {
    id: "field",
    order: 6,
    code: "field",
    chineseName: "一线作战官",
    shortLabel: "前线验证 / Frontline Validation",
    identity: "负责客户、销售与交付现场的真实反馈，判断到底是真需求还是局部噪音。",
    portrait:
      "像一个长期在客户现场的人，知道前线真正卡在哪里，也知道哪些承诺最容易失控。",
    personalityTags: ["懂客户", "临场感", "反馈直接", "验证需求"],
    strengths: [
      "客户/销售反馈聚类",
      "需求真假与问题归因",
      "现场话术与推进动作建议",
    ],
    boundaries: [
      "不把个别客户反馈直接上升为市场趋势",
      "不替代 chief 做最终取舍",
      "不替代 product 做路线图定义",
    ],
    usage:
      "当‘竞品跟不跟’进入投资决策，或需要验证客户是否真在买时，chief 补 field。",
    phase: "Phase 3",
    accentClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  {
    id: "studio",
    order: 7,
    code: "studio",
    chineseName: "表达与材料官",
    shortLabel: "高层表达 / Executive Studio",
    identity: "把结论压成高层可直接使用的一页纸、汇报、讲话稿或 WhatsApp 版本。",
    portrait:
      "像一个总编室，懂老板语气、懂对象差异，也懂复杂材料怎么压成一句话和三条重点。",
    personalityTags: ["会表达", "会压缩", "懂对象", "统一口径"],
    strengths: [
      "一页纸、邮件、讲话稿、消息版转写",
      "管理层 / 客户 / 内部多版本表达",
      "把 chief 的判断改成可直接发出的内容",
    ],
    boundaries: [
      "不创造不存在的证据",
      "不在结论未定时先堆漂亮措辞",
      "不替代 chief 做拍板",
    ],
    usage:
      "当结论需要进入汇报、周报、对外口径或高层表达时，最后再由 studio 接力。",
    phase: "Phase 2",
    accentClass: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
  },
];

const DISPATCH_CARDS: DispatchCard[] = [
  {
    title: "四维判断框架",
    summary:
      "所有‘要不要做 / 要不要投 / 要不要跟’的问题，chief 默认先压成四个维度。",
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
      "不是所有问题都拉满全队。chief 先判断问题类型，再只拉最少必要角色上桌。",
    combos: [
      "市场是否值得进入 → market + intel",
      "竞品发新东西，我们要不要跟 → intel + product",
      "重大客户需求是否进路线图 → field + market + product",
      "重点项目卡住且需要老板拍板 → pmo + product + field",
    ],
  },
  {
    title: "v2.1 触发补角规则",
    summary:
      "一旦问题进入某个判断层，相关角色自动补入，而不是靠感觉临时决定。",
    combos: [
      "进入先做 / 后做 / 不做 / 场景切入 → 自动补 product",
      "竞品跟不跟进入立项 / 投资判断 → 自动补 field 或 market 做需求验证",
      "进入试点推进 / 资源配置 / 节奏管理 → 自动补 pmo",
      "要变成汇报 / 周报 / 对外口径 → 最后补 studio",
    ],
  },
];

const WEEKLY_FLOW: WeeklyNode[] = [
  {
    title: "market 周报",
    label: "机会输入",
    detail:
      "每周输出：市场机会、需求迁移、区域变化、增长信号与先做 / 后做 / 不做建议。",
    accentClass: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  },
  {
    title: "intel 周报",
    label: "威胁输入",
    detail:
      "每周输出：竞品动作、定价变化、渠道/生态变化、政策监管信号与我方应对判断。",
    accentClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  },
  {
    title: "chief 周报",
    label: "总收口",
    detail:
      "把 market / intel 等输入压成管理层一页纸：结论、风险、本周动作、待拍板事项。",
    accentClass:
      "border-[#e5ff00]/30 bg-[#e5ff00]/10 text-[#e5ff00] shadow-[0_0_24px_rgba(229,255,0,0.06)]",
  },
  {
    title: "合并 PDF",
    label: "分发输出",
    detail:
      "系统会生成 AI 安全周报汇总版，自动转成 PDF，并通过 WhatsApp 推送给家兴。",
    accentClass: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  },
];

const PHASES: PhasePlan[] = [
  {
    phase: "Phase 1",
    title: "chief + market + intel + product",
    goal: "先把判断、机会、威胁和产品定义跑顺，形成每天都能使用的默认作战编组。",
    outcome:
      "老板先找 chief，chief 按问题类型拉 market / intel / product，完成最核心的判断闭环。",
    roles: ["chief", "market", "intel", "product"],
  },
  {
    phase: "Phase 2",
    title: "增加 pmo + studio",
    goal: "让结论不仅能判断，也能推进、能表达，形成执行与汇报闭环。",
    outcome:
      "从一页式判断延伸到推进节奏、汇报材料、对外口径和周报机制。",
    roles: ["pmo", "studio"],
  },
  {
    phase: "Phase 3",
    title: "增加 field",
    goal: "把客户与销售现场反馈真正接回系统，完成前线验证闭环。",
    outcome:
      "竞品判断、需求判断和资源投入不再只靠内部推演，而有一线验证支撑。",
    roles: ["field"],
  },
];

const PROMPTS = [
  {
    title: "市场进入判断",
    prompt:
      "请以 chief 视角判断这个市场值不值得进入；若需要，调用 market + intel，最后输出结论 / 依据 / 风险 / 动作。",
  },
  {
    title: "竞品跟进判断",
    prompt:
      "请由 chief 处理：核心竞品刚发布新产品，我们要不要跟？若进入产品动作，自动补 product；若进入投资决策，补 field 或 market 做需求验证。",
  },
  {
    title: "路线图取舍",
    prompt:
      "请 chief 先理解目标，再请 product 给出先做 / 后做 / 不做和最小可售能力包；必要时再由 pmo 拆 30/60/90 天推进。",
  },
  {
    title: "高层表达",
    prompt:
      "chief 收口后，请 studio 把结果改成一页纸或老板可直接发出的消息版，保留结论、风险与动作。",
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

function RoleListBlock({ title, items }: { title: string; items: string[] }) {
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
            职业身份 / 角色画像
          </p>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#f0f6fc]">
            {role.identity}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{role.portrait}</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/[0.16] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            老板怎么叫他出场
          </p>
          <p className="mt-3 text-sm leading-6 text-[#dbe4ee]">{role.usage}</p>
          <div className="mt-4 border-t border-white/8 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
              角色标签
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
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <RoleListBlock title="擅长处理的问题" items={role.strengths} />
        <RoleListBlock title="边界 / 不适合处理的问题" items={role.boundaries} />
      </div>
    </article>
  );
}

function DispatchCardView({ card }: { card: DispatchCard }) {
  return (
    <article className="glass rounded-2xl p-5 transition-all hover:border-black/[0.12]">
      <h3 className="text-lg font-semibold text-[#f0f6fc]">{card.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{card.summary}</p>
      <ul className="mt-4 space-y-2.5 text-sm leading-6 text-[#dbe4ee]">
        {card.combos.map((item) => (
          <li key={item} className="flex gap-2.5 rounded-xl border border-white/8 bg-black/[0.16] p-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5ff00]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function WeeklyNodeCard({ node }: { node: WeeklyNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <span
        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${node.accentClass}`}
      >
        {node.label}
      </span>
      <h3 className="mt-3 text-xl font-semibold text-[#f0f6fc]">{node.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#94a3b8]">{node.detail}</p>
    </div>
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
                  Executive AI Roster v2.1
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#94a3b8]">
                  总裁辅助团队
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#94a3b8]">
                  7 角色模型
                </span>
              </div>
              <h1 className="mt-5 text-3xl font-semibold leading-tight text-[#f0f6fc] sm:text-5xl">
                先找 <span className="gradient-text">chief</span>
                ，再由 chief 调最少必要角色上桌。
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#94a3b8] sm:text-base">
                这不是一页普通说明文档，而是一张真正可用的 AI 总裁辅助团队编制表。
                现在的团队已经从 6 角色升级到 7 角色：chief 负责入口与收口，market 看机会，intel 看威胁，product 做取舍，pmo 管推进，field 验证一线，studio 负责高层表达。
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#e5ff00]/20 bg-[#e5ff00]/10 px-3 py-1.5 text-sm text-[#f0f6fc]">
                  默认入口: chief
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-[#dbe4ee]">
                  7 位幕僚角色
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-[#dbe4ee]">
                  v2.1 调度规则
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-[#dbe4ee]">
                  周报自动生成机制
                </span>
              </div>

              <div className="mt-8 rounded-2xl border border-white/8 bg-black/[0.16] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  推荐调用顺序
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#dbe4ee]">
                  {[
                    "1. chief 先重写问题",
                    "2. market 看机会 / intel 看威胁",
                    "3. product 定先做 / 后做 / 不做",
                    "4. pmo 拆节奏，field 做验证，studio 统一表达",
                    "5. 最后仍由 chief 收口",
                  ].map((step, index, arr) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                        {step}
                      </span>
                      {index < arr.length - 1 && <span className="text-[#64748b]">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
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

              <div className="glass rounded-3xl p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  核心规则
                </p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-[#e5ff00]/20 bg-[#e5ff00]/8 p-4">
                    <p className="text-sm font-semibold text-[#f0f6fc]">
                      先 chief，后专家，最后还是 chief
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#dbe4ee]">
                      你不需要先判断应该叫谁。chief 负责判断问题类型、决定谁上场、按什么顺序上场，以及最后怎么收口。
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                    <p className="text-sm font-semibold text-[#f0f6fc]">
                      不是所有问题都要全队出动
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                      这套 v2.1 的升级重点不是加更多角色，而是让 chief 只调用最少必要角色，并按四维判断框架稳定收口。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <SectionTitle
              eyebrow="Roster"
              title="7 位角色，一眼看懂人设、边界与上场方式"
              description="团队从旧的 6 角色升级为 7 角色。最大的变化是新增 market，并把 intel 收窄为竞争与战略情报官，让‘机会’和‘威胁’彻底分开。"
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
              eyebrow="Dispatch v2.1"
              title="这支团队现在怎么调度"
              description="重点不再是‘把所有人都拉上来’，而是 chief 用最少必要角色解决问题，并且在进入某个判断层时自动补角。"
            />
            <div className="grid gap-4 xl:grid-cols-3">
              {DISPATCH_CARDS.map((card) => (
                <DispatchCardView key={card.title} card={card} />
              ))}
            </div>
          </section>

          <section className="mt-10">
            <SectionTitle
              eyebrow="Weekly Intelligence Loop"
              title="AI 安全周报机制已经进入团队系统"
              description="现在这套总裁辅助团队不只是回答单次问题，还会把市场、竞争和管理层收口固化成每周周报，并能自动生成 PDF 输出。"
            />
            <div className="glass rounded-3xl p-6">
              <div className="grid gap-4 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] xl:items-stretch">
                {WEEKLY_FLOW.map((node, index) => (
                  <Fragment key={node.title}>
                    <WeeklyNodeCard node={node} />
                    {index < WEEKLY_FLOW.length - 1 && (
                      <div className="hidden items-center justify-center text-3xl text-[#64748b] xl:flex">
                        →
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-black/[0.16] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                    周报输入怎么分工
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                    <li>• market：机会、需求迁移、区域变化、增长信号</li>
                    <li>• intel：竞品、定价、渠道、政策、外部威胁</li>
                    <li>• chief：一页纸结论、风险、本周动作、待拍板事项</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/[0.16] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                    周报输出怎么落地
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                    <li>• 汇总为 AI 安全周报合并版</li>
                    <li>• 自动转成 PDF</li>
                    <li>• 自动推送到 WhatsApp</li>
                    <li>• 适合先看 chief，再按需下钻 market / intel</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <SectionTitle
              eyebrow="Rollout"
              title="按成熟度分阶段上线，而不是一次铺满"
              description="新的团队设计保持渐进式：先跑顺判断与定义，再补推进与表达，最后把一线验证接回来。"
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {PHASES.map((phase) => (
                <article key={phase.phase} className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
                      {phase.phase}
                    </span>
                    <span className="text-xs text-[#64748b]">{phase.roles.join(" + ")}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[#f0f6fc]">
                    {phase.title}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                        目标
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#dbe4ee]">{phase.goal}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                        结果
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#94a3b8]">{phase.outcome}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <SectionTitle
              eyebrow="Prompt Templates"
              title="老板日常可以直接调用的模板"
              description="模板也跟着 v2.1 更新：先 chief，后最少必要角色，最后统一收口。"
            />
            <div className="grid gap-4 xl:grid-cols-2">
              {PROMPTS.map((item) => (
                <article key={item.title} className="glass rounded-2xl p-5 transition-all hover:border-black/[0.12]">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[#f0f6fc]">{item.title}</h3>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
                      直接可用
                    </span>
                  </div>
                  <div className="mt-4 rounded-xl border border-white/8 bg-black/[0.16] p-4 text-sm leading-6 text-[#dbe4ee]">
                    {item.prompt}
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
