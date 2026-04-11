# Top-Level Intelligence Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the Intelligence Center into a top-level page at `/intelligence` and make it a peer of MDR in the main navigation.

**Architecture:** Move the current page route out of `app/mdr` into `app/intelligence`, update navigation and MDR entry links to the new path, and refresh regression tests so the route contract matches the new top-level structure.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Tailwind utility classes, Node built-in test runner

---

### Task 1: Update regression tests for the new top-level route

**Files:**
- Modify: `tests/intelligence-center.test.mjs`
- Modify: `tests/intelligence-live-sources.test.mjs`
- Modify: `tests/intelligence-mapping-layer.test.mjs`
- Test: `tests/intelligence-center.test.mjs`
- Test: `tests/intelligence-live-sources.test.mjs`
- Test: `tests/intelligence-mapping-layer.test.mjs`

- [x] **Step 1: Rewrite the tests to point at `app/intelligence/page.tsx` and `/intelligence`**

- [x] **Step 2: Add a nav assertion for the top-level `情报中心` item**

- [x] **Step 3: Run the targeted tests and verify they fail before the route move**

Run: `node --test tests/intelligence-center.test.mjs tests/intelligence-live-sources.test.mjs tests/intelligence-mapping-layer.test.mjs`

### Task 2: Promote the route and update navigation

**Files:**
- Create: `app/intelligence/page.tsx`
- Delete: `app/mdr/intelligence/page.tsx`
- Modify: `components/NavBar.tsx`
- Modify: `app/mdr/page.tsx`
- Test: `tests/intelligence-center.test.mjs`

- [x] **Step 1: Copy the Intelligence Center page to `app/intelligence/page.tsx`**

- [x] **Step 2: Update page-level copy to remove MDR-subordinate framing**

- [x] **Step 3: Add top-level nav entry for `情报中心`**

- [x] **Step 4: Point MDR quick-entry links at `/intelligence`**

- [x] **Step 5: Remove the old `app/mdr/intelligence/page.tsx` route**

- [x] **Step 6: Run the targeted intelligence-center test and verify it passes**

Run: `node --test tests/intelligence-center.test.mjs`

### Task 3: Verify live-source and mapping references against the new route

**Files:**
- Modify: `app/intelligence/page.tsx`
- Test: `tests/intelligence-live-sources.test.mjs`
- Test: `tests/intelligence-mapping-layer.test.mjs`

- [x] **Step 1: Update test expectations and any route references to `/intelligence`**

- [x] **Step 2: Verify the top-level page still references live snapshot, export, subscriptions, MITRE ATT&CK, and ThreatFox**

- [x] **Step 3: Run the targeted live-source and mapping tests**

Run: `node --test tests/intelligence-live-sources.test.mjs tests/intelligence-mapping-layer.test.mjs`

### Task 4: Full verification

**Files:**
- Modify: none
- Test: `tests/*.test.mjs`

- [x] **Step 1: Run the full test suite**

Run: `npm test`

- [x] **Step 2: Run a production build**

Run: `npm run build`
