# 2026-10-01 — Theme system audit and extension guide

## Objective
Audit how colors and themes are applied, document risks and a staged migration plan, and preserve a rule for tracking future screens and sections.

## Files created or modified
- Created `docs/theme-system.md` with current architecture, audit findings, coverage matrix, migration plan, and append-only change log.
- Created `docs/agent-notes/2026-10-01-theme-system-audit.md`.
- Modified `AGENTS.md` to require reading/updating the theme guide when theme-related UI areas are changed or added.
- Modified `docs/design.md` to link to the canonical theme guide.

## Important findings
- The persisted `system` preference is written literally to `data-theme` by the pre-hydration script, temporarily selecting dark until the provider resolves the OS theme; light OS users may see a dark first-paint flash.
- Theme colors are split among CSS variables, fixed Tailwind colors, component class maps, and broad light-mode overrides. `globals.css` has 2,619 lines and its light-mode section contains 142 `!important` declarations.
- Error/success state variants use pale text colors without light-mode counterparts.
- The public marketing homepage was visually inspected in dark mode. Signed-in workspace pages were not visually inspected in this pass.

## Database/schema changes
None.

## Verification
- `npm run lint` — passed with no ESLint warnings or errors.
- `npm run build` — passed; Next.js generated all 35 static pages.
- `npx prisma validate` — passed; schema is valid.
- `git diff --check` — passed; only line-ending conversion notices were reported for existing working files.

## Follow-ups
- Fix system-theme first paint.
- Define semantic color tokens, migrate shared primitives and feature surfaces, and remove global compatibility overrides after their consumers are migrated.
- Visually inspect authenticated routes in light/dark/system and mobile after a test session is available.
