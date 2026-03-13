import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import {
  ARCHIVE_STATUS_LABELS,
  ROLE_NAME_MAP,
  getDecisionArchiveEntry,
  getRelatedDecisionEntries,
} from "../../data";
import { SectionTitle, TeamTabs } from "../../components";
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
    <div className="team-shell min-h-screen overflow-hidden">
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
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/team/decisions"
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#94a3b8] transition hover:border-white/20 hover:text-[#f0f6fc]"
              >
                ← 返回决策档案
              </Link>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#94a3b8]">
                {entry.archiveNo}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#94a3b8]">
                {entry.date}
              </span>
              <span className="panel-accent rounded-full px-3 py-1 text-xs font-semibold text-[#f0f6fc]">
                {ARCHIVE_STATUS_LABELS[entry.status]}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold leading-tight text-[#f0f6fc] sm:text-5xl">
              {entry.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#94a3b8]">提问时间：{entry.askedAt}</p>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="panel-soft rounded-2xl p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                  你的问题
                </p>
                <p className="mt-3 text-lg font-semibold leading-7 text-[#f0f6fc]">{entry.question}</p>
              </div>

              <div className="panel-accent rounded-2xl p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                  团队回答
                </p>
                <p className="mt-3 text-sm leading-7 text-[#f0f6fc]">{entry.answer}</p>
              </div>
            </div>
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Discussion Replay"
              title="拟人化复现他们讨论这件事的过程"
              description="每个角色都以名字、身份和头像出场，按真实分工顺序自动发言，让你直观看到是谁先接住问题、谁负责拆解、谁给出判断、谁最后统一收口。"
            />

            <DecisionDiscussionReplay entry={entry} />
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Process"
              title="团队如何做出这个回答"
              description="这里保留公开可复用的形成过程，便于未来复用，不展示隐藏推理链路。"
            />
            <div className="glass glass-premium rounded-3xl p-6">
              <div className="top-shine" />
              <ol className="space-y-4">
                {entry.publicProcess.map((step, index) => (
                  <li key={step} className="panel-deep rounded-2xl p-4">
                    <div className="flex gap-4">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e5ff00]/20 bg-[#e5ff00]/10 text-sm font-semibold text-[#e5ff00]">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-7 text-[#dbe4ee]">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Dispatch"
              title="任务怎么分下去，谁分别干了什么"
              description="不仅看结论，还要看这次判断是如何拆成子任务，再分别落到不同角色身上的。"
            />

            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="glass glass-premium rounded-3xl p-6">
                <div className="top-shine" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                  任务分解
                </p>
                <div className="mt-4 space-y-4">
                  {entry.decomposition.map((item, index) => (
                    <div key={item.title} className="panel-deep rounded-2xl p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#e5ff00]/20 bg-[#e5ff00]/10 text-xs font-semibold text-[#e5ff00]">
                          {index + 1}
                        </span>
                        <p className="text-sm font-semibold leading-6 text-[#f0f6fc]">{item.title}</p>
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
                          {ROLE_NAME_MAP[item.owner]}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#94a3b8]">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass glass-premium rounded-3xl p-6">
                <div className="top-shine" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                  角色执行
                </p>
                <div className="mt-4 space-y-4">
                  {entry.execution.map((item) => (
                    <div key={`${item.role}-${item.task}`} className="panel-deep rounded-2xl p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#dbe4ee]">
                          {ROLE_NAME_MAP[item.role]}
                        </span>
                        <p className="text-sm font-semibold leading-6 text-[#f0f6fc]">{item.task}</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[#94a3b8]">{item.output}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel-accent mt-4 rounded-3xl p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                最终汇总
              </p>
              <p className="mt-3 text-sm leading-7 text-[#f0f6fc]">{entry.synthesis}</p>
            </div>
          </section>

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Outcome"
              title="结果、采用版本与知识关联"
              description="除了结论本身，还要知道它最终落进了哪个版本，并与哪些页面和里程碑相互关联。"
            />
            <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
              <div className="panel-accent rounded-3xl p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                  结果 / 后续动作
                </p>
                <p className="mt-3 text-sm leading-7 text-[#f0f6fc]">{entry.result}</p>
              </div>

              <div className="glass glass-premium rounded-3xl p-6">
                <div className="top-shine" />
                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                      最终采用版本
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#dbe4ee]">{entry.adoptedVersion}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                      关联页面
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.relatedPages.map((page) => (
                        <Link
                          key={page.href}
                          href={page.href}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#dbe4ee] transition hover:border-white/20 hover:text-[#f0f6fc]"
                        >
                          {page.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                      关联角色
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.roles.map((roleId) => (
                        <span
                          key={roleId}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#dbe4ee]"
                        >
                          {ROLE_NAME_MAP[roleId]}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                      关联里程碑 / 标签
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.relatedMilestones.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-200"
                        >
                          {item}
                        </span>
                      ))}
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#dbe4ee]"
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

          <section className="mt-14 border-t border-white/6 pt-10">
            <SectionTitle
              eyebrow="Related"
              title="相似问题推荐"
              description="根据共享标签、角色和里程碑推荐相近条目，方便沿着问题脉络继续查。"
            />

            {related.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/team/decisions/${item.archiveNo}`}
                    className="glass glass-premium rounded-3xl p-5 transition hover:-translate-y-0.5 hover:border-[#e5ff00]/20"
                  >
                    <div className="top-shine" />
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
                        {item.archiveNo}
                      </span>
                      <span className="text-xs text-[#64748b]">{item.date}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-[#f0f6fc]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#94a3b8] line-clamp-3">{item.question}</p>
                    <p className="mt-4 text-sm font-semibold text-[#e5ff00]">查看详情 →</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="glass glass-premium rounded-3xl p-6">
                <div className="top-shine" />
                <p className="text-sm leading-6 text-[#94a3b8]">暂时没有足够接近的相似问题推荐。</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
