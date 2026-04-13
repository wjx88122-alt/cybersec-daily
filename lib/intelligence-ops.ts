import type {
  IntelActor,
  IntelIoc,
  IntelSeverity,
  IntelVulnerability,
} from "./intelligence-mock";
import { MOCK_CLIENTS } from "./network-mock";

export type IntelligenceEntityKind = "actor" | "vulnerability" | "ioc";

export type IntelligenceListEntry = {
  id: string;
  label: string;
  kind: IntelligenceEntityKind;
  severity: IntelSeverity;
  source: string;
  updatedAt: string;
};

export type IntelligenceListsPayload = {
  threatList: IntelligenceListEntry[];
  safelist: IntelligenceListEntry[];
};

export type RelevanceCard = {
  id: string;
  label: string;
  kind: IntelligenceEntityKind;
  score: number;
  reasons: string[];
  matchedIndustries: string[];
};

export type RelevanceSnapshot = {
  managedIndustries: string[];
  topActor: RelevanceCard | null;
  topVulnerability: RelevanceCard | null;
  topIoc: RelevanceCard | null;
};

export type GraphNode = {
  id: string;
  label: string;
  kind: "focus" | "actor" | "vulnerability" | "ioc" | "industry";
};

export type GraphEdge = {
  from: string;
  to: string;
  label: string;
};

