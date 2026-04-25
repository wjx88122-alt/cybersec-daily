import { NextResponse } from "next/server";

import { fetchAttackOperationsSnapshot } from "@/lib/attack-data-source";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  const snapshot = await fetchAttackOperationsSnapshot();

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
