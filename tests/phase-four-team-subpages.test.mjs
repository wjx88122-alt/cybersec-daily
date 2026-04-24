import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function load(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

test("team history and archive subpages use workbench-style module naming", () => {
  const historySource = load("app/(executive)/team/history/page.tsx");
  const decisionsSource = load("app/(executive)/team/decisions/page.tsx");
  const detailSource = load("app/(executive)/team/decisions/[slug]/page.tsx");

  assert.equal(historySource.includes("Evolution Workbench"), true);
  assert.equal(decisionsSource.includes("Archive Workbench"), true);
  assert.equal(detailSource.includes("Decision Brief"), true);
});

test("team history, archive, detail and replay files do not keep legacy dark utility tokens", () => {
  const files = [
    "app/(executive)/team/history/page.tsx",
    "app/(executive)/team/decisions/page.tsx",
    "app/(executive)/team/decisions/[slug]/page.tsx",
    "app/(executive)/team/DecisionDiscussionReplay.tsx",
  ];

  for (const relativePath of files) {
    const source = load(relativePath);

    assert.equal(source.includes("glass glass-premium"), false, relativePath);
    assert.equal(source.includes("panel-deep"), false, relativePath);
    assert.equal(source.includes("panel-soft"), false, relativePath);
    assert.equal(source.includes("panel-accent"), false, relativePath);
    assert.equal(source.includes("text-[#f0f6fc]"), false, relativePath);
    assert.equal(source.includes("text-[#dbe4ee]"), false, relativePath);
    assert.equal(source.includes("bg-white/[0.03]"), false, relativePath);
    assert.equal(source.includes("border-white/10"), false, relativePath);
  }
});
