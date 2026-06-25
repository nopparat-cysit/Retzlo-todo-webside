# Calendar Reward-Style Sticker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the project Calendar presentation with the approved Reward-style hierarchy and restrained RetroD sticker accents without changing calendar data behavior.

**Architecture:** Keep `ProjectCalendar` as the interaction owner and move summary calculation into the existing pure calendar view module. Reuse current sticker PNG assets through `next/image`; keep all styling feature-scoped so shared panels and other pages remain unchanged.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest, Lucide React, Next Image.

---

## File Structure

- Modify `src/lib/calendar/view.ts`: expose pure calendar summary calculation.
- Modify `src/lib/calendar/view.test.ts`: cover month range, completion, and unique focus-day metrics.
- Modify `src/components/kanban/project-calendar.tsx`: implement hero, toolbar hierarchy, calendar cells, Upcoming rail, stickers, and empty state.
- Modify `src/components/kanban/project-calendar.test.ts`: guard the visual structure and filter stacking layer.
- Update `docs/agent-notes/2026-06-23-calendar-filter-layer.md`: record UI work and verification.

### Task 1: Calendar Summary Metrics

**Files:**
- Modify: `src/lib/calendar/view.ts`
- Test: `src/lib/calendar/view.test.ts`

- [ ] **Step 1: Write the failing summary test**

Add a test that calls:

```ts
getCalendarSummary(items, [
  { key: "2026-05-19" },
  { key: "2026-05-20" },
  { key: "2026-05-21" }
])
```

and expects `{ total: 4, focusDays: 3, completed: 1 }`.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `npm test -- src/lib/calendar/view.test.ts`

Expected: FAIL because `getCalendarSummary` is not exported.

- [ ] **Step 3: Implement the pure summary helper**

```ts
export function getCalendarSummary(
  items: UnifiedCalendarItem[],
  days: Array<{ key: string }>
) {
  const visibleKeys = new Set(days.map((day) => day.key));
  const visibleItems = items.filter((item) => visibleKeys.has(toDateKey(item.dueDate)));

  return {
    total: visibleItems.length,
    focusDays: new Set(visibleItems.map((item) => toDateKey(item.dueDate))).size,
    completed: visibleItems.filter((item) => item.type === "card" && item.status === "DONE").length
  };
}
```

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run: `npm test -- src/lib/calendar/view.test.ts`

Expected: all calendar view tests pass.

### Task 2: Reward-Style Calendar Structure

**Files:**
- Modify: `src/components/kanban/project-calendar.tsx`
- Test: `src/components/kanban/project-calendar.test.ts`

- [ ] **Step 1: Extend the source contract test and confirm RED**

Assert the Calendar source includes these stable feature markers:

```ts
expect(source).toContain('data-calendar-hero="reward-style"');
expect(source).toContain('data-calendar-upcoming="sticker-rail"');
expect(source).toContain("retro-sticker-08-ring-planet.png");
expect(source).toContain("retro-sticker-04-calendar.png");
```

Run: `npm test -- src/components/kanban/project-calendar.test.ts`

Expected: FAIL because the approved visual structure is not implemented.

- [ ] **Step 2: Add the hero and summary metrics**

Import `Image`, `Sparkles`, and `getCalendarSummary`. Derive `summary` with `useMemo` from filtered items and visible calendar days. Render a compact `Panel` marked `data-calendar-hero="reward-style"` with title, range copy, three `CalendarMetric` items, and the ring-planet sticker.

- [ ] **Step 3: Separate toolbar and content hierarchy**

Move navigation controls into an unframed toolbar between hero and grid. Preserve `data-calendar-toolbar="floating-layer"` and `!z-20` so the filter dropdown remains above day cells. Keep current previous, Today, next, date, view, custom-days, and filter behavior unchanged.

- [ ] **Step 4: Polish the month grid**

Use stable day-cell dimensions, stronger Today treatment, compact source-aware event rows, and a small decorative coffee sticker only on the Today cell. Keep the three-items-per-day limit and `+N more` behavior.

- [ ] **Step 5: Rebuild Upcoming as a sticker rail**

Mark the rail `data-calendar-upcoming="sticker-rail"`, add the calendar sticker to its heading, keep the existing item click behavior, and add a paper-note decorative message below the list. Use a sticker empty state when no items match.

- [ ] **Step 6: Run component test and confirm GREEN**

Run: `npm test -- src/components/kanban/project-calendar.test.ts`

Expected: both stacking and Reward-style structure tests pass.

### Task 3: Responsive And Accessibility Review

**Files:**
- Modify: `src/components/kanban/project-calendar.tsx`

- [ ] **Step 1: Verify responsive constraints in code**

Ensure hero metrics wrap, toolbar controls wrap without overlap, the content uses `xl:grid-cols-[minmax(0,1fr)_19rem]`, Upcoming moves below the calendar before `xl`, and the month grid keeps horizontal overflow for narrow screens.

- [ ] **Step 2: Verify decorative image semantics and motion**

Use `alt=""` and `aria-hidden="true"` for decorative stickers. Reuse existing `motion-panel-in` and transition utilities only; do not add shared animation tokens.

- [ ] **Step 3: Run focused tests together**

Run: `npm test -- src/lib/calendar/view.test.ts src/components/kanban/project-calendar.test.ts`

Expected: all focused tests pass.

### Task 4: Verification And Notes

**Files:**
- Modify: `docs/agent-notes/2026-06-23-calendar-filter-layer.md`

- [ ] **Step 1: Run required verification**

Run:

```bash
npm run lint
npx prisma validate
npm run build
```

Record pass, failure, timeout, or environmental blocker exactly as observed.

- [ ] **Step 2: Verify generated-file hygiene**

Run: `git status --short --branch`

Expected: no `.next`, logs, cache, or other generated files are staged or newly tracked.

- [ ] **Step 3: Update the agent note**

Document files changed, visual behavior, the scoped design-system impact, commands run, and any stale dev-server blocker. Do not include environment values or secrets.

