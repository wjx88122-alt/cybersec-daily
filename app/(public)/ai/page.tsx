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
        eyebrow="AI 安全"
        headline="把 AI 安全面真正影响攻防与治理的变化，排进同一个视野。"
        lead="聚焦提示注入、对抗机器学习、红队、AI 治理与隐私，从官方实验室、安全厂商到学术论文，一站看全 AI 安全面今天最值得关注的事。"
        chips={["过去 24 小时 AI 安全动态", "攻击、防御、治理并行浏览"]}
        overviewTitle="AI 安全概览"
        browseHint="如果你关心攻击手法，先看红队与提示注入；如果你关心合规与标准，用分类筛出治理与隐私。"
        searchPlaceholder="搜索提示注入、对抗样本、红队、AI 治理…"
        emptyMessage="近 24 小时暂无新增 AI 安全资讯"
        briefLabel="今日焦点"
        briefDescription="近 24 小时"
        listLabel="更多资讯"
        listDescription="从攻击研究到治理标准，继续用同一套清晰的节奏往下看。"
      />
    </PublicShell>
  );
}
