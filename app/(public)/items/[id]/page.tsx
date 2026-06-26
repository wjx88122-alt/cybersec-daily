import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HotShell from "@/components/shells/HotShell";
import ItemDetailClient from "@/components/feed/ItemDetailClient";
import { getItemDetail, hotItemTitle } from "@/lib/hot-page-data";

export const revalidate = 300;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const detail = await getItemDetail(id);
  if (!detail) return { title: "未找到 · Security Hot" };
  const title = `${hotItemTitle(detail.item)} · Security Hot`;
  return {
    title,
    description: detail.item.summaryAi || detail.item.summary,
    openGraph: { title, type: "article" },
  };
}

export default async function ItemDetailPage({ params }: Params) {
  const { id } = await params;
  const detail = await getItemDetail(id);
  if (!detail) notFound();

  return (
    <HotShell>
      <ItemDetailClient item={detail.item} siblings={detail.siblings} />
    </HotShell>
  );
}
