import assert from "node:assert/strict";
import test from "node:test";

import {
  extractArticleLinks,
  WEBPAGE_SOURCES,
  fetchWebpageSources,
} from "../lib/webpage-collector.ts";

const mkSource = (over = {}) => ({
  name: "Test Vendor：News（网页）",
  listUrl: "https://vendor.example.com/news",
  category: "综合资讯",
  ...over,
});

test("extractArticleLinks pulls https article hrefs and dedupes", () => {
  const html = `
    <nav><a href="/about">About</a></nav>
    <main>
      <a href="/research/deep-analysis-1">Deep Analysis 1</a>
      <a href="/research/quick-advisory">Quick Advisory</a>
      <a href="https://vendor.example.com/research/another">Another</a>
      <a href="/research/quick-advisory">Dup</a>
      <a href="javascript:void(0)">JS</a>
      <a href="#anchor">Anchor</a>
      <a href="mailto:a@b.com">Mail</a>
    </main>
  `;
  const src = mkSource({ linkMustContain: "/research/" });
  const links = extractArticleLinks(html, src.listUrl, src);
  assert.ok(links.length === 3, `expected 3 unique research links, got ${links.length}`);
  assert.ok(links.every((l) => l.startsWith("https://")));
  assert.ok(links.every((l) => l.includes("/research/")));
});

test("extractArticleLinks respects linkMustContain filter", () => {
  const html = `
    <a href="https://vendor.example.com/blog/post1">Blog</a>
    <a href="https://vendor.example.com/research/r1">Research</a>
  `;
  const src = mkSource({ linkMustContain: "/research/" });
  const links = extractArticleLinks(html, src.listUrl, src);
  assert.equal(links.length, 1);
  assert.ok(links[0].includes("/research/"));
});

test("extractArticleLinks respects maxItems", () => {
  let html = "";
  for (let i = 0; i < 20; i += 1) {
    html += `<a href="https://vendor.example.com/research/p${i}">P${i}</a>`;
  }
  const src = mkSource({ linkMustContain: "/research/", maxItems: 5 });
  const links = extractArticleLinks(html, src.listUrl, src);
  assert.equal(links.length, 5);
});

test("extractArticleLinks rejects non-https and blocked hosts", () => {
  const html = `
    <a href="http://vendor.example.com/research/x">HTTP</a>
    <a href="https://localhost/research/y">Localhost</a>
    <a href="https://127.0.0.1/research/z">Loopback</a>
  `;
  const src = mkSource({ linkMustContain: "/research/" });
  const links = extractArticleLinks(html, src.listUrl, src);
  assert.equal(links.length, 0, "http/localhost/loopback must be rejected");
});

test("extractArticleLinks excludes the list page itself", () => {
  const html = `<a href="https://vendor.example.com/news">Self</a><a href="https://vendor.example.com/news/a">Real</a>`;
  const src = mkSource({ linkMustContain: "/news" });
  const links = extractArticleLinks(html, src.listUrl, src);
  assert.equal(links.length, 1);
  assert.equal(links[0], "https://vendor.example.com/news/a");
});

test("WEBPAGE_SOURCES is empty by default (verify-on-enable policy)", () => {
  assert.equal(Array.isArray(WEBPAGE_SOURCES), true);
  assert.equal(WEBPAGE_SOURCES.length, 0);
});

test("fetchWebpageSources returns empty result for empty sources", async () => {
  const result = await fetchWebpageSources([]);
  assert.equal(result.items.length, 0);
  assert.equal(result.succeededSources, 0);
  assert.equal(result.failedSources, 0);
});
