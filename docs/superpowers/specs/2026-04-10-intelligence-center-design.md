# Intelligence Center Design

**Date:** 2026-04-10
**Status:** Proposed for implementation

## Goal

Add a dedicated Intelligence Center under the MDR section for analyst-facing threat knowledge, research, and retrieval.

## Product Positioning

The Intelligence Center is not a news feed and not a ticket console.

It is a threat knowledge hub for analysts that balances two goals:

- support daily analyst research and lookup
- demonstrate the vendor's structured intelligence capability during product walkthroughs

The page should be driven primarily by external threat intelligence and secondarily by internal analyst actions such as subscribe, favorite, export, and jump into downstream MDR workflows.

## Scope

- Add a new MDR subpage at `/mdr/intelligence`
- Add a quick-entry button on the MDR landing page
- Keep the page visually aligned with the existing MDR family
- Focus the first version on mock data and static analyst interactions
- Cover five major knowledge areas:
  - threat actors
  - vulnerability topics
  - IOC intelligence
  - industry alerts
  - reports and subscriptions

## Information Architecture

The Intelligence Center uses one entry page and five knowledge domains:

1. Overview Home
2. Threat Actor Library
3. Vulnerability Topics
4. IOC Intelligence Library
5. Industry Alert Center
6. Reports and Subscriptions

This makes the page feel like a vendor-owned intelligence portal rather than a simple article list.

## Overview Home

The home page should serve as a knowledge launchpad rather than a full dashboard.

### Top Summary Band

Use 4 to 6 analyst-relevant metrics:

- new intelligence items today
- active actor topics
- critical vulnerability topics
- newly added IOCs
- industry alerts requiring attention
- new or updated reports this week

### Main Workspace

Use a two-column middle area:

- left: featured intelligence topic stream
- right: global search, recent views, watched objects, favorites, subscriptions

Featured topics should highlight what deserves analyst attention right now, such as:

- a new APT campaign
- a high-impact exploitation trend
- an industry-specific warning
- an actor-linked infrastructure expansion

### Knowledge Entry Grid

At the bottom, provide clear entry cards for:

- Threat Actor Library
- Vulnerability Topics
- IOC Intelligence Library
- Industry Alert Center
- Reports and Subscriptions

## Analyst Workflow

The page should support a natural intelligence workflow:

1. discover a topic from the home page or search
2. review a concise summary
3. inspect related objects
4. take lightweight analyst actions

The core transitions should be:

- actor -> related vulnerabilities -> related IOCs
- vulnerability -> exploitation status -> related actors -> related IOCs
- IOC -> related topic -> related actor or campaign
- industry alert -> related topic -> recommended focus areas

## Detail Page Templates

Each knowledge object should have a dedicated layout instead of sharing one generic card pattern.

### Threat Actor Detail

Recommended structure:

- header summary: name, aliases, activity status, risk rating, last active date
- profile: origin, target regions, target industries, typical objectives
- TTP overview: mapped to MITRE ATT&CK
- toolset: malware families, loaders, tooling, infrastructure traits
- activity timeline: notable campaigns and updates
- related IOCs: directly usable artifacts
- vendor assessment: what matters, why it matters, what to monitor

This page should answer:

- who they are
- who they target
- how they operate
- what changed recently
- what analysts should monitor next

### Vulnerability Topic Detail

Recommended structure:

- header summary: CVE, severity, CVSS, in-the-wild status, affected products
- explanation: root issue, exploit conditions, attacker prerequisites
- exploitation posture: public PoC, active abuse, actor linkage
- impact view: affected versions, sectors, asset relevance
- detection guidance: logs, signals, hunting cues
- mitigation guidance: patch, workaround, temporary controls
- related objects: actor, IOC, topic, report

This page should present the vulnerability as a live risk topic, not only a catalog entry.

### IOC Intelligence Detail

Recommended structure:

- list view with filters and a detail side panel
- fields: IOC value, type, confidence, severity, source, first seen, last seen, tags
- relationship context: linked actor, linked topic, linked vulnerability, linked sector
- action block: copy, export, add to watchlist, jump to related topic

### Industry Alert Detail

Recommended structure:

- event summary
- impacted industries
- attack vector and target profile
- urgency rating
- recommended response focus
- related topics and linked intelligence
- vendor viewpoint

This page should feel like an analyst briefing rather than a media article.

### Report Detail

Recommended structure:

- report abstract
- key findings
- chapter navigation
- embedded key charts or highlights
- related topics
- subscribe or download actions

## Search and Interaction Model

Global search should be available from the home page and preserved across subpages.

Search should allow analysts to find:

- actor names and aliases
- CVE identifiers
- IOC values
- malware family names
- industry names
- report titles

### Core Filters

Depending on the section, filters should include:

- intelligence type
- severity
- confidence
- affected industry
- active date window
- source tag
- in-the-wild exploitation status

### Core Analyst Actions

The first version should support lightweight but meaningful actions:

- favorite an object
- subscribe to updates
- copy IOC
- export a topic snapshot
- jump to related MDR workflows

These are intentionally lighter than a full operational fusion center, because the first version is still knowledge-first.

## Data Model Approach

The first implementation should use a dedicated mock data module, for example `lib/intelligence-mock.ts`.

Suggested top-level exports:

- `MOCK_INTEL_SUMMARY`
- `MOCK_INTEL_FEATURED_TOPICS`
- `MOCK_INTEL_ACTORS`
- `MOCK_INTEL_VULNERABILITIES`
- `MOCK_INTEL_IOCS`
- `MOCK_INTEL_INDUSTRY_ALERTS`
- `MOCK_INTEL_REPORTS`

Suggested relationships:

- actor ids referenced by vulnerabilities, iocs, and topics
- vulnerability ids referenced by iocs and industry alerts
- report ids referenced by actor or vulnerability topics
- topic tags shared across all object types

The mock layer should model a vendor-owned knowledge graph, even if rendered from local arrays in v1.

## Visual Direction

The page should stay within the existing MDR language but feel more intelligence-oriented than the ticket and UEBA pages.

Recommended visual cues:

- slate, blue, cyan, amber, and red accents instead of consumer-news styling
- dense but readable card layout
- clear typographic hierarchy for summaries, tags, and evidence
- compact metadata chips
- a calmer, library-like mood rather than an alert storm

The page should feel credible, methodical, and archival.

## Navigation and Boundaries

- Keep the page under MDR only
- Do not add it to the public top navigation
- Add a quick-entry button from `/mdr`
- Keep intelligence actions lightweight in v1
- Do not merge this page into the existing MDR dashboard, UEBA, or ticket console

## Testing Strategy

The first implementation should include regression coverage for:

- route existence at `app/mdr/intelligence/page.tsx`
- MDR landing page quick link to `/mdr/intelligence`
- mock intelligence data file existence
- expected anchor strings on the page such as:
  - threat actor library
  - vulnerability topics
  - IOC intelligence
  - industry alerts
  - reports and subscriptions

## Out of Scope

- real threat intel ingestion
- backend persistence
- real IOC export integrations
- direct SIEM/SOAR synchronization
- analyst annotation workflows
- multi-tenant customer intelligence views
- full case management inside the Intelligence Center
