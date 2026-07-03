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
        digestItems={digest?.items ?? []}
        eyebrow="市场机会日报"
        headline="今日市场机会"
        lead=""
        chips={["过去 24 小时市场信号", "先看机会，再看动态"]}
        overviewTitle="今日概览"
        browseHint="先看机会看板判断产品线动作，再用搜索和分类补充竞争、政策与技术拐点。"
        searchPlaceholder="搜索标题、摘要或关键词"
        emptyMessage="近 24 小时暂无新增资讯"
        briefLabel="今日机会"
        briefDescription="近 24 小时"
        listLabel="更多资讯"
        listDescription="补充查看机会、竞争与布局之外的原始动态，保留完整市场扫描密度。"
      />
    </PublicShell>
  );
}
