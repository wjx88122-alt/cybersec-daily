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

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function isAllowedRemoteHttpsUrl(url: string): boolean {
  const parsed = parseUrl(url);
  if (!parsed || parsed.protocol !== "https:") return false;

  return !isBlockedHostname(parsed.hostname);
}

export function resolveSafeExternalHref(url?: string | null): string {
  const trimmed = url?.trim();
  if (!trimmed) return "#";

  const parsed = parseUrl(trimmed);
  if (!parsed) return "#";

  return parsed.protocol === "http:" || parsed.protocol === "https:"
    ? parsed.toString()
    : "#";
}

export function resolveSafeImageUrl(
  raw: string,
  pageUrl: string,
): string | null {
  const value = raw.trim();
  if (!value || value.startsWith("data:")) return null;

  const maybeAbsolute = value.startsWith("//") ? `https:${value}` : value;

  try {
    const resolved = new URL(maybeAbsolute, pageUrl);
    return isAllowedRemoteHttpsUrl(resolved.toString())
      ? resolved.toString()
      : null;
  } catch {
    return null;
  }
}
