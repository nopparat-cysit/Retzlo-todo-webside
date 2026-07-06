# 2026-07-05 - Design system stabilization

## Objective

Stabilize the RETROD design system foundation and migrate key Work module surfaces toward shared UI primitives before adding more features.

## Files Changed

- Pre-existing uncommitted workspace changes were observed before this work in `next.config.mjs`, `src/components/modules/module-selector.tsx`, `src/components/vital/vital-hub.tsx`, `src/app/(dashboard)/hub/page.tsx`, and architecture export files. They were not reverted.
- Added shared UI primitives: `src/components/ui/date-time-field.tsx`, `src/components/ui/entity-card.tsx`, `src/components/ui/filter-select.tsx`, `src/components/ui/page-shell.tsx`, `src/components/ui/segmented-control.tsx`, `src/components/ui/state.tsx`, `src/components/ui/toolbar.tsx`.
- Added shared helpers and tests: `src/lib/theme/ui-variants.ts`, `src/lib/theme/ui-variants.test.ts`, `src/lib/safe-db.ts`, `src/lib/safe-db.test.ts`.
- Updated deterministic date formatting and tests: `src/lib/date-format.ts`, `src/lib/date-format.test.ts`.
- Updated test fixtures for current kanban/calendar contracts: `src/lib/calendar/view.test.ts`, `src/lib/kanban/reorder.test.ts`.
- Migrated feature UI away from native selects in projects, calendar, notes, diary hub, FAB hub, and rewards store.
- Added database outage fallback handling to project pages and project shell.
- Updated `src/app/globals.css` with shared radius/shadow/state tokens and removed the duplicate early `.lofi-panel` definition.

## Behavior Changes

- Project, notes, diary, calendar, and rewards filters now use the shared Radix-based `FilterSelect`.
- Card/date forms can use the shared `DateTimeField` with stable quick shortcuts.
- Shared `EntityCard` and tone mappings provide a consistent base for project/card-like surfaces.
- Date labels use deterministic `Asia/Bangkok` formatting helpers and no longer emit mojibake separators.
- Prisma connection failures on project-scoped server pages render an app error state instead of the Next.js red runtime screen.

## Database Changes

- No schema or migration changes.

## Verification

- `npm test -- src/lib/date-format.test.ts src/lib/theme/ui-variants.test.ts src/lib/safe-db.test.ts src/lib/calendar/view.test.ts src/lib/kanban/reorder.test.ts` - passed.
- `.\node_modules\.bin\tsc.cmd --noEmit` - passed.
- `npm run lint` - passed.
- `npm run build` - passed.
- `npx prisma validate` - passed.

## Follow-ups

- Finance/profile pages still contain direct `toLocaleDateString` calls and should move to `src/lib/date-format.ts` in the next sweep.
- More feature surfaces can migrate from bespoke panels into `EntityCard`, `Toolbar`, and `PageShell` incrementally.
