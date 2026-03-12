import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";

type ProviderFeedType = "json" | "text";

export type HuaweiIsdbProviderId =
  | "aws"
  | "azure-public"
  | "azure-china"
  | "azure-usgov"
  | "cloudflare"
  | "github"
  | "microsoft-365"
  | "microsoft-365-optimize"
  | "google-cloud"
  | "google-services";

export type HuaweiIsdbBundleId =
  | "sdwan-core"
  | "public-cloud"
  | "microsoft-cloud"
  | "m365-optimize"
  | "azure-sovereign"
  | "dev-platforms";

type ProviderDefinition = {
  id: HuaweiIsdbProviderId;
  label: string;
  description: string;
  feeds: { url: string; type: ProviderFeedType }[];
  parse: (payloads: string[]) => string[];
  fetchCidrs?: () => Promise<string[]>;
};

export const HUAWEI_ISDB_PROVIDERS: ReadonlyArray<{
  id: HuaweiIsdbProviderId;
  label: string;
  description: string;
  sources: string[];
}> = [
  {
    id: "aws",
    label: "AWS",
    description: "Amazon 官方 ip-ranges.json，适合云出口和跨区流量选路。",
    sources: ["https://ip-ranges.amazonaws.com/ip-ranges.json"],
  },
  {
    id: "azure-public",
    label: "Azure Public",
    description: "Azure 官方 Service Tags 公有云地址前缀，适合 Azure 业务和跨云互联选路。",
    sources: ["https://www.microsoft.com/en-us/download/details.aspx?id=56519"],
  },
  {
    id: "azure-china",
    label: "Azure China",
    description: "Azure China (21Vianet) 官方 Service Tags 地址前缀，适合中国区云业务选路。",
    sources: ["https://www.microsoft.com/en-us/download/details.aspx?id=57062"],
  },
  {
    id: "azure-usgov",
    label: "Azure USGov",
    description: "Azure US Government 官方 Service Tags 地址前缀，适合 GCC High / Gov 网络选路。",
    sources: ["https://www.microsoft.com/en-us/download/details.aspx?id=57063"],
  },
  {
    id: "cloudflare",
    label: "Cloudflare",
    description: "Cloudflare 官方 IPv4 / IPv6 网段，适合 CDN/WAF/Zero Trust 出口选路。",
    sources: [
      "https://www.cloudflare.com/ips-v4",
      "https://www.cloudflare.com/ips-v6",
    ],
  },
  {
    id: "github",
    label: "GitHub",
    description: "GitHub Meta API 暴露的官方网段，适合代码仓库/Actions/Packages 选路。",
    sources: ["https://api.github.com/meta"],
  },
  {
    id: "microsoft-365",
    label: "Microsoft 365",
    description: "Microsoft 365 官方 Web Service 公开的全球实例 IP 地址，适合 Exchange / Teams / SharePoint 等 SaaS 选路。",
    sources: [
      "https://learn.microsoft.com/en-us/microsoft-365/enterprise/microsoft-365-ip-web-service?view=o365-worldwide",
      "https://endpoints.office.com/endpoints/Worldwide?ClientRequestId=b10c5ed1-bad1-445f-b386-b919946339a7",
    ],
  },
  {
    id: "microsoft-365-optimize",
    label: "M365 Optimize",
    description: "Microsoft 365 仅 Optimize 类别的精简地址库，适合低时延互联网出口直连。",
    sources: [
      "https://learn.microsoft.com/en-us/microsoft-365/enterprise/microsoft-365-ip-web-service?view=o365-worldwide",
      "https://endpoints.office.com/endpoints/Worldwide?ClientRequestId=b10c5ed1-bad1-445f-b386-b919946339a7",
    ],
  },
  {
    id: "google-cloud",
    label: "Google Cloud",
    description: "Google Cloud 官方云前缀，适合 GCP 业务出口选路。",
    sources: ["https://www.gstatic.com/ipranges/cloud.json"],
  },
  {
    id: "google-services",
    label: "Google Services",
    description: "Google 官方公共服务前缀，适合 Google API / Workspace / Gemini 相关流量选路。",
    sources: ["https://www.gstatic.com/ipranges/goog.json"],
  },
];

