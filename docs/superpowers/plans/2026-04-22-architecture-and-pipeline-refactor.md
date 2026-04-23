# Architecture And Pipeline Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `cybersec-daily` so public reads are pure, internal jobs use direct services, public feed pages render server-first, and the styling system is split into maintainable layers.

**Architecture:** Introduce a feed store/service layer between route handlers and KV, migrate `/` and `/ai` to a shared server-first feed renderer, and split the global styling surface into tokens, system primitives, and per-product shells. Preserve current URLs and product content while reducing coupling.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind utility classes, layered global CSS, Node built-in test runner

---

## File Map

- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/tests/architecture-refactor.test.mjs`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/lib/feed-store.ts`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/lib/feed-page-data.ts`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/lib/feed-pipeline.ts`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/components/feed/FeedLandingClient.tsx`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/components/shells/PublicShell.tsx`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/components/shells/ProductSectionShell.tsx`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/app/styles/tokens.css`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/app/styles/system.css`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/app/styles/public.css`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/app/styles/team.css`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/app/styles/mdr.css`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/app/styles/intelligence.css`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/globals.css`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/ai/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/team/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/intelligence/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/mdr/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/mdr/dashboard/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/mdr/network/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/mdr/splunk/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/components/NavBar.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/components/CategoryFilter.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/lib/feed-search.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/lib/digest.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/feed/route.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/feed-a/route.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/feed-b/route.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/feed-ai/route.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/cron/route.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/translate/route.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/images/route.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/summarize/route.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/digest/route.ts`

## Task 1: Lock In The Architecture Contract

**Files:**

- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/tests/architecture-refactor.test.mjs`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/tests/feed-search-localization.test.mjs`

- [ ] Write failing contract tests for:
  - public feed routes being read-only
  - `/` and `/ai` not using `useEffect` for initial data fetch
  - both public pages using one shared feed landing component
  - `app/globals.css` importing layered CSS files
- [ ] Run `npm test` and confirm the new contract fails for the expected reasons.
- [ ] Fix the existing ESM regression around `translation-detection` imports only after the new contract is in place.

## Task 2: Build The Feed Store And Pipeline Services

**Files:**

- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/lib/feed-store.ts`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/lib/feed-pipeline.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/cron/route.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/images/route.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/translate/route.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/summarize/route.ts`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/api/digest/route.ts`

- [ ] Write focused tests for store helpers and pure-route behavior.
- [ ] Extract feed, digest, and snapshot KV access into the store layer.
- [ ] Extract direct pipeline services for images, translations, summaries, digest rebuild, and snapshot updates.
- [ ] Update cron and internal routes to call services directly instead of self-fetching internal URLs.
- [ ] Re-run targeted tests, then the full suite.

## Task 3: Make Public Pages Server-First And Shared

**Files:**

- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/lib/feed-page-data.ts`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/components/feed/FeedLandingClient.tsx`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/components/shells/PublicShell.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/ai/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/components/CategoryFilter.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/components/NavBar.tsx`

- [ ] Write or extend tests to prove the public pages share one feed surface.
- [ ] Move initial feed loading into server-side helpers.
- [ ] Keep interactivity in one client component for filtering and search.
- [ ] Derive active navigation state from pathname so shells can own chrome consistently.
- [ ] Re-run targeted tests and the full suite.

## Task 4: Split The Styling Layer

**Files:**

- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/app/styles/tokens.css`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/app/styles/system.css`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/app/styles/public.css`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/app/styles/team.css`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/app/styles/mdr.css`
- Create: `/Users/kissbye/Documents/Playground/cybersec-daily/app/styles/intelligence.css`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/globals.css`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/team/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/intelligence/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/mdr/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/mdr/dashboard/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/mdr/network/page.tsx`
- Modify: `/Users/kissbye/Documents/Playground/cybersec-daily/app/mdr/splunk/page.tsx`

- [ ] Write tests that assert the layered CSS file structure exists.
- [ ] Move tokens and shared system classes out of the monolithic global file.
- [ ] Keep only mode wrappers in per-product CSS files.
- [ ] Update page shells to consume shared classes instead of page-local wrapper duplication.
- [ ] Run the full suite and visually inspect major routes for regressions.

## Task 5: Final Verification

**Files:**

- Modify as needed based on browser review feedback.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Start the local app and review `/`, `/ai`, `/team`, `/intelligence`, and `/mdr` in a real browser.
- [ ] Fix any layout, runtime, or hydration regressions found during review.
- [ ] Re-run tests and build after the final round of fixes.
