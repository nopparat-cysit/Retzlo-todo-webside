# Calendar Loading Performance Optimization & Skeleton Loading

## Date & Objective
- **Date:** 2026-10-04
- **Objective:** Fix the slow opening and delayed data rendering of the Project Calendar page (`/project/[id]/calendar`). Provide an instantaneous Next.js streaming Skeleton loading state (`loading.tsx`), eliminate database query waterfalls, fix initial server-side diary item serialization discrepancy, and optimize client-side checklist recurrence calculations.

## Files Created, Modified, Deleted, or Moved
- `src/components/ui/skeleton.tsx` (modified):
  - Added `CalendarSkeleton` component matching the exact calendar toolbar, weekday headers (`SUN`–`SAT`), and 35-day month grid with shimmering Retro Lofi item bars.
- `src/app/(dashboard)/project/[id]/calendar/loading.tsx` (created):
  - Next.js streaming loading UI for `/project/[id]/calendar` route. Provides immediate visual feedback when navigating to the calendar.
- `src/app/(dashboard)/project/[id]/calendar/page.tsx` (modified):
  - Converted sequential stage-1 database queries (`getProjectMembership`, `prisma.project.findUnique`, `prisma.board.findMany`) into a parallel `Promise.all` execution, reducing database network round trips from 4 down to 2.
  - Aligned `prisma.diaryItem.findMany` where clause with `/api/projects/[id]/diary-items` (`OR: [{ isHidden: false }, { authorId: userId }]`).
  - Corrected `toProjectDiaryItems` serialization to preserve `startDate` as ISO string, `repeatUnit` ("DAY" | "MONTH"), and `rewardCoinType` so that diary checklist entries calculate accurately on the very first server render without needing a 3-second live sync refetch.
- `src/components/kanban/project-calendar.tsx` (modified):
  - Added props-to-state synchronization `useEffect`s for `cards`, `notes`, and `diaryItems`.
  - Memoized `preparedDiaries` to pre-normalize checklists once per diary item rather than 35 times across each day of the month.
  - Relaxed `useLiveSync` polling interval from 3000ms to 8000ms to prevent network thrashing on initial load.
- `docs/theme-system.md` (modified):
  - Added dated entry for Calendar performance & skeleton loading.

## Important Behavior Changes
- **Instant Route Transition:**
  - Clicking Calendar no longer freezes or delays navigation; `CalendarLoading` displays immediately with a retro shimmering skeleton.
- **Immediate Data Consistency:**
  - When the calendar mounts, both cards and diary checklist items (e.g. "Work Life") render on the first paint. Users no longer see an empty calendar with 5 cards suddenly jump to 39 items after several seconds.
- **Faster DB Latency:**
  - Cutting DB query waterfalls from 4 steps to 2 cuts server-side wait time substantially over serverless Neon PostgreSQL.

## Database / Schema Changes
- None.

## Verification Commands & Results
- `npx vitest run src/components/theme/theme.test.ts src/components/kanban/calendar-modals.test.ts`: Passed (22/22 tests).
- `npx tsc --noEmit`: Passed (0 errors).
- `npm run lint`: Passed (0 warnings or errors).
- `npx prisma validate`: Passed.
- `npm run build`: Passed (Clean production build).

## Known Follow-ups, Blockers, or Deployment Notes
- None.
