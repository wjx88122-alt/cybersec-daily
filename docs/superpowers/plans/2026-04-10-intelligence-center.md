# Intelligence Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new analyst-facing Intelligence Center under MDR with a knowledge-base style home page, supporting mock threat actors, vulnerabilities, IOCs, industry alerts, and reports.

**Architecture:** Keep the first version self-contained under `app/mdr/intelligence/page.tsx` and a dedicated `lib/intelligence-mock.ts` data module. Extend the MDR landing page with a new quick-entry button and protect the work with route/link/content regression tests.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Tailwind utility classes, Node built-in test runner

---

### Task 1: Add regression tests for the Intelligence Center

**Files:**
- Create: `tests/intelligence-center.test.mjs`
- Modify: none
- Test: `tests/intelligence-center.test.mjs`

- [x] **Step 1: Write the failing test**

```javascript
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = "/Users/kissbye/.config/superpowers/worktrees/cybersec-daily/intelligence-center";

test("Intelligence MDR route exists", () => {
  assert.equal(existsSync(join(root, "app/mdr/intelligence/page.tsx")), true);
});

test("Intelligence mock data file exists", () => {
  assert.equal(existsSync(join(root, "lib/intelligence-mock.ts")), true);
});

test("MDR landing page links to the Intelligence Center", () => {
  const page = readFileSync(join(root, "app/mdr/page.tsx"), "utf8");
  assert.equal(page.includes("/mdr/intelligence"), true);
});

test("Intelligence Center page exposes the main knowledge domains", () => {
  const page = readFileSync(join(root, "app/mdr/intelligence/page.tsx"), "utf8");
  assert.equal(page.includes("威胁组织库"), true);
  assert.equal(page.includes("漏洞专题"), true);
  assert.equal(page.includes("IOC 情报库"), true);
  assert.equal(page.includes("行业预警"), true);
  assert.equal(page.includes("报告与订阅"), true);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/intelligence-center.test.mjs`  
Expected: FAIL because the route and mock data file do not exist yet.

- [x] **Step 3: Leave the failing test in place**

No production code yet. Move directly to Task 2.

### Task 2: Add structured mock intelligence data

**Files:**
- Create: `lib/intelligence-mock.ts`
- Modify: none
- Test: `tests/intelligence-center.test.mjs`

- [x] **Step 1: Write minimal mock exports to satisfy the planned page**

```typescript
export const MOCK_INTEL_SUMMARY = { ... };
export const MOCK_INTEL_FEATURED_TOPICS = [ ... ];
export const MOCK_INTEL_ACTORS = [ ... ];
export const MOCK_INTEL_VULNERABILITIES = [ ... ];
export const MOCK_INTEL_IOCS = [ ... ];
export const MOCK_INTEL_INDUSTRY_ALERTS = [ ... ];
export const MOCK_INTEL_REPORTS = [ ... ];
```

- [x] **Step 2: Keep the module relationship-oriented**

Use shared ids and tags so the page can show related actors, vulnerabilities, IOCs, and reports without introducing a backend.

- [x] **Step 3: Run the targeted test again**

Run: `node --test tests/intelligence-center.test.mjs`  
Expected: still FAIL because the route and MDR entry link are not implemented yet.

### Task 3: Implement the Intelligence Center page and MDR entry point

**Files:**
- Create: `app/mdr/intelligence/page.tsx`
- Modify: `app/mdr/page.tsx`
- Test: `tests/intelligence-center.test.mjs`

- [x] **Step 1: Implement the new route**

Build a client page with:

- top summary metrics
- featured topics panel
- search and watchlist panel
- knowledge domain entry cards
- detail sections for threat actors, vulnerability topics, IOC intelligence, industry alerts, and reports

- [x] **Step 2: Reuse existing MDR visual language**

Use the existing `mdr-shell`, `glass`, badges, and compact metadata chips so the new page fits beside the current MDR tools.

- [x] **Step 3: Add the MDR landing-page quick link**

Update `app/mdr/page.tsx` to include a visible entry such as:

```tsx
<a href="/mdr/intelligence">🛰️ 情报中心</a>
```

- [x] **Step 4: Run the targeted test to verify it passes**

Run: `node --test tests/intelligence-center.test.mjs`  
Expected: PASS

- [x] **Step 5: Run the full test suite**

Run: `npm test`  
Expected: all tests pass

- [x] **Step 6: Run a production build**

Run: `npm run build`  
Expected: build succeeds without route or type errors
