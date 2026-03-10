import type { Metadata } from "next";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "总裁辅助团队 | 家兴的网络安全日报",
  description:
    "面向负责人展示 AI 总裁辅助团队的结构、使用顺序、分阶段上线计划与日常调用方式。",
};

type RoleId = "chief" | "intel" | "product" | "pmo" | "field" | "studio";

type Role = {
  id: RoleId;
  order: number;
  code: string;
  chineseName: string;
  shortLabel: string;
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
    shortLabel: "默认入口",
    positioning:
      "日常默认入口，先理解老板真实目标，再判断要不要分派给其他角色，最后统一收口。",
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
    shortLabel: "判断",
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
    shortLabel: "定义",
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
    shortLabel: "推进",
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
    shortLabel: "表达",
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
    shortLabel: "一线",
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
  "chief 默认接收问题",
  "intel 先做判断",
  "product 把方案定义清楚",
  "pmo 推进落地",
  "studio 打磨表达",
  "field 补一线反馈闭环",
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
    outcome: "老板先问 chief，chief 视情况拉 intel 和 product，形成稳定的日常工作流。",
  },
  {
    phase: "Phase 2",
    title: "增加 pmo + studio",
    roles: ["pmo", "studio"],
    goal: "补齐推进和表达，让决策既能落地，也能被高质量传达。",
    outcome: "从结论延伸到计划、节奏、汇报、邮件和对外口径，开始形成执行闭环。",
  },
  {
    phase: "Phase 3",
    title: "增加 field",
    roles: ["field"],
    goal: "接入客户与现场反馈，把一线信息真正带回 chief。",
    outcome: "从纸面策略升级为前线闭环，及时修正判断、定义和推进路径。",
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

function RoleCard({ role }: { role: Role }) {
  return (
    <article className="glass rounded-2xl p-5 transition-all hover:border-black/[0.12]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${role.accentClass}`}
            >
              {role.code}
            </span>
            <span className="text-xs text-[#94a3b8]">推荐顺序 {role.order}</span>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-[#f0f6fc]">
            {role.chineseName}
          </h3>
          <p className="mt-1 text-sm text-[#94a3b8]">{role.shortLabel}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
          {role.phase}
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            定位
          </p>
          <p className="mt-1 text-sm leading-6 text-[#c9d1d9]">
            {role.positioning}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            核心职责
          </p>
          <ul className="mt-2 space-y-2 text-sm text-[#c9d1d9]">
            {role.responsibilities.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            推荐使用
          </p>
          <p className="mt-1 text-sm leading-6 text-[#94a3b8]">{role.usage}</p>
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
                  总裁辅助团队
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#94a3b8]">
                  AI Team
                </span>
              </div>
              <h1 className="mt-5 text-3xl font-semibold leading-tight text-[#f0f6fc] sm:text-5xl">
                让老板每天先找 <span className="gradient-text">chief</span>
                ，再由 chief 编排整个团队。
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#94a3b8] sm:text-base">
                这个页面把 newly built executive AI team 翻译成一套可直接理解、可直接调用的工作界面。
                规则很简单：默认入口永远是 chief，chief 负责判断问题类型、调用专长角色，并在最后输出统一结论。
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-[#dbe4ee]">
                  默认入口: chief
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-[#dbe4ee]">
                  6 个角色
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
                  如果是客户现场问题，可以在中途插入 field；但最终仍然回到 chief 做判断、取舍和收口。
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass rounded-3xl p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Owner 视角
                </p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-[#e5ff00]/20 bg-[#e5ff00]/8 p-4">
                    <p className="text-sm font-semibold text-[#f0f6fc]">
                      日常默认入口是 chief
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#dbe4ee]">
                      不需要先决定该找谁。先把问题扔给 chief，chief 会判断要不要拉 intel、product、pmo、studio、field。
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                    <p className="text-sm font-semibold text-[#f0f6fc]">
                      chief 的价值不是代替专家
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                      chief 负责统一问题定义、决定调用顺序、最后把多角色内容压成你能直接拿去拍板的一页结论。
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-3xl p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  团队结构
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {ROLES.map((role) => (
                    <div
                      key={role.id}
                      className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-[#f0f6fc]">
                          {role.code}
                        </span>
                        <span className="text-xs text-[#64748b]">{role.phase}</span>
                      </div>
                      <p className="mt-2 text-sm text-[#94a3b8]">
                        {role.chineseName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <SectionTitle
              eyebrow="Roles"
              title="6 个角色一页看清"
              description="每个角色都只做自己最擅长的事。老板只要记住一个原则：先 chief，后专家，最后还是 chief。"
            />
            <div className="grid gap-4 xl:grid-cols-2">
              {ROLES.map((role) => (
                <RoleCard key={role.id} role={role} />
              ))}
            </div>
          </section>

          <section className="mt-10">
            <SectionTitle
              eyebrow="Flow"
              title="协作流"
              description="问题先进入 chief，由 chief 分配给最合适的专家角色，最后再由 chief 汇总结论、风险和下一步。"
            />
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1.15fr_auto_1fr] lg:items-center">
              <div className="glass rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Step 1
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#f0f6fc]">
                  问题进入 chief
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                  chief 先识别你真正想解决的是什么，再决定是先判断、先定义，还是直接进入推进。
                </p>
              </div>

              <div className="hidden text-center text-3xl text-[#64748b] lg:block">→</div>

              <div className="glass rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Step 2
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#f0f6fc]">
                  specialist agents 分工
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
                  专家角色只处理自己负责的部分，不争夺入口。chief 负责判断拉谁、按什么顺序拉、要什么产出。
                </p>
              </div>

              <div className="hidden text-center text-3xl text-[#64748b] lg:block">→</div>

              <div className="glass rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  Step 3
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#f0f6fc]">
                  chief 收口
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                  chief 最终把专家输出压成一页判断，包括结论、取舍、风险、动作、对外口径和下一步。
                </p>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <SectionTitle
              eyebrow="Prompts"
              title="日常怎么调用"
              description="下面这些模板可以直接拿来用。最佳实践是先把问题交给 chief，再指定 chief 是否需要调某个角色。"
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
              title="分阶段上线"
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
