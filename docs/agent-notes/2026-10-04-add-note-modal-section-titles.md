# 2026-10-04 — Add Section Titles for Note Title and Description in Note Modals

## Objective
Address user request: "note ใส่ title ให้ด้วย ส่วน title and description" — Add explicit, styled section titles/labels for both the "Title" and "Description" fields in the Note creation and editing modals, matching the section title style of the right-hand column (Folder, Visibility Scope, Due Date, Note Color).

## Changes Made
- **`src/components/notes/board-notes-rail.tsx`:**
  - Added `<label htmlFor="rail-create-note-title" className="block font-medium text-xs text-stone-400 uppercase tracking-wider">Title (หัวข้อโน้ต) <span className="text-rose-500">*</span></label>` above the sticker + title input in `NoteModal`.
  - Added `<label htmlFor="rail-create-note-content" className="block font-medium text-xs text-stone-400 uppercase tracking-wider">Description (รายละเอียดโน้ต)</label>` above the textarea in `NoteModal`.
  - Added corresponding labels in `EditNoteModal` (`rail-edit-note-title` and `rail-edit-note-content`).
- **`src/components/notes/notes-panel.tsx`:**
  - Added corresponding labels in `NoteEditorModalContent` (`panel-note-title` and `panel-note-content`).
- **`src/components/notes/note-modals.test.ts`:**
  - Added unit test asserting explicit presence of `Title (หัวข้อโน้ต)` and `Description (รายละเอียดโน้ต)` labels and their corresponding `htmlFor` attributes across all note modals.

## Verification
- `npx vitest run`: Passed 88/88 test files (450 tests passed, 3 skipped).
- `npx prisma validate`: Valid.
- `npm run lint`: 0 warnings, 0 errors.
- `npm run build`: Production build succeeded.
