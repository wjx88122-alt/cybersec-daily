# Apple System Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `cybersec-daily` into a unified Apple system-style product suite while preserving the distinct task density of public news, intelligence, MDR, and team experiences.

**Architecture:** Introduce a shared Apple-style design system layer in `app/globals.css` and route all major surfaces through it using shared shell and component classes. Then refactor the global navigation, top-level routes, and the key MDR subpages so they read like one coherent product family instead of several disconnected visual experiments.

**Tech Stack:** Next.js App Router, React 19, TypeScript, global CSS, Node built-in test runner (`node --test`)

---

## File Map

- Create: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/tests/apple-system-redesign.test.mjs`
  - Contract tests for the Apple-style system layer and route wrappers.
- Create: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/DESIGN.md`
  - Repository-level Apple-style system guidance tailored to this product.
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/globals.css`
  - Shared Apple-style tokens, system materials, navigation chrome, and mode wrappers.
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/components/NavBar.tsx`
  - Convert global navigation into Apple-style unified system chrome.
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/components/CategoryFilter.tsx`
  - Make filtering controls feel like system segmented controls.
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/components/NewsCard.tsx`
  - Move content cards toward Apple-style editorial application surfaces.
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/page.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/ai/page.tsx`
  - Apply the Apple-style public content shell.
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/intelligence/page.tsx`
  - Wrap the command center in the new unified Apple-style system shell.
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/mdr/page.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/mdr/dashboard/page.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/mdr/network/page.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/mdr/splunk/page.tsx`
  - Reframe MDR surfaces as Apple-style professional operations views.
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/team/page.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/team/decisions/page.tsx`
  - Bring team pages into the unified Apple-style system family.

## Task 1: Lock The Apple System Contract In Tests

**Files:**
- Create: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/tests/apple-system-redesign.test.mjs`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/tests/intelligence-center.test.mjs`

- [ ] **Step 1: Write a failing Apple-system test file**

Create `tests/apple-system-redesign.test.mjs` with assertions that require:

- `DESIGN.md` exists
- `DESIGN.md` contains `macOS` and `iOS`
- `app/globals.css` contains Apple-style shared tokens and classes such as:
  - `--system-surface`
  - `--system-surface-strong`
  - `--system-separator`
  - `.system-shell`
  - `.system-card`
  - `.system-nav`
- `components/NavBar.tsx` references:
  - `system-nav-shell`
  - `system-nav-bar`
  - `system-nav-item`
- top-level routes include Apple-style shell hooks:
  - `app/page.tsx`
  - `app/ai/page.tsx`
  - `app/intelligence/page.tsx`
  - `app/mdr/page.tsx`
  - `app/team/page.tsx`

- [ ] **Step 2: Run the full test suite and verify it fails for the right reason**

Run:

```bash
npm test
```

Expected:

- FAIL because the Apple-style design system and route hooks do not exist yet.

- [ ] **Step 3: Keep existing intelligence contract coverage intact**

Do not remove the intelligence route contract tests. The Apple redesign is layered on top of the existing command-center structure, not a replacement for it.

- [ ] **Step 4: Commit the red tests**

```bash
git add tests/apple-system-redesign.test.mjs tests/intelligence-center.test.mjs
git commit -m "test: define apple system redesign contract"
```

## Task 2: Build The Shared Apple-Style Design System Layer

**Files:**
- Create: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/DESIGN.md`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/globals.css`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/components/NavBar.tsx`

- [ ] **Step 1: Add the failing design-system hooks to `NavBar.tsx`**

Update the navigation markup so it references new system classes before the CSS exists:

- `system-nav-shell`
- `system-nav-bar`
- `system-nav-brand`
- `system-nav-item`

- [ ] **Step 2: Run tests and verify failure is now centered on missing CSS/system tokens**

Run:

```bash
npm test
```

Expected:

- route and nav hooks exist
- tests still fail because Apple-style shared classes and tokens have not been implemented yet

- [ ] **Step 3: Create `DESIGN.md` with Apple system guidance**

Write a repository-level design source that defines:

- system-style Apple material language
- shared cross-product rules
- density differences for public, intelligence, MDR, and team modes

- [ ] **Step 4: Rewrite the shared system layer in `app/globals.css`**

Add the new global token set and shared utilities:

- surface tokens
- separator tokens
- radius scale
- Apple-style shadows
- material blur surfaces
- shared shell classes
- Apple-style navigation system
- shared card, pill, button, and input system

Preserve the existing route wrappers (`public-shell`, `intelligence-command-center`, `mdr-shell`, `team-shell`), but make them inherit from one system family.

- [ ] **Step 5: Run tests and verify the shared system layer passes**

Run:

```bash
npm test
```

Expected:

- PASS for the new Apple-system contract tests
- existing intelligence tests remain green

- [ ] **Step 6: Commit the shared system layer**

```bash
git add DESIGN.md app/globals.css components/NavBar.tsx
git commit -m "feat: add apple system design layer"
```

## Task 3: Refactor Public, Intelligence, MDR, And Team Pages Onto The New System

**Files:**
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/components/CategoryFilter.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/components/NewsCard.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/page.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/ai/page.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/intelligence/page.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/mdr/page.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/team/page.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/team/decisions/page.tsx`

