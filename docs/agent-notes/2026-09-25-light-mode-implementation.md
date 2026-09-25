# Light Mode Implementation (Warm Paper & Ink)

## Date & Objective
- **Date:** 2026-09-25
- **Objective:** Implement full Light Mode support (Option B: Warm Paper / Cream Base `#fbfaf8` background, `#ffffff` panels/cards, `#e7e2d9` borders, and `#1c1917` warm charcoal ink typography) with toggle controls placed in the Topbar, User Profile Popover, and Project Settings page (Option A). Guarantee zero Dark Mode regression, zero FOUC on page load/reload, and automatic system preference detection.

## Files Created, Modified, Deleted, or Moved
- **Created:**
  - `src/components/theme/theme-provider.tsx`: Context provider handling `"light" | "dark" | "system"` with `localStorage` persistence (`retzlo-theme`), system `matchMedia` listener, and `data-theme` attribute / `.light` & `.dark` classes on `document.documentElement`.
  - `src/components/theme/theme-toggle.tsx`: Multi-variant theme toggle component (`icon` for topbar, `dropdown` for UserProfilePopover, `settings` segmented control for Project Settings).
  - `src/components/theme/theme.test.ts`: Vitest suite verifying theme provider logic, anti-FOUC script contract, CSS variable definitions, and toggle mounts.
- **Modified:**
  - `src/app/layout.tsx`: Added `suppressHydrationWarning`, injected inline head script to eliminate FOUC, and wrapped body in `<ThemeProvider>`.
  - `tailwind.config.ts`: Configured `darkMode: ["class", '[data-theme="dark"]']`.
  - `src/app/globals.css`: Added `:root[data-theme="light"], .light` design tokens, high-contrast accent ink typography (`text-dusk-amber`, `text-dusk-lavender`, `text-dusk-cyan`, `text-dusk-rose`), recessed paper container wells (`bg-black/20`, `bg-black/30`), and contextual mappings for Light Mode.
  - `src/components/theme/theme-toggle.tsx`: Enhanced `variant="dropdown"` to render a 3-button segmented selector (`Light`, `Dark`, `System`) with active state and smooth click handling.
  - `src/components/project/user-profile-popover.tsx`: Mounted the dedicated Theme Selector inside the user profile dropdown.
  - `src/components/project/project-shell.tsx`: Kept topbar clean by housing theme selection in the user profile dropdown.
  - `src/components/project/projects-dashboard.tsx`: Fixed 2xl CSS grid column order bug (`order-3 2xl:order-3` on `ProjectSupportColumn`) so the main boards hub stays in the center column; prevented vertical word wrapping on `Boards in {activeProject.name}`.
  - `src/components/kanban/board.tsx`: Replaced dark scroll fade hint (`from-ink-950/80`) with theme-adaptive warm paper gradient (`from-[#fbfaf8]/90 dark:from-ink-950/80 to-transparent`), completely eliminating the vertical black edge strip in Light Mode.
   - `src/components/diary/diary-list-panel.tsx`: Adapted Milestone Reward card to warm amber surface (`bg-amber-50/70 border-dusk-amber/35`) and high-contrast text (`text-stone-600 dark:text-stone-400`); updated reward toggle button in creation modal.
   - `src/components/hub/diary-hub-panel.tsx`: Updated Milestone Reward button in Hub creation modal for Light Mode contrast.
   - `src/components/ui/segmented-control.tsx`: Replaced dark grey track (`border-white/10 bg-ink-950/45`) with clean warm paper track (`border-stone-200/90 bg-stone-100/90`) and high-contrast selected/unselected buttons.
   - `src/components/kanban/project-calendar.tsx`: Updated calendar header navigation buttons (Prev/Next/Today/Filters/Upcoming) for clean Light Mode styling.
   - `src/components/kanban/column-icon-picker.tsx`: Adapted Icon picker container (`border-stone-200/90 bg-stone-100/80`) and tile buttons (`border-stone-200/80 bg-white text-stone-600`) for Light Mode.
   - `src/components/kanban/column-status-picker.tsx`: Theme adapted status picker buttons.
   - `src/components/kanban/board.tsx` & `src/components/kanban/column.tsx`: Updated `ColumnThemePicker` color swatch buttons for Light Mode borders and surfaces.
   - `src/components/kanban/card-modal.tsx`: Replaced dark grey `SortableChecklistItem` rows (`bg-ink-950/50`) with clean paper rows (`border-stone-200/90 bg-stone-50/90 text-stone-800`); theme adapted coin input fields.
   - `src/components/kanban/board-settings-modal.tsx`: Theme adapted member list and column list containers and rows.
   - `src/components/theme/theme-toggle.tsx`: Used `skeleton-base` for theme toggle mounting placeholders.
   - `src/components/ui/skeleton.tsx`: Unified `Skeleton` component to use `.skeleton-base` class; adapted `ColumnSkeleton` and `ProjectCardSkeleton` containers, cover placeholders, and stat pills for Light Mode.
   - `src/app/(dashboard)/projects/loading.tsx`: Theme adapted sidebar mini calendar container and header bar for Light Mode.
   - `src/app/globals.css`: Added Light Mode styles for `.skeleton-base` with warm bone background (`#ede8df`) and smooth white sheen gradient.
   - `src/components/theme/theme.test.ts`: Added tests verifying Light Mode styling contracts for `SegmentedControl`, `ColumnIconPicker`, `SortableChecklistItem`, Milestone Reward card, and Skeleton loading.

