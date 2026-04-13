import { NextResponse } from "next/server";
import { MOCK_INTEL_SUBSCRIPTIONS } from "@/lib/intelligence-mock";
import { buildLiveIntelligenceSnapshot } from "@/lib/intelligence-sources";
import { readOptionalJson } from "@/lib/kv-optional";
import {
  buildGraphSnapshot,
  buildRelevanceSnapshot,
  type IntelligenceListsPayload,
} from "@/lib/intelligence-ops";

export const dynamic = "force-dynamic";

const SUBSCRIPTION_KEY = "intelligence-subscriptions";
const LISTS_KEY = "intelligence-lists";
const DEFAULT_LISTS: IntelligenceListsPayload = { threatList: [], safelist: [] };

export async function GET() {
  const [snapshot, subscriptions, lists] = await Promise.all([
    buildLiveIntelligenceSnapshot(),
    readOptionalJson<string[]>(SUBSCRIPTION_KEY, MOCK_INTEL_SUBSCRIPTIONS),
    readOptionalJson<IntelligenceListsPayload>(LISTS_KEY, DEFAULT_LISTS),
  ]);
  const relevance = buildRelevanceSnapshot(
    snapshot.actors,
    snapshot.vulnerabilities,
    snapshot.iocs,
  );
  const graph = buildGraphSnapshot(
    snapshot.actors,
    snapshot.vulnerabilities,
    snapshot.iocs,
  );

  return NextResponse.json({
    updatedAt: snapshot.updatedAt,
    sourceStatus: snapshot.sourceStatus,
    summary: snapshot.summary,
    featuredTopics: snapshot.featuredTopics,
    actors: snapshot.actors,
    vulnerabilities: snapshot.vulnerabilities,
    iocs: snapshot.iocs,
    advisories: snapshot.advisories,
    relevance,
    graph,
    threatList: lists.value.threatList,
    safelist: lists.value.safelist,
    subscriptions: subscriptions.value,
    subscriptionStorage: subscriptions.storage,
  });
}
