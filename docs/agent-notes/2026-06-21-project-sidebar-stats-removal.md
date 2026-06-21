# 2026-06-21 - Project sidebar stats removal

## Objective

Remove the Projects, Boards, and Members stat tiles from the projects page sidebar.

## Files Modified

- `src/components/project/projects-dashboard.tsx`

## Behavior Changes

- The projects sidebar no longer shows the three summary stat cards below the project selector.
- The rewards link now moves up to fill the removed space.

## Database Changes

- None.

## Verification

- `npm run lint` passed.

## Follow-ups

- None.
