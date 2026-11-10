# Agent Note: Fix Export Contrast & Remove Redundant Column

- **Date:** 2026-11-10
- **Objective:** Fix dark theme contrast and light theme style hijacking in Board Export live preview and exported documents, and remove the redundant "Column" column from all export outputs (Excel, CSV, and table previews).

## Files Modified
- `src/app/globals.css`: Added CSS isolation rules under `[data-theme="light"] [data-export-theme="dark"]` to prevent global light-mode `!important` text and background overrides from breaking dark-themed export documents.
- `src/components/kanban/board-export-document.tsx`:
  - Added `data-export-theme` and `data-theme` attributes to the container.
  - Replaced all ambient `dark:` classes with explicit `isDark ? "..." : "..."` conditional styling.
  - Added explicit high-contrast colors to `h1`, `h3`, KPI statistics, and table cell contents.
  - Removed the redundant "Column" table header and table cell from the Table layout.
- `src/components/kanban/board-export-modal.tsx`: Removed `{ key: "columnName", label: "Column" }` from `EXPORT_ROW_PREVIEW_COLUMNS`.
- `src/lib/kanban/export-board.ts`:
  - Extracted pure `buildExcelWorksheet()` helper to build worksheets cleanly without redundant "Column" headers.
  - Removed "Column" from `generateCsvContent` header and row values.
  - Kept `columnName` on `ExportCardRow` for data backwards compatibility.
- `src/lib/kanban/export-board.test.ts`: Added unit tests verifying CSV and Excel omit the "Column" column.
- `src/components/kanban/board-export.test.ts`: Added unit tests verifying `EXPORT_ROW_PREVIEW_COLUMNS` and `BoardExportDocument` structure.

## Important Behavior Changes
- In dark theme export previews (both Board and Table layouts), headings, task titles, column headers, alternating rows, and KPI cards now render with high-contrast dark backgrounds and light text, regardless of whether the user is browsing the site in light or dark mode.
- In spreadsheet exports (Excel `.xlsx` and CSV `.csv`) and table previews, the redundant "Column" column is removed since task stage is already represented by "Status".

## Database / Schema Changes
- None.

## Verification Run & Results
- `npx vitest run src/lib/kanban/export-board.test.ts`: 4 passed (4).
- `npx vitest run src/components/kanban/board-export.test.ts`: 11 passed (11).
- `npx vitest run src/components/kanban/`: 18 files passed (144 tests).
- `npm run lint`: 0 errors, 0 warnings.
- `npx prisma validate`: Schema is valid.
- `npm run build`: Exit code 0, all 43 static/dynamic routes compiled successfully.

## Known Follow-ups / Blockers
- None.
