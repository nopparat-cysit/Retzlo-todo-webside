# Multi-Board Subprojects & Private Notes Architecture

- **Date:** 2026-09-19
- **Objective:** Implement support for multi-board subprojects per project with granular access control (public vs. private to selected members), board tab switcher on Kanban board, private-by-default note architecture with scope selection (Private, Board, Team), and board-scoped calendar access.

## Files Created, Modified, or Deleted

### Schema & Types
- `prisma/schema.prisma` - Added `isPrivate` to `Board`, added `model BoardMember` with relations to `Board` and `User`, added `boardId` and relation `board` to `model Note`.
- `src/types/note.ts` - Added `boardId` and `board` relation summary to `ProjectNote`.
- `src/types/kanban.ts` - Added `BoardSummary` interface.

### Authorization & Validation
- `src/lib/project-auth.ts` - Implemented `canAccessBoard(board, userId, projectRole)` helper.
- `src/lib/project-auth.test.ts` [NEW] - Unit tests for board-level access control helper.
- `src/lib/notes/validation.ts` - Updated `createNoteSchema`, `updateNoteSchema`, and `parseCreateNotePayload` to support `boardId`.
- `src/lib/notes/validation.test.ts` - Updated test expectations and added tests for `boardId` handling.

### API Routes
- `src/app/api/projects/[id]/boards/route.ts` [NEW] - Endpoint to list accessible boards (`GET`) and create sub-projects with default columns and privacy settings (`POST`).
- `src/app/api/boards/[boardId]/route.ts` [NEW] - Endpoint to get board details (`GET`), update name, toggle privacy, and sync member access (`PATCH`), and delete board with guard preventing deletion of last remaining board (`DELETE`).
- `src/app/api/projects/[id]/notes/route.ts` - Filter notes by board accessibility, author visibility, and optional `boardId` query param.
- `src/app/api/notes/[noteId]/route.ts` - Support updating `boardId` and `isHidden` scope via PATCH.
- `src/app/api/projects/[id]/cards/route.ts` - Filter cards by accessible boards for non-owner members.

### UI Components & Pages
- `src/components/kanban/board-tabs-bar.tsx` [NEW] - Horizontal sub-project lane tabs on the board page with lock icon indicators and quick settings access.
- `src/components/project/project-boards-manager.tsx` [NEW] - Sub-project management panel in Project Settings with board list, privacy badges, member access modal, rename modal, and delete confirm modal.
- `src/app/(dashboard)/project/[id]/settings/page.tsx` - Rendered `ProjectBoardsManager` in Project Settings.
- `src/app/(dashboard)/project/[id]/board/page.tsx` - Resolved active board from `searchParams.boardId` or first accessible board, rendered `BoardTabsBar`, and scoped notes to board.
- `src/components/notes/board-notes-rail.tsx` - Scoped note creation with `ScopeSelector` (Private by default, Board note, Team note), note card scope badges (`Private`, `Board`, `Team`), and modal integration.
- `src/components/notes/notes-panel.tsx` - Note Studio with Board Scope filter dropdown in shelves sidebar, `ScopeSelector` in Note Editor Modal, and note badges.
- `src/app/(dashboard)/project/[id]/notes/page.tsx` - Loaded accessible boards and passed to `NotesPanel`.
- `src/app/(dashboard)/project/[id]/calendar/page.tsx` - Restricted cards and notes queries to accessible boards for non-owners.

## Important Behavior Changes

1. **Sub-projects / Multi-Board:**
   - Projects can have multiple boards (sub-projects/lanes).
   - Boards can be Public (all project members see it) or Private (only project owners and specifically assigned members can see it).
   - In Kanban board page, users can switch between boards via the top tab bar (`?boardId=xxx`).
   - Project owners can manage, rename, add, delete, and configure member access in Project Settings (`/project/[id]/settings`).
   - At least 1 board must always remain in each project (deletion blocked if only 1 board exists).

2. **Note Privacy & Scope ("Private-by-default"):**
   - New notes default to **Private (🔒 โน้ตส่วนตัว)** (`isHidden: true`), visible only to the note creator.
   - Users can optionally choose **Sub-project Board (📌 โน้ตเฉพาะบอร์ด)** or **Entire Project (🌐 โน้ตทั้งโปรเจกต์)**.
   - Note cards clearly indicate their scope badge (`Private`, board name, or `Team`), preventing user confusion about note context.
   - Note Studio includes a Board Scope filter to view notes across all boards, project-wide, or by specific sub-project board.

3. **Calendar Security:**
   - Cards and notes from private boards are excluded from regular members' calendar view unless they are assigned to that board.

## Verification Run & Results

```bash
npx prisma validate  # Passed (Schema valid)
npm test             # Passed (57 test files, 252 tests passing)
npm run lint         # Passed (0 errors, 0 warnings)
npm run build        # Passed (All 30 static and dynamic routes compiled successfully)
```

## Known Follow-ups, Blockers, or Deployment Notes
- None. Database schema changes (`Board.isPrivate`, `BoardMember`, `Note.boardId`) were pushed via `prisma db push` and Prisma client generated.
