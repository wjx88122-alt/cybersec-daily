# Intelligence Command Center Takeover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `cybersec-daily`'s current `/intelligence` route with the new Threat Intelligence Command Center and remove the old intelligence-page contract.

**Architecture:** Keep `app/intelligence/page.tsx` as the route entry, but rebuild it as a thin Next.js composition layer over route-local data and React components. Port the validated standalone command-center structure into `app/intelligence/components/`, add the required layout classes to `app/globals.css`, and retire the old intelligence route tests and API-backed assumptions that no longer belong to the new page.

**Tech Stack:** Next.js App Router, React 19, TypeScript, global CSS, Node built-in test runner (`node --test`)

---

## File Map

- Modify: `/Users/kissbye/Projects/cybersec-daily/tests/intelligence-center.test.mjs`
  - Rewrite the route contract around the new command-center homepage structure.
- Delete: `/Users/kissbye/Projects/cybersec-daily/tests/intelligence-live-sources.test.mjs`
  - Remove expectations tied to the retired live-source route model.
- Delete: `/Users/kissbye/Projects/cybersec-daily/tests/intelligence-mapping-layer.test.mjs`
  - Remove expectations tied to the retired mapping-layer route model.
- Delete: `/Users/kissbye/Projects/cybersec-daily/tests/intelligence-ops-layer.test.mjs`
  - Remove expectations tied to the retired ops-layer route model.
- Create: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/data.ts`
  - Route-local command-center data ported from the standalone project.
- Create: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/components/Topbar.tsx`
  - Internal intelligence command-center header and filter/navigation strip.
- Create: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/components/ExecutiveBrief.tsx`
  - Hero, decision rail, KPI strip, and “Why this matters” section.
- Create: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/components/WhatChanged.tsx`
  - Lead campaign card plus supporting campaign cards.
- Create: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/components/ExposurePriorities.tsx`
  - Priority exposure rows.
- Create: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/components/AnalystDrilldown.tsx`
  - Graph, hunts, and playbooks section.
