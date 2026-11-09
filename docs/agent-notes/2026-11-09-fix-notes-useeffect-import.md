# 2026-11-09 Fix Missing useEffect Import in NotesPanel

## Objective
Fix the fatal runtime crash on the Notes page (`ReferenceError: useEffect is not defined`) reported by the user as "note คิด useeffice is not defined".

## Files Created / Modified
- `src/components/notes/notes-panel.tsx`: Added missing `useEffect` import from `"react"` on line 3.
- `src/components/notes/notes-panel.test.ts`: Added regression test asserting `useEffect` is properly imported in `notes-panel.tsx`.

## Important Behavior Changes
- The Notes page (`/project/[id]/notes`) now loads cleanly without runtime ReferenceErrors.
- Collapsible tools state restoration from `localStorage` (`retzlo_notes_${projectId}_tools_collapsed`) functions as intended.

## Database / Schema Changes
None.

## Verification Commands Run & Results
- `npx vitest run src/components/notes/`: 17 passed (17 total across 2 test files).
- `npm run lint`: 0 warnings, 0 errors.
- `npm run build`: Compiled successfully (43/43 pages).

## Known Follow-ups, Blockers, or Deployment Notes
None.
