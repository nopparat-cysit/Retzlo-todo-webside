# Work Note: Card Attributes Edit Modal and '+' Buttons for Status, Priority, and Story Points

- **Date:** 2026-10-04
- **Objective:** Add reactive '+' icon buttons at the end of the Status, Priority, and Story Points (คะแนนความยาก) headers in `CardModal`, and implement a dedicated edit modal (`CardAttributesEditModal`) with 3 tabs allowing users to add, edit, reorder, delete, and reset options with instant updates, `ConfirmModal` safety dialogs, and Toast alerts.

## Files Created, Modified, or Deleted

- **Created:**
  - `src/components/kanban/card-attributes-edit-modal.tsx`: Dedicated modal for managing Statuses, Priorities, and Story Points with 3 tabs, add forms, color pickers, reorder controls, preset switches, `ConfirmModal` dialogs, and Toast notifications.
  - `src/components/kanban/card-attributes-edit.test.ts`: Unit tests validating the integration, '+' buttons, modal tabs, and attribute helper functions.
  - `docs/agent-notes/2026-10-04-card-attributes-edit-modal.md`: This work note.

- **Modified:**
  - `src/components/kanban/card-modal.tsx`: Added `+` buttons to Status, Priority, and Story Points section headers (both mobile quick bar and desktop side panel); mounted `CardAttributesEditModal`; updated `StatusButton` and chip rendering to support dynamic custom statuses, priorities, and story points.
  - `src/lib/kanban/status.ts`: Added `CustomStatusOption` interface, `DEFAULT_STATUS_OPTIONS`, `STATUS_COLOR_CONFIGS` (8 retro lofi colors), `getStoredStatuses`, `saveStoredStatuses`, and enhanced `getStatusMeta(status, customOptions?)`.
  - `src/lib/kanban/difficulty.ts`: Added `CustomStoryPoint` interface, `DEFAULT_STORY_POINTS`, `STORY_POINT_COLOR_CLASSES`, `STORY_POINT_PRESETS` (Retzlo Standard, Fibonacci, Linear, T-Shirt Sizes), `getStoredStoryPoints`, `saveStoredStoryPoints`, and updated `DifficultyScore` and `getDifficultyMetadata(score, customList?)`.
  - `src/lib/kanban/difficulty.test.ts`: Updated test suite to verify 1–100 score handling and custom story points metadata resolution.
  - `src/types/kanban.ts`: Updated `CardStatus` type to support custom status strings seamlessly.
  - `src/app/api/cards/route.ts`: Updated `cardStatusSchema` and `difficultySchema` to accept custom statuses and custom story points (1–100).
  - `src/components/kanban/board.tsx`: Passed `boardId={board.id}` to `CardModal` and `KanbanColumn`.
  - `src/components/kanban/column.tsx`: Accepted `boardId?: string` in `KanbanColumnProps` and passed it to `CardModal`.
  - `src/components/kanban/project-calendar.tsx`: Passed `boardId={selectedCard.column.boardId}` to `CardModal`.
  - `docs/theme-system.md`: Added Card Attributes Edit Modal to the Theme Coverage Matrix and appended dated change log entry.
  - `docs/system-guide.md`: Added Section 2.10 detailing Card Attributes Customization, the `+` buttons, and modal capabilities.
  - `src/components/help/help-center-client.tsx`: Added interactive guide topic for Card Attributes Customization to the In-App Knowledge Base (`/help`).

## Important Behavior Changes

1. **Section Header '+' Buttons:**
   - Both the desktop right-hand panel and mobile quick bar now display a subtle, clickable `+` button at the trailing edge of the "Status", "Priority", and "คะแนนความยาก (Story Points)" section titles.
   - Clicking any `+` button opens `CardAttributesEditModal` with the corresponding tab activated (`status`, `priority`, or `story-points`).

2. **Card Attributes Edit Modal:**
   - **Tab 1: Status:** View all statuses, create custom statuses with custom labels and Retro Lofi color swatches (Indigo, Teal, Amber, Emerald, Rose, Purple, Cyan, Stone), reorder positions, delete with `ConfirmModal`, or reset back to default.
   - **Tab 2: Priority:** View board priorities, add new priorities (up to 10), assign 12 Retro Lofi colors, adjust urgency levels, delete with `ConfirmModal`, or reset back to default. Automatically persists to the board database (`/api/boards/[boardId]`).
   - **Tab 3: Story Points:** Switch presets (Retzlo Standard 1,3,5,8,16,21; Fibonacci 1,2,3,5,8,13,21; Linear/Hours 1,2,4,8,16,24,40; T-Shirt Sizes XS-XXL) or add arbitrary custom scores (1–100) with custom labels and colors. Delete with `ConfirmModal` or reset.
   - All changes immediately reflect reactively in the open `CardModal` without requiring a page reload.

3. **Compliance with AGENTS.md Standards:**
   - All delete and reset operations prompt a `ConfirmModal` dialog before execution.
   - All CUD operations provide immediate visual Toast notifications (success or error).
   - Strict TypeScript compliance, no lint errors, and clean Next.js build.

## Database / Schema Changes

- None. Database `Card.status` and `Card.priority` are already `String`, and `Card.privateCoins` stores custom difficulty/story points cleanly.

## Verification Commands Run & Results

- `npx vitest run src/components/help/help-center.test.ts src/components/kanban/card-attributes-edit.test.ts src/lib/kanban/status.test.ts src/lib/kanban/difficulty.test.ts`: Passed (29 tests across 4 test files).
- `npx tsc --noEmit`: Exited with code 0 (clean, no TypeScript errors).
- `npm run lint`: Exited with code 0 (no ESLint warnings or errors).
- `npx prisma validate`: Exited with code 0 (schema valid).
- `npm run build`: Exited with code 0 (compiled 36 routes successfully).

## Known Follow-ups, Blockers, or Deployment Notes

- None. Ready for git commit and push.
