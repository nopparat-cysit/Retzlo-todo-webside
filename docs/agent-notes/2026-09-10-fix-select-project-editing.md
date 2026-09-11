# 2026-09-10 Fix Select Project Editing

## Objective
Fix project editing on the Select Project dashboard (`/projects`), ensuring `ConfirmModal` is displayed on save, protecting unsaved form inputs from accidental modal closure, sending the complete payload (including cover image), providing optimistic updates, and adding regression tests.

## Changed Files
- `src/components/project/projects-dashboard.tsx`
- `src/components/project/projects-dashboard.test.ts`
- `docs/agent-notes/2026-09-10-fix-select-project-editing.md`

## Behavior & Improvements
- **ConfirmModal Restoration**:
  - Rendered `<ConfirmModal>` inside `EditProjectModal` wired to `confirmSaveOpen`, `onConfirm={handleSave}`, and `onClose={() => setConfirmSaveOpen(false)}`.
  - Clicking "Save changes" now properly triggers the confirmation dialog and executes `handleSave()` upon confirmation.
- **Accidental Closure Protection**:
  - Added dirty detection (`isDirty`) comparing current form state (`name`, `description`, `coverPreview`, `themeColor`, `sticker`) to initial values.
  - Passed `hasUnsavedChanges={isDirty}` to `AppModal` so backdrop clicks or ESC key prompt before discarding changes.
- **Payload Completeness**:
  - Ensured `coverImage: coverPreview` is included in the PATCH body to `/api/projects/${project.id}`.
- **Optimistic State Updates**:
  - Managed `projectList` locally in `ProjectsDashboard` so edited and deleted projects reflect immediately in the UI alongside `router.refresh()`.
- **Automated Regression Tests**:
  - Added unit tests in `src/components/project/projects-dashboard.test.ts` verifying modal rendering, dirty state contract, and optimistic callback support.

## Verification
- `npx vitest run src/components/project/projects-dashboard.test.ts`: Passed (5/5 tests).
- `npx vitest run`: Passed (42/42 files, 140/140 tests).
- `npx prisma validate`: Passed.
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm run build`: Verified production build.
