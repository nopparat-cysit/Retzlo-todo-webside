# Work Note: Dedicated Board Export Document Layout

**Date:** 2026-10-04  
**Objective:** Redesign and rebuild the board export functionality into a dedicated, unclipped executive document renderer (`BoardExportDocument`) rather than capturing the constrained live viewport with interactive clutter, fixing incomplete exports and poor formatting.

## Problem Addressed
Previously, `exportElementToPng` and `exportElementToPdf` used `html-to-image` on the live DOM viewport (`kanban-main-viewport` / `kanban-table-container`):
1. **Viewport & Column Clipping:** Columns outside the immediate horizontal scroll boundary and cards below vertical scroll limits were truncated and omitted from exported PNG and PDF files.
2. **Interactive UI Clutter:** Exports contained live controls such as "+ Add card" buttons, three-dot menus, scrollbar tracks, and drag handles.
3. **Lack of Executive Document Structure:** Missing document branding, board title, export timestamp, scope metadata, and executive KPI summary statistics.

## Files Created & Modified
- **Created:**
  - `src/components/kanban/board-export-document.tsx`: Dedicated unclipped export document component rendering Executive Document Header, KPI metrics bar (Total, To Do, In Progress, Waiting, Done, Overdue, Points, Completion Rate %), unclipped Panoramic Kanban layout, and Executive Summary Table layout.
- **Modified:**
  - `src/components/kanban/board-export-modal.tsx`: Integrated `BoardExportDocument` into an off-screen container (`#retzlo-export-render-canvas` and `#retzlo-export-render-canvas-quick`), added Layout Switcher (Full Kanban vs Executive Table), added Theme Switcher (Clean Light Paper vs Dark Slate), and added collapsible live preview.
  - `src/lib/kanban/export-board.ts`: Enhanced `exportElementToPng` with custom background and 2.2x pixel ratio; enhanced `exportElementToPdf` with automatic landscape/portrait aspect ratio fitting and multi-page pagination slicing for tall documents.
  - `src/components/kanban/board-export.test.ts`: Added unit tests verifying `BoardExportDocument`, KPI calculations, unclipped export containers, and layout/theme options.
  - `docs/theme-system.md`: Appended dated change log entry documenting theme and token coverage for the dedicated export layout.
  - `docs/system-guide.md`: Updated Section 2.6 with details on the dedicated export document renderer and formatting options.
  - `src/components/help/help-center-client.tsx`: Updated in-app Knowledge Base guide for board export.

## Important Behavior Changes
- Exports are no longer screenshots of the cramped live browser viewport. They render from a clean, purpose-built document canvas that guarantees 100% of columns and cards are rendered with zero scroll clipping.
- Users can choose between **Full Panoramic Kanban (บอร์ดเต็มแผ่นครบทุกคอลัมน์)** and **Executive Summary Table (ตารางรายงานผู้บริหาร)**.
- Users can choose between **Clean Light Paper (กระดาษขาว)** (ideal for printing and PDF slides) and **Dark Slate (ดาร์กโหมดพรีเมียม)**.
- Tall boards or long tables automatically paginate across multiple clean A4 pages in PDF without squashing text.
- Live interactive buttons (+ Add card, drag handles, menus) are completely excluded from exported output.

## Database & Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run src/components/kanban/board-export.test.ts src/lib/kanban/export-board.test.ts`: Passed (9/9 tests).
- `npx vitest run src/components/help/help-center.test.ts`: Passed (5/5 tests).
- `npm run lint`: Passed (0 ESLint warnings or errors).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run build`: Passed (Compiled successfully, all 38 routes static/dynamic generated).

## Follow-ups & Deployment Notes
- Ready for immediate production deployment.
