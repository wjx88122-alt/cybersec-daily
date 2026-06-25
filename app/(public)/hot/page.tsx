import HotListClient from "@/components/feed/HotListClient";
import PublicShell from "@/components/shells/PublicShell";
import { readSecurityFeedItems } from "@/lib/feed-store";

// 热榜准实时刷新：每 5 分钟重新生成 (复用 KV 缓存数据，无需触发 cron)
export const revalidate = 300;

export default async function HotPage() {
  const items = await readSecurityFeedItems();

  return (
    <PublicShell>
      <HotListClient items={items} />
    </PublicShell>
  );
}