- Modify: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/page.tsx`
  - Replace the old portal page with the new component-composed route.
- Modify: `/Users/kissbye/Projects/cybersec-daily/app/globals.css`
  - Add the command-center wrapper and imported structural class styles.
- Delete if unused after route replacement:
  - `/Users/kissbye/Projects/cybersec-daily/lib/intelligence-mock.ts`
  - `/Users/kissbye/Projects/cybersec-daily/lib/intelligence-sources.ts`
  - `/Users/kissbye/Projects/cybersec-daily/lib/intelligence-mapping-sources.ts`
  - `/Users/kissbye/Projects/cybersec-daily/lib/intelligence-ops.ts`
  - `/Users/kissbye/Projects/cybersec-daily/app/api/intelligence/route.ts`
  - `/Users/kissbye/Projects/cybersec-daily/app/api/intelligence/export/route.ts`
  - `/Users/kissbye/Projects/cybersec-daily/app/api/intelligence/export-rule/route.ts`
  - `/Users/kissbye/Projects/cybersec-daily/app/api/intelligence/lists/route.ts`
  - `/Users/kissbye/Projects/cybersec-daily/app/api/intelligence/subscriptions/route.ts`

## Task 1: Rewrite The Intelligence Route Contract First

**Files:**
- Modify: `/Users/kissbye/Projects/cybersec-daily/tests/intelligence-center.test.mjs`
- Delete: `/Users/kissbye/Projects/cybersec-daily/tests/intelligence-live-sources.test.mjs`
- Delete: `/Users/kissbye/Projects/cybersec-daily/tests/intelligence-mapping-layer.test.mjs`
- Delete: `/Users/kissbye/Projects/cybersec-daily/tests/intelligence-ops-layer.test.mjs`

- [ ] **Step 1: Replace the old intelligence-center assertions with the new homepage contract**

Update `tests/intelligence-center.test.mjs` so it asserts the new `/intelligence` page includes:

```js
[
  "homepage-shell",
  "executive-brief",
  "brief-hero",
  "decision-rail",
  "posture-snapshot",
  "what-changed",
  "exposure-priorities",
  "analyst-drilldown",
]
```

Also assert the page contains:

```js
[
  "组织威胁态势",
  "今日需要决策",
  "重点攻击活动",
  "资产暴露与漏洞优先级",
  "实体关联图谱",
  "狩猎与研判工作台",
  "自动化响应剧本",
]
```

And assert that old-route anchors are gone:

```js
[
  "威胁组织库",
  "漏洞专题",
  "IOC 情报库",
  "行业预警",
  "报告与订阅",
]
```

- [ ] **Step 2: Remove tests that enforce the retired intelligence route model**

Delete:

- `tests/intelligence-live-sources.test.mjs`
- `tests/intelligence-mapping-layer.test.mjs`
- `tests/intelligence-ops-layer.test.mjs`

- [ ] **Step 3: Run the full test suite and verify the new contract fails for the right reason**

Run:

```bash
npm test
```

Expected:

- `tests/intelligence-center.test.mjs` fails because `app/intelligence/page.tsx` still renders the old portal content.
- No failures should depend on the deleted live-source, mapping, or ops tests anymore.

- [ ] **Step 4: Commit the red test contract**

```bash
git add tests/intelligence-center.test.mjs tests/intelligence-live-sources.test.mjs tests/intelligence-mapping-layer.test.mjs tests/intelligence-ops-layer.test.mjs
git commit -m "test: replace intelligence route contract"
```

## Task 2: Port Standalone Command-Center Data And Components

**Files:**
- Create: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/data.ts`
- Create: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/components/Topbar.tsx`
- Create: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/components/ExecutiveBrief.tsx`
- Create: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/components/WhatChanged.tsx`
- Create: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/components/ExposurePriorities.tsx`
- Create: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/components/AnalystDrilldown.tsx`

- [ ] **Step 1: Create the failing import surface in the route**

Update `app/intelligence/page.tsx` imports to reference the new route-local modules before those modules exist.

Expected imports:

```ts
import { intelligenceCommandCenterData } from "@/app/intelligence/data";
import Topbar from "@/app/intelligence/components/Topbar";
import ExecutiveBrief from "@/app/intelligence/components/ExecutiveBrief";
import WhatChanged from "@/app/intelligence/components/WhatChanged";
import ExposurePriorities from "@/app/intelligence/components/ExposurePriorities";
import AnalystDrilldown from "@/app/intelligence/components/AnalystDrilldown";
```

- [ ] **Step 2: Run the suite and verify module-resolution failure**

Run:

```bash
npm test
```

Expected:

- FAIL because the new route-local modules do not exist yet.

- [ ] **Step 3: Create `app/intelligence/data.ts` with the standalone homepage data**

Port the approved standalone content into a typed object that includes:

- `topbar`
- `hero`
- `kpis`
- `campaigns`
- `exposures`
- `graph`
- `hunts`
- `playbooks`

Keep the standalone semantics, but write them in TypeScript-native route-local data form.

- [ ] **Step 4: Create the new React section components**

Implement the minimal route-local React components that render the new structure:

- `Topbar`
- `ExecutiveBrief`
- `WhatChanged`
- `ExposurePriorities`
- `AnalystDrilldown`

Keep the output aligned with the tested structural class names and section phrases.

- [ ] **Step 5: Run the suite and verify it still fails only on the old page implementation**

Run:

```bash
npm test
```

Expected:

- imports resolve
- failures now point to the page still rendering the old content or missing the new structure

- [ ] **Step 6: Commit the route-local data and component scaffold**

```bash
git add app/intelligence/data.ts app/intelligence/components app/intelligence/page.tsx
git commit -m "feat: add intelligence command center components"
```

## Task 3: Replace The `/intelligence` Page With The New Command Center

**Files:**
- Modify: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/page.tsx`
- Reference: `/Users/kissbye/Projects/cybersec-daily/app/intelligence/data.ts`
- Reference: `/Users/kissbye/Documents/Playground/src/render.js`

- [ ] **Step 1: Remove the old portal-style page implementation**

Delete the old `useState`, `useEffect`, `useMemo`, search scopes, live fetches, watchlist logic, and route-specific operational UI from `app/intelligence/page.tsx`.

- [ ] **Step 2: Compose the page around the new sections**

Render the route as:

```tsx
<div className="min-h-screen intelligence-command-center">
  <NavBar active="情报中心" />
  <div className="homepage-shell">
    <Topbar topbar={intelligenceCommandCenterData.topbar} />
    <main className="dashboard">
      <ExecutiveBrief
        hero={intelligenceCommandCenterData.hero}
        kpis={intelligenceCommandCenterData.kpis}
      />
      <WhatChanged campaigns={intelligenceCommandCenterData.campaigns} />
      <ExposurePriorities exposures={intelligenceCommandCenterData.exposures} />
      <AnalystDrilldown
        graph={intelligenceCommandCenterData.graph}
        hunts={intelligenceCommandCenterData.hunts}
        playbooks={intelligenceCommandCenterData.playbooks}
        exposures={intelligenceCommandCenterData.exposures}
      />
    </main>
  </div>
</div>
```

