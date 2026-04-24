import FeedLandingClient from "@/components/feed/FeedLandingClient";
import PublicShell from "@/components/shells/PublicShell";
import { loadFeedPageItems } from "@/lib/feed-page-data";
import { readDigestFromStore } from "@/lib/feed-store";

export default async function Home() {
  const [items, digest] = await Promise.all([
    loadFeedPageItems("security"),
    readDigestFromStore(),
  ]);

  return (
    <PublicShell>
      <FeedLandingClient
        items={items}
        heroMode="contentSummary"
        digestOverview={digest?.overview}
        eyebrow="安全日报"
        headline="今日安全摘要"
        lead=""
        chips={["过去 24 小时更新", "先看焦点，再按分类深入"]}
        overviewTitle="今日概览"
        browseHint="从下方焦点卡片进入今日最重要的一条，再用搜索和分类筛选补充你关心的细分主题。"
        searchPlaceholder="搜索标题、摘要或关键词"
        emptyMessage="近 24 小时暂无新增资讯"
        briefLabel="今日简报"
        briefDescription="近 24 小时"
        listLabel="更多资讯"
        listDescription="保留原有信息密度，但用更清晰的层级来提高扫读效率。"
      />
    </PublicShell>
  );
}
