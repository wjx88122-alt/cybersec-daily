"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ROLES } from "./data";
import type { DecisionArchiveEntry, RoleId } from "./data";

type ReplaySpeakerId = RoleId | "user";

type ReplayTurn = {
  id: string;
  speaker: ReplaySpeakerId;
  stage: string;
  label: string;
  text: string;
};

type ReplaySpeaker = {
  id: ReplaySpeakerId;
  name: string;
  role: string;
  avatarSrc?: string;
  accent: string;
  shortRole: string;
};

const ROLE_ACCENTS: Record<RoleId, string> = {
  chief: "from-[#e5ff00]/25 to-[#e5ff00]/5 border-[#e5ff00]/25",
  market: "from-violet-400/20 to-violet-400/5 border-violet-400/25",
  intel: "from-cyan-400/20 to-cyan-400/5 border-cyan-400/25",
  product: "from-blue-400/20 to-blue-400/5 border-blue-400/25",
  pmo: "from-emerald-400/20 to-emerald-400/5 border-emerald-400/25",
  field: "from-orange-400/20 to-orange-400/5 border-orange-400/25",
  studio: "from-pink-400/20 to-pink-400/5 border-pink-400/25",
};

const USER_SPEAKER: ReplaySpeaker = {
  id: "user",
  name: "你",
  role: "提问者",
  accent: "from-white/10 to-white/5 border-white/15",
  shortRole: "Question",
};

function getDecompositionLine(roleId: RoleId, detail: string) {
  const prefixMap: Record<RoleId, string> = {
    chief: "我先把这个问题重新框一下：",
    market: "我先从机会和窗口看：",
    intel: "我先把外部威胁和证据拆开：",
    product: "如果压成产品动作，我会这样拆：",
    pmo: "如果进入推进，我会按这个节奏拆：",
    field: "从一线成交和客户接受度看：",
    studio: "如果要讲得直观、能带走，我会先这样表述：",
  };

  return `${prefixMap[roleId]}${detail}`;
}

function getExecutionLine(roleId: RoleId, output: string) {
  const prefixMap: Record<RoleId, string> = {
    chief: "我先收一个主判断：",
    market: "从市场机会的角度，我的判断是：",
    intel: "从竞争和威胁视角，我看到的是：",
    product: "落到产品结构上，我建议：",
    pmo: "如果要推进落地，我会按这个结果组织：",
    field: "从一线打法和成交上，我的结论是：",
    studio: "如果要压成能直接讲出去的话，我会写成：",
  };

  return `${prefixMap[roleId]}${output}`;
}

function buildReplayTurns(entry: DecisionArchiveEntry): ReplayTurn[] {
  const turns: ReplayTurn[] = [
    {
      id: `${entry.id}-question`,
      speaker: "user",
      stage: "问题进入会议室",
      label: `提问时间：${entry.askedAt}`,
      text: entry.question,
    },
  ];

  const leadSpeaker = entry.decomposition[0]?.owner ?? entry.roles[0] ?? "chief";

  turns.push({
    id: `${entry.id}-opening`,
    speaker: leadSpeaker,
    stage: "先接住问题",
    label: "开场判断",
    text: "这个问题先别急着直接给结论，我们先把问题问对、把任务拆清，再决定最后怎么收口。",
  });

  entry.decomposition.forEach((item, index) => {
    turns.push({
      id: `${entry.id}-decompose-${index}`,
      speaker: item.owner,
      stage: item.title,
      label: "任务分解",
      text: getDecompositionLine(item.owner, item.detail),
    });
  });

  entry.execution.forEach((item, index) => {
    turns.push({
      id: `${entry.id}-execution-${index}`,
      speaker: item.role,
      stage: item.task,
      label: "角色执行",
      text: getExecutionLine(item.role, item.output),
    });
  });

  const answerSpeaker = entry.roles.includes("studio") ? "studio" : leadSpeaker;

  turns.push({
    id: `${entry.id}-answer`,
    speaker: answerSpeaker,
    stage: "形成团队回答",
    label: "正式口径",
    text: entry.answer,
  });

  turns.push({
    id: `${entry.id}-synthesis`,
    speaker: "chief",
    stage: "统一收口",
    label: "最终汇总",
    text: entry.synthesis,
  });

  turns.push({
    id: `${entry.id}-result`,
    speaker: "chief",
    stage: "落地结果",
    label: entry.adoptedVersion,
    text: entry.result,
  });

  return turns;
}

