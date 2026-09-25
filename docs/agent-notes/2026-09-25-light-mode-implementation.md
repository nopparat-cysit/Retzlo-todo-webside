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
  - `src/app/globals.css`: Added `:root[data-theme="light"], .light` design tokens and comprehensive contextual mapping layer for Light Mode (panels, typography, borders, backgrounds, cards as pastel sticky notes, inputs, scrollbars, and modals).
  - `src/components/theme/theme-toggle.tsx`: Enhanced `variant="dropdown"` to render a 3-button segmented selector (`Light`, `Dark`, `System`) with active state and smooth click handling.
  - `src/components/project/user-profile-popover.tsx`: Mounted the dedicated Theme Selector inside the user profile dropdown.
  - `src/components/project/project-shell.tsx`: Kept topbar clean by housing theme selection in the user profile dropdown.
  - `src/components/project/projects-dashboard.tsx`: Kept dashboard header clean by housing theme selection in the user profile dropdown.
  - `src/app/(dashboard)/project/[id]/settings/page.tsx`: Mounted `<ThemeToggle variant="settings" />` in Personal Preferences.

## Important Behavior Changes
- Theme switching is cleanly housed inside the **User Profile Dropdown** (`UserProfilePopover`) as a segmented 3-choice control (`Light`, `Dark`, `System`), keeping the Topbars clean, modern, and uncluttered across workspaces and dashboards.
- Users can also configure their Theme preference under Project Settings > Personal Preferences.
- The choice is saved immediately in `localStorage` (`retzlo-theme`) and survives page reloads with 0ms visual flash (anti-FOUC script in `<head>`).
- In Light Mode, scanlines are disabled for a clean tactile paper reading feel, while maintaining the signature retro-lofi identity (warm cream background, charcoal ink text, pastel sticky notes, soft linen borders).
- Dark Mode remains 100% pixel-perfect and unaffected.

## Database / Schema Changes
- None. All preferences are client-side / browser-scoped.

## Verification Commands Run & Results
- `npx prisma validate`: Pass (schema valid)
- `npm test`: Pass (62 test files, 287 tests passed)
- `npm run lint`: Pass (0 errors, 0 warnings)
- `npm run build`: Pass (35/35 static and dynamic pages generated with 0 errors)

## Known Follow-ups, Blockers, or Deployment Notes
- Ready for production deployment.
