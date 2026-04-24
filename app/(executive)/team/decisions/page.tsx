import Link from "next/link";
import type { Metadata } from "next";
import TeamShell from "@/components/shells/TeamShell";
import {
  ARCHIVE_STATUS_LABELS,
  DECISION_ARCHIVE,
  DECISION_ARCHIVE_SCOPE,
  ROLE_NAME_MAP,
  ROLES,
} from "../data";
import { SectionTitle, TeamTabs, StatCard } from "../components";
import { teamBadgeToneClass } from "../theme";
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
    <TeamShell glowTone="archive">
      <div>
        <main className="mx-auto max-w-[1320px] px-4 py-6 sm:py-8">
          <TeamTabs active="decisions" />

          <section className="team-card-strong rounded-3xl p-6 sm:p-8">
            <div className="top-shine" />
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="team-eyebrow">Archive Workbench</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${teamBadgeToneClass("market")}`}>
                    Decision Archive
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                    决策档案
                  </span>
                </div>
                <h1 className="mt-5 text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                  只把网络安全相关问答沉淀进决策档案。
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  这里不再收录团队架构、页面结构或产品组织类问题，只归档网络安全相关的提问、团队回答、任务怎么分解、各角色分别做了什么、最后如何统一收口，以及最终产生的结果与后续动作。
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                  当前范围：{DECISION_ARCHIVE_SCOPE}。为了保持边界清晰，这里归档的是公开决策过程，不展示内部隐藏推理链路。
                </p>
              </div>

              <div className="team-deep-surface rounded-[28px] p-5">
                <p className="team-eyebrow">Archive Rules</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                  <li>• 每条记录都包含：提问 / 团队回答 / 任务分解 / 角色执行 / 最终汇总 / 结果</li>
                  <li>• 只收录网络安全相关问答</li>
                  <li>• 团队架构、页面结构、组织设计问题不进入这里</li>
                  <li>• 与“进化历程”互补：一个看网络安全问答，一个看宏观演进主线</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <StatCard value={String(DECISION_ARCHIVE.length)} label="总归档条数" tone="market" />
              <StatCard value={String(shippedCount)} label="已落地" tone="field" />
              <StatCard value={String(activeCount)} label="进行中" tone="chief" />
              <StatCard value={String(filtered.length)} label="当前筛选结果" tone="product" />
            </div>
          </section>

          <section className="mt-14 grid gap-4 team-divider pt-10 lg:grid-cols-2">
            <div className="team-card rounded-3xl p-6">
              <p className="team-eyebrow">Direct Links</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                按编号直达某条网络安全档案。
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                现在每条档案都支持用编号直接访问，例如：
                <span className="ml-1 font-semibold text-amber-700">/team/decisions/DA-003</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                详情页也兼容内部 id，可作为长期引用链接使用。
              </p>
            </div>

            <div className="team-card rounded-3xl p-6">
              <p className="team-eyebrow">What Gets Archived</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>• 仅当问答属于网络安全主题时才允许入档</li>
                <li>• `question`：你的原始提问</li>
                <li>• `answer`：团队最终回答</li>
                <li>• `publicProcess`：公开可复用的形成过程</li>
                <li>• `decomposition / execution / synthesis / result`：任务拆解、角色执行、统一收口和结果</li>
              </ul>
            </div>
          </section>

          <section className="mt-14 team-divider pt-10">
            <SectionTitle
              eyebrow="Archive Query"
              title="按关键词、状态、角色查询"
              description="可以搜提问、回答、任务分解、角色执行、最终汇总和结果关键词，也可以按角色或状态筛选。"
            />

            <form method="get" className="team-card-strong rounded-3xl p-5">
              <div className="top-shine" />
              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_auto] lg:items-end">
                <label className="block">
                  <span className="team-eyebrow">关键词</span>
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    placeholder="例如：DA-003 / 沈策 / 任务分解 / 汇总 / 智算安全 / EDR"
                    className="team-deep-surface mt-3 w-full rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </label>

                <label className="block">
                  <span className="team-eyebrow">状态</span>
                  <select
                    name="status"
                    defaultValue={status}
                    className="team-deep-surface mt-3 w-full rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none"
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
                  <span className="team-eyebrow">角色</span>
                  <select
                    name="role"
                    defaultValue={role}
                    className="team-deep-surface mt-3 w-full rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none"
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
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-100"
                  >
                    查询
                  </button>
                  <Link
                    href="/team/decisions"
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    重置
                  </Link>
                </div>
              </div>
            </form>
          </section>

          <section className="mt-14 team-divider pt-10">
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
              <div className="team-card-strong rounded-3xl p-8">
                <div className="top-shine" />
                <p className="text-lg font-semibold text-slate-950">当前没有已归档的网络安全问答</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  这页现在只收录网络安全相关问答，所以原先那些团队架构与页面设计类条目已经从这里移出。后续有真实的网络安全问答沉淀进来后，会出现在这里。
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </TeamShell>
  );
}
