import type { HistoryMilestone, RoleId } from "./data";

export type TeamAccentTone = RoleId;
export type TeamStatTone = TeamAccentTone | "neutral";
export type TeamShellGlowTone = "default" | "archive";

const TEAM_BADGE_TONE_CLASSES: Record<TeamAccentTone, string> = {
  chief: "border-amber-200 bg-amber-50 text-amber-700 shadow-[0_0_24px_rgba(234,179,8,0.12)]",
  market: "border-violet-200 bg-violet-50 text-violet-700",
  intel: "border-cyan-200 bg-cyan-50 text-cyan-700",
  product: "border-blue-200 bg-blue-50 text-blue-700",
  pmo: "border-orange-200 bg-orange-50 text-orange-700",
  field: "border-emerald-200 bg-emerald-50 text-emerald-700",
  studio: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
};

const TEAM_STAT_TONE_CLASSES: Record<TeamStatTone, string> = {
  neutral: "text-slate-950",
  chief: "text-amber-700",
  market: "text-violet-700",
  intel: "text-cyan-700",
  product: "text-blue-700",
  pmo: "text-orange-700",
  field: "text-emerald-700",
  studio: "text-fuchsia-700",
};

const TEAM_REPLAY_TONE_CLASSES: Record<TeamAccentTone, string> = {
  chief: "from-amber-100 via-white to-amber-50 border-amber-200",
  market: "from-violet-100 via-white to-violet-50 border-violet-200",
  intel: "from-cyan-100 via-white to-cyan-50 border-cyan-200",
  product: "from-blue-100 via-white to-blue-50 border-blue-200",
  pmo: "from-orange-100 via-white to-orange-50 border-orange-200",
  field: "from-emerald-100 via-white to-emerald-50 border-emerald-200",
  studio: "from-fuchsia-100 via-white to-fuchsia-50 border-fuchsia-200",
};

const TEAM_ROLE_AURA_CLASSES: Record<
  TeamAccentTone,
  { cardShadow: string; spotlight: string }
> = {
  chief: {
    cardShadow: "shadow-[0_28px_80px_rgba(234,179,8,0.12)]",
    spotlight: "bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_68%)]",
  },
  market: {
    cardShadow: "shadow-[0_28px_72px_rgba(139,92,246,0.1)]",
    spotlight: "bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.16),transparent_68%)]",
  },
  intel: {
    cardShadow: "shadow-[0_28px_72px_rgba(8,145,178,0.1)]",
    spotlight: "bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_68%)]",
  },
  product: {
    cardShadow: "shadow-[0_28px_72px_rgba(37,99,235,0.1)]",
    spotlight: "bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.16),transparent_68%)]",
  },
  pmo: {
    cardShadow: "shadow-[0_28px_72px_rgba(234,88,12,0.1)]",
    spotlight: "bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.16),transparent_68%)]",
  },
  field: {
    cardShadow: "shadow-[0_28px_72px_rgba(5,150,105,0.1)]",
    spotlight: "bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.16),transparent_68%)]",
  },
  studio: {
    cardShadow: "shadow-[0_28px_72px_rgba(192,38,211,0.1)]",
    spotlight: "bg-[radial-gradient(circle_at_top,rgba(232,121,249,0.16),transparent_68%)]",
  },
};

const TEAM_TIMELINE_CATEGORY_TONES: Record<HistoryMilestone["category"], TeamAccentTone> = {
  evolution: "product",
  decision: "market",
  integration: "field",
};

const TEAM_TIMELINE_CATEGORY_LABELS: Record<HistoryMilestone["category"], string> = {
  evolution: "架构演进",
  decision: "关键决策",
  integration: "系统集成",
};

const TEAM_SHELL_GLOW_CLASSES: Record<TeamShellGlowTone, string> = {
  default: "team-shell--glow-default",
  archive: "team-shell--glow-archive",
};

export function teamBadgeToneClass(tone: TeamAccentTone) {
  return TEAM_BADGE_TONE_CLASSES[tone];
}

export function teamStatToneClass(tone: TeamStatTone) {
  return TEAM_STAT_TONE_CLASSES[tone];
}

export function teamReplayToneClass(tone: TeamAccentTone) {
  return TEAM_REPLAY_TONE_CLASSES[tone];
}

export function teamRoleAura(tone: TeamAccentTone) {
  return TEAM_ROLE_AURA_CLASSES[tone];
}

export function teamTimelineToneClass(category: HistoryMilestone["category"]) {
  return teamBadgeToneClass(TEAM_TIMELINE_CATEGORY_TONES[category]);
}

export function teamTimelineToneLabel(category: HistoryMilestone["category"]) {
  return TEAM_TIMELINE_CATEGORY_LABELS[category];
}

export function teamShellGlowClass(glowTone: TeamShellGlowTone) {
  return TEAM_SHELL_GLOW_CLASSES[glowTone];
}