export type GraphSnapshot = {
  title: string;
  focus: GraphNode | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

function severityWeight(severity: IntelSeverity) {
  if (severity === "critical") return 60;
  if (severity === "high") return 42;
  return 26;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export function getManagedIndustries(): string[] {
  return unique(MOCK_CLIENTS.map((client) => client.industry));
}

function sortByScore(items: RelevanceCard[]) {
  return [...items].sort((a, b) => b.score - a.score);
}

export function buildRelevanceSnapshot(
  actors: IntelActor[],
  vulnerabilities: IntelVulnerability[],
  iocs: IntelIoc[],
): RelevanceSnapshot {
  const managedIndustries = getManagedIndustries();
  const actorMap = new Map(actors.map((item) => [item.id, item]));

  const actorCards = actors.map((actor) => {
    const matchedIndustries = actor.targetIndustries.filter((item) =>
      managedIndustries.includes(item),
    );
    const reasons = [];
    let score = severityWeight(actor.riskRating);

    if (matchedIndustries.length > 0) {
      score += 20 + matchedIndustries.length * 6;
      reasons.push("命中托管行业");
    }
    if (actor.relatedIocIds.length > 0) {
      score += Math.min(actor.relatedIocIds.length * 2, 12);
      reasons.push("多实体关联");
    }

    return {
      id: actor.id,
      label: actor.name,
      kind: "actor" as const,
      score,
      reasons,
      matchedIndustries,
    };
  });

  const vulnerabilityCards = vulnerabilities.map((item) => {
    const matchedIndustries = unique(
      item.linkedActorIds.flatMap(
        (actorId) => actorMap.get(actorId)?.targetIndustries ?? [],
      ),
    ).filter((industry) => managedIndustries.includes(industry));

    const reasons = [];
    let score = severityWeight(item.severity);

    if (item.inTheWild) {
      score += 22;
      reasons.push("在野利用");
    }
    if (matchedIndustries.length > 0) {
      score += 18 + matchedIndustries.length * 5;
      reasons.push("命中托管行业");
    }
    if (item.linkedIocIds.length > 0) {
      score += Math.min(item.linkedIocIds.length * 2, 10);
      reasons.push("多实体关联");
    }

    return {
      id: item.id,
      label: item.cve,
      kind: "vulnerability" as const,
      score,
      reasons,
      matchedIndustries,
    };
  });

  const iocCards = iocs.map((item) => {
    const matchedIndustries = unique(
      item.linkedActorIds.flatMap(
        (actorId) => actorMap.get(actorId)?.targetIndustries ?? [],
      ),
    ).filter((industry) => managedIndustries.includes(industry));

    const reasons = [];
    let score = severityWeight(item.severity);

    if (item.confidence === "高") {
      score += 18;
      reasons.push("高置信 IOC");
    }
    if (matchedIndustries.length > 0) {
      score += 18 + matchedIndustries.length * 5;
      reasons.push("命中托管行业");
    }
    if (item.linkedActorIds.length > 0) {
      score += 10;
      reasons.push("关联组织");
    }

    return {
      id: item.id,
      label: item.value,
      kind: "ioc" as const,
      score,
      reasons,
      matchedIndustries,
    };
  });

  return {
    managedIndustries,
    topActor: sortByScore(actorCards)[0] ?? null,
    topVulnerability: sortByScore(vulnerabilityCards)[0] ?? null,
    topIoc: sortByScore(iocCards)[0] ?? null,
  };
}

export function buildGraphSnapshot(
  actors: IntelActor[],
  vulnerabilities: IntelVulnerability[],
  iocs: IntelIoc[],
): GraphSnapshot {
  const focusVulnerability = vulnerabilities[0] ?? null;

  if (!focusVulnerability) {
    return { title: "实体关系图谱", focus: null, nodes: [], edges: [] };
  }

  const actorMap = new Map(actors.map((item) => [item.id, item]));
  const iocMap = new Map(iocs.map((item) => [item.id, item]));

  const focus: GraphNode = {
    id: focusVulnerability.id,
    label: focusVulnerability.cve,
    kind: "focus",
  };

  const actorNodes = focusVulnerability.linkedActorIds
    .map((id) => actorMap.get(id))
    .filter(Boolean)
    .slice(0, 3)
    .map((item) => ({
      id: item!.id,
      label: item!.name,
      kind: "actor" as const,
    }));

  const iocNodes = focusVulnerability.linkedIocIds
    .map((id) => iocMap.get(id))
    .filter(Boolean)
    .slice(0, 4)
    .map((item) => ({
      id: item!.id,
      label: item!.value,
      kind: "ioc" as const,
    }));

  const industryNodes = unique(
    actorNodes.flatMap(
      (node) => actorMap.get(node.id)?.targetIndustries ?? [],
    ),
  )
    .slice(0, 3)
    .map((industry) => ({
      id: `industry-${industry}`,
      label: industry,
      kind: "industry" as const,
    }));

  const nodes = [focus, ...actorNodes, ...iocNodes, ...industryNodes];
  const edges: GraphEdge[] = [
    ...actorNodes.map((node) => ({
      from: focus.id,
      to: node.id,
      label: "关联组织",
    })),
    ...iocNodes.map((node) => ({
      from: focus.id,
      to: node.id,
      label: "关联 IOC",
    })),
    ...industryNodes.map((node) => ({
      from: actorNodes[0]?.id ?? focus.id,
      to: node.id,
      label: "目标行业",
    })),
  ];

  return {
    title: "实体关系图谱",
    focus,
    nodes,
    edges,
  };
}

export function normalizeListEntry(input: {
  id: string;
  label: string;
  kind: IntelligenceEntityKind;
  severity: IntelSeverity;
  source: string;
}): IntelligenceListEntry {
  return {
    ...input,
    updatedAt: new Date().toISOString(),
  };
}

function escapeValue(value: string) {
  return value.replace(/"/g, '\\"');
}

export function generateRuleExport(input: {
  format: "sigma" | "suricata" | "splunk";
  kind: "ioc" | "vulnerability";
  value: string;
  title?: string;
}) {
  const title = input.title ?? input.value;

  if (input.format === "sigma") {
    return [
      "title: Intelligence Center Export",
      `description: ${title}`,
      "status: experimental",
      "logsource:",
      "  category: network_connection",
      "detection:",
      `  selection:`,
      `    intel_match: \"${escapeValue(input.value)}\"`,
      "  condition: selection",
    ].join("\n");
  }

  if (input.format === "suricata") {
    return input.kind === "ioc"
      ? `alert http any any -> any any (msg:"Intel IOC match"; content:"${escapeValue(
          input.value,
        )}"; nocase; sid:420001; rev:1;)`
      : `alert http any any -> any any (msg:"Intel vulnerability reference ${escapeValue(
          input.value,
        )}"; content:"${escapeValue(input.value)}"; nocase; sid:420002; rev:1;)`;
  }

  return input.kind === "ioc"
    ? `index=* "${escapeValue(input.value)}" | stats count by src_ip dest_ip user`
    : `index=* "${escapeValue(input.value)}" | stats count by host sourcetype`;
}
