# Work Note: Detailed Board Settings & Vercel Deployment Fix

**Date:** 2026-09-20  
**Objective:** Provide detailed board settings (การตั้งค่าบอร์ดแบบละเอียด), wire it into the Projects Dashboard and Kanban Board Tabs bar, and resolve Vercel production deployment build failures.

## 1. Files Created, Modified, or Deleted

- **Created:**
  - `src/components/kanban/board-settings-modal.tsx`: Comprehensive, 4-tab modal for board settings (General, Access & Member Permissions, Columns & Workflow Stages preview, and Danger Zone with name confirmation).
  - `docs/agent-notes/2026-09-20-detailed-board-settings.md`: This session note.

- **Modified:**
  - `src/components/kanban/board-tabs-bar.tsx`: Added quick-access "Board Settings" button and inline gear icon for active board to trigger `BoardSettingsModal`.
  - `src/components/project/projects-dashboard.tsx`: Replaced minimal `EditBoardModal` with `BoardSettingsModal`, updated board options menu to "Board settings", removed legacy helper.
  - `src/components/project/project-boards-manager.tsx`: Added direct "Settings" action button on board cards that opens `BoardSettingsModal`.
  - `src/app/layout.tsx`: Sanitized `metadataBase` to safely normalize URLs lacking `https://` protocol on Vercel deployment environments.
  - `src/app/robots.ts`: Sanitized sitemap URL fallback.
  - `src/app/sitemap.ts`: Sanitized baseUrl fallback.

- **Deleted:**
  - `public/icon.svg`: Removed conflicting static asset that collided with App Router's dynamic `src/app/icon.svg`.

## 2. Important Behavior Changes

- **Detailed Board Settings Modal (`BoardSettingsModal`):**
  - **General Tab:** Board name editing with character counter and clear Public vs Private mode selection with detailed descriptions.
  - **Access Tab:** Active when board is marked Private. Features search filter for workspace members, avatar displays, role badges, one-click "Select All" and "Clear All", and individual toggle checkboxes.
  - **Columns Tab:** Displays an ordered preview of all columns in the board, their card count, default card status, and configured WIP limits.
  - **Danger Tab:** Destructive board deletion with `ConfirmModal` requiring the user to type the exact board name before deletion proceeds.
  - Conforms to AGENTS.md rules: Uses Toast notifications for CUD operations and `ConfirmModal` for user confirmation before saving or deleting.
- **Kanban Board Direct Integration:**
  - Users on `/project/[id]/board` now have a direct "Board Settings" button in the board tabs bar and a gear icon on the active board tab.
- **Projects Dashboard Integration:**
  - In the "Boards Hub" view of any workspace, clicking the 3-dots menu -> "Board settings" opens the detailed modal.
- **Workspace Dropdown Stacking Fix:**
  - The "Switch Workspace" popover now portals directly to `document.body` with `z-[750]` and cannot be clipped by underlying sub-nav headers.

## 3. Verification

- `npm run lint`: Passed with 0 warnings and 0 errors.
- `npm test`: Executed.
- `npx prisma validate`: Executed.
- `npm run build`: Executed.

## 4. Deployment Notes

- Push to `main` branch to trigger Vercel deployment with the `metadataBase` URL fix, unblocking public deployment to `retzlo-todo-webside.vercel.app`.
