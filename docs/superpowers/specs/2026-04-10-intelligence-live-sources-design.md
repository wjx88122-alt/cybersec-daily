# Intelligence Live Sources and Export Design

**Date:** 2026-04-10
**Status:** Proposed for implementation

## Goal

Upgrade the MDR Intelligence Center from a pure mock knowledge page into a hybrid intelligence console that can:

- pull live vulnerability intelligence from authoritative public sources
- expose export endpoints for reusable intelligence snapshots
- support lightweight subscriptions with persistent storage when KV is configured

## Why This Phase

The current Intelligence Center already has a solid knowledge-base UI, but all data is static.

The best next step is not full TAXII/STIX ingestion. The best next step is a stable live-data slice that fits the existing product:

- official exploited-vulnerability data
- vulnerability enrichment data
- exploit likelihood scoring
- exportable summaries
- lightweight subscriptions

This keeps the project practical while moving it decisively beyond demo-only mock data.

## Recommended Scope

Phase C should focus on a vulnerability-led live intelligence slice.

### Real Sources for v1

Use these sources:

1. CISA Known Exploited Vulnerabilities catalog
2. NVD CVE API
3. FIRST EPSS API
4. CISA Cybersecurity Advisories RSS

These sources are a good fit because they are:

- authoritative
- publicly accessible
- structurally stable
- directly relevant to analyst prioritization

## Product Shape

The page remains the same Intelligence Center route, but it becomes hybrid:

- threat actors, IOC library structure, reports, and some knowledge framing can remain mock-backed for now
- summary metrics, featured topics, vulnerability topics, and advisories should use live data
- export and subscription become real route-backed features

## Architecture

### Data Flow

1. Server route fetches live sources
2. Source-specific parsers normalize external payloads
3. A unified live snapshot model is built
4. The Intelligence Center page fetches the snapshot client-side
5. The page merges live snapshot data with existing mock knowledge sections

### Main Components

- `lib/intelligence-sources.ts`
  - external source clients
  - source-specific parsing
  - unified live intelligence model builder

- `lib/kv-optional.ts`
  - safe optional KV access for environments without Upstash credentials

- `app/api/intelligence/route.ts`
  - returns live intelligence snapshot JSON

- `app/api/intelligence/export/route.ts`
  - exports JSON or Markdown intelligence snapshots

- `app/api/intelligence/subscriptions/route.ts`
  - reads and writes subscription items
  - uses KV when configured
  - falls back to process memory when KV is unavailable

- `app/mdr/intelligence/page.tsx`
  - consumes the live snapshot
  - adds real export links
  - loads and updates subscriptions via API

## Live Snapshot Model

The route should return a payload shaped like:

- `updatedAt`
- `sourceStatus`
- `summary`
- `featuredTopics`
- `vulnerabilities`
- `advisories`
- `subscriptions`

This model should be focused and UI-ready so the page does not need complex client-side transformation.

## Export Behavior

### Supported formats

- `json`
- `markdown`

### Supported scopes

- global snapshot
- single vulnerability via `cve`

The export route should generate:

- machine-friendly JSON for downstream tooling
- analyst-friendly Markdown for mail, tickets, docs, and reports

## Subscription Behavior

Subscriptions should support:

- listing current topics
- adding a topic
- deduplicating topics

Persistence rules:

- if KV credentials exist: persist in Upstash
- otherwise: use in-memory fallback and return `storage: "memory"`

This keeps the feature usable in development and stable in production.

## UI Changes

The Intelligence Center page should add:

- a live-source banner showing active upstreams
- a server-backed summary and vulnerability list
- export buttons that hit the export route
- subscription state loaded from the subscriptions route
- a clearer distinction between live sections and knowledge-base sections

## Error Handling

The system should degrade gracefully:

- if one source fails, keep partial snapshot data
- if all live sources fail, show mock fallback plus source status
- export route should still work from available data
- subscriptions route should still work via memory fallback when KV is missing

## Testing Strategy

Add regression coverage for:

- dynamic repo-root-safe intelligence tests
- existence of the three intelligence API routes
- source client file containing the official source anchors
- page references to live snapshot, export, and subscription APIs
- subscriptions route storage fallback contract

## Out of Scope

- TAXII/STIX ingestion
- MISP sync
- rule push to SIEM or SOAR
- user authentication
- scheduled subscription delivery
- multi-tenant subscription profiles
