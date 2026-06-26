import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HotShell from "@/components/shells/HotShell";
import DailyContent, { formatDateLabel } from "@/components/feed/DailyContent";
import { loadDailyDigest } from "@/lib/hot-page-data";

export const revalidate = 300;

type Params = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { title: "未找到 · Security Hot" };
  const data = await loadDailyDigest(date);
  return { title: `安全日报 · ${formatDateLabel(data.date)}` };
}

export default async function DailyDatePage({ params }: Params) {
  const { date } = await params;
  // 格式校验
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  const data = await loadDailyDigest(date);
  // 指定日期不在历史中 → 404
  if (!data.history.some((h) => h.date === date)) notFound();

  return (
    <HotShell>
      <DailyContent data={data} />
    </HotShell>
  );
}
