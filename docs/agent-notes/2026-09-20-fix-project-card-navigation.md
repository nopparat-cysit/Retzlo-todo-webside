# Work Note: Fix Project Card Navigation (หน้าเลือกโปรเจคใหญ่กดไปไม่ได้)

**Date:** 2026-09-20  
**Objective:** Resolve issue where clicking project cards / workspace headers on the project selection dashboard did not navigate to the project board.

## 1. Root Causes

1. **Non-clickable `ProjectCard` surface:** In the "All Workspaces" view, `ProjectCard` rendered an `<EntityCard>` without root links. Clicking the cover image, project title, description, or task progress bar did nothing; only the small button at the very bottom was a `<Link>`.
2. **Missing Workspace Launch CTA in Boards Hub:** When viewing the active workspace's "Boards Hub", the large Hero Banner and the sub-navigation row lacked an immediate "Launch Board" / "Open Diary" button, making it unclear how to enter the workspace board directly.
3. **Static popover item:** In the "Switch Workspace" popover, clicking a workspace changed the dashboard active project state but did not offer a direct one-click action to launch into that project board.
4. **Resilient Board Provisioning:** Added auto-provisioning of a default board if an owner visits a project where no board records exist, avoiding unexpected `notFound()` 404 errors.

## 2. Changes Made

- **`src/components/project/projects-dashboard.tsx`:**
  - `ProjectCard`: Wrapped cover image, title, and description/progress in `<Link href={targetUrl}>` so that clicking anywhere on the card navigates directly into the project board or diary.
  - Workspace Hero Banner: Made project sticker and title clickable `<Link>` elements, and added a prominent "Launch Board" / "Open Diary" CTA button next to the metrics.
  - Sub-navigation bar: Added a prominent "Launch Board" button at the beginning of the navigation row.
  - Switch Workspace Popover: Added a direct `ArrowRight` launch button to immediately open each workspace board.
  - `WorkspaceBoardCard`: Made the entire board card, icon, and title clickable (`cursor-pointer`) to open the board.
- **`src/app/(dashboard)/project/[id]/page.tsx`:**
  - Added smart redirect to `/diary` if the project type is `DIARY`, otherwise to `/board`.
- **`src/app/(dashboard)/project/[id]/board/page.tsx`:**
  - Auto-provisions a default board for owners if `accessibleBoards.length === 0` to prevent 404.

## 3. Verification

- `npm run lint`: Passed with 0 warnings, 0 errors.
- `npm test`: 61 test files passed, 277 tests passed.
- `npm run build`: All 35 routes compiled successfully.
