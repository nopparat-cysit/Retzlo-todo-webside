# Work Note: Resolve Projects Dashboard Client-Side Exception

- Date: 2026-11-05
- Objective: Diagnose and resolve client-side exception occurring on `/projects` by implementing root `global-error.tsx` boundary and hardening data serialization and rendering in the projects dashboard.

## Files Created, Modified, or Deleted

- Created: `src/app/global-error.tsx`
- Created: `src/components/project/projects-dashboard-render.test.tsx`
- Modified: `src/app/(dashboard)/projects/page.tsx`
- Modified: `src/components/project/projects-dashboard.tsx`
- Created: `docs/agent-notes/2026-11-05-fix-projects-dashboard-client-exception.md`

## Important Behavior Changes

1. **Root Global Error Boundary (`src/app/global-error.tsx`):**
   - Added Next.js App Router root error boundary capturing exceptions that occur in root layout providers (`ThemeProvider`, `LanguageProvider`, `AiChatProvider`, `AiChatWidget`, `CommandPalette`).
   - Replaced blank default Next.js black screen with styled error screen providing clear error diagnostics, "Try again", "Clear Cache & Reload", and "Back to Login".

2. **Null-Safe User Profile Initials & Names:**
   - Implemented `getSafeInitials(name, email)` in `src/components/project/projects-dashboard.tsx` guarding against whitespace-only, empty, or undefined profile strings.
   - Guarded user display name splitting against undefined/null strings in `ProjectSupportColumn`.

3. **Data Sanitization in Server Component (`src/app/(dashboard)/projects/page.tsx`):**
   - Added fallback checks to `toProjectDashboardItem` for `project.boards`, `columns`, and `cards`.
   - Handled non-Date and null string values for `card.dueDate` and `diary.startDate`.
   - Guaranteed null-safe project relation extraction for calendar cards and diary items.

4. **Robust Date Sorting & Highlight Comparison:**
   - Handled `NaN` dates defensively in `filteredCalendarItems` sort comparator.
   - Hardened `getDiaryHighlightStatus` against missing `checklistSummary`, malformed `dueTime`, and invalid `dueDate` strings.

## Database / Schema Changes

- None.

## Verification Commands Run & Results

- `npx vitest run`: Passed (106 test files, 585 tests passed, 3 skipped).
- `npm run lint`: Passed (No ESLint warnings or errors).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run build`: Passed (Production compilation and static page generation completed with exit code 0).

## Known Follow-ups, Blockers, or Deployment Notes

- Deploy to Vercel production by pushing commit to main.
