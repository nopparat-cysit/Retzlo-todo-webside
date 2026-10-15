# 2026-10-16 Dedicated Company & Workspaces Hub Redesign

## Objective
Redesign the `/projects` page into a dedicated, standalone Company & Workspaces Hub ("หน้ารวมบริษัท"). Previously, `/projects` was a cramped hybrid view that simultaneously showed a left sidebar, active boards in the middle column, and a right rail. The user requested making the Company page a clean, standalone directory where workspaces are presented clearly in a dedicated grid, and clicking a company navigates directly to that company's Project Workspace (`/project/[id]`).

## Files Created / Modified
- `src/components/project/projects-dashboard.tsx`
  - Replaced the embedded 3-column split layout with a standalone Company Hub layout.
  - Added a global sticky header with brand identity (`Building2` / `Sparkles`), global workspace search input, Arcade store link, Language switcher, Retzlo AI assistant, Help button (`?`), and User Profile Avatar popover.
  - Added a Hero banner with live metrics overview (Total Workspaces, Total Boards, Active Tasks, Team Members) and a primary `+ Create Workspace` modal trigger button.
  - Added filter tabs (`All Workspaces`, `Starred`, `Work Studios`, `Life & Diary`) with instant live count badges and real-time query filtering.
  - Enhanced workspace cards in a responsive grid featuring cover images, stickers, descriptions, project lead avatars, progress indicators, board/member counts, and direct `Enter Workspace` navigation linking to `/project/${project.id}`.
  - Positioned the utility toolbar (`AiChatTrigger`, `HelpButton`, `UserProfilePopover`) at the top right above `Studio Pulse` on `2xl` screens.
  - Preserved all delete and update protections (`ConfirmModal`, `EditProjectModal`, toast notifications, optimistic UI).

## Important Behavior Changes
- Navigating to `/projects` now presents the full company/workspace directory cleanly without embedding boards or forcing a board view into a narrow middle column.
- Clicking on a workspace card or clicking "Enter Workspace" directs the user straight to `/project/[id]`, giving full focus to that workspace's boards, calendar, diary, notes, members, and settings within `ProjectShell`.

## Verification Commands & Results
- `npx tsc --noEmit` - Passed (0 errors).
- `npx vitest run src/components/project/` - Passed (3 test files, 25 tests passed).
- `npx vitest run src/components/help/` - Passed (1 test file, 5 tests passed).
- `npx vitest run` - Passed (99 test files, 525 tests passed).
- `npm run lint` - Passed (✔ No ESLint warnings or errors).
- `npm run build` - Passed (exited with code 0).
- `npx prisma validate` - Passed (schema valid).
