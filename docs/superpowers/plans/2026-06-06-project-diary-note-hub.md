# Project Diary Note Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a project-scoped quick hub for recurring diary lists and notes with owner/member visibility permissions.

**Architecture:** Add small Prisma fields/models, permission helpers, project-scoped API routes, and focused client components. Keep notes on the existing `Note` model and add a dedicated `DiaryItem` model for recurring work.

**Tech Stack:** Next.js App Router, Prisma, PostgreSQL, TypeScript, Zod, Tailwind CSS.

---

## File Map

- Modify `prisma/schema.prisma`: add `Project.type`, `Project.allowMemberPrivateItems`, `Note.isHidden`, and `DiaryItem`.
- Create `src/lib/diary/recurrence.ts`: pure date recurrence helper.
- Create `src/lib/diary/validation.ts`: Zod create/update parsing.
- Create `src/types/diary-item.ts`: client-facing diary item type.
- Modify `src/lib/project-auth.ts`: add note and diary permission helpers.
- Modify `src/app/api/projects/route.ts`: accept project type.
- Create `src/app/api/projects/[id]/settings/route.ts`: owner project settings API.
- Create `src/app/api/projects/[id]/diary-items/route.ts`: list/create diary items.
- Create `src/app/api/diary-items/[diaryItemId]/route.ts`: update/delete diary items.
- Modify `src/app/api/projects/[id]/notes/route.ts`: filter hidden notes.
- Modify `src/app/api/notes/[noteId]/route.ts`: ownership-aware update/delete.
- Modify `src/app/(dashboard)/project/[id]/diary/page.tsx`: render diary items due for selected date.
- Modify `src/app/(dashboard)/project/[id]/notes/page.tsx`: pass current user and project settings.
- Create `src/components/project/project-quick-hub.tsx`: fixed round quick hub.
- Create `src/components/diary/diary-list-panel.tsx`: recurring diary list UI.
- Modify `src/components/project/project-shell.tsx`: render quick hub.
- Modify `src/components/project/projects-dashboard.tsx`: add project mode selector.
- Modify `src/types/note.ts`: add `isHidden` and permission fields.

---

### Task 1: Schema

- [ ] **Step 1: Update Prisma schema**

Add these fields to existing models:

```prisma
model Project {
  id                       String          @id @default(uuid())
  name                     String
  description              String?
  type                     String          @default("WORK")
  allowMemberPrivateItems  Boolean         @default(false)
  coverImage               String?
  coinName                 String          @default("Project Coin")
  coinSymbol               String          @default("ðŸª™")
  createdAt                DateTime        @default(now())
  updatedAt                DateTime        @updatedAt
  members                  ProjectMember[]
  boards                   Board[]
  invitations              Invitation[]
  notes                    Note[]
  diaryItems               DiaryItem[]
  rewards                  Reward[]
  cassettes                Cassette[]
}
```

```prisma
model Note {
  id            String   @id @default(uuid())
  title         String
  content       String
  color         String   @default("DEFAULT")
  isStarred     Boolean  @default(false)
  isHidden      Boolean  @default(false)
  dueDate       DateTime?
  dueDateAllDay Boolean  @default(false)
  projectId     String
  authorId      String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  author        User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([projectId, updatedAt])
  @@index([projectId, dueDate])
  @@index([projectId, isHidden])
  @@index([authorId])
}
```

Create `DiaryItem`:

```prisma
model DiaryItem {
  id           String   @id @default(uuid())
  title        String
  description  String?
  color        String   @default("DEFAULT")
  intervalDays Int
  startDate    DateTime
  isHidden     Boolean  @default(false)
  projectId    String
  authorId     String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  author       User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([projectId, startDate])
  @@index([projectId, isHidden])
  @@index([authorId])
}
```

- [ ] **Step 2: Validate schema**

Run: `npx prisma validate`

Expected: Prisma schema validates successfully.

---

### Task 2: Pure Diary Helpers

- [ ] **Step 1: Create recurrence helper**

Create `src/lib/diary/recurrence.ts`:

```ts
function toUtcDay(value: string | Date) {
  const date = typeof value === "string" ? new Date(`${value.slice(0, 10)}T00:00:00.000Z`) : value;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function isDiaryItemDueOnDate(startDate: string | Date, selectedDate: string | Date, intervalDays: number) {
  if (!Number.isInteger(intervalDays) || intervalDays < 1 || intervalDays > 365) {
    return false;
  }

  const start = toUtcDay(startDate);
  const selected = toUtcDay(selectedDate);
  const diffDays = Math.floor((selected - start) / 86_400_000);

  return diffDays >= 0 && diffDays % intervalDays === 0;
}
```

- [ ] **Step 2: Create validation**

Create `src/lib/diary/validation.ts`:

