export type TopNavLabel = "安全" | "AI" | "团队" | "情报中心" | "MDR";

export function getActiveNavLabel(pathname: string): TopNavLabel {
  if (pathname.startsWith("/ai")) return "AI";
  if (pathname.startsWith("/team")) return "团队";
  if (pathname.startsWith("/intelligence")) return "情报中心";
  if (pathname.startsWith("/mdr")) return "MDR";
  return "安全";
}
