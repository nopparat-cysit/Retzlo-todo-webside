# 2026-06-22 Note Modal Emoji Layout

## Objective

Fix note create/edit modals so they no longer sit under the project topbar, use a split content/settings layout, and support choosing an emoji.

## Files changed

- Modified `prisma/schema.prisma`
- Modified `src/lib/notes/validation.ts`
- Modified `src/types/note.ts`
- Modified `src/app/api/projects/[id]/notes/route.ts`
- Modified `src/app/api/notes/[noteId]/route.ts`
- Modified `src/app/(dashboard)/project/[id]/notes/page.tsx`
- Modified `src/app/(dashboard)/project/[id]/board/page.tsx`
- Modified `src/app/(dashboard)/hub/notes/page.tsx`
- Modified `src/components/notes/notes-panel.tsx`
- Modified `src/components/notes/board-notes-rail.tsx`
- Modified `src/components/hub/notes-hub-panel.tsx`
- Created `docs/agent-notes/2026-06-22-note-modal-emoji-layout.md`

## Behavior changes

- Note create/edit modals now render through `ModalPortal` with a higher z-index, so the project topbar no longer overlays them.
- Note create/edit modals now use a two-column layout: content on the left and settings on the right.
- Users can choose a note emoji when creating or editing notes.
- Note cards in project notes, board notes rail, and notes hub display the selected emoji.

## Database/schema changes

- Added `Note.emoji` as a required string with default `📝`.

## Verification

- `npx prisma validate` passed.
- `npm run lint` passed.
- `npx prisma generate` passed.
- `npx prisma db push` passed and synced the Neon database schema.
- `npm run build` was interrupted by the user once and was not counted as passing.
- Stopped only the Todo dev server processes and reran `npm run build`; it passed.
- Restarted the dev server and confirmed `http://localhost:3000` returns `200 OK`.

## Follow-ups

- Visually check the note editor modal over the project topbar after logging in.
