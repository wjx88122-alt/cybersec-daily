import type { Metadata } from "next";
import HotShell from "@/components/shells/HotShell";
import DailyContent from "@/components/feed/DailyContent";
import { loadDailyDigest } from "@/lib/hot-page-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "安全日报 · Security Hot",
  description: "每日安全动态精选综述，按日期回溯往期日报。",
};

export default async function DailyPage() {
  const data = await loadDailyDigest();
  return (
    <HotShell>
      <DailyContent data={data} />
    </HotShell>
  );
}
