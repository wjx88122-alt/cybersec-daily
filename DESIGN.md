# DESIGN.md

This repository follows an Apple-inspired system design language.

It is written for AI coding agents and human contributors who need to extend the UI without breaking the product's existing visual language.

The target is not an Apple marketing clone.
The target is a product suite that feels closer to macOS and iOS applications:

- layered materials
- calm typography
- restrained color
- precise spacing
- consistent navigation chrome

## Reference Note

This project's design guidance is informed by the `DESIGN.md` workflow popularized by Google Stitch and by design-reference collections such as:

- `VoltAgent/awesome-design-md`

Those references are used as inspiration and calibration, not as files that should be copied blindly into the product.

The final decisions in this repository must follow the product needs of `cybersec-daily`.

## Core Direction

The site should feel like one system product across:

- public security news
- public AI news
- intelligence command center
- MDR operations
- executive team pages

The common reference point is:

- macOS professional apps
- iOS content surfaces
- Apple system materials

This means the UI should read as:

- calmer
- more precise
- less decorative
- more coherent

## Apple System Rules

### Material

- prefer layered translucent surfaces over flat cards
- use subtle inner highlights
- use soft separators instead of hard borders where possible
- let elevation come from material and spacing, not aggressive shadows

### Typography

- prefer system-like sans typography
- use fewer dramatic display treatments
- keep headings compact and highly legible
- keep body copy smooth and quiet

### Color

- rely on neutrals first
- keep accents disciplined
- preserve functional status colors where operational meaning matters
- do not use large neon atmospherics on most pages

### Motion

- subtle
- short travel
- slow enough to feel polished
- avoid theatrical reveal effects

## Mode Differences

### Public Pages

Routes:

- `/`
- `/ai`

Should feel like Apple News inside an application shell:

- bright
- editorial
- clean
- spacious

### Intelligence

Route:

- `/intelligence`

Should feel like a professional dark macOS tool:

- layered dark panels
- calmer accents
- strong hierarchy
- briefing-first

### MDR

Routes:

- `/mdr`
- `/mdr/dashboard`
- `/mdr/network`
- `/mdr/splunk`

Should feel like an operational control application:

- compact but readable
- denser than public pages
- still within the same Apple-style system

### Team

Routes:

- `/team`
- `/team/decisions`
- `/team/history`

Should feel like an executive workspace:

- warmer
- polished
- narrative
- restrained

## Shared UI Requirements

- Navigation must look identical across the whole product.
- Shared cards, pills, inputs, and buttons should come from one system layer.
- Every route wrapper should opt into the same system shell before adding mode-specific styling.
- New UI work should extend this file rather than inventing a separate visual language.
