# 2026-06-20 Custom Date Time Inputs

## Objective

Make native date and time inputs feel aligned with the custom RETROD soft retro UI.

## Files Modified

- `src/components/ui/input.tsx`

## Behavior Changes

- `Input` now detects `type="date"`, `type="time"`, and `type="datetime-local"`.
- Date/time inputs receive extra right padding and a themed lucide icon.
- Native WebKit picker indicators are visually hidden so the custom icon carries the control style.
- Existing form behavior remains native, so browser date/time pickers still work.

## Database Changes

- None.

## Verification

- `npx prisma validate` passed.
- `npm run lint` passed with no ESLint warnings or errors.
- `.\node_modules\.bin\next.cmd build` passed outside the sandbox.

## Follow-Ups

- Migrate native `<select>` elements to shared Radix select or a themed native select wrapper.
