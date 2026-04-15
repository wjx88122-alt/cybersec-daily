import { Redis } from "@upstash/redis";
import { clearTranslatedFieldsForRetranslation } from "../lib/translation-repair.ts";

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;

if (!kvUrl || !kvToken) {
  throw new Error("Missing KV_REST_API_URL or KV_REST_API_TOKEN");
}

const kv = new Redis({
  url: kvUrl,
  token: kvToken,
});

const args = new Set(process.argv.slice(2));
const scope = args.has("--scope=all") || args.has("--all") ? "all" : "recent";
const dryRun = args.has("--dry-run");

function normalizeBaseUrl(value) {
  const trimmed = value?.trim();
  if (!trimmed) return "http://127.0.0.1:3000";
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/+$/, "");
  return `https://${trimmed.replace(/\/+$/, "")}`;
}

async function triggerTranslate(scope) {
  const authToken = process.env.CRON_SECRET?.trim();
  if (!authToken) {
    console.warn("repair-translations: CRON_SECRET missing, skipping translate trigger");
    return;
  }

  const appBaseUrl = normalizeBaseUrl(
    process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL,
  );
  const url = `${appBaseUrl}/api/translate${scope === "recent" ? "?scope=recent" : ""}`;
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${authToken}`,
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      `translate trigger failed: ${response.status} ${JSON.stringify(payload)}`,
    );
  }

  console.log("repair-translations: translate trigger accepted", payload);
}

async function run() {
  const [feedA, feedB, feedAI] = await Promise.all([
    kv.get("feed-a"),
    kv.get("feed-b"),
    kv.get("feed-ai"),
  ]);

  const safeA = Array.isArray(feedA) ? feedA : [];
  const safeB = Array.isArray(feedB) ? feedB : [];
  const safeAI = Array.isArray(feedAI) ? feedAI : [];

  const repairedA = clearTranslatedFieldsForRetranslation(safeA, { scope });
  const repairedB = clearTranslatedFieldsForRetranslation(safeB, { scope });
  const repairedAI = clearTranslatedFieldsForRetranslation(safeAI, { scope });

  const clearedItems =
    repairedA.clearedItems + repairedB.clearedItems + repairedAI.clearedItems;
  const clearedFields =
    repairedA.clearedFields + repairedB.clearedFields + repairedAI.clearedFields;

  console.log(
    `repair-translations: scope=${scope} clearedItems=${clearedItems} clearedFields=${clearedFields}`,
  );

  if (dryRun) {
    console.log("repair-translations: dry run, no KV updates written");
    return;
  }

  await Promise.all([
    kv.set("feed-a", repairedA.items),
    kv.set("feed-b", repairedB.items),
    kv.set("feed-ai", repairedAI.items),
  ]);

  if (clearedItems > 0) {
    await triggerTranslate(scope);
  } else {
    console.log("repair-translations: nothing cleared, skipping translate trigger");
  }
}

run().catch((error) => {
  console.error("repair-translations: fatal", error);
  process.exit(1);
});