export const HUAWEI_ISDB_BUNDLES: ReadonlyArray<{
  id: HuaweiIsdbBundleId;
  label: string;
  description: string;
  providerIds: HuaweiIsdbProviderId[];
}> = [
  {
    id: "sdwan-core",
    label: "SD-WAN Core",
    description: "通用互联网出口库，覆盖 Cloudflare、GitHub、Google 与 AWS。",
    providerIds: ["cloudflare", "github", "google-cloud", "google-services", "aws"],
  },
  {
    id: "public-cloud",
    label: "Public Cloud",
    description: "公有云出口库，覆盖 AWS、Azure 与 Google Cloud。",
    providerIds: ["aws", "azure-public", "google-cloud"],
  },
  {
    id: "microsoft-cloud",
    label: "Microsoft Cloud",
    description: "微软云与 SaaS 出口库，覆盖 Azure Public 与 Microsoft 365。",
    providerIds: ["azure-public", "microsoft-365"],
  },
  {
    id: "m365-optimize",
    label: "M365 Optimize",
    description: "Microsoft 365 仅 Optimize 类别，适合做精简直连选路库。",
    providerIds: ["microsoft-365-optimize"],
  },
  {
    id: "azure-sovereign",
    label: "Azure Sovereign",
    description: "Azure China 与 US Government 实例地址库。",
    providerIds: ["azure-china", "azure-usgov"],
  },
  {
    id: "dev-platforms",
    label: "Dev Platforms",
    description: "研发平台库，覆盖 GitHub、Cloudflare 与 Google 公共服务。",
    providerIds: ["github", "cloudflare", "google-services"],
  },
];

type AwsRangePayload = {
  prefixes?: Array<{ ip_prefix?: string }>;
  ipv6_prefixes?: Array<{ ipv6_prefix?: string }>;
};

type GoogleRangePayload = {
  prefixes?: Array<{ ipv4Prefix?: string; ipv6Prefix?: string }>;
};

type AzureServiceTagsPayload = {
  values?: Array<{
    properties?: {
      addressPrefixes?: string[];
    };
  }>;
};

type GithubMetaPayload = Record<string, unknown>;

type Microsoft365EndpointPayload = Array<{
  category?: string;
  ips?: string[];
}>;

const JSON_HEADERS = {
  Accept: "application/json",
  "User-Agent": "cybersec-daily-huawei-isdb/1.0",
};

const execFileAsync = promisify(execFile);

const CIDR_RE =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\/(?:3[0-2]|[12]?\d)|[0-9a-f:]+\/(?:12[0-8]|1[01]\d|\d?\d))$/i;

function ensureCidr(value: string): string | null {
  const cidr = value.trim().toLowerCase();
  return CIDR_RE.test(cidr) ? cidr : null;
}

function uniqueCidrs(cidrs: Iterable<string>): string[] {
  const set = new Set<string>();
  for (const cidr of cidrs) {
    const normalized = ensureCidr(cidr);
    if (normalized) set.add(normalized);
  }

  const ipv4 = [...set].filter((cidr) => cidr.includes(".")).sort(compareIpv4Cidrs);
  const ipv6 = [...set].filter((cidr) => cidr.includes(":")).sort();
  return [...ipv4, ...ipv6];
}

function compareIpv4Cidrs(a: string, b: string): number {
  const [aIp, aMask] = a.split("/");
  const [bIp, bMask] = b.split("/");
  const aParts = aIp.split(".").map(Number);
  const bParts = bIp.split(".").map(Number);

  for (let i = 0; i < 4; i += 1) {
    if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
  }

  return Number(aMask) - Number(bMask);
}

function parseAws(payloads: string[]): string[] {
  const json = JSON.parse(payloads[0]) as AwsRangePayload;
  const cidrs = [
    ...(json.prefixes ?? []).map((item) => item.ip_prefix).filter(Boolean),
    ...(json.ipv6_prefixes ?? []).map((item) => item.ipv6_prefix).filter(Boolean),
  ];
  return uniqueCidrs(cidrs as string[]);
}

function parseGoogle(payloads: string[]): string[] {
  const json = JSON.parse(payloads[0]) as GoogleRangePayload;
  const cidrs = (json.prefixes ?? []).flatMap((item) => [item.ipv4Prefix, item.ipv6Prefix]).filter(Boolean);
  return uniqueCidrs(cidrs as string[]);
}

function parseCloudflare(payloads: string[]): string[] {
  const cidrs = payloads.flatMap((payload) => payload.split(/\r?\n/));
  return uniqueCidrs(cidrs);
}

function parseGithub(payloads: string[]): string[] {
  const json = JSON.parse(payloads[0]) as GithubMetaPayload;
  const cidrs: string[] = [];

  for (const value of Object.values(json)) {
    if (!Array.isArray(value)) continue;
    for (const item of value) {
      if (typeof item === "string") cidrs.push(item);
    }
  }

  return uniqueCidrs(cidrs);
}

