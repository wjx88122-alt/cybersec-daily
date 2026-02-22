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

  const filtered = items.filter((item) => {
    const matchCat = category === "全部" || item.category === category;
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* iOS-style nav bar */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--separator)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="font-semibold text-base" style={{ color: "var(--foreground)" }}>
              家兴的网络安全日报
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ background: "#007aff", color: "#fff" }}
            >
              资讯
            </Link>
            <Link
              href="/digest"
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ color: "#007aff" }}
            >
              简报
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="搜索资讯..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Category filter */}
        <div className="mb-5 overflow-x-auto pb-1">
          <CategoryFilter active={category} onChange={setCategory} />
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm" style={{ color: "var(--secondary-text)" }}>正在抓取最新安全资讯...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-32 text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-32 text-sm" style={{ color: "var(--secondary-text)" }}>
            没有找到相关内容
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-xs mb-3" style={{ color: "var(--secondary-text)" }}>
              共 {filtered.length} 条资讯
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
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
