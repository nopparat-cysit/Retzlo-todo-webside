# 2026-11-09 Mobile Menu Drawer Full Width

## Objective
Make the mobile workspace navigation drawer and its buttons full-width across mobile viewports (< 640px) to eliminate awkward empty side space, prevent text truncation, and enlarge touch targets while preserving desktop sidebar behavior.

## Files Modified
- `src/components/project/project-shell.tsx`: Updated mobile sidebar drawer container width from `w-[min(280px,calc(100vw-2.5rem))]` to `w-[calc(100vw-1rem)] sm:w-80 lg:w-auto`.
- `src/app/globals.css`: Added 4-sided subtle border for mobile sidebar drawer card in light and dark themes under `@media (max-width: 1023px)`.
- `src/components/project/project-shell.test.ts`: Added unit tests verifying full viewport width responsive classes and mobile drawer border definitions.

## Important Behavior Changes
- On mobile screens (< 640px), tapping the navbar hamburger menu opens a full-width drawer card with balanced 8px padding (`left-2 top-2 bottom-2` with `width: calc(100vw - 1rem)`).
- All navigation buttons inside the drawer (Boards, Calendar, Diary, Notes, Members, Rewards Store, Settings, Command palette trigger) stretch smoothly across the full width (`w-full`), making tap targets easy to hit.
- On tablet viewports (>= 640px and < 1024px), the drawer maintains a comfortable 320px width (`sm:w-80`).
- On desktop viewports (>= 1024px), the desktop sidebar layout (`lg:relative lg:w-auto`) and collapsible rail states remain unchanged.

## Database / Schema Changes
None.

## Verification Commands Run & Results
- `npx vitest run src/components/project/project-shell.test.ts`: 10 passed (10 total).
- `npx vitest run src/components/kanban/board-responsive.test.ts src/components/diary/diary-list-panel.test.ts`: 22 passed (22 total).
- `npx prisma validate`: The schema at prisma/schema.prisma is valid.
- `npm run lint`: No ESLint warnings or errors.
- `npm run build`: Compiled successfully (43/43 static and dynamic routes generated).

## Known Follow-ups, Blockers, or Deployment Notes
None.
