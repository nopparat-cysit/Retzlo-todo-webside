# 2026-09-17 — Kanban Drag-and-Drop Reliability & Collision Detection Fix

## Objective
Eliminate recurring card drop failures, card snapping back on release, and sluggish drag pickup ("ลากไม่ติด") across Kanban columns, specifically into empty or low-card columns like "In Progress".

## Root Causes Identified
1. **Self-Collision in Collision Detection**: `createKanbanCollisionDetection` did not filter out `args.active.id` from `droppableContainers`. When a card moved into a column optimistically, `closestCorners` found the active card itself (`active.id === over.id`), causing `getCardDropTarget` to return `null`. Releasing the pointer in that state caused an immediate cancellation and snapback.
2. **Stale Closure in `handleDragEnd`**: `const next = columns;` captured stale React state closure. If the user dropped quickly before React re-rendered, `destinationOrderedCardIds` did not contain the moved `cardId`, resulting in the database never updating the card's `columnId`. Subsequent background sync pulled the old position, snapping the card back.
3. **No Direct Target Calculation on Drop**: `handleDragEnd` relied solely on `lastCardDropTargetRef.current`. If this ref was cleared or skipped, the drop failed even if `event.over` was valid.
4. **Native Text Selection / Pointer Interception**: Card `<article>` lacked `select-none` and `touch-none`. Clicking on card text would initiate browser text selection, emitting `pointercancel` and killing the drag gesture before it began.

## Files Modified
- `src/lib/kanban/kanban-collision.ts`:
  - Filtered out `args.active.id` from candidate droppables and column card IDs to prevent self-collision.
  - Returns the column itself when no other cards remain in that column.
- `src/lib/kanban/kanban-collision.test.ts`:
  - Added unit test asserting active card container exclusion and correct fallback to column container.
- `src/components/kanban/card.tsx`:
  - Added `select-none touch-none` to the `<article>` root element.
  - Guarded `onClick` and `onKeyDown` with `!isDragging` to prevent accidental edit modal opening during/after drag.
- `src/components/kanban/board.tsx`:
  - Added `columnsRef` to prevent stale closure reads.
  - Stabilized `collisionDetection` memo with `() => columnsRef.current`.
  - Updated `getCardDropTarget` to robustly extract `destinationColumnId` from `overData` and fallback to `over.id` search.
  - Updated `handleDragEnd` to calculate `getCardDropTarget(event, previous) ?? lastCardDropTargetRef.current` and deterministically compute `next` via `moveCard(previous, target).columns` to ensure 100% accurate API payloads.
  - Preserved `cards: col.cards` in `updateColumn`.
- `src/hooks/use-live-sync.test.ts`:
  - Updated regex to match fetch calls with optional cache options.

## Verification
- `npm test`: PASS (54 test files, 225/225 tests passed)
- `npm run lint`: PASS (0 warnings, 0 errors)
- `npm run build`: PASS (Exit code 0, all 30 pages generated)
- `npx prisma validate`: PASS (Schema valid)
