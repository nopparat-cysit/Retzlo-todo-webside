# Agent Note: Fix Modal Closing Behavior Upon Save and Creation

- **Date**: 2026-09-11
- **Objective**: Fix modal closing behavior across Kanban cards, project notes, board notes rail, and diary panels where pressing the Save button or creating an item failed to close the modal or immediately re-opened an edit modal.

## Files Created, Modified, Deleted, or Moved

### Modified
- `src/components/kanban/card.tsx`: Unnested `<CardModal>` and `<ConfirmModal>` from the `<article onClick={() => setIsEditing(true)}>` container by wrapping in a React Fragment (`<> <article>...</article> <CardModal ... /> <ConfirmModal ... /> </>`).
- `src/components/notes/notes-panel.tsx`:
  - Removed `setSelectedNote(note)` in `createNote` to prevent auto-opening the edit modal right after creating a note.
  - Added `setSelectedNote(null)` to `NoteEditorModal.onSubmit` so saving note edits closes the modal.
  - Updated `NoteEditorModal.handleSubmit` to be async and call `onClose()` upon submit completion.
- `src/components/notes/board-notes-rail.tsx`:
  - Removed `setSelectedNote(note)` in `createNote` to avoid auto-opening edit modal upon creation.
  - Added `setSelectedNote(null)` to `EditNoteModal.onSubmit` so saving edits in the board rail closes the modal.
- `src/components/diary/diary-list-panel.tsx`:
  - Removed `setSelectedItem(item)` in `createItem` to prevent auto-opening edit modal upon diary item creation.
- `src/components/project/projects-dashboard.tsx`:
  - Added `onClose()` in `CreateProjectModal` upon successful project creation.
- `src/components/kanban/card-interaction.test.tsx`:
  - Added regression test checking that `CardModal` and `ConfirmModal` are unnested from `<article>`.
- `src/components/notes/note-modals.test.tsx`:
  - Added regression tests checking that newly created notes are not auto-selected and that note edit modals close on save.

## Important Behavior Changes

1. **Kanban Card Modal**:
   - In React 18, synthetic events inside Portals bubble up through the JSX component tree hierarchy. Previously, `<CardModal>` was nested inside `<article onClick={() => setIsEditing(true)}>`<. Clicking 'Save card' bubbled to `<article>`, immediately resetting `isEditing` back to `true` right after `saveCard` set it to `false`. Moving `<CardModal>` outside `<article>` into a React Fragment completely eliminates this synthetic bubbling re-open glitch.
2. **Notes Modals (Studio & Board Rail)**:
   - Creating a note previously set `setSelectedNote(note)`<, which immediately opened the Edit Note modal right after the create modal closed. This gave the impression that the modal never closed. Creating a note now closes the modal and keeps the note in the list without opening an edit modal.
   - Editing a note previously updated the note without resetting `selectedNote`, leaving the modal open indefinitely after save. Saving now resets `selectedNote` to `null` and invokes `onClose()`.
3. **Diary Modal**:
   - Creating a diary item previously called `setSelectedItem(item)`, which opened the edit modal right after creation. This has been removed so creation cleanly closes the dialog.
4. **Project Creation Modal**:
   - Modal now unmounts cleanly (`onClose()`) upon project creation before route transition.

## Database/Schema Changes
- None (schema unchanged).

## Verification Commands Run & Results

- `npx vitest run`: Passed (161/161 across 47 test files)
- `npm run lint`: Passed (0 warnings, 0 errors)
- `npx prisma validate`: Passed (schema is valid)
- `npm run build`: Passed (all 50 routes compiled and generated successfully)

## Known Follow-ups, Blockers, or Deployment Notes
- None. All changes strictly adhere to existing styling and interaction guidelines.
