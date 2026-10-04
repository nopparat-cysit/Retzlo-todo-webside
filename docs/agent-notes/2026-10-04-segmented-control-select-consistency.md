# Work Note: 2026-10-04 — Segmented Control & Select Active State Consistency

## Objective
Unify the visual presentation of "Selected / Active" states across all segmented controls, view switchers, tabs, and toggle button groups in the project ("select จะเป็นยังไง ทำให้ uxui เหมือนกันทั้งโปรเจค"). Eliminate visual inconsistency where `Compact 2x` displayed a tinted lavender pill while `Normal`, `Board`, and `Table` displayed a neutral dark pill. Establish the **Clean Neutral Pill** (Apple / Linear / Notion standard) across the entire application.

## Files Created, Modified, Deleted, or Moved
- **Modified:**
  - `src/components/kanban/board.tsx`: Standardized `density === "compact"` active state to match `Normal`, `Board`, and `Table` using Clean Neutral Pill (`bg-white dark:bg-stone-800 border-stone-200/80 dark:border-white/10 shadow-xs`).
  - `src/components/ui/segmented-control.tsx`: Updated shared primitive `SegmentedControl` selected state from solid lavender fill to Clean Neutral Pill.
  - `src/components/ui/tabs.tsx`: Standardized `TabsTrigger` active state in dark mode to `dark:bg-stone-800 dark:border-white/10`.
  - `src/components/help/help-center-client.tsx`: Updated `viewMode` switcher (`Docs` vs `Overview`) to Clean Neutral Pill.
  - `src/components/project/project-members-view.tsx`: Updated role filter tabs (`All` vs `Owners` vs `Members`) to Clean Neutral Pill.
  - `src/components/theme/theme-toggle.tsx`: Updated `variant="dropdown"` and `variant="settings"` segmented controls to Clean Neutral Pill with brand accent icons.
  - `docs/theme-system.md`: Updated theme documentation and changelog.

## Important Behavior Changes
1. **Visual Harmony & Zero Confusion:** In the board toolbar, switching between `Board / Table` and `Normal / Compact 2x` now presents an identical, consistent active pill across both controls.
2. **Clean Neutral Pill Standard:**
   - **Track / Container:** `rounded-xl border border-stone-200/90 bg-stone-100/80 p-0.5 shadow-2xs dark:border-white/10 dark:bg-white/[0.04]`
   - **Active Item:** `border border-stone-200/80 bg-white text-stone-900 shadow-xs font-semibold dark:border-white/10 dark:bg-stone-800 dark:text-stone-100`
   - **Inactive Item:** `text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200`
   - **Icon Accent:** Semantic or brand colored icon remains highlighted when active (`text-indigo-600 dark:text-dusk-lavender`), providing subtle brand recognition without visual clutter.
3. **Cross-Project Consistency:** Standardized across Kanban toolbar, Help Documentation hub, Project Members view, Theme switchers, and shared UI primitives.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run --exclude src/lib/ai/engine.test.ts`: Passed (86/86 test files, 433/433 tests).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npx prisma validate`: Passed (schema valid).
- `npm run build`: Passed (Next.js production build succeeded).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
