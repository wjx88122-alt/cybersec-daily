"use client";

import Link from "next/link";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "安全", href: "/" },
  { label: "AI", href: "/ai" },
  { label: "团队", href: "/team" },
  { label: "MDR", href: "/mdr" },
];

const AUXILIARY_ITEM = { label: "酱酱", href: "/jiangjiang" };

const TONE_STYLES = {
  default: {
    headerBorder: "rgba(0, 0, 0, 0.06)",
    headerBackground: "rgba(245,247,250,0.9)",
    brandText: "text-[#1a1a2e]",
    activeItem: "text-[#1a1a2e] bg-black/[0.06] border border-black/[0.08]",
    inactiveItem: "text-[#64748b] hover:text-[#1a1a2e] hover:bg-black/[0.04]",
    auxiliary:
      "text-[#64748b] border-black/[0.08] bg-white/[0.45] hover:text-[#1a1a2e] hover:border-black/[0.12] hover:bg-white/[0.68]",
    auxiliaryActive:
      "text-[#1a1a2e] border-black/[0.12] bg-black/[0.05] shadow-[0_8px_20px_rgba(15,23,42,0.06)]",
  },
  warm: {
    headerBorder: "rgba(120, 83, 50, 0.12)",
    headerBackground: "rgba(255,248,240,0.86)",
    brandText: "text-[#5b3f2a]",
    activeItem:
      "text-[#5b3f2a] bg-[#c8844a]/10 border border-[#c8844a]/16 shadow-[0_10px_24px_rgba(145,98,56,0.08)]",
    inactiveItem: "text-[#8b6b54] hover:text-[#5b3f2a] hover:bg-[#c8844a]/8",
    auxiliary:
      "text-[#8b6b54] border-[#c9a07a]/25 bg-white/55 hover:text-[#5b3f2a] hover:border-[#c9a07a]/40 hover:bg-white/75",
    auxiliaryActive:
      "text-[#5b3f2a] border-[#c8844a]/22 bg-[#c8844a]/10 shadow-[0_10px_24px_rgba(145,98,56,0.08)]",
  },
} as const;

export default function NavBar({
  active,
  tone = "default",
}: {
  active: string;
  tone?: keyof typeof TONE_STYLES;
}) {
  const palette = TONE_STYLES[tone];

  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{
        borderColor: palette.headerBorder,
        background: palette.headerBackground,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="网络安全日报"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className={`${palette.brandText} text-base font-bold tracking-tight`}>
            网络安全日报
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  active === label ? palette.activeItem : palette.inactiveItem
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href={AUXILIARY_ITEM.href}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
              active === AUXILIARY_ITEM.label
                ? palette.auxiliaryActive
                : palette.auxiliary
            }`}
          >
            {AUXILIARY_ITEM.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