function parseAzureServiceTags(payloads: string[]): string[] {
  const json = JSON.parse(payloads[0]) as AzureServiceTagsPayload;
  const cidrs = (json.values ?? []).flatMap(
    (item) => item.properties?.addressPrefixes ?? [],
  );
  return uniqueCidrs(cidrs);
}

function parseMicrosoft365(payloads: string[]): string[] {
  const json = JSON.parse(payloads[0]) as Microsoft365EndpointPayload;
  const cidrs = json.flatMap((item) => item.ips ?? []);
  return uniqueCidrs(cidrs);
}

function extractAzureServiceTagsUrl(html: string): string {
  const match = html.match(
    /https:\/\/download\.microsoft\.com\/download\/[^"'\\s]+ServiceTags(?:_[A-Za-z]+)?_[^"'\\s]+\.json/i,
  );

  if (!match) {
    throw new Error("无法从微软下载页提取 Azure Service Tags JSON 链接");
  }

  return match[0];
}

async function fetchAzurePublicCidrs(): Promise<string[]> {
  return fetchAzureCidrsByDownloadPageId("56519");
}

async function fetchAzureChinaCidrs(): Promise<string[]> {
  return fetchAzureCidrsByDownloadPageId("57062");
}

async function fetchAzureUsGovCidrs(): Promise<string[]> {
  return fetchAzureCidrsByDownloadPageId("57063");
}

async function fetchAzureCidrsByDownloadPageId(detailsPageId: string): Promise<string[]> {
  const detailsPage = await fetchFeed(
    `https://www.microsoft.com/en-us/download/details.aspx?id=${detailsPageId}`,
    "text",
  );
  const jsonUrl = extractAzureServiceTagsUrl(detailsPage);
  const payload = await fetchFeed(jsonUrl, "json");
  return parseAzureServiceTags([payload]);
}

async function fetchMicrosoft365Cidrs(): Promise<string[]> {
  return fetchMicrosoft365CidrsByCategory();
}

async function fetchMicrosoft365OptimizeCidrs(): Promise<string[]> {
  return fetchMicrosoft365CidrsByCategory("Optimize");
}

async function fetchMicrosoft365CidrsByCategory(category?: "Optimize"): Promise<string[]> {
  const endpointUrl = `https://endpoints.office.com/endpoints/Worldwide?ClientRequestId=${randomUUID()}`;
  const payload = await fetchFeed(endpointUrl, "json");
  if (!category) {
    return parseMicrosoft365([payload]);
  }

  const json = JSON.parse(payload) as Microsoft365EndpointPayload;
  const filtered = json.filter((item) => item.category === category);
  return parseMicrosoft365([JSON.stringify(filtered)]);
}

const PROVIDER_DEFINITIONS: Record<HuaweiIsdbProviderId, ProviderDefinition> = {
  aws: {
    id: "aws",
    label: "AWS",
    description: "Amazon 官方 ip-ranges.json",
    feeds: [{ url: "https://ip-ranges.amazonaws.com/ip-ranges.json", type: "json" }],
    parse: parseAws,
  },
  "azure-public": {
    id: "azure-public",
    label: "Azure Public",
    description: "Azure 公有云官方 Service Tags 地址前缀",
    feeds: [],
    parse: parseAzureServiceTags,
    fetchCidrs: fetchAzurePublicCidrs,
  },
  "azure-china": {
    id: "azure-china",
    label: "Azure China",
    description: "Azure China 官方 Service Tags 地址前缀",
    feeds: [],
    parse: parseAzureServiceTags,
    fetchCidrs: fetchAzureChinaCidrs,
  },
  "azure-usgov": {
    id: "azure-usgov",
    label: "Azure USGov",
    description: "Azure US Government 官方 Service Tags 地址前缀",
    feeds: [],
    parse: parseAzureServiceTags,
    fetchCidrs: fetchAzureUsGovCidrs,
  },
  cloudflare: {
    id: "cloudflare",
    label: "Cloudflare",
    description: "Cloudflare 官方 IP 列表",
    feeds: [
      { url: "https://www.cloudflare.com/ips-v4", type: "text" },
      { url: "https://www.cloudflare.com/ips-v6", type: "text" },
    ],
    parse: parseCloudflare,
  },
  github: {
    id: "github",
    label: "GitHub",
    description: "GitHub Meta API 官方网段",
    feeds: [{ url: "https://api.github.com/meta", type: "json" }],
    parse: parseGithub,
  },
  "microsoft-365": {
    id: "microsoft-365",
    label: "Microsoft 365",
    description: "Microsoft 365 官方 Worldwide endpoints API",
    feeds: [],
    parse: parseMicrosoft365,
    fetchCidrs: fetchMicrosoft365Cidrs,
  },
  "microsoft-365-optimize": {
    id: "microsoft-365-optimize",
    label: "Microsoft 365 Optimize",
    description: "Microsoft 365 Worldwide endpoints API (Optimize only)",
    feeds: [],
    parse: parseMicrosoft365,
    fetchCidrs: fetchMicrosoft365OptimizeCidrs,
  },
  "google-cloud": {
    id: "google-cloud",
    label: "Google Cloud",
    description: "Google Cloud 官方云前缀",
    feeds: [{ url: "https://www.gstatic.com/ipranges/cloud.json", type: "json" }],
    parse: parseGoogle,
  },
  "google-services": {
    id: "google-services",
    label: "Google Services",
    description: "Google 公共服务官方前缀",
    feeds: [{ url: "https://www.gstatic.com/ipranges/goog.json", type: "json" }],
    parse: parseGoogle,
  },
};

function getBundle(bundleId: HuaweiIsdbBundleId) {
  return HUAWEI_ISDB_BUNDLES.find((bundle) => bundle.id === bundleId);
}

async function fetchFeed(url: string, type: ProviderFeedType): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: type === "json" ? JSON_HEADERS : { "User-Agent": JSON_HEADERS["User-Agent"] },
      next: { revalidate: 60 * 60 * 6 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    return response.text();
  } catch (error) {
    // Local macOS deployments often rely on system proxy env vars that Node fetch
    // ignores. curl honors them, so keep it as a pragmatic fallback.
    const { stdout } = await execFileAsync("/usr/bin/curl", [
      "--fail",
      "--silent",
      "--show-error",
      "--location",
      url,
    ]);
    if (!stdout) {
      throw error instanceof Error ? error : new Error(`Failed to fetch ${url}`);
    }
    return stdout;
  }
}

