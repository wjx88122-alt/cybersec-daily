import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function load(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

test("team overview names lower sections like a product workbench", () => {
  const source = load("app/(executive)/team/page.tsx");

  assert.equal(source.includes("Role Operating Model"), true);
  assert.equal(source.includes("Routing Playbooks"), true);
  assert.equal(source.includes("Weekly Briefing Flow"), true);
  assert.equal(source.includes("Prompt Library"), true);
});

test("team overview page does not keep legacy dark utility tokens", () => {
  const source = load("app/(executive)/team/page.tsx");

  assert.equal(source.includes("glass glass-premium"), false);
  assert.equal(source.includes("panel-deep"), false);
  assert.equal(source.includes("text-[#f0f6fc]"), false);
  assert.equal(source.includes("text-[#dbe4ee]"), false);
  assert.equal(source.includes("bg-white/[0.03]"), false);
  assert.equal(source.includes("border-white/10"), false);
});
