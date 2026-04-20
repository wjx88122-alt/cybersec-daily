import { Redis } from "@upstash/redis";

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;

const memoryStore = new Map<string, unknown>();

function createMemoryKv() {
  return {
    get: async <T>(key: string): Promise<T | null> => {
      const value = memoryStore.get(key);
      return (value as T | undefined) ?? null;
    },
    set: async (_key: string, _value: unknown) => {
      memoryStore.set(_key, _value);
      return "OK";
    },
  } satisfies {
    get: <T>(key: string) => Promise<T | null>;
    set: <T>(key: string, value: T) => Promise<unknown>;
  };
}

function createKv() {
  if (!kvUrl || !kvToken) {
    return createMemoryKv();
  }

  return new Redis({
    url: kvUrl,
    token: kvToken,
  });
}

export const kv = createKv();
