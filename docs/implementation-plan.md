# Work Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable version of the modular platform with auth, project workspaces, invitations, Kanban board, and calendar.

**Architecture:** The app is a greenfield Next.js App Router project using Prisma/PostgreSQL as the data layer and NextAuth Credentials for sessions. Feature boundaries are organized around auth, projects, invitations, boards, and shared UI/state helpers.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth, bcrypt, Vitest.

---

## File Structure

```text
src/app/(marketing)/page.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(auth)/accept-invitation/page.tsx
src/app/(dashboard)/projects/page.tsx
src/app/(dashboard)/project/[id]/layout.tsx
src/app/(dashboard)/project/[id]/board/page.tsx
src/app/(dashboard)/project/[id]/calendar/page.tsx
src/app/(dashboard)/project/[id]/members/page.tsx
src/app/(dashboard)/project/[id]/settings/page.tsx
src/app/api/auth/[...nextauth]/route.ts
src/app/api/auth/register/route.ts
src/app/api/auth/accept-invitation/route.ts
src/app/api/projects/route.ts
src/app/api/projects/[id]/route.ts
src/app/api/projects/[id]/invite/route.ts
src/app/api/boards/[boardId]/route.ts
src/app/api/columns/reorder/route.ts
src/app/api/cards/reorder/route.ts
src/components/kanban/board.tsx
src/components/kanban/card.tsx
src/components/kanban/column.tsx
src/components/project/project-shell.tsx
src/components/ui/button.tsx
src/components/ui/input.tsx
src/components/ui/panel.tsx
src/lib/auth.ts
src/lib/password.ts
src/lib/prisma.ts
src/lib/project-auth.ts
src/lib/kanban/reorder.ts
src/types/kanban.ts
prisma/schema.prisma
```

## Tasks

### Task 1: Scaffold App Foundation

- [ ] Create Next.js app files, TypeScript config, Tailwind config, package scripts, and base layout.
- [ ] Add dependencies: Next.js, React, Prisma, NextAuth, bcryptjs, Tailwind, Vitest, and testing helpers.
- [ ] Add `.env.example` with placeholder values only.
- [ ] Run `npm install`.
- [ ] Run `npm run lint` once scripts exist.

### Task 2: Add Prisma Schema

- [ ] Create `prisma/schema.prisma` from the approved data model.
- [ ] Add indexes for membership and board lookups.
- [ ] Run `npx prisma validate`.
- [ ] Run `npx prisma generate`.

### Task 3: Add Auth Core

- [ ] Implement `src/lib/prisma.ts`.
- [ ] Implement `src/lib/password.ts` with bcrypt hash and verify helpers.
- [ ] Implement `src/lib/auth.ts` with NextAuth Credentials config.
- [ ] Add register API.
- [ ] Add NextAuth route.
- [ ] Add login and register pages.

### Task 4: Add Project Workspace APIs

- [ ] Implement `POST /api/projects`.
- [ ] Implement `GET /api/projects`.
- [ ] Implement `GET /api/projects/[id]`.
- [ ] Project creation must create an owner membership and a default board with default columns.
- [ ] Add membership helper in `src/lib/project-auth.ts`.

### Task 5: Add Invitation APIs

- [ ] Implement secure token generation.
- [ ] Implement `POST /api/projects/[id]/invite`.
- [ ] Implement `POST /api/auth/accept-invitation`.
- [ ] Handle expired, accepted, invalid, and account-required states.

### Task 6: Add Board Read API

- [ ] Implement `GET /api/boards/[boardId]`.
- [ ] Include ordered columns and ordered cards.
- [ ] Check membership through the board's project.

### Task 7: Add Reorder Logic With Tests

- [ ] Write failing tests for same-column card moves.
- [ ] Write failing tests for cross-column card moves.
- [ ] Write failing tests for moving into an empty column.
- [ ] Implement pure reorder helpers in `src/lib/kanban/reorder.ts`.
- [ ] Run the tests and keep them green.

### Task 8: Add Reorder APIs

- [ ] Implement `PATCH /api/columns/reorder`.
- [ ] Implement `PATCH /api/cards/reorder`.
- [ ] Use Prisma transactions for bulk position updates.
- [ ] Check project membership before mutation.

### Task 9: Add Project Dashboard UI

- [ ] Build project selection page.
- [ ] Add project creation form.
- [ ] Link each project to its board.
- [ ] Add empty, loading, and error states.

### Task 10: Add Project Shell

- [ ] Build project layout with navigation tabs.
- [ ] Add links for Board, Calendar, Members, and Settings.
- [ ] Preserve retro lofi indigo theme across workspace pages.

### Task 11: Add Kanban UI

- [ ] Build board, column, and card components.
- [ ] Load board data from API.
- [ ] Add create column and create card actions.
- [ ] Add edit card fields for title, description, and due date.
- [ ] Wire drag-and-drop to optimistic state updates and reorder APIs.

### Task 12: Add Calendar UI

- [ ] Load project cards with due dates.
- [ ] Group cards by date.
- [ ] Show month-style date sections and an upcoming list.
- [ ] Link cards back to the board context.

### Task 13: Add Members and Settings UI

- [ ] Build invite form.
- [ ] Display generated invite link after invite creation.
- [ ] Build basic member list.
- [ ] Build project name and description settings.

### Task 14: Final Verification

- [ ] Run `npx prisma validate`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run focused tests.
- [ ] Start local dev server.
- [ ] Open the app in browser and verify login, project creation, board, calendar, invite, and accept invitation flows.
