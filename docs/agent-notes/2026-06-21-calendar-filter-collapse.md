# 2026-06-21 Calendar Filter Collapse

## Objective

Fix the Calendar Filters collapsed state so it actually frees space instead of leaving a large empty panel.

## Files Modified

- `src/components/kanban/project-calendar.tsx`

## Behavior Changes

- Calendar layout now changes its desktop grid width when filters are collapsed.
- Expanded filters use a 280px sidebar; collapsed filters use a compact 64px rail.
- The collapsed rail keeps an accessible toggle button so users can reopen filters quickly.
- Calendar content gains the freed horizontal space when filters are collapsed.

## Database / Schema Changes

- None.

## Verification

- `npm run lint` - passed.
- `npx prisma validate` - passed.
- `npm run build` - passed.

## Follow-ups

- Consider adding a small badge/count on the collapsed rail if users need to know active filter state at a glance.
