# Intelligence Command Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `/intelligence` page in cybersec-daily with the Command Bridge threat-intelligence workspace while preserving the existing top-level route, nav position, and live intelligence data layer.

**Architecture:** Keep `app/intelligence/page.tsx` as the route entry, but move most UI into focused local files under `app/intelligence/`. Reuse the current live intelligence fetch and existing `lib/intelligence-*` sources, and rebuild the page into a three-stage layout: Command Bridge, Graph Theater, and Execution Deck.

**Tech Stack:** Next.js App Router, React client component, CSS module, existing live intelligence APIs, Node test runner

---

### Task 1: Add failing structure tests

**Files:**
- Modify: `/tmp/cybersec-daily/tests/intelligence-center.test.mjs`
- Test: `/tmp/cybersec-daily/tests/intelligence-center.test.mjs`

- [ ] **Step 1: Write failing assertions for the new command-bridge layout and local UI module files**
- [ ] **Step 2: Run targeted test to verify it fails**

### Task 2: Build the new intelligence UI modules

**Files:**
- Create: `/tmp/cybersec-daily/app/intelligence/IntelligenceCommandCenter.tsx`
- Create: `/tmp/cybersec-daily/app/intelligence/intelligence-center.module.css`
- Create: `/tmp/cybersec-daily/app/intelligence/view-model.ts`
- Modify: `/tmp/cybersec-daily/app/intelligence/page.tsx`

- [ ] **Step 1: Implement the Command Bridge / Graph Theater / Execution Deck layout**
- [ ] **Step 2: Reuse existing live intelligence and mock fallback data**
- [ ] **Step 3: Keep current intelligence actions available where practical**

### Task 3: Verify in-project behavior

**Files:**
- Test: `/tmp/cybersec-daily/tests/intelligence-center.test.mjs`
- Verify: `/tmp/cybersec-daily/app/intelligence/page.tsx`
- Verify: `/tmp/cybersec-daily/app/intelligence/IntelligenceCommandCenter.tsx`
- Verify: `/tmp/cybersec-daily/app/intelligence/intelligence-center.module.css`

- [ ] **Step 1: Run targeted intelligence tests**
- [ ] **Step 2: Run the full repo test command if targeted tests pass**
- [ ] **Step 3: Push to GitHub and deploy to the existing `cybersec-daily` Vercel project**
