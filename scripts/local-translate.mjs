import { Redis } from '@upstash/redis';
import OpenAI from 'openai';
import { jsonrepair } from 'jsonrepair';

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const kimiApiKey = process.env.KIMI_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!kvUrl || !kvToken) {
  throw new Error('Missing KV_REST_API_URL or KV_REST_API_TOKEN');
}

function resolveLlmConfig() {
  if (deepseekApiKey) {
    return {
      apiKey: deepseekApiKey,
      baseURL: 'https://api.deepseek.com/v1',
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    };
  }
  if (kimiApiKey) {
    return {
      apiKey: kimiApiKey,
      baseURL: 'https://api.kimi.com/coding/v1',
      model: process.env.KIMI_MODEL || 'kimi-k2',
    };
  }
  if (openaiApiKey) {
    return {
      apiKey: openaiApiKey,
      baseURL: '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    };
  }
  throw new Error('Missing LLM key: set DEEPSEEK_API_KEY or KIMI_API_KEY or OPENAI_API_KEY');
}
const llm = resolveLlmConfig();

const kv = new Redis({
  url: kvUrl,
  token: kvToken,
});

const client = llm.baseURL
  ? new OpenAI({ apiKey: llm.apiKey, baseURL: llm.baseURL })
  : new OpenAI({ apiKey: llm.apiKey });

const BATCH_SIZE = 10;
const MIN_CHINESE_CHARS_FOR_LOCALIZATION = 2;
const normalize = (text) => (text ?? '').trim();
const countChineseCharacters = (text) =>
  (normalize(text).match(/[\u4e00-\u9fff]/g) ?? []).length;
const hasMeaningfulChineseLocalization = (text) =>
  countChineseCharacters(text) >= MIN_CHINESE_CHARS_FOR_LOCALIZATION;
const normalizeComparable = (text) =>
  normalize(text).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/gi, '');

function requiresChineseLocalization(source) {
  const sourceText = normalize(source);
  return Boolean(sourceText) && !hasMeaningfulChineseLocalization(sourceText);
}

function isLikelyLocalizedField(source, localized) {
  const sourceText = normalize(source);
  const localizedText = normalize(localized);

  if (!localizedText) {
    return false;
  }

  if (!requiresChineseLocalization(sourceText)) {
    return true;
  }

  if (hasMeaningfulChineseLocalization(localizedText)) {
    return true;
  }

  const sourceComparable = normalizeComparable(sourceText);
  const localizedComparable = normalizeComparable(localizedText);
  if (sourceComparable && sourceComparable === localizedComparable) {
    return false;
  }

  return false;
}

function isLikelyUntranslated(item) {
  const title = normalize(item.title);
  const summary = normalize(item.summary);
  const titleNeedsTranslation = requiresChineseLocalization(title);
  const summaryNeedsTranslation = requiresChineseLocalization(summary);

  const titleLocalized = isLikelyLocalizedField(title, item.titleZh);
  const summaryLocalized = isLikelyLocalizedField(summary, item.summaryZh);

  return (
    (titleNeedsTranslation && !titleLocalized) ||
    (summaryNeedsTranslation && !summaryLocalized)
  );
}

function pickLocalizedField({ source, candidate, existing }) {
  const nextCandidate = normalize(candidate);
  if (isLikelyLocalizedField(source, nextCandidate)) {
    return nextCandidate;
  }

  const existingValue = normalize(existing);
  if (isLikelyLocalizedField(source, existingValue)) {
    return existingValue;
  }

  return undefined;
}

function autoFillChineseFields(items) {
  items.forEach((item, i) => {
    const patch = {};
    if (!normalize(item.titleZh) && hasMeaningfulChineseLocalization(item.title)) patch.titleZh = item.title;
    if (!normalize(item.summaryZh) && hasMeaningfulChineseLocalization(item.summary)) patch.summaryZh = item.summary;
    if (Object.keys(patch).length > 0) items[i] = { ...item, ...patch };
  });
}

