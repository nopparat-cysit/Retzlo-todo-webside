---
name: modular-life-work-platform
description: Use when working on the Modular Life and Work Management Platform in this repository.
---

# Modular Life and Work Platform Skill

## Purpose

Use this project-local guide when designing, implementing, testing, or reviewing the Modular Life and Work Management Platform. The platform starts with the Work module: project workspaces, members, invitations, Kanban todo boards, and a calendar view for dated cards.

## Product Shape

- The first screen after login is project selection.
- A project is a workspace, similar to Trello or Jira.
- Inside a project, the main work areas are Todo Board, Calendar, Members, and Settings.
- The Work module must be built so future life/work modules can be added without colliding with existing code.

## Architecture Rules

- Use Next.js App Router with a feature-based split.
- Keep route handlers under `src/app/api` and group them by product feature.
- Keep shared UI in `src/components`.
- Keep Prisma, auth, permission helpers, and utility code in `src/lib`.
- Keep shared TypeScript contracts in `src/types`.
- Use Prisma and PostgreSQL as the source of truth.
- Use NextAuth Credentials with bcrypt and the Prisma `User.password` field.
- Never commit real database URLs, Supabase keys, session secrets, or invitation tokens.

## Multi-Tenancy Rules

- Every project-bound read or write must verify membership through `ProjectMember`.
- Project creation must add the creator as `OWNER`.
- Invite creation requires project membership.
- Board/card/column mutations must resolve the related project before authorizing the user.
- Prefer explicit `403 Forbidden` when a logged-in user is not a project member.

## Work Module Rules

- Board columns and cards are ordered by zero-indexed `position`.
- Drag-and-drop uses optimistic UI updates first, then syncs in the background.
- Card moves into an empty column must be supported.
- Cross-column card moves must update both `columnId` and all affected positions.
- Calendar displays cards from the project that have a `dueDate`.

## Visual Direction

The UI mood is retro lofi indigo: quiet, late-night, solitary, soft but usable.

- Use dark indigo foundations.
- Use muted rose, amber, cyan, or lavender accents sparingly.
- Keep operational surfaces readable and dense enough for real work.
- Avoid corporate SaaS blandness, oversized marketing cards, and decorative clutter.

## Testing Expectations

- Test pure reorder logic before implementing UI integration.
- Validate Prisma schema before relying on generated client behavior.
- Run lint and build before calling implementation complete.
- Add API tests or focused helper tests where permission logic can regress.
