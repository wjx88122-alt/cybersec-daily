import assert from "node:assert/strict";
import test from "node:test";

const LLM_ENV_KEYS = [
  "DEEPSEEK_API_KEY",
  "DEEPSEEK_MODEL",
  "DEEPSEEK_ANALYSIS_MODEL",
  "DEEPSEEK_TRANSLATION_MODEL",
  "KIMI_API_KEY",
  "KIMI_MODEL",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
];

let importCounter = 0;

async function withLLMEnv(env, callback) {
  const previous = new Map();
  for (const key of LLM_ENV_KEYS) {
    previous.set(key, process.env[key]);
    delete process.env[key];
  }

  Object.assign(process.env, env);

  try {
    return await callback();
  } finally {
    for (const key of LLM_ENV_KEYS) {
      const value = previous.get(key);
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

async function loadDeepSeekConfig() {
  importCounter += 1;
  return import(`../lib/deepseek.ts?test=${Date.now()}-${importCounter}`);
}

test("DeepSeek defaults translation tasks to V4 Flash and analysis tasks to V4 Pro", async () => {
  await withLLMEnv({ DEEPSEEK_API_KEY: "test-key" }, async () => {
    const { getLLMModel, getLLMProvider } = await loadDeepSeekConfig();

    assert.equal(getLLMProvider(), "deepseek");
    assert.equal(getLLMModel("translation"), "deepseek-v4-flash");
    assert.equal(getLLMModel("analysis"), "deepseek-v4-pro");
  });
});

test("DeepSeek task-specific model variables override task defaults", async () => {
  await withLLMEnv(
    {
      DEEPSEEK_API_KEY: "test-key",
      DEEPSEEK_TRANSLATION_MODEL: "deepseek-v4-flash",
      DEEPSEEK_ANALYSIS_MODEL: "deepseek-v4-pro",
    },
    async () => {
      const { getLLMModel } = await loadDeepSeekConfig();

      assert.equal(getLLMModel("translation"), "deepseek-v4-flash");
      assert.equal(getLLMModel("analysis"), "deepseek-v4-pro");
    },
  );
});

test("DeepSeek V4 requests disable thinking by default", async () => {
  await withLLMEnv(
    {
      DEEPSEEK_API_KEY: "test-key",
    },
    async () => {
      const { getLLMChatOptions } = await loadDeepSeekConfig();

      assert.deepEqual(getLLMChatOptions("translation"), {
        thinking: { type: "disabled" },
      });
      assert.deepEqual(getLLMChatOptions("analysis"), {
        thinking: { type: "disabled" },
      });
    },
  );
});

test("non-DeepSeek providers do not receive DeepSeek-only chat options", async () => {
  await withLLMEnv({ KIMI_API_KEY: "test-key" }, async () => {
    const { getLLMChatOptions, getLLMProvider } = await loadDeepSeekConfig();

    assert.equal(getLLMProvider(), "kimi");
    assert.deepEqual(getLLMChatOptions(), {});
  });
});
