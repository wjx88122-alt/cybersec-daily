import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function load(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

test("shared system icon component exists and is adopted across primary surfaces", () => {
  const iconPath = join(root, "components/ui/SystemIcon.tsx");
  assert.equal(existsSync(iconPath), true, "SystemIcon component should exist");

  const iconSource = readFileSync(iconPath, "utf8");
  assert.equal(iconSource.includes("export function SystemIcon"), true);
  assert.equal(iconSource.includes("shield"), true);
  assert.equal(iconSource.includes("workflow"), true);
  assert.equal(iconSource.includes("external"), true);

  for (const file of [
    "components/NavBar.tsx",
    "components/feed/FeedLandingClient.tsx",
    "components/NewsCard.tsx",
    "app/(executive)/intelligence/components/Topbar.tsx",
    "app/(ops)/mdr/page.tsx",
    "app/(ops)/mdr/dashboard/page.tsx",
    "app/(ops)/mdr/network/page.tsx",
    "app/(ops)/mdr/splunk/page.tsx",
    "app/(executive)/team/components.tsx",
  ]) {
    const source = load(file);
    assert.equal(source.includes("SystemIcon"), true, `${file} should use SystemIcon`);
  }
});

test("operational MDR surfaces avoid emoji UI labels and use system icon semantics", () => {
  const emojiPattern = /[🏢📍🖥🔔🔴📋✅🌍🎯⚡📡🛡👥🧪🔌👁📊🗄🔖🔥🔄🔧📝🗺]/u;

  for (const file of [
    "app/(ops)/mdr/dashboard/page.tsx",
    "app/(ops)/mdr/network/page.tsx",
    "app/(ops)/mdr/splunk/page.tsx",
    "components/ThreatMap.tsx",
    "components/NetworkTopology.tsx",
  ]) {
    const source = load(file);
    assert.equal(emojiPattern.test(source), false, `${file} should not use emoji as UI icons`);
    assert.equal(source.includes("SystemIcon"), true, `${file} should use SystemIcon instead`);
  }
});

test("system stylesheet provides focus, icon, and target-size utilities", () => {
  const system = load("app/styles/system.css");

  for (const selector of [
    ".system-focus-ring",
    ".system-icon",
    ".system-icon-badge",
    ".system-control",
  ]) {
    assert.equal(system.includes(selector), true, `expected ${selector} in system.css`);
  }

  assert.equal(system.includes("min-height: 2.5rem"), true);
  assert.equal(system.includes(":focus-visible"), true);
});

test("intelligence stylesheet includes mobile safeguards for command chips and hero type", () => {
  const intelligence = load("app/styles/intelligence.css");

  assert.equal(intelligence.includes(".topbar-scroll-row"), true);
  assert.equal(intelligence.includes(".intel-icon-label"), true);
  assert.equal(intelligence.includes("overflow-wrap: anywhere"), true);
  assert.equal(intelligence.includes("@media (max-width: 760px)"), true);
});

test("intelligence center uses the shared light shell and keeps tabs in document flow", () => {
  const page = load("app/(executive)/intelligence/page.tsx");
  const intelligence = load("app/styles/intelligence.css");
  const topbarBlock = intelligence.match(/\.intelligence-command-center \.topbar \{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.equal(page.includes('systemTone="system-shell-light"'), true);
  assert.equal(intelligence.includes("--intel-bg: #f8fafc"), true);
  assert.equal(intelligence.includes("linear-gradient(180deg, #ffffff 0%, #f6f8fb 100%)"), true);
  assert.equal(topbarBlock.includes("position: sticky"), false);
  assert.equal(topbarBlock.includes("top:"), false);
});

test("intelligence command tabs wrap instead of keeping a horizontal slider", () => {
  const intelligence = load("app/styles/intelligence.css");
  const mobileTopbarRows =
    intelligence.match(
      /\.intelligence-command-center \.top-actions,[\s\S]*?\.intelligence-command-center \.filter-strip \{[\s\S]*?\n  \}/,
    )?.[0] ?? "";

  assert.equal(mobileTopbarRows.includes("flex-wrap: wrap"), true);
  assert.equal(mobileTopbarRows.includes("overflow-x: auto"), false);
  assert.equal(intelligence.includes(".topbar-scroll-row > *"), false);
});

test("intelligence hero avoids stretched whitespace by separating decisions from the overview row", () => {
  const executiveBrief = load("app/(executive)/intelligence/components/ExecutiveBrief.tsx");
  const intelligence = load("app/styles/intelligence.css");
  const overviewGridBlock = intelligence.match(/\.intelligence-command-center \.brief-overview-grid \{[\s\S]*?\n\}/)?.[0] ?? "";
  const briefHeroBlock = intelligence.match(/\.intelligence-command-center \.brief-hero \{[\s\S]*?\n\}/)?.[0] ?? "";
  const heroTitleBlock = intelligence.match(/\.intelligence-command-center \.brief-hero h2 \{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.equal(executiveBrief.includes("executive-brief-flow"), true);
  assert.equal(executiveBrief.includes('className="briefing-row"'), false);
  assert.equal(executiveBrief.includes("decision-section"), true);
  assert.equal(overviewGridBlock.includes("align-items: start"), true);
  assert.equal(briefHeroBlock.includes("min-height"), false);
  assert.equal(heroTitleBlock.includes("max-width: 13em"), true);
});
