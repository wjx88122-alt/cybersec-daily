import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));

test("intelligence mapping source module exists", () => {
  assert.equal(
    existsSync(join(root, "lib/intelligence-mapping-sources.ts")),
    true,
    "lib/intelligence-mapping-sources.ts should exist",
  );
});

test("mapping source module references ATT&CK STIX and ThreatFox", () => {
  const source = readFileSync(
    join(root, "lib/intelligence-mapping-sources.ts"),
    "utf8",
  );

  assert.equal(source.includes("attack-stix-data"), true);
  assert.equal(source.includes("enterprise-attack.json"), true);
  assert.equal(source.includes("threatfox-api.abuse.ch/api/v1/"), true);
  assert.equal(source.includes("intrusion-set"), true);
});

test("intelligence snapshot route is wired for live actors and iocs", () => {
  const source = readFileSync(join(root, "app/api/intelligence/route.ts"), "utf8");

  assert.equal(source.includes("actors"), true);
  assert.equal(source.includes("iocs"), true);
});

test("intelligence page references MITRE ATT&CK and ThreatFox sections", () => {
  const page = readFileSync(join(root, "app/intelligence/page.tsx"), "utf8");

  assert.equal(page.includes("MITRE ATT&CK"), true);
  assert.equal(page.includes("ThreatFox"), true);
  assert.equal(page.includes("THREATFOX_AUTH_KEY"), true);
});
