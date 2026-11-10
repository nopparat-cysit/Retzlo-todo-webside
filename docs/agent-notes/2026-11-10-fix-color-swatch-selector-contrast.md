# Agent Work Note: Color Swatch Selector Border Contrast Fix

- **Date:** 2026-11-10
- **Objective:** Fix the color swatch selector border contrast in Kanban attributes ("ขอบเลือกสีมันจม") so selected colors never blend into dark panel backgrounds or swatch colors.

## Files Created, Modified, Deleted, or Moved

- `src/components/kanban/board-attributes-tab.tsx`:
  - Upgraded Add Status and Edit Status color swatch buttons from `h-5 w-5` to `h-6 w-6`.
  - Replaced `ring-2 ring-indigo-500 ring-offset-1` with `ring-2 ring-dusk-amber dark:ring-amber-300 ring-offset-2 ring-offset-white dark:ring-offset-ink-950 scale-110 shadow-sm z-10 border-2 border-white/90 dark:border-white`.
  - Upgraded checkmark icon to `h-3 w-3 stroke-[3] drop-shadow-xs`.
- `src/components/kanban/card-attributes-edit-modal.tsx`:
  - Upgraded Status, Priority, and Story Point color swatch pickers with identical 3-layer amber contrast ring and 2px offset gap.
- `src/components/kanban/board-settings-attributes.test.ts`:
  - Added unit test asserting presence of `ring-dusk-amber`, `ring-offset-2`, `dark:ring-amber-300`, and `dark:ring-offset-ink-950` in both files.
- `docs/theme-system.md`:
  - Appended dated entry documenting the theme contrast and token alignment.

## Important Behavior Changes

- In Board Settings -> Card Attributes and Card Attributes Edit Modal, the currently selected color swatch now renders with:
  1. An inner 2px crisp white border (`border-2 border-white/90 dark:border-white`).
  2. A 2px background offset gap (`ring-offset-2 ring-offset-white dark:ring-offset-ink-950`).
  3. A radiant Retzlo amber highlight ring (`ring-2 ring-dusk-amber dark:ring-amber-300`).
- The ring never blends into dark panel backgrounds (`#12142d`) or indigo swatches, completely solving the "ขอบเลือกสีมันจม" issue.

## Database / Schema Changes

- None.

## Verification Commands Run & Results

- `npx vitest run src/components/kanban/board-settings-attributes.test.ts src/components/kanban/card-attributes-edit.test.ts` — 22/22 passed.
- `npm run lint` — Clean (0 errors, 0 warnings).
- `npx prisma validate` — Valid.
- `cmd.exe /c "npm run build"` — Succeeded (43/43 routes compiled).

## Known Follow-ups, Blockers, or Deployment Notes

- None.
