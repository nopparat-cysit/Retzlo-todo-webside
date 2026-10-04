# Work Session Note: Jira-style Board Settings Integration

## Date
2026-10-04

## Objective
Address user feedback regarding the cramped and difficult-to-use board settings popup modal ("อยากให้เป็น setting แบบจิระ แบบนี้ใช้ยากไป") by replacing the modal popup overlay in Project Settings with a first-class **Jira Space & Board Settings Master-Detail Architecture**, allowing seamless board configuration (General, Access, Columns, WIP Limits, Attributes, Danger Zone) directly from the left sidebar navigation, with full responsiveness and real-time syncing.

## Files Created, Modified, Deleted, or Moved
- **Modified:**
  - `src/components/project/project-settings-client.tsx`:
    - Added dedicated `board-general` ("Board Details & Access") and `board-columns` ("Columns & Workflow") tabs to `SettingsTabId` and `navGroups`.
    - Integrated Active Board Selector Banner with real-time board switcher dropdown.
    - Integrated `BoardGeneralTab`, `BoardColumnsTab`, and `BoardDangerTab` directly into the Jira-style settings pane.
    - Added real-time board state management, PATCH saving, and DELETE with `ConfirmModal`.
    - Passed `onConfigureBoard` callback to `ProjectBoardsManager`.
  - `src/components/project/project-boards-manager.tsx`:
    - Added `onConfigureBoard` prop.
    - Updated card and table view "Settings" and "Access" buttons to call `onConfigureBoard(b.id, "general")` to navigate directly within the Jira-style settings page instead of popping up `BoardSettingsModal`.
  - `src/components/kanban/board-settings-modal.tsx`:
    - Transformed modal layout into a **Jira Master-Detail Left Sidebar Dialog** (expanded to `max-w-4xl`), replacing the 4 horizontal tabs with a clean vertical navigation sidebar and a direct link to "เปิดหน้าเต็มจอ (Jira Style)".
  - `src/components/kanban/board-sidebar-dropdown.tsx`:
    - Updated "Board settings" dropdown action to link directly to `/project/[projectId]/settings?tab=board-general&boardId=[boardId]`.
  - `src/components/project/project-settings-client.test.ts`:
    - Added unit test cases verifying `board-general`, `board-columns`, `BoardGeneralTab`, `BoardColumnsTab`, `BoardDangerTab`, and `onConfigureBoard` integration.
  - `src/components/help/help-center-client.tsx`:
    - Updated In-App Help Center (`/help`) settings documentation.
  - `docs/system-guide.md`:
    - Updated Section 2.11 documenting Jira-style board configuration.
  - `docs/theme-system.md`:
    - Appended dated change log entry.
- **Created:**
  - `docs/agent-notes/2026-10-04-jira-style-board-settings.md`: This work session note.

## Important Behavior Changes
- Users configuring boards no longer experience an awkward, cramped popup modal dialog appearing on top of the Settings page.
- Clicking "Settings" or "Access" on any board card in `Boards & Sub-projects` switches smoothly to that board's configuration inside the Jira-style Master-Detail settings page.
- Users can switch between boards using the "เลือกบอร์ด" dropdown at the top of the board configuration pane.
- Clicking "Board settings" from the sidebar dropdown on the Kanban board navigates directly to `/project/[projectId]/settings?tab=board-general&boardId=[boardId]`.
- For cases where `BoardSettingsModal` is invoked, it now features a clean Jira-style vertical left sidebar navigation instead of horizontal tabs.
- Full compliance with AGENTS.md: all delete operations are protected by `ConfirmModal`, and all CUD operations trigger immediate toast feedback.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npx vitest run src/components/project/project-settings-client.test.ts src/components/kanban/board-settings-attributes.test.ts src/components/kanban/board-rename.test.ts`: PASSED (21/21 tests passed).
- `npx vitest run src/components/kanban/card-attributes-edit.test.ts`: PASSED (9/9 tests passed).
- `npm run lint`: PASSED (0 warnings, 0 errors).
- `npx prisma validate`: PASSED (Schema is valid 🚀).
- `npm run build`: PASSED (Production build completed, 38/38 static pages generated).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
