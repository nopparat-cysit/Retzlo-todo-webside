# 2026-06-20 Topbar Tools Click Fix

## Objective

Fix the project topbar tool buttons not responding when clicked.

## Files Modified

- `src/components/ui/button.tsx`

## Behavior Changes

- The shared `Button` component now forwards its DOM ref to the underlying `<button>`.
- Radix `asChild` triggers such as popover, tooltip, dropdown, and dialog triggers can now attach refs/events to shared buttons correctly.
- This should restore clicking the topbar ambience, focus, phase, and garden tool buttons.

## Design System Impact

- This changes a shared UI primitive used across auth, project, finance, modal, and toolbar flows.
- The change is compatibility-focused and should not alter button appearance.
- It improves integration with Radix primitives that require ref-forwarding child components.

## Database Changes

- None.

## Verification

- `npm run lint` passed with no ESLint warnings or errors.
- `npx prisma validate` passed.
- `npm run build` passed.

## Follow-Ups

- Manually check the four project topbar tool popovers in the browser.
