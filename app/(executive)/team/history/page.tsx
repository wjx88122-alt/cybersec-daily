import type { Metadata } from "next";
import TeamShell from "@/components/shells/TeamShell";
import { HISTORY_TIMELINE, DECISION_CASES } from "../data";
import {
  SectionTitle,
  TeamTabs,
  TimelineCard,
  DecisionCaseCard,
  StatCard,
} from "../components";

export const metadata: Metadata = {
  title: "进化历程 | 总裁辅助团队",
  description:
    "记录总裁辅助团队从 6 角色到 7 角色的演进历程、关键架构转折和同步里程碑。",
};

export default function TeamHistoryPage() {
  return (
    <TeamShell>
      <div>
        <main className="mx-auto max-w-[1320px] px-4 py-6 sm:py-8">
          <TeamTabs active="evolution" />

          <section className="glass glass-premium rounded-3xl p-6 sm:p-8">
            <div className="top-shine" />
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                    Evolution Journey
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#94a3b8]">
                    进化历程
                  </span>
                </div>
                <h1 className="mt-5 text-3xl font-semibold leading-tight text-[#f0f6fc] sm:text-5xl">
                  这支团队不是一次设计完的，而是沿着<span className="gradient-text">问题演进</span>长出来的。
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[#94a3b8] sm:text-base">
                  进化历程聚焦的是宏观变化：角色怎么从 6 个变成 7 个、调度规则为什么升级到 v2.1、周报机制何时并入系统，以及为什么最终同步到 cybersec-daily。
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#64748b]">
                  这里看的是团队演进主线，不是逐条问题归档。逐条提问与结果请看“决策档案”。
                </p>
              </div>

              <div className="panel-deep rounded-[28px] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                  Evolution Scope
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                  <li>• 角色演进：6 → 7</li>
                  <li>• 架构转折：林岚新增 / 顾闻收窄 / 沈策升级</li>
                  <li>• 机制升级：v2.1 调度 + 周报流水线</li>
                  <li>• 系统同步：公开页面与知识库化</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <StatCard
                value={String(HISTORY_TIMELINE.length)}
                label="演进里程碑"
                accentClass="text-blue-300"
              />
              <StatCard
                value="6→7"
                label="角色结构变化"
                accentClass="text-violet-300"
              />
              <StatCard value="v2.1" label="当前调度版本" accentClass="text-[#e5ff00]" />
              <StatCard value="公开" label="知识库展示状态" accentClass="text-emerald-300" />
            </div>
          </section>

          <section className="mt-14 grid gap-4 border-t border-white/6 pt-10 lg:grid-cols-2">
            <div className="glass glass-premium rounded-3xl p-6">
              <div className="top-shine" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                这页看什么
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                <li>• 哪些问题推动了团队结构变化</li>
                <li>• 哪些里程碑让团队从角色集合变成工作系统</li>
                <li>• 团队定义如何与公开页面同步</li>
              </ul>
            </div>
            <div className="glass glass-premium rounded-3xl p-6">
              <div className="top-shine" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                如何与决策档案配合
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                <li>• 进化历程回答“团队为什么变成现在这样”</li>
                <li>• 决策档案回答“某次网络安全提问是怎么处理并落地的”</li>
                <li>• 一个看主线，一个看逐条归档</li>
              </ul>
            </div>
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Timeline"
              title="演进时间线"
              description="从 2024 年 12 月的 6 角色模型，到 2025 年 3 月的 v2.1 调度规则和周报流水线，每个里程碑都标记了团队能力的一次跃升。"
            />
            <div className="grid gap-4 lg:grid-cols-2">
              {HISTORY_TIMELINE.map((milestone) => (
                <TimelineCard key={milestone.date + milestone.title} milestone={milestone} />
              ))}
            </div>
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Turning Points"
              title="三个关键转折说明"
              description="这些说明不是逐条问题档案，而是帮助你快速理解团队演进中最重要的三个结构性转折。"
            />
            <div className="grid gap-6">
              {DECISION_CASES.map((decisionCase) => (
                <DecisionCaseCard key={decisionCase.title} decisionCase={decisionCase} />
              ))}
            </div>
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <div className="glass glass-premium rounded-3xl p-6 sm:p-8">
              <SectionTitle
                eyebrow="Integration Milestone"
                title="cybersec-daily 同步里程碑"
                description="2025 年 3 月，团队架构、调度规则和历史演进正式同步到 cybersec-daily 项目，开始作为公开页面持续维护。"
              />

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="panel-soft rounded-2xl p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                    同步内容
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                    <li className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                      <span>7 角色模型完整定义（人设、边界、思考框架）</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                      <span>v2.1 调度规则（四维判断框架、触发补角规则）</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                      <span>周报流水线机制（林岚 → 顾闻 → 沈策 → 成册）</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                      <span>进化时间线与关键转折说明</span>
                    </li>
                  </ul>
                </div>

                <div className="panel-deep rounded-2xl p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                    同步目的
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                    <li className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5ff00]" />
                      <span>建立公开展示页面，让团队架构可被外部访问</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5ff00]" />
                      <span>记录演进主线，避免未来重复解释为什么这样设计</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5ff00]" />
                      <span>为逐条问题档案提供结构背景</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5ff00]" />
                      <span>保持团队定义与实际使用的一致性</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="panel-accent mt-6 rounded-2xl p-5">
                <p className="text-sm font-semibold text-[#f0f6fc]">现在的“进化历程”只讲主线</p>
                <p className="mt-2 text-sm leading-6 text-[#dbe4ee]">
                  如果你想看某一次具体的网络安全提问是怎么被处理、做了什么决定、最后落了什么结果，请切换到新的“决策档案”页查询。
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </TeamShell>
  );
}
