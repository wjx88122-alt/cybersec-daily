import type { Metadata } from "next";
import PublicShell from "@/components/shells/PublicShell";
import { SystemIcon } from "@/components/ui/SystemIcon";
import NewsCard from "@/components/NewsCard";
import { loadAllTimeline } from "@/lib/hot-page-data";
import { HOT_ALL_LIMIT } from "@/lib/hot-page-data";

export const revalidate = 300;

const SITE_URL = "https://cybersec-daily.vercel.app";

export const metadata: Metadata = {
  title: "全部安全动态 · Security Hot",
  description:
    "最近 7 天全部网络安全动态，按真实发布时间倒序。要按热度排序请看 /hot。",
  alternates: {
    canonical: `${SITE_URL}/all`,
    types: {
      "application/rss+xml": [
        { url: `${SITE_URL}/hot/feed/all.xml`, title: "Security Hot — 全量 RSS" },
      ],
    },
  },
  openGraph: {
    title: "全部安全动态 · Security Hot",
    url: `${SITE_URL}/all`,
    siteName: "网络安全日报",
    locale: "zh_CN",
    type: "website",
  },
};

export default async function AllPage() {
  const items = await loadAllTimeline(HOT_ALL_LIMIT);

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        <header className="mb-8">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <SystemIcon name="timeline" size={14} className="system-icon" />
            全部安全动态 · Timeline
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[2.6rem]">
            最近 7 天全部安全资讯
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-8 text-slate-600">
            按真实发布时间倒序，不聚合、不排序。要按热度看，去
            <a href="/hot" className="font-medium text-amber-600 underline-offset-2 hover:underline">
              {" "}安全热榜
            </a>
            。
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} coverageCount={item.coverageCount} />
          ))}
        </div>

        {items.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/50 px-6 py-20 text-center text-slate-500">
            近 7 天暂无新增安全资讯
          </div>
        )}
      </div>
    </PublicShell>
  );
}
