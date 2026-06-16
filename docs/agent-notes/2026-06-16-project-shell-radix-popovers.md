# 2026-06-16 Project Shell Radix Popovers

## Objective

Move project shell profile and topbar tool popovers onto shared Radix UI primitives so panels escape local stacking contexts and behave consistently with the design system.

## Files Modified

- `src/components/project/user-profile-popover.tsx`
- `src/components/project/project-topbar-tools.tsx`

## Behavior Changes

- Replaced the custom profile menu outside-click handler with `DropdownMenu`.
- Kept the Discord-like profile card, avatar, status, email, and logout action.
- Replaced the custom topbar tools absolute panel with `Popover` rendered through a portal.
- Added Radix tooltip behavior for Ambience, Focus, Phase, and Garden icon buttons.
- Preserved the dark retro-lofi surface styling while reducing oversized shadows and rounding.

## Database Changes

- None.

## Verification

- `npx prisma validate` passed.
- `npm run lint` passed with no ESLint warnings or errors.
- `npm run build` timed out in the sandbox after producing `.next` artifacts.
- `.\node_modules\.bin\next.cmd build` passed when run outside the sandbox after direct Next build hit a sandbox path permission issue.
- `.\node_modules\.bin\tsc.cmd --noEmit` reported existing fixture type errors in `src/lib/kanban/reorder.test.ts` for missing `color`, `priority`, and `isStarred` fields.

## Follow-Ups

- Verify visually in the browser once the correct local Todo dev server is available.
- Update the Kanban reorder test fixtures so full-project `tsc --noEmit` can pass outside the Next build flow.
