"use client";

import Link from "next/link";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "资讯", href: "/" },
  { label: "AI", href: "/ai" },
  { label: "简报", href: "/digest" },
];

export default function NavBar({ active }: { active: string }) {
  return (
    <header
      className="sticky top-0 z-10 border-b border-white/[0.06]"
      style={{
        background: "rgba(8,12,20,0.85)",
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
          <span className="text-white font-bold text-base tracking-tight">
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
                  ? "text-white bg-white/[0.08] border border-white/[0.1]"
                  : "text-[#8b949e] hover:text-white hover:bg-white/[0.05]"
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
