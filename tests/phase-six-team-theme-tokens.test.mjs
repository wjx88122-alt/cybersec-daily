import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function load(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

test("team accent styling is centralized through semantic theme helpers", () => {
  const themeSource = load("app/(executive)/team/theme.ts");
  const dataSource = load("app/(executive)/team/data.ts");
  const componentsSource = load("app/(executive)/team/components.tsx");
  const replaySource = load("app/(executive)/team/DecisionDiscussionReplay.tsx");
  const shellSource = load("components/shells/TeamShell.tsx");

  assert.equal(themeSource.includes("teamBadgeToneClass"), true);
  assert.equal(themeSource.includes("teamReplayToneClass"), true);
  assert.equal(themeSource.includes("teamStatToneClass"), true);
  assert.equal(themeSource.includes("teamShellGlowClass"), true);

  assert.equal(dataSource.includes("accentClass"), false);
  assert.equal(dataSource.includes("tone:"), true);

  assert.equal(componentsSource.includes(".accentClass"), false);
  assert.equal(componentsSource.includes("teamBadgeToneClass("), true);
  assert.equal(componentsSource.includes("teamStatToneClass("), true);

  assert.equal(replaySource.includes("ROLE_ACCENTS"), false);
  assert.equal(replaySource.includes("teamReplayToneClass("), true);

  assert.equal(shellSource.includes("bottomGlow"), false);
  assert.equal(shellSource.includes("glowTone"), true);
  assert.equal(shellSource.includes("rgba("), false);
});
