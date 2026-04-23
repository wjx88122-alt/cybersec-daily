import FeedLandingClient from "@/components/feed/FeedLandingClient";
import PublicShell from "@/components/shells/PublicShell";
import { loadFeedPageItems } from "@/lib/feed-page-data";

export default async function Home() {
  const items = await loadFeedPageItems("security");
  return (
    <PublicShell>
      <FeedLandingClient
        items={items}
        eyebrow="安全日报"
        headline="把过去 24 小时最值得看的安全变化，放在一页里。"
        lead="每日最新网络安全资讯聚合，围绕漏洞预警、安全事件、深度分析和情报变化，帮你先看重点，再决定深入哪一条。"
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
