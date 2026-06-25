"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getActiveNavLabel } from "@/lib/nav";
import { SystemIcon, type SystemIconName } from "@/components/ui/SystemIcon";

const NAV_ITEMS = [
  { label: "安全", href: "/", icon: "shield" },
  { label: "热榜", href: "/hot", icon: "activity" },
  { label: "AI", href: "/ai", icon: "spark" },
  { label: "团队", href: "/team", icon: "users" },
  { label: "情报中心", href: "/intelligence", icon: "radar" },
  { label: "MDR", href: "/mdr", icon: "activity" },
] satisfies Array<{ label: string; href: string; icon: SystemIconName }>;

const TONE_STYLES = {
  default: {
    headerBorder: "rgba(15, 23, 42, 0.08)",
    headerBackground: "rgba(248,250,252,0.78)",
    brandText: "text-slate-950",
    activeItem:
      "text-slate-950 bg-white border border-slate-200 shadow-[0_10px_24px_rgba(15,23,42,0.06)]",
    inactiveItem:
      "text-slate-500 hover:text-slate-900 hover:bg-white/70",
    auxiliary:
      "text-slate-500 border-slate-200 bg-white/55 hover:text-slate-900 hover:border-slate-300 hover:bg-white/80",
    auxiliaryActive:
      "text-slate-950 border-slate-300 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]",
  },
} as const;

export default function NavBar({
  tone = "default",
}: {
  tone?: keyof typeof TONE_STYLES;
}) {
  const pathname = usePathname();
  const active = getActiveNavLabel(pathname);
  const palette = TONE_STYLES[tone];

  return (
    <header
      className="system-nav-shell sticky top-0 z-20 border-b"
      style={{
        borderColor: palette.headerBorder,
        background: palette.headerBackground,
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
      }}
    >
      <div className="system-nav-bar mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link href="/" className="system-nav-brand system-focus-ring flex items-center gap-3 rounded-2xl">
          <span className="system-nav-logo flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/75 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <Image
              src="/logo.png"
              alt="网络安全日报"
              width={26}
              height={26}
              className="h-[26px] w-[26px] object-contain"
            />
          </span>
          <span className={`${palette.brandText} text-[15px] font-semibold tracking-[-0.02em]`}>
            网络安全日报
          </span>
        </Link>
        <nav className="system-nav-group flex w-full max-w-full items-center gap-2 overflow-x-auto rounded-full border border-white/70 bg-white/60 px-2 py-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:w-auto">
          <div className="flex min-w-max items-center gap-1">
            {NAV_ITEMS.map(({ label, href, icon }) => (
              <Link
                key={label}
                href={href}
                className={`system-nav-item system-focus-ring inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                  active === label ? palette.activeItem : palette.inactiveItem
                }`}
              >
                <SystemIcon name={icon} size={15} className="system-icon" />
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
