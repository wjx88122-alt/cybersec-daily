# Security UI Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize every UI surface in `cybersec-daily` into a coherent professional security operations product with moderate line icons, stronger scanning hierarchy, and verified desktop/mobile behavior.

**Architecture:** Add a small shared icon/component layer and shared system CSS refinements, then update each product surface without changing route structure or data pipelines. UI behavior will be guarded with static regression tests plus build and Playwright screenshot checks.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Node test runner, Playwright CLI.

---

## File Structure

- Create `components/ui/SystemIcon.tsx`: small inline SVG icon set for moderate line icons.
- Create `tests/security-ui-optimization.test.mjs`: static regression tests for icon adoption, emoji removal in operational UI, focus utilities, and mobile intelligence safeguards.
- Modify `app/styles/tokens.css`: adjust radii/shadows and system colors.
- Modify `app/styles/system.css`: shared surfaces, icon capsules, focus-visible, nav, table/list utility classes.
- Modify `app/styles/public.css`: public page typography, panels, search/filter states, empty/service states.
- Modify `app/styles/intelligence.css`: compact command layout, mobile chip and hero fixes, table/graph safeguards.
- Modify `app/styles/mdr.css`: dense operational surfaces, dashboard/network/splunk classes, icon treatment.
- Modify `app/styles/team.css`: quieter executive workbench surfaces and reduced glow.
- Modify `components/NavBar.tsx`: add line icons, fix logo ratio warning, strengthen mobile nav.
- Modify `components/CategoryFilter.tsx`, `components/feed/FeedLandingClient.tsx`, `components/NewsCard.tsx`, `components/DigestCard.tsx`: public page scanability and icon affordances.
- Modify `app/(executive)/intelligence/components/*.tsx`: add icons and reduce headline/hero overreach.
- Modify `app/(ops)/mdr/page.tsx`, `dashboard/page.tsx`, `network/page.tsx`, `splunk/page.tsx`: remove emoji UI labels, add system icons, tighten operational layout.
- Modify `components/ThreatMap.tsx`, `components/NetworkTopology.tsx`: remove emoji headers and improve professional legends.
- Modify `app/(executive)/team/*.tsx`: add icons to tabs, stats, archive, replay, and reduce presentation feel.

## Task 1: Regression Tests For UI Direction

**Files:**
- Create: `tests/security-ui-optimization.test.mjs`

- [ ] **Step 1: Write failing static tests**

Add tests that assert:
- `components/ui/SystemIcon.tsx` exists and exports `SystemIcon`.
- `components/NavBar.tsx`, `components/feed/FeedLandingClient.tsx`, `app/(ops)/mdr/page.tsx`, `app/(ops)/mdr/dashboard/page.tsx`, `app/(ops)/mdr/network/page.tsx`, `app/(ops)/mdr/splunk/page.tsx`, and Team components import/use `SystemIcon`.
- Operational UI page files no longer contain common UI emoji in labels/headings.
- `app/styles/system.css` includes `.system-focus-ring`, `.system-icon`, and shared target sizing.
- `app/styles/intelligence.css` includes mobile safeguards for topbar chips and hero headings.

- [ ] **Step 2: Run test to verify RED**

Run: `npm test -- tests/security-ui-optimization.test.mjs`

Expected: FAIL because `components/ui/SystemIcon.tsx` and several required usages do not exist yet.

## Task 2: Shared Icon And System Layer

**Files:**
- Create: `components/ui/SystemIcon.tsx`
- Modify: `components/NavBar.tsx`
- Modify: `app/styles/tokens.css`
- Modify: `app/styles/system.css`

- [ ] **Step 1: Implement `SystemIcon`**

Create a typed component with icons for: `shield`, `spark`, `users`, `radar`, `activity`, `alert`, `case`, `clock`, `user`, `server`, `network`, `database`, `plug`, `map`, `search`, `filter`, `external`, `check`, `x`, `arrowRight`, `list`, `file`, `timeline`, `briefcase`, `chart`, `target`, `lock`, `workflow`, `eye`, `save`, `download`, `refresh`, `globe`.

- [ ] **Step 2: Update shared CSS**

Set calmer tokens and add:
- `.system-focus-ring:focus-visible`
- `.system-icon`
- `.system-icon-badge`
- `.system-control`
- `.system-section-heading`
- `button`, `a`, `input`, `select` focus-visible defaults scoped safely.

- [ ] **Step 3: Update `NavBar`**

