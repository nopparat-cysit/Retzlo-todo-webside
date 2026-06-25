# Board card delete modal

**Date:** 2026-06-24  
**Objective:** Fix the Board card delete confirmation appearing below/clipped by the board and reopening the edit modal during interaction.

## Files changed

- `src/components/ui/confirm-modal.tsx`
- `src/components/ui/confirm-modal.test.ts`

## Behavior changes

- Confirmation dialogs now render through the shared body portal, outside sortable card transforms and column overflow containers.
- Pointer, click, and keyboard events are isolated at the dialog boundary so they cannot trigger the underlying Kanban card or DnD listeners.
- The confirmation layer now sits above card editor dialogs and supports viewport scrolling on short screens.

## Shared design-system impact

`ConfirmModal` is a shared component. Project, project settings, Kanban card, note, and other delete confirmations using it now receive the same viewport-level layering and event isolation. Visual tokens and action behavior are unchanged.

## Database/schema changes

- None.

## Verification

- `npm test -- src/components/ui/confirm-modal.test.ts` - passed (2 tests).
- `npm test -- src/components/ui/confirm-modal.test.ts src/components/kanban/project-calendar.test.ts` - passed (6 tests).
- `npm run lint` - passed with no warnings or errors.
- `npx prisma validate` - passed.
- `npm run build` - first attempt failed because running Next.js dev processes locked Prisma's Windows query engine DLL; after stopping only this project's dev processes, the rerun passed.
- Browser smoke check at `http://localhost:3000` - app loaded; authenticated Board deletion could not be exercised because the browser session was signed out.
- Dev server restarted after the production build; `http://localhost:3000` returned HTTP 200.

## Follow-up

- None known. Run the standard lint/build/Prisma checks before completion.
