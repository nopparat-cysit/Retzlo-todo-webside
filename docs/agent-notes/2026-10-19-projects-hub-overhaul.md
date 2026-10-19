# Work Session Note: Company & Projects Hub (/projects) Structure & UX Overhaul

**Date**: 2026-10-19  
**Objective**: Overhaul the Company & Project Hub (`/projects`) before entering the workspace to resolve terminology confusion, eliminate duplicate switchers, default to the All-Workspaces grid with 1-click board launch, add boards quick-jump chips, eliminate duplicate deadline sidebars, and polish Light/Dark theme contrast.

## Files Created, Modified, or Moved

- `src/components/project/projects-dashboard.tsx` (Modified):
  - Changed default `viewMode` from `"boards"` to `"workspaces"` so visitors immediately see all workspaces without being trapped inside the first project.
  - Replaced redundant `FilterSelect ("Active Project")` in the left sidebar with a sleek `Quick Launch` panel (starred & recent workspaces for direct 1-click entry).
  - Cleaned up the command header: removed unnecessary `BackButton` (since `/projects` is the home lobby) and clearly distinguished `All Projects Hub` from specific workspace board view, adding a clean `← All Workspaces` jump-back button.
  - Added **Boards Quick-Jump Chips** to `ProjectCard` so users can jump straight to specific Kanban boards in 1 click or open board management if there are more than 3 boards.
  - Added a direct link to Full Workspace Settings (`/project/${project.id}/settings`) in both `ProjectCard`'s 3-dots menu and `EditProjectModal`.
  - Replaced duplicate `Upcoming Deadlines` in `ProjectSupportColumn` (which duplicated the left sidebar) with an aggregated **Overall Studio Delivery Health & Task Status Breakdown** (`Todo`, `Doing`, `Wait`, `Done`), eliminating triple-duplicate project cards.
  - Replaced misplaced tilted hourglass (`retro-sticker-42-hourglass.png`) and cozy flame (`retro-sticker-49-cozy-flame.png`) stickers in the right support column with crisp glowing vector badges (`TrendingUp`, `Sparkles`).
  - Replaced paper note stickers (`retro-sticker-12-paper-note.png`) in empty states with vector icon emblems (`FolderKanban`, `Search`), preserving dynamic project cover stickers (`project.sticker`) inside `ProjectCard`.
  - Conditioned `Quick Launch` to only display when `starredCount > 0`, and conditioned Agenda range/status filters to only appear when schedule items exist to declutter the left sidebar.
  - Fixed `ProjectCard`'s description fallback logic so empty string descriptions fallback cleanly to default subtitle text instead of leaving an empty void.
  - Upgraded hardcoded dark classes in the left sidebar (`Agenda & Deadlines`) and right column (`ProjectSupportColumn`) to high-contrast dual-theme classes.
- `docs/theme-system.md` (Modified): Documented the `/projects` hub dual-theme improvements.
- `docs/agent-notes/2026-10-19-projects-hub-overhaul.md` (Created/Updated): This work session note.

## Important Behavior Changes

1. **Default All-Workspaces Hub**: Navigating to `/projects` now immediately renders all workspace cards instead of locking into the first project's boards.
2. **1-Click Direct Board Entry**: Users can launch the main board directly from the card, jump to specific boards via the new Quick-Jump chips, or click starred projects in the left sidebar.
3. **No Duplicate Projects Across 3 Columns**: The left sidebar shows Starred quick-launch only when starred projects exist; the center grid shows workspaces; and the right 2xl column aggregates studio-wide delivery health and task status distribution instead of repeating project rows.
4. **Clean Vector Badges**: Replaced misplaced tilted PNG stickers in the right column and empty states with glowing vector badges and modern icon emblems, while preserving custom cover stickers chosen by users.
5. **Light Mode High-Contrast**: Warm Paper light mode now renders crisp text, high-contrast borders, and clean pill backgrounds in the left sidebar and right support column.

## Database / Schema Changes

- None.

## Verification Commands & Results

- `npx prisma validate`: Passed.
- `npm run lint`: Passed (0 errors, 0 warnings).
- `npm test`: Passed (100 test files, 533 passed).
- `npm run build`: Passed (all 42 routes compiled and statically generated).

## Known Follow-ups, Blockers, or Deployment Notes

- None. Everything is typed, verified, and adheres strictly to repository standards.
