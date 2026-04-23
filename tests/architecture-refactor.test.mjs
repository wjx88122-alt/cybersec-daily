import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(root, path), "utf8");
}

test("public feed routes stay read-only and do not trigger repair jobs", () => {
  for (const path of [
    "app/api/feed/route.ts",
    "app/api/feed-a/route.ts",
    "app/api/feed-b/route.ts",
    "app/api/feed-ai/route.ts",
  ]) {
    const source = readProjectFile(path);
    assert.equal(
      source.includes("triggerImageRepairIfNeeded"),
      false,
      `${path} should not import or call image repair`,
    );
    assert.equal(
      source.includes("triggerTranslationRepairIfNeeded"),
      false,
      `${path} should not import or call translation repair`,
    );
    assert.equal(
      source.includes("after("),
      false,
      `${path} should not schedule background mutations on read`,
    );
  }
});

test("public pages render server-first through one shared feed landing client", () => {
  const securityPage = readProjectFile("app/(public)/page.tsx");
  const aiPage = readProjectFile("app/(public)/ai/page.tsx");

  for (const [label, source] of [
    ["security", securityPage],
    ["ai", aiPage],
  ]) {
    assert.equal(
      source.includes('"use client"'),
      false,
      `${label} page should no longer be a client entrypoint`,
    );
    assert.equal(
      source.includes("useEffect"),
      false,
      `${label} page should not fetch feed data in useEffect`,
    );
    assert.equal(
      source.includes("loadFeedCollection"),
      false,
      `${label} page should not load feed data through client fetch helpers`,
    );
    assert.equal(
      source.includes("FeedLandingClient"),
      true,
      `${label} page should use the shared feed landing client`,
    );
  }

  assert.equal(
    existsSync(join(root, "components/feed/FeedLandingClient.tsx")),
    true,
    "shared feed landing client should exist",
  );
});

test("navigation derives active product from pathname instead of page-local props", () => {
  const navBar = readProjectFile("components/NavBar.tsx");
  assert.equal(
    navBar.includes("usePathname"),
    true,
    "NavBar should derive active state from pathname",
  );
  assert.equal(
    navBar.includes("active: string"),
    false,
    "NavBar should not require page-local active props anymore",
  );
});

test("global styling is split into layered css files", () => {
  const globals = readProjectFile("app/globals.css");

  for (const path of [
    "./styles/tokens.css",
    "./styles/system.css",
    "./styles/public.css",
    "./styles/team.css",
    "./styles/mdr.css",
    "./styles/intelligence.css",
  ]) {
    assert.equal(
      globals.includes(`@import "${path}"`),
      true,
      `globals.css should import ${path}`,
    );
    assert.equal(
      existsSync(join(root, "app", path.replace("./", ""))),
      true,
      `${path} should exist`,
    );
  }
});

test("top-level products are organized into route groups", () => {
  for (const path of [
    "app/(public)/layout.tsx",
    "app/(public)/page.tsx",
    "app/(public)/ai/page.tsx",
    "app/(executive)/layout.tsx",
    "app/(executive)/intelligence/page.tsx",
    "app/(executive)/team/page.tsx",
    "app/(executive)/team/history/page.tsx",
    "app/(executive)/team/decisions/page.tsx",
    "app/(executive)/team/decisions/[slug]/page.tsx",
    "app/(ops)/layout.tsx",
    "app/(ops)/mdr/page.tsx",
    "app/(ops)/mdr/dashboard/page.tsx",
    "app/(ops)/mdr/network/page.tsx",
    "app/(ops)/mdr/splunk/page.tsx",
  ]) {
    assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
  }

  for (const oldPath of [
    "app/page.tsx",
    "app/ai/page.tsx",
    "app/intelligence/page.tsx",
    "app/team/page.tsx",
    "app/team/history/page.tsx",
    "app/team/decisions/page.tsx",
    "app/team/decisions/[slug]/page.tsx",
    "app/mdr/page.tsx",
    "app/mdr/dashboard/page.tsx",
    "app/mdr/network/page.tsx",
    "app/mdr/splunk/page.tsx",
  ]) {
    assert.equal(existsSync(join(root, oldPath)), false, `${oldPath} should be retired`);
  }
});

test("team and mdr product pages share dedicated shell wrappers", () => {
  const teamShell = readProjectFile("components/shells/TeamShell.tsx");
  const mdrShell = readProjectFile("components/shells/MdrShell.tsx");

  assert.equal(teamShell.includes("ProductSectionShell"), true);
  assert.equal(teamShell.includes('shellClassName="team-shell"'), true);
  assert.equal(mdrShell.includes("ProductSectionShell"), true);
  assert.equal(mdrShell.includes('shellClassName="mdr-shell"'), true);

  for (const path of [
    "app/(executive)/team/page.tsx",
    "app/(executive)/team/history/page.tsx",
    "app/(executive)/team/decisions/page.tsx",
    "app/(executive)/team/decisions/[slug]/page.tsx",
  ]) {
    const source = readProjectFile(path);
    assert.equal(source.includes("TeamShell"), true, `${path} should use TeamShell`);
    assert.equal(source.includes("<NavBar"), false, `${path} should not render NavBar directly`);
  }

  for (const path of [
    "app/(ops)/mdr/page.tsx",
    "app/(ops)/mdr/network/page.tsx",
    "app/(ops)/mdr/splunk/page.tsx",
    "app/(ops)/mdr/dashboard/page.tsx",
  ]) {
    const source = readProjectFile(path);
    assert.equal(source.includes("MdrShell"), true, `${path} should use MdrShell`);
  }
});

test("internal mutation routes orchestrate services directly instead of self-fetching", () => {
  for (const path of [
    "app/api/cron/route.ts",
    "app/api/translate/route.ts",
    "app/api/summarize/route.ts",
    "app/api/images/route.ts",
    "app/api/digest/route.ts",
  ]) {
    const source = readProjectFile(path);
    assert.equal(
      source.includes("resolveInternalAppBaseUrl"),
      false,
      `${path} should not resolve app base url for self-calls anymore`,
    );
    assert.equal(
      source.includes("/api/translate"),
      false,
      `${path} should not call translate through internal HTTP`,
    );
    assert.equal(
      source.includes("/api/images"),
      false,
      `${path} should not call images through internal HTTP`,
    );
    assert.equal(
      source.includes("/api/summarize"),
      false,
      `${path} should not call summarize through internal HTTP`,
    );
  }
});
