# 2026-06-20 Project Card Actions

## Objective

Polish the project card action buttons so the primary project open action and Rewards action feel balanced and aligned.

## Files Modified

- `src/components/project/projects-dashboard.tsx`

## Behavior Changes

- Project cards now render the bottom actions as two equal-width buttons.
- The primary open action keeps the stronger lavender treatment.
- The Rewards action keeps the amber secondary treatment but now matches the same height, width, weight, and centered layout.
- Button labels truncate safely inside narrow cards.

## Database Changes

- None.

## Verification

- `npm run lint` passed with no ESLint warnings or errors.
- `npx prisma validate` passed.
- `npm run build` passed.

## Follow-Ups

- Check responsive card widths in browser if project names/descriptions are unusually long.
