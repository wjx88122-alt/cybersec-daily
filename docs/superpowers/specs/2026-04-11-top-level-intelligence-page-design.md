# Top-Level Intelligence Page Design

**Date:** 2026-04-11
**Status:** Proposed for implementation

## Goal

Promote the Intelligence Center from an MDR subpage into a top-level product page parallel to MDR.

## Product Change

The Intelligence Center should no longer live under `/mdr`.

Instead:

- primary route becomes `/intelligence`
- the top navigation includes a first-class `情报中心` item
- the page is treated as a peer of `MDR`, not a child module

## Scope

- move the main route from `/mdr/intelligence` to `/intelligence`
- add `情报中心` to the top navigation
- update active-nav highlighting on the page
- update MDR quick-entry links to point to `/intelligence`
- remove MDR-subordinate copy such as "返回 MDR 工单系统"
- update tests that still expect the old route

## Navigation Model

Recommended top nav order:

1. 安全
2. AI
3. 团队
4. 情报中心
5. MDR

This preserves the existing product areas while giving intelligence a clear peer position.

## Route Strategy

Use a direct move, not a redirect.

### New primary route

- `app/intelligence/page.tsx`

### Old route

- remove `app/mdr/intelligence/page.tsx`

The user explicitly chose not to keep compatibility routing.

## Page Content Changes

The page content should stay mostly the same, but its framing must change.

### Required copy updates

- `NavBar active="情报中心"`
- remove or replace `← 返回 MDR 工单系统`
- keep `跳转 MDR 处置` because it is a cross-module workflow action, not a hierarchy signal

### Tone change

The page should read as a top-level intelligence workspace, not an MDR attachment.

## MDR Page Changes

The MDR landing page should keep a quick-entry card or button for intelligence, but it should now link to:

- `/intelligence`

This preserves module interoperability without implying ownership.

## Testing Strategy

Update regression coverage so tests confirm:

- route existence at `app/intelligence/page.tsx`
- top nav contains `情报中心`
- MDR page links to `/intelligence`
- no test depends on `/mdr/intelligence`

## Out of Scope

- redirect from `/mdr/intelligence`
- changing page visual language
- changing intelligence data sources
- changing export or subscription behavior