- [ ] **Step 3: Run the suite and verify the new route contract now passes**

Run:

```bash
npm test
```

Expected:

- `tests/intelligence-center.test.mjs` passes
- no old-route content assertions remain

- [ ] **Step 4: Commit the route takeover**

```bash
git add app/intelligence/page.tsx
git commit -m "feat: replace intelligence route with command center"
```

## Task 4: Port And Scope The New Visual System

**Files:**
- Modify: `/Users/kissbye/Projects/cybersec-daily/app/globals.css`
- Reference: `/Users/kissbye/Documents/Playground/src/styles.css`

- [ ] **Step 1: Write the failing style class expectations into the rendered route**

Ensure the route markup uses the structural class names from the standalone project before styles are added.

- [ ] **Step 2: Add a page-scoped wrapper to prevent style bleed**

Use a wrapper such as:

```css
.intelligence-command-center { ... }
.intelligence-command-center .homepage-shell { ... }
```

for all imported command-center layout rules.

- [ ] **Step 3: Port the new command-center layout classes into `app/globals.css`**

Port the standalone structural styles needed for:

- `homepage-shell`
- `topbar`
- `executive-brief`
- `brief-hero`
- `decision-rail`
- `posture-snapshot`
- `why-this-matters`
- `what-changed`
- `exposure-priorities`
- `analyst-drilldown`

Retain the standalone visual hierarchy, but adapt to the host app shell.

- [ ] **Step 4: Run the suite to verify no structural regressions**

Run:

```bash
npm test
```

Expected:

- PASS

- [ ] **Step 5: Commit the page styling migration**

```bash
git add app/globals.css
git commit -m "feat: port intelligence command center styling"
```

## Task 5: Remove Retired Intelligence Modules And Verify End-To-End

**Files:**
- Delete if unused:
  - `/Users/kissbye/Projects/cybersec-daily/lib/intelligence-mock.ts`
  - `/Users/kissbye/Projects/cybersec-daily/lib/intelligence-sources.ts`
  - `/Users/kissbye/Projects/cybersec-daily/lib/intelligence-mapping-sources.ts`
  - `/Users/kissbye/Projects/cybersec-daily/lib/intelligence-ops.ts`
  - `/Users/kissbye/Projects/cybersec-daily/app/api/intelligence/route.ts`
  - `/Users/kissbye/Projects/cybersec-daily/app/api/intelligence/export/route.ts`
  - `/Users/kissbye/Projects/cybersec-daily/app/api/intelligence/export-rule/route.ts`
  - `/Users/kissbye/Projects/cybersec-daily/app/api/intelligence/lists/route.ts`
  - `/Users/kissbye/Projects/cybersec-daily/app/api/intelligence/subscriptions/route.ts`
- Verify:
  - `/Users/kissbye/Projects/cybersec-daily/app/intelligence/page.tsx`
  - `/Users/kissbye/Projects/cybersec-daily/app/globals.css`
  - `/Users/kissbye/Projects/cybersec-daily/tests/intelligence-center.test.mjs`

- [ ] **Step 1: Find any remaining imports or route references to retired intelligence helpers**

Run:

```bash
rg -n "intelligence-mock|intelligence-sources|intelligence-mapping-sources|intelligence-ops|/api/intelligence" app components lib tests
```

- [ ] **Step 2: Remove the retired modules and routes if they are no longer referenced**

Delete only the files proven unused by the previous search.

- [ ] **Step 3: Run the full verification suite**

Run:

```bash
npm test
npm run build
```

Expected:

- PASS
- the Next.js production build succeeds

- [ ] **Step 4: Run the local dev server and visually verify `/intelligence`**

Run:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3000/intelligence
```

Manual checklist:

- route shows the new command-center layout
- `NavBar` still highlights `情报中心`
- old portal sections are gone
- new first-screen hierarchy reads correctly
- lower drilldown area is present but visually demoted

- [ ] **Step 5: Commit the cleanup and verified route migration**

```bash
git add app lib tests docs/superpowers/plans/2026-04-14-intelligence-command-center-takeover.md
git commit -m "feat: take over intelligence route with command center"
```
