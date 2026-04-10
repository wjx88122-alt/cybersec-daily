# Intelligence Mapping Layer Design

**Date:** 2026-04-10
**Status:** Proposed for implementation

## Goal

Add a second live intelligence data layer to the MDR Intelligence Center so the page can show:

- real threat actor profiles from MITRE ATT&CK
- real IOC records from ThreatFox when an Auth-Key is available
- lightweight live mappings from IOC malware labels to ATT&CK actor/tool relationships

## Why This Phase

The current live intelligence phase already covers:

- CISA KEV
- NVD
- EPSS
- CISA advisories

That makes the vulnerability side useful, but the actor and IOC sections are still knowledge-only.

This phase extends the Intelligence Center from "live vulnerability intelligence" to a more complete CTI analyst console.

## Recommended Scope

Use two real upstreams:

1. MITRE ATT&CK STIX data
2. ThreatFox Community API

### MITRE ATT&CK

Use ATT&CK as the source of truth for:

- intrusion-set actor names
- aliases
- ATT&CK group ids
- descriptions
- actor-to-malware relationships

### ThreatFox

Use ThreatFox as the source of truth for:

- recent IOC records
- IOC types
- confidence
- malware labels
- tags
- first/last seen timestamps

ThreatFox requires an Auth-Key. When missing, the system should show the source as unavailable and gracefully fall back to existing mock IOC content.

## Mapping Model

The main mapping rule should be:

1. Parse ATT&CK intrusion sets
2. Parse ATT&CK malware objects
3. Parse ATT&CK `uses` relationships from intrusion sets to malware
4. Match ThreatFox malware labels against ATT&CK malware names and aliases
5. Derive linked actor ids for each IOC

This gives a practical, explainable mapping chain:

- IOC -> malware label -> ATT&CK malware -> ATT&CK actor

It is not perfect attribution, but it is structured, observable, and much better than hardcoded manual links.

## Architecture

### New Module

- `lib/intelligence-mapping-sources.ts`
  - fetch ATT&CK STIX bundle
  - fetch ThreatFox recent IOCs
  - normalize live actors
  - normalize live IOCs
  - build actor-malware map
  - attach linked actor ids to IOCs

### Existing Module Extension

- `lib/intelligence-sources.ts`
  - extend the live snapshot payload to include:
    - `actors`
    - `iocs`
    - updated `sourceStatus`

### Route Layer

- reuse `app/api/intelligence/route.ts`
  - include actor and IOC data in the snapshot response

No new route is required for this phase because the current snapshot route is already the right page-facing integration point.

## UI Changes

### Threat Actor Library

Prefer real MITRE ATT&CK actor entries when available.

Show:

- group name
- ATT&CK group id
- aliases
- summary
- malware/tool associations
- mapped IOC count

### IOC Intelligence Library

Prefer live ThreatFox IOC records when available.

Show:

- IOC value
- IOC type
- confidence
- malware label
- tags
- first/last seen
- linked ATT&CK actor names

### Source Banner

Extend the live-source panel so analysts can see:

- MITRE ATT&CK status
- ThreatFox status

## Error Handling

- If ATT&CK fails: keep mock actor library
- If ThreatFox fails or `THREATFOX_AUTH_KEY` is missing: keep mock IOC library
- If mapping fails: keep live IOC rows without actor links
- Never block the whole page because one live source failed

## Configuration

Add one optional environment variable:

- `THREATFOX_AUTH_KEY`

Behavior:

- present: enable live IOC fetch and mapping
- absent: ThreatFox source marked unavailable, page uses fallback IOC content

## Testing Strategy

Add regression coverage for:

- `lib/intelligence-mapping-sources.ts` existence
- source anchors for ATT&CK STIX and ThreatFox API
- page references to MITRE ATT&CK and ThreatFox
- intelligence snapshot route including actor/ioc support hooks

## Out of Scope

- full TAXII support
- historical IOC warehousing
- attribution confidence scoring
- automated IOC suppression or deduplication workflows
- analyst-authenticated saved watchlists per user
