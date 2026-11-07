# Work Note: Mobile Viewport Height, Navbar Menu Toggle, and Sidebar Navigation

- Date: 2026-11-07
- Objective: Fix mobile 0px collapsed content in ProjectShell, hide duplicate profile on the choose company page, replace navbar back button with Menu toggle on mobile, add Home icon to Projects link in sidebar drawer, and completely hide Star FAB on mobile to avoid bottom nav collision.

## Files Modified
- `src/components/project/project-shell.tsx`:
  - Converted `project-shell-grid` on mobile from rigid fixed-height grid (`grid-rows-[minmax(0,1fr)] h-[calc(100dvh-1rem)]`) to `flex flex-col min-h-[calc(100dvh-1rem)] sm:min-h-[calc(100dvh-1.5rem)] min-h-0 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:h-[calc(100dvh-1.5rem)]`.
  - Replaced `row-start-1` on `<section>` with `flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl`.
  - Enabled mobile vertical scrolling on `{children}` wrapper (`relative z-10 min-h-0 min-w-0 max-w-full flex-1 pb-16 lg:pb-0 overflow-y-auto lg:overflow-hidden`).
  - Replaced navbar Back button with `<label htmlFor="project-sidebar-toggle"> <Menu className="h-4 w-4" /> </label>` on mobile while preserving `<BackButton />` on desktop (`hidden lg:inline-flex`).
  - Added `<Home className="h-3.5 w-3.5" />` icon to the "Projects" Link in the sidebar drawer.
- `src/components/project/projects-dashboard.tsx`:
  - Added `hidden lg:flex` to the secondary quick actions / profile toolbar in `aside.order-2` to eliminate duplicate profile rendering at the bottom of the page on mobile.
- `src/components/hub/fab-hub.tsx`:
  - Added `hidden lg:flex` to the floating Star action button container so it is completely hidden on mobile devices, preventing any collision with the bottom navigation bar or Menu button.
- `src/components/kanban/board-responsive.test.ts`:
  - Updated responsive test assertions to verify mobile flex layout, overflow-y-auto, mobile Menu toggle in navbar, Home icon in sidebar drawer, and Star FAB hidden on mobile.

## Important Behavior Changes
- Mobile viewports no longer collapse the board, diary, or calendar content area to 0px height.
- Mobile users can scroll vertically to inspect cards, diary routines, and calendars.
- Mobile top navbar provides direct access to the workspace menu drawer via the top-left Menu button.
- Sidebar drawer has a prominent Home icon next to "Projects" to navigate directly back to company / workspace selection.
- Star FAB is completely hidden on mobile screens, leaving the bottom navigation bar completely unobstructed.
- Choose company page (`/projects`) shows a single clean profile and tools bar on mobile instead of duplicating it at the bottom.

## Verification
- `npx vitest run src/components/ai/ai-chat-responsive-layout.test.ts src/components/kanban/board-responsive.test.ts`: Passed (18 tests passed across 2 files).
- `npx vitest run`: Passed (616 tests passed across 111 test files).
- `npm run lint`: Passed with 0 errors and 0 warnings.
- `npx prisma validate`: Passed (schema is valid).
- `npm run build`: Passed (production Next.js build completed successfully across all 43 routes).
