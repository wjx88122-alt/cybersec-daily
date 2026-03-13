import Link from "next/link";
import { ARCHIVE_STATUS_LABELS, ROLE_NAME_MAP } from "./data";
import type {
  Role,
  DispatchCard,
  WeeklyNode,
  HistoryMilestone,
  DecisionCase,
  DecisionArchiveEntry,
} from "./data";

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
        <span className="h-px w-10 bg-gradient-to-r from-[#e5ff00] to-transparent" />
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#94a3b8]">
          {eyebrow}
        </p>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#f0f6fc] sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#94a3b8]">{description}</p>
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
      className="glass glass-premium mb-8 flex flex-wrap gap-2 rounded-2xl p-2"
    >
      {items.map((item) => {
        const isActive = active === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`min-w-[168px] rounded-xl border px-4 py-3 transition-all ${
              isActive
                ? "border-[#e5ff00]/25 bg-[#e5ff00]/10 text-[#f0f6fc] shadow-[0_0_24px_rgba(229,255,0,0.08)]"
                : "border-transparent bg-transparent text-[#94a3b8] hover:border-white/10 hover:bg-white/[0.03] hover:text-[#f0f6fc]"
            }`}
          >
            <div className="text-sm font-semibold">{item.label}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#64748b]">
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
  accentClass,
}: {
  value: string;
  label: string;
  accentClass: string;
}) {
  return (
    <div className="panel-deep rounded-2xl p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${accentClass}`}>{value}</p>
    </div>
  );
}

function RoleListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="panel-soft rounded-2xl p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
        {title}
      </p>
      <ul className="mt-3 space-y-2.5 text-sm leading-6 text-[#c9d1d9]">
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

  return (
    <article
      className={`glass glass-premium h-full rounded-[28px] p-5 transition-all hover:-translate-y-0.5 hover:border-black/[0.12] sm:p-6 ${
        isChief ? "border-[#e5ff00]/20 shadow-[0_0_40px_rgba(229,255,0,0.08)]" : ""
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 opacity-80 ${
          isChief
            ? "bg-[radial-gradient(circle_at_top,rgba(229,255,0,0.14),transparent_68%)]"
            : "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_68%)]"
        }`}
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[240px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              {role.emoji}
            </span>
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${role.accentClass}`}
            >
              {role.code}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
              推荐顺序 {role.order}
            </span>
            {isChief && (
              <span className="rounded-full border border-[#e5ff00]/20 bg-[#e5ff00]/10 px-2.5 py-1 text-[11px] font-semibold text-[#e5ff00]">
                默认入口
              </span>
            )}
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#dbe4ee]">
              {role.callName}
            </span>
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-[#f0f6fc]">{role.personaName}</h3>
          <p className="mt-1 text-sm text-[#dbe4ee]">{role.chineseName}</p>
          <p className="mt-1 text-sm text-[#94a3b8]">{role.shortLabel}</p>
        </div>
        <div className="flex flex-col items-end gap-3 sm:gap-4">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
            {role.phase}
          </span>
          <div className="rounded-[30px] border border-[#50f7ff]/20 bg-[linear-gradient(145deg,rgba(80,247,255,0.14),rgba(15,23,42,0.35))] p-1.5 shadow-[0_0_30px_rgba(80,247,255,0.14),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <img
              src={role.avatarSrc}
              alt={`${role.personaName} 头像`}
              className="h-32 w-32 rounded-[26px] border border-white/10 object-cover sm:h-36 sm:w-36"
            />
          </div>
          <p className="max-w-[190px] text-right text-xs leading-6 text-[#94a3b8]">
            {role.signatureLine}
          </p>
        </div>
      </div>

      <div className="relative mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel-soft rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            职业身份 / 角色画像
          </p>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#f0f6fc]">{role.identity}</p>
          <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{role.portrait}</p>
        </div>

        <div className="panel-deep rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            老板怎么叫他出场
          </p>
          <p className="mt-3 text-sm leading-6 text-[#dbe4ee]">{role.usage}</p>
          <div className="mt-4 border-t border-white/8 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
              角色标签
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {role.personalityTags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${role.accentClass}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        <div className="panel-soft rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            人格化设定
          </p>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#f0f6fc]">
            {role.personaName} · {role.callName}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
            他的记忆册叫「{role.memoryName}」。
          </p>
          <p className="mt-2 text-sm leading-6 text-[#dbe4ee]">
            签名句：{role.signatureLine}
          </p>
        </div>
        <div className="panel-soft rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            思考框架
          </p>
          <p className="mt-3 text-sm leading-6 text-[#dbe4ee]">{role.thinkingFramework}</p>
        </div>
        <div className="panel-soft rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            工作脑回路
          </p>
          <p className="mt-3 text-sm leading-6 text-[#dbe4ee]">{role.workingPattern}</p>
        </div>
        <div className="panel-soft rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            说话方式
          </p>
          <p className="mt-3 text-sm leading-6 text-[#dbe4ee]">{role.voiceStyle}</p>
        </div>
        <div className="panel-soft rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            常用提问
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#dbe4ee]">
            {role.commonQuestions.map((q) => (
              <li key={q} className="flex gap-2">
                <span className="text-[#64748b]">•</span>
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
    <article className="glass glass-premium rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-black/[0.12]">
      <h3 className="text-lg font-semibold text-[#f0f6fc]">{card.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{card.summary}</p>
      <ul className="mt-4 space-y-2.5 text-sm leading-6 text-[#dbe4ee]">
        {card.combos.map((item) => (
          <li key={item} className="panel-deep flex gap-2.5 rounded-xl p-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5ff00]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function WeeklyNodeCard({ node }: { node: WeeklyNode }) {
  return (
    <div className="panel-soft rounded-2xl p-5">
      <span
        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${node.accentClass}`}
      >
        {node.label}
      </span>
      <h3 className="mt-3 text-xl font-semibold text-[#f0f6fc]">{node.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#94a3b8]">{node.detail}</p>
    </div>
  );
}

