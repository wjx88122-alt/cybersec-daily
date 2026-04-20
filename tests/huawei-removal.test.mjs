import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

const root = process.cwd();

test("Huawei feature files are removed", () => {
  const removedPaths = [
    "app/mdr/huawei/page.tsx",
    "app/mdr/huawei/isdb/page.tsx",
    "app/mdr/huawei/isdb/custom-builder.tsx",
    "app/api/huawei/route.ts",
    "app/api/huawei/isdb/route.ts",
    "lib/huawei-isdb.ts",
  ];

  for (const relPath of removedPaths) {
    assert.equal(
      existsSync(join(root, relPath)),
      false,
      `${relPath} should be removed`,
    );
  }
});

test("Huawei directories are removed", () => {
  const removedDirs = [
    "app/mdr/huawei",
    "app/mdr/huawei/isdb",
    "app/api/huawei",
    "app/api/huawei/isdb",
  ];

  for (const relPath of removedDirs) {
    assert.equal(
      existsSync(join(root, relPath)),
      false,
      `${relPath} directory should be removed`,
    );
  }
});

test("MDR dashboard no longer links to Huawei tools", () => {
  const dashboard = readFileSync(join(root, "app/mdr/page.tsx"), "utf8");

  assert.equal(dashboard.includes("/mdr/huawei"), false);
  assert.equal(dashboard.includes("华为防火墙处置"), false);
  assert.equal(dashboard.includes("华为 SD-WAN ISDB"), false);
});

test("package.json exposes a test script", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

  assert.equal(typeof pkg.scripts?.test, "string");
  assert.notEqual(pkg.scripts.test.trim(), "");
});
