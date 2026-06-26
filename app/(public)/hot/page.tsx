import type { Metadata } from "next";
import HotListClient from "@/components/feed/HotListClient";
import HotShell from "@/components/shells/HotShell";
import { loadHotItems, hotItemTitle } from "@/lib/hot-page-data";
import { HOT_DEFAULT_WINDOW } from "@/lib/hot-page-data";
import { readSecurityFeedItems } from "@/lib/feed-store";

// 热榜准实时刷新：每 5 分钟重新生成 (复用 KV 缓存数据，无需触发 cron)
export const revalidate = 300;

const SITE_URL = "https://cybersec-daily.vercel.app";
const PAGE_DESCRIPTION =
  "Security Hot 安全热榜：跨数十个信源聚合，同一事件多来源自动合并，按热度排序而非时间。今天安全圈最值得关注的事，一站看全。";

export const metadata: Metadata = {
  title: "Security Hot — 安全热榜 · 跨信源聚合热度排序",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/hot`,
    types: {
      "application/rss+xml": [
        { url: `${SITE_URL}/hot/feed.xml`, title: "Security Hot — 精选 RSS" },
        {
          url: `${SITE_URL}/hot/feed/all.xml`,
          title: "Security Hot — 全量 RSS",
        },
      ],
    },
  },
  openGraph: {
    title: "Security Hot — 安全热榜",
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/hot`,
    siteName: "网络安全日报",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security Hot — 安全热榜",
    description: PAGE_DESCRIPTION,
  },
};

export default async function HotPage() {
  const [items, rawItems] = await Promise.all([
    loadHotItems(HOT_DEFAULT_WINDOW),
    readSecurityFeedItems(),
  ]);

  // JSON-LD ItemList 结构化数据 (帮助搜索引擎/AI Agent 理解热榜)
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Security Hot 安全热榜",
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/hot`,
    itemListOrder: "https://schema.org/Descending",
    numberOfItems: items.length,
    itemListElement: items.slice(0, 10).map((item) => ({
      "@type": "ListItem",
      position: item.rank,
      name: hotItemTitle(item),
      url: item.link,
    })),
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Security Hot",
    url: `${SITE_URL}/hot`,
    description: PAGE_DESCRIPTION,
    inLanguage: "zh-CN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/hot?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <HotShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <HotListClient items={items} rawItems={rawItems} />
    </HotShell>
  );
}
