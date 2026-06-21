# 2026-06-21 - Project settings two column layout

## Objective

Split the project settings page into clearer halves so project information and project controls have their own full-width sections.

## Files Modified

- `src/app/(dashboard)/project/[id]/settings/page.tsx`
- `src/components/project/settings-form.tsx`

## Behavior Changes

- Removed the narrow max-width constraint from the settings page panels.
- Split the main settings form into two equal desktop columns:
  - Project information: cover, name, and description.
  - Project controls: member privacy setting and danger zone.
- Mobile remains stacked in a single column.

## Database Changes

- None.

## Verification

- `npm run lint` passed.

## Follow-ups

- None.
