import { ReactNode } from "react";
import ProductSectionShell from "./ProductSectionShell";

export default function MdrShell({
  children,
  className = "",
  showNav = true,
}: {
  children: ReactNode;
  className?: string;
  showNav?: boolean;
}) {
  return (
    <ProductSectionShell
      shellClassName="mdr-shell"
      systemTone="system-shell-light"
      className={className}
      showNav={showNav}
    >
      {children}
    </ProductSectionShell>
  );
}
