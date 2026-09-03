# 2026-07-10 Office Fullscreen Layout

## Objective
Make the Office workspace feel fullscreen instead of constrained like a centered page.

## Changed Files
- `src/components/office/office-module.tsx`
- `docs/agent-notes/2026-07-10-office-fullscreen-layout.md`

## Behavior
- Expanded the Office header, project selector, and selected project workspace to full available viewport width.
- Reduced outer padding so the workspace uses more screen area.
- Increased the main Office grid height with viewport-relative sizing.
- Made chat taller and more workspace-like.
- Removed the secondary visual preview from the selected project workspace bottom so the operational dashboard/chat has the screen priority.
- Kept the visual preview on the project selector as a lightweight preview.

## Verification
- `npm run lint`: passed.
- `npm test -- src/components/office/office-module.test.ts`: passed, 7 tests.
- `npx prisma validate`: passed.
- `npm run build`: not completed because the active dev server locked Prisma query engine output.
- `.\node_modules\.bin\next.cmd build`: not completed because the active dev server locked `.next/trace`.

## Note
The dev server was left running so the user can keep previewing the page.