async function translateBatch(items) {
  const response = await client.chat.completions.create({
    model: llm.model,
    max_tokens: 8192,
    messages: [{
      role: 'system',
      content: `你是一位顶级网络安全分析师，负责将英文安全资讯本地化为中文，供中国安全从业者阅读。
你的任务是将给定的标题和摘要翻译成专业的中文。
要求：
1. 严格按照 JSON 格式输出，不要有任何额外文字。
2. 翻译内容中如需使用引号，必须使用中文引号「」或『』，绝对不能使用英文双引号。
3. 不要在 JSON 字符串值内部使用任何未转义的双引号。`,
    }, {
      role: 'user',
      content: `请将以下安全资讯翻译成中文，直接输出 JSON 数组（不要有 markdown 代码块）：

${JSON.stringify(items)}

输出格式（与输入等长的 JSON 数组）：
[{"titleZh": "中文标题", "summaryZh": "中文摘要"}, ...]`,
    }],
  });

  let text = response.choices[0]?.message?.content?.trim() ?? '';
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(cleaned); }
  catch { return JSON.parse(jsonrepair(cleaned)); }
}

async function run() {
  console.log('Loading feeds from Redis...');
  const [feedA, feedB, feedAI] = await Promise.all([
    kv.get('feed-a'), kv.get('feed-b'), kv.get('feed-ai'),
  ]);

  const a = Array.isArray(feedA) ? feedA : [];
  const b = Array.isArray(feedB) ? feedB : [];
  const ai = Array.isArray(feedAI) ? feedAI : [];
  const allItems = [...a, ...b];

  autoFillChineseFields(allItems);
  autoFillChineseFields(ai);

  const toTranslate = allItems.filter(isLikelyUntranslated);
  const toTranslateAI = ai.filter(isLikelyUntranslated);
  const allToTranslate = [...toTranslate, ...toTranslateAI];

  console.log(`Total: ${allItems.length + ai.length} | Untranslated: ${allToTranslate.length}`);

  if (allToTranslate.length === 0) { console.log('Nothing to translate!'); return; }

  const translationMap = new Map();
  let done = 0, failed = 0;

  for (let i = 0; i < allToTranslate.length; i += BATCH_SIZE) {
    const batch = allToTranslate.slice(i, i + BATCH_SIZE);
    const input = batch.map(item => ({ title: item.title, summary: item.summary }));
    try {
      const results = await translateBatch(input);
      batch.forEach((item, j) => {
        const result = results[j];
        const titleZh = pickLocalizedField({
          source: item.title,
          candidate: result?.titleZh,
        });
        const summaryZh = pickLocalizedField({
          source: item.summary,
          candidate: result?.summaryZh,
        });

        if (titleZh || summaryZh) {
          translationMap.set(item.id, { titleZh, summaryZh });
        }
      });
      done++;
      console.log(`Batch ${done}: translated ${batch.length} items (${translationMap.size} total)`);
    } catch (e) {
      failed++;
      console.error(`Batch failed:`, e.message);
    }
  }

  // Save
  for (const item of allItems) {
    const t = translationMap.get(item.id);
    if (!t) continue;

    const nextTitleZh = pickLocalizedField({
      source: item.title,
      candidate: t.titleZh,
      existing: item.titleZh,
    });
    const nextSummaryZh = pickLocalizedField({
      source: item.summary,
      candidate: t.summaryZh,
      existing: item.summaryZh,
    });
    item.titleZh = nextTitleZh;
    item.summaryZh = nextSummaryZh;
  }
  for (const item of ai) {
    const t = translationMap.get(item.id);
    if (!t) continue;

    const nextTitleZh = pickLocalizedField({
      source: item.title,
      candidate: t.titleZh,
      existing: item.titleZh,
    });
    const nextSummaryZh = pickLocalizedField({
      source: item.summary,
      candidate: t.summaryZh,
      existing: item.summaryZh,
    });
    item.titleZh = nextTitleZh;
    item.summaryZh = nextSummaryZh;
  }
  await Promise.all([
    kv.set('feed-a', allItems.slice(0, a.length)),
    kv.set('feed-b', allItems.slice(a.length)),
    kv.set('feed-ai', ai),
  ]);
  console.log(`Done! Translated: ${translationMap.size} | Failed: ${failed}`);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
