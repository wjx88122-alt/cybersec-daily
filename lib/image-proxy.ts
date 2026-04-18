function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[(.*)\]$/, "$1");

  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  return false;
}

function normalizeRemoteImageUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value || value.startsWith("data:")) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return null;
    if (isBlockedHostname(parsed.hostname)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function isDecorativeImage(url: string): boolean {
  return /(?:^|[\/._-])(logo|icon|badge|avatar|headshot|pixel|tracker)(?:[\/._-]|$)/i.test(
    url,
  ) ||
    /clickagy|channel-sync|google_preferred_source_badge|SecurityWeek-Small|SecurityWeek_Dark/i.test(
      url,
    );
}

function scoreImageCandidate(url: string, pageHost: string): number {
  let score = 0;
  const lower = url.toLowerCase();

  if (isDecorativeImage(url)) return -100;

  if (/\.svg(?:\?|$)/i.test(lower)) score -= 30;
  if (/\.(jpg|jpeg|webp|png)(?:\?|$)/i.test(lower)) score += 20;
  if (/\/uploads\//i.test(lower)) score += 20;
  if (/width=12[0-9]{2}|\/1200x-1\.jpg/i.test(lower)) score += 10;

  if (pageHost.includes("techrepublic.com")) {
    if (lower.includes("assets.techrepublic.com/uploads/")) score += 80;
  }
  if (pageHost.includes("darkreading.com")) {
    if (lower.includes("eu-images.contentstack.com/")) score += 70;
  }
  if (pageHost.includes("securityweek.com")) {
    if (lower.includes("/wp-content/uploads/")) score += 30;
  }

  return score;
}

function collectImageUrls(text: string): string[] {
  const candidates: string[] = [];
  const markdownMatches = text.matchAll(/!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/gi);
  for (const match of markdownMatches) {
    if (match[1]) candidates.push(match[1]);
  }

  const plainMatches = text.matchAll(/https?:\/\/[^\s)"']+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s)"']*)?/gi);
  for (const match of plainMatches) {
    if (match[0]) candidates.push(match[0]);
  }

  return candidates;
}

export function pickImageFromProxyText(
  text: string,
  pageUrl: string,
): string | undefined {
  const pageHost = (() => {
    try {
      return new URL(pageUrl).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();

  const seen = new Set<string>();
  const scored = collectImageUrls(text)
    .map((raw) => normalizeRemoteImageUrl(raw))
    .filter((url): url is string => Boolean(url))
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    })
    .map((url) => ({ url, score: scoreImageCandidate(url, pageHost) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.url;
}
