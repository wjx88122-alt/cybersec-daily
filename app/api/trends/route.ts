import { kv } from "@/lib/kv";
import { DailySnapshot } from "@/lib/snapshot";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VALID_DAYS = [7, 14, 30];

export async function GET(req: NextRequest) {
  const daysParam = Number(req.nextUrl.searchParams.get("days") ?? "7");
  const days = VALID_DAYS.includes(daysParam) ? daysParam : 7;

  try {
    const snapshots = await kv.get<DailySnapshot[]>("snapshots");
    const data = (snapshots ?? []).slice(-days);
    return NextResponse.json({ snapshots: data, generatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Failed to load trends" }, { status: 500 });
  }
}
