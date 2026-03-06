import OpenAI from "openai";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
const KIMI_BASE_URL = "https://api.kimi.com/coding/v1";

let cachedClient: OpenAI | null = null;
let cachedModel: string | null = null;
let cachedProvider: "deepseek" | "kimi" | "openai" | null = null;

function resolveLLMConfig():
  | {
      provider: "deepseek";
      apiKey: string;
      baseURL: string;
      model: string;
    }
  | {
      provider: "kimi";
      apiKey: string;
      baseURL: string;
      model: string;
    }
  | {
      provider: "openai";
      apiKey: string;
      model: string;
    } {
  const deepseekKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (deepseekKey) {
    return {
      provider: "deepseek",
      apiKey: deepseekKey,
      baseURL: DEEPSEEK_BASE_URL,
      model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat",
    };
  }

  const kimiKey = process.env.KIMI_API_KEY?.trim();
  if (kimiKey) {
    return {
      provider: "kimi",
      apiKey: kimiKey,
      baseURL: KIMI_BASE_URL,
      model: process.env.KIMI_MODEL?.trim() || "kimi-k2",
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    return {
      provider: "openai",
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    };
  }

  throw new Error(
    "No LLM key configured. Set DEEPSEEK_API_KEY (preferred) or KIMI_API_KEY / OPENAI_API_KEY.",
  );
}

export function getDeepSeekClient(): OpenAI {
  if (cachedClient) return cachedClient;

  const cfg = resolveLLMConfig();
  cachedModel = cfg.model;
  cachedProvider = cfg.provider;

  cachedClient =
    cfg.provider === "openai"
      ? new OpenAI({ apiKey: cfg.apiKey })
      : new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });

  return cachedClient;
}

export function getLLMModel(): string {
  if (!cachedModel) {
    const cfg = resolveLLMConfig();
    cachedModel = cfg.model;
  }
  return cachedModel;
}

export function getLLMProvider(): "deepseek" | "kimi" | "openai" {
  if (!cachedProvider) {
    const cfg = resolveLLMConfig();
    cachedProvider = cfg.provider;
  }
  return cachedProvider;
}
