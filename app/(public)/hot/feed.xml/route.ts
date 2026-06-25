import { loadHotItems, hotItemToRssXml } from "@/lib/hot-page-data";
import { HOT_SELECTED_LIMIT } from "@/lib/hot-page-data";

export const revalidate = 300;

const SITE_URL = "https://cybersec-daily.vercel.app";

export async function GET() {
  const items = await loadHotItems("24h", HOT_SELECTED_LIMIT);
  const lastBuild = items[0]
    ? new Date(items[0].pubDate).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Security Hot — 安全热榜精选</title>
    <link>${SITE_URL}/hot</link>
    <description>跨数十个信源聚合、按热度排序的网络安全热榜精选。同一事件多来源自动合并。</description>
    <language>zh-CN</language>
    <atom:link href="${SITE_URL}/hot/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <ttl>15</ttl>
    <generator>Security Hot (https://cybersec-daily.vercel.app/agent)</generator>
${items.map(hotItemToRssXml).join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
