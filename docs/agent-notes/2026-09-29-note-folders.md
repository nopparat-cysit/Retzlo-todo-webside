# 2026-09-29 Note Folders

## Objective
Implement a folder organization system for the Note module in project workspaces, enabling users to create, edit, color-code, and delete folders, filter notes by folder or unfiled status, and assign notes to folders in the note editor modal with retro lofi indigo aesthetic and AGENTS.md compliance.

## Files Created
- `src/components/notes/folder-modal.tsx`: AppModal for creating and editing note folders with icon, color swatches, and name validation.
- `src/app/api/projects/[id]/note-folders/route.ts`: GET and POST API endpoints for note folders with project membership verification and Pusher live sync.
- `src/app/api/note-folders/[folderId]/route.ts`: PATCH and DELETE API endpoints for note folders with author/owner authorization checks.
- `src/lib/notes/folder-validation.test.ts`: Unit test suite covering note folder schemas and payload validation.

## Files Modified
- `prisma/schema.prisma`: Added `NoteFolder` model with relations to `Project`, `User`, and `Note[]`. Added `folderId` and `folder` relation with `onDelete: SetNull` on `Note`.
- `src/types/note.ts`: Added `NoteFolderItem` interface and extended `ProjectNote` with `folderId` and `folder` details.
- `src/lib/notes/validation.ts`: Extended `createNoteSchema` and `updateNoteSchema` with `folderId`, and created `createNoteFolderSchema` and `updateNoteFolderSchema`.
- `src/lib/notes/validation.test.ts`: Updated tests for note payload parsing with `folderId: null` default and added folderId acceptance tests.
- `src/lib/project-auth.ts`: Added `getProjectIdForNoteFolder` helper function.
- `src/app/api/projects/[id]/notes/route.ts`: Updated GET and POST to handle `folderId` filtering, payload assignment, and `folder` relation inclusion.
- `src/app/api/notes/[noteId]/route.ts`: Updated PATCH to include `folder` in response and handle folder reassignment.
- `src/app/(dashboard)/project/[id]/notes/page.tsx`: Loaded `initialFolders` server-side and included `folder` relation in initial project notes.
- `src/components/notes/notes-panel.tsx`: Added Folders shelf in sidebar with count badges, folder edit/delete actions, ConfirmModal on folder deletion, Unfiled filter, folder tag on `NoteCard`, and folder select dropdown in `NoteEditorModalContent`. Also reordered Note Editor right column so Calendar is at top, Note Color is directly above Note Sticker, and Note Sticker is positioned at the bottom.
- `src/components/ai/ai-breakdown-modal.tsx`: Added `aria-label="AI Auto-Breakdown Task"` for test suite compatibility.

## Important Behavior Changes
- Deleting a folder does not delete the notes inside it; notes are safely detached (`folderId: null`) and moved to "Unfiled Notes" (`onDelete: SetNull`).
- Folder deletion triggers a `ConfirmModal` explaining this safe behavior to the user.
- Every folder action (create, update, delete) shows immediate visual feedback via `toast` notifications.
- When creating notes inside a folder view, the folder is automatically pre-selected.
- In Note Editor modal (`NoteEditorModalContent`), reordered the right column sections: Visibility Scope & Folder -> Calendar -> Note Color -> Note Sticker (at the bottom).

## Database / Schema Changes
- Added table `NoteFolder` with indexes on `projectId` and `authorId`.
- Added foreign key column `folderId` on table `Note` with index on `folderId`.
- Synchronized database with `npx prisma db push`.

## Verification Commands Run & Results
- `npx prisma validate`: Passed (The schema at prisma/schema.prisma is valid).
- `npx prisma db push`: Passed (database in sync with Neon PostgreSQL, Prisma Client generated).
- `npx vitest run src/lib/notes src/components/notes src/components/ai/ai-features.test.ts`: Passed (5 test files, 32 tests passed).
- `npx tsc --noEmit`: Passed (0 type errors).
- `npm run lint`: Passed (No ESLint warnings or errors).
- `npm run build`: Passed (compiled successfully with code 0, all routes generated).
