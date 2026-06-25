import { NextResponse } from "next/server";
import { readDigestFromStore } from "@/lib/feed-store";

export const revalidate = 300;

/**
 * 每日 AI 安全产业观察 JSON。
 * 复用现有 cron 生成的 digest (lib/digest.ts 产出, KV 存储)。
 */
export async function GET() {
  const digest = await readDigestFromStore();

  if (!digest) {
    return NextResponse.json(
      { ok: false, error: "Digest not generated yet, run cron first" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      date: digest.date,
      overview: digest.overview,
      items: digest.items,
    },
    { headers: { "cache-control": "public, max-age=300, s-maxage=300" } },
  );
}