## Important Behavior Changes
- Theme switching is cleanly housed inside the **User Profile Dropdown** (`UserProfilePopover`) as a segmented 3-choice control (`Light`, `Dark`, `System`), keeping the Topbars clean, modern, and uncluttered across workspaces and dashboards.
- Users can also configure their Theme preference under Project Settings > Personal Preferences.
- The choice is saved immediately in `localStorage` (`retzlo-theme`) and survives page reloads with 0ms visual flash (anti-FOUC script in `<head>`).
- In Light Mode, scanlines are disabled for a clean tactile paper reading feel, while maintaining the signature retro-lofi identity (warm cream background, charcoal ink text, pastel sticky notes, soft linen borders).
- All accent colors (`dusk-amber`, `dusk-lavender`, `dusk-cyan`, `dusk-rose`) in Light Mode map to rich, high-contrast inks (Deep Amber, Indigo, Forest Teal, Crimson) ensuring complete legibility across metrics, pills, and headers.
- Fixed 2xl responsive grid bug where `ProjectSupportColumn` without explicit order defaulted to column 1, pushing the main board hub into the narrow 360px right column.
- Completely eliminated harsh black edge scroll gradient on the Kanban board in Light Mode, blending seamlessly into the warm cream canvas.
- Eliminated dark grey/black box artifacts across Reward catalog sticker cards, sticker pickers, Notes Studio toolbars/quick capture, and Pinned FAB panels.
- Eliminated dark grey box behind Milestone Reward card in Diary, rendering it as a warm golden-amber card with readable ink text.
- Eliminated dark grey pill behind Segmented Control (Month / Week) in Calendar, rendering with warm linen track and crisp active/inactive buttons.
- Eliminated dark grey container behind Icon picker in Create/Edit Column modal, rendering on soft paper well with white icon buttons.
- Eliminated dark grey bars behind Checklist items in Card details modal, rendering as light paper rows with clear checkboxes and strike-through text.
- Upgraded **Skeleton Loading** in Light Mode: replaced barely-visible lavender tints and dark containers with warm bone blocks (`#ede8df`), smooth white-sheen shimmer glides, and crisp paper card frames (`ColumnSkeleton`, `ProjectCardSkeleton`, `ProjectsLoading`, `BoardLoading`).
- Restored active sidebar link readability ("Diary" etc.) with crisp charcoal ink text (`text-stone-900 font-semibold`) in Light Mode.
- Dark Mode remains 100% pixel-perfect and unaffected.

## Database / Schema Changes
- None. All preferences are client-side / browser-scoped.

## Verification Commands Run & Results
- `npx prisma validate`: Pass (schema valid)
- `npx vitest run src/components/theme/theme.test.ts`: Pass (17/17 tests passed)
- `npm test`: Pass (62 test files, 296 tests passed)
- `npm run lint`: Pass (0 errors, 0 warnings)
- `npm run build`: Pass (35/35 static and dynamic pages generated with 0 errors)

## Known Follow-ups, Blockers, or Deployment Notes
- Production deployment triggered via Git push to `origin/main` on GitHub. Users testing Vercel deployments should perform a hard refresh (`Ctrl + Shift + R`) to bypass cached CSS bundles.


