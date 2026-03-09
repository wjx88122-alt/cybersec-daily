"use client";

import { useEffect, useState } from "react";
import { FeedItem, CUTOFF_MS } from "@/lib/feeds";
import NewsCard from "@/components/NewsCard";
import CategoryFilter from "@/components/CategoryFilter";
import NavBar from "@/components/NavBar";

export default function Home() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("全部");
  const [search, setSearch] = useState("");
  const [cutoff] = useState(() => Date.now() - CUTOFF_MS);

  useEffect(() => {
    Promise.all([
      fetch("/api/feed-a").then((r) => r.json()),
      fetch("/api/feed-b").then((r) => r.json()),
    ])
      .then(([dataA, dataB]) => {
        const all = [...(dataA.items || []), ...(dataB.items || [])];
        all.sort((a, b) => {
          const ta = new Date(a.pubDate).getTime();
          const tb = new Date(b.pubDate).getTime();
          return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
        });
        setItems(all);
      })
      .catch(() => setError("加载失败，请稍后刷新重试"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    const t = new Date(item.pubDate).getTime();
    const matchTime = !isNaN(t) && t >= cutoff;
    const matchCat = category === "全部" || item.category === category;
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.titleZh || "").toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      (item.summaryZh || "").toLowerCase().includes(search.toLowerCase());
    return matchTime && matchCat && matchSearch;
  });

  const [hero, ...rest] = filtered;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <NavBar active="安全" />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-4 relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="搜索资讯..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/[0.04] border border-white/[0.06] text-white placeholder-[#484f58] focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.06] transition-all"
          />
        </div>

        {/* Category filter */}
        <div className="mb-6 overflow-x-auto pb-1">
          <CategoryFilter active={category} onChange={setCategory} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-[#e5ff00]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-[#e5ff00] border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-[#484f58]">正在抓取最新安全资讯...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-32">
            <p className="text-sm text-red-400/80">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-32">
            <p className="text-sm text-[#484f58]">近 24 小时暂无新增资讯</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-xs mb-4 text-[#484f58]">
              近 24 小时{" "}
              <span className="text-[#6e7681] font-medium">
                {filtered.length}
              </span>{" "}
              条资讯
            </p>

            {/* Hero */}
            {hero && (
              <div className="mb-5">
                <NewsCard item={hero} hero />
              </div>
            )}

            {/* Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-start">
              {rest.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
