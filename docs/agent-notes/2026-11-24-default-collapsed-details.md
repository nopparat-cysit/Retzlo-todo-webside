# Work Note: Default All Collapsible Details, Tools, Banners & Settings to Closed

- Date: 2026-11-24
- Objective: Configure all collapsible detail sections, header tool/filter drawers, settings panels, and sidebar board sub-menus to default to closed/collapsed on initial load across all viewports.

## Files Modified

- `src/components/diary/diary-list-panel.tsx`: Defaulted `isToolsCollapsed` to `true`, `isChecklistDetailsHidden` to `true`, `isBannerCollapsed` to `true`, and `isSettingsOpen` to `false`.
- `src/components/diary/diary-checklist.tsx`: Defaulted `isDetailsHidden` in `DiaryChecklistPreview` to `true`.
- `src/components/kanban/board.tsx`: Defaulted `isToolsCollapsed` to `true`.
- `src/components/kanban/project-calendar.tsx`: Defaulted `isToolsCollapsed` to `true`.
- `src/components/notes/notes-panel.tsx`: Defaulted `isToolsCollapsed` to `true`.
- `src/components/hub/diary-hub-panel.tsx`: Defaulted `isSettingsOpen` to `false`.
- `src/components/hub/fab-hub.tsx`: Defaulted `isSettingsOpen` to `false`.
- `src/components/project/project-quick-hub.tsx`: Defaulted `isSettingsOpen` to `false`.
- `src/components/kanban/board-sidebar-dropdown.tsx`: Defaulted `isExpanded` to `false`.
- `src/components/project/project-mobile-bottom-nav.tsx` & `src/components/project/project-mobile-bottom-nav.test.ts`: Redesigned outer dock to a concentric squircle capsule (`rounded-2xl`, `sm:w-[360px] max-w-[380px]`), updated active highlight pill wrapper from `inset-y-1.5 w-1/4 px-1 py-0.5` to `inset-y-0 w-1/4 p-0.5` with `rounded-xl`, and standardized tab slots to `h-12` (`48px`) so icon and label fit symmetrically inside the highlight pill.
- `src/components/project/project-shell.tsx`, `src/components/notifications/notifications-popover.tsx`, `src/components/ai/ai-chat-trigger.tsx`, `src/components/ui/help-button.tsx`, `src/components/project/project-shell.test.ts`, `src/components/ai/ai-chat-responsive-layout.test.ts`: Adjusted mobile slide-over drawer width to `w-[min(85vw,310px)] sm:w-80`, wrapped project header metadata in a cohesive identity card, added a mobile quick-tools footer bar (`ProjectTopbarTools`, `FocusModeToggle`, `LanguageSwitcher`), and unified the topbar right-hand action buttons inside a single capsule dock with uniform button sizing (`h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-lg`).
- `src/components/project/projects-dashboard.tsx`: Replaced duplicate `"Workspaces"` mobile utility label with a `Retzlo · Studio` badge + unified utility dock pill, refactored the active workspace sub-navigation bar into a balanced 3-column mobile grid (`grid-cols-3 sm:flex`), and made the `All Workspaces` + `Settings` action bar a 2-column grid with visible labels on mobile.
- `src/app/(marketing)/page.tsx`: Redesigned the mobile dropdown menu with featured highlight cards, a 2-column section navigation pill grid, and a symmetrical 2-column action footer.

## Database & Schema Changes

- None.

## Verification Commands & Results

- `npx tsc --noEmit`: Passed (0 errors).
- `npm run lint`: Passed (0 errors).
- `npx vitest run`: Passed (124 test files, 760 tests passed).
