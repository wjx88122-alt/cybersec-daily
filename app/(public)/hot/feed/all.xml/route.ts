import { loadAllTimeline, hotItemToRssXml } from "@/lib/hot-page-data";
import { HOT_ALL_LIMIT } from "@/lib/hot-page-data";

export const revalidate = 300;

const SITE_URL = "https://cybersec-daily.vercel.app";

export async function GET() {
  const items = await loadAllTimeline(HOT_ALL_LIMIT);
  const lastBuild = items[0]
    ? new Date(items[0].pubDate).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Security Hot — 全部安全动态</title>
    <link>${SITE_URL}/all</link>
    <description>最近 7 天全部网络安全动态，按真实发布时间倒序。要按热度排序请看 /hot。</description>
    <language>zh-CN</language>
    <atom:link href="${SITE_URL}/hot/feed/all.xml" rel="self" type="application/rss+xml" />
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
