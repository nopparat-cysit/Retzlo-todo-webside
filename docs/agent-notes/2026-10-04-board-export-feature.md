# Work Note: Kanban Board Export Feature (Excel, CSV, PDF, PNG)

**Date:** 2026-10-04  
**Objective:** Implement comprehensive board export capability allowing users to export Kanban tasks to Excel (.xlsx), CSV (.csv), PDF (.pdf), and PNG image (.png) from both Board view and Table (Spreadsheet) view.

---

## 1. Files Created, Modified, or Moved

### Created
- `src/lib/kanban/export-board.ts`: Core export utility library handling data preparation, CSV generation with UTF-8 BOM, Excel (.xlsx) workbook creation with auto-width columns, high-resolution PNG snapshotting via `html-to-image`, and PDF creation via `jspdf`.
- `src/lib/kanban/export-board.test.ts`: Vitest test suite testing row formatting, multi-assignees, custom priorities, story points, due dates, checklists, and RFC 4180 CSV escaping.
- `src/components/kanban/board-export-modal.tsx`: Interactive Export Modal (`BoardExportModal`) and Quick Export Dropdown button (`BoardExportButton`) with 4 distinct format cards and scope selection (All Tasks vs Currently Filtered).
- `src/components/kanban/board-export.test.ts`: Integration test suite verifying format contracts and button placements.
- `docs/agent-notes/2026-10-04-board-export-feature.md`: This work note.

### Modified
- `src/components/kanban/board.tsx`: Added `BoardExportButton` to the topbar control bar, wrapped the main views in `id="kanban-main-viewport"`, and passed `boardTitle` to `BoardListView`.
- `src/components/kanban/board-list-view.tsx`: Added `BoardExportButton` to the Table View toolbar and assigned `id="kanban-table-container"` to the scrollable table grid.
- `docs/system-guide.md`: Added Section 2.6 documenting the Export Board feature, formats, and scope options.
- `src/components/help/help-center-client.tsx`: Added `board-export` topic in the interactive in-app Knowledge Base (`/help`).
- `package.json`: Added `xlsx`, `html-to-image`, and `jspdf` dependencies.

---

## 2. Important Behavior Changes

1. **4 Universal Export Formats:**
   - **Excel (.xlsx):** Generates full Microsoft Excel workbooks with styled headers, custom column widths, statuses, assignees, priorities, due dates, checklists, and descriptions.
   - **CSV (.csv):** Generates standard RFC 4180 CSV prefixed with UTF-8 Byte Order Mark (`\uFEFF`) ensuring Thai text renders correctly without mojibake in Excel and Google Sheets.
   - **PDF (.pdf):** Captures the board/table layout into a standard formatted A4 document (landscape/portrait adaptive) with crisp vector proportions.
   - **PNG (.png):** Generates high-resolution 2x Retina PNG screenshots of the board or table view for embedding into presentations, chats, or documentation.
2. **Flexible Access & Scopes:**
   - One-click quick export directly from the `Export` dropdown button.
   - Modal view allows choosing between "All Tasks" or "Currently Filtered View".
   - Accessible in both Kanban Board view and Table (Spreadsheet) view.
3. **Immediate Visual Feedback:**
   - Smooth loading spinner during file generation.
   - Instant success toast notification upon download completion.

---

## 3. Database / Schema Changes

- None required (client-side export leveraging existing board and column structures).

---

## 4. Verification Commands & Results

- `npx vitest run src/lib/kanban/export-board.test.ts src/components/kanban/board-export.test.ts`: Passed (7/7 tests).
- `npx vitest run src/components/kanban/`: Passed (37/37 tests across 8 test files).
- `npx vitest run src/lib/kanban/`: Passed (111/111 tests across 17 test files).
- `npx vitest run src/components/ui/`: Passed (34/34 tests across 9 test files).
- `npx prisma validate`: Schema is valid.
- `npm run lint`: Passed with 0 errors / warnings.
- `npx tsc --noEmit`: Passed with 0 errors.
- `npm run build`: Compiled successfully; all 36 routes generated.

---

## 5. Follow-ups & Deployment Notes

- Dependencies installed and saved in `package.json` (`xlsx`, `html-to-image`, `jspdf`). Ready for production deployment.
