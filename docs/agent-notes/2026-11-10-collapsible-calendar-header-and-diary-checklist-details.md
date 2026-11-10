# Work Note: Collapsible Calendar Header Tools & Diary Checklist Hide Details

- Date: 2026-11-10
- Objective: 1) Add collapsible header tools to the Project Calendar top bar matching the behavior and styling of the Board and Diary pages. 2) Implement "Hide Details" (Compact Mode) for Diary Checklist items across the Diary Studio and Pinned Diary widget so long URLs, descriptions, and tags can be collapsed into sleek single-line rows with optional per-item expansion.

## Files Modified
- `src/components/kanban/project-calendar.tsx`
- `src/components/diary/diary-list-panel.tsx`
- `src/components/diary/diary-checklist.tsx`
- `src/components/kanban/board-responsive.test.ts`
- `src/components/diary/diary-list-panel.test.ts`
- `docs/theme-system.md`

## Important Behavior Changes
- **Project Calendar Collapsible Header Tools**:
  - Added `isToolsCollapsed` state in `project-calendar.tsx` with persistence to `localStorage` under `retzlo_calendar_${projectId}_tools_collapsed`.
  - Default behavior: Collapsed (`true`) on screens < 768px (mobile) if no preference is stored; expanded (`false`) on desktop (>= 768px).
  - Row 1 features a toggle button matching Board/Diary styling (`SlidersHorizontal` + rotating `ChevronDown`), an Upcoming items chip, and a compact "Filtered" badge pill that appears when tools are collapsed and filters/search queries are active.
  - Rows 2 & 3 (search input, segmented view switcher, filters button, and quick filter chips) are contained in an animated CSS grid container (`grid-rows-[0fr]` to `grid-rows-[1fr]`).
- **Diary Checklist Hide Details (Compact Mode)**:
  - Added `isChecklistDetailsHidden` toggle with `localStorage` persistence (`retzlo_diary_hide_checklist_details`) across `diary-list-panel.tsx` and `diary-checklist.tsx`.
  - When details are hidden, lengthy descriptions (such as full Google Sheets or portal URLs) and multi-item tags (repeat interval, start date, due time) are hidden, compacting checklist cards into clean, space-efficient single-line rows.
  - In Diary Studio and Pinned Diary Preview, individual items can still be expanded on-demand via a subtle chevron toggle button next to the item label.

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run src/components/diary/`: Passed (6/6 tests passed).
- `npx vitest run src/components/kanban/ src/components/diary/ src/components/project/`: Passed (26 test files, 196 tests passed).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx prisma validate`: Passed (Prisma schema is valid).
- `cmd.exe /c "npm run build"`: Passed (43/43 routes generated successfully).

## Follow-ups / Blockers
- None.
