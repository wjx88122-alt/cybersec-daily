export type Severity = "critical" | "high" | "medium" | "low";
export type AlertSource = "EDR" | "NDR" | "SIEM" | "Cloud" | "Identity";

export type DshieldTopIpRecord = {
  rank: number | string;
  source: string;
  reports: number | string;
  targets: number | string;
};

export type DshieldTopPortRecord = {
  rank: number | string;
  targetport: number | string;
  records: number | string;
  targets: number | string;
  sources: number | string;
};

export type CisaKevRecord = {
  cveID: string;
  vendorProject?: string;
  product?: string;
  vulnerabilityName?: string;
  dateAdded?: string;
  shortDescription?: string;
  requiredAction?: string;
  knownRansomwareCampaignUse?: string;
};

export type CisaKevCatalog = {
  catalogVersion?: string;
  dateReleased?: string;
  vulnerabilities?: CisaKevRecord[];
};

export type AttackFeedAlert = {
  id: string;
  title: string;
  titleZh: string;
  source: AlertSource;
  sourceName: string;
  severity: Severity;
  timestamp: string;
  host: string;
  indicator: string;
  mitreTactic: string;
  mitreId: string;
  raw: string;
  rank?: number;
  reports?: number;
  targets?: number;
  confidence: number;
  url: string;
};

export type AttackPortPressure = {
  rank: number;
  port: number;
  service: string;
  labelZh: string;
  records: number;
  targets: number;
  sources: number;
  severity: Severity;
};

export type AttackSourceStatus = "online" | "degraded" | "offline";

export type AttackOperationsSnapshot = {
  updatedAt: string;
  infocon: string;
  topAttackers: AttackFeedAlert[];
  topPorts: AttackPortPressure[];
  kevHighlights: AttackFeedAlert[];
  alerts: AttackFeedAlert[];
  sources: {
    name: string;
    url: string;
    cadence: string;
    attribution: string;
  }[];
  sourceStatus: {
    dshield: AttackSourceStatus;
    cisaKev: AttackSourceStatus;
  };
  degraded: boolean;
  errors: string[];
};

type DshieldInfoconResponse = {
  status?: string;
};

const DSHIELD_TOP_IPS_URL = "https://isc.sans.edu/api/topips/records/8?json";
const DSHIELD_TOP_PORTS_URL = "https://isc.sans.edu/api/topports/records/8?json";
const DSHIELD_INFOCON_URL = "https://isc.sans.edu/api/infocon?json";
const CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
const FETCH_REVALIDATE_SECONDS = 300;
const REQUEST_HEADERS = {
  accept: "application/json",
  "user-agent": "cybersec-daily/1.0 contact=https://cybersec-daily.vercel.app",
};

const PORT_SERVICES: Record<number, string> = {
  22: "SSH",
  23: "Telnet",
  25: "SMTP",
  53: "DNS",
  68: "DHCP",
  80: "HTTP",
  135: "RPC",
  139: "NetBIOS",
  443: "HTTPS",
  445: "SMB",
  3389: "RDP",
  6379: "Redis",
  7680: "Windows DO",
  8000: "HTTP-alt",
  8080: "HTTP-alt",
  2222: "SSH",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function toIsoDate(value: unknown, fallback: string): string {
  if (typeof value !== "string" || value.trim() === "") return fallback;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : fallback;
}

function slugIndicator(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function extractArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!isRecord(payload)) return [];

  return Object.keys(payload)
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => payload[key] as T);
}

function severityForDshieldIp(reports: number, targets: number): Severity {
  if (reports >= 200_000 || targets >= 400) return "critical";
  if (reports >= 50_000 || targets >= 100) return "high";
  if (reports >= 5_000 || targets >= 20) return "medium";
  return "low";
}

function severityForDshieldPort(records: number, sources: number): Severity {
  if (records >= 200_000 || sources >= 10_000) return "critical";
  if (records >= 50_000 || sources >= 3_000) return "high";
  if (records >= 10_000 || sources >= 500) return "medium";
  return "low";
}

function severityForKev(vulnerability: CisaKevRecord): Severity {
  const action = vulnerability.requiredAction?.toLowerCase() ?? "";
  const ransomware = vulnerability.knownRansomwareCampaignUse?.toLowerCase() ?? "";
  if (ransomware === "known" || action.includes("discontinue")) return "critical";
  return "high";
}

export function normalizeDshieldTopIps(
  payload: unknown,
  observedAt: string,
): AttackFeedAlert[] {
  const alerts: AttackFeedAlert[] = [];

  for (const record of extractArrayPayload<DshieldTopIpRecord>(payload)) {
    const rank = toNumber(record.rank);
    const reports = toNumber(record.reports);
    const targets = toNumber(record.targets);
    const indicator = String(record.source ?? "").trim();

    if (!indicator) continue;

    const severity = severityForDshieldIp(reports, targets);
    alerts.push({
      id: `dshield-ip-${slugIndicator(indicator)}`,
      title: `DShield offensive source #${rank}: ${indicator}`,
      titleZh: `全球攻击源 #${rank}：${indicator}`,
      source: "NDR",
      sourceName: "SANS ISC DShield",
      severity,
      timestamp: observedAt,
      host: indicator,
      indicator,
      mitreTactic: "Reconnaissance / Initial Access",
      mitreId: "T1595",
      raw: `DShield Reports: ${formatNumber(reports)} · Targets: ${formatNumber(targets)}`,
      rank,
      reports,
      targets,
      confidence: 88,
      url: "https://isc.sans.edu/dashboard",
    });
  }

  return alerts.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
}

