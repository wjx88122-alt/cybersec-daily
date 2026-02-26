"use client";

import Link from "next/link";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "资讯", href: "/" },
  { label: "AI", href: "/ai" },
  { label: "简报", href: "/digest" },
  { label: "MDR", href: "/mdr" },
];

export default function NavBar({ active }: { active: string }) {
  return (
    <header
      className="sticky top-0 z-10 border-b border-black/[0.06]"
      style={{
        background: "rgba(245,247,250,0.9)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="网络安全日报"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-[#1a1a2e] font-bold text-base tracking-tight">
            网络安全日报
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                active === label
                  ? "text-[#1a1a2e] bg-black/[0.06] border border-black/[0.08]"
                  : "text-[#64748b] hover:text-[#1a1a2e] hover:bg-black/[0.04]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
