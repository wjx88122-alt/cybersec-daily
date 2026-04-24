# Homepage LLM Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show an LLM-authored summary of the current security daily content in the homepage hero.

**Architecture:** Reuse the existing cached daily digest rather than calling an LLM during render. Keep summary formatting in the feed landing view model so the React component stays mostly presentational and the fallback can be tested without a browser.

**Tech Stack:** Next.js server component, React client component, existing feed store, Node test runner.

---

### Task 1: Add View-Model Summary Logic

**Files:**
- Modify: `lib/feed-view-model.js`
- Modify: `tests/ui-best-practices-refactor.test.mjs`

- [ ] **Step 1: Write failing tests**
  - Assert digest overview becomes the hero summary source.
  - Assert missing digest overview falls back to a deterministic current-list summary.

- [ ] **Step 2: Run targeted test**
  - Run: `npm test -- tests/ui-best-practices-refactor.test.mjs`
  - Expected: FAIL because summary fields do not exist yet.

- [ ] **Step 3: Implement summary builder**
  - Extend `buildFeedLandingState` to accept optional `digestOverview`.
  - Return `heroSummary` with `title`, `body`, and `sourceLabel`.

- [ ] **Step 4: Re-run targeted test**
  - Run: `npm test -- tests/ui-best-practices-refactor.test.mjs`
  - Expected: PASS.

### Task 2: Wire Digest Into Homepage

**Files:**
- Modify: `app/(public)/page.tsx`
- Modify: `components/feed/FeedLandingClient.tsx`

- [ ] **Step 1: Load digest on the server page**
  - Import `readDigestFromStore`.
  - Pass `digest?.overview` to `FeedLandingClient`.

- [ ] **Step 2: Render the summary in the hero**
  - Replace the generic hero headline/lead emphasis with `landingState.heroSummary`.
  - Keep metrics and latest timestamp as supporting context.

### Task 3: Verify

**Files:**
- No new files.

- [ ] **Step 1: Run targeted tests**
  - Run: `npm test -- tests/ui-best-practices-refactor.test.mjs`

- [ ] **Step 2: Run lint**
  - Run: `npm run lint`

- [ ] **Step 3: Inspect diff**
  - Run: `git diff -- app/(public)/page.tsx components/feed/FeedLandingClient.tsx lib/feed-view-model.js tests/ui-best-practices-refactor.test.mjs`
