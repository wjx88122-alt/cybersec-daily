# Homepage LLM Summary Design

## Goal

Replace the generic public homepage hero copy with an intuitive summary of the current page content.

The summary should be authored from the same content set shown on the page, so the first screen answers: what changed today, what deserves attention, and what should the reader inspect first.

## Approved Direction

Use the existing daily LLM digest as the primary summary source.

The homepage should read the cached digest overview that is already produced by the feed pipeline, then display that overview in the hero area. This avoids a live LLM request on every page view and keeps the homepage fast and resilient.

## Scope

In scope:

- Security daily homepage at `/`.
- The existing `FeedLandingClient` hero area.
- Loading the cached digest alongside the current security feed items.
- A local fallback summary when no digest is available.

Out of scope:

- Real-time LLM calls during homepage render.
- Changing the AI news page.
- Changing feed fetching, translation, or digest generation prompts.
- Adding user-specific or search-filter-specific LLM summaries.

## Data Flow

1. The server page loads current security feed items with `loadFeedPageItems("security")`.
2. The server page also loads the cached daily digest from the existing feed store.
3. The digest overview is passed into `FeedLandingClient` as summary data.
4. `FeedLandingClient` renders the LLM summary as the main hero content.
5. If no digest overview exists, the client builds a short deterministic fallback from filtered item count, category coverage, and the current focus item.

## UI Behavior

The old headline should no longer dominate the hero as a generic value proposition.

The hero should instead show:

- Eyebrow: `安全日报`.
- A small source/status pill such as `LLM 基于当前日报生成` or `基于当前列表生成`.
- A compact, content-bearing title derived from the summary.
- A readable paragraph using the digest overview.
- Lightweight supporting signals such as item count, category coverage, and latest update time.

The existing overview card can remain useful for metrics, but it should not repeat the main summary.

## Fallback Behavior

If the digest is missing, empty, or not yet generated:

- Do not call an LLM from the page request.
- Show a deterministic fallback that describes the currently displayed feed set.
- Keep the fallback visibly useful, but label it as based on the current list rather than the LLM digest.

## Testing

Add focused tests for the view-model logic:

- Uses digest overview when available.
- Falls back to deterministic summary when digest overview is missing.
- Produces stable source labels for digest and fallback states.
- Keeps fallback tied to filtered/current items rather than all stored items.

Run the relevant Node tests and the project lint command after implementation.
