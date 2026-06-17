# Todo Modular Platform

**Mood & Tone**: Retro Lofi Indigo — Quiet, cozy, focused, and slightly nostalgic late-night productivity workspace.

A modular life and work management tool built with Next.js, Prisma, and Supabase. The current focus is on the **Work Module** (Kanban board, projects, calendar).

## Tech Stack
- Next.js 14 (App Router)
- Prisma + PostgreSQL (Supabase)
- Tailwind CSS + Custom Lofi Design System
- TypeScript, Radix UI, dnd-kit, NextAuth, Zod

## Quick Start

```bash
npm install
npm run dev
```

Make sure you have a `.env.local` with `DATABASE_URL` and `NEXTAUTH_SECRET`.

## Current Status
- Branch: `ui/mood-refactor` (UX/UI & Mood improvement in progress)
- Focus: Improving visual mood, lofi aesthetic, panel design, and overall feel.
- Design Reference: See `DESIGN.md`

## Project Structure (Simplified)
- `src/app/` — Routes and pages
- `src/components/` — Reusable UI
- `prisma/` — Database schema
- `docs/` — Design and notes

---

**Note**: This project is being actively refactored to better match the intended retro lofi indigo aesthetic and improve code organization.

Last updated: 2026-06-17
