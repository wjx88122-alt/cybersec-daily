# Intelligence Ops Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add graph view, customer relevance scoring, threat/safe lists, and detection rule export to the Intelligence Center.

**Architecture:** Build a small intelligence-ops helper layer for derived graph, scoring, and rule text; expose list and rule routes through the API; and wire the current top-level Intelligence Center page to consume and act on those operational capabilities.

**Tech Stack:** Next.js App Router, React client components, TypeScript, optional Upstash KV storage, Node built-in test runner

---

### Task 1: Add failing regression tests for the ops layer

**Files:**
- Create: `tests/intelligence-ops-layer.test.mjs`
- Test: `tests/intelligence-ops-layer.test.mjs`

- [x] **Step 1: Write the failing test**

Cover:

- `lib/intelligence-ops.ts`
- `app/api/intelligence/lists/route.ts`
- `app/api/intelligence/export-rule/route.ts`
- page references to:
  - `实体关系图谱`
  - `客户相关性`
  - `Threat List`
  - `Safelist`
  - `/api/intelligence/export-rule`

- [x] **Step 2: Run the targeted test and verify it fails**

Run: `node --test tests/intelligence-ops-layer.test.mjs`

### Task 2: Add intelligence ops helper module

**Files:**
- Create: `lib/intelligence-ops.ts`
- Test: `tests/intelligence-ops-layer.test.mjs`

- [x] **Step 1: Implement relevance score helpers**

- [x] **Step 2: Implement graph snapshot helpers**

- [x] **Step 3: Implement detection rule template generation**

- [x] **Step 4: Run the targeted test again**

Run: `node --test tests/intelligence-ops-layer.test.mjs`

### Task 3: Add list and rule export routes

**Files:**
- Create: `app/api/intelligence/lists/route.ts`
- Create: `app/api/intelligence/export-rule/route.ts`
- Modify: `app/api/intelligence/route.ts`
- Test: `tests/intelligence-ops-layer.test.mjs`

- [x] **Step 1: Implement Threat List and Safelist route**

- [x] **Step 2: Implement rule export route for Sigma, Suricata, and Splunk**

- [x] **Step 3: Extend the snapshot route with list payloads**

- [x] **Step 4: Run the targeted tests**

Run: `node --test tests/intelligence-ops-layer.test.mjs`

### Task 4: Wire the Intelligence Center page to the ops layer

**Files:**
- Modify: `app/intelligence/page.tsx`
- Test: `tests/intelligence-ops-layer.test.mjs`
- Test: `tests/intelligence-live-sources.test.mjs`
- Test: `tests/intelligence-mapping-layer.test.mjs`

- [x] **Step 1: Add customer relevance strip**

- [x] **Step 2: Add entity relationship graph panel**

- [x] **Step 3: Add Threat List and Safelist management panel**

- [x] **Step 4: Add rule export actions**

- [x] **Step 5: Run the targeted intelligence test files**

Run: `node --test tests/intelligence-ops-layer.test.mjs tests/intelligence-live-sources.test.mjs tests/intelligence-mapping-layer.test.mjs`

### Task 5: Full verification

**Files:**
- Modify: none
- Test: `tests/*.test.mjs`

- [x] **Step 1: Run the full test suite**

Run: `npm test`

- [x] **Step 2: Run a production build**

Run: `npm run build`
