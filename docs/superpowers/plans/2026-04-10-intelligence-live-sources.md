# Intelligence Live Sources and Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add live vulnerability intelligence sources plus export and subscription APIs to the MDR Intelligence Center.

**Architecture:** Introduce source-client and route layers for live intelligence, keep KV optional through a safe fallback helper, and wire the current page to consume live server data while preserving existing mock-backed knowledge sections.

**Tech Stack:** Next.js App Router, React client components, TypeScript, rss-parser, native fetch, Upstash Redis optional access, Node built-in test runner

---

### Task 1: Fix brittle intelligence-center tests and add new failing route-contract tests

**Files:**
- Modify: `tests/intelligence-center.test.mjs`
- Create: `tests/intelligence-live-sources.test.mjs`
- Test: `tests/intelligence-center.test.mjs`
- Test: `tests/intelligence-live-sources.test.mjs`

- [x] **Step 1: Make the existing intelligence-center test derive the repo root dynamically**

- [x] **Step 2: Write a new failing live-sources test**

Cover:

- `app/api/intelligence/route.ts`
- `app/api/intelligence/export/route.ts`
- `app/api/intelligence/subscriptions/route.ts`
- `lib/intelligence-sources.ts`
- page references to `/api/intelligence`, `/api/intelligence/export`, and `/api/intelligence/subscriptions`

- [x] **Step 3: Run the targeted test command and verify it fails for the new route contracts**

Run: `node --test tests/intelligence-center.test.mjs tests/intelligence-live-sources.test.mjs`

### Task 2: Add live source and storage helpers

**Files:**
- Create: `lib/intelligence-sources.ts`
- Create: `lib/kv-optional.ts`
- Test: `tests/intelligence-live-sources.test.mjs`

- [x] **Step 1: Implement live source clients for CISA KEV, NVD, FIRST EPSS, and CISA advisories**

- [x] **Step 2: Build a unified live snapshot shape for the page**

- [x] **Step 3: Implement optional KV access with memory fallback support**

- [x] **Step 4: Run the targeted tests again**

Run: `node --test tests/intelligence-live-sources.test.mjs`

### Task 3: Add live snapshot, export, and subscription routes

**Files:**
- Create: `app/api/intelligence/route.ts`
- Create: `app/api/intelligence/export/route.ts`
- Create: `app/api/intelligence/subscriptions/route.ts`
- Test: `tests/intelligence-live-sources.test.mjs`

- [x] **Step 1: Implement the live snapshot route**

- [x] **Step 2: Implement JSON and Markdown export**

- [x] **Step 3: Implement subscription GET and POST with KV-or-memory persistence**

- [x] **Step 4: Run the targeted route tests**

Run: `node --test tests/intelligence-live-sources.test.mjs`

### Task 4: Wire the Intelligence Center page to the new APIs

**Files:**
- Modify: `app/mdr/intelligence/page.tsx`
- Test: `tests/intelligence-live-sources.test.mjs`
- Test: `tests/intelligence-center.test.mjs`

- [x] **Step 1: Load the live snapshot into the page**

- [x] **Step 2: Add live-source status and real export buttons**

- [x] **Step 3: Load subscriptions from the API and post new subscriptions**

- [x] **Step 4: Keep graceful fallback to the existing mock knowledge sections**

- [x] **Step 5: Run both targeted intelligence test files**

Run: `node --test tests/intelligence-center.test.mjs tests/intelligence-live-sources.test.mjs`

### Task 5: Full verification

**Files:**
- Modify: none
- Test: `tests/*.test.mjs`

- [x] **Step 1: Run the full test suite**

Run: `npm test`

- [x] **Step 2: Run a production build**

Run: `npm run build`
