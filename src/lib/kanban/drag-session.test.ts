import { describe, expect, it } from "vitest";
import { createCardDragSession, getCardDropTarget, prepareCardMove } from "./drag-session";
import { moveCard } from "./reorder";
import type { Card, ColumnWithCards } from "@/types/kanban";

function dragColumns(): ColumnWithCards[] {
  const card = (id: string, columnId: string, position: number): Card => ({ id, columnId, position, title: id, description: null, note: null, status: "TODO", color: "DEFAULT", checklist: [], dueDate: null, dueDateAllDay: false, priority: "MEDIUM", isStarred: false });
  return [
    { id: "backlog", name: "Backlog", position: 0, color: "default", icon: "kanban", defaultCardStatus: "TODO", cards: [card("a", "backlog", 0), card("b", "backlog", 1), card("c", "backlog", 2)] },
    { id: "progress", name: "In Progress", position: 1, color: "default", icon: "kanban", defaultCardStatus: "DOING", cards: [card("d", "progress", 0)] },
    { id: "done", name: "Done", position: 2, color: "default", icon: "kanban", defaultCardStatus: "DONE", cards: [] }
  ];
}

describe("card drag session", () => {
  it("keeps the original source after optimistic remount changes the card's column", () => {
    const session = createCardDragSession(dragColumns(), "a")!;
    let live = session.snapshot;
    for (let step = 0; step < 5; step++) {
      const target = getCardDropTarget(session, live, { columnId: "progress", cardId: "d", placement: "before" })!;
      live = moveCard(session.snapshot, target).columns;
      expect(live[1].cards.map(card => card.id)).toEqual(["a", "d"]);
      expect(target.sourceColumnId).toBe("backlog");
      expect(live.flatMap(col => col.cards).filter(card => card.id === "a")).toHaveLength(1);
    }
    const move = prepareCardMove(session, getCardDropTarget(session, live, { columnId: "progress", placement: "append" }))!;
    expect(move.payload).toEqual({ cardId: "a", sourceColumnId: "backlog", destinationColumnId: "progress", sourceOrderedCardIds: ["b", "c"], destinationOrderedCardIds: ["d", "a"] });
  });

  it.each([
    ["b", "backlog", "a", "before", ["b", "a", "c"]],
    ["a", "backlog", "c", "before", ["b", "a", "c"]],
    ["a", "backlog", "c", "after", ["b", "c", "a"]],
    ["c", "backlog", "a", "after", ["a", "c", "b"]],
    ["a", "progress", "d", "before", ["a", "d"]],
    ["a", "progress", "d", "after", ["d", "a"]]
  ] as const)("places %s in %s relative to %s (%s)", (id, columnId, cardId, placement, ids) => {
    const session = createCardDragSession(dragColumns(), id)!;
    const target = getCardDropTarget(session, session.snapshot, { columnId, cardId, placement });
    expect(prepareCardMove(session, target)!.columns.find(col => col.id === columnId)!.cards.map(card => card.id)).toEqual(ids);
  });

  it("moves through several columns without duplicates, including empty and append targets", () => {
    const session = createCardDragSession(dragColumns(), "a")!;
    let live = session.snapshot;
    for (const columnId of ["progress", "done", "backlog", "progress"]) {
      live = prepareCardMove(session, getCardDropTarget(session, live, { columnId, placement: "append" }))!.columns;
      expect(live.flatMap(col => col.cards).filter(card => card.id === "a")).toHaveLength(1);
      const cards = live.find(col => col.id === columnId)!.cards;
      expect(cards[cards.length - 1].id).toBe("a");
    }
    expect(live[1].cards[1].status).toBe("DOING");
  });

  it("does not prepare requests for no-op, cancel, missing card, or invalid targets", () => {
    const session = createCardDragSession(dragColumns(), "a")!;
    const unchanged = getCardDropTarget(session, session.snapshot, { columnId: "backlog", cardId: "b", placement: "before" });
    expect(prepareCardMove(session, unchanged)).toBeNull();
    expect(prepareCardMove(session, null)).toBeNull();
    expect(createCardDragSession(dragColumns(), "missing")).toBeNull();
    expect(getCardDropTarget(session, session.snapshot, null)).toBeNull();
    expect(getCardDropTarget(session, session.snapshot, { columnId: "missing", placement: "append" })).toBeNull();
    expect(getCardDropTarget(session, session.snapshot, { columnId: "progress", cardId: "a", placement: "before" })).toBeNull();
    expect(getCardDropTarget(session, session.snapshot, { columnId: "progress", cardId: "missing", placement: "after" })).toBeNull();
  });
});
