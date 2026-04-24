import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import TeamShell from "@/components/shells/TeamShell";
import {
  ROLES,
  DISPATCH_CARDS,
  WEEKLY_FLOW,
  PHASES,
  PROMPTS,
  DECISION_ARCHIVE,
} from "./data";
import {
  SectionTitle,
  TeamTabs,
  RoleCard,
  DispatchCardView,
  WeeklyNodeCard,
  StatCard,
} from "./components";
import { teamBadgeToneClass } from "./theme";

export const metadata: Metadata = {
  title: "总裁辅助团队 | 家兴的网络安全日报",
  description:
    "展示家兴最新的 7 位人格化总裁辅助幕僚、v2.1 调度规则，以及带记忆系统的 AI 安全周报机制。",
};

const ROLE_MAP = new Map(ROLES.map((role) => [role.id, role]));

const COMMAND_LANES = [
  {
    title: "问题入口",
    detail: "所有问题先由沈策重写，再决定是否需要市场、情报、产品或执行角色介入。",
    roles: ["chief"],
  },
  {
    title: "判断分道",
    detail: "机会、威胁和路线图不再混成一团，而是分别落到林岚、顾闻、纪衡的判断席位。",
    roles: ["market", "intel", "product"],
  },
  {
    title: "推进与收口",
    detail: "结论出来后，由程准压节奏、陆野做一线验证、苏墨统一对外表达，再交回沈策收口。",
    roles: ["pmo", "field", "studio"],
  },
] as const;

const CALL_MATRIX = [
  {
    trigger: "问题还很散，不知道该先找谁",
    path: ["chief"],
    outcome: "先把问题压实，再决定要不要拉更多角色进场。",
  },
  {
    trigger: "需要判断机会、威胁与先做什么",
    path: ["market", "intel", "product"],
    outcome: "机会、威胁、路线图三条判断并行，但结论仍由沈策统一压缩。",
  },
  {
    trigger: "结论已经明确，要推进、验证或形成老板表达",
    path: ["pmo", "field", "studio"],
    outcome: "把想法变成节奏、验证和最终表达，而不是停在分析。",
  },
  {
    trigger: "准备进入周报、复盘或老板汇报",
    path: ["chief", "studio"],
    outcome: "统一成可直接上桌的一页式输出。",
  },
] as const;

