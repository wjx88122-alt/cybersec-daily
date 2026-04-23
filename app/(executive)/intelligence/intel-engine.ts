import type { ExposureData, IntelligenceCommandCenterData } from "@/app/(executive)/intelligence/data";

export type SurfaceScope = "all" | "easm" | "iasm";

const VERDICT_WEIGHTS = {
  relevance: 0.28,
  exploitability: 0.24,
  exposure: 0.2,
  operations: 0.16,
  confidence: 0.12,
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function scoreToNumber(value: string | number | undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function inferSurface(scope: string) {
  const text = scope.toLowerCase();
  if (text.includes("公网") || text.includes("internet") || text.includes("边界")) return "EASM";
  return "IASM";
}

export function filterExposureBySurface(rows: ExposureData["rows"], scope: SurfaceScope = "all") {
  const normalizedRows = rows.map((row) => ({
    ...row,
    surface: (row.surface ?? inferSurface(row.scope)) as "EASM" | "IASM",
  }));

  if (scope === "all") return normalizedRows;

  const target = scope.toUpperCase();
  return normalizedRows.filter((row) => row.surface === target);
}

export function buildSurfaceStats(rows: ExposureData["rows"]) {
  const all = filterExposureBySurface(rows, "all");
  return {
    all: all.length,
    easm: all.filter((row) => row.surface === "EASM").length,
    iasm: all.filter((row) => row.surface === "IASM").length,
  };
}

function computeConfidence(data: IntelligenceCommandCenterData) {
  if (!data.intake.connectors.length) return 0.65;
  const avg =
    data.intake.connectors.reduce((sum, c) => sum + (Number.isFinite(c.confidence) ? c.confidence : 0.7), 0) /
    data.intake.connectors.length;
  return clamp(avg);
}

export function computeUnifiedVerdict(
  data: IntelligenceCommandCenterData,
  options: { surfaceScope?: SurfaceScope; activeFilters?: string[]; actionFeedSize?: number } = {},
) {
  const activeFilters = options.activeFilters ?? [];
  const rows = filterExposureBySurface(data.exposures.rows, options.surfaceScope ?? "all");

  const highPriorityCampaigns = data.campaigns.timeline.filter((item) =>
    ["critical", "warning"].includes(item.badgeTone),
  ).length;
  const relevance = clamp(
    highPriorityCampaigns / Math.max(data.campaigns.timeline.length, 1) +
      (activeFilters.includes("高相关") ? 0.12 : 0),
  );

  const exploited = rows.filter((row) => {
    const note = row.findingNote.toLowerCase();
    return note.includes("利用") || note.includes("exploit");
  }).length;
  const exploitability = clamp(exploited / Math.max(rows.length, 1));

  const avgExposure = rows.reduce((sum, row) => sum + scoreToNumber(row.scorePercent ?? row.score), 0) / Math.max(rows.length, 1);
  const exposure = clamp(avgExposure / 100);

  const operationalSignals =
    data.hunts.cards.reduce((sum, card) => sum + card.actions.length, 0) +
    data.playbooks.cards.filter((card) => ["critical", "warning", "danger"].includes(card.badgeTone)).length +
    Math.min(options.actionFeedSize ?? 0, 6);
  const operations = clamp(operationalSignals / 24);

  const confidence = computeConfidence(data);

  const total =
    relevance * VERDICT_WEIGHTS.relevance +
    exploitability * VERDICT_WEIGHTS.exploitability +
    exposure * VERDICT_WEIGHTS.exposure +
    operations * VERDICT_WEIGHTS.operations +
    confidence * VERDICT_WEIGHTS.confidence;

  return {
    total: Math.round(clamp(total) * 100),
    factors: [
      { label: "威胁相关性", score: Math.round(relevance * 100) },
      { label: "利用活跃度", score: Math.round(exploitability * 100) },
      { label: "暴露可达性", score: Math.round(exposure * 100) },
      { label: "处置可执行度", score: Math.round(operations * 100) },
      { label: "证据置信度", score: Math.round(confidence * 100) },
    ],
    metadata: {
      scope: (options.surfaceScope ?? "all").toUpperCase(),
      activeFilters,
    },
  };
}

export function normalizeIntakePayload(input: {
  format: "csv" | "json" | "stix";
  source: string;
  freshness: string;
  confidence: number;
  payload: string;
}) {
  const confidence = clamp(scoreToNumber(input.confidence), 0, 1);
  const metadata = {
    source: input.source,
    freshness: input.freshness,
    confidence,
  };

  const normalize = (record: Record<string, unknown>) => {
    const indicator = String(record.indicator ?? record.value ?? "").trim();
    const type = String(record.type ?? record.indicatorType ?? "").trim();
    if (!indicator || !type) return null;
    return { indicator, type, ...metadata };
  };

  try {
    if (input.format === "csv") {
      const lines = input.payload.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      if (lines.length <= 1) return { ok: true, records: [] as Array<Record<string, unknown>> };
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const records = lines
        .slice(1)
        .map((line) => {
          const cells = line.split(",").map((cell) => cell.trim());
          const row: Record<string, unknown> = {};
          headers.forEach((header, index) => {
            row[header] = cells[index] ?? "";
          });
          return normalize(row);
        })
        .filter((row) => row !== null);
      return { ok: true, records };
    }

    const parsed = JSON.parse(input.payload);
    const source: Array<Record<string, unknown>> = (Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { objects?: unknown[] }).objects)
        ? (parsed as { objects: unknown[] }).objects
        : []) as Array<Record<string, unknown>>;
    const records = source
      .map((record: Record<string, unknown>) => normalize(record))
      .filter((row) => row !== null);
    return { ok: true, records };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      records: [] as Array<Record<string, unknown>>,
    };
  }
}
