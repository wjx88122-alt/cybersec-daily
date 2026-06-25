import Link from "next/link";
import PublicShell from "@/components/shells/PublicShell";
import { SystemIcon } from "@/components/ui/SystemIcon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent 接入 · Security Hot",
  description:
    "把 Security Hot 接进你的 AI Agent。RSS / REST API / Skill 三种接入方式，让 Claude / Cursor / ChatGPT 实时拿到安全热榜。",
};

const SITE = "https://cybersec-daily.vercel.app";

export default function AgentPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600">
            <SystemIcon name="plug" size={14} className="system-icon" />
            Agent 接入 · Integration
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
            把 Security Hot 接进你的 AI Agent
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-8 text-slate-600">
            三种接入方式，让 Claude / Cursor / ChatGPT 等 AI Agent
            实时拿到安全热榜与每日产业观察。全部匿名只读，无需 token。
          </p>
        </div>

        {/* 三轨卡片 */}
        <div className="grid gap-5 sm:grid-cols-3">
          <TrackCard
            icon="rss"
            num="01"
            title="RSS 订阅"
            en="RSS Feeds"
            desc="标准 RSS，接 RSS 阅读器、自动化管道、聚合站。"
            links={[
              { label: "精选热榜", url: `${SITE}/hot/feed.xml` },
              { label: "全量动态", url: `${SITE}/hot/feed/all.xml` },
            ]}
          />
          <TrackCard
            icon="server"
            num="02"
            title="REST API"
            en="REST API"
            desc="JSON 接口，cursor 翻页，适合 Agent / 二次开发。"
            links={[
              { label: "热榜条目", url: `${SITE}/api/hot/items?limit=10` },
              { label: "每日观察", url: `${SITE}/api/hot/daily` },
              { label: "OpenAPI 规范", url: `${SITE}/hot-openapi.yaml` },
            ]}
          />
          <TrackCard
            icon="spark"
            num="03"
            title="Agent Skill"
            en="Agent Skill"
            desc="把下面的 Skill 配置粘给 Claude / Cursor，即可实时查询。"
            links={[]}
          />
        </div>

        {/* Skill 配置 */}
        <section className="mt-12">
          <h2 className="mb-3 text-xl font-semibold tracking-[-0.02em] text-slate-950">
            Agent Skill 配置
          </h2>
          <p className="mb-4 text-sm leading-7 text-slate-600">
            把这段配置加入你的 Agent 工具集，它就能调用 Security Hot
            的 API 获取最新安全热榜：
          </p>
          <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-5 text-[12.5px] leading-6 text-slate-100">
            <code>{`name: security_hot
description: 查询中文网络安全热榜 (Security Hot)，跨数十个信源聚合、按热度排序。
api:
  base_url: ${SITE}
  endpoints:
    - path: /api/hot/items
      desc: 安全热榜条目，支持 cursor 翻页
      params: { mode: "selected|all", window: "24h|7d", limit: 50, cursor: null }
    - path: /api/hot/daily
      desc: 每日安全产业观察 (LLM 生成)
usage: |
  用户问"今天安全圈有什么热点" → 调 GET /api/hot/items?limit=10
  用户问"本周最热的漏洞" → 调 GET /api/hot/items?window=7d&mode=selected
  用户要每日简报 → 调 GET /api/hot/daily
rate_limit: 600 r/min per IP`}</code>
          </pre>
        </section>

        {/* 排序契约 */}
        <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
          <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-amber-900">
            <SystemIcon name="alert" size={16} className="system-icon" />
            开发者契约红线
          </h2>
          <ul className="space-y-1.5 text-[13px] leading-6 text-amber-900/90">
            <li>· 按 <code className="rounded bg-amber-100 px-1">id</code> 去重，不要按 permalink（会变）。</li>
            <li>· cursor 失效/篡改会静默回首屏，不报错。</li>
            <li>· 限流 600 r/min，串行调用 + 翻页加 200ms 间隔即可。</li>
            <li>· <code className="rounded bg-amber-100 px-1">coverageCount &gt; 1</code> 表示该事件被多信源报道，可作热度信号。</li>
          </ul>
        </section>

        <div className="mt-10">
          <Link
            href="/hot"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            <SystemIcon name="arrowRight" size={15} className="system-icon rotate-180" />
            返回安全热榜
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}

function TrackCard({
  icon,
  num,
  title,
  en,
  desc,
  links,
}: {
  icon: "rss" | "server" | "spark";
  num: string;
  title: string;
  en: string;
  desc: string;
  links: Array<{ label: string; url: string }>;
}) {
  const iconName = icon === "rss" ? "refresh" : icon === "server" ? "server" : "spark";
  return (
    <div className="rounded-[26px] border border-slate-200/80 bg-white/82 p-6 shadow-[0_16px_44px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <SystemIcon name={iconName} size={20} className="system-icon" />
        </span>
        <span className="text-2xl font-bold tabular-nums text-slate-300">{num}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-slate-950">
        {title}
      </h3>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-600">
        {en}
      </p>
      <p className="mt-3 text-[13px] leading-6 text-slate-600">{desc}</p>
      {links.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {links.map((l) => (
            <li key={l.url}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-700 transition-colors hover:text-amber-600"
              >
                <SystemIcon name="external" size={11} className="system-icon" />
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
