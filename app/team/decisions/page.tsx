import Link from "next/link";
import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import {
  ARCHIVE_STATUS_LABELS,
  DECISION_ARCHIVE,
  DECISION_ARCHIVE_SCOPE,
  ROLE_NAME_MAP,
  ROLES,
} from "../data";
import {
  SectionTitle,
  TeamTabs,
  StatCard,
} from "../components";
import DecisionArchiveDeck from "../DecisionArchiveDeck";

export const metadata: Metadata = {
  title: "决策档案 | 总裁辅助团队",
  description:
    "只归档网络安全相关的提问、团队回答、任务分解、角色执行、公开过程与结果，并支持按关键词、状态与角色查询。",
};

type DecisionArchivePageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    role?: string;
  }>;
};

export default async function TeamDecisionsPage({ searchParams }: DecisionArchivePageProps) {
  const params = (await searchParams) ?? {};
  const q = (params.q ?? "").trim();
  const status = (params.status ?? "all").trim();
  const role = (params.role ?? "all").trim();
  const normalizedQ = q.toLowerCase();

  const filtered = DECISION_ARCHIVE.filter((entry) => {
    const statusMatch = status === "all" || entry.status === status;
    const roleMatch = role === "all" || entry.roles.includes(role as (typeof entry.roles)[number]);

    if (!statusMatch || !roleMatch) return false;
    if (!normalizedQ) return true;

    const haystack = [
      entry.archiveNo,
      entry.title,
      entry.askedAt,
      entry.question,
      entry.answer,
      entry.result,
      entry.adoptedVersion,
      ...entry.publicProcess,
      ...entry.decomposition.flatMap((item) => [item.title, item.detail, ROLE_NAME_MAP[item.owner]]),
      ...entry.execution.flatMap((item) => [item.task, item.output, ROLE_NAME_MAP[item.role]]),
      entry.synthesis,
      ...entry.tags,
      ...entry.relatedMilestones,
      ...entry.relatedPages.map((page) => page.label),
      ...entry.roles.map((roleId) => ROLE_NAME_MAP[roleId]),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQ);
  });

  const shippedCount = DECISION_ARCHIVE.filter((item) => item.status === "shipped").length;
  const activeCount = DECISION_ARCHIVE.filter((item) => item.status === "active").length;

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
          style={{ background: "rgba(168,85,247,0.12)" }}
        />
      </div>

      <div className="relative noise min-h-screen">
        <NavBar active="团队" />

        <main className="mx-auto max-w-[1320px] px-4 py-6 sm:py-8">
          <TeamTabs active="decisions" />

          <section className="glass glass-premium rounded-3xl p-6 sm:p-8">
            <div className="top-shine" />
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
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
                  只把<span className="gradient-text">网络安全相关问答</span>沉淀进决策档案。
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[#94a3b8] sm:text-base">
                  这里不再收录团队架构、页面结构或产品组织类问题，只归档网络安全相关的提问、团队回答、任务怎么分解、各角色分别做了什么、最后如何统一收口，以及最终产生的结果与后续动作。每条记录还带有编号、提问时间、最终采用版本、关联页面与关联里程碑，支持按关键词、状态、角色检索。
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#64748b]">
                  当前范围：{DECISION_ARCHIVE_SCOPE}。为了保持边界清晰，这里归档的是公开决策过程，不展示内部隐藏推理链路。
                </p>
              </div>

              <div className="panel-deep rounded-[28px] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                  Archive Rules
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                  <li>• 每条记录都包含：提问 / 团队回答 / 任务分解 / 角色执行 / 最终汇总 / 结果</li>
                  <li>• 只收录网络安全相关问答</li>
                  <li>• 团队架构、页面结构、组织设计问题不进入这里</li>
                  <li>• 与“进化历程”互补：一个看网络安全问答，一个看宏观演进主线</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <StatCard
                value={String(DECISION_ARCHIVE.length)}
                label="总归档条数"
                accentClass="text-violet-300"
              />
              <StatCard value={String(shippedCount)} label="已落地" accentClass="text-emerald-300" />
              <StatCard value={String(activeCount)} label="进行中" accentClass="text-[#e5ff00]" />
              <StatCard value={String(filtered.length)} label="当前筛选结果" accentClass="text-cyan-300" />
            </div>
          </section>

          <section className="mt-14 grid gap-4 border-t border-white/6 pt-10 lg:grid-cols-2">
            <div className="glass glass-premium rounded-3xl p-6">
              <div className="top-shine" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                按编号直达
              </p>
              <p className="mt-4 text-sm leading-6 text-[#dbe4ee]">
                现在每条网络安全档案都支持用编号直接访问，例如：
                <span className="ml-1 font-semibold text-[#e5ff00]">/team/decisions/DA-003</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                详情页也兼容内部 id，可作为长期引用链接使用。
              </p>
            </div>

            <div className="glass glass-premium rounded-3xl p-6">
              <div className="top-shine" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
                自动沉淀标准
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#dbe4ee]">
                <li>• 仅当问答属于网络安全主题时才允许入档</li>
                <li>• question：你的原始提问</li>
                <li>• answer：团队最终回答</li>
                <li>• publicProcess：公开可复用的形成过程</li>
                <li>• decomposition：任务如何被拆下去</li>
                <li>• execution / synthesis：各角色干了什么，最后如何汇总</li>
                <li>• result：结果 / 后续动作</li>
                <li>• archiveNo / askedAt / adoptedVersion / relatedPages / relatedMilestones</li>
              </ul>
            </div>
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Query"
              title="按关键词、状态、角色查询"
              description="可以搜提问、回答、任务分解、角色执行、最终汇总和结果关键词，也可以按角色或状态筛选。"
            />

            <form method="get" className="glass glass-premium rounded-3xl p-5">
              <div className="top-shine" />
              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_auto] lg:items-end">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                    关键词
                  </span>
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    placeholder="例如：DA-003 / 沈策 / 任务分解 / 汇总 / 智算安全 / EDR"
                    className="panel-deep mt-3 w-full rounded-2xl px-4 py-3 text-sm text-[#f0f6fc] outline-none placeholder:text-[#64748b]"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                    状态
                  </span>
                  <select
                    name="status"
                    defaultValue={status}
                    className="panel-deep mt-3 w-full rounded-2xl px-4 py-3 text-sm text-[#f0f6fc] outline-none"
                  >
                    <option value="all">全部状态</option>
                    {Object.entries(ARCHIVE_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                    角色
                  </span>
                  <select
                    name="role"
                    defaultValue={role}
                    className="panel-deep mt-3 w-full rounded-2xl px-4 py-3 text-sm text-[#f0f6fc] outline-none"
                  >
                    <option value="all">全部角色</option>
                    {ROLES.map((roleItem) => (
                      <option key={roleItem.id} value={roleItem.id}>
                        {roleItem.chineseName}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-2xl border border-[#e5ff00]/25 bg-[#e5ff00]/10 px-5 py-3 text-sm font-semibold text-[#f0f6fc] transition hover:bg-[#e5ff00]/16"
                  >
                    查询
                  </button>
                  <Link
                    href="/team/decisions"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-[#94a3b8] transition hover:border-white/20 hover:text-[#f0f6fc]"
                  >
                    重置
                  </Link>
                </div>
              </div>
            </form>
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Archive Entries"
              title="问题归档结果"
              description={
                q || status !== "all" || role !== "all"
                  ? `当前筛选到 ${filtered.length} 条记录。`
                  : "以下记录展示了关键提问、团队回答、任务分解、角色执行、最终汇总与结果如何被归档为可查询条目。"
              }
            />

            {filtered.length > 0 ? (
              <DecisionArchiveDeck entries={filtered} />
            ) : (
              <div className="glass glass-premium rounded-3xl p-8">
                <div className="top-shine" />
                <p className="text-lg font-semibold text-[#f0f6fc]">当前没有已归档的网络安全问答</p>
                <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                  这页现在只收录网络安全相关问答，所以原先那些团队架构与页面设计类条目已经从这里移出。后续有真实的网络安全问答沉淀进来后，会出现在这里。
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
