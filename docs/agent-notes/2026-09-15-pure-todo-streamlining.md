# 2026-09-15 Pure Todo Streamlining

## Objective

Remove non-Todo modules (Finance, Office AI, Vital Hub, and the Select Module selector system) so the application focuses strictly as a dedicated Todo & Work Management platform.

## Files changed

- Deleted `src/app/(dashboard)/select-module/page.tsx`
- Deleted `src/components/modules/` (`module-selector.tsx`, `module-selector.test.ts`)
- Deleted `src/lib/modules/` (`default-module.ts`, `default-module.test.ts`)
- Deleted `src/app/(dashboard)/finance/` (all subpages: accounts, expenses, income, ledgers, budgets, recurring-income, subscriptions)
- Deleted `src/app/api/finance/` (all finance API endpoints)
- Deleted `src/components/finance/` (all finance UI components)
- Deleted `src/lib/finance/` and `src/types/finance.ts`
- Deleted `src/app/(dashboard)/office/` and `src/app/(dashboard)/project/[id]/office/`
- Deleted `src/app/api/office/` (all office API endpoints)
- Deleted `src/components/office/` and `src/lib/office/`
- Deleted `src/app/vital/` and `src/app/(dashboard)/hub/`
- Deleted `src/components/vital/`
- Modified `src/components/auth/login-form.tsx`: Redirect destination points directly to `/projects`.
- Modified `src/components/auth/register-form.tsx`: Redirect destination points directly to `/projects`.
- Modified `src/app/(auth)/login/page.tsx`: Authenticated session redirects directly to `/projects`.
- Modified `src/app/(auth)/register/page.tsx`: Authenticated session redirects directly to `/projects`.
- Modified `src/app/(marketing)/page.tsx`: Replaced `/select-module` CTA and session redirects with `/projects`.
- Modified `src/components/ui/back-button.tsx`: Removed `/select-module` fallback in favor of `/projects`.
- Modified `src/components/project/user-profile-popover.tsx`: Removed "Switch Module" item.
- Modified `src/components/project/project-shell.tsx`: Removed "office" from sidebar `navItems`.
- Modified `src/components/project/project-nav-link.tsx`: Removed "office" icon mapping.
- Modified `src/components/auth/auth-navigation.test.ts`: Updated test assertions to expect `/projects`.
- Modified `src/components/stabilization/visual-consistency.test.ts`: Updated EmptyState assertions for remaining Todo surfaces.
- Modified `src/app/(dashboard)/db-fallback-pages.test.ts`: Removed deleted hub fallback page assertions.
- Created `docs/agent-notes/2026-09-15-pure-todo-streamlining.md`: Change note.

## Behavior changes

- When users sign in, register, or click "Start planning" on the landing page, they are taken directly into the Todo workspaces (`/projects`).
- The entire "/select-module" screen and startup module switcher have been eliminated.
- The project workspace sidebar now focuses purely on Todo work tools: Board, Calendar, Diary, Notes, Members, Rewards Store, Settings.
- Standalone Finance, Office, and Vital pages are completely removed.

## Database/schema changes

- None. Existing database tables remain intact to preserve data integrity and prevent migration risks with remote Supabase PostgreSQL.

## Verification

- `npx vitest run`: 45 test files, 168 tests passed (100%).
- `npm run lint`: Passed with zero warnings or errors.
- `npx prisma validate`: Schema is valid.
- `npm run build`: Production build compiled 31 pages cleanly with zero errors.

## Follow-ups

- None. Ready for use.