```ts
import { z } from "zod";

import { cardColorValues } from "@/lib/theme/card-colors";

export const createDiaryItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.preprocess((value) => value ?? "", z.string().trim().max(5000)),
  color: z.enum(cardColorValues).default("DEFAULT"),
  intervalDays: z.coerce.number().int().min(1).max(365),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isHidden: z.boolean().default(false)
});

export const updateDiaryItemSchema = createDiaryItemSchema.partial();

export function parseCreateDiaryItemPayload(payload: unknown) {
  return createDiaryItemSchema.parse(payload);
}

export function parseUpdateDiaryItemPayload(payload: unknown) {
  return updateDiaryItemSchema.parse(payload);
}
```

---

### Task 3: Permission Helpers

- [ ] **Step 1: Extend project auth helpers**

Modify `src/lib/project-auth.ts` with helpers:

```ts
export function isOwnerRole(role: string | null | undefined) {
  return role === "OWNER";
}

export function canManageAuthoredItem(membership: { role: string }, userId: string, authorId: string) {
  return isOwnerRole(membership.role) || userId === authorId;
}

export function canToggleHiddenItem(
  membership: { role: string },
  userId: string,
  authorId: string,
  allowMemberPrivateItems: boolean
) {
  return isOwnerRole(membership.role) || (userId === authorId && allowMemberPrivateItems);
}

export async function getProjectIdForDiaryItem(diaryItemId: string) {
  const diaryItem = await prisma.diaryItem.findUnique({
    where: { id: diaryItemId },
    select: { projectId: true }
  });

  return diaryItem?.projectId ?? null;
}
```

---

### Task 4: APIs

- [ ] **Step 1: Update project create route**

Modify `src/app/api/projects/route.ts`:

```ts
const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  type: z.enum(["WORK", "DIARY"]).default("WORK")
});
```

Add `type: payload.type` to `prisma.project.create`.

- [ ] **Step 2: Add settings route**

Create `src/app/api/projects/[id]/settings/route.ts` with owner-only PATCH for `allowMemberPrivateItems`.

- [ ] **Step 3: Add diary list/create route**

Create `src/app/api/projects/[id]/diary-items/route.ts` with GET/POST. GET filters hidden items:

```ts
where: isOwnerRole(membership.role)
  ? { projectId: params.id }
  : {
      projectId: params.id,
      OR: [{ isHidden: false }, { authorId: userId }]
    }
```

- [ ] **Step 4: Add diary update/delete route**

Create `src/app/api/diary-items/[diaryItemId]/route.ts`. Reject update/delete unless owner or author. Reject `isHidden` changes unless `canToggleHiddenItem(...)` is true.

- [ ] **Step 5: Update note routes**

Modify existing note GET to use the same hidden filter. Modify note PATCH/DELETE so owner can manage all notes and members can manage only their own notes.

---

### Task 5: UI

- [ ] **Step 1: Create `ProjectQuickHub`**

Create `src/components/project/project-quick-hub.tsx` as a client component with a bottom-right round button. It opens a dark popover with Diary list and Note actions.

- [ ] **Step 2: Render quick hub in `ProjectShell`**

Add `<ProjectQuickHub projectId={projectId} allowMemberPrivateItems={project.allowMemberPrivateItems} />` near `CommandPalette`.

- [ ] **Step 3: Create diary list panel**

Create `src/components/diary/diary-list-panel.tsx` with create/edit/delete/hide actions using the new API.

- [ ] **Step 4: Update diary page**

Modify `src/app/(dashboard)/project/[id]/diary/page.tsx` to read `DiaryItem`, filter due items with `isDiaryItemDueOnDate`, and render `DiaryListPanel`.

- [ ] **Step 5: Update notes UI**

Modify `src/components/notes/notes-panel.tsx` to show hide/show only when allowed and to disable edit/delete buttons when the current user cannot manage that note.

- [ ] **Step 6: Update create project UI**

Modify `src/components/project/projects-dashboard.tsx` to include a `WORK` / `DIARY` mode selector and send `type` to `POST /api/projects`.

---

### Task 6: Verification

- [ ] **Step 1: Prisma**

Run: `npx prisma validate`

Expected: successful validation.

- [ ] **Step 2: Lint**

Run: `npm run lint`

Expected: no lint errors.

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: production build succeeds.

- [ ] **Step 4: Local smoke**

Start dev server with `npm run dev`, open `/projects`, create a diary project, enter the project diary page, create a recurring item, hide/show it when setting allows, and verify owner/member behavior.

---

## Self Review

- Spec coverage: quick hub, recurring diary, note permissions, project setting, and create project mode are covered.
- Placeholder scan: no deferred placeholders remain in the plan.
- Type consistency: schema field names match the planned API and UI names.
