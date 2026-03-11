import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import { HISTORY_TIMELINE, DECISION_CASES } from "../data";
import {
  SectionTitle,
  TeamTabs,
  TimelineCard,
  DecisionCaseCard,
  StatCard,
} from "../components";

export const metadata: Metadata = {
  title: "决策档案 | 总裁辅助团队",
  description:
    "记录总裁辅助团队从 6 角色到 7 角色的演进历程、关键决策理由和代表性案例。",
};

export default function TeamHistoryPage() {
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

        <main className="mx-auto max-w-[1320px] px-4 py-6 sm:py-8">
          <TeamTabs active="history" />

          <section className="glass glass-premium rounded-3xl p-6 sm:p-8">
            <div className="top-shine" />
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                Decision Archive
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#94a3b8]">
                决策档案
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight text-[#f0f6fc] sm:text-5xl">
              从 6 角色到 7 角色，每一步都有<span className="gradient-text">明确理由</span>
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#94a3b8] sm:text-base">
              这里记录的是这套团队为什么会变成现在这样：哪些角色被新增、哪些职责被收窄、为什么 chief 成为默认入口，以及 v2.1 调度规则是如何固定下来的。
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#64748b]">
              这页只保留可公开复用的决策逻辑，不展示隐藏推理过程。
            </p>
              </div>

              <div className="panel-deep rounded-[28px] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                  Archive Scope
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                  <li>• 角色演进：6 → 7</li>
                  <li>• 调度规则：v2.1 固化</li>
                  <li>• 输出形式：周报 / PDF / 公开展示页</li>
                  <li>• 案例类型：架构、决策、集成</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <StatCard
                value={String(HISTORY_TIMELINE.length)}
                label="架构演进里程碑"
                accentClass="text-blue-300"
              />
              <StatCard
                value={String(DECISION_CASES.length)}
                label="关键决策案例"
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
                <li>• 团队从 6 角色扩展到 7 角色的关键节点</li>
                <li>• market / intel / chief 等核心定位为什么这样定义</li>
                <li>• 调度规则、周报流水线与对外展示如何并轨</li>
              </ul>
            </div>
            <div className="glass glass-premium rounded-3xl p-6">
              <div className="top-shine" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                记录原则
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                <li>• 只记录值得复用的架构调整与判断原则</li>
                <li>• 重点回答“为什么这样设计”，不是只列结果</li>
                <li>• 保持与 cybersec-daily 当前展示页一致</li>
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
              eyebrow="Decision Cases"
              title="三个代表性决策案例"
              description="这些案例回答的是团队设计背后的关键问题：为什么要拆分角色、为什么 chief 是默认入口、为什么需要触发补角规则。"
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
                description="2025 年 3 月，团队架构、调度规则和历史决策正式同步到 cybersec-daily 项目，开始作为公开页面持续维护。"
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
                      <span>周报流水线机制（market → intel → chief → PDF）</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                      <span>演进时间线和关键决策案例</span>
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
                      <span>记录决策理由，避免未来重复讨论相同问题</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5ff00]" />
                      <span>保持团队定义与实际使用的一致性</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5ff00]" />
                      <span>为未来的团队演进提供历史参考</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="panel-accent mt-6 rounded-2xl p-5">
                <p className="text-sm font-semibold text-[#f0f6fc]">这个页面本身就是一个里程碑</p>
                <p className="mt-2 text-sm leading-6 text-[#dbe4ee]">
                  当你看到这个页面时，意味着团队架构已经从内部工作方法变成了可公开访问、可持续维护的知识库页面。
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
