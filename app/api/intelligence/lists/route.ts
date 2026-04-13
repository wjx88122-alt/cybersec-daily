import { NextRequest, NextResponse } from "next/server";
import { readOptionalJson, writeOptionalJson } from "@/lib/kv-optional";
import {
  type IntelligenceListsPayload,
  normalizeListEntry,
} from "@/lib/intelligence-ops";

export const dynamic = "force-dynamic";

const LISTS_KEY = "intelligence-lists";
const DEFAULT_LISTS: IntelligenceListsPayload = { threatList: [], safelist: [] };

export async function GET() {
  const result = await readOptionalJson<IntelligenceListsPayload>(
    LISTS_KEY,
    DEFAULT_LISTS,
  );

  return NextResponse.json({
    ...result.value,
    storage: result.storage,
  });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const list =
    payload?.list === "threat" || payload?.list === "safelist"
      ? payload.list
      : null;

  if (!list) {
    return NextResponse.json({ error: "list is required" }, { status: 400 });
  }

  if (!payload?.entry?.id || !payload?.entry?.label || !payload?.entry?.kind) {
    return NextResponse.json({ error: "entry is required" }, { status: 400 });
  }

  const current = await readOptionalJson<IntelligenceListsPayload>(
    LISTS_KEY,
    DEFAULT_LISTS,
  );
  const nextEntry = normalizeListEntry(payload.entry);
  const targetKey = list === "threat" ? "threatList" : "safelist";
  const next = {
    ...current.value,
    [targetKey]: [
      nextEntry,
      ...current.value[targetKey].filter((item) => item.id !== nextEntry.id),
    ].slice(0, 20),
  } satisfies IntelligenceListsPayload;

  const saved = await writeOptionalJson<IntelligenceListsPayload>(LISTS_KEY, next);
  return NextResponse.json({
    ...saved.value,
    storage: saved.storage,
  });
}
