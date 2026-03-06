import OpenAI from "openai";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

let cachedClient: OpenAI | null = null;

export function getDeepSeekClient(): OpenAI {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not set");
  }

  cachedClient = new OpenAI({
    apiKey,
    baseURL: DEEPSEEK_BASE_URL,
  });

  return cachedClient;
}