export default function DecisionDiscussionReplay({ entry }: { entry: DecisionArchiveEntry }) {
  const roleMap = useMemo(
    () =>
      Object.fromEntries(
        ROLES.map((role) => [
          role.id,
          {
            id: role.id,
            name: role.personaName,
            role: role.chineseName,
            avatarSrc: role.avatarSrc,
            accent: ROLE_ACCENTS[role.id],
            shortRole: role.shortLabel,
          } satisfies ReplaySpeaker,
        ]),
      ) as Record<RoleId, ReplaySpeaker>,
    [],
  );

  const participants = useMemo(() => {
    return [
      USER_SPEAKER,
      ...entry.roles
        .map((roleId) => roleMap[roleId])
        .filter((speaker, index, arr) => arr.findIndex((item) => item.id === speaker.id) === index),
    ];
  }, [entry.roles, roleMap]);

  const turns = useMemo(() => buildReplayTurns(entry), [entry]);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPlaying || turns.length <= 1) return;

    if (visibleCount >= turns.length) {
      const resetTimer = window.setTimeout(() => setVisibleCount(1), 2600);
      return () => window.clearTimeout(resetTimer);
    }

    const timer = window.setTimeout(() => {
      setVisibleCount((current) => Math.min(current + 1, turns.length));
    }, 1700);

    return () => window.clearTimeout(timer);
  }, [isPlaying, turns.length, visibleCount]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    root.scrollTo({ top: root.scrollHeight, behavior: "smooth" });
  }, [visibleCount]);

  const visibleTurns = turns.slice(0, visibleCount);
  const currentSpeaker = visibleTurns[visibleTurns.length - 1]?.speaker;
  const progress = turns.length > 1 ? ((visibleCount - 1) / (turns.length - 1)) * 100 : 100;

  return (
    <div className="glass glass-premium rounded-3xl p-6 sm:p-8">
      <div className="top-shine" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#e5ff00]/20 bg-[#e5ff00]/10 px-3 py-1 text-xs font-semibold text-[#e5ff00]">
            DISCUSSION REPLAY
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#94a3b8]">
            自动复现：谁先说、谁接着拆、谁最后收口
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((value) => !value)}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#dbe4ee] transition hover:border-white/20 hover:text-[#f0f6fc]"
          >
            {isPlaying ? "暂停" : "继续"}
          </button>
          <button
            type="button"
            onClick={() => {
              setVisibleCount(1);
              setIsPlaying(true);
            }}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#dbe4ee] transition hover:border-white/20 hover:text-[#f0f6fc]"
          >
            重播
          </button>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,rgba(96,165,250,0.95),rgba(229,255,0,0.95),rgba(34,197,94,0.95))] transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[280px_1fr]">
        <aside className="panel-deep rounded-3xl p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            参会角色
          </p>

          <div className="mt-4 space-y-3">
            {participants.map((speaker) => {
              const isActive = currentSpeaker === speaker.id;
              return (
                <div
                  key={speaker.id}
                  className={`rounded-2xl border bg-gradient-to-br px-3 py-3 transition-all ${speaker.accent} ${
                    isActive ? "scale-[1.02] shadow-[0_0_30px_rgba(229,255,0,0.12)]" : "opacity-75"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {speaker.avatarSrc ? (
                      <Image
                        src={speaker.avatarSrc}
                        alt={speaker.name}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-2xl border border-white/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-[#f0f6fc]">
                        你
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[#f0f6fc]">{speaker.name}</p>
                        {isActive && (
                          <span className="rounded-full border border-[#e5ff00]/20 bg-[#e5ff00]/10 px-2 py-0.5 text-[10px] font-semibold text-[#e5ff00]">
                            正在发言
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#94a3b8]">{speaker.role}</p>
                      <p className="mt-1 text-[11px] text-[#64748b]">{speaker.shortRole}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="panel-soft rounded-3xl p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/8 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                讨论现场
              </p>
              <p className="mt-1 text-sm text-[#94a3b8]">{entry.archiveNo} · {entry.title}</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#dbe4ee]">
              {visibleCount}/{turns.length} 段对话
            </div>
          </div>

          <div ref={containerRef} className="max-h-[720px] space-y-4 overflow-y-auto pr-1">
            {visibleTurns.map((turn) => {
              const speaker = turn.speaker === "user" ? USER_SPEAKER : roleMap[turn.speaker];
              const isUser = turn.speaker === "user";

              return (
                <div
                  key={turn.id}
                  className={`flex gap-3 transition-all duration-700 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                  style={{
                    opacity: 1,
                    transform: "translateY(0)",
                  }}
                >
                  {!isUser && (
                    speaker.avatarSrc ? (
                      <Image
                        src={speaker.avatarSrc}
                        alt={speaker.name}
                        width={48}
                        height={48}
                        className="mt-1 h-12 w-12 shrink-0 rounded-2xl border border-white/10 object-cover"
                      />
                    ) : null
                  )}

                  <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`mb-1 flex flex-wrap items-center gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                      <span className="text-sm font-semibold text-[#f0f6fc]">{speaker.name}</span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#94a3b8]">
                        {speaker.role}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[#64748b]">
                        {turn.label}
                      </span>
                    </div>

                    <div
                      className={`rounded-[22px] border px-4 py-3 text-sm leading-7 shadow-[0_18px_36px_rgba(0,0,0,0.12)] ${
                        isUser
                          ? "border-blue-400/20 bg-blue-500/10 text-[#f0f6fc]"
                          : `bg-gradient-to-br ${speaker.accent} text-[#dbe4ee]`
                      }`}
                    >
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                        {turn.stage}
                      </p>
                      <p>{turn.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
