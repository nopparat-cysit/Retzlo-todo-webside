# 2026-09-15 Standardize Global Personal UI Components

## Objective
Extract, standardize, and consolidate core personal, life, and productivity UI components into `src/components/ui/` (`ColorSwatchPicker`, `ProgressBar`, `CoinBadge`, `Avatar`, `RetroStickerPicker`) to eliminate duplicate code across Diary, Notes, Kanban, and Profile, while preserving 100% backward compatibility and test coverage.

## Files Created
- `src/components/ui/color-swatch-picker.tsx`: Reusable retro lo-fi palette swatch selector with accessibility indicators.
- `src/components/ui/progress-bar.tsx`: Reusable progress indicator with gradient fill and ARIA progressbar attributes.
- `src/components/ui/coin-badge.tsx`: Standardized gamification coin badge with Coins icon and dusk-amber tokens.
- `src/components/ui/avatar.tsx`: Universal user avatar and avatar stack component with deterministic color hashing, initials fallback, and status dot.
- `src/components/ui/retro-sticker-picker.tsx`: Re-exporting sticker picker from `@/components/ui/`.
- `src/components/ui/color-swatch-picker.test.ts`: Unit tests for swatch options, styling, and ARIA attributes.
- `src/components/ui/progress-bar.test.ts`: Unit tests for ARIA progressbar attributes, value clamping, and gradient styling.
- `src/components/ui/coin-badge.test.ts`: Unit tests for Coins icon, token styling, and number formatting.
- `src/components/ui/avatar.test.ts`: Unit tests for Avatar, AvatarStack, deterministic hashing, and status colors.

## Files Modified
- `src/components/kanban/assignee-avatar.tsx`: Delegated `AssigneeAvatar` and `AssigneeStack` to `@/components/ui/avatar` with 100% backward compatibility.
- `src/components/project/user-profile-popover.tsx`: Replaced local `function Avatar(...)` with global `@/components/ui/avatar`.
- `src/app/design-system/design-system-preview.tsx`: Integrated `ProgressBar`, `CoinBadge`, and global components into the Design System preview.
- `src/components/diary/diary-checklist.tsx`: Replaced manual gradient div with `<ProgressBar value={progressPercent} />`.
- `src/components/diary/diary-list-panel.tsx`: Delegated `ColorPicker` to `ColorSwatchPicker`.
- `src/components/kanban/card-modal.tsx`: Delegated `ColorPicker` to `ColorSwatchPicker` and imported `RetroStickerPicker` from `@/components/ui/`.

## Database / Schema Changes
- None (pure frontend UI refactoring and design system standardization).

## Verification Commands Run & Results
- `npx vitest run`: Passed (49 test files, 185 passed, 0 failures).
- `npm run lint`: Passed (0 ESLint warnings or errors).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run build`: Passed (31/31 pages compiled and statically generated).

## Follow-ups & Blockers
- None. All components standardized and verified.
