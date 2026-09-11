# Work Session Note: 2026-09-11 - Add Office to Project Sidebar & Gather Roadmap

## Objective
Connect the **Office** module into the project sidebar navigation (`/project/[id]/office`), adapt the Office module layout when project-scoped, integrate the interactive 2D `PixelOffice` visual floor with mode toggling, and establish the development roadmap for a Gather-style virtual office.

## Files Created, Modified, Deleted, or Moved
- **Created**:
  - `src/app/(dashboard)/project/[id]/office/page.tsx`
  - `docs/agent-notes/2026-09-11-add-office-to-sidebar.md`
- **Modified**:
  - `src/components/project/project-nav-link.tsx` (added `Building2` icon to `ICON_MAP`)
  - `src/components/project/project-shell.tsx` (added `office` to `navItems`)
  - `src/components/office/office-module.tsx` (added `isProjectScoped` prop, streamlined layout, and integrated `PixelOffice` virtual floor toggle)
  - `src/components/office/office-module.test.ts` (added tests for sidebar integration and project office page route)

## Important Behavior Changes
- **Project Sidebar Integration**:
  - Users can now click "Office" from any project's sidebar to access `/project/[id]/office`.
  - The Office link features the `Building2` icon, consistent with the Module Selector page.
  - Works with drag-and-drop sortable navigation in `ProjectSortableNav`.
- **Project-Scoped Office Experience**:
  - Automatically verifies authentication and project membership before loading office data.
  - When viewed inside a project shell, redundant outer headers ("Module Hub" and "Switch project") are omitted.
  - Integrated `PixelOffice` 2D pixel canvas with live agent character mapping and a toggle between "🎮 Virtual Floor" and "📊 Dashboard".
  - Clicking on any pixel agent highlights their information and switches directly to conversation/dashboard mode.

## Database / Schema Changes
- None (uses existing `Project`, `ProjectMember`, and Office models: `OfficeAgent`, `OfficeThread`, `OfficeTask`, `OfficeReport`, `OfficeRoutine`, `OfficeAgentDiaryEntry`, `OfficeAgentMemory`, `OfficeAgentSkill`).

## Verification Commands Run & Results
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npx prisma validate`: Passed (Prisma schema is valid).
- `npx vitest run`: Passed (47 test files, 163 tests passed).
- `npm run build`: Passed (clean compilation, `/project/[id]/office` generated statically and dynamically).

## Gather-like Roadmap Follow-ups (Phases 2-5)
- **Phase 2**: WASD / Arrow playable pixel avatar movement with collision boxes and walk animation cycle.
- **Phase 3**: Interactive desks (Kanban, Diary, Notes, Lofi Coffee Lounge) with `[Press E to interact]` proximity actions.
- **Phase 4**: Real project member avatars showing live presence (Focus timer active, Rest mode, Away).
- **Phase 5**: Proximity chat bubbles, quick wave/emotes, and desk sticky notes.
