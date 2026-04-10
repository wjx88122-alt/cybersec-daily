import {
  type IntelActor,
  type IntelIoc,
  type IntelIocType,
  type IntelSeverity,
} from "./intelligence-mock";

const ATTACK_STIX_URL =
  "https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json";
const THREATFOX_API_URL = "https://threatfox-api.abuse.ch/api/v1/";

type StixObject = {
  type?: string;
  id?: string;
  name?: string;
  description?: string;
  aliases?: string[];
  x_mitre_aliases?: string[];
  external_references?: Array<{
    source_name?: string;
    external_id?: string;
  }>;
  created?: string;
  modified?: string;
  revoked?: boolean;
  x_mitre_deprecated?: boolean;
  relationship_type?: string;
  source_ref?: string;
  target_ref?: string;
};

type StixBundle = {
  objects?: StixObject[];
};

type ThreatFoxItem = {
  ioc?: string;
  ioc_type?: string;
  malware?: string;
  malware_printable?: string;
  malware_alias?: string | string[];
  threat_type_desc?: string;
  confidence_level?: string;
  first_seen?: string;
  last_seen?: string;
  tags?: string[];
};

type ThreatFoxResponse = {
  query_status?: string;
  data?: ThreatFoxItem[];
};

export type MappingSourceStatus = {
  source: string;
  ok: boolean;
  detail: string;
  count: number;
};

export type MappingLayerPayload = {
  actors: IntelActor[];
  iocs: IntelIoc[];
  status: MappingSourceStatus[];
};

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function toIsoDate(value?: string) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function confidenceToLabel(value?: string) {
  const numeric = Number(value ?? 0);
  if (numeric >= 70) return "高" as const;
  if (numeric >= 35) return "中" as const;
  return "低" as const;
}

function confidenceToSeverity(value?: string): IntelSeverity {
  const numeric = Number(value ?? 0);
  if (numeric >= 80) return "critical";
  if (numeric >= 45) return "high";
  return "medium";
}

function normalizeIocType(value?: string): IntelIocType {
  const raw = normalize(value ?? "");
  if (raw.includes("url")) return "URL";
  if (raw.includes("domain")) return "Domain";
  if (raw.includes("mail")) return "Email";
  if (raw.includes("sha") || raw.includes("md5") || raw.includes("hash")) return "Hash";
  return "IP";
}

