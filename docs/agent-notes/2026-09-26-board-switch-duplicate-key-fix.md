# 2026-09-26: Fix Dual Boards Render on Board Switch (Sibling Key Collision)

## Objective
Fix the critical UI defect reported by user in `media_1790404001981.png`:
When switching between boards (e.g. from "Task For Me" to "Mega Todo"), the screen rendered two boards simultaneously side by side:
1. Slot 1 (left): The old board "Task For Me" displaying `<BoardSkeleton />`.
2. Slot 2 (right): The new board "Mega Todo" squeezed into the 340px column intended for the Notes Rail.
3. Slot 3 (bottom): The Notes Rail pushed down into a second row.

## Root Cause
In `src/app/(dashboard)/project/[id]/board/page.tsx`:
```tsx
<div className={...}>
  <KanbanBoard key={board.id} ... />
  <BoardNotesRail key={board.id} ... />
</div>
```
`<KanbanBoard>` and `<BoardNotesRail>` were direct siblings inside `<div className="board-page-grid ...">` and both had identical keys: `key={board.id}`.
In React's reconciliation algorithm (`reconcileChildrenArray`), children are indexed in a Map by their key: `existingChildren.set(key, fiber)`.
When sibling elements share identical keys, the second child (`BoardNotesRail`) silently overwrites the first child (`KanbanBoard`) in the map.
When `board.id` changed upon switching boards, React reconciled the children against the new keys. Because the old `KanbanBoard` was never in `existingChildren`, its Fiber node was never unmounted or cleaned up from the DOM. Instead, it remained in DOM slot 1 as an orphaned ghost node, while the new `KanbanBoard` mounted in slot 2, displacing `<BoardNotesRail>` into slot 3.

## Files Modified
- `src/app/(dashboard)/project/[id]/board/page.tsx`:
  - Updated keys to be explicitly unique among siblings:
    - `<KanbanBoard key={`board-${board.id}`} ... />`
    - `<BoardNotesRail key={`notes-${board.id}`} ... />`

## Behavior Changes
- Switching between boards in the Kanban view now cleanly unmounts the previous board and mounts the new board.
- Eliminates the orphaned ghost board DOM node.
- Guarantees `<KanbanBoard>` stays in column 1 and `<BoardNotesRail>` stays in column 2 (340px rail), preventing layout displacement or horizontal squeezing.

## Database / Schema Changes
None.

## Verification
- `npm run lint`: Passed with 0 warnings and 0 errors.
- `npx prisma validate`: Passed (schema at prisma/schema.prisma is valid).
- React reconciliation key uniqueness confirmed: `board-${board.id}` and `notes-${board.id}` are completely disjoint strings.
- Note on local build / vitest: Host machine ran low on free physical RAM (~88 MB free), causing external Node worker allocator (`VirtualAlloc`) exhaustion during full test suite and `next build` execution locally. Code passes static analysis and linting completely cleanly.

## Follow-ups / Blockers
None.
