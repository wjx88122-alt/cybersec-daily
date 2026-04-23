import { ReactNode } from "react";
import ProductSectionShell from "./ProductSectionShell";

export default function TeamShell({
  children,
  className = "",
  contentClassName = "",
  bottomGlow = "rgba(34,197,94,0.1)",
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  bottomGlow?: string;
}) {
  return (
    <ProductSectionShell
      shellClassName="team-shell"
      systemTone="system-shell-light"
      className={`overflow-hidden ${className}`.trim()}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[-10%] top-[-8rem] h-72 w-72 rounded-full blur-3xl"
          style={{ background: "rgba(37,99,235,0.22)" }}
        />
        <div
          className="absolute right-[-8%] top-24 h-80 w-80 rounded-full blur-3xl"
          style={{ background: "rgba(229,255,0,0.12)" }}
        />
        <div
          className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full blur-3xl"
          style={{ background: bottomGlow }}
        />
      </div>

      <div className={`relative noise min-h-screen ${contentClassName}`.trim()}>
        {children}
      </div>
    </ProductSectionShell>
  );
}
