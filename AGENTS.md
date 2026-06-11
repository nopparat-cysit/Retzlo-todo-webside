# Agent Guide

## Project

This repository contains a greenfield Modular Life and Work Management Platform built with Next.js App Router, Prisma, PostgreSQL on Supabase, Tailwind CSS, and NextAuth Credentials.

The first production module is the Work module:

- Project workspaces
- Member invitations
- Kanban todo board
- Calendar view from card due dates

## Collaboration Rules

- Treat secrets as local-only data. Do not commit real Supabase URLs, anon keys, JWT secrets, or invitation tokens.
- Prefer small, typed, feature-scoped files.
- Keep future modules in mind, but implement only what the Work module needs now.
- Follow the existing docs before adding abstractions.
- Use TDD for behavior-heavy code such as reorder logic, authorization helpers, and payload validation.

## Change Notes

- For every work session that creates, deletes, edits, renames, moves, or materially changes files, write a Markdown note for that work.
- Store notes in `docs/agent-notes/`.
- Use the filename format `YYYY-MM-DD-short-topic.md`.
- Each note should include:
  - Date and short objective.
  - Files created, modified, deleted, or moved.
  - Important behavior changes.
  - Database/schema changes, if any.
  - Verification commands run and their result.
  - Known follow-ups, blockers, or deployment notes.
- Keep the note factual and concise, but update it whenever additional changes happen in the same work session.
- Do not include secrets, real tokens, private URLs with credentials, or full environment variable values in notes.

## Expected Structure

```text
src/
  app/
    (marketing)/
    (auth)/
    (dashboard)/
      project/[id]/
        board/
        calendar/
    api/
  components/
  lib/
  types/
prisma/
docs/
```

## Implementation Standards

- Use strict TypeScript.
- Keep API payload parsing explicit.
- Use Prisma transactions for reorder updates.
- Use membership checks for every project-scoped API.
- Use optimistic UI for Kanban drag-and-drop.
- Keep theme decisions aligned with the retro lofi indigo design direction.

## Verification

Before claiming work is complete, run the available verification commands:

```bash
npm run lint
npm run build
npx prisma validate
```

Run focused tests as soon as test files exist.
