# Intelligence Ops Layer Design

**Date:** 2026-04-13
**Status:** Proposed for implementation

## Goal

Upgrade the Intelligence Center from a knowledge-and-source portal into a more operational analyst workspace by adding:

- a lightweight relationship graph
- customer relevance scoring
- Threat List and Safelist management
- detection rule export

## Product Intent

This phase is designed to close the most visible gap between a good threat portal and a usable threat operations surface.

The page should help analysts answer:

- what matters most to my customers
- how are these entities connected
- what indicators should be tracked or suppressed
- how can I turn intelligence into detections quickly

## Scope

Phase implementation includes four capabilities:

1. Relationship graph panel
2. Customer relevance scoring
3. Threat List and Safelist APIs plus UI
4. Detection rule export APIs plus UI

## Relationship Graph

Add a lightweight entity relationship view centered on the currently selected object.

The graph does not need a full force layout in v1. A structured graph card is enough:

- focus node
- related actors
- related vulnerabilities
- related IOCs
- related industries

The graph should support these pivots:

- selected vulnerability -> linked actors and IOCs
- selected actor -> linked vulnerabilities and IOCs
- selected IOC -> linked actors and vulnerabilities

## Customer Relevance Scoring

Use current local business context instead of abstract scoring.

### Inputs

- severity or confidence from current intelligence data
- industry overlap against managed customers from `lib/network-mock.ts`
- in-the-wild status for vulnerabilities
- linked actor count or linked IOC count

### Output

Expose:

- a numeric relevance score
- a short reason label such as:
  - `命中托管行业`
  - `在野利用`
  - `高置信 IOC`
  - `多实体关联`

This makes the page feel customer-aware rather than purely encyclopedic.

## Threat List and Safelist

Add a route-backed list manager.

### Storage model

Use optional KV persistence through the existing `kv-optional` helper.

Suggested payload:

- `threat`: array of tracked indicators or topics
- `safelist`: array of suppressed indicators or topics

### Supported actions

- list current entries
- add to threat list
- add to safelist
- deduplicate

## Detection Rule Export

Add a dedicated export route for rule skeletons.

### Formats for v1

- `sigma`
- `suricata`
- `splunk`

### Entity support for v1

- IOC-based exports
- vulnerability-topic exports

The exported rules can be starter templates rather than production-perfect detections.

## Architecture

### New helper module

- `lib/intelligence-ops.ts`
  - build relevance scores
  - build graph snapshots
  - normalize list entries
  - generate rule text

### New routes

- `app/api/intelligence/lists/route.ts`
- `app/api/intelligence/export-rule/route.ts`

### Existing route changes

- `app/api/intelligence/route.ts`
  - append `relevance` and `graph` data
  - append current list contents

### Page changes

- `app/intelligence/page.tsx`
  - show relevance cards
  - show graph panel
  - show threat list and safelist side panel
  - add list actions and export-rule buttons

## UX Placement

Recommended top-to-middle layout:

1. existing header and source banner
2. relevance strip
3. relationship graph panel
4. existing domain content sections
5. right-side or lower-side list management panel

This keeps the new capability visible without replacing the existing portal structure.

## Testing Strategy

Add regression coverage for:

- `lib/intelligence-ops.ts`
- list API route existence
- export-rule API route existence
- page references to graph, relevance, threat list, safelist, and rule export
- route references to new list and export endpoints

## Out of Scope

- user-level authentication
- multi-user shared projects
- persistent graph history
- production-grade tuned detection content
- automatic push to SIEM or EDR
