import { ReactNode } from "react";
import { teamShellGlowClass } from "@/app/(executive)/team/theme";
import ProductSectionShell from "./ProductSectionShell";
import type { TeamShellGlowTone } from "@/app/(executive)/team/theme";

export default function TeamShell({
  children,
  className = "",
  contentClassName = "",
  glowTone = "default",
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  glowTone?: TeamShellGlowTone;
}) {
  return (
    <ProductSectionShell
      shellClassName="team-shell"
      systemTone="system-shell-light"
      className={`${teamShellGlowClass(glowTone)} overflow-hidden ${className}`.trim()}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[-10%] top-[-8rem] h-72 w-72 rounded-full blur-3xl"
          style={{ background: "var(--team-shell-glow-left)" }}
        />
        <div
          className="absolute right-[-8%] top-24 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "var(--team-shell-glow-right)" }}
        />
        <div
          className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "var(--team-shell-glow-bottom)" }}
        />
      </div>

      <div className={`relative noise min-h-screen ${contentClassName}`.trim()}>
        {children}
      </div>
    </ProductSectionShell>
  );
}
