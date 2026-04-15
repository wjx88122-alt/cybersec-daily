# Apple System Redesign Design

**Date:** 2026-04-15
**Status:** Proposed for implementation

## Goal

Unify the entire `cybersec-daily` product into an Apple system-style interface language inspired by macOS and iOS applications, while preserving the functional differences between public news pages, the intelligence command center, MDR views, and team pages.

## Chosen Direction

Use a **system-style unified language with mode-specific density differences**.

This means:

- one shared Apple-like visual system across the whole product
- different information density and hierarchy per module
- no attempt to force every route into one identical layout

This approach was chosen over:

- turning every page into the same shell with minimal differences
- applying only superficial Apple styling such as larger radius and glass blur

## Design Intent

The site should feel less like a collection of separate experiments and more like one cohesive Apple-style product suite.

The target reference is closer to:

- macOS and iOS application surfaces
- Apple system materials and panel layering
- Apple-first editorial calm on content-heavy screens

The target is **not**:

- an Apple marketing landing page clone
- a literal copy of Apple UI components
- a flat “everything white and rounded” treatment

## Product-Wide Visual Rules

### System Language

Across the whole product, the interface should share:

- restrained neutral palette
- soft but precise layering
- translucent system-like materials
- subtle inner highlights
- very disciplined border usage
- larger but controlled corner radii
- quieter shadows with short depth

### Typography

The typography should move toward Apple-style system clarity:

- cleaner system-sans feel
- tighter hierarchy
- less decorative display treatment
- more emphasis on rhythm, spacing, and weight instead of dramatic styling

Headlines should feel decisive and premium, but not theatrical.

### Color

Color should be reined in across the product:

- neutrals do the heavy lifting
- accents are used sparingly and intentionally
- page identity comes from density and material treatment more than from fully separate palettes

### Motion

Motion should become more system-like:

- shorter travel distance
- softer easing
- reduced decorative reveal effects
- state changes should feel precise, not flashy

## Shared Design System Layer

The redesign should begin at the system layer rather than page-by-page cosmetic edits.

### Global foundations to unify

The following should become shared foundations in `app/globals.css`:

- background treatment
- material surfaces
- border opacity scale
- radius scale
- shadow scale
- text hierarchy
- button styles
- input styles
- navigation shell styles
- transition timing

### Wrapper strategy

Keep existing route-level wrappers, but rebuild them on top of one shared system:

- `public-shell`
- `intelligence-command-center`
- `mdr-shell`
- `team-shell`

Each wrapper should express mode-specific density, not a separate product identity.

## Mode-Specific Adaptation

### Public News Pages

Routes:

- `/`
- `/ai`

These pages should become closer to Apple News or a system content browser.

Required qualities:

- bright and calm
- editorial but app-like
- more whitespace
- cleaner card hierarchy
- less decorative atmosphere

They should still support browsing many items, but with a more refined and less web-template feeling.

### Intelligence Command Center

Route:

- `/intelligence`

This page should remain a command center, but be reinterpreted through an Apple-style professional application lens.

Required qualities:

- dark professional workspace
- layered system panels
- calmer emphasis
- less neon and “cyber dashboard” energy
- strong first-screen hierarchy

It should feel closer to a professional macOS security tool than to a themed threat-wall.

### MDR

Routes:

- `/mdr`
- `/mdr/dashboard`
- `/mdr/network`
- `/mdr/splunk`

These pages should preserve operational density, but visually move toward an Apple-style control application.

Required qualities:

- compact but readable
- strong state communication
- cleaner status chips and panel groups
- less visual clutter

The redesign must not compromise operator scanning speed.

### Team / Executive Pages

Routes:

- `/team`
- `/team/decisions`

These pages should keep their narrative quality, but sit inside the same system family.

Required qualities:

- polished and premium
- warm but restrained
- less campaign-page energy
- more like an executive workspace inside the same application family

## Navigation Strategy

The top navigation is the most important shared artifact in the product.

It should become the anchor of the Apple-style redesign.

### Navigation goals

- look identical across the whole site
- feel more like a system app title/navigation bar than a website menu
- integrate naturally with translucent materials
- remain compact and crisp

### Requirements

- consistent height and spacing across all routes
- clearer active-state treatment
- reduced ornamental shadowing
- stronger alignment with the page shell beneath it

## Component Strategy

Component redesign should follow a shared Apple-style grammar.

### Cards

Cards should use one common material family, then vary only by context:

- public pages: lighter content cards
- intelligence: darker layered command panels
- MDR: compact operational cards
- team: premium but controlled narrative cards

### Inputs

Inputs should feel more like system search bars and filters:

- softer chrome
- more precise focus state
- reduced decorative glow

### Buttons and chips

Buttons and chips should move toward:

- clearer hierarchy
- more system-like fill and border behavior
- less colored ornamentation by default

Severity and operational state colors should remain where they carry meaning.

## Layout Strategy

The redesign should improve cohesion without flattening functional differences.

### Shared layout principle

Every page should read like part of the same operating environment.

### Mode difference principle

Pages should differ mainly by:

- density
- hierarchy
- emphasis scale

They should not differ by fully separate visual languages.

## Implementation Strategy

The redesign should be staged to reduce risk.

### Phase 1

Rebuild the system layer and the top-level pages:

- `DESIGN.md`
- `app/globals.css`
- `components/NavBar.tsx`
- `/`
- `/ai`
- `/intelligence`
- `/mdr`
- `/team`

### Phase 2

Propagate the shared system to deeper route surfaces and detail components:

- `NewsCard`
- `CategoryFilter`
- `/mdr/dashboard`
- `/mdr/network`
- `/mdr/splunk`
- team decision views

## Testing Strategy

The redesign is visual, but implementation still needs structural safety checks.

### Keep contract tests focused on structure

Tests should verify:

- route wrappers remain intact
- critical route composition does not regress
- intelligence and MDR structural hierarchy remains valid

### Manual verification

Manual review should confirm:

- all top-level pages feel like one product family
- intelligence still reads as an analysis tool
- MDR still reads as an operations tool
- public pages feel lighter than operational pages
- nothing drifts back into mixed-brand styling

## Success Criteria

The redesign is successful when:

- the entire site feels like one Apple-style product suite
- each module still preserves its task-specific density
- the top navigation acts as a shared system anchor
- intelligence and MDR do not lose operational clarity
- public pages become calmer and more premium without losing browse efficiency

## Out of Scope

This redesign does not require:

- changing product routing
- changing data-fetching logic
- changing cron or backend workflows
- changing business logic or feed logic
- replacing module content with new feature scope
