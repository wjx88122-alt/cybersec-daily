# Intelligence Command Center Takeover Design

**Date:** 2026-04-14
**Status:** Proposed for implementation

## Goal

Replace the current `/intelligence` experience in `cybersec-daily` with the new Threat Intelligence Command Center so the route becomes a briefing-led intelligence workspace rather than the existing portal-style page.

## Chosen Approach

Use a direct route takeover.

The standalone `threat-intelligence-command-center` implementation should be rebuilt as a native Next.js page inside `cybersec-daily`, and it should fully replace the current `/intelligence` page.

This was chosen over:

- embedding the standalone static project into the route
- keeping the old intelligence page and adding a child route such as `/intelligence/center`

The direct takeover matches how `MDR` is treated as a first-class product area while avoiding a mixed stack and duplicated intelligence entry points.

## Product Positioning

The new Intelligence Command Center remains a top-level module parallel to `MDR`.

### Navigation model

- keep the existing top nav item `情报中心`
- keep the route as `/intelligence`
- keep cross-links between intelligence and `MDR`
- do not introduce a second intelligence route for the new page

### Module relationship

The new page should follow the same high-level product logic as `MDR`:

- it is a standalone first-class module
- it may link to other modules
- it is not nested under another workflow area

## Scope

This phase includes:

- replacing `app/intelligence/page.tsx` with the new command-center experience
- porting the standalone homepage information architecture into native React components
- porting the standalone demo data into route-local data for `cybersec-daily`
- porting the new visual hierarchy into `cybersec-daily` styling
- rewriting intelligence route tests so they validate the new homepage contract
- retiring old intelligence-page-specific behavior and tests that no longer match the new product direction

## Out of Scope

This phase does not include:

- preserving the old intelligence page UX
- preserving the old export, subscription, watchlist, live-source, relevance, graph, or ops panels as part of the `/intelligence` experience
- merging the standalone project as a separate app inside the repo
- redesigning other first-class modules such as `MDR`, `AI`, or `团队`
- reconnecting the new page to live backend sources in this migration pass

## Route and Page Strategy

Use the existing route:

- `app/intelligence/page.tsx`

The current page content should be replaced rather than wrapped.

The site-level `NavBar` stays in place, but the page body beneath it should become the new command center.

## Information Architecture

The new `/intelligence` page should follow the briefing-first structure already validated in the standalone project:

1. Executive Brief
2. What Changed
3. Exposure Priorities
4. Analyst Drilldown

### Executive Brief

This section is the first-read surface and should foreground:

- overall threat posture
- today’s decision rail
- posture snapshot KPIs
- why this matters

This is the core replacement for the previous portal-style intelligence landing page.

### What Changed

This section should summarize campaign movement with:

- one primary campaign card
- two secondary campaign cards

The goal is fast briefing, not a full intelligence timeline dump.

### Exposure Priorities

This section should show the most actionable exposure rows only.

For the first pass, the standalone project’s top-priority exposure view is the model:

- limited row count
- asset + finding + score + owner + action

### Analyst Drilldown

This is the lower-priority investigation area and should contain:

- graph / relationship context
- hunt workspace
- playbooks / response guidance

It remains part of the page, but should be visually demoted below the briefing surfaces.

## Component Architecture

`app/intelligence/page.tsx` should become a composition layer, not a monolithic page file.

Recommended route-local structure:

- `app/intelligence/page.tsx`
- `app/intelligence/data.ts`
- `app/intelligence/components/ExecutiveBrief.tsx`
- `app/intelligence/components/WhatChanged.tsx`
- `app/intelligence/components/ExposurePriorities.tsx`
- `app/intelligence/components/AnalystDrilldown.tsx`

Smaller support components can be added under the same folder only where they clearly improve readability, for example:

- `CampaignCard`
- `ExposureRow`
- `GraphPanel`
- `PlaybookCard`

## Data Strategy

Do not import the standalone project as a runtime dependency.

Instead, copy and adapt the standalone demo content into a route-local typed data module inside `cybersec-daily`.

Recommended shape:

- topbar data
- hero / executive brief data
- KPI data
- campaign data
- exposure data
- graph data
- hunt data
- playbook data

The first pass should prefer local deterministic data over preserving the old intelligence route’s dynamic APIs.

## Styling Strategy

The standalone project’s visual system should be ported into `cybersec-daily`, but adapted to the existing app styling approach.

### Recommended styling approach

- add the new page-specific structural classes to `app/globals.css`
- keep the page under a strong top-level wrapper so the new styles remain scoped in practice
- preserve the validated structural class names where useful, such as:
  - `homepage-shell`
  - `executive-brief`
  - `brief-hero`
  - `decision-rail`
  - `posture-snapshot`
  - `what-changed`
  - `exposure-priorities`
  - `analyst-drilldown`

### Styling constraints

- do not break existing `MDR`, homepage, or team page styles
- avoid introducing a second independent stylesheet pipeline
- keep the new page visually distinct but still compatible with the host app shell

## Migration of Existing Intelligence Code

The old intelligence route is not being preserved as an alternate mode.

### Required removal or retirement

- replace the old page implementation in `app/intelligence/page.tsx`
- remove or rewrite tests that assert the old portal structure
- stop treating the old intelligence-specific API-backed workflow as required for the route

### Optional cleanup during implementation

If the old intelligence helper modules and API routes become unused after the page takeover, they should be removed or clearly isolated in the same implementation pass where practical.

If that cleanup would materially expand risk, it can be staged after the route replacement, but the user-facing `/intelligence` page must already be fully replaced.

## Testing Strategy

The migration should use the new homepage contract as the test anchor.

### Test-first requirements

Update `tests/intelligence-center.test.mjs` so it verifies that `/intelligence` now exposes the new command-center structure and vocabulary.

Expected assertions should cover:

- presence of the new structural classes
- absence of the old page contract
- expected top-level reading order
- expected key phrases from the new command center

### Regression cleanup

Any tests that still force the old intelligence route model should be removed or rewritten, especially tests tied to:

- old route-specific domains
- old export/subscription/live-source interactions
- old ops-layer assumptions

### Verification

Implementation should be considered complete only after:

- `npm test` passes in `cybersec-daily`
- the `/intelligence` page renders locally in the Next.js app
- the route visibly shows the new command-center layout instead of the previous intelligence portal

## Risks and Mitigations

### Risk: style bleed from global CSS

Mitigation:

- keep all new layout rules under a page-specific wrapper and structural class set

### Risk: page file becomes too large again

Mitigation:

- keep `page.tsx` as a thin composition layer
- move major sections into dedicated route-local components

### Risk: old intelligence tests block the migration

Mitigation:

- rewrite the route contract early
- treat old route assumptions as obsolete, not as compatibility requirements

### Risk: host app and standalone project diverge during manual porting

Mitigation:

- preserve the approved section order and class contract from the standalone project
- migrate data and layout intentionally instead of improvising new structure during the port

## Success Criteria

The migration is successful when:

- `/intelligence` in `cybersec-daily` displays the new Threat Intelligence Command Center
- the route behaves as a first-class product area parallel to `MDR`
- the old intelligence landing page experience is no longer shown
- the implementation is native to the host Next.js app
- tests validate the new homepage contract rather than the previous portal model
