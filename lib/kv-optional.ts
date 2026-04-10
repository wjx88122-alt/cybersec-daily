import { Redis } from "@upstash/redis";

export type OptionalStorageMode = "kv" | "memory";

let client: Redis | null = null;
const memoryStore = new Map<string, unknown>();

export function hasKvConfig(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function getClient(): Redis | null {
  if (!hasKvConfig()) {
    return null;
  }

  if (!client) {
    client = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }

  return client;
}

export async function readOptionalJson<T>(
  key: string,
  fallback: T,
): Promise<{ storage: OptionalStorageMode; value: T }> {
  const kv = getClient();

  if (!kv) {
    return {
      storage: "memory",
      value: (memoryStore.get(key) as T | undefined) ?? fallback,
    };
  }

  const value = await kv.get<T>(key);
  return { storage: "kv", value: value ?? fallback };
}

export async function writeOptionalJson<T>(
  key: string,
  value: T,
): Promise<{ storage: OptionalStorageMode; value: T }> {
  const kv = getClient();

  if (!kv) {
    memoryStore.set(key, value);
    return { storage: "memory", value };
  }

  await kv.set(key, value);
  return { storage: "kv", value };
}
