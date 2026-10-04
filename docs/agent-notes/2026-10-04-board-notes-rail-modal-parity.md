# Work Note: Board Note Modal Parity with Notes Page & Default Current Board

**Date:** 2026-10-04  
**Objective:** Upgrade the Add Note and Edit Note modal in the board side rail (`BoardNotesRail`) to achieve full feature parity with the main Notes page editor (`NoteEditorModal`), including folder selection, retro sticker picker, due date/time, and defaulting visibility scope to the current board.

## Problem Addressed
Previously, clicking "+ Add" in the board page's Notes drawer opened an older, simplified `NoteModal` that:
1. Defaulted visibility scope to "Private Note" instead of the active board that the user was currently working on.
2. Lacked folder selection (`folderId`).
3. Lacked end/due date and time picker (`DateTimeField`).
4. Used a basic 18-emoji grid instead of the rich retro stickers library (`RetroStickerImage`).
5. Did not display the sticker preview icon container next to the note title input.

## Files Created & Modified
- **Modified:**
  - `src/components/notes/board-notes-rail.tsx`: Upgraded `NoteModal` and `EditNoteModal` to incorporate full features from the Notes page:
    - Initialized `scope` to `"board"` by default when `activeBoardId` is present.
    - Added `DEFAULT` badge to Sub-project Board in the modal and pre-selected `activeBoardId` in the board dropdown.
    - Integrated folder fetching from `/api/projects/[id]/note-folders` and folder dropdown with Radix UI `<Select>`.
    - Integrated `DateTimeField` with label "วันที่สิ้นสุด (Due / End Date)".
    - Integrated `NoteStickerPicker` with `RetroStickerImage` and `sharedIconOptions`.
    - Added sticker preview container next to the title input.
    - Handled due dates, folders, and board assignments in note creation and update API requests.
  - `src/components/notes/note-modals.test.ts`: Added unit tests asserting that the board notes rail modal defaults initial scope to current board and provides full notes feature set (DateTimeField, Radix Select, stickers, folders).
  - `docs/theme-system.md`: Appended dated change log entry documenting the UI parity and token compliance.

## Important Behavior Changes
- Opening "+ Add" in the board's Notes drawer now presents the full, rich note editor matching the Notes page.
- Visibility scope is now defaulted to the current board (`activeBoardId` / `activeBoardName`) rather than "Private Note".
- Users can attach notes directly to folders and set due dates/times from the board page without navigating away to the Notes page.

## Database & Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run src/components/notes/note-modals.test.ts src/components/notes/notes-panel.test.ts`: Passed (14/14 tests).
- `npm run lint`: Passed (0 ESLint warnings or errors).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run build`: Passed (Compiled successfully, all 38 routes generated).

## Follow-ups & Deployment Notes
- Ready for immediate production deployment.