export function TimelineCard({ milestone }: { milestone: HistoryMilestone }) {
  const categoryColors = {
    evolution: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    decision: "border-violet-500/30 bg-violet-500/10 text-violet-300",
    integration: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  };

  const categoryLabels = {
    evolution: "架构演进",
    decision: "关键决策",
    integration: "系统集成",
  };

  return (
    <article className="glass glass-premium rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-black/[0.12]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${categoryColors[milestone.category]}`}
        >
          {categoryLabels[milestone.category]}
        </span>
        <span className="text-xs text-[#64748b]">{milestone.date}</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-[#f0f6fc]">{milestone.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{milestone.description}</p>
    </article>
  );
}

export function DecisionCaseCard({ decisionCase }: { decisionCase: DecisionCase }) {
  return (
    <article className="glass glass-premium rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:border-black/[0.12]">
      <h3 className="text-xl font-semibold text-[#f0f6fc]">{decisionCase.title}</h3>

      <div className="mt-5 space-y-4">
        <div className="panel-soft rounded-xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            背景
          </p>
          <p className="mt-2 text-sm leading-6 text-[#dbe4ee]">{decisionCase.context}</p>
        </div>

        <div className="panel-accent rounded-xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            决策
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#f0f6fc]">{decisionCase.decision}</p>
        </div>

        <div className="panel-deep rounded-xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            理由
          </p>
          <p className="mt-2 text-sm leading-6 text-[#dbe4ee]">{decisionCase.rationale}</p>
        </div>

        <div className="panel-soft rounded-xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            结果
          </p>
          <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{decisionCase.outcome}</p>
        </div>
      </div>
    </article>
  );
}

export function DecisionArchiveCard({ entry }: { entry: DecisionArchiveEntry }) {
  return (
    <article className="glass glass-premium rounded-3xl p-6 transition-all hover:-translate-y-0.5 hover:border-black/[0.12]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/team/decisions/${entry.archiveNo}`}
              className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8] transition hover:border-white/20 hover:text-[#f0f6fc]"
            >
              {entry.archiveNo}
            </Link>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
              {entry.date}
            </span>
            <span className="panel-accent rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#f0f6fc]">
              {ARCHIVE_STATUS_LABELS[entry.status]}
            </span>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-[#f0f6fc]">
            <Link href={`/team/decisions/${entry.archiveNo}`} className="transition hover:text-[#e5ff00]">
              {entry.title}
            </Link>
          </h3>
          <p className="mt-2 text-sm text-[#94a3b8]">提问时间：{entry.askedAt}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {entry.roles.map((roleId) => (
            <span
              key={roleId}
              className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]"
            >
              {ROLE_NAME_MAP[roleId]}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="panel-soft rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            提问
          </p>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#f0f6fc]">{entry.question}</p>
        </div>

        <div className="panel-accent rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            团队回答
          </p>
          <p className="mt-3 text-sm leading-6 text-[#f0f6fc]">{entry.answer}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel-deep rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            公开决策过程
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-[#dbe4ee]">
            {entry.publicProcess.map((step) => (
              <li key={step} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5ff00]" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="panel-soft rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            任务分解
          </p>
          <div className="mt-3 space-y-3">
            {entry.decomposition.map((item) => (
              <div key={item.title} className="panel-deep rounded-xl p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold leading-6 text-[#f0f6fc]">{item.title}</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
                    {ROLE_NAME_MAP[item.owner]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-soft rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            角色执行
          </p>
          <div className="mt-3 space-y-3">
            {entry.execution.map((item) => (
              <div key={`${item.role}-${item.task}`} className="panel-deep rounded-xl p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#dbe4ee]">
                    {ROLE_NAME_MAP[item.role]}
                  </span>
                  <p className="text-sm font-semibold leading-6 text-[#f0f6fc]">{item.task}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#94a3b8]">{item.output}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 panel-deep rounded-2xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
          最终汇总
        </p>
        <p className="mt-3 text-sm leading-6 text-[#dbe4ee]">{entry.synthesis}</p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-accent rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            结果 / 后续动作
          </p>
          <p className="mt-3 text-sm leading-6 text-[#f0f6fc]">{entry.result}</p>
        </div>

        <div className="panel-soft rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            最终采用版本
          </p>
          <p className="mt-3 text-sm leading-6 text-[#dbe4ee]">{entry.adoptedVersion}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel-soft rounded-2xl p-4">
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

        <div className="panel-soft rounded-2xl p-4">
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

      <div className="mt-5 flex justify-end">
        <Link
          href={`/team/decisions/${entry.archiveNo}`}
          className="text-sm font-semibold text-[#e5ff00] transition hover:text-[#f5ff66]"
        >
          查看详情 →
        </Link>
      </div>
    </article>
  );
}
