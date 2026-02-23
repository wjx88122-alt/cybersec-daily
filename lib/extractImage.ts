function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname;
    if (host === "localhost") return false;
    const parts = host.split(".").map(Number);
    if (parts[0] === 127) return false;
    if (parts[0] === 10) return false;
    if (parts[0] === 169 && parts[1] === 254) return false;
    if (parts[0] === 192 && parts[1] === 168) return false;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
    return true;
  } catch {
    return false;
  }
}

export async function extractOgImage(url: string): Promise<string | null> {
  if (!isAllowedUrl(url)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      headers: { Range: "bytes=0-32768" },
      signal: controller.signal,
    });

    const reader = res.body?.getReader();
    if (!reader) return null;

    let html = "";
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      if (html.includes("</head>")) break;
    }
    reader.cancel();

    const match =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      );

    if (!match) return null;
    const imageUrl = match[1];
    return imageUrl.startsWith("https://") ? imageUrl : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
