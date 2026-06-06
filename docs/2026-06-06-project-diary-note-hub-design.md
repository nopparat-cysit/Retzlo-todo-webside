# Project Diary And Note Hub Design

## Goal

Add a project-scoped quick hub for creating and opening diary lists and notes without leaving the current project context. The feature should support recurring diary items, project-level visibility rules, and owner/member permissions.

## Scope

- Add a fixed round quick-action button at the bottom-right of project pages.
- Opening the button shows two actions: Diary list and Note.
- Diary list items can repeat every 1 to 365 days.
- Notes and diary items belong to a project and an author.
- Owners can see and manage all project notes and diary items.
- Members can edit and delete only their own notes and diary items.
- Members can hide or show their own notes and diary items only when the owner enables hiding for that project.
- Owners always see hidden member content.
- Create Project adds a mode for users who want a diary-first project.

## Data Model

Add project settings:

- `Project.type`: `WORK`, `DIARY`
- `Project.allowMemberPrivateItems`: boolean, default false

Add diary model:

- `DiaryItem`
  - `id`
  - `projectId`
  - `authorId`
  - `title`
  - `description`
  - `color`
  - `intervalDays` from 1 to 365
  - `startDate`
  - `isHidden`
  - `createdAt`
  - `updatedAt`

Notes reuse the existing `Note` model, with an added `isHidden` field.

## Permissions

Project membership is required for all project-scoped routes.

Owners:

- Can list all notes and diary items.
- Can see hidden member content.
- Can update and delete any note or diary item.
- Can enable or disable member hiding for the project.

Members:

- Can list their own content and visible content from other members.
- Can create notes and diary items in projects they belong to.
- Can update and delete only their own content.
- Can toggle hidden only for their own content and only when the project allows member hiding.

## UI Flow

Project pages render a `ProjectQuickHub` client component:

- Fixed round button at bottom-right.
- Popover opens with Diary list and Note actions.
- Note opens a compact create-note modal using the existing note style.
- Diary list opens a recurring diary modal with title, description, color, start date, and repeat interval.

Diary page:

- Shows due diary items for the selected date.
- A diary item is due when the selected date is on or after `startDate` and the day difference is divisible by `intervalDays`.
- Owner can filter visually by author later, but the first version lists all accessible items.

Notes page:

- Keeps the existing notes UI.
- Adds ownership-aware edit/delete/hide behavior.

Create Project:

- Adds a project mode selector.
- `WORK` creates the normal work board experience.
- `DIARY` still creates the default board for compatibility, but routes users to the diary page and labels the project as diary-first.

## API

Add or update these routes:

- `POST /api/projects`
  - Accepts `type`.
  - Creates default board for compatibility.
- `PATCH /api/projects/[id]/settings`
  - Owner-only.
  - Updates `allowMemberPrivateItems`.
- `GET /api/projects/[id]/diary-items`
  - Returns accessible diary items for the current member.
- `POST /api/projects/[id]/diary-items`
  - Creates a diary item.
- `PATCH /api/diary-items/[diaryItemId]`
  - Owner can update any item.
  - Member can update own item.
- `DELETE /api/diary-items/[diaryItemId]`
  - Owner can delete any item.
  - Member can delete own item.
- Existing note routes gain ownership and hidden-item permission checks.

## Validation

- `intervalDays` must be an integer between 1 and 365.
- `title` is required.
- `startDate` must be a valid date.
- `isHidden` can only be changed by owner or by the item author when project hiding is enabled.

## Verification

Run:

- `npx prisma validate`
- `npm run lint`
- `npm run build`

Add focused tests for recurrence and permission helpers if the implementation extracts those helpers.
