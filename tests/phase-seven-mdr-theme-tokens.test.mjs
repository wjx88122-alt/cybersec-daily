import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function load(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

test("mdr workbench centralizes alert and action styling through semantic theme helpers", () => {
  const themeSource = load("app/(ops)/mdr/theme.ts");
  const pageSource = load("app/(ops)/mdr/page.tsx");

  assert.equal(themeSource.includes("mdrSeverityBadgeClass"), true);
  assert.equal(themeSource.includes("mdrSeverityDotClass"), true);
  assert.equal(themeSource.includes("mdrStatusBadgeClass"), true);
  assert.equal(themeSource.includes("mdrSourceToneClass"), true);
  assert.equal(themeSource.includes("mdrStatToneClass"), true);
  assert.equal(themeSource.includes("mdrLoadBarClass"), true);
  assert.equal(themeSource.includes("mdrActionToneClass"), true);
  assert.equal(themeSource.includes("mdrSlaToneClass"), true);

  assert.equal(pageSource.includes("const sevColor"), false);
  assert.equal(pageSource.includes("const sevDot"), false);
  assert.equal(pageSource.includes("const statusColor"), false);
  assert.equal(pageSource.includes("const sourceTone"), false);

  assert.equal(pageSource.includes("mdrSeverityBadgeClass("), true);
  assert.equal(pageSource.includes("mdrSeverityDotClass("), true);
  assert.equal(pageSource.includes("mdrStatusBadgeClass("), true);
  assert.equal(pageSource.includes("mdrSourceToneClass("), true);
  assert.equal(pageSource.includes("mdrStatToneClass("), true);
  assert.equal(pageSource.includes("mdrLoadBarClass("), true);
  assert.equal(pageSource.includes("mdrActionToneClass("), true);
  assert.equal(pageSource.includes("mdrSlaToneClass("), true);
});
