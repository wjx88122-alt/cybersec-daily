import { ReactNode } from "react";
import NavBar from "@/components/NavBar";

export default function ProductSectionShell({
  shellClassName,
  systemTone,
  className = "",
  showNav = true,
  children,
}: {
  shellClassName: string;
  systemTone: "system-shell-light" | "system-shell-dark";
  className?: string;
  showNav?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`min-h-screen ${shellClassName} system-shell ${systemTone} ${className}`.trim()}>
      {showNav ? <NavBar /> : null}
      {children}
    </div>
  );
}
