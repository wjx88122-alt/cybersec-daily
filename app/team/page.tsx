import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import {
  ROLES,
  DISPATCH_CARDS,
  WEEKLY_FLOW,
  PHASES,
  PROMPTS,
  HISTORY_TIMELINE,
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

export const metadata: Metadata = {
  title: "总裁辅助团队 | 家兴的网络安全日报",
  description:
    "展示家兴最新的 7 位人格化总裁辅助幕僚、v2.1 调度规则，以及带记忆系统的 AI 安全周报机制。",
};

export default function TeamPage() {
  return (
    <div className="team-shell system-shell system-shell-light min-h-screen overflow-hidden">
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

        <main className="mx-auto max-w-[1320px] px-4 py-6 sm:py-8">
          <TeamTabs active="overview" />

          <section className="grid gap-5 lg:grid-cols-[1.45fr_0.95fr]">
            <div className="glass glass-premium rounded-3xl p-6 sm:p-8">
              <div className="top-shine" />
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
                先找 <span className="gradient-text">沈策（chief）</span>
                ，再由他把最该上桌的人叫来。
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#94a3b8] sm:text-base">
                这页不是抽象的角色列表，而是一套可直接调用、有人名有人设的 AI 幕僚编制。现在团队由沈策负责入口与收口，林岚看机会，顾闻盯威胁，纪衡做取舍，程准管推进，陆野验证一线，苏墨统一表达；每个人还有自己的“记忆册”，让系统更像一支真的参谋班子。
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#e5ff00]/20 bg-[#e5ff00]/10 px-3 py-1.5 text-sm text-[#f0f6fc]">
                  默认入口: 沈策
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-[#dbe4ee]">
                  7 位有名字的幕僚
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-[#dbe4ee]">
                  3 个 Team 分区
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-[#dbe4ee]">
                  角色记忆自动生成机制
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <StatCard value={String(ROLES.length)} label="可调用幕僚" accentClass="text-[#e5ff00]" />
                <StatCard value="3" label="Team 页面分区" accentClass="text-violet-300" />
                <StatCard value={String(DISPATCH_CARDS.length)} label="核心调度规则组" accentClass="text-cyan-300" />
                <StatCard value={String(DECISION_ARCHIVE.length)} label="已归档问答" accentClass="text-emerald-300" />
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="panel-soft rounded-[24px] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                      Executive Brief
                    </p>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-[#94a3b8]">
                      Chief-led routing
                    </span>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                        Operating Posture
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#dbe4ee]">先定义问题，再调角色；先压结论，再补细节。</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                        Decision Style
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#dbe4ee]">不是全员会诊，而是最少必要角色的高密度协同。</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                        Output Standard
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#dbe4ee]">所有输出都要落到结论、风险、动作，而不是停在分析。</p>
                    </div>
                  </div>
                </div>
                <div className="panel-accent rounded-[24px] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                    Ideal Use Cases
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#f0f6fc]">
                    <li>• 新市场值不值得进入</li>
                    <li>• 竞品动作要不要跟</li>
                    <li>• 路线图该先做 / 后做 / 不做什么</li>
                    <li>• 哪些结论已经可以进入老板表达与周报</li>
                  </ul>
                </div>
              </div>

              <div className="panel-deep mt-8 rounded-2xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  推荐调用顺序
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#dbe4ee]">
                  {[
                    "1. 沈策先重写问题",
                    "2. 林岚看机会 / 顾闻看威胁",
                    "3. 纪衡定先做 / 后做 / 不做",
                    "4. 程准拆节奏，陆野做验证，苏墨统一表达",
                    "5. 最后仍由沈策收口",
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
              <div className="glass glass-premium rounded-3xl p-6">
                <div className="top-shine" />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                    Roster Snapshot
                  </p>
                  <span className="text-xs text-[#64748b]">按调用顺序排列</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {ROLES.map((role) => (
                    <div
                      key={role.id}
                      className={`rounded-2xl p-4 ${role.id === "chief" ? "panel-accent" : "panel-soft"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={role.avatarSrc}
                            alt={`${role.personaName} 头像`}
                            className="h-[4.5rem] w-[4.5rem] rounded-[22px] border border-[#50f7ff]/20 bg-[linear-gradient(145deg,rgba(80,247,255,0.1),rgba(15,23,42,0.35))] object-cover shadow-[0_0_24px_rgba(80,247,255,0.16)] sm:h-[5rem] sm:w-[5rem]"
                          />
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${role.accentClass}`}
                          >
                            {role.code}
                          </span>
                        </div>
                        <span className="text-xs text-[#64748b]">{role.phase}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-[#f0f6fc]">
                        {role.personaName}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#dbe4ee]">
                        {role.chineseName}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#94a3b8]">
                        {role.shortLabel} · 记忆册「{role.memoryName}」
                      </p>
                      <p className="mt-2 text-xs leading-5 text-[#94a3b8]">{role.signatureLine}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass glass-premium rounded-3xl p-6">
                <div className="top-shine" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                  核心规则
                </p>
                <div className="mt-4 space-y-4">
                  <div className="panel-accent rounded-2xl p-4">
                    <p className="text-sm font-semibold text-[#f0f6fc]">
                      先沈策，后专家，最后还是沈策
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#dbe4ee]">
                      你不需要先判断应该叫谁。沈策负责判断问题类型、决定谁上场、按什么顺序上场，以及最后怎么收口。
                    </p>
                  </div>
                  <div className="panel-soft rounded-2xl p-4">
                    <p className="text-sm font-semibold text-[#f0f6fc]">
                      决策档案只收录网络安全问答，并且只存公开过程
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                      后续只归档网络安全相关的提问、团队回答、可公开复用的形成过程和最终结果；名字、人设、记忆册会保留，但不会暴露内部隐藏推理链路。
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Link
                  href="/team/history"
                  className="glass glass-premium block rounded-3xl p-6 transition-all hover:-translate-y-0.5 hover:border-[#e5ff00]/20 hover:bg-white/[0.04]"
                >
                  <div className="top-shine" />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                      Evolution Preview
                    </p>
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-300">
                      {HISTORY_TIMELINE.length} 条里程碑
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-[#f0f6fc]">查看这套团队是怎么一步步长出来的</h2>
                  <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                    进化历程聚焦 6→7 角色演进、关键架构转折和系统同步里程碑。
                  </p>
                  <p className="mt-4 text-sm font-semibold text-[#e5ff00]">进入进化历程 →</p>
                </Link>

                <Link
                  href="/team/decisions"
                  className="glass glass-premium block rounded-3xl p-6 transition-all hover:-translate-y-0.5 hover:border-[#e5ff00]/20 hover:bg-white/[0.04]"
                >
                  <div className="top-shine" />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                      Decision Archive
                    </p>
                    <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-300">
                      {DECISION_ARCHIVE.length} 条问题
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-[#f0f6fc]">按网络安全问答检索：提问、回答、过程、结果</h2>
                  <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                    决策档案页只归档网络安全相关的问答，记录你的提问、团队回答、形成回答的公开过程和最终结果，并支持按关键词、角色、状态查询。
                  </p>
                  <p className="mt-4 text-sm font-semibold text-[#e5ff00]">进入决策档案 →</p>
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Roster"
              title="7 位角色，一眼看懂人设、边界与上场方式"
              description="团队从旧的 6 角色升级为 7 角色。最大的变化是新增林岚（market），并把顾闻（intel）收窄为竞争与战略情报官，让“机会”和“威胁”彻底分开。"
            />
            <div className="grid gap-4 xl:grid-cols-2">
              {ROLES.map((role) => (
                <div key={role.id} className={role.id === "chief" ? "xl:col-span-2" : ""}>
                  <RoleCard role={role} />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Dispatch v2.1"
              title="这支团队现在怎么调度"
              description="重点不再是“把所有人都拉上来”，而是由沈策用最少必要角色解决问题，并且在进入某个判断层时自动补角。"
            />
            <div className="grid gap-4 xl:grid-cols-3">
              {DISPATCH_CARDS.map((card) => (
                <DispatchCardView key={card.title} card={card} />
              ))}
            </div>
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Weekly Intelligence Loop"
              title="AI 安全周报机制已经进入团队系统"
              description="这套总裁辅助团队不只回答单次问题，也会把市场、竞争与管理层收口固化成每周周报，并自动输出 PDF。"
            />
            <div className="glass glass-premium rounded-3xl p-6">
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
                <div className="panel-deep rounded-2xl p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                    周报输入怎么分工
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                    <li>• 林岚：机会、需求迁移、区域变化、增长信号</li>
                    <li>• 顾闻：竞品、定价、渠道、政策、外部威胁</li>
                    <li>• 沈策：一页纸结论、风险、本周动作、待拍板事项</li>
                  </ul>
                </div>
                <div className="panel-deep rounded-2xl p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                    周报输出怎么落地
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                    <li>• 汇总为 AI 安全周报合并版</li>
                    <li>• 自动转成 PDF</li>
                    <li>• 自动推送到 WhatsApp</li>
                    <li>• 适合先看沈策，再按需下钻林岚 / 顾闻</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Rollout"
              title="按成熟度分阶段上线，而不是一次铺满"
              description="新的团队设计保持渐进式：先跑顺判断与定义，再补推进与表达，最后把一线验证接回来。"
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {PHASES.map((phase) => (
                <article
                  key={phase.phase}
                  className="glass glass-premium rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
                      {phase.phase}
                    </span>
                    <span className="text-xs text-[#64748b]">{phase.roles.join(" + ")}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[#f0f6fc]">{phase.title}</h3>
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

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Prompt Templates"
              title="老板日常可以直接调用的模板"
              description="模板也跟着 v2.1 更新：先沈策，后最少必要角色，最后统一收口。"
            />
            <div className="grid gap-4 xl:grid-cols-2">
              {PROMPTS.map((item) => (
                <article
                  key={item.title}
                  className="glass glass-premium rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-black/[0.12]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-[#f0f6fc]">{item.title}</h3>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
                      直接可用
                    </span>
                  </div>
                  <div className="panel-deep mt-4 rounded-xl p-4 text-sm leading-6 text-[#dbe4ee]">
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
