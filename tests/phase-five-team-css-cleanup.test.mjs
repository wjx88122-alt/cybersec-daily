import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function load(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

test("team stylesheet no longer keeps the legacy utility compatibility layer", () => {
  const source = load("app/styles/team.css");

  assert.equal(source.includes(".team-shell .glass-premium"), false);
  assert.equal(source.includes(".team-shell .panel-soft"), false);
  assert.equal(source.includes(".team-shell .panel-deep"), false);
  assert.equal(source.includes(".team-shell .panel-accent"), false);
  assert.equal(source.includes(".team-shell .gradient-text"), false);
  assert.equal(source.includes(".team-shell .border-white\\/10"), false);
  assert.equal(source.includes(".team-shell .border-white\\/6"), false);
  assert.equal(source.includes(".team-shell .bg-white\\/\\[0\\.03\\]"), false);
  assert.equal(source.includes(".team-shell .bg-white\\/\\[0\\.04\\]"), false);
  assert.equal(source.includes(".team-shell .bg-black\\/20"), false);
  assert.equal(source.includes(".team-shell .text-\\[\\#f0f6fc\\]"), false);
  assert.equal(source.includes(".team-shell .text-\\[\\#dbe4ee\\]"), false);
  assert.equal(source.includes(".team-shell .text-\\[\\#94a3b8\\]"), false);
  assert.equal(source.includes(".team-shell .text-\\[\\#e5ff00\\]"), false);
});
