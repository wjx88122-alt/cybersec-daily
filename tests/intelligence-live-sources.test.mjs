import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));

test("live intelligence API routes exist", () => {
  assert.equal(
    existsSync(join(root, "app/api/intelligence/route.ts")),
    true,
    "app/api/intelligence/route.ts should exist",
  );
  assert.equal(
    existsSync(join(root, "app/api/intelligence/export/route.ts")),
    true,
    "app/api/intelligence/export/route.ts should exist",
  );
  assert.equal(
    existsSync(join(root, "app/api/intelligence/subscriptions/route.ts")),
    true,
    "app/api/intelligence/subscriptions/route.ts should exist",
  );
});

test("live intelligence source client exists and references the official upstreams", () => {
  const source = readFileSync(join(root, "lib/intelligence-sources.ts"), "utf8");

  assert.equal(source.includes("known_exploited_vulnerabilities.json"), true);
  assert.equal(source.includes("services.nvd.nist.gov/rest/json/cves/2.0"), true);
  assert.equal(source.includes("api.first.org/data/v1/epss"), true);
  assert.equal(source.includes("cybersecurity-advisories/all.xml"), true);
});

test("intelligence center page references live snapshot, export, and subscriptions APIs", () => {
  const page = readFileSync(join(root, "app/intelligence/page.tsx"), "utf8");

  assert.equal(page.includes("/api/intelligence"), true);
  assert.equal(page.includes("/api/intelligence/export"), true);
  assert.equal(page.includes("/api/intelligence/subscriptions"), true);
  assert.equal(page.includes("真实情报源"), true);
  assert.equal(page.includes("导出 JSON"), true);
});

test("optional KV helper exists for subscription storage fallback", () => {
  const source = readFileSync(join(root, "lib/kv-optional.ts"), "utf8");

  assert.equal(source.includes("process.env.KV_REST_API_URL"), true);
  assert.equal(source.includes("memory"), true);
});
