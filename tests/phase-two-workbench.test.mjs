import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function load(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

test("mdr page exposes a workbench-style command deck", () => {
  const source = load("app/(ops)/mdr/page.tsx");

  assert.equal(source.includes("Shift Brief"), true);
  assert.equal(source.includes("Priority Queue"), true);
  assert.equal(source.includes("Analyst Capacity"), true);
});

test("team overview exposes a command center skeleton instead of a stretched hero wall", () => {
  const source = load("app/(executive)/team/page.tsx");

  assert.equal(source.includes("Command Deck"), true);
  assert.equal(source.includes("Decision Lanes"), true);
  assert.equal(source.includes("Call Matrix"), true);
});
