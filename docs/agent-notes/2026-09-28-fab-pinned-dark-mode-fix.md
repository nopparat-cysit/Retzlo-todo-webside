# Work Session Note: FAB Pinned Display Dark Mode Fix

## Date & Objective
- **Date**: 2026-09-28
- **Objective**: Fix the FAB Pinned Display popup appearing with a blinding white background and unreadable white-on-white text in Dark Mode.

## Files Created, Modified, Deleted, or Moved
- **Modified**:
  - `src/components/hub/fab-hub.tsx`:
    - Replaced invalid Tailwind class `dark:bg-ink-950/92` (which caused the panel to default to `bg-white` in dark mode) with `dark:bg-[#0e1025]` matching system floating popovers.
    - Updated container and sub-container styles to be fully theme-adaptive (`bg-[#faf7f2] border-[#e2dcd2] text-stone-900 dark:border-white/12 dark:bg-[#0e1025] dark:text-stone-100 dark:shadow-[0_18px_54px_rgba(0,0,0,0.5)]`).
    - Added `repeatUnit` badge support in `PinnedDisplayPanel` (`Monthly (28th)` instead of `Every 30d`).
    - Fixed action buttons (Open, Change, Diary, Note, Clear display) with proper contrast and borders in both Light and Dark modes.
  - `src/components/diary/diary-checklist.tsx`:
    - Exported `getStartDayOfMonth` for use across modules.
    - Updated `DiaryChecklistPreview` with proper light and dark mode classes (`border-stone-200/90 bg-stone-100/60 dark:border-white/10 dark:bg-ink-950/40`, high-contrast text and checkbox buttons).
- **Created**:
  - `docs/agent-notes/2026-09-28-fab-pinned-dark-mode-fix.md` - Work session note.

## Important Behavior Changes
- In Dark Mode, the FAB Pinned Display panel now renders with the deep indigo-ink background (`#0e1025`), subtle white borders (`border-white/12`), and crisp readable typography (`text-stone-100` and `text-stone-400`).
- Checklist routine items inside the pinned popup render with clean contrast (titles, descriptions, badges, and checkboxes are all clearly legible).
- If the pinned diary item has `repeatUnit === "MONTH"`, the frequency badge now displays `Monthly (28th)` matching the recurring date.
- In Light Mode, the panel remains warm paper styled (`#faf7f2`) with clear contrast.

## Database / Schema Changes
- None.

## Verification Commands Run & Results
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx vitest run`: Passed (73 test files, 356 tests passed).
- `npm run build`: Passed (Clean Next.js production build).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
