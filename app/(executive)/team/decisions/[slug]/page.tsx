import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TeamShell from "@/components/shells/TeamShell";
import {
  ARCHIVE_STATUS_LABELS,
  ROLE_NAME_MAP,
  getDecisionArchiveEntry,
  getRelatedDecisionEntries,
} from "../../data";
import { SectionTitle, TeamTabs } from "../../components";
import { teamBadgeToneClass } from "../../theme";
import DecisionDiscussionReplay from "../../DecisionDiscussionReplay";

type DecisionDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: DecisionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getDecisionArchiveEntry(slug);

  if (!entry) {
    return {
      title: "决策档案 | 未找到",
    };
  }

  return {
    title: `${entry.archiveNo} · ${entry.title} | 决策档案`,
    description: `${entry.question} — ${entry.answer}`,
  };
}

export default async function DecisionDetailPage({ params }: DecisionDetailPageProps) {
  const { slug } = await params;
  const entry = getDecisionArchiveEntry(slug);

  if (!entry) notFound();

  const related = getRelatedDecisionEntries(entry.id, 3);

  return (
    <TeamShell glowTone="archive">
      <div>
        <main className="mx-auto max-w-[1320px] px-4 py-6 sm:py-8">
          <TeamTabs active="decisions" />

          <section className="team-card-strong rounded-3xl p-6 sm:p-8">
            <div className="top-shine" />
            <p className="team-eyebrow">Decision Brief</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href="/team/decisions"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                ← 返回决策档案
              </Link>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                {entry.archiveNo}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                {entry.date}
              </span>
              <span className="team-accent-surface rounded-full px-3 py-1 text-xs font-semibold text-slate-900">
                {ARCHIVE_STATUS_LABELS[entry.status]}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              {entry.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">提问时间：{entry.askedAt}</p>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="team-soft-surface rounded-2xl p-5">
                <p className="team-eyebrow">你的问题</p>
                <p className="mt-3 text-lg font-semibold leading-7 text-slate-950">{entry.question}</p>
              </div>

              <div className="team-accent-surface rounded-2xl p-5">
                <p className="team-eyebrow">团队回答</p>
                <p className="mt-3 text-sm leading-7 text-slate-900">{entry.answer}</p>
              </div>
            </div>
          </section>

          <section className="mt-14 team-divider pt-10">
            <SectionTitle
              eyebrow="Discussion Replay"
              title="拟人化复现他们讨论这件事的过程"
              description="每个角色都以名字、身份和头像出场，按真实分工顺序自动发言，让你直观看到是谁先接住问题、谁负责拆解、谁给出判断、谁最后统一收口。"
            />

            <DecisionDiscussionReplay entry={entry} />
          </section>

          <section className="mt-14 team-divider pt-10">
            <SectionTitle
              eyebrow="Public Process"
              title="团队如何做出这个回答"
              description="这里保留公开可复用的形成过程，便于未来复用，不展示隐藏推理链路。"
            />
            <div className="team-card-strong rounded-3xl p-6">
              <div className="top-shine" />
              <ol className="space-y-4">
                {entry.publicProcess.map((step, index) => (
                  <li key={step} className="team-deep-surface rounded-2xl p-4">
                    <div className="flex gap-4">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-700">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-7 text-slate-700">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="mt-14 team-divider pt-10">
            <SectionTitle
              eyebrow="Dispatch Breakdown"
              title="任务怎么分下去，谁分别干了什么"
              description="不仅看结论，还要看这次判断是如何拆成子任务，再分别落到不同角色身上的。"
            />

            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="team-card rounded-3xl p-6">
                <p className="team-eyebrow">任务分解</p>
                <div className="mt-4 space-y-4">
                  {entry.decomposition.map((item, index) => (
                    <div key={item.title} className="team-deep-surface rounded-2xl p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-xs font-semibold text-amber-700">
                          {index + 1}
                        </span>
                        <p className="text-sm font-semibold leading-6 text-slate-950">{item.title}</p>
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                          {ROLE_NAME_MAP[item.owner]}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="team-card rounded-3xl p-6">
                <p className="team-eyebrow">角色执行</p>
                <div className="mt-4 space-y-4">
                  {entry.execution.map((item) => (
                    <div key={`${item.role}-${item.task}`} className="team-deep-surface rounded-2xl p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                          {ROLE_NAME_MAP[item.role]}
                        </span>
                        <p className="text-sm font-semibold leading-6 text-slate-950">{item.task}</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.output}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="team-accent-surface mt-4 rounded-3xl p-6">
              <p className="team-eyebrow">最终汇总</p>
              <p className="mt-3 text-sm leading-7 text-slate-900">{entry.synthesis}</p>
            </div>
          </section>

          <section className="mt-14 team-divider pt-10">
            <SectionTitle
              eyebrow="Outcome Map"
              title="结果、采用版本与知识关联"
              description="除了结论本身，还要知道它最终落进了哪个版本，并与哪些页面和里程碑相互关联。"
            />
            <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
              <div className="team-accent-surface rounded-3xl p-6">
                <p className="team-eyebrow">结果 / 后续动作</p>
                <p className="mt-3 text-sm leading-7 text-slate-900">{entry.result}</p>
              </div>

              <div className="team-card rounded-3xl p-6">
                <div className="space-y-5">
                  <div>
                    <p className="team-eyebrow">最终采用版本</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{entry.adoptedVersion}</p>
                  </div>

                  <div>
                    <p className="team-eyebrow">关联页面</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.relatedPages.map((page) => (
                        <Link
                          key={page.href}
                          href={page.href}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
                        >
                          {page.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="team-eyebrow">关联角色</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.roles.map((roleId) => (
                        <span
                          key={roleId}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
                        >
                          {ROLE_NAME_MAP[roleId]}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="team-eyebrow">关联里程碑 / 标签</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.relatedMilestones.map((item) => (
                        <span
                          key={item}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${teamBadgeToneClass("product")}`}
                        >
                          {item}
                        </span>
                      ))}
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-14 team-divider pt-10">
            <SectionTitle
              eyebrow="Related Entries"
              title="相似问题推荐"
              description="根据共享标签、角色和里程碑推荐相近条目，方便沿着问题脉络继续查。"
            />

            {related.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/team/decisions/${item.archiveNo}`}
                    className="team-card rounded-3xl p-5 transition hover:-translate-y-0.5 hover:border-amber-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                        {item.archiveNo}
                      </span>
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.question}</p>
                    <p className="mt-4 text-sm font-semibold text-amber-700">查看详情 →</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="team-card rounded-3xl p-6">
                <p className="text-sm leading-6 text-slate-500">暂时没有足够接近的相似问题推荐。</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </TeamShell>
  );
}
