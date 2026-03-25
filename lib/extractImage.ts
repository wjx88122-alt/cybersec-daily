import { isAllowedRemoteHttpsUrl, resolveSafeImageUrl } from "./remote-url";

const MAX_HEAD_BYTES = 160 * 1024;
const FETCH_TIMEOUT_MS = 6000;
const BASE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
} as const;

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/gi, "&")
    .replace(/&#38;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function normalizeImageUrl(raw: string, pageUrl: string): string | null {
  const value = decodeHtmlEntities(raw.trim());
  return resolveSafeImageUrl(value, pageUrl);
}

function extractImageFromHtml(html: string, pageUrl: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+property=["']og:image:url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match?.[1]) continue;
    const normalized = normalizeImageUrl(match[1], pageUrl);
    if (normalized) return normalized;
  }
  return null;
}

async function readHeadChunk(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";

  let html = "";
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    html += decoder.decode(value, { stream: true });
    if (html.includes("</head>") || html.length >= MAX_HEAD_BYTES) break;
  }
  reader.cancel();
  return html;
}

export async function extractOgImage(url: string): Promise<string | null> {
  if (!isAllowedRemoteHttpsUrl(url)) return null;

  for (const useRange of [true, false]) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const headers = useRange
        ? { ...BASE_HEADERS, Range: "bytes=0-163839" }
        : BASE_HEADERS;
      const res = await fetch(url, {
        headers,
        signal: controller.signal,
        redirect: "follow",
      });
      const html = await readHeadChunk(res);
      const image = extractImageFromHtml(html, url);
      if (image) return image;
    } catch {
      // Ignore this attempt and retry with the next strategy.
    } finally {
      clearTimeout(timeout);
    }
  }
  return null;
}
