"use client";

import { useEffect, useState } from "react";
import { FeedItem } from "@/lib/feeds";
import NewsCard from "@/components/NewsCard";
import CategoryFilter from "@/components/CategoryFilter";
import Link from "next/link";

export default function Home() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("全部");
  const [search, setSearch] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setItems(data.items);
        setUpdatedAt(data.updatedAt);
      })
      .catch(() => setError("加载失败，请稍后刷新重试"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    const matchCat = category === "全部" || item.category === category;
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-lg font-bold leading-none">网络安全日报</h1>
              <p className="text-xs text-gray-500 mt-0.5">每日最新安全资讯聚合</p>
            </div>
          </div>
          <nav className="flex gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white"
            >
              全部资讯
            </Link>
            <Link
              href="/digest"
              className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              今日简报
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <CategoryFilter active={category} onChange={setCategory} />
          <input
            type="text"
            placeholder="搜索关键词..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:ml-auto bg-gray-900 border border-gray-700 rounded-full px-4 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-full sm:w-56"
          />
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">正在抓取最新安全资讯...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-32 text-red-400">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-32 text-gray-500">没有找到相关内容</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-xs text-gray-600 mb-4">共 {filtered.length} 条资讯</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