function describeActor(toolNames: string[]) {
  if (toolNames.length === 0) {
    return "已接入 MITRE ATT&CK 组织画像，可继续补充具体工具链与行业情报。";
  }
  return `该组织在 MITRE ATT&CK 中与 ${toolNames.length} 个工具或恶意软件相关联，适合作为 IOC 与组织关系映射的基础。`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { "User-Agent": "CybersecDaily-Intelligence/1.0" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function fetchAttackBundle() {
  return fetchJson<StixBundle>(ATTACK_STIX_URL);
}

export async function fetchAttackActors(limit = 18): Promise<{
  actors: IntelActor[];
  malwareActorMap: Map<string, string[]>;
}> {
  const bundle = await fetchAttackBundle();
  const objects = bundle.objects ?? [];
  const intrusionSets = objects.filter(
    (item) =>
      item.type === "intrusion-set" &&
      !item.revoked &&
      !item.x_mitre_deprecated,
  );
  const malwareObjects = objects.filter(
    (item) =>
      item.type === "malware" && !item.revoked && !item.x_mitre_deprecated,
  );
  const relationships = objects.filter(
    (item) =>
      item.type === "relationship" &&
      item.relationship_type === "uses" &&
      item.source_ref?.startsWith("intrusion-set--") &&
      item.target_ref?.startsWith("malware--"),
  );

  const malwareById = new Map(malwareObjects.map((item) => [item.id ?? "", item]));
  const malwareNamesByActor = new Map<string, string[]>();
  const malwareActorMap = new Map<string, string[]>();

  for (const relationship of relationships) {
    const actorId = relationship.source_ref ?? "";
    const malware = malwareById.get(relationship.target_ref ?? "");
    const aliases = [
      malware?.name,
      ...(malware?.x_mitre_aliases ?? []),
    ].filter(Boolean) as string[];

    if (!aliases.length) continue;

    malwareNamesByActor.set(actorId, [
      ...(malwareNamesByActor.get(actorId) ?? []),
      ...aliases,
    ]);

    for (const alias of aliases) {
      const key = normalize(alias);
      malwareActorMap.set(key, [
        ...(malwareActorMap.get(key) ?? []),
        actorId,
      ]);
    }
  }

  const actors = intrusionSets
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
    .slice(0, limit)
    .map((item) => {
      const externalId =
        item.external_references?.find((entry) => entry.source_name === "mitre-attack")
          ?.external_id ?? item.id ?? "ATTACK";
      const tools = Array.from(
        new Set((malwareNamesByActor.get(item.id ?? "") ?? []).slice(0, 6)),
      );
      const severity: IntelSeverity =
        tools.length >= 8 ? "critical" : tools.length >= 3 ? "high" : "medium";

      return {
        id: item.id ?? `attack-${externalId}`,
        name: item.name ?? externalId,
        aliases: item.aliases ?? [],
        activityStatus: "tracking",
        riskRating: severity,
        origin: `MITRE ATT&CK · ${externalId}`,
        activeSince: (item.created ?? "").slice(0, 4) || "未知",
        lastActivity: toIsoDate(item.modified ?? item.created),
        targetIndustries: ["跨行业"],
        targetRegions: ["全球"],
        objectives: ["情报跟踪", "画像建立", "IOC 关联分析"],
        ttp: ["MITRE ATT&CK 组织档案", "可继续扩展到 technique 关系"],
        toolset: tools,
        recentCampaigns: ["ATT&CK 组织画像同步"],
        description:
          item.description?.replace(/\s+/g, " ").trim().slice(0, 260) ??
          "MITRE ATT&CK 提供的组织描述暂不可用。",
        vendorAssessment: describeActor(tools),
        relatedVulnerabilityIds: [],
        relatedIocIds: [],
        relatedReportIds: [],
      } satisfies IntelActor;
    });

  return { actors, malwareActorMap };
}

export async function fetchThreatFoxIocs(
  malwareActorMap: Map<string, string[]>,
  limit = 20,
): Promise<{
  iocs: IntelIoc[];
  status: MappingSourceStatus;
}> {
  const authKey = process.env.THREATFOX_AUTH_KEY?.trim();

  if (!authKey) {
    return {
      iocs: [],
      status: {
        source: "ThreatFox",
        ok: false,
        detail: "未配置 THREATFOX_AUTH_KEY，IOC 实时源已回退到知识库数据。",
        count: 0,
      },
    };
  }

  const response = await fetch(THREATFOX_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Auth-Key": authKey,
      "User-Agent": "CybersecDaily-Intelligence/1.0",
    },
    body: JSON.stringify({ query: "get_iocs", limit }),
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`ThreatFox ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as ThreatFoxResponse;

  if (payload.query_status !== "ok") {
    return {
      iocs: [],
      status: {
        source: "ThreatFox",
        ok: false,
        detail: payload.query_status ?? "未知返回状态",
        count: 0,
      },
    };
  }

  const iocs = (payload.data ?? []).map((item, index) => {
    const malwareNames = [
      item.malware_printable,
      item.malware,
      ...(Array.isArray(item.malware_alias)
        ? item.malware_alias
        : item.malware_alias
          ? item.malware_alias.split(",")
          : []),
    ]
      .map((entry) => entry?.trim())
      .filter(Boolean) as string[];

    const linkedActorIds = Array.from(
      new Set(
        malwareNames.flatMap((name) => malwareActorMap.get(normalize(name)) ?? []),
      ),
    );

    return {
      id: `threatfox-${index + 1}`,
      value: item.ioc ?? "unknown",
      type: normalizeIocType(item.ioc_type),
      confidence: confidenceToLabel(item.confidence_level),
      severity: confidenceToSeverity(item.confidence_level),
      source: "ThreatFox",
      firstSeen: toIsoDate(item.first_seen),
      lastSeen: toIsoDate(item.last_seen),
      context:
        item.threat_type_desc ||
        (malwareNames.length
          ? `与 ${malwareNames.join(" / ")} 相关的 IOC`
          : "ThreatFox 实时 IOC 记录"),
      tags: Array.from(new Set([...(item.tags ?? []), ...malwareNames])).slice(0, 8),
      linkedActorIds,
      linkedVulnerabilityIds: [],
    } satisfies IntelIoc;
  });

  return {
    iocs,
    status: {
      source: "ThreatFox",
      ok: true,
      detail: "已同步实时 IOC 并尝试映射到 ATT&CK 组织。",
      count: iocs.length,
    },
  };
}

export async function buildLiveMappingLayer(): Promise<MappingLayerPayload> {
  const status: MappingSourceStatus[] = [];
  let actors: IntelActor[] = [];
  let malwareActorMap = new Map<string, string[]>();
  let iocs: IntelIoc[] = [];

  try {
    const actorPayload = await fetchAttackActors();
    actors = actorPayload.actors;
    malwareActorMap = actorPayload.malwareActorMap;
    status.push({
      source: "MITRE ATT&CK",
      ok: actors.length > 0,
      detail:
        actors.length > 0
          ? "已同步官方 intrusion-set 组织档案。"
          : "ATT&CK 组织档案为空，已回退到知识库内容。",
      count: actors.length,
    });
  } catch (error) {
    status.push({
      source: "MITRE ATT&CK",
      ok: false,
      detail: error instanceof Error ? error.message : "未知错误",
      count: 0,
    });
  }

  try {
    const iocPayload = await fetchThreatFoxIocs(malwareActorMap);
    iocs = iocPayload.iocs;
    status.push(iocPayload.status);
  } catch (error) {
    status.push({
      source: "ThreatFox",
      ok: false,
      detail: error instanceof Error ? error.message : "未知错误",
      count: 0,
    });
  }

  const linkedIocsByActor = new Map<string, string[]>();
  for (const ioc of iocs) {
    for (const actorId of ioc.linkedActorIds) {
      linkedIocsByActor.set(actorId, [
        ...(linkedIocsByActor.get(actorId) ?? []),
        ioc.id,
      ]);
    }
  }

  actors = actors.map((actor) => ({
    ...actor,
    relatedIocIds: linkedIocsByActor.get(actor.id) ?? actor.relatedIocIds,
  }));

  return { actors, iocs, status };
}
