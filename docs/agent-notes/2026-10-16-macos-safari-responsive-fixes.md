# macOS and Safari Viewport Layout & Glassmorphism Fixes

- **Date:** 2026-10-16
- **Objective:** Fix macOS and Safari UI rendering bugs caused by viewport scaling mismatches (1280px-1512px vs 1920px), Safari `overflow-x-auto` margin detachment, and missing `-webkit-backdrop-filter` rules.

## Files Created, Modified, Deleted, or Moved

- `src/components/project/project-topbar-tools.tsx`:
  - Adjusted breakpoint for Studio Tools popover trigger vs expanded 4-button suite from `xl` (1280px) to `2xl` (1536px).
  - Compact ✨ popover is now used below `2xl`, saving ~200px of topbar horizontal space on 13"/14"/15" MacBooks.
- `src/components/project/project-shell.tsx`:
  - Added `flex-nowrap` to project topbar header.
  - Moved `Command K` shortcut pill visibility from `xl:flex` to `2xl:flex` to prevent topbar crowding.
  - Adjusted project title `max-w` constraint across breakpoints (`xl:max-w-[220px] 2xl:max-w-none`).
- `src/components/project/projects-dashboard.tsx`:
  - Added `min-w-0 max-w-[200px] min-[400px]:max-w-[260px] sm:max-w-xs md:max-w-sm` to active workspace switcher button to prevent overflow with long titles.
  - Fixed Safari `ml-auto` bug inside `overflow-x-auto` container in sub-navigation by separating navigation links into a flex-1 scrollable strip and static actions cluster (`All Workspaces` + `Settings`).
- `src/app/globals.css`:
  - Added `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;` to `body` for clean Mac Retina typography rendering.
  - Added `-webkit-backdrop-filter` rules alongside all `backdrop-filter` rules across `.auth-card`, `.lofi-panel`, `.project-sidebar`, `.retzlo-badge`, `.retzlo-bento-card`, and `.retzlo-quote-card` for hardware-accelerated Safari glassmorphism.

## Important Behavior Changes

1. **MacBook / Laptop Topbar Collision Eliminated:**
   On viewports between 1280px and 1535px (MacBook Air 13", MacBook Pro 14", 1080p at 125% scale), the project header now stays single-line and spacious without colliding with the project title or pushing controls offscreen.
2. **Safari Workspace Sub-navigation Fixed:**
   The "All Workspaces" and "Settings" buttons in `/projects` are no longer pushed out of the scrollable bounds or detached in WebKit/Safari.
3. **Glassmorphism in WebKit/Safari:**
   Sub-panels, sidebars, and badges now properly blur the background underneath in Safari without falling back to opaque/unblurred layers.

## Database / Schema Changes

- None.

## Verification Commands & Results

- `npx tsc --noEmit`: Passed (0 type errors)
- `npx vitest run`: Passed (100 test files passed, 533 passed, 3 skipped)
- `npm run lint`: Passed (0 warnings, 0 errors)
- `npx prisma validate`: Passed (schema valid)
- `npm run build`: Passed (compiled successfully, 42 static & dynamic routes generated)

## Known Follow-ups, Blockers, or Deployment Notes

- None.
