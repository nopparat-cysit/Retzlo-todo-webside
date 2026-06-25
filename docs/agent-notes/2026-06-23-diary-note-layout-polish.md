# 2026-06-23 Diary and Note layout polish

## Objective

Polish the Diary List and Note Studio UI so dense workspace sections use less unnecessary space and checklist routines are easier to scan.

## Files modified

- `src/components/diary/diary-list-panel.tsx`
- `src/components/diary/diary-list-panel.test.ts`
- `src/components/diary/diary-checklist.tsx`
- `src/components/notes/notes-panel.tsx`
- `src/components/notes/notes-panel.test.ts`

## Behavior changes

- Moved Diary List filters out of the hero panel into an open toolbar row.
- Updated diary checklist editor and preview rows with clearer routine numbering, due-state badges, and tighter spacing.
- Reduced Note Studio hero vertical space by removing the fixed minimum height, shrinking the decorative sticker, and tightening stat cards.
- Added Note board view controls for 2-column grid, 3-column grid, 4-column grid, and list layouts. The board no longer forces the first visible note into a large featured card.
- Locked the Note Studio hero grid track to its content height so the full-height project shell cannot stretch it and leave a large empty area.
- Removed the decorative absolute glow layer from the Note Studio hero because it showed up as a large unnecessary overlay during inspection and added no useful UI behavior.

## Database/schema changes

- None.

## Verification

- `npm test -- src/components/diary/diary-list-panel.test.ts src/components/notes/notes-panel.test.ts` passed.
- `npm test -- src/lib/diary/checklist.test.ts` passed.
- `npm test -- src/components/diary/diary-list-panel.test.ts src/components/notes/notes-panel.test.ts src/lib/diary/checklist.test.ts` passed.
- `npm test -- src/components/notes/notes-panel.test.ts` passed after adding Note board view mode controls.
- `npm test -- src/components/notes/notes-panel.test.ts` initially failed on the new no-glow-layer regression assertion, then passed after removing the decorative layer.
- `npm run lint` passed after replacing an unescaped apostrophe in JSX copy.
- `npx prisma validate` passed.
- `npm run lint` passed after adding Note board view mode controls.
- `npx prisma validate` passed after adding Note board view mode controls.
- `npm run build` blocked before Next build during `prisma generate` with `EPERM` while renaming `node_modules\.prisma\client\query_engine-windows.dll.node.tmp*` to `query_engine-windows.dll.node`.
- `npm test -- src/components/notes/notes-panel.test.ts` initially failed on the new compact-height regression assertion, then passed after the grid-track fix.
- `npm run lint` passed after removing the Note Studio glow layer.
- `npx prisma validate` passed after removing the Note Studio glow layer.
- `npm run build` remains blocked before Next.js build during `prisma generate` with `EPERM` while renaming `node_modules\.prisma\client\query_engine-windows.dll.node.tmp*` to `query_engine-windows.dll.node`.

## Follow-ups

- None currently.
