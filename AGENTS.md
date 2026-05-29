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
