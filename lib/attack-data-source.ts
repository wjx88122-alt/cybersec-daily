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
  countryCode?: string;
  countryName?: string;
  asn?: number;
  asName?: string;
  network?: string;
  lat?: number;
  lon?: number;
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

export type ThreatMapLocation = {
  city: string;
  countryCode: string;
  countryName: string;
  lat: number;
  lon: number;
};

export type DshieldIpIntelligence = {
  countryCode?: string;
  countryName?: string;
  asn?: number;
  asName?: string;
  network?: string;
};

export type ThreatMapEvent = {
  id: string;
  source: ThreatMapLocation & {
    ip: string;
    asn?: number;
    asName?: string;
    network?: string;
  };
  destination: ThreatMapLocation;
  severity: Severity;
  category: string;
  summaryZh: string;
  detailZh: string;
  reports: number;
  targets: number;
  confidence: number;
  observedAt: string;
  sourceName: string;
  sourceUrl: string;
};

export type AttackSourceStatus = "online" | "degraded" | "offline";

export type AttackOperationsSnapshot = {
  updatedAt: string;
  infocon: string;
  topAttackers: AttackFeedAlert[];
  topPorts: AttackPortPressure[];
  kevHighlights: AttackFeedAlert[];
  mapEvents: ThreatMapEvent[];
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

type DshieldIpResponse = {
  ip?: {
    number?: string;
    as?: number | string;
    asname?: string;
    ascountry?: string;
    network?: string;
  };
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

const COUNTRY_CENTROIDS: Record<string, Omit<ThreatMapLocation, "city"> & { city: string }> = {
  AE: { city: "Dubai", countryCode: "AE", countryName: "United Arab Emirates", lat: 25.2, lon: 55.3 },
  AU: { city: "Sydney", countryCode: "AU", countryName: "Australia", lat: -33.9, lon: 151.2 },
  BR: { city: "Sao Paulo", countryCode: "BR", countryName: "Brazil", lat: -23.6, lon: -46.6 },
  CA: { city: "Toronto", countryCode: "CA", countryName: "Canada", lat: 43.7, lon: -79.4 },
  CN: { city: "Beijing", countryCode: "CN", countryName: "China", lat: 39.9, lon: 116.4 },
  DE: { city: "Frankfurt", countryCode: "DE", countryName: "Germany", lat: 50.1, lon: 8.7 },
  ES: { city: "Madrid", countryCode: "ES", countryName: "Spain", lat: 40.46, lon: -3.75 },
  FR: { city: "Paris", countryCode: "FR", countryName: "France", lat: 48.9, lon: 2.3 },
  GB: { city: "London", countryCode: "GB", countryName: "United Kingdom", lat: 51.5, lon: -0.1 },
  HK: { city: "Hong Kong", countryCode: "HK", countryName: "Hong Kong", lat: 22.3, lon: 114.2 },
  ID: { city: "Jakarta", countryCode: "ID", countryName: "Indonesia", lat: -6.2, lon: 106.8 },
  IN: { city: "Mumbai", countryCode: "IN", countryName: "India", lat: 19.1, lon: 72.9 },
  IR: { city: "Tehran", countryCode: "IR", countryName: "Iran", lat: 35.7, lon: 51.4 },
  JP: { city: "Tokyo", countryCode: "JP", countryName: "Japan", lat: 35.7, lon: 139.7 },
  KR: { city: "Seoul", countryCode: "KR", countryName: "South Korea", lat: 37.6, lon: 127 },
  NL: { city: "Amsterdam", countryCode: "NL", countryName: "Netherlands", lat: 52.4, lon: 4.9 },
  PL: { city: "Warsaw", countryCode: "PL", countryName: "Poland", lat: 52.2, lon: 21 },
  RU: { city: "Moscow", countryCode: "RU", countryName: "Russia", lat: 55.8, lon: 37.6 },
  SC: { city: "Victoria", countryCode: "SC", countryName: "Seychelles", lat: -4.62, lon: 55.45 },
  SG: { city: "Singapore", countryCode: "SG", countryName: "Singapore", lat: 1.3, lon: 103.8 },
  TR: { city: "Istanbul", countryCode: "TR", countryName: "Turkey", lat: 41, lon: 29 },
  TW: { city: "Taipei", countryCode: "TW", countryName: "Taiwan", lat: 25, lon: 121.5 },
  UA: { city: "Kyiv", countryCode: "UA", countryName: "Ukraine", lat: 50.45, lon: 30.52 },
  US: { city: "Ashburn", countryCode: "US", countryName: "United States", lat: 39.04, lon: -77.49 },
  VN: { city: "Hanoi", countryCode: "VN", countryName: "Vietnam", lat: 21.03, lon: 105.85 },
  ZA: { city: "Johannesburg", countryCode: "ZA", countryName: "South Africa", lat: -26.2, lon: 28 },
  ZZ: { city: "Unknown", countryCode: "ZZ", countryName: "Unknown", lat: 20, lon: 0 },
};

const PROTECTED_LOCATIONS: ThreatMapLocation[] = [
  { city: "Nanjing", countryCode: "CN", countryName: "China", lat: 32.1, lon: 118.8 },
  { city: "Shanghai", countryCode: "CN", countryName: "China", lat: 31.2, lon: 121.5 },
  { city: "Singapore", countryCode: "SG", countryName: "Singapore", lat: 1.3, lon: 103.8 },
  { city: "Tokyo", countryCode: "JP", countryName: "Japan", lat: 35.7, lon: 139.7 },
  { city: "Sydney", countryCode: "AU", countryName: "Australia", lat: -33.9, lon: 151.2 },
];

const CISA_LOCATION: ThreatMapLocation = {
  city: "Washington",
  countryCode: "US",
  countryName: "United States",
  lat: 38.9,
  lon: -77,
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

function normalizeCountryCode(value?: string): string {
  const code = value?.trim().toUpperCase() ?? "";
  return /^[A-Z]{2}$/.test(code) ? code : "ZZ";
}

function countryLocation(countryCode?: string): ThreatMapLocation {
  const code = normalizeCountryCode(countryCode);
  return COUNTRY_CENTROIDS[code] ?? {
    ...COUNTRY_CENTROIDS.ZZ,
    countryCode: code,
    countryName: code === "ZZ" ? "Unknown" : code,
  };
}

function destinationForRank(rank?: number): ThreatMapLocation {
  const index = Math.max((rank ?? 1) - 1, 0) % PROTECTED_LOCATIONS.length;
  return PROTECTED_LOCATIONS[index];
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

export function buildDshieldMapEvents(
  attackers: AttackFeedAlert[],
  intelligenceByIp: Record<string, DshieldIpIntelligence> = {},
): ThreatMapEvent[] {
  return attackers
    .slice(0, 8)
    .map((attacker) => {
      const intelligence = intelligenceByIp[attacker.indicator] ?? {};
      const countryCode = normalizeCountryCode(intelligence.countryCode ?? attacker.countryCode);
      const sourceLocation = countryLocation(countryCode);
      const destination = destinationForRank(attacker.rank);
      const reports = attacker.reports ?? 0;
      const targets = attacker.targets ?? 0;
      const asName = intelligence.asName ?? attacker.asName;
      const asn = intelligence.asn ?? attacker.asn;
      const network = intelligence.network ?? attacker.network;
      const sourceName = asName
        ? `${asName}${asn ? ` / AS${asn}` : ""}`
        : countryCode === "ZZ"
          ? "未标注自治系统"
          : `${sourceLocation.countryName} 网络`;

      return {
        id: `map-${attacker.id}`,
        source: {
          ...sourceLocation,
          ip: attacker.indicator,
          asn,
          asName,
          network,
        },
        destination,
        severity: attacker.severity,
        category: targets >= 100 ? "多目标扫描" : "高频攻击源",
        summaryZh: `DShield #${attacker.rank} 攻击源 ${attacker.indicator} 正在触达 ${destination.city} 防护面`,
        detailZh: `${sourceName} · ${formatNumber(reports)} reports · ${formatNumber(targets)} targets`,
        reports,
        targets,
        confidence: attacker.confidence,
        observedAt: attacker.timestamp,
        sourceName: attacker.sourceName,
        sourceUrl: attacker.url,
      };
    });
}

export function buildKevMapEvents(highlights: AttackFeedAlert[]): ThreatMapEvent[] {
  return highlights.slice(0, 4).map((highlight, index) => {
    const destination = PROTECTED_LOCATIONS[(index + 1) % PROTECTED_LOCATIONS.length];

    return {
      id: `map-${highlight.id}`,
      source: {
        ...CISA_LOCATION,
        ip: "CISA KEV",
        asName: "CISA Known Exploited Vulnerabilities",
      },
      destination,
      severity: highlight.severity,
      category: "在野漏洞压力",
      summaryZh: `${highlight.indicator} 已进入 CISA KEV，需校准 ${destination.city} 暴露面`,
      detailZh: `${highlight.titleZh} · ${highlight.mitreId} · confidence ${highlight.confidence}`,
      reports: 1,
      targets: 1,
      confidence: highlight.confidence,
      observedAt: highlight.timestamp,
      sourceName: highlight.sourceName,
      sourceUrl: highlight.url,
    };
  });
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
  dshieldIpIntelligence?: Record<string, DshieldIpIntelligence>;
  errors?: string[];
}): AttackOperationsSnapshot {
  const topAttackers = normalizeDshieldTopIps(input.topIps, input.observedAt);
  const topPorts = normalizeDshieldTopPorts(input.topPorts);
  const kevHighlights = normalizeCisaKevCatalog(input.kevCatalog, input.observedAt);
  const mapEvents = [
    ...buildDshieldMapEvents(topAttackers, input.dshieldIpIntelligence),
    ...buildKevMapEvents(kevHighlights),
  ];
  const errors = input.errors ?? [];

  return {
    updatedAt: input.observedAt,
    infocon: input.infocon?.trim() || "unknown",
    topAttackers,
    topPorts,
    kevHighlights,
    mapEvents,
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

function normalizeDshieldIpIntelligence(payload: unknown): DshieldIpIntelligence {
  if (!isRecord(payload) || !isRecord(payload.ip)) return {};

  const ip = payload.ip as DshieldIpResponse["ip"] & Record<string, unknown>;
  const countryCode = normalizeCountryCode(typeof ip.ascountry === "string" ? ip.ascountry : undefined);
  const location = countryLocation(countryCode);

  return {
    countryCode,
    countryName: location.countryName,
    asn: toNumber(ip.as),
    asName: typeof ip.asname === "string" ? ip.asname : undefined,
    network: typeof ip.network === "string" ? ip.network : undefined,
  };
}

async function fetchDshieldIpIntelligence(
  attackers: AttackFeedAlert[],
): Promise<Record<string, DshieldIpIntelligence>> {
  const lookups = attackers.slice(0, 8).map(async (attacker) => {
    const payload = await fetchJson<unknown>(
      `https://isc.sans.edu/api/ip/${encodeURIComponent(attacker.indicator)}?json`,
    );
    return [attacker.indicator, normalizeDshieldIpIntelligence(payload)] as const;
  });

  const settled = await Promise.allSettled(lookups);
  return Object.fromEntries(
    settled
      .filter((result): result is PromiseFulfilledResult<readonly [string, DshieldIpIntelligence]> => result.status === "fulfilled")
      .map((result) => result.value),
  );
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
  const ipIntelligence = await fetchDshieldIpIntelligence(snapshot.topAttackers);

  return {
    ...snapshot,
    mapEvents: [
      ...buildDshieldMapEvents(snapshot.topAttackers, ipIntelligence),
      ...buildKevMapEvents(snapshot.kevHighlights),
    ],
    sourceStatus: {
      dshield: topIps.status === "fulfilled" || topPorts.status === "fulfilled"
        ? snapshot.sourceStatus.dshield
        : "offline",
      cisaKev: kevCatalog.status === "fulfilled" ? snapshot.sourceStatus.cisaKev : "offline",
    },
  };
}
