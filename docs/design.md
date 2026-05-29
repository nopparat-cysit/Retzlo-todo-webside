# Modular Life and Work Management Platform Design

## Overview

The platform is a modular life/work management app. The first module is the Work module, centered around project workspaces. A user logs in, chooses a project, and works inside that project's Todo Board or Calendar.

The experience should feel like a retro lofi indigo workspace: quiet, focused, and slightly nostalgic, while still behaving like a practical Trello/Jira-style tool.

## Goals

- Build a greenfield Next.js app foundation.
- Support email/password authentication with NextAuth Credentials.
- Store users, projects, memberships, invitations, boards, columns, and cards in PostgreSQL through Prisma.
- Protect project data with membership checks.
- Provide a usable Kanban todo board with optimistic drag-and-drop.
- Provide a calendar view that displays cards by due date.
- Keep the architecture ready for future modules.

## Non-Goals For MVP

- Real-time collaboration.
- Push/email notification delivery.
- Billing.
- Chat.
- Automation rules.
- Advanced Jira-style issue types, sprint planning, or reporting.

## Primary User Flow

1. User lands on the app.
2. User registers or logs in.
3. User sees a project selection dashboard.
4. User creates or selects a project.
5. User enters a project workspace.
6. User manages tasks on the Todo Board.
7. User assigns due dates to cards.
8. User opens the Calendar to see dated cards.
9. User invites other members by email.
10. Invited user accepts the invitation and joins the project.

## Application Routes

```text
src/app/(marketing)/page.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(auth)/accept-invitation/page.tsx
src/app/(dashboard)/projects/page.tsx
src/app/(dashboard)/project/[id]/board/page.tsx
src/app/(dashboard)/project/[id]/calendar/page.tsx
src/app/(dashboard)/project/[id]/members/page.tsx
src/app/(dashboard)/project/[id]/settings/page.tsx
```

## API Routes

```text
POST  /api/projects
GET   /api/projects
GET   /api/projects/[id]
POST  /api/projects/[id]/invite
POST  /api/auth/accept-invitation
GET   /api/boards/[boardId]
PATCH /api/columns/reorder
PATCH /api/cards/reorder
```

## Data Model

The Prisma schema uses these core models:

- `User`
- `Project`
- `ProjectMember`
- `Invitation`
- `Board`
- `Column`
- `Card`

The user-provided schema is the baseline. Practical additions are allowed where they improve reliability, such as indexes, timestamps, and cleaner Prisma relations for `Invitation.invitedBy`.

## Authentication

Use NextAuth Credentials with bcrypt:

- Register creates a `User` with a hashed password.
- Login verifies the password against the stored hash.
- Session data includes the user id and email.
- Route handlers use the session user id for authorization.

## Authorization

Project membership is the core multi-tenant boundary.

- Project creation adds the creator as `OWNER`.
- A logged-in user can read or mutate project data only when a matching `ProjectMember` exists.
- Board, column, and card APIs must resolve the associated project before checking membership.
- Invitation creation requires membership in the project.
- Accepting an invitation creates a `ProjectMember` and marks the invitation as `ACCEPTED`.

## Invitation Flow

1. Project member enters an email.
2. API creates an `Invitation` with a secure token.
3. Token expires after 7 days.
4. Accept invitation validates token, status, and expiry.
5. If the email has no account, the UI prompts registration first.
6. After login/register, accepting creates a `ProjectMember`.
7. Invitation status becomes `ACCEPTED`.

Email sending is out of scope for MVP. The invite UI can display the generated acceptance link for local/manual sharing.

## Board Behavior

The board is a list of ordered columns. Each column contains ordered cards.

- Columns use zero-indexed `position`.
- Cards use zero-indexed `position` within a column.
- Board fetch returns columns ordered by `position`.
- Cards inside each column are ordered by `position`.
- Drag-and-drop updates UI optimistically.
- Failed sync rolls back to the previous state or refetches the board.

## Reorder Behavior

Column reorder payload:

```ts
interface ReorderColumnsPayload {
  boardId: string;
  columnIds: string[];
}
```

Card reorder payload:

```ts
interface ReorderCardsPayload {
  cardId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  orderedCardIds: string[];
}
```

For same-column card moves, the destination column equals the source column and every card in `orderedCardIds` receives its new position.

For cross-column moves, the moved card receives the destination column id and all submitted destination card ids receive new positions. The source column is also normalized by the client or refetched after sync so stale positions do not accumulate.

## Calendar Behavior

The Calendar page belongs to a project workspace.

- It displays project cards with a non-null `dueDate`.
- Cards are grouped by day.
- Clicking a card opens or links to the relevant board card details.
- MVP can use a month grid plus an upcoming list to keep dense information readable.

## Frontend State

Shared Kanban types:

```ts
export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  dueDate: string | null;
  columnId: string;
}

export interface ColumnWithCards {
  id: string;
  name: string;
  position: number;
  cards: Card[];
}
```

The board page maintains `columns: ColumnWithCards[]`.

On card drag:

1. Store the previous state.
2. Compute the optimistic next state.
3. Recalculate positions for affected cards.
4. Set React state immediately.
5. Send the reorder request.
6. On failure, restore the previous state or refetch.

Empty destination columns are valid. The moved card becomes the first item with position `0`.

## Visual Design

Mood: retro lofi indigo, late-night solo productivity.

Design characteristics:

- Dark indigo background.
- Slightly softened panel borders.
- Muted accent colors.
- Warm off-white text.
- Compact work surfaces.
- Subtle texture through CSS, not heavy decorative images.
- Clear active project and active view navigation.

## MVP Feature List

- Landing page with product identity.
- Register and login.
- Project list.
- Create project.
- Project workspace shell.
- Board view.
- Create columns.
- Create cards.
- Edit card title, description, and due date.
- Drag cards within a column.
- Drag cards across columns.
- Reorder columns.
- Calendar view for due cards.
- Invite members by email.
- Accept invitation.
- Basic project settings.
- Empty, loading, and error states.

## Testing Strategy

- Unit test reorder helpers before integrating with UI.
- Test invitation token validation rules.
- Test membership authorization helpers.
- Validate Prisma schema.
- Run lint and build before completion.

## Environment Variables

Use `.env.local` for real local values.

```text
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

Do not commit real secret values.
