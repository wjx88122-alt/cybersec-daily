import Image from "next/image";
import Link from "next/link";
import { ARCHIVE_STATUS_LABELS, ROLE_NAME_MAP } from "./data";
import {
  teamBadgeToneClass,
  teamRoleAura,
  teamStatToneClass,
  teamTimelineToneClass,
  teamTimelineToneLabel,
} from "./theme";
import type {
  Role,
  DispatchCard,
  WeeklyNode,
  HistoryMilestone,
  DecisionCase,
  DecisionArchiveEntry,
} from "./data";
import type { TeamStatTone } from "./theme";

export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <span className="h-px w-12 bg-gradient-to-r from-slate-400 to-transparent" />
        <p className="team-eyebrow">
          {eyebrow}
        </p>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}

export function TeamTabs({ active }: { active: "overview" | "evolution" | "decisions" }) {
  const items = [
    { id: "overview", href: "/team", label: "团队总览", note: "Roster / Dispatch" },
    { id: "evolution", href: "/team/history", label: "进化历程", note: "Timeline / Milestones" },
    { id: "decisions", href: "/team/decisions", label: "决策档案", note: "Questions / Results" },
  ] as const;

  return (
    <nav
      aria-label="Team sections"
      className="team-card mb-8 flex flex-wrap gap-2 rounded-[24px] p-2.5"
    >
      {items.map((item) => {
        const isActive = active === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`min-w-[168px] rounded-[18px] border px-4 py-3 transition-all ${
              isActive
                ? "border-slate-200 bg-white text-slate-950 shadow-[0_14px_36px_rgba(15,23,42,0.08)]"
                : "border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-white/70 hover:text-slate-900"
            }`}
          >
            <div className="text-sm font-semibold">{item.label}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              {item.note}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function StatCard({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: TeamStatTone;
}) {
  return (
    <div className="team-deep-surface rounded-[20px] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${teamStatToneClass(tone)}`}>{value}</p>
    </div>
  );
}

function RoleListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="team-soft-surface rounded-[20px] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <ul className="mt-3 space-y-2.5 text-sm leading-7 text-slate-700">
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

export function RoleCard({ role }: { role: Role }) {
  const isChief = role.id === "chief";
  const roleAura = teamRoleAura(role.tone);

  return (
    <article
      className={`team-card h-full rounded-[30px] p-5 transition-all hover:-translate-y-1 sm:p-6 ${roleAura.cardShadow}`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-28 opacity-90 ${roleAura.spotlight}`}
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[240px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              {role.emoji}
            </span>
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${teamBadgeToneClass(role.tone)}`}
            >
              {role.code}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
              推荐顺序 {role.order}
            </span>
            {isChief && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                默认入口
              </span>
            )}
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">
              {role.callName}
            </span>
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">{role.personaName}</h3>
          <p className="mt-1 text-sm text-slate-800">{role.chineseName}</p>
          <p className="mt-1 text-sm text-slate-500">{role.shortLabel}</p>
        </div>
        <div className="flex flex-col items-end gap-3 sm:gap-4">
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
            {role.phase}
          </span>
          <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(237,242,247,0.95))] p-1.5 shadow-[0_20px_48px_rgba(15,23,42,0.08)]">
            <Image
              src={role.avatarSrc}
              alt={`${role.personaName} 头像`}
              width={192}
              height={192}
              className="h-40 w-40 rounded-[28px] border border-white/70 object-cover sm:h-48 sm:w-48"
            />
          </div>
          <p className="max-w-[190px] text-right text-xs leading-6 text-slate-500">
            {role.signatureLine}
          </p>
        </div>
      </div>

      <div className="relative mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="team-soft-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            职业身份 / 角色画像
          </p>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-950">{role.identity}</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{role.portrait}</p>
        </div>

        <div className="team-deep-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            老板怎么叫他出场
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{role.usage}</p>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              角色标签
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {role.personalityTags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${teamBadgeToneClass(role.tone)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        <div className="team-soft-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            人格化设定
          </p>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-950">
            {role.personaName} · {role.callName}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            他的记忆册叫「{role.memoryName}」。
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            签名句：{role.signatureLine}
          </p>
        </div>
        <div className="team-soft-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            思考框架
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{role.thinkingFramework}</p>
        </div>
        <div className="team-soft-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            工作脑回路
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{role.workingPattern}</p>
        </div>
        <div className="team-soft-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            说话方式
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{role.voiceStyle}</p>
        </div>
        <div className="team-soft-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            常用提问
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
            {role.commonQuestions.map((q) => (
              <li key={q} className="flex gap-2">
                <span className="text-slate-400">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <RoleListBlock title="擅长处理的问题" items={role.strengths} />
        <RoleListBlock title="边界 / 不适合处理的问题" items={role.boundaries} />
      </div>
    </article>
  );
}

export function DispatchCardView({ card }: { card: DispatchCard }) {
  return (
    <article className="team-card rounded-[24px] p-5 transition-all hover:-translate-y-1">
      <h3 className="text-lg font-semibold text-slate-950">{card.title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{card.summary}</p>
      <ul className="mt-4 space-y-2.5 text-sm leading-7 text-slate-700">
        {card.combos.map((item) => (
          <li key={item} className="team-deep-surface flex gap-2.5 rounded-[18px] p-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function WeeklyNodeCard({ node }: { node: WeeklyNode }) {
  return (
    <div className="team-soft-surface rounded-[22px] p-5">
      <span
        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${teamBadgeToneClass(node.tone)}`}
      >
        {node.label}
      </span>
      <h3 className="mt-3 text-xl font-semibold text-slate-950">{node.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{node.detail}</p>
    </div>
  );
}

export function TimelineCard({ milestone }: { milestone: HistoryMilestone }) {
  return (
    <article className="team-card rounded-[24px] p-5 transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${teamTimelineToneClass(milestone.category)}`}
        >
          {teamTimelineToneLabel(milestone.category)}
        </span>
        <span className="text-xs text-slate-500">{milestone.date}</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-slate-950">{milestone.title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{milestone.description}</p>
    </article>
  );
}

export function DecisionCaseCard({ decisionCase }: { decisionCase: DecisionCase }) {
  return (
    <article className="team-card rounded-[26px] p-6 transition-all hover:-translate-y-1">
      <h3 className="text-xl font-semibold text-slate-950">{decisionCase.title}</h3>

      <div className="mt-5 space-y-4">
        <div className="team-soft-surface rounded-[18px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            背景
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{decisionCase.context}</p>
        </div>

        <div className="team-accent-surface rounded-[18px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            决策
          </p>
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-950">{decisionCase.decision}</p>
        </div>

        <div className="team-deep-surface rounded-[18px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            理由
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{decisionCase.rationale}</p>
        </div>

        <div className="team-soft-surface rounded-[18px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            结果
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{decisionCase.outcome}</p>
        </div>
      </div>
    </article>
  );
}

export function DecisionArchiveCard({ entry }: { entry: DecisionArchiveEntry }) {
  return (
    <article className="team-card rounded-[30px] p-6 transition-all hover:-translate-y-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/team/decisions/${entry.archiveNo}`}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            >
              {entry.archiveNo}
            </Link>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
              {entry.date}
            </span>
            <span className="team-accent-surface rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-900">
              {ARCHIVE_STATUS_LABELS[entry.status]}
            </span>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-950">
            <Link href={`/team/decisions/${entry.archiveNo}`} className="transition hover:text-slate-700">
              {entry.title}
            </Link>
          </h3>
          <p className="mt-2 text-sm text-slate-500">提问时间：{entry.askedAt}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {entry.roles.map((roleId) => (
            <span
              key={roleId}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500"
            >
              {ROLE_NAME_MAP[roleId]}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="team-soft-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            提问
          </p>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-950">{entry.question}</p>
        </div>

        <div className="team-accent-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            团队回答
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-900">{entry.answer}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="team-deep-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            公开决策过程
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
            {entry.publicProcess.map((step) => (
              <li key={step} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="team-soft-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            任务分解
          </p>
          <div className="mt-3 space-y-3">
            {entry.decomposition.map((item) => (
              <div key={item.title} className="team-deep-surface rounded-[18px] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold leading-7 text-slate-950">{item.title}</p>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500">
                    {ROLE_NAME_MAP[item.owner]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="team-soft-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            角色执行
          </p>
          <div className="mt-3 space-y-3">
            {entry.execution.map((item) => (
              <div key={`${item.role}-${item.task}`} className="team-deep-surface rounded-[18px] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">
                    {ROLE_NAME_MAP[item.role]}
                  </span>
                  <p className="text-sm font-semibold leading-7 text-slate-950">{item.task}</p>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.output}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 team-deep-surface rounded-[20px] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          最终汇总
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-700">{entry.synthesis}</p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="team-accent-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            结果 / 后续动作
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-900">{entry.result}</p>
        </div>

        <div className="team-soft-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            最终采用版本
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{entry.adoptedVersion}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="team-soft-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            关联页面
          </p>
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

        <div className="team-soft-surface rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            关联里程碑 / 标签
          </p>
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

      <div className="mt-5 flex justify-end">
        <Link
          href={`/team/decisions/${entry.archiveNo}`}
          className="text-sm font-semibold text-slate-900 transition hover:text-slate-700"
        >
          查看详情 →
        </Link>
      </div>
    </article>
  );
}
