# Design System Token, Global CSS, and UI Consistency Refactoring

Date: 2026-11-18
Objective: Fix recurring UI distortions (phantom Tailwind v4 utilities, squished flex circles, swatch aspect distortion), wire core UI primitives to real semantic CSS tokens, remove global Radix `!important` cascade overrides, and unify cross-page UI inconsistencies across Profile, Rewards, and Projects Dashboard.

## Files Created, Modified, and Deleted

### Created
- `src/lib/theme/design-system-guard.test.ts`: Automated CI structural guard forbidding Tailwind v4 phantom classes in Tailwind v3.4, forbidding broken unprefixed semantic tokens, and capping `!important` count in `src/app/globals.css` (`<= 170`).
- `src/components/profile/profile-settings.test.tsx`: Contract tests verifying `/profile` uses `SettingsSection`, `ConfirmModal`, and `useToast()`.
- `src/components/project/rewards-store.test.tsx`: Contract tests verifying search bar availability in both standalone `/projects/rewards` and project-scoped `/project/[id]/rewards`.
- `docs/agent-notes/2026-11-18-design-system-token-and-ui-refactor.md`: This session note.

### Deleted
- `src/components/ui/dialog.tsx`: Unused Radix Dialog primitive (0 imports across `src/`).

### Modified (Grouped by Unit)
- **Unit 1 (`8a52aea`, 76 files)**: Replaced 414 Tailwind v4 phantom utility occurrences (`shadow-xs`, `shadow-2xs`, `drop-shadow-xs`, `drop-shadow-2xs`, `rounded-xs`, `ring-1.5`, `ring-3`, `h-4.5`/`w-4.5`, `h-5.5`/`w-5.5`) across 67 files; fixed 27+ broken unprefixed tokens in `lofi-panel.tsx`, `audit-detail-drawer.tsx`, `audit-tab.tsx`, `ai-breakdown-modal.tsx`, `diary-list-panel.tsx`, and `project-calendar.tsx`; fixed `color-swatch-picker.tsx` aspect distortion and dynamic grid classes; forwarded `ringClass` in `assignee-avatar.tsx` and `avatar.tsx`; removed `overflow-hidden` ring clipping in `board-list-view.tsx`; added `shrink-0` to equal-dimension `rounded-full` flex circles across 8 files; fixed invalid `<ThemeToggle variant="header" />` in `src/app/(dashboard)/settings/page.tsx`; removed dead `statusToneVariants` from `src/lib/theme/ui-variants.ts` and `ui-variants.test.ts`.
- **Unit 2 (`0a3f6fd`, 19 files)**: Added `--primary`, `--primary-foreground`, `--primary-hover`, `--popover`, `--popover-hover`, `--input-surface`, and `--input-border` in `src/app/globals.css` and `tailwind.config.ts`; wired `button.tsx`, `input.tsx`, `select.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`, `badge.tsx`, `tabs.tsx`, `toolbar.tsx`, `separator.tsx`, `label.tsx`, and `notifications-popover.tsx` directly to `theme-*` tokens; removed local duplicate `Badge` in `src/app/design-system/design-system-preview.tsx`; removed 13 global Radix `!important` overrides in `src/app/globals.css` (183 -> 170) and simplified `.skin.toolsPopover` in `zen-garden-skin.module.css`; updated `theme.test.ts`, `board-switch-skeleton.test.ts`, and tightened `design-system-guard.test.ts` cap to 170.
- **Unit 3 (12 modified + 2 new tests)**: Unified `/profile` (`profile-client.tsx`, `profile-form.tsx`, `change-password-form.tsx`) onto `SettingsSection`/`SettingsRow`, `ConfirmModal`, and `useToast()`; restored search bar inside project-scoped `/project/[id]/rewards` (`rewards-store.tsx`); replaced 3 duplicate hand-rolled `fixed inset-0` context menus in `projects-dashboard.tsx` with shared `DropdownMenu`; removed hardcoded `bg-indigo-600`/`dark:bg-dusk-lavender` `<Button>` overrides in `ai-breakdown-modal.tsx`, `ai-project-summary-modal.tsx`, `project-members-view.tsx`, `column.tsx`, `board-attributes-tab.tsx`, and `board-settings/columns-tab.tsx`; updated `docs/theme-system.md`.

## Important Behavior Changes
- Changing `--primary` or `--popover` in `src/app/globals.css` now propagates directly to `<Button variant="primary">`, `OmikujiDeskSettings` active tabs, `Select`, `Popover`, `DropdownMenu`, `Tooltip`, and `Input` in both light and dark modes.
- Updating profile details or changing password on `/profile` now opens `ConfirmModal` before submitting and shows Toast feedback on completion.
- `/project/[id]/rewards` now exposes the same catalog search bar available on `/projects/rewards`.
- Board and project context menus on `/projects` now use Radix `DropdownMenu` with keyboard navigation and semantic popover surfaces.

## Database / Schema Changes
- None.

## Verification Commands Run and Results
- `npx vitest run`: Passed (121/121 test files, 725 passed, 3 pre-existing skipped in `src/lib/ai/engine.test.ts`).
- `npm run lint`: Passed (0 errors, 4 pre-existing `@next/next/no-img-element` warnings in untouched files).
- `npx prisma validate`: Valid.
- `cmd.exe /c "npm run build"`: Passed across all routes.

## Known Follow-ups and Notes
- Remaining `!important` overrides in `src/app/globals.css` (170) belong to legacy utility-class light-mode remappings (`text-stone-*`, `bg-white/*`, `bg-ink-*`) and should be ratcheted down as feature files migrate to `theme-*` tokens.
- Pre-existing `tsc --noEmit` issues in untouched files (`src/components/settings/omikuji-desk-settings.tsx` and `src/components/omikuji/omikuji-modal.tsx` referencing `showToast` instead of `toast`, plus `src/app/api/zen-garden/route.ts` and `src/lib/r2.ts`) were observed and left outside this refactor scope.
