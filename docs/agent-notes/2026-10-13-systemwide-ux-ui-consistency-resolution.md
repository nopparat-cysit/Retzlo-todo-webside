# 2026-10-13 - System-Wide UX/UI Consistency & Divergence Resolution

## Objective
Address and resolve all remaining system-wide UX/UI divergence issues identified during the comprehensive audit:
1. Fix broken navigation / 404 route for project-scoped rewards by implementing `/project/[id]/rewards/page.tsx` with DB error fallbacks.
2. Replace all native unstyled HTML `<select>` elements across admin, settings, contact, kanban, and board tabs with the canonical retro theme-compliant `<FilterSelect />`.
3. Enable global `Ctrl+K` `CommandPalette` across the entire application by hoisting it into the root layout with automatic `pathname` detection.
4. Integrate the AI Assistant (`AiChatTrigger`) into the Workspace Hub top command bar for parity with project views.
5. Add direct task creation capability (`Add Task for this date`) to the calendar Day Overview modal.
6. Replace hardcoded text colors in user profile settings (`profile-client.tsx`, `profile-form.tsx`, `change-password-form.tsx`) with semantic theme tokens (`text-theme-foreground`, `text-theme-muted`).

## Files Created, Modified, Deleted
- **Created**:
  - `src/app/(dashboard)/project/[id]/rewards/page.tsx`: Scoped Rewards Shop route rendering `RewardsStore` inside `ProjectShell` with `ErrorState` fallback.
- **Modified**:
  - `src/app/layout.tsx`: Hoisted `CommandPalette` globally inside `AiChatProvider`.
  - `src/components/project/project-shell.tsx`: Removed duplicate `CommandPalette` mount.
  - `src/components/ui/command-palette.tsx`: Added auto-detection of `projectId` from `usePathname()` and added global navigation items (Workspaces, Rewards Store, Profile, Help).
  - `src/components/project/projects-dashboard.tsx`: Added `AiChatTrigger` to the workspace top command bar.
  - `src/components/kanban/project-calendar.tsx`: Added direct `Add Task for this date` button in the Day Overview modal footer.
  - `src/components/profile/profile-client.tsx`: Replaced hardcoded `text-stone-100` and stone borders with `text-theme-foreground` and semantic tokens.
  - `src/components/profile/profile-form.tsx`: Replaced stone text colors with `text-theme-foreground` and `text-theme-muted`.
  - `src/components/profile/change-password-form.tsx`: Replaced stone text colors with `text-theme-foreground` and `text-theme-muted`.
  - `src/components/project/project-settings-client.tsx`: Replaced native `<select>` with `<FilterSelect />`.
  - `src/components/project/project-settings-client.test.ts`: Updated test to assert `<FilterSelect />` usage.
  - `src/components/contact/contact-page-client.tsx`: Replaced template and priority `<select>` tags with `<FilterSelect />`.
  - `src/components/admin/tabs/rewards-tab.tsx`: Replaced status filter `<select>` with `<FilterSelect />`.
  - `src/components/admin/drawers/workspace-inspector-drawer.tsx`: Replaced transfer owner `<select>` with `<FilterSelect />`.
  - `src/components/kanban/board-list-view.tsx`: Replaced column picker `<select>` with `<FilterSelect />`.
  - `src/components/kanban/board-priorities-tab.tsx`: Replaced priority template `<select>` with `<FilterSelect />`.
  - `src/components/kanban/board-attributes-tab.tsx`: Replaced status, column filter, and story points `<select>` with `<FilterSelect />`.

## Important Behavior Changes
- **No More 404 for Rewards**: Visiting or navigating to `/project/[id]/rewards` now cleanly displays the Rewards Store scoped to that workspace.
- **Universal Command Palette (`Ctrl+K`)**: Pressing `Ctrl+K` now opens the command palette anywhere in the application. When inside a workspace, it focuses on that workspace's cards, boards, and notes; when outside, it displays global navigation and system tools.
- **AI Assistant Accessible in Hub**: The AI chat trigger is now visible and functional in the Workspace Hub top command bar.
- **Calendar Day Actionability**: Users viewing a specific date in the calendar can click "Add Task for this date" to jump directly into task creation for that day.
- **Theme Integrity**: Eliminated OS-native select dropdowns, ensuring dark mode and retro theme consistency across all administrative and kanban screens.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npm run lint`: Passed (`✔ No ESLint warnings or errors`).
- `npx prisma validate`: Passed (`The schema at prisma\schema.prisma is valid 🚀`).
- `npx vitest run`: Passed full suite (99 test files, 524 tests passed, 0 failed).
- `npm run build`: Passed (compiled all 40 routes successfully).
