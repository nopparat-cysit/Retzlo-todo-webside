# 2026-09-27: Fix Card Modal High Priority Contrast and Styling

## Objective
Fix the color and low-contrast washed-out styling of the "HIGH" priority button (and harmonize Priority buttons with Status buttons) in `CardModal`.

## Files Created / Modified
- `src/components/kanban/card-modal.tsx` [MODIFIED]:
  - Added typed `priorityMeta` configuration defining high-contrast light and dark mode styles for `LOW`, `MEDIUM`, and `HIGH`.
  - Replaced low-contrast `border-red-400 bg-red-400/20 text-red-200` with high-contrast, bold styling:
    - Selected `HIGH`: `border-red-600 bg-red-600 text-white font-semibold shadow-xs dark:border-red-500 dark:bg-red-600 dark:text-white`
    - Selected `MEDIUM`: `border-amber-600 bg-amber-600 text-white font-semibold shadow-xs dark:border-dusk-amber dark:bg-dusk-amber dark:text-ink-950`
    - Selected `LOW`: `border-indigo-600 bg-indigo-600 text-white font-semibold shadow-xs dark:border-dusk-lavender dark:bg-dusk-lavender dark:text-ink-950`
    - Unselected: `border-stone-200 bg-stone-50 text-stone-700 hover:border-... dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400 dark:hover:text-stone-200`
  - Applied the unified styling to both desktop and mobile modal layouts.

## Important Behavior Changes
- The "HIGH" priority button now displays a rich solid red background with crisp, readable white text when selected, matching the visual polish and contrast of the adjacent Status button (e.g., `Doing`).
- Unselected priority buttons cleanly match unselected status buttons across both light and dark themes.

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run`: Passed (67 test files, 326 tests passed).
- `npm run lint`: Passed (0 warnings, 0 errors).
- `npm run build`: Passed (Next.js production build succeeded).
- `npx prisma validate`: Passed (schema valid).

## Known Follow-ups / Blockers
- None.
