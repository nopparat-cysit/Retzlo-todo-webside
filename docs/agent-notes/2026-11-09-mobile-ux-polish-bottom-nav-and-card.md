# Mobile UX Polish: Bottom Navigation, Viewport Overflow, Board Chips, and Filter Badges

## Date and Objective
- Date: 2026-11-09
- Objective: Resolve 4 mobile UI/UX defects across the project dashboard and bottom navigation:
  1. Compact floating mobile bottom navigation bar dimensions and touch offsets.
  2. Prevent viewport vertical scroll leakage into empty dead space on `/projects`.
  3. Enforce single-line non-wrapping board quick-jump chips in workspace cards.
  4. Prevent search filter tab buttons and count badges from overflowing on mobile screens.

## Files Modified
- `src/components/project/project-mobile-bottom-nav.tsx`
- `src/components/project/projects-dashboard.tsx`
- `src/components/project/project-mobile-bottom-nav.test.ts`
- `src/components/project/projects-dashboard.test.ts`
- `docs/theme-system.md`

## Important Behavior Changes
- **Mobile Bottom Navigation (`project-mobile-bottom-nav.tsx`)**:
  - Container width reduced to `sm:w-[340px] max-w-[360px]` with padding `p-1`.
  - Bottom offset adjusted to `bottom-2` with `bottom: "calc(0.4rem + env(safe-area-inset-bottom, 0px))"`.
  - Icon container reduced from `h-6 w-6` to `h-5 w-5` with `h-3.5 w-3.5` icons.
  - Active dot indicator scaled down from `h-1 w-1` to `h-0.5 w-0.5`.
  - Nav label text size compacted from `text-[10px]` to `text-[9px]`.
- **Viewport Scroll Lock on `/projects` (`projects-dashboard.tsx`)**:
  - Main container set to `h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col`.
  - Desktop sidebar `<aside>` hidden on mobile via `hidden lg:flex` so mobile viewport is not extended by desktop panels.
  - Project section set to `flex-1 min-h-0 overflow-hidden` with internal scrolling confined to project list.
  - Bottom scroll padding reduced from `pb-24 lg:pb-4` to `pb-14 lg:pb-4` across list and grid views to match the sleeker navigation capsule.
- **Board Quick-Jump Chips (`projects-dashboard.tsx`)**:
  - Container switched from `flex-wrap` to `flex-nowrap overflow-hidden`.
  - Slices up to 2 primary board chips (`max-w-[75px] sm:max-w-[90px]`) and displays `+{length - 2}` overflow badge when more boards exist, preventing multi-line wrapping.
- **Category Filter Tabs (`projects-dashboard.tsx`)**:
  - Container styled as `grid grid-cols-4 gap-1 sm:flex sm:flex-wrap sm:items-center`.
  - Button padding reduced to `px-1 py-1 text-[11px] min-w-0 sm:px-2.5 sm:py-1 sm:text-xs`.
  - Filter labels truncated with `truncate`, and badge padding reduced to `px-1 py-0.2 text-[9px] sm:text-[10px]` to guarantee safe column alignment without horizontal scrolling on 360px-390px mobile viewports.

## Database / Schema Changes
- None.

## Verification Commands Run and Result
- `npx vitest run src/components/project/`: Passed (7 test files, 48 tests passed).
- `npm run lint`: Passed (`✔ No ESLint warnings or errors`).
- `npx prisma validate`: Passed (`The schema at prisma\schema.prisma is valid`).
- `npm run build`: Passed (Next.js production build succeeded with all static/dynamic routes prerendered).

## Known Follow-ups, Blockers, or Deployment Notes
- None. Ready for production deployment.
