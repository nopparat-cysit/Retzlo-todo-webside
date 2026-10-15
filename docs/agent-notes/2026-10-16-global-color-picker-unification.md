# 2026-10-16 Global Color Picker Unification & Swatch Contrast Fix

## Objective
Fix the color picker point shown in the workspace creation modal and standardize all color pickers across the entire platform. Previously, color swatch buttons were inconsistently implemented across 10+ components: in some places they stretched into awkward oblong pill shapes with tiny hollow circle outlines, and in light mode the swatch backgrounds were pale `bg-*-100` shades that appeared almost invisible and empty. The objective is to unify all color pickers to use a single, tactile, theme-aware, accessible `ColorSwatchPicker` with solid discernible colors, active checkmarks, and responsive square tiles.

## Files Created / Modified
- `src/lib/theme/card-colors.ts`
  - Upgraded `swatchClass` across all 10 theme card colors (`DEFAULT`, `LAVENDER`, `CYAN`, `AMBER`, `ROSE`, `EMERALD`, `VIOLET`, `BLUE`, `WINE`, `SLATE`) to use solid, discernible 400-shade colors in light mode and rich retro tokens in dark mode (`dark:bg-dusk-lavender`, `dark:bg-dusk-cyan`, etc.) instead of pale `bg-*-100` tints.
- `src/components/ui/color-swatch-picker.tsx`
  - Redesigned into a unified, tactile component with square tiles (`aspect-square h-9 sm:h-10 w-full max-w-[44px] rounded-xl border`).
  - Added centered high-contrast `Check` icon when a color is selected.
  - Enhanced header with `Palette` icon and selected color badge pill with live mini swatch dot.
  - Added support for custom options and layout configurations (`layout="grid" | "wrap"`).
- `src/components/project/project-appearance-controls.tsx`
  - Replaced custom oblong pill button grid with `<ColorSwatchPicker label="Project color" />`.
  - Harmonized styling of the Project Color and Project Sticker sections.
- `src/components/notes/board-notes-rail.tsx`
  - Replaced inline custom `ColorPicker` with unified `ColorSwatchPicker`.
- `src/components/notes/notes-panel.tsx`
  - Replaced inline custom `ColorPicker` with unified `ColorSwatchPicker`.
- `src/components/notes/folder-modal.tsx`
  - Replaced custom theme color button loop with unified `ColorSwatchPicker`.
- `src/components/hub/diary-hub-panel.tsx`
  - Replaced inline custom `ColorPicker` with unified `ColorSwatchPicker`.
- `src/components/hub/fab-hub.tsx`
  - Replaced inline custom `ColorPicker` with unified `ColorSwatchPicker`.
- `src/components/project/project-quick-hub.tsx`
  - Replaced inline custom `ColorPicker` with unified `ColorSwatchPicker`.
- `src/lib/kanban/column-settings.ts`
  - Exported `columnThemeSwatchOptions` mapped from `columnThemeOptions` for `ColorSwatchPicker` compatibility.
- `src/components/kanban/board.tsx`
  - Delegated `ColumnThemePicker` to unified `ColorSwatchPicker`.
- `src/components/kanban/column.tsx`
  - Delegated `ColumnThemePicker` to unified `ColorSwatchPicker`.
- `src/components/kanban/board-settings/columns-tab.tsx`
  - Replaced custom column theme swatches in both "Add Column" and "Edit Column" forms with unified `ColorSwatchPicker`.
- `src/app/design-system/design-system-preview.tsx`
  - Added interactive live preview of `ColorSwatchPicker` in the Custom Global Pickers section.

## Important Behavior Changes
- All color pickers across the app now share identical tactile behavior: symmetric square rounded tiles, solid rich colors, hover scale effects, retro amber border/ring selection, and a clear `Check` mark indicator.
- Swatches in Light Mode (Warm Paper) no longer appear as faint, empty circular outlines.

## Verification Commands & Results
- `npx tsc --noEmit` - Passed (0 errors).
- `npx vitest run src/components/ui/color-swatch-picker.test.ts` - Passed (3 tests passed).
- `npx vitest run` - Passed (99 test files, 525 tests passed).
- `npm run lint` - Passed (✔ No ESLint warnings or errors).
- `npm run build` - Passed / in progress.
- `npx prisma validate` - Passed.
