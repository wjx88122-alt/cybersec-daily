"use client";

import { useEffect, useState } from "react";
import { FeedItem } from "@/lib/feeds";
import NewsCard from "@/components/NewsCard";
import CategoryFilter from "@/components/CategoryFilter";
import Link from "next/link";

import Image from "next/image";

export default function Home() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("全部");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/feed-a").then((r) => r.json()),
      fetch("/api/feed-b").then((r) => r.json()),
    ])
      .then(([dataA, dataB]) => {
        const all = [...(dataA.items || []), ...(dataB.items || [])];
        all.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        setItems(all);
      })
      .catch(() => setError("加载失败，请稍后刷新重试"))
      .finally(() => setLoading(false));
  }, []);

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const filtered = items.filter((item) => {
    const matchTime = new Date(item.pubDate).getTime() >= cutoff;
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
    <div className="min-h-screen bg-[#111]">
      <header className="sticky top-0 z-10 bg-black border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="网络安全日报" width={120} height={40} className="object-contain" />
          </Link>
          <nav className="flex items-center">
            <Link
              href="/"
              className="px-4 h-12 flex items-center text-sm font-semibold text-white border-b-2 border-[#e5ff00]"
            >
              资讯
            </Link>
            <Link
              href="/digest"
              className="px-4 h-12 flex items-center text-sm font-semibold text-[#888] hover:text-white transition-colors border-b-2 border-transparent"
            >
              简报
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="搜索资讯..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 text-sm focus:outline-none bg-[#1a1a1a] border border-[#333] text-white placeholder-[#555]"
          />
        </div>

        <div className="mb-6 overflow-x-auto pb-1">
          <CategoryFilter active={category} onChange={setCategory} />
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-7 h-7 border-2 border-[#e5ff00] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#666]">正在抓取最新安全资讯...</p>
          </div>
        )}

        {error && <div className="text-center py-32 text-red-500 text-sm">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-32 text-sm text-[#666]">今日暂无新增资讯</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-xs mb-4 text-[#555]">今日新增 {filtered.length} 条</p>
            {hero && (
              <div className="mb-6">
                <NewsCard item={hero} hero />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
