# Nixie Pomodoro Glow & Light Mode Contrast Fix

## Date & Objective
- **Date:** 2026-09-26
- **Objective:** Fix the Nixie Pomodoro timer widget (`src/components/project/nixie-pomodoro.tsx`) so the timer digits glow with high-contrast warm neon amber/cyan instead of rendering as dark burnt brown text on black cards inside a white chamber in Light Mode. Upgrade presets, buttons, and popover spacing.

## Files Modified
- `src/components/project/nixie-pomodoro.tsx`:
  - Removed `mt-4` on root container so it fits naturally without extraneous margin inside popovers.
  - Enclosed the Nixie tubes in a dedicated dark chamber (`#110f1d` with gold/teal cathode borders and subtle scanline grid), preventing light mode global styles from turning the chamber stark white.
  - Set explicit glowing colors on digits (`#ffbe53` golden neon for focus, `#5eead4` mint neon for rest) with multi-layer text shadows, eliminating the low-contrast dark brown (`#92400e`) issue caused by light mode font overrides.
  - Replaced the awkward horizontal white reflection clip with smooth cylindrical glass sheen and subtle vertical cathode highlights.
  - Redesigned mode tabs, duration presets (`15m`, `25m`, `50m`, `Custom`), and custom minute input with crisp light/dark mode borders (`border-stone-200/90 bg-white` in light mode).
  - Upgraded the primary `Start Focus` action button to a rich, high-contrast amber button (`bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold`) and polished Skip and Reset icon buttons.

## Behavior Changes
- The Pomodoro timer display is now crystal clear, beautiful, and authentic to the retro Nixie tube / glowing vacuum tube aesthetic in both Light Mode (Warm Paper) and Dark Mode (Midnight Indigo).
- Numbers are easily readable from any angle with realistic neon luminescence.
- Presets and action buttons are tactile, visible, and delightful to interact with.

## Database & Schema Changes
- None.

## Verification Commands & Results
- `npm run lint`: Passed (No ESLint warnings or errors).
- `npm test`: Passed (64 passed, 309 tests passed).
- `npm run build`: Passed (Next.js production build succeeded; all 35 routes compiled).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
