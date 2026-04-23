import { ReactNode } from "react";
import ProductSectionShell from "./ProductSectionShell";

export default function PublicShell({ children }: { children: ReactNode }) {
  return (
    <ProductSectionShell shellClassName="public-shell" systemTone="system-shell-light">
      {children}
    </ProductSectionShell>
  );
}
