# 2026-06-20 Card Modal Two Column

## Objective

Redesign the create/edit card modal into a two-column layout with content on the left and settings on the right.

## Files Modified

- `src/components/kanban/card-modal.tsx`

## Behavior Changes

- The card modal is wider on desktop.
- Desktop layout now uses a two-column grid with an approximate 3:2 ratio.
- The left content column contains title, description, and checklist.
- The right settings column contains status, priority, color, due date, coin rewards, and stickers.
- Mobile remains a single-column stacked layout.

## Database Changes

- None.

## Verification

- `npm run lint` passed with no ESLint warnings or errors.
- `npx prisma validate` passed.
- `npm run build` passed.

## Follow-Ups

- Review the layout in browser with long descriptions and many checklist items to tune max height or sticky behavior if needed.