export function normalizeDshieldTopPorts(payload: unknown): AttackPortPressure[] {
  return extractArrayPayload<DshieldTopPortRecord>(payload)
    .map((record) => {
      const rank = toNumber(record.rank);
      const port = toNumber(record.targetport);
      const records = toNumber(record.records);
      const targets = toNumber(record.targets);
      const sources = toNumber(record.sources);
      const service = PORT_SERVICES[port] ?? `:${port}`;
      const severity = severityForDshieldPort(records, sources);

      return {
        rank,
        port,
        service,
        labelZh: `${service} 扫描热区`,
        records,
        targets,
        sources,
        severity,
      };
    })
    .filter((item) => item.port > 0)
    .sort((a, b) => a.rank - b.rank);
}

export function normalizeCisaKevCatalog(
  catalog: CisaKevCatalog,
  observedAt: string,
  limit = 4,
): AttackFeedAlert[] {
  return [...(catalog.vulnerabilities ?? [])]
    .sort((a, b) => Date.parse(b.dateAdded ?? "") - Date.parse(a.dateAdded ?? ""))
    .slice(0, limit)
    .map((vulnerability) => {
      const vendor = vulnerability.vendorProject?.trim() || "Unknown Vendor";
      const product = vulnerability.product?.trim() || "Unknown Product";
      const indicator = vulnerability.cveID.trim();
      const severity = severityForKev(vulnerability);
      const action = vulnerability.requiredAction?.trim();
      const description = vulnerability.shortDescription?.trim();

      return {
        id: `cisa-kev-${slugIndicator(indicator)}`,
        title: vulnerability.vulnerabilityName || `${indicator} exploited in the wild`,
        titleZh: `${vendor} ${product} 在野利用`,
        source: "SIEM" as AlertSource,
        sourceName: "CISA KEV",
        severity,
        timestamp: toIsoDate(vulnerability.dateAdded, observedAt),
        host: `${vendor}/${product}`,
        indicator,
        mitreTactic: "Initial Access",
        mitreId: "T1190",
        raw: [description, action ? `Required action: ${action}` : ""].filter(Boolean).join(" "),
        reports: undefined,
        targets: undefined,
        confidence: 92,
        url: CISA_KEV_URL,
      };
    });
}

export function buildAttackOperationsSnapshot(input: {
  observedAt: string;
  infocon?: string;
  topIps: unknown;
  topPorts: unknown;
  kevCatalog: CisaKevCatalog;
  errors?: string[];
}): AttackOperationsSnapshot {
  const topAttackers = normalizeDshieldTopIps(input.topIps, input.observedAt);
  const topPorts = normalizeDshieldTopPorts(input.topPorts);
  const kevHighlights = normalizeCisaKevCatalog(input.kevCatalog, input.observedAt);
  const errors = input.errors ?? [];

  return {
    updatedAt: input.observedAt,
    infocon: input.infocon?.trim() || "unknown",
    topAttackers,
    topPorts,
    kevHighlights,
    alerts: [...topAttackers.slice(0, 5), ...kevHighlights.slice(0, 3)],
    sources: [
      {
        name: "SANS Internet Storm Center / DShield",
        url: "https://isc.sans.edu/api/",
        cadence: "5 min API cache / public telemetry",
        attribution: "SANS Technology Institute, Internet Storm Center",
      },
      {
        name: "CISA Known Exploited Vulnerabilities",
        url: CISA_KEV_URL,
        cadence: "Official KEV catalog",
        attribution: "Cybersecurity and Infrastructure Security Agency",
      },
    ],
    sourceStatus: {
      dshield: topAttackers.length > 0 || topPorts.length > 0 ? "online" : "offline",
      cisaKev: kevHighlights.length > 0 ? "online" : "offline",
    },
    degraded: errors.length > 0,
    errors,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    next: { revalidate: FETCH_REVALIDATE_SECONDS },
  } as RequestInit & { next: { revalidate: number } });

  if (!response.ok) {
    throw new Error(`${url} responded ${response.status}`);
  }

  return (await response.json()) as T;
}

function settledValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

function settledError(label: string, result: PromiseSettledResult<unknown>): string | null {
  if (result.status === "fulfilled") return null;
  return `${label}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`;
}

export async function fetchAttackOperationsSnapshot(): Promise<AttackOperationsSnapshot> {
  const observedAt = new Date().toISOString();
  const [topIps, topPorts, infocon, kevCatalog] = await Promise.allSettled([
    fetchJson<unknown>(DSHIELD_TOP_IPS_URL),
    fetchJson<unknown>(DSHIELD_TOP_PORTS_URL),
    fetchJson<DshieldInfoconResponse>(DSHIELD_INFOCON_URL),
    fetchJson<CisaKevCatalog>(CISA_KEV_URL),
  ]);

  const errors = [
    settledError("DShield top IPs", topIps),
    settledError("DShield top ports", topPorts),
    settledError("DShield InfoCon", infocon),
    settledError("CISA KEV", kevCatalog),
  ].filter((error): error is string => error !== null);

  const snapshot = buildAttackOperationsSnapshot({
    observedAt,
    infocon: settledValue(infocon, {}).status,
    topIps: settledValue(topIps, []),
    topPorts: settledValue(topPorts, []),
    kevCatalog: settledValue(kevCatalog, { vulnerabilities: [] }),
    errors,
  });

  return {
    ...snapshot,
    sourceStatus: {
      dshield: topIps.status === "fulfilled" || topPorts.status === "fulfilled"
        ? snapshot.sourceStatus.dshield
        : "offline",
      cisaKev: kevCatalog.status === "fulfilled" ? snapshot.sourceStatus.cisaKev : "offline",
    },
  };
}
