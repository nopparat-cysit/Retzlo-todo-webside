# 2026-09-15 Board Assignee Filter Dropdown Fix

## Objective
Fix and modernize the assignee filter dropdown on the Kanban Board (`/project/[id]/board`): replace the raw native HTML `<select>` with an accessible, theme-consistent Radix UI dropdown, display member avatars and initials, fix missing chevron indicators and invalid Tailwind classes, and provide an instant clear button.

## Files Modified
- `src/components/kanban/board.tsx`: Replaced native `<select>` and absolute `<X>` button with Radix UI `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, and `SelectItem`. Added member avatars using `AssigneeAvatar`, clear button reset, and retro lo-fi theme tokens (`dusk-lavender`, `ink-900`).
- `src/components/kanban/card-interaction.test.ts`: Added regression test asserting that the Kanban board renders Radix UI Select components and AssigneeAvatar rather than native unstyled select elements.

## Important Behavior Changes
- The assignee filter trigger now displays a chevron arrow, proper theme styling, and the selected member's avatar and name/email (or "Unassigned" / "All Assignees").
- Dropdown popup matches the retro lo-fi indigo dark theme (`bg-ink-900/98 backdrop-blur-xl border-white/12`) on both macOS and Windows, eliminating the bright white native OS popup on Mac.
- Member options display high-fidelity avatar badges (`AssigneeAvatar`) alongside names and email addresses.
- An instant clear button (`X`) appears adjacent to the trigger when an active filter is selected, allowing 1-click reset to "All Assignees" without opening the menu.

## Database / Schema Changes
- None (pure frontend UI / UX polish).

## Verification Commands Run & Results
- `npm run lint`: Passed (0 ESLint warnings or errors).
- `npx prisma validate`: Passed (Prisma schema valid).
- `npm run build`: Passed (31/31 pages compiled and statically generated).
- `npx vitest run`: Passed (45 test files, 173 passed, 0 failures).

## Follow-ups & Blockers
- None. All functionality verified and production ready.
