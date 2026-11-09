# 2026-11-09 Responsive Skeletons and Loading Layout Polish

## Objective
Optimize skeleton loading components (`BoardSkeleton`, `ColumnSkeleton`, `ProjectCardSkeleton`, `CalendarSkeleton`, `MembersSkeleton`, `DiarySkeleton`, `NotesSkeleton`) across mobile, tablet, and desktop viewports to prevent layout shifts (CLS), eliminate overflow, and provide tailored streaming loading states.

## Files Created & Modified
- `src/components/ui/skeleton.tsx`:
  - `ColumnSkeleton`: width made adaptive (`w-[calc(100vw-2.5rem)] max-w-[360px] sm:w-80 shrink-0`) matching real column layout.
  - `BoardSkeleton`: added mobile quick-column jump skeleton pill strip on `sm:hidden`.
  - `ProjectCardSkeleton`: updated cover height to `h-28 sm:h-32` and action bar to `h-8.5` matching real `ProjectCard`.
  - `CalendarSkeleton`: added mobile compact dot indicators (`< sm`) and desktop task bars (`sm+`), plus scroll-safe header controls.
  - `MembersSkeleton`: made metric cards `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` and tabs scroll-safe.
  - Exported `DiarySkeleton` and `NotesSkeleton` for dedicated streaming loading.
- `src/app/(dashboard)/project/[id]/board/loading.tsx`: Made header responsive (`flex-col sm:flex-row`) and hid notes rail on mobile (`hidden xl:flex`).
- `src/app/(dashboard)/projects/loading.tsx`: Aligned section order (`order-1 lg:order-2` on main cards, `order-2 lg:order-1` on aside) so cards appear first on mobile without jumping.
- `src/app/(dashboard)/project/[id]/diary/loading.tsx`: Created dedicated streaming loading UI using `DiarySkeleton`.
- `src/app/(dashboard)/project/[id]/notes/loading.tsx`: Created dedicated streaming loading UI using `NotesSkeleton`.
- `src/components/ui/skeleton-responsive.test.ts`: Added unit tests verifying responsive layout structures and contracts.

## Behavior Changes
- Loading screens now match actual page dimensions, eliminating jarring visual jumps when real data streams in.
- Mobile viewports no longer suffer from horizontal overflow or oversized cover skeletons.

## Verification
- Unit Tests: `npx vitest run src/components/ui/skeleton-responsive.test.ts src/components/kanban/board-responsive.test.ts src/components/kanban/board-switch-skeleton.test.ts` (26 passed).
- Prisma: `npx prisma validate` (passed).
- Lint: `npm run lint` (0 errors, 0 warnings).
- Build: `npm run build` (compiled successfully, 43 static/dynamic routes generated).
