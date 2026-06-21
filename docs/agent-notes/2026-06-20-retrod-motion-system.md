# 2026-06-20 Retrod Motion System

## Objective

Analyze the existing UI motion patterns and add subtle shared animations that fit the Modern Soft Retro / lofi indigo workspace direction.

## Files Modified

- `src/app/globals.css`
- `src/components/ui/button.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/lofi-panel.tsx`
- `src/components/ui/popover.tsx`
- `src/components/ui/select.tsx`

## Behavior Changes

- Added shared Retrod motion primitives for interactive controls, panels, floating menus, and dialogs.
- Buttons now get a small hover lift through the shared motion utility.
- Lofi panels fade and rise softly when mounted.
- Dropdown menus, popovers, and select menus open with a short fade/scale motion.
- Dialog overlays and content now use project-owned motion classes instead of relying on generic animate-in/out classes.
- Reduced motion preferences disable the new animations and hover transform.

## Design System Impact

- This changes shared UI primitives, so the motion appears across auth screens, dashboard panels, finance views, project views, settings-style panels, dialogs, dropdowns, popovers, and selects that use these components.
- The effect is intentionally small to avoid making dense productivity screens feel busy.

## Database Changes

- None.

## Verification

- `npx prisma validate` passed.
- `npm run lint` passed with no ESLint warnings or errors.
- First `npm run build` attempt failed during `prisma generate` with `EPERM` because running Next dev server processes were holding the Prisma query engine DLL.
- Stopped the repo-specific Next dev server processes, then reran `npm run build`; the second build passed.

## Follow-Ups

- Review the app in browser after the next dev-server run to tune motion timing if any dense list feels too active.
