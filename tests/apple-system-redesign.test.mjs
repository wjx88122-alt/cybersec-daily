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
  const globals = readFileSync(join(root, "app/globals.css"), "utf8");
  const tokens = readFileSync(join(root, "app/styles/tokens.css"), "utf8");
  const system = readFileSync(join(root, "app/styles/system.css"), "utf8");

  for (const cssImport of [
    '@import "./styles/tokens.css"',
    '@import "./styles/system.css"',
  ]) {
    assert.equal(
      globals.includes(cssImport),
      true,
      `expected ${cssImport} in globals.css`,
    );
  }

  for (const token of [
    "--system-surface",
    "--system-surface-strong",
    "--system-separator",
  ]) {
    assert.equal(tokens.includes(token), true, `expected ${token} in app/styles/tokens.css`);
  }

  for (const className of [
    ".system-shell",
    ".system-card",
    ".system-nav-shell",
    ".system-pill",
    ".system-input",
  ]) {
    assert.equal(
      system.includes(className),
      true,
      `expected ${className} in app/styles/system.css`,
    );
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
    ["app/(public)/page.tsx", "PublicShell"],
    ["app/(public)/ai/page.tsx", "PublicShell"],
    ["app/(executive)/intelligence/page.tsx", 'shellClassName="intelligence-command-center"'],
    ["app/(ops)/mdr/page.tsx", "MdrShell"],
    ["app/(executive)/team/page.tsx", "TeamShell"],
  ];

  for (const [file, needle] of pages) {
    const source = readFileSync(join(root, file), "utf8");
    assert.equal(source.includes(needle), true, `expected ${needle} in ${file}`);
  }
});
