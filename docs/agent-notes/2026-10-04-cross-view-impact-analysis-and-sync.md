# Work Note: Cross-View Impact Analysis, Priority Unification, and System Guide Synchronization

- **Date:** 2026-10-04
- **Objective:** Analyze system-wide impacts from recent features (Table view, row hover checkbox, custom priorities, card density switcher, board export, time/date pickers), resolve cross-view inconsistencies, and synchronize all user-facing guides and theme documentation.

## Impacts Analyzed & Addressed
1. **Cross-View Priority Handling (Calendar & AI Chat):**
   - **Problem:** `src/components/kanban/project-calendar.tsx` and `src/components/ai/ai-chat-widget.tsx` had hardcoded checks for `"HIGH"`, `"MEDIUM"`, and `"LOW"`. Any custom priorities (P0, P1, P2, Urgent, Blocker, or user-defined labels) failed to sort correctly (received 0 score) and lacked proper badge styling in the Calendar detail panel.
   - **Fix:** Switched to unified `getPriorityMeta` across `project-calendar.tsx` for sorting (using `getPriorityRank(item)`) and badge display (`meta.pillClass` and `meta.label`), and `ai-chat-widget.tsx` proposal card priority labels.
2. **Board Export Viewport Coordination:**
   - **Problem:** In `src/components/kanban/board.tsx`, the top header `BoardExportButton` defaulted to `"kanban-main-viewport"`. When in Table View mode (`viewMode === "list"`), exporting PDF/PNG from the top header could mismatch the viewport.
   - **Fix:** Dynamically pass `viewportElementId={viewMode === "list" ? "kanban-table-container" : "kanban-main-viewport"}` so snapshot exports always capture the active view.
3. **In-App Knowledge Base & System Documentation Synchronization:**
   - **Problem:** Recent features (Card density Normal vs Compact 2x, Row index `#` hover-to-checkbox swap, standardized `DD/MM/YYYY` date format, and avatar display) were not yet reflected in `src/components/help/help-center-client.tsx`, `docs/system-guide.md`, and `docs/theme-system.md`.
   - **Fix:** Fully updated `help-center-client.tsx`, `docs/system-guide.md`, and appended 2026-10-04 theme audit logs in `docs/theme-system.md`.

## Files Modified
- `src/components/kanban/project-calendar.tsx`
- `src/components/kanban/calendar-modals.test.ts`
- `src/components/ai/ai-chat-widget.tsx`
- `src/components/kanban/board.tsx`
- `src/components/help/help-center-client.tsx`
- `src/components/help/help-center.test.ts`
- `docs/system-guide.md`
- `docs/theme-system.md`

## Verification Commands & Results
- `npx vitest run src/components/help/help-center.test.ts src/components/kanban/calendar-modals.test.ts`: Passed (7 tests).
- `npx vitest run src/components/kanban/ src/components/ai/ src/components/help/`: Passed (52 tests).
- `npx tsc --noEmit`: Passed with 0 errors.
- `npm run lint`: Passed with 0 warnings/errors.
- `npx prisma validate`: Schema valid.
- `npm run build`: Passed (36/36 static pages generated successfully).
