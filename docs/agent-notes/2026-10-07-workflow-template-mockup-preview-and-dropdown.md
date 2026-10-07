# Work Note: Workflow Template Kanban Mockup Preview and Dropdown Navigation

## Date & Objective
- **Date:** 2026-10-07
- **Objective:** Redesign the Workflow Template preview in Board Settings (`BoardAttributesTab`) into a realistic visual Kanban Board Mockup with core card functions, top/bottom subtle fade gradient masks, and smart dropdown navigation/filtering for overflow handling.

## Files Modified & Created
- `src/components/kanban/board-attributes-tab.tsx`:
  - Added `MockupSampleCard` interface and `getMockupSampleCards` generator tailored to column statuses (backlog/todo, in progress, review/testing, done, and custom).
  - Added `mockupColumnFilter` state and `displayedMockupStatuses` memoized filter.
  - Implemented visual Kanban Mockup container with top and bottom subtle fade masks (`bg-gradient-to-b` / `bg-gradient-to-t` overlays) for polished transitions.
  - Added realistic mockup task cards highlighting core functions: task code (`TSK-101`), priority badge (High/Medium/Low), realistic titles, checklist counters (`☑ 2/3`), due date badges with clock icons, and assignee avatars.
  - Added quick template dropdown selector (`<select>`) in the workflow templates header bar alongside circular expandable icon pills for fast selection.
  - Added column filter dropdown in the preview toolbar when columns > 3 to comfortably inspect specific columns or all columns.
  - Added quick scale dropdown selector in Story Points template header.
- `src/components/kanban/board-priorities-tab.tsx`:
  - Added quick priority template dropdown selector in the Priority Templates header bar.
- `docs/agent-notes/2026-10-07-workflow-template-mockup-preview-and-dropdown.md`: Created this session note.

## Important Behavior Changes
- Clicking or selecting any Workflow Template now displays a high-fidelity visual preview of how the actual Kanban board will appear with those columns and tasks, rather than just raw configuration text.
- Top and bottom gradient fade masks provide smooth clipping at the board preview viewport edges.
- Users can choose templates via either the interactive hover-expandable circular icon pills or the quick dropdown selector.
- When previewing templates with many columns (e.g. 6 columns in Software & IT), users can filter to a specific lane via dropdown or view all lanes side by side.
- Safety hooks (`handleConfirmApplyTemplate`, `isApplyTemplateConfirmOpen`, `ConfirmModal`, `useToast`) remain fully protected.

## Database & Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run src/components/kanban/board-settings-attributes.test.ts`: Passed (10/10 tests).
- `npx vitest run`: Passed (470/470 passed across 90 test suites, 3 skipped).
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm run build`: Passed (Prisma client generated, 38/38 routes compiled successfully).
- `npx prisma validate`: Passed (Schema is valid).

## Known Follow-ups & Blockers
- None.
