import { NextResponse } from "next/server";
import { MOCK_INTEL_SUBSCRIPTIONS } from "@/lib/intelligence-mock";
import { buildLiveIntelligenceSnapshot } from "@/lib/intelligence-sources";
import { readOptionalJson } from "@/lib/kv-optional";

export const dynamic = "force-dynamic";

const SUBSCRIPTION_KEY = "intelligence-subscriptions";

export async function GET() {
  const [snapshot, subscriptions] = await Promise.all([
    buildLiveIntelligenceSnapshot(),
    readOptionalJson<string[]>(SUBSCRIPTION_KEY, MOCK_INTEL_SUBSCRIPTIONS),
  ]);

  return NextResponse.json({
    updatedAt: snapshot.updatedAt,
    sourceStatus: snapshot.sourceStatus,
    summary: snapshot.summary,
    featuredTopics: snapshot.featuredTopics,
    actors: snapshot.actors,
    vulnerabilities: snapshot.vulnerabilities,
    iocs: snapshot.iocs,
    advisories: snapshot.advisories,
    subscriptions: subscriptions.value,
    subscriptionStorage: subscriptions.storage,
  });
}
