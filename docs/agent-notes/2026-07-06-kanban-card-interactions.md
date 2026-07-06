# 2026-07-06 - Kanban card interactions

## Objective

Fix intermittent kanban card drag activation and card modal close behavior.

## Files Changed

- `src/components/kanban/board.tsx`
- `src/components/kanban/card-modal.tsx`
- `src/components/kanban/card-interaction.test.ts`

## Behavior Changes

- Card modal pointer and click events now stop propagation before they can bubble through the React portal back to the sortable card.
- Card modal content now stops pointer, click, and keyboard events directly so board shortcuts and sortable background listeners do not fire while interacting inside the modal.
- Escape from inside the card modal still opens the discard confirmation when there are unsaved changes.
- Closing a card modal from the X button or backdrop no longer immediately reopens the card.
- Board card drag activation now starts after a shorter 4px pointer movement, making drag-from-anywhere feel more responsive while preserving single-click card opening.

## Database Changes

- No schema or migration changes.
- A temporary card was created, dragged, and deleted during local browser verification.

## Verification

- `npm test -- src/components/kanban/card-interaction.test.ts` - passed.
- `.\node_modules\.bin\tsc.cmd --noEmit` - passed.
- Browser verification on `http://localhost:3001/project/0dd7438e-7dad-4287-a60f-9d97128a3ce1/board` - passed: modal close stayed closed, temporary card dragged from Backlog to In Progress, temporary card deleted.
- Browser verification for modal event isolation - passed: pressing `F` inside the title input did not enable board focus mode, clicking modal controls did not affect board totals, Escape opened discard confirmation, and discard closed the modal.
- `npm run lint` - passed.
- `npm run build` - passed after stopping the local Next dev server that held the Prisma Windows query engine DLL.
- `npx prisma validate` - passed.

## Follow-ups

- The browser still shows dnd-kit live-region text after dragging. It is harmless for screen readers but visually present in `innerText`; consider making the live region visually hidden if it appears in the UI.

## 2026-07-06 Update - Drag persistence

### Objective

Fix a kanban drag/drop persistence bug where the card could visually move during drag-over but not sync to the database, causing it to return to the old column after refresh.

### Files Changed

- `src/components/kanban/board.tsx`
- `src/components/kanban/card-interaction.test.ts`
- `docs/agent-notes/2026-07-06-kanban-card-interactions.md`

### Behavior Changes

- The board now remembers the last valid card drop target during drag-over.
- Drag-end uses that saved target when dnd-kit reports a missing or self-referential `over` target, so the reorder API still receives the intended move.
- If drag-end has no reliable target, the board rolls back to the drag snapshot instead of leaving an unsynced optimistic UI state.

### Database Changes

- No schema or migration changes.

### Verification

- `npm test -- src/components/kanban/card-interaction.test.ts --reporter=dot` - failed before the fix because `lastCardDropTargetRef` was missing.
- `npm test -- src/components/kanban/card-interaction.test.ts --reporter=dot` - passed after the fix.
- `npm test -- src/components/kanban/card-interaction.test.ts src/lib/kanban/reorder.test.ts --reporter=dot` - passed.
- `npx prisma validate` - passed.
- `npm run lint` - passed.
- `.\node_modules\.bin\tsc.cmd --noEmit` - initially failed on a nullable `over` access in the drag-end guard, then passed after tightening the guard.
- `npm run build` - passed.
- `git diff --check` - passed with line-ending warnings only.

### Follow-ups

- Manual browser drag verification is still recommended against a live board after deployment because this bug depends on dnd-kit pointer timing.
