# Intelligence Mapping Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real ATT&CK actor data and optional ThreatFox IOC mapping to the MDR Intelligence Center.

**Architecture:** Introduce a dedicated mapping-source module for ATT&CK plus ThreatFox, extend the existing intelligence snapshot payload, and update the Intelligence Center page to prefer live actors and live IOCs while keeping fallback behavior.

**Tech Stack:** Next.js App Router, TypeScript, native fetch, rss-parser, Node built-in test runner

---

### Task 1: Add failing regression tests for the mapping layer

**Files:**
- Create: `tests/intelligence-mapping-layer.test.mjs`
- Test: `tests/intelligence-mapping-layer.test.mjs`

- [x] **Step 1: Write the failing mapping-layer test**

Cover:

- `lib/intelligence-mapping-sources.ts`
- references to ATT&CK STIX and ThreatFox API
- page references to `MITRE ATT&CK` and `ThreatFox`
- snapshot route support for actor and IOC live data

- [x] **Step 2: Run the targeted test and verify it fails**

Run: `node --test tests/intelligence-mapping-layer.test.mjs`

### Task 2: Add ATT&CK and ThreatFox mapping sources

**Files:**
- Create: `lib/intelligence-mapping-sources.ts`
- Test: `tests/intelligence-mapping-layer.test.mjs`

- [x] **Step 1: Fetch and parse ATT&CK intrusion sets, malware, and relationships**

- [x] **Step 2: Fetch and normalize ThreatFox recent IOCs when `THREATFOX_AUTH_KEY` is available**

- [x] **Step 3: Build IOC-to-actor links through ATT&CK malware relationships**

- [x] **Step 4: Run the targeted mapping-layer test**

Run: `node --test tests/intelligence-mapping-layer.test.mjs`

### Task 3: Extend the live intelligence snapshot

**Files:**
- Modify: `lib/intelligence-sources.ts`
- Modify: `app/api/intelligence/route.ts`
- Test: `tests/intelligence-live-sources.test.mjs`
- Test: `tests/intelligence-mapping-layer.test.mjs`

- [x] **Step 1: Extend the live snapshot payload with `actors` and `iocs`**

- [x] **Step 2: Add ATT&CK and ThreatFox status items into `sourceStatus`**

- [x] **Step 3: Keep graceful fallback behavior when either upstream is unavailable**

- [x] **Step 4: Run both intelligence route test files**

Run: `node --test tests/intelligence-live-sources.test.mjs tests/intelligence-mapping-layer.test.mjs`

### Task 4: Wire live actors and mapped IOCs into the Intelligence Center page

**Files:**
- Modify: `app/mdr/intelligence/page.tsx`
- Test: `tests/intelligence-center.test.mjs`
- Test: `tests/intelligence-mapping-layer.test.mjs`

- [x] **Step 1: Prefer live ATT&CK actors in the threat actor library**

- [x] **Step 2: Prefer ThreatFox IOC rows in the IOC library when available**

- [x] **Step 3: Surface linked actor names for mapped IOCs**

- [x] **Step 4: Show source-state messaging for missing ThreatFox Auth-Key**

- [x] **Step 5: Run targeted page tests**

Run: `node --test tests/intelligence-center.test.mjs tests/intelligence-mapping-layer.test.mjs`

### Task 5: Full verification

**Files:**
- Modify: none
- Test: `tests/*.test.mjs`

- [x] **Step 1: Run the full test suite**

Run: `npm test`

- [x] **Step 2: Run a production build**

Run: `npm run build`
