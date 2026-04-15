# DESIGN.md

This file defines the visual system for `cybersec-daily`.

It is written for AI coding agents and human contributors who need to extend the UI without breaking the product's existing visual language.

## Design Intent

`cybersec-daily` is not a single-surface marketing site.

It is a multi-mode security product with four distinct but related experiences:

1. Public security news
2. Public AI news
3. Intelligence command center
4. MDR operations views
5. Executive team / strategy pages

The design system should make these modes feel like one product family, while allowing each mode to keep its own posture.

## Reference Note

This project's design guidance is adapted from the `DESIGN.md` workflow popularized by Google Stitch and informed by references from:

- `VoltAgent/awesome-design-md`

The collection is used as inspiration and calibration, not as a file that should be copied blindly into the product.

The final design decisions in this repository must follow the product needs of `cybersec-daily`, not the defaults of any external reference.

## Product Modes

### 1. Public News Pages

Routes:

- `/`
- `/ai`

These pages should feel:

- editorial
- light
- calm
- readable
- premium but not luxurious

Visual characteristics:

- bright backgrounds
- glass-like white surfaces
- soft borders
- strong hierarchy
- generous spacing
- card-driven browsing

Avoid:

- dark enterprise dashboard styling
- excessive color noise
- crowded tables

### 2. Intelligence Command Center

Route:

- `/intelligence`

This page should feel:

- dark
- operational
- high-signal
- command-driven
- analysis-first

Visual characteristics:

- dark layered backgrounds
- luminous accent colors
- strong section rhythm
- top-heavy first screen
- clear demotion from briefing to drilldown

Avoid:

- generic SaaS card layouts
- purple-on-black cliches everywhere
- equal visual weight across all sections

### 3. MDR

Routes:

- `/mdr`
- `/mdr/dashboard`
- `/mdr/network`
- `/mdr/splunk`

These pages should feel:

- operational
- tactical
- readable under pressure
- dashboard-like

Visual characteristics:

- compact cards
- tabular and metric-heavy blocks
- strong status color usage
- obvious operator actions

Avoid:

- marketing-site spacing
- decorative gradients that hide signal

### 4. Team / Executive Pages

Routes:

- `/team`
- `/team/decisions`

These pages should feel:

- strategic
- polished
- human
- narrative

Visual characteristics:

- warmer palette
- stronger storytelling rhythm
- premium cards
- more expressive typographic pacing

## Cross-Product Principles

These rules apply everywhere:

- Navigation should always feel consistent across the whole product.
- Page headers should establish the mode immediately.
- Surfaces should look intentional, not default framework output.
- Visual density must match task density.
- Layouts should guide the reading path rather than presenting everything at once.

## Typography

Use typography to separate product mode:

- headlines: compact, high-contrast, decisive
- section labels: uppercase or small-caps style with clear tracking
- body copy: readable, neutral, no overly light contrast
- metrics: large, direct, compact

Preferred tone:

- security + AI public pages: editorial sans
- intelligence / MDR: tighter, more technical sans with occasional mono usage
- team pages: refined sans with premium pacing

Avoid:

- default browser-looking type stacks without intent
- oversized paragraphs
- weak contrast in operational views

## Color System

### Shared Product Family

The product should feel related through:

- disciplined neutrals
- restrained accent usage
- consistent border softness
- mode-specific background systems

### Public Pages

- off-white and pale slate backgrounds
- subtle blue and gold atmospheric washes
- dark text
- mild shadows

### Intelligence

- deep navy / black backgrounds
- cyan, amber, rose, green, violet accents
- luminous but controlled glow

### MDR

- cool light operational palette
- clear severity colors
- less atmospheric styling than intelligence

### Team

- warmer cream / slate surfaces
- soft gold, blue, and green accents

## Component Rules

### Cards

Cards should not all look the same across the project.

Use:

- lighter editorial cards on public pages
- layered dark panels in intelligence
- compact operation cards in MDR
- premium storytelling cards in team pages

### Buttons and Actions

Actions must visually reflect consequence:

- primary = go do the thing
- warning = high attention but not destructive
- danger = escalation / destructive / urgent
- secondary = navigation or less critical actions

### Data Blocks

Use data presentation appropriate to context:

- public pages: cards and summaries
- intelligence: priority rails and drilldown blocks
- MDR: metrics, queues, timelines, operators

## Layout Rules

### Reading Order

Every page should answer:

1. What mode am I in?
2. What matters first?
3. What can I do next?
4. Where do I drill deeper?

### Section Rhythm

Do not space every section equally.

Use larger emphasis at the top of a page, then tighten rhythm as the user moves into deeper operational content.

### Responsive Behavior

On small screens:

- preserve reading order
- collapse columns aggressively
- keep actions reachable
- do not recreate desktop density in stacked form

## Motion

Motion should be restrained and useful:

- subtle rise-in on public content
- small pulse only for urgent states
- no decorative looping motion in dense operational areas unless it signals state

## AI Agent Guidance

When generating new UI:

- first identify which product mode the page belongs to
- reuse existing mode-specific wrappers and classes where possible
- preserve the current page's visual family before introducing new patterns
- prefer extending the system over inventing a fresh visual language

When uncertain:

- public content should bias toward editorial clarity
- intelligence should bias toward command-center hierarchy
- MDR should bias toward operator efficiency
- team should bias toward narrative polish

## Non-Goals

Do not:

- flatten all modes into one visual style
- turn every page into a dark dashboard
- use a single card recipe everywhere
- copy external reference styles literally without adapting them
