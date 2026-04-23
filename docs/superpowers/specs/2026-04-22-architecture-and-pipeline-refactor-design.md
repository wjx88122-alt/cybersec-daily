# Architecture And Pipeline Refactor Design

**Date:** 2026-04-22
**Status:** Implementing

## Goal

Resolve the main structural issues in `cybersec-daily` by:

- separating public read routes from background mutation jobs
- moving the public feed pages to a server-first data flow
- reducing page duplication across `/` and `/ai`
- turning the styling layer into a maintainable system instead of one oversized global file
- preserving the current product surfaces and visual intent while improving maintainability

## External Guidance

This design follows current official guidance from Next.js and React:

- Next.js App Router defaults pages and layouts to Server Components, which should fetch data on the server and hand interactive slices to Client Components.
  Source: [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- Next.js recommends fetching data in Server Components directly from the source instead of routing the request through a Route Handler first, because the extra HTTP hop is slower.
  Source: [Next.js Backend for Frontend Guide](https://nextjs.org/docs/app/guides/backend-for-frontend)
- Route Handlers are request adapters, not layout participants.
  Source: [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware)
- Route groups and layouts are the intended way to organize related product areas without changing URL structure.
  Source: [Next.js Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
- Global CSS should stay truly global; scoped styling should move closer to components when possible.
  Source: [Next.js CSS](https://nextjs.org/docs/app/getting-started/css)

## Current Problems

### 1. Public reads trigger background mutations

`/api/feed*` routes currently return cached data and also attempt image and translation repair. This mixes read traffic with operational work, makes caching semantics unclear, and increases coupling between unrelated concerns.

### 2. Internal jobs call other internal routes over HTTP

`cron`, `translate`, `summarize`, and health helpers bounce through internal HTTP calls. That creates extra failure points, hides orchestration inside route files, and makes local reasoning harder.

### 3. Public feed pages duplicate the same page logic

`/` and `/ai` are nearly the same page implemented twice, and both fetch their content on the client after render.

### 4. Styling is centralized in one large global file

`app/globals.css` currently combines tokens, shared system primitives, per-product shells, and product-specific overrides. Some mode styles are duplicated, and some route-specific overrides are coupled to raw utility class names.

### 5. Product boundaries are weak

Public, team, MDR, and intelligence surfaces are all described as one product suite, but the current implementation still relies on page-local wrapper logic instead of shared shells and focused route-level boundaries.

## Chosen Direction

Use a **server-first page model plus explicit service and shell layers**.

This design keeps the current URLs and product surfaces, but re-centers the codebase around:

- pure read adapters for public APIs
- direct service calls for internal jobs
- shared feed page primitives
- route-level shell components and layouts where useful
- split CSS layers with clear ownership

## Architecture

### A. Data Access Layer

Create a focused KV access layer for feed and digest data.

Responsibilities:

- load feed groups from KV
- load merged security feed items
- load AI feed items
- persist updated feed groups
- load and save digest and snapshots

This isolates storage concerns from routes and from job orchestration.

### B. Background Job Layer

Create direct service functions for the pipeline:

- `refreshFeedCaches`
- `repairRecentImages`
- `repairTranslations`
- `summarizeRecentItems`
- `rebuildDigest`
- `updateDailySnapshot`

Route Handlers will call these services directly instead of self-fetching internal URLs.

### C. Public API Layer

Keep the existing public routes for compatibility, but narrow their role:

- `GET /api/feed`, `/api/feed-a`, `/api/feed-b`, `/api/feed-ai`:
  return cached data only
- `GET /api/digest`:
  return cached digest only
- auth-gated internal routes:
  thin adapters around the service layer

### D. Page Composition Layer

Public news pages become server components that read data directly from the KV-backed read layer and pass it into a shared interactive client component.

Structure:

- server page loads feed items
- shared client component handles:
  - category state
  - search state
  - cutoff filtering
  - hero/rest presentation

This removes duplicate client fetch code and aligns with App Router guidance.

### E. Shell And Layout Layer

Introduce shared shell components and route-level ownership:

- public shell for `/` and `/ai`
- team shell for `/team*`
- MDR shell for `/mdr*`
- intelligence shell for `/intelligence`

The navigation component should derive the active tab from pathname rather than page-local props, so shells can own the top chrome consistently.

### F. Styling Layer

Split CSS into focused files:

- `app/styles/tokens.css`
- `app/styles/system.css`
- `app/styles/public.css`
- `app/styles/team.css`
- `app/styles/mdr.css`
- `app/styles/intelligence.css`

`app/globals.css` becomes the import hub instead of the full implementation file.

Rules:

- tokens define palette, spacing, radii, shadows
- system defines shared primitives
- per-product files define mode wrappers only
- page-specific quirks should not be encoded as global overrides of arbitrary utility class names

## File Design

### New Or Refactored Services

- `lib/feed-store.ts`
  Unified KV read/write helpers for feeds, digest, and snapshots.
- `lib/feed-pipeline.ts`
  Direct orchestration helpers used by cron and internal routes.
- `lib/feed-page-data.ts`
  Server-side read helpers for public pages.

### New Shared UI

- `components/feed/FeedLandingClient.tsx`
  Shared interactive rendering for public feeds.
- `components/shells/*.tsx`
  Shared route shells.

### Updated Routes

- public feed routes become read-only
- cron and internal job routes become thin wrappers around service functions

## Data Flow

### Public Page Render

1. Server page loads feed items through `feed-page-data`.
2. Server page renders the shared feed landing client component with initial items and page copy config.
3. Client component manages search and category interactions only.

### Scheduled Refresh

1. Cron route calls `refreshFeedCaches`.
2. Cron route then directly runs best-effort enrichment services:
   - image repair
   - translation repair
   - summarization
   - digest rebuild
   - snapshot update
3. Route returns one consolidated response describing job results.

### Public API Read

1. Route reads cached data through `feed-store`.
2. Route returns JSON.
3. No mutation or repair logic runs on read.

## Error Handling

- Public read routes should degrade to `[]` or a clear 404/500 response based on data type.
- Internal job routes should return structured status for each stage.
- Best-effort stages should report failure without corrupting previously cached content.
- Pipeline services should preserve stale cached data when upstream sources fail.

## Testing Strategy

### Contract Tests

Add architecture tests that assert:

- public feed routes no longer import or trigger repair helpers
- public pages are server-first and do not use `useEffect` for initial feed loading
- the shared feed landing client exists and is used by both `/` and `/ai`
- global styling is split into layered CSS files and imported through `app/globals.css`

### Unit Tests

Add service tests for:

- feed store merge/read helpers
- active navigation derivation
- feed page data loading behavior

### Regression Tests

Keep the existing feed-search localization tests and fix the ESM import break so the suite passes again.

## Migration Notes

- Preserve current URLs and public API shapes where possible.
- Preserve current visual tone; this refactor is architectural first, not a brand reset.
- Avoid changing the intelligence and MDR domain content; focus on shell, data access, and shared structure.

## Success Criteria

This refactor is complete when:

- public read endpoints no longer trigger background work
- cron and internal routes orchestrate via direct services instead of self-fetching
- `/` and `/ai` share one feed rendering system and load data on the server
- the CSS layer is split into maintainable files with the same visual outcome
- tests pass and the main pages render correctly in a real browser
