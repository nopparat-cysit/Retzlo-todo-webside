# 2026-11-09 Mobile Sidebar Lofi Panel Position Fix

## Objective
Fix mobile layout regression where the project sidebar occupied 759px of flex document flow, pushing all page content (Board, Calendar, Diary, Notes) below the mobile viewport fold, and restore sticky topbar behavior.

## Files Modified
- `src/app/globals.css`: Enforce `aside.project-sidebar { position: fixed !important; }` on viewports `< 1024px` and enforce `header.lofi-panel { position: sticky !important; overflow: visible !important; }`.
- `src/components/project/project-shell.tsx`: Remove `lofi-panel` class from mobile `<aside>` drawer container to prevent `position: relative` override from CSS cascading order.

## Behavior Changes
- Mobile `<aside>` remains `position: fixed` and translated off-screen without consuming 759px vertical space in the document flow.
- Page content for Board, Calendar, Diary, and Notes renders immediately below the sticky header at `top: 16px` without any empty gap.
- Topbar stays pinned sticky on mobile scroll.

## Database / Schema Changes
- None.

## Verification
- Unit Tests: `npx vitest run src/components/kanban/board-responsive.test.ts` (11 passed).
- Prisma: `npx prisma validate` (passed).
- Lint: `npm run lint` (0 warnings, 0 errors).
- Build: `npm run build` (compiled successfully, 43 static/dynamic routes generated).
- Headless Chrome Real Viewport Inspection (iPhone 390x844): Verified `asidePosition: 'fixed'`, `headerPosition: 'sticky'`, `headerTop: 16`, `mainTop: 8`, zero blank space, and captured screenshots across Board, Calendar, and Diary.

## Deployment Notes
- Commit and push to `origin/main` to trigger Vercel deployment.
