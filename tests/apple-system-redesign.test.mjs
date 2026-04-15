import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));

test("DESIGN.md exists and defines an Apple system direction", () => {
  assert.equal(existsSync(join(root, "DESIGN.md")), true, "DESIGN.md should exist");

  const design = readFileSync(join(root, "DESIGN.md"), "utf8");
  assert.equal(design.includes("macOS"), true);
  assert.equal(design.includes("iOS"), true);
  assert.equal(design.includes("Apple"), true);
});

test("globals.css exposes a shared Apple-style system layer", () => {
  const css = readFileSync(join(root, "app/globals.css"), "utf8");

  for (const tokenOrClass of [
    "--system-surface",
    "--system-surface-strong",
    "--system-separator",
    ".system-shell",
    ".system-card",
    ".system-nav-shell",
    ".system-pill",
    ".system-input",
  ]) {
    assert.equal(css.includes(tokenOrClass), true, `expected ${tokenOrClass} in globals.css`);
  }
});

test("NavBar uses Apple-style system navigation classes", () => {
  const nav = readFileSync(join(root, "components/NavBar.tsx"), "utf8");

  assert.equal(nav.includes("system-nav-shell"), true);
  assert.equal(nav.includes("system-nav-bar"), true);
  assert.equal(nav.includes("system-nav-item"), true);
});

test("top-level routes opt into the shared Apple-style shell", () => {
  const pages = [
    ["app/page.tsx", "public-shell system-shell"],
    ["app/ai/page.tsx", "public-shell system-shell"],
    ["app/intelligence/page.tsx", "intelligence-command-center system-shell"],
    ["app/mdr/page.tsx", "mdr-shell system-shell"],
    ["app/team/page.tsx", "team-shell system-shell"],
  ];

  for (const [file, needle] of pages) {
    const source = readFileSync(join(root, file), "utf8");
    assert.equal(source.includes(needle), true, `expected ${needle} in ${file}`);
  }
});
