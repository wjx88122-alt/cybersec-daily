import { Redis } from '@upstash/redis';
import Anthropic from '@anthropic-ai/sdk';
import { jsonrepair } from 'jsonrepair';

const kv = new Redis({
  url: 'https://normal-shark-41284.upstash.io',
  token: 'AaFEAAIncDFlN2EyMWYxNmE1YTI0NTI1OGVlNDBlYmNlZDFlNTg3OXAxNDEyODQ',
});

const client = new Anthropic({
  baseURL: 'https://yunyi.rdzhvip.com/claude',
});

const BATCH_SIZE = 10;
const isChinese = (text) => /[\u4e00-\u9fff]/.test(text);

async function translateBatch(items) {
  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 32000,
    system: `你是一位顶级网络安全分析师，负责将英文安全资讯本地化为中文，供中国安全从业者阅读。
你的任务是将给定的标题和摘要翻译成专业的中文。
要求：
1. 严格按照 JSON 格式输出，不要有任何额外文字。
2. 翻译内容中如需使用引号，必须使用中文引号「」或『』，绝对不能使用英文双引号。
3. 不要在 JSON 字符串值内部使用任何未转义的双引号。`,
    messages: [{
      role: 'user',
      content: `请将以下安全资讯翻译成中文，直接输出 JSON 数组（不要有 markdown 代码块）：

${JSON.stringify(items)}

输出格式（与输入等长的 JSON 数组）：
[{"titleZh": "中文标题", "summaryZh": "中文摘要"}, ...]`,
    }],
  });

  const response = await stream.finalMessage();
  let text = '';
  for (const block of response.content) {
    if (block.type === 'text') { text = block.text.trim(); break; }
  }
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

  // Auto-fill Chinese AI items
  ai.forEach((item, i) => {
    if (!item.titleZh && isChinese(item.title)) {
      ai[i] = { ...item, titleZh: item.title, summaryZh: item.summary };
    }
  });

  const allItems = [...a, ...b];
  const toTranslate = allItems.filter(i => !i.titleZh);
  const toTranslateAI = ai.filter(i => !i.titleZh && !isChinese(i.title));
  const allToTranslate = [...toTranslate, ...toTranslateAI];

  console.log(`Total: ${allItems.length + ai.length} | Untranslated: ${allToTranslate.length} (${toTranslate.length} sec + ${toTranslateAI.length} ai)`);

  if (allToTranslate.length === 0) {
    console.log('Nothing to translate!');
    return;
  }

  const translationMap = new Map();
  let done = 0, failed = 0;

  for (let i = 0; i < allToTranslate.length; i += BATCH_SIZE) {
    const batch = allToTranslate.slice(i, i + BATCH_SIZE);
    const input = batch.map(item => ({ title: item.title, summary: item.summary }));
    try {
      const results = await translateBatch(input);
      batch.forEach((item, j) => {
        if (results[j]?.titleZh) translationMap.set(item.id, results[j]);
      });
      done++;
      console.log(`Batch ${done}: translated ${batch.length} items (${translationMap.size} total)`);
    } catch (e) {
      failed++;
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, e.message);
    }

    // Save every 5 batches
    if (done > 0 && done % 5 === 0) {
      await saveProgress(a, b, ai, allItems, translationMap);
      console.log(`Checkpoint saved (${translationMap.size} translations)`);
    }
  }

  // Final save
  await saveProgress(a, b, ai, allItems, translationMap);
  console.log(`\nDone! Translated: ${translationMap.size} | Failed batches: ${failed}`);
}

async function saveProgress(a, b, ai, allItems, map) {
  for (const item of allItems) {
    const t = map.get(item.id);
    if (t?.titleZh) { item.titleZh = t.titleZh; item.summaryZh = t.summaryZh; }
  }
  for (const item of ai) {
    const t = map.get(item.id);
    if (t?.titleZh) { item.titleZh = t.titleZh; item.summaryZh = t.summaryZh; }
  }
  await Promise.all([
    kv.set('feed-a', allItems.slice(0, a.length)),
    kv.set('feed-b', allItems.slice(a.length)),
    kv.set('feed-ai', ai),
  ]);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