export default function TeamPage() {
  return (
    <TeamShell>
      <div>
        <main className="mx-auto max-w-[1320px] px-4 py-6 sm:py-8">
          <TeamTabs active="overview" />

          <section className="grid gap-5 lg:items-start lg:grid-cols-[1.2fr_0.8fr]">
            <div className="self-start">
              <div className="team-card-strong rounded-3xl p-6 sm:p-8">
                <div className="top-shine" />
                <p className="team-eyebrow">Command Deck</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Executive AI Roster v2.1
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                    总裁辅助团队
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                    7 角色模型
                  </span>
                </div>
                <h1 className="mt-5 text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                  这支 AI 幕僚班子，先把问题压实，再把最该上桌的人叫来。
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  这里不只是一个“角色展示页”，而是一张可以直接上手的指挥台。沈策负责入口和收口，林岚看机会，顾闻盯威胁，纪衡做取舍，程准推节奏，陆野校验一线，苏墨统一表达；每个人还有自己的记忆册，让团队协作更像真实参谋班子，而不是一组散角色。
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-slate-900">
                    默认入口: 沈策
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
                    3 段式调用路径
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
                    角色记忆自动生成机制
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-4">
                  <StatCard value={String(ROLES.length)} label="可调用幕僚" tone="neutral" />
                  <StatCard value="3" label="指挥分道" tone="product" />
                  <StatCard value={String(DISPATCH_CARDS.length)} label="调度规则组" tone="field" />
                  <StatCard value={String(DECISION_ARCHIVE.length)} label="已归档问答" tone="chief" />
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="team-soft-surface rounded-[24px] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="team-eyebrow">Current Doctrine</p>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                        Chief-led routing
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          入口规则
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-700">先定义问题，再调角色；先压结论，再补细节。</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          协同方式
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-700">不是全员会诊，而是最少必要角色的高密度协同。</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          输出标准
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-700">所有输出都必须落到结论、风险、动作，而不是停在分析。</p>
                      </div>
                    </div>
                  </div>
                  <div className="team-accent-surface rounded-[24px] p-5">
                    <p className="team-eyebrow">Fast Paths</p>
                    <div className="mt-4 space-y-3">
                      <Link
                        href="/team/decisions"
                        className="block rounded-2xl border border-white/70 bg-white/80 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                      >
                        <p className="text-sm font-semibold text-slate-950">直接看 Decision Archive</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          适合确认哪些问答已经形成可复用结论，哪些还在进行中。
                        </p>
                      </Link>
                      <Link
                        href="/team/history"
                        className="block rounded-2xl border border-white/70 bg-white/80 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                      >
                        <p className="text-sm font-semibold text-slate-950">回看 Evolution Preview</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          适合理解这支团队为什么从 6 角色演进到现在的 7 角色结构。
                        </p>
                      </Link>
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4">
                        <p className="text-sm font-semibold text-slate-950">周报节奏已经并入团队系统</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          每周的机会、威胁和管理层收口都能直接回流到同一套指挥链路里。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="team-deep-surface mt-8 rounded-2xl p-4">
                  <p className="team-eyebrow">Recommended Route</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                    {[
                      "1. 沈策先重写问题",
                      "2. 林岚看机会 / 顾闻看威胁",
                      "3. 纪衡定先做 / 后做 / 不做",
                      "4. 程准拆节奏，陆野做验证，苏墨统一表达",
                      "5. 最后仍由沈策收口",
                    ].map((step, index, arr) => (
                      <div key={step} className="flex items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">
                          {step}
                        </span>
                        {index < arr.length - 1 && <span className="text-slate-400">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="team-card rounded-3xl p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="team-eyebrow">Decision Lanes</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      三段式指挥台先说明“怎么用”，再展开角色细节。
                    </h2>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                    由 chief 统一进出
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {COMMAND_LANES.map((lane, index) => (
                    <div key={lane.title} className="team-soft-surface rounded-[22px] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Lane {index + 1}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-950">{lane.title}</h3>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                          {lane.roles.length} 席位
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{lane.detail}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {lane.roles.map((roleId) => {
                          const role = ROLE_MAP.get(roleId);

                          return role ? (
                            <span
                              key={role.id}
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${teamBadgeToneClass(role.tone)}`}
                            >
                              {role.personaName} · {role.shortLabel}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="team-card rounded-3xl p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="team-eyebrow">Call Matrix</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      四条常见路径，告诉老板什么时候该叫谁。
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">常用调用路径</span>
                </div>
                <div className="mt-4 space-y-3">
                  {CALL_MATRIX.map((item) => (
                    <div key={item.trigger} className="team-deep-surface rounded-[22px] p-4">
                      <p className="text-sm font-semibold text-slate-950">{item.trigger}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {item.path.map((roleId, index) => {
                          const role = ROLE_MAP.get(roleId);

                          return role ? (
                            <Fragment key={role.id}>
                              <span
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${teamBadgeToneClass(role.tone)}`}
                              >
                                {role.personaName}
                              </span>
                              {index < item.path.length - 1 && <span className="text-slate-400">→</span>}
                            </Fragment>
                          ) : null;
                        })}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.outcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-14 team-divider pt-10">
            <SectionTitle
              eyebrow="Role Operating Model"
              title="7 个席位，先看职责分布，再看每个人的边界与上场方式"
              description="团队从旧的 6 角色升级为 7 角色。最大的变化是新增林岚（market），并把顾闻（intel）收窄为竞争与战略情报官，让“机会”和“威胁”彻底分开。"
            />
            <div className="mb-6 grid gap-4 lg:grid-cols-3">
              {[
                {
                  label: "Entry Seat",
                  title: "1 个统一入口",
                  detail: "沈策负责先接问题、重写问题，再决定是否需要更多角色上桌。",
                },
                {
                  label: "Judgment Seats",
                  title: "3 个判断席位",
                  detail: "林岚、顾闻、纪衡分别承接机会、威胁和路线图判断，避免判断层混线。",
                },
                {
                  label: "Execution Seats",
                  title: "3 个执行席位",
                  detail: "程准、陆野、苏墨把结论继续推进到节奏、验证和最终表达。",
                },
              ].map((item) => (
                <div key={item.label} className="team-soft-surface rounded-[24px] p-5">
                  <p className="team-eyebrow">{item.label}</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {ROLES.map((role) => (
                <div key={role.id} className={role.id === "chief" ? "xl:col-span-2" : ""}>
                  <RoleCard role={role} />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 team-divider pt-10">
            <SectionTitle
              eyebrow="Routing Playbooks"
              title="调度不再是“把所有人都拉上来”，而是按判断层和动作层依次补角"
              description="重点不再是“把所有人都拉上来”，而是由沈策用最少必要角色解决问题，并且在进入某个判断层时自动补角。"
            />
            <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="team-card rounded-[24px] p-5">
                <p className="team-eyebrow">Routing Principle</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">
                  先判断问题在哪一层，再决定谁需要出现。
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  沈策不会默认把所有人都叫来，而是先判断问题究竟属于入口澄清、机会/威胁/取舍判断，还是推进与表达阶段，再按层补人。
                </p>
              </div>
              <div className="team-accent-surface rounded-[24px] p-5">
                <p className="team-eyebrow">What Changes In v2.1</p>
                <ul className="mt-3 space-y-2.5 text-sm leading-7 text-slate-700">
                  <li className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                    <span>机会判断和威胁判断彻底拆开，不再混成“外部分析”。</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                    <span>路线图判断只在需要取舍时补上纪衡，而不是每次都默认出现。</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                    <span>推进、验证、表达位于结论之后，避免团队长期停留在分析层。</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {DISPATCH_CARDS.map((card) => (
                <DispatchCardView key={card.title} card={card} />
              ))}
            </div>
          </section>

          <section className="mt-14 team-divider pt-10">
            <SectionTitle
              eyebrow="Weekly Briefing Flow"
              title="周报不再是附属产物，而是并入同一条团队指挥链路"
              description="这套总裁辅助团队不只回答单次问题，也会把市场、竞争与管理层收口固化成每周周报，并自动输出 PDF。"
            />
            <div className="team-card-strong rounded-3xl p-6">
              <div className="grid gap-4 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] xl:items-stretch">
                {WEEKLY_FLOW.map((node, index) => (
                  <Fragment key={node.title}>
                    <WeeklyNodeCard node={node} />
                    {index < WEEKLY_FLOW.length - 1 && (
                      <div className="hidden items-center justify-center text-3xl text-slate-400 xl:flex">
                        →
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="team-deep-surface rounded-2xl p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    周报输入怎么分工
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                    <li>• 林岚：机会、需求迁移、区域变化、增长信号</li>
                    <li>• 顾闻：竞品、定价、渠道、政策、外部威胁</li>
                    <li>• 沈策：一页纸结论、风险、本周动作、待拍板事项</li>
                  </ul>
                </div>
                <div className="team-deep-surface rounded-2xl p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    周报输出怎么落地
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                    <li>• 汇总为 AI 安全周报合并版</li>
                    <li>• 自动转成 PDF</li>
                    <li>• 自动推送到 WhatsApp</li>
                    <li>• 适合先看沈策，再按需下钻林岚 / 顾闻</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-14 team-divider pt-10">
            <SectionTitle
              eyebrow="Maturity Plan"
              title="按成熟度分阶段上线，而不是一次铺满"
              description="新的团队设计保持渐进式：先跑顺判断与定义，再补推进与表达，最后把一线验证接回来。"
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {PHASES.map((phase) => (
                <article
                  key={phase.phase}
                  className="team-card rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                      {phase.phase}
                    </span>
                    <span className="text-xs text-slate-500">{phase.roles.join(" + ")}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-950">{phase.title}</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        目标
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{phase.goal}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        结果
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{phase.outcome}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-14 team-divider pt-10">
            <SectionTitle
              eyebrow="Prompt Library"
              title="老板日常直接可用的模板，已经收成同一套调用语言"
              description="模板也跟着 v2.1 更新：先沈策，后最少必要角色，最后统一收口。"
            />
            <div className="grid gap-4 xl:grid-cols-2">
              {PROMPTS.map((item) => (
                <article
                  key={item.title}
                  className="team-card rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-black/[0.12]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                      直接可用
                    </span>
                  </div>
                  <div className="team-deep-surface mt-4 rounded-xl p-4 text-sm leading-6 text-slate-700">
                    {item.prompt}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </TeamShell>
  );
}
