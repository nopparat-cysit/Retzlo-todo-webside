# 2026-06-22 Note Completed Filter

## Objective

Add a completed/archive state for project notes so users can mark notes as done, remove them from active note lists, and view or restore them from a Completed filter.

## Files Modified

- `prisma/schema.prisma`
- `src/types/note.ts`
- `src/lib/notes/validation.ts`
- `src/lib/notes/validation.test.ts`
- `src/app/api/notes/[noteId]/route.ts`
- `src/app/api/projects/[id]/notes/route.ts`
- `src/app/api/hub/notes/route.ts`
- `src/app/(dashboard)/project/[id]/notes/page.tsx`
- `src/app/(dashboard)/project/[id]/board/page.tsx`
- `src/app/(dashboard)/project/[id]/calendar/page.tsx`
- `src/app/(dashboard)/hub/notes/page.tsx`
- `src/components/notes/notes-panel.tsx`
- `src/components/notes/board-notes-rail.tsx`
- `src/components/hub/notes-hub-panel.tsx`
- `src/components/hub/fab-hub.tsx`

## Behavior Changes

- Notes now have `completedAt`.
- `PATCH /api/notes/[noteId]` accepts `isCompleted: true | false`.
- Active/default note filters hide completed notes.
- Completed filters show completed notes and allow restore when the user can manage the note.
- Project Notes, Board Notes Rail, Notes Hub, and FAB display logic understand completed notes.
- Calendar due-note view excludes completed notes.
- `isHidden` remains separate from completed state and still controls member visibility.

## Database Changes

- Added `Note.completedAt DateTime?`.
- Added `@@index([projectId, completedAt])`.
- Ran `npx prisma db push` successfully; command exited with code 0 and no output.

## Verification

- `npm test -- src/lib/notes/validation.test.ts` failed first because `isCompleted` was not accepted or rejected correctly.
- `npm test -- src/lib/notes/validation.test.ts` passed after implementation.
- `npx prisma validate` passed.
- `npx prisma generate` passed.
- `npx prisma db push` passed with exit code 0 and no output.
- `npm run lint` passed with no ESLint warnings or errors.
- `npm run build` passed.
- `Invoke-WebRequest http://localhost:3000 -UseBasicParsing` returned a Next dev 500 after build with a stale `.next` webpack cache error. Restarting the local dev server was not completed because process inspection escalation was rejected by the environment.

## Follow-ups

- Manual browser check is still useful for button placement in dense note cards.
- If the local browser still shows a dev 500, restart `npm run dev` so Next rebuilds the development cache.
- No reward or coin behavior is attached to note completion in this change.
