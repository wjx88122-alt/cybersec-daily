import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));

test("intelligence ops helper module exists", () => {
  assert.equal(
    existsSync(join(root, "lib/intelligence-ops.ts")),
    true,
    "lib/intelligence-ops.ts should exist",
  );
});

test("intelligence ops routes exist", () => {
  assert.equal(
    existsSync(join(root, "app/api/intelligence/lists/route.ts")),
    true,
    "app/api/intelligence/lists/route.ts should exist",
  );
  assert.equal(
    existsSync(join(root, "app/api/intelligence/export-rule/route.ts")),
    true,
    "app/api/intelligence/export-rule/route.ts should exist",
  );
});

test("intelligence center page references ops-layer sections and actions", () => {
  const page = readFileSync(join(root, "app/intelligence/page.tsx"), "utf8");

  assert.equal(page.includes("实体关系图谱"), true);
  assert.equal(page.includes("客户相关性"), true);
  assert.equal(page.includes("Threat List"), true);
  assert.equal(page.includes("Safelist"), true);
  assert.equal(page.includes("/api/intelligence/export-rule"), true);
  assert.equal(page.includes("/api/intelligence/lists"), true);
});

test("snapshot route exposes lists and ops-derived data", () => {
  const route = readFileSync(join(root, "app/api/intelligence/route.ts"), "utf8");

  assert.equal(route.includes("threatList"), true);
  assert.equal(route.includes("safelist"), true);
  assert.equal(route.includes("relevance"), true);
  assert.equal(route.includes("graph"), true);
});
