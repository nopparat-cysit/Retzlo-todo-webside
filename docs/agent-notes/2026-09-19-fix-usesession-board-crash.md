# Work Session: 2026-09-19 - Fix useSession Runtime Crash on Board Page

## Objective
Fix runtime `TypeError: Cannot destructure property 'data' of '(0 , f.useSession)(...)' as it is undefined` that caused the board page (`/project/[id]/board`) to crash with the error message "ไม่สามารถแสดงผลกระดานหรือข้อมูลได้".

## Root Cause
In `KanbanBoard` (`src/components/kanban/board.tsx`) and `CardModal` (`src/components/kanban/card-modal.tsx`), `useSession` from `next-auth/react` was called without a wrapping `<SessionProvider />` in the layout tree. In NextAuth App Router without a client `SessionProvider`, `useSession()` returns undefined, causing an immediate crash when destructuring `{ data: session }`.

## Files Modified
- `src/components/kanban/board.tsx`:
  - Removed `import { useSession } from "next-auth/react";`.
  - Replaced `const { data: session } = useSession(); const currentUserId = session?.user?.id;` with accepting `currentUserId` as a direct prop.
- `src/components/kanban/card-modal.tsx`:
  - Removed `import { useSession } from "next-auth/react";` and redundant `useSession()` call.
  - Retained `activeUserId` populated reliably from `/api/profile`.
- `src/app/(dashboard)/project/[id]/board/page.tsx`:
  - Passed `currentUserId={userId}` directly from server component into `KanbanBoard`.

## Verification Commands & Results
- `npm test`: Passed (59 test files, 266 tests).
- `npm run lint`: Passed (0 ESLint warnings or errors).
- `npm run build`: Passed (30/30 pages compiled successfully).
