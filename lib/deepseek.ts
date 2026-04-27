import OpenAI from "openai";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
const DEEPSEEK_DEFAULT_ANALYSIS_MODEL = "deepseek-v4-pro";
const DEEPSEEK_DEFAULT_TRANSLATION_MODEL = "deepseek-v4-flash";
const KIMI_BASE_URL = "https://api.kimi.com/coding/v1";

export type LLMTask = "analysis" | "translation";

type LLMChatOptions = {
  thinking?: { type: "disabled" };
};

let cachedClient: OpenAI | null = null;
const cachedModels: Partial<Record<LLMTask, string>> = {};
let cachedProvider: "deepseek" | "kimi" | "openai" | null = null;

function resolveLLMConfig():
  | {
      provider: "deepseek";
      apiKey: string;
      baseURL: string;
      models: Record<LLMTask, string>;
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
    const globalModel = process.env.DEEPSEEK_MODEL?.trim();
    return {
      provider: "deepseek",
      apiKey: deepseekKey,
      baseURL: DEEPSEEK_BASE_URL,
      models: {
        analysis:
          process.env.DEEPSEEK_ANALYSIS_MODEL?.trim() ||
          globalModel ||
          DEEPSEEK_DEFAULT_ANALYSIS_MODEL,
        translation:
          process.env.DEEPSEEK_TRANSLATION_MODEL?.trim() ||
          globalModel ||
          DEEPSEEK_DEFAULT_TRANSLATION_MODEL,
      },
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
  cachedProvider = cfg.provider;

  cachedClient =
    cfg.provider === "openai"
      ? new OpenAI({ apiKey: cfg.apiKey })
      : new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });

  return cachedClient;
}

export function getLLMModel(task: LLMTask = "translation"): string {
  if (!cachedModels[task]) {
    const cfg = resolveLLMConfig();
    cachedProvider = cfg.provider;
    cachedModels[task] = cfg.provider === "deepseek" ? cfg.models[task] : cfg.model;
  }
  return cachedModels[task];
}

export function getLLMProvider(): "deepseek" | "kimi" | "openai" {
  if (!cachedProvider) {
    const cfg = resolveLLMConfig();
    cachedProvider = cfg.provider;
  }
  return cachedProvider;
}

export function getLLMChatOptions(task: LLMTask = "translation"): LLMChatOptions {
  const provider = getLLMProvider();
  const model = getLLMModel(task);

  if (provider === "deepseek" && model.startsWith("deepseek-v4-")) {
    return { thinking: { type: "disabled" } };
  }

  return {};
}
