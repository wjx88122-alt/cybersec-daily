import FeedLandingClient from "@/components/feed/FeedLandingClient";
import PublicShell from "@/components/shells/PublicShell";
import { AI_CATEGORIES } from "@/components/CategoryFilter";
import { loadFeedPageItems } from "@/lib/feed-page-data";

export default async function AIPage() {
  const items = await loadFeedPageItems("ai");
  return (
    <PublicShell>
      <FeedLandingClient
        items={items}
        categories={AI_CATEGORIES}
        eyebrow="AI 观察"
        headline="把 AI 赛道里真正影响产品与战略的变化，排进同一个视野。"
        lead="聚焦 AI 产品、研究、商业、开发与政策变化，保留原有信息主线，但把阅读节奏压成更清楚的层级和更自然的浏览路径。"
        chips={["过去 24 小时 AI 更新", "产品、研究、商业并行浏览"]}
        overviewTitle="AI 概览"
        browseHint="如果你关心产品和商业，先看焦点卡片；如果你关心模型与工程变化，再用分类筛出研究与开发。"
        searchPlaceholder="搜索 AI 产品、模型、政策或公司"
        emptyMessage="近 24 小时暂无新增 AI 资讯"
        briefLabel="今日焦点"
        briefDescription="近 24 小时"
        listLabel="更多资讯"
        listDescription="从产品到政策，继续用同一套清晰的节奏往下看。"
      />
    </PublicShell>
  );
}
