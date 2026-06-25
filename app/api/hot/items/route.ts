import { NextRequest, NextResponse } from "next/server";
import {
  loadHotItems,
  hotItemToJson,
  encodeCursor,
  decodeCursor,
  HOT_API_PAGE_SIZE,
  HOT_DEFAULT_WINDOW,
  HOT_SELECTED_LIMIT,
} from "@/lib/hot-page-data";
import type { HotWindow } from "@/lib/hot-page-data";

export const revalidate = 300;

const RATE_LIMIT_RPM = 600;
const ipHit = new Map<string, { count: number; windowStart: number }>();

/** 简易内存限流: 单 IP ${RATE_LIMIT_RPM} r/min (burst 40), 超出 429。 */
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHit.get(ip);
  if (!entry || now - entry.windowStart > 60_000) {
    ipHit.set(ip, { count: 1, windowStart: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= RATE_LIMIT_RPM + 40;
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: 60 },
      { status: 429 },
    );
  }

  const sp = req.nextUrl.searchParams;
  const mode = sp.get("mode") === "all" ? "all" : "selected";
  const windowParam: HotWindow = sp.get("window") === "7d" ? "7d" : HOT_DEFAULT_WINDOW;
  const cursor = sp.get("cursor");
  const limitRaw = Number(sp.get("limit"));
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(limitRaw, HOT_API_PAGE_SIZE)
      : HOT_API_PAGE_SIZE;

  // 全量拉取后做 cursor 分页 (7d 窗口, 单次足够覆盖翻页需求)
  const all = await loadHotItems(windowParam);
  const pool = mode === "all" ? all : all.filter((i) => i.rank <= HOT_SELECTED_LIMIT);

  // cursor 定位: 解码得到上一个分页末尾的 (rank, id), 从其后开始
  let startIdx = 0;
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      const foundIdx = pool.findIndex(
        (i) => i.rank === decoded.r && i.id === decoded.i,
      );
      startIdx = foundIdx >= 0 ? foundIdx + 1 : 0; // 失效 → 静默回首屏
    }
  }

  const page = pool.slice(startIdx, startIdx + limit);
  const hasNext = startIdx + limit < pool.length;
  const last = page[page.length - 1];
  const nextCursor =
    hasNext && last ? encodeCursor(last.rank, last.id) : null;

  return NextResponse.json(
    {
      count: page.length,
      window: windowParam,
      mode,
      hasNext,
      nextCursor,
      items: page.map(hotItemToJson),
    },
    {
      headers: { "cache-control": "public, max-age=300, s-maxage=300" },
    },
  );
}
