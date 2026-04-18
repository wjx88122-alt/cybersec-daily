type UnknownRecord = Record<string, unknown>;

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[(.*)\]$/, "$1");

  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }

  const ipv4 = host.split(".").map(Number);
  if (ipv4.length === 4 && ipv4.every((part) => Number.isInteger(part))) {
    if (ipv4[0] === 127) return true;
    if (ipv4[0] === 10) return true;
    if (ipv4[0] === 169 && ipv4[1] === 254) return true;
    if (ipv4[0] === 192 && ipv4[1] === 168) return true;
    if (ipv4[0] === 172 && ipv4[1] >= 16 && ipv4[1] <= 31) return true;
  }

  if (host === "::1" || host === "0:0:0:0:0:0:0:1") return true;
  if (host.startsWith("fe80:")) return true;
  if (host.startsWith("fc") || host.startsWith("fd")) return true;

  return false;
}

export type FeedImageCandidateItem = {
  link?: string;
  content?: string;
  summary?: string;
  contentEncoded?: string;
  mediaContent?: unknown;
  mediaThumbnail?: unknown;
  enclosure?: unknown;
};

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function collectUrls(value: unknown, out: string[] = []): string[] {
  if (!value) return out;

  if (typeof value === "string") {
    out.push(value);
    return out;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => collectUrls(entry, out));
    return out;
  }

  if (isRecord(value)) {
    const direct = value.url;
    if (typeof direct === "string") {
      out.push(direct);
    }
    const href = value.href;
    if (typeof href === "string") {
      out.push(href);
    }
    const attrs = value.$;
    if (isRecord(attrs)) {
      const attrUrl = attrs.url;
      if (typeof attrUrl === "string") {
        out.push(attrUrl);
      }
      const attrHref = attrs.href;
      if (typeof attrHref === "string") {
        out.push(attrHref);
      }
    }
  }

  return out;
}

function firstImageUrlInHtml(html: string): string | undefined {
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1];
  const imageMatch = html.match(/(https?:\/\/[^"'\\s>]+\.(?:jpg|jpeg|png|webp|gif))/i);
  if (imageMatch?.[1]) return imageMatch[1];
  return undefined;
}

function normalizeCandidate(raw: string, pageUrl: string): string | null {
  const value = raw.trim();
  if (!value || value.startsWith("data:")) return null;

  const maybeAbsolute = value.startsWith("//") ? `https:${value}` : value;
  try {
    const resolved = new URL(maybeAbsolute, pageUrl);
    if (resolved.protocol !== "https:") return null;
    if (isBlockedHostname(resolved.hostname)) return null;
    return resolved.toString();
  } catch {
    return null;
  }
}

export function pickFeedImage(item: FeedImageCandidateItem): string | undefined {
  const pageUrl = item.link || "https://example.com";
  const candidatePool = [
    ...collectUrls(item.mediaContent),
    ...collectUrls(item.mediaThumbnail),
    ...collectUrls(item.enclosure),
  ];

  const htmlCandidate = firstImageUrlInHtml(
    String(item.contentEncoded || item.content || item.summary || ""),
  );
  if (htmlCandidate) {
    candidatePool.push(htmlCandidate);
  }

  const seen = new Set<string>();
  for (const raw of candidatePool) {
    const normalized = normalizeCandidate(raw, pageUrl);
    if (!normalized) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    return normalized;
  }

  return undefined;
}
