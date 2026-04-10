import { NextRequest, NextResponse } from "next/server";
import { MOCK_INTEL_SUBSCRIPTIONS } from "@/lib/intelligence-mock";
import { readOptionalJson, writeOptionalJson } from "@/lib/kv-optional";

export const dynamic = "force-dynamic";

const SUBSCRIPTION_KEY = "intelligence-subscriptions";

export async function GET() {
  const result = await readOptionalJson<string[]>(
    SUBSCRIPTION_KEY,
    MOCK_INTEL_SUBSCRIPTIONS,
  );

  return NextResponse.json({ items: result.value, storage: result.storage });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const topic =
    typeof payload?.topic === "string" ? payload.topic.trim() : "";

  if (!topic) {
    return NextResponse.json(
      { error: "topic is required" },
      { status: 400 },
    );
  }

  const current = await readOptionalJson<string[]>(
    SUBSCRIPTION_KEY,
    MOCK_INTEL_SUBSCRIPTIONS,
  );
  const next = [topic, ...current.value.filter((item) => item !== topic)].slice(
    0,
    12,
  );
  const saved = await writeOptionalJson<string[]>(SUBSCRIPTION_KEY, next);

  return NextResponse.json({ items: saved.value, storage: saved.storage });
}
