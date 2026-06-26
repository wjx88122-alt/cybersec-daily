/**
 * 通用网页采集器 —— 对齐 AI HOT 的「网页」源策略。
 *
 * 用途：抓取没有 RSS 的安全厂商官网「新闻/研究」列表页，
 * 解析出文章链接 → 抽取正文 → 产出 FeedItem。
 *
 * 复用：extractArticleText（正文）、extractOgImage（封面图）。
 * 设计取舍：用 regex 提取 <a href>（零依赖、SSR 安全），
 * 每个源用 linkSelector 限定链接（避免抓到导航/页脚）。
 */
import crypto from "crypto";
import type { FeedItem } from "./feeds.ts";
import type { FeedFetchResult } from "./feed-refresh.ts";
import { isAllowedRemoteHttpsUrl, resolveSafeExternalHref } from "./remote-url.ts";

/**
 * extractArticleText / extractOgImage 通过动态 import 延迟加载，
 * 避免静态导入链把 extractArticle.ts → remote-url 等无扩展名模块
 * 带入 node --test 的 ESM 解析（这些文件用无扩展名导入，仅 Next 运行时解析）。
 */

export type WebpageSource = {
  name: string;
  /** 文章列表页 URL（https）。 */
  listUrl: string;
  category: string;
  description?: string;
  /**
   * 限定文章链接：只保留 href 含此子串的 <a>。
   * 例如厂商新闻路径段 "/research/" 或 "/blog/"。
   */
  linkMustContain?: string;
  /** 最多抓取多少篇文章（默认 8）。 */
  maxItems?: number;
};

/** 抓取列表页 HTML。 */
async function fetchListHtml(url: string): Promise<string> {
  if (!isAllowedRemoteHttpsUrl(url)) return "";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

/** 从列表页 HTML 提取文章链接（去重、过滤、限流）。 */
export function extractArticleLinks(
  html: string,
  listUrl: string,
  source: WebpageSource,
): string[] {
  const base = new URL(listUrl);
  const linkRe = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  const links = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html)) !== null) {
    const raw = m[1];
    if (!raw) continue;
    // 过滤锚点/脚本/邮件
    if (/^(#|javascript:|mailto:|tel:)/i.test(raw)) continue;
    let abs: string;
    try {
      abs = new URL(raw, base).toString();
    } catch {
      continue;
    }
    if (!isAllowedRemoteHttpsUrl(abs)) continue;
    // 必须含 linkMustContain（限定文章路径）
    if (source.linkMustContain && !abs.includes(source.linkMustContain))
      continue;
    // 排除列表页自身
    if (abs === listUrl) continue;
    links.add(abs);
  }
  const max = source.maxItems ?? 8;
  return [...links].slice(0, max);
}

/** 从页面 <title> 提取标题。 */
function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return (m?.[1] ?? "").trim().slice(0, 200) || "无标题";
}

/** 从列表页片段截取摘要（取链接附近文本的兜底）。 */
function extractMetaDescription(html: string): string {
  const m = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
  );
  return (m?.[1] ?? "").trim().slice(0, 200);
}

/** 抓取一组网页型源，产出 FeedItem。 */
export async function fetchWebpageSources(
  sources: WebpageSource[],
): Promise<FeedFetchResult<FeedItem>> {
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const html = await fetchListHtml(source.listUrl);
      if (!html) return [] as FeedItem[];
      const articleLinks = extractArticleLinks(html, source.listUrl, source);
      if (articleLinks.length === 0) return [] as FeedItem[];

      // 并发抓每篇文章正文（限流由各 extract 内部超时保证）
      // 动态 import 延迟加载网络模块（见文件头注释）
      const [{ extractArticleText }, { extractOgImage }] = await Promise.all([
        import("./extractArticle.ts"),
        import("./extractImage.ts"),
      ]);
      const items = await Promise.all(
        articleLinks.map(async (link) => {
          const [text, image] = await Promise.all([
            extractArticleText(link),
            extractOgImage(link),
          ]);
          const title = extractTitleFromText(text) || extractTitle(html);
          const id = crypto
            .createHash("sha256")
            .update(link)
            .digest("hex");
          const feedItem: FeedItem = {
            id,
            title,
            link: resolveSafeExternalHref(link),
            summary: text.slice(0, 200) || extractMetaDescription(html),
            source: source.name,
            category: source.category,
            pubDate: new Date().toISOString(), // 网页无可靠发布时间，用抓取时间
            ...(image ? { image } : {}),
          };
          return feedItem;
        }),
      );
      return items;
    }),
  );

  const items: FeedItem[] = [];
  let succeededSources = 0;
  let failedSources = 0;
  for (const result of results) {
    if (result.status === "fulfilled") {
      succeededSources += 1;
      items.push(...result.value);
    } else {
      failedSources += 1;
    }
  }
  return { items, succeededSources, failedSources };
}

/** 从抽出的正文里取首行/前 120 字作为标题兜底。 */
function extractTitleFromText(text: string): string {
  const firstLine = text.split(/\n|\.\s{2,}/)[0]?.trim() ?? "";
  return firstLine.slice(0, 120);
}

/**
 * 网页型源配置（无 RSS 的安全厂商官网新闻/研究列表页）。
 * 对齐 AI HOT 的「（网页）」源。实现时按需增补，URL 需验证列表页可抓。
 * 暂留为空数组：网页采集稳定性依赖站点结构，建议按需逐个验证后启用。
 */
export const WEBPAGE_SOURCES: WebpageSource[] = [];