async function fetchProviderCidrs(providerId: HuaweiIsdbProviderId): Promise<string[]> {
  const provider = PROVIDER_DEFINITIONS[providerId];
  if (provider.fetchCidrs) {
    return provider.fetchCidrs();
  }
  const payloads = await Promise.all(
    provider.feeds.map((feed) => fetchFeed(feed.url, feed.type)),
  );
  return provider.parse(payloads);
}

export function resolveHuaweiIsdbProviderIds(
  providerIds: string[],
  bundleId?: string | null,
): HuaweiIsdbProviderId[] {
  const requested = new Set<HuaweiIsdbProviderId>();

  if (bundleId) {
    const bundle = getBundle(bundleId as HuaweiIsdbBundleId);
    if (!bundle) throw new Error(`未知 bundle: ${bundleId}`);
    for (const providerId of bundle.providerIds) requested.add(providerId);
  }

  for (const providerId of providerIds) {
    const normalized = providerId.trim() as HuaweiIsdbProviderId;
    if (!normalized) continue;
    if (!(normalized in PROVIDER_DEFINITIONS)) throw new Error(`未知 provider: ${providerId}`);
    requested.add(normalized);
  }

  return [...requested];
}

export async function buildHuaweiIsdb(providerIds: HuaweiIsdbProviderId[]) {
  if (providerIds.length === 0) throw new Error("至少选择一个 provider");

  const providerCidrs = await Promise.all(
    providerIds.map(async (providerId) => ({
      providerId,
      cidrs: await fetchProviderCidrs(providerId),
    })),
  );

  const combined = uniqueCidrs(providerCidrs.flatMap((entry) => entry.cidrs));
  const providerMap = new Map(HUAWEI_ISDB_PROVIDERS.map((item) => [item.id, item]));

  return {
    generatedAt: new Date().toISOString(),
    providerIds,
    providers: providerIds.map((providerId) => providerMap.get(providerId)).filter(Boolean),
    count: combined.length,
    cidrs: combined,
  };
}

export function buildHuaweiIsdbFilename(selection: {
  bundleId?: string | null;
  providerIds: HuaweiIsdbProviderId[];
}) {
  const date = new Date().toISOString().slice(0, 10);
  const slug = selection.bundleId
    ? selection.bundleId
    : selection.providerIds.join("-");
  return `huawei-isdb-${slug}-${date}.csv`;
}