Add icons to nav items, fix image sizing warning with width/height auto consistency, and ensure nav links have focus-visible styling.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- tests/security-ui-optimization.test.mjs`

Expected: still FAIL until all required page usages are implemented, but SystemIcon and NavBar assertions should pass.

## Task 3: Public Feed Surfaces

**Files:**
- Modify: `components/CategoryFilter.tsx`
- Modify: `components/feed/FeedLandingClient.tsx`
- Modify: `components/NewsCard.tsx`
- Modify: `components/DigestCard.tsx`
- Modify: `app/styles/public.css`

- [ ] **Step 1: Add public-page icons**

Use `SystemIcon` for overview stats, browse hints, current scope, search, category filters, source/time/external affordances, and empty states.

- [ ] **Step 2: Reduce display overreach**

Adjust public hero and card typography/radii so the first viewport reads as briefing content, not giant marketing copy.

- [ ] **Step 3: Improve fallback/empty states**

Make fallback/empty messaging look like service state with reset/search guidance.

- [ ] **Step 4: Run tests**

Run: `npm test -- tests/ui-best-practices-refactor.test.mjs tests/security-ui-optimization.test.mjs`

Expected: security test still may fail for non-public pages; existing public regressions pass.

## Task 4: Intelligence Center

**Files:**
- Modify: `app/(executive)/intelligence/components/Topbar.tsx`
- Modify: `app/(executive)/intelligence/components/ExecutiveBrief.tsx`
- Modify: `app/(executive)/intelligence/components/WhatChanged.tsx`
- Modify: `app/(executive)/intelligence/components/ExposurePriorities.tsx`
- Modify: `app/(executive)/intelligence/components/AnalystDrilldown.tsx`
- Modify: `app/(executive)/intelligence/components/OpsExtensions.tsx`
- Modify: `app/styles/intelligence.css`

- [ ] **Step 1: Add icons to command elements**

Use `SystemIcon` for topbar chips, section nav, filters, verdict factors, decision rail, action rows, exposure rows, hunt/playbook cards, tables, and assistant panels.

- [ ] **Step 2: Compact hero and mobile behavior**

Reduce headline size, avoid max-width that produces oversized Chinese line breaks, and ensure mobile chips wrap horizontally with usable dimensions.

- [ ] **Step 3: Harden graph/table layouts**

Set overflow rules and responsive sizing so graph/table sections remain readable on mobile.

- [ ] **Step 4: Run tests**

Run: `npm test -- tests/intelligence-center.test.mjs tests/security-ui-optimization.test.mjs`

Expected: intelligence and security tests pass for intelligence-related assertions, pending MDR/Team assertions.

## Task 5: MDR Workbench And Subpages

**Files:**
- Modify: `app/(ops)/mdr/page.tsx`
- Modify: `app/(ops)/mdr/dashboard/page.tsx`
- Modify: `app/(ops)/mdr/network/page.tsx`
- Modify: `app/(ops)/mdr/splunk/page.tsx`
- Modify: `components/ThreatMap.tsx`
- Modify: `components/NetworkTopology.tsx`
- Modify: `app/styles/mdr.css`

- [ ] **Step 1: Replace emoji UI labels with `SystemIcon`**

Remove emoji from operational headings, tabs, KPI icon fields, section labels, and action buttons. Keep data-level persona/avatar emoji from mocks only where they represent people.

- [ ] **Step 2: Tighten MDR main workbench**

Make queue, alerts, tickets, analysts, stats, and tabs more compact; ensure each row exposes severity, status, owner, SLA, evidence, and action with icon+text.

- [ ] **Step 3: Reframe dashboard/network/splunk**

Make the dashboard less show-wall-like, network more enterprise-ops-like, and Splunk more configuration-tool-like.

- [ ] **Step 4: Run tests**

Run: `npm test -- tests/phase-seven-mdr-theme-tokens.test.mjs tests/phase-eight-mdr-subpages-theme-tokens.test.mjs tests/security-ui-optimization.test.mjs`

Expected: all MDR and security assertions pass except possible Team assertions.

## Task 6: Team Workbench

**Files:**
- Modify: `app/(executive)/team/components.tsx`
- Modify: `app/(executive)/team/page.tsx`
- Modify: `app/(executive)/team/history/page.tsx`
- Modify: `app/(executive)/team/decisions/page.tsx`
- Modify: `app/(executive)/team/decisions/[slug]/page.tsx`
- Modify: `app/(executive)/team/DecisionArchiveDeck.tsx`
- Modify: `app/(executive)/team/DecisionDiscussionReplay.tsx`
- Modify: `app/(executive)/team/theme.ts`
- Modify: `app/styles/team.css`

- [ ] **Step 1: Add workbench icons**

Use `SystemIcon` in tabs, stats, lanes, call matrix, role cards, timeline, archive query, archive cards, detail sections, replay controls, and related entries.

- [ ] **Step 2: Reduce decorative presentation feel**

Tone down glow layers, nested card feeling, and large rounded containers while keeping warmth.

- [ ] **Step 3: Run tests**

Run: `npm test -- tests/phase-six-team-theme-tokens.test.mjs tests/phase-three-team-language.test.mjs tests/phase-four-team-subpages.test.mjs tests/security-ui-optimization.test.mjs`

Expected: all Team and security assertions pass.

## Task 7: Full Verification And Visual Review

**Files:**
- No production file changes expected, unless verification reveals defects.

- [ ] **Step 1: Run full tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: build exits 0.

- [ ] **Step 3: Start dev server**

Run: `npm run dev -- --port 3000`

Expected: app available at `http://localhost:3000`.

- [ ] **Step 4: Capture desktop screenshots**

Use Playwright CLI to capture:
`/`, `/ai`, `/intelligence`, `/mdr`, `/mdr/dashboard`, `/mdr/network`, `/mdr/splunk`, `/team`, `/team/history`, `/team/decisions`.

Expected: no blank pages, no obvious overlap, coherent system language.

- [ ] **Step 5: Capture mobile screenshots**

Use Playwright CLI to capture:
`/`, `/intelligence`, `/mdr`, `/mdr/network`, `/team/decisions`.

Expected: no clipped primary content, no narrow vertical chips, no incoherent overlap.

- [ ] **Step 6: Check browser console**

Run Playwright console check.

Expected: no errors; no Next image ratio warning.
