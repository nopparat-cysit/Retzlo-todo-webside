# 2026-09-11 - System Bug Fixes & UX Polish

## Objective

Fix interaction bugs, modal traps (double ConfirmModal overlays on ESC / close button), navigation dead-ends/loops (BackButton bouncing back to /login, missing profile & module switch links in user menu), unlinked members route, missing delete confirmation guards, missing toast notifications on CUD operations, touch handle visibility, and hydration mismatches.

## Files changed

- Modified `src/components/ui/app-modal.tsx`
- Modified `src/components/kanban/card-modal.tsx`
- Modified `src/components/ui/back-button.tsx`
- Modified `src/components/project/user-profile-popover.tsx`
- Modified `src/components/project/project-shell.tsx`
- Modified `src/app/(dashboard)/project/[id]/members/page.tsx`
- Modified `src/components/project/invite-form.tsx`
- Modified `src/components/notes/notes-panel.tsx`
- Modified `src/components/notes/board-notes-rail.tsx`
- Modified `src/components/project/project-sortable-nav.tsx`
- Modified `src/components/project/project-sidebar-greeting.tsx`

## Behavior changes

- **Modal Trap & Double Overlay Fixed**: In `AppModal`, exported `AppModalContext` and `useAppModal()` to allow inner buttons (X close button, cancel button) to request modal close without duplicating `ConfirmModal` state. In `CardModal`, removed duplicated `showConfirmClose` state and duplicate `<ConfirmModal>` overlay, and removed uncoordinated `window.addEventListener("keydown", Escape)` listener.
- **Back Button Login Bounce Loop Resolved**: `BackButton` checks if the referrer came from an authentication flow (`/login`, `/register`, `/forgot-password`, `/reset-password`) or external domain; if so, it falls back to contextual authenticated destinations (`/projects`, `/select-module`, `/profile`, `/finance`) instead of trapping users back on the login screen.
- **User Profile Navigation Restored**: Added direct links to "Profile Settings" (`/profile`) and "Switch Module" (`/select-module`) inside `UserProfilePopover` above the "Log out" action.
- **Members Route Re-enabled & Guarded**: Re-added `members` to the project navigation items list in `project-shell.tsx`. Added server-side authentication (`requireUserId`), project membership check (`getProjectMembership`), and retro Lo-Fi aesthetic styling to `src/app/(dashboard)/project/[id]/members/page.tsx`.
- **Copy Link with Visual Feedback**: Updated `invite-form.tsx` with a single-click copy-to-clipboard button with `Check`/`Copy` icon state and `useToast` feedback.
- **Delete Confirmation Guards & Toast Feedback for Notes**: Added `ConfirmModal` before deleting notes in both `notes-panel.tsx` and `board-notes-rail.tsx`. Added `useToast` feedback for all CUD operations (create note, save note, delete note, toggle star/complete/hidden).
- **Mobile Touch Drag Visibility**: In `project-sortable-nav.tsx`, adjusted sort grip button opacity (`opacity-60 md:opacity-0 md:group-hover/sort:opacity-100`) so touch devices can see and use the reorder handle.
- **Hydration Mismatch Guard**: In `project-sidebar-greeting.tsx`, guarded greeting rendering against SSR client/server timezone differences with mounted state and `suppressHydrationWarning`.

## Database/schema changes

- None.

## Verification

- `npx vitest run` passed (42 test files, 140 tests passed).
- `npx prisma validate` passed (schema is valid).
- `npm run lint` passed (0 warnings, 0 errors).
- `npm run build` passed (50 static/dynamic routes compiled successfully).

## Follow-ups

- None. All requested bug fixes, modal conflict resolutions, and UX enhancements are verified and complete.
