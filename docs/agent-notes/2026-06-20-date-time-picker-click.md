# 2026-06-20 Date Time Picker Click

## Objective

Fix custom datepicker and timepicker inputs not opening a native picker when clicked.

## Files Modified

- `src/components/ui/input.tsx`

## Behavior Changes

- The shared `Input` component now forwards refs to the underlying `<input>`.
- Date, time, and datetime-local inputs now call the native `showPicker()` API when the input or custom icon is clicked.
- The custom calendar/clock icon is now a real button instead of a non-interactive decorative icon.
- Disabled or read-only inputs do not attempt to open a picker.

## Design System Impact

- This changes a shared form primitive used across auth, project, kanban, diary, notes, and finance forms.
- Appearance remains aligned with the custom dark RETROD input style.
- Ref forwarding improves compatibility with focus management and future form libraries.

## Database Changes

- None.

## Verification

- `npm run lint` passed with no ESLint warnings or errors.
- `npx prisma validate` passed.
- `npm run build` passed.

## Follow-Ups

- Native picker UI still depends on browser support; browsers without `showPicker()` will focus the input as fallback.
