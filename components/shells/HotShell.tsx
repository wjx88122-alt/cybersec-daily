"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { SystemIcon, type SystemIconName } from "@/components/ui/SystemIcon";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

/** 导航分组结构，对齐 AI HOT 的"内容 / 接入 / 更多"分区。 */
type NavItem = { label: string; href: string; icon: SystemIconName };
type NavGroup = { heading: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    heading: "内容",
    items: [
      { label: "精选", href: "/hot", icon: "spark" },
      { label: "全部安全动态", href: "/all", icon: "list" },
      { label: "安全日报", href: "/daily", icon: "file" },
    ],
  },
  {
    heading: "接入",
    items: [{ label: "Agent 接入", href: "/agent", icon: "plug" }],
  },
  {
    heading: "更多",
    items: [
      { label: "关于", href: "/hot#about", icon: "eye" },
      { label: "反馈", href: "/hot#feedback", icon: "alert" },
    ],
  },
];

/** 当前路由高亮：精确匹配 > 前缀匹配（/daily 覆盖 /daily/[date]）。 */
function isActive(pathname: string, href: string): boolean {
  // 去掉 hash/anchor
  const clean = href.split("#")[0];
  if (pathname === clean) return true;
  // /daily 匹配 /daily/2026-06-26；但 /hot 不应匹配 /hot/...（暂无子路由）
  if (clean === "/daily" && pathname.startsWith("/daily/")) return true;
  return false;
}

function NavButton({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      className={`group inline-flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
        active
          ? "bg-slate-900/5 text-slate-950 dark:bg-slate-100/10 dark:text-white"
          : "text-slate-500 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-100/5 dark:hover:text-slate-100"
      }`}
    >
      <SystemIcon
        name={item.icon}
        size={16}
        className="system-icon shrink-0 opacity-70 group-hover:opacity-100"
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function Sidebar() {
  return (
    <aside
      aria-label="主导航"
      className="flex h-full flex-col border-r border-slate-200/70 bg-white/60 px-3 py-5 dark:border-slate-800/70 dark:bg-slate-950/60"
    >
      {/* 品牌区 */}
      <Link
        href="/hot"
        className="mb-7 inline-flex items-baseline gap-1 rounded-lg px-3"
      >
        <span className="text-[17px] font-bold tracking-tight text-slate-950 dark:text-white">
          SEC
        </span>
        <span className="text-[17px] font-bold tracking-tight text-emerald-500">
          HOT
        </span>
      </Link>

      {/* 导航分组 */}
      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading} className="px-1">
            <div className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.heading}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <NavButton key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* 底部：主题切换 + 登录 */}
      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-800/70">
        <div className="px-1">
          <ThemeToggle />
        </div>
        <Link
          href="/hot#login"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <SystemIcon name="user" size={14} className="system-icon" />
          登录
        </Link>
      </div>
    </aside>
  );
}

export default function HotShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ThemeProvider>
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* 移动端顶部栏 + 抽屉触发 */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 lg:hidden dark:border-slate-800">
        <Link href="/hot" className="inline-flex items-baseline gap-1">
          <span className="text-[15px] font-bold tracking-tight text-slate-950 dark:text-white">
            SEC
          </span>
          <span className="text-[15px] font-bold tracking-tight text-emerald-500">
            HOT
          </span>
        </Link>
        <button
          type="button"
          aria-label="菜单"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          <SystemIcon name={mobileOpen ? "x" : "list"} size={18} className="system-icon" />
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        {/* 桌面端常驻 sidebar */}
        <div className="sticky top-0 hidden h-screen lg:block">
          <Sidebar />
        </div>

        {/* 移动端抽屉 */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[260px]">
              <Sidebar />
            </div>
          </div>
        )}

        {/* 主内容区 */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
    </ThemeProvider>
  );
}
