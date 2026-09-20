# Work Note: Reorganize Diary List Header Layout and Controls

**Date:** 2026-09-20  
**Objective:** Reorganize the Diary page header (`Today rhythm`) layout to resolve visual clutter, uncoordinated vertical heights, and awkward interleaving of action buttons and metric statistics.

## 1. Issues & Friction in Previous Layout

1. **Illogical Interleaving of Buttons & Stats:**  
   In `src/components/diary/diary-list-panel.tsx`, `View in Calendar` (button) was placed inside the same row as `Due today`, `Done`, and `Starred` metrics, while `Add diary` (button) was placed after the metrics. Action buttons and stat boxes were awkwardly interleaved.
2. **Mismatched Box Dimensions & Heights:**  
   The `DiaryMetric` components were rendered as bulky vertical boxes (`min-w-24`, label stacked above number) with differing paddings, conflicting with the `h-12` action buttons and notebook sticker.
3. **Information Hierarchy:**  
   Separating metrics into an independent control pill row and grouping action buttons (`View in Calendar` + `Add diary`) creates immediate clarity and matches the Kanban board's refined header layout.

## 2. Changes Made

- **`src/components/diary/diary-list-panel.tsx`:**
  - Redesigned `DiaryMetric` into sleek, horizontal control pills (`h-9`, dot indicator + uppercase label on left, bold monospace number on right).
  - Grouped metrics together in a clean row: `Due today` (lavender), `Done` (cyan), and `Starred` (amber).
  - Grouped action buttons together: `View in Calendar` and `Add diary` aligned cleanly on a dedicated sub-row.
  - Upgraded header panel border and padding to `rounded-2xl p-4 sm:p-5` with modern date pill badge.
  - Aligned notebook sticker neatly on the right without pushing buttons into a wrap.

## 3. Verification Results

- `npm test`: 61 test files passed, 279 tests passed (100%).
- `npm run lint`: 0 warnings, 0 errors.
- `npx prisma validate`: Schema valid.
- `npm run build`: Production build verified successfully for all 35 routes.
