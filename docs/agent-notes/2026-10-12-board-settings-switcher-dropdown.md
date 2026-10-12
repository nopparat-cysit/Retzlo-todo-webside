# Work Note: Board Settings Modal Switcher Dropdown

- **Date:** 2026-10-12
- **Objective:** Turn the static board title in `BoardSettingsModal` into an interactive Dropdown selector allowing users to switch and configure different boards directly inside the modal without closing and reopening.

## Files Created, Modified, or Deleted
- **Created:**
  - `src/components/kanban/board-settings-dropdown.test.ts`: Integration and contract tests verifying dropdown presence, board switching, unsaved changes confirmation, and activeBoardId wiring.
  - `docs/agent-notes/2026-10-12-board-settings-switcher-dropdown.md`: This work session note.
- **Modified:**
  - `src/components/kanban/board-settings-modal.tsx`: Replaced static `h2` board title with Radix `DropdownMenu` selector with `ChevronDown`, added `availableBoards` & `onBoardChange` props, integrated `ConfirmModal` on unsaved changes when switching boards, dynamically fetched project boards, and wired all tabs to `activeBoardId`.
  - `src/components/kanban/board.tsx`: Added `availableBoards` prop, passed to `BoardSettingsModal`, and handled seamless router navigation to newly selected boards on modal dismiss or save.
  - `src/components/kanban/board-view-container.tsx`: Passed `availableBoards` from parent container to `KanbanBoard`.
  - `src/components/kanban/board-sidebar-dropdown.tsx`: Passed project `boardsList` to `BoardSettingsModal`.
  - `src/components/project/project-boards-manager.tsx`: Passed project `boards` to `BoardSettingsModal`.
  - `src/components/project/projects-dashboard.tsx`: Passed `activeProject.boardsList` to `BoardSettingsModal`.
  - `docs/theme-system.md`: Added dated coverage entry and verification summary.
  - `docs/system-guide.md`: Updated section 2.10 with Board Switcher Dropdown details.
  - `src/components/help/help-center-client.tsx`: Updated English and Thai interactive Knowledge Base highlights.

## Important Behavior Changes
- **Header Board Switcher Dropdown:** Users can click the board name in the `BoardSettingsModal` header to open a dropdown menu listing all accessible boards in the project (showing lock icon for Private boards, KanbanSquare for Public boards, and checkmark for the active board).
- **In-Modal Board Switching:** Selecting a different board loads that board's settings (name, visibility, members, columns, priorities, statuses) immediately without closing the modal.
- **Unsaved Changes Protection:** If user has pending unsaved edits on the current board, selecting another board prompts a `ConfirmModal` ("Discard Unsaved Changes?") per `AGENTS.md` guidelines before switching.
- **Clean Active Board Navigation:** When the modal closes or saves, if the user switched boards, the page seamlessly navigates to the newly chosen board.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/kanban/board-settings-dropdown.test.ts`: Passed (5/5 tests).
- `npx vitest run`: Passed (96 test files, 506 tests passed, 3 skipped).
- `npx tsc --noEmit`: Passed with 0 errors.
- `npm run lint`: Passed with 0 warnings or errors.
- `npx prisma validate`: Valid.
- `npm run build`: Passed (40/40 routes generated successfully).

## Follow-ups / Blockers
- None.
