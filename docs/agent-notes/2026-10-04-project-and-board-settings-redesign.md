# Project and Board Settings Redesign & Usability Overhaul

## Date & Objective
- **Date:** 2026-10-04
- **Objective:** Redesign the Project Settings page (`/project/[id]/settings`) and Board Settings modal (`BoardSettingsModal`) into a clean, modern, intuitive, and modular experience that eliminates cluttered vertical scrolling, redundant confirmation dialogs, and disjointed privacy/member access flows.

## Files Created, Modified, Deleted, or Moved
- `src/components/project/project-settings-client.tsx` (created):
  - Client component providing 5 dedicated navigation tabs: `บอร์ด & ย่อย (boards)`, `ข้อมูลโปรเจกต์ (identity)`, `สิทธิ์ & ฟีเจอร์ (features)`, `การตั้งค่าส่วนตัว (preferences)`, and `แสดงทั้งหมด (all)`.
  - Supports deep linking with URL query parameter `?tab=...` and automatic highlighting when `?boardId=...` is provided.
  - Keeps individual sections clean, responsive, and focused.
- `src/app/(dashboard)/project/[id]/settings/page.tsx` (modified):
  - Converted from a single monolithic vertical page into rendering `ProjectSettingsClient`.
  - Maintained server-side data fetching and preserved the test contract for `<ThemeToggle variant="settings" />`.
- `src/components/project/settings-form.tsx` (modified):
  - Added support for `viewMode?: "all" | "identity" | "features"` prop so the identity details (Cover image, project name, description) and features/danger zone sections can be rendered cleanly either independently or combined.
- `src/components/project/project-boards-manager.tsx` (modified):
  - Added a prominent "เปิดบอร์ด" (Open Board) button (`Link`) to each board card and table row.
  - Streamlined board management actions with clean icon-based buttons for Settings, Rename, Access, and Delete.
  - Kept all test assertions from `board-views-and-sidebar.test.ts`.
- `src/components/kanban/board-settings-modal.tsx` (modified):
  - Unified into 4 clean tabs: General & Access (`general`), Priorities (`priorities`), Columns (`columns`), and Danger (`danger`).
  - Removed unnecessary ConfirmModal on Save: saving board settings now saves directly and triggers an instant success Toast.
  - Kept all contract assertions from `board-rename.test.ts`.
- `src/components/kanban/board-settings/general-tab.tsx` (modified):
  - Integrated inline member selector directly inside the General tab when "Private" is selected.
  - Includes real-time search input, avatar display, role badges, and select all / clear all buttons.
- `src/components/kanban/board-settings/columns-tab.tsx` (modified):
  - Enhanced column cards with stage order badges, WIP limits, card count, and a direct "เปิดหน้าบอร์ดเพื่อจัดเรียงหรือตั้งค่าคอลัมน์ →" link.
- `docs/theme-system.md` (modified):
  - Added dated entry documenting tokens, changes, and verification.
- `docs/system-guide.md` (modified):
  - Added section 2.11 for Project and Board Settings Overhaul.
- `src/components/help/help-center-client.tsx` (modified):
  - Added `project-and-board-settings` topic to Knowledge Base.

## Important Behavior Changes
- **Project Settings:**
  - Users are no longer presented with an overwhelming vertical scroll of every workspace option.
  - Clicking tabs instantly switches views without full-page reloads, while updating the address bar query parameter (`?tab=...`).
- **Board Cards:**
  - Users can now immediately jump into a board by clicking "เปิดบอร์ด", rather than only having configuration buttons.
- **Board Settings Modal:**
  - Users no longer have to jump between a "General" tab and a separate "Access" tab when making a board private; member selection is handled immediately within the same view.
  - Direct save with success Toast notification replaces the double confirmation dialog on simple saves.

## Database / Schema Changes
- None. All changes operate on existing Prisma models (`Project`, `Board`, `BoardMember`, `ProjectMember`).

## Verification Commands & Results
- `npx vitest run src/components/theme/theme.test.ts src/components/kanban/board-rename.test.ts src/components/kanban/board-views-and-sidebar.test.ts`: Passed (33/33 tests).
- `npx tsc --noEmit`: Passed (0 errors).
- `npm run lint`: Passed (0 warnings or errors).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run build`: Passed (Clean production build with all 36 routes generated).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
