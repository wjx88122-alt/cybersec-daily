import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAttackOperationsSnapshot,
  buildDshieldMapEvents,
  normalizeCisaKevCatalog,
  normalizeDshieldTopIps,
  normalizeDshieldTopPorts,
} from "../lib/attack-data-source.ts";

const observedAt = "2026-04-25T08:00:00.000Z";

test("DShield top IP telemetry becomes ranked MDR attack alerts", () => {
  const alerts = normalizeDshieldTopIps(
    [
      { rank: 1, source: "152.89.198.103", reports: 41346, targets: 479 },
      { rank: 2, source: "89.248.163.109", reports: 96279, targets: 150 },
    ],
    observedAt,
  );

  assert.equal(alerts.length, 2);
  assert.equal(alerts[0].id, "dshield-ip-152-89-198-103");
  assert.equal(alerts[0].severity, "critical");
  assert.equal(alerts[0].source, "NDR");
  assert.match(alerts[0].titleZh, /全球攻击源 #1/);
  assert.match(alerts[0].raw, /Reports: 41,346/);
  assert.match(alerts[0].raw, /Targets: 479/);
});

test("DShield top port payload supports object-shaped API responses", () => {
  const ports = normalizeDshieldTopPorts({
    0: { rank: 1, targetport: 80, records: 331840, targets: 218, sources: 12666 },
    1: { rank: 2, targetport: 22, records: 56741, targets: 244, sources: 3115 },
    date: "2026-04-25",
    limit: 2,
  });

  assert.equal(ports.length, 2);
  assert.equal(ports[0].port, 80);
  assert.equal(ports[0].service, "HTTP");
  assert.equal(ports[0].severity, "critical");
  assert.equal(ports[1].labelZh, "SSH 扫描热区");
});

test("CISA KEV catalog becomes latest exploited vulnerability highlights", () => {
  const highlights = normalizeCisaKevCatalog(
    {
      catalogVersion: "2026.04.24",
      dateReleased: "2026-04-24T16:52:07.2233Z",
      vulnerabilities: [
        {
          cveID: "CVE-2025-29635",
          vendorProject: "D-Link",
          product: "DIR-823X",
          vulnerabilityName: "D-Link DIR-823X Command Injection Vulnerability",
          dateAdded: "2026-04-24",
          shortDescription: "Command injection allows arbitrary commands on remote devices.",
          requiredAction: "Discontinue use of the product if mitigations are unavailable.",
          knownRansomwareCampaignUse: "Unknown",
        },
      ],
    },
    observedAt,
  );

  assert.equal(highlights.length, 1);
  assert.equal(highlights[0].id, "cisa-kev-cve-2025-29635");
  assert.equal(highlights[0].severity, "critical");
  assert.match(highlights[0].titleZh, /D-Link DIR-823X 在野利用/);
  assert.equal(highlights[0].mitreId, "T1190");
});

test("attack operations snapshot exposes source attribution and live sections", () => {
  const snapshot = buildAttackOperationsSnapshot({
    observedAt,
    infocon: "green",
    topIps: [{ rank: 1, source: "152.89.198.103", reports: 41346, targets: 479 }],
    dshieldIpIntelligence: {
      "152.89.198.103": {
        countryCode: "ES",
        countryName: "Spain",
        asn: 202425,
        asName: "INT-NETWORK",
        network: "152.89.198.0/24",
      },
    },
    topPorts: [{ rank: 1, targetport: 80, records: 331840, targets: 218, sources: 12666 }],
    kevCatalog: {
      vulnerabilities: [
        {
          cveID: "CVE-2025-29635",
          vendorProject: "D-Link",
          product: "DIR-823X",
          vulnerabilityName: "D-Link DIR-823X Command Injection Vulnerability",
          dateAdded: "2026-04-24",
          shortDescription: "Command injection allows arbitrary commands on remote devices.",
          requiredAction: "Discontinue use of the product if mitigations are unavailable.",
          knownRansomwareCampaignUse: "Unknown",
        },
      ],
    },
  });

  assert.equal(snapshot.topAttackers.length, 1);
  assert.equal(snapshot.topPorts.length, 1);
  assert.equal(snapshot.kevHighlights.length, 1);
  assert.equal(snapshot.alerts.length, 2);
  assert.equal(snapshot.mapEvents.length, 2);
  assert.equal(snapshot.mapEvents[0].source.city, "Madrid");
  assert.equal(snapshot.mapEvents[0].destination.city, "Nanjing");
  assert.equal(snapshot.mapEvents[1].sourceName, "CISA KEV");
  assert.equal(snapshot.mapEvents[1].category, "在野漏洞压力");
  assert.equal(snapshot.sources.some((source) => source.name === "SANS Internet Storm Center / DShield"), true);
  assert.equal(snapshot.sources.some((source) => source.name === "CISA Known Exploited Vulnerabilities"), true);
});

test("DShield IP enrichment becomes geo-located map events", () => {
  const attackers = normalizeDshieldTopIps(
    [
      { rank: 1, source: "194.224.249.214", reports: 309508, targets: 1 },
      { rank: 2, source: "89.248.163.109", reports: 96279, targets: 150 },
    ],
    observedAt,
  );

  const events = buildDshieldMapEvents(attackers, {
    "194.224.249.214": {
      countryCode: "ES",
      countryName: "Spain",
      asn: 3352,
      asName: "Telefonica",
      network: "194.224.0.0/16",
    },
    "89.248.163.109": {
      countryCode: "SC",
      countryName: "Seychelles",
      asn: 202425,
      asName: "INT-NETWORK",
      network: "89.248.163.0/24",
    },
  });

  assert.equal(events.length, 2);
  assert.equal(events[0].id, "map-dshield-ip-194-224-249-214");
  assert.equal(events[0].source.countryCode, "ES");
  assert.equal(events[0].source.lat, 40.46);
  assert.equal(events[0].source.lon, -3.75);
  assert.equal(events[0].destination.city, "Nanjing");
  assert.match(events[0].summaryZh, /DShield/);
  assert.match(events[0].detailZh, /Telefonica/);
  assert.equal(events[1].source.countryCode, "SC");
  assert.equal(events[1].destination.city, "Shanghai");
});