- [ ] **Step 1: Apply the new public-page shell to `/` and `/ai`**

Refactor the public pages to feel closer to Apple News / system reading apps:

- calmer hero rhythm
- more precise spacing
- cleaner chips and filters
- less decorative atmosphere

- [ ] **Step 2: Move `NewsCard` and `CategoryFilter` onto the shared system classes**

Make cards and filters feel like system surfaces rather than custom one-off blocks.

- [ ] **Step 3: Refine `/intelligence` to feel like a professional Apple-style tool**

Keep the current command-center structure, but reduce cyber-dashboard styling in favor of:

- dark system materials
- cleaner panel contrast
- calmer accents
- stronger panel layering

- [ ] **Step 4: Refine `/mdr` and team pages into the same Apple family**

For `/mdr`:

- preserve operational density
- reduce visual noise
- keep clear state color meaning

For `/team`:

- preserve narrative polish
- make it feel like an executive workspace inside the same product family

- [ ] **Step 5: Run the full test suite**

Run:

```bash
npm test
```

Expected:

- PASS

- [ ] **Step 6: Commit the top-level page redesign**

```bash
git add app/page.tsx app/ai/page.tsx app/intelligence/page.tsx app/mdr/page.tsx app/team/page.tsx app/team/decisions/page.tsx components/NewsCard.tsx components/CategoryFilter.tsx
git commit -m "feat: restyle core routes in apple system mode"
```

## Task 4: Bring Key MDR Subpages Into The Same Apple System

**Files:**
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/mdr/dashboard/page.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/mdr/network/page.tsx`
- Modify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/mdr/splunk/page.tsx`

- [ ] **Step 1: Refactor the MDR dashboard page to use the new system materials**

Reduce large-screen dashboard theatrics and move to:

- tighter Apple-style operational surfaces
- cleaner headers
- calmer metric cards
- more disciplined separators

- [ ] **Step 2: Refactor the network and Splunk pages onto the same shell**

Preserve functionality and information density, but unify:

- panel surfaces
- form controls
- badges
- spacing and headings

- [ ] **Step 3: Run tests and production build**

Run:

```bash
npm test
npm run build
```

Expected:

- PASS
- successful Next.js production build

- [ ] **Step 4: Commit the MDR subpage redesign**

```bash
git add app/mdr/dashboard/page.tsx app/mdr/network/page.tsx app/mdr/splunk/page.tsx
git commit -m "feat: bring mdr subpages into apple system"
```

## Task 5: Visual Verification And Final Integration

**Files:**
- Verify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/globals.css`
- Verify: `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/components/NavBar.tsx`
- Verify:
  - `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/page.tsx`
  - `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/ai/page.tsx`
  - `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/intelligence/page.tsx`
  - `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/mdr/page.tsx`
  - `/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/apple-system-redesign/app/team/page.tsx`

- [ ] **Step 1: Start the dev server**

Run:

```bash
npm run dev
```

- [ ] **Step 2: Visually verify key routes**

Check:

- `/`
- `/ai`
- `/intelligence`
- `/mdr`
- `/mdr/dashboard`
- `/mdr/network`
- `/mdr/splunk`
- `/team`
- `/team/decisions`

Manual checklist:

- all routes feel like one Apple-style product family
- navigation chrome is consistent
- public pages are lighter than intelligence and MDR
- intelligence still reads as a command center
- MDR still reads as an operator workspace
- team still reads as a strategic narrative surface

- [ ] **Step 3: Make only the smallest visual corrections found during review**

Do not change content structure or add new product features.

- [ ] **Step 4: Re-run final verification**

Run:

```bash
npm test
npm run build
```

Expected:

- PASS
- successful production build

- [ ] **Step 5: Commit the verified redesign**

```bash
git add DESIGN.md app components tests docs/superpowers/plans/2026-04-15-apple-system-redesign.md
git commit -m "feat: unify site with apple system design"
```
