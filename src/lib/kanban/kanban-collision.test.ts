import { describe, expect, it } from "vitest";
import type { CollisionDetection } from "@dnd-kit/core";
import { createKanbanCollisionDetection } from "./kanban-collision";

type Args = Parameters<CollisionDetection>[0];
const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, right: left + width, bottom: top + height });
const columns = [{ id: "backlog", cards: [{ id: "a" }] }, { id: "progress", cards: [{ id: "d" }, { id: "e" }] }, { id: "done", cards: [] }];
function args(x: number, y: number): Args {
  const zones = ["backlog", "progress", "done"].map((columnId, i) => ({ id: `card-zone:${columnId}`, data: { current: { type: "card-container", columnId } }, rect: { current: rect(i * 200, 50, 180, 450) } }));
  const cards = [
    { id: "card:a", data: { current: { type: "card", columnId: "backlog", cardId: "a" } }, rect: { current: rect(10, 70, 160, 80) } },
    { id: "card:d", data: { current: { type: "card", columnId: "progress", cardId: "d" } }, rect: { current: rect(210, 70, 160, 80) } },
    { id: "card:e", data: { current: { type: "card", columnId: "progress", cardId: "e" } }, rect: { current: rect(210, 170, 160, 80) } }
  ];
  const sortableColumns = zones.map((zone, i) => ({ id: `column:${columns[i].id}`, data: { current: { type: "column", columnId: columns[i].id } }, rect: { current: rect(i * 200, 0, 180, 500) } }));
  const containers = [...zones, ...cards, ...sortableColumns];
  return {
    active: { id: "card:a", data: { current: { type: "card", cardId: "a", columnId: "backlog" } }, rect: { current: { translated: rect(x - 80, y - 40, 160, 80), initial: rect(10, 70, 160, 80) } } },
    pointerCoordinates: { x, y }, collisionRect: rect(x - 80, y - 40, 160, 80),
    droppableContainers: containers, droppableRects: new Map(containers.map(item => [item.id, item.rect.current]))
  } as unknown as Args;
}

describe("zone-first Kanban collision", () => {
  it.each([
    [280, 65, "card:d", { columnId: "progress", cardId: "d", placement: "before" }],
    [280, 125, "card:d", { columnId: "progress", cardId: "d", placement: "after" }],
    [280, 160, "card:e", { columnId: "progress", cardId: "e", placement: "before" }],
    [280, 450, "card-zone:progress", { columnId: "progress", placement: "append" }],
    [480, 200, "card-zone:done", { columnId: "done", placement: "append" }]
  ])("resolves pointer (%s,%s) within the receiving zone", (x, y, id, target) => {
    const detector = createKanbanCollisionDetection(() => columns);
    expect(detector(args(x as number, y as number))[0]?.id).toBe(id);
    expect(detector.getCardTarget()).toEqual(target);
    detector.reset();
  });

  it("does not target a neighbor, header, or active card when pointer is outside receiving zones", () => {
    const detector = createKanbanCollisionDetection(() => columns);
    for (const [x, y] of [[190, 200], [280, 25], [800, 250]]) {
      expect(detector(args(x, y))).toEqual([]);
      expect(detector.getCardTarget()).toBeNull();
    }
    expect(detector(args(80, 110))[0]?.id).toBe("card-zone:backlog");
    detector.reset();
  });

  it("isolates column sorting from card receiving zones", () => {
    const detector = createKanbanCollisionDetection(() => columns);
    const input = args(280, 150);
    input.active.id = "column:backlog";
    input.active.data.current = { type: "column", columnId: "backlog" };
    expect(detector(input).every(hit => String(hit.id).startsWith("column:"))).toBe(true);
    expect(detector.getCardTarget()).toBeNull();
  });

  it("does not reorder columns when the pointer is outside their bounds", () => {
    const detector = createKanbanCollisionDetection(() => columns);
    const input = args(800, 650);
    input.active.id = "column:backlog";
    input.active.data.current = { type: "column", columnId: "backlog" };
    expect(detector(input)).toEqual([]);
  });

  it("retains a missing measurement for one frame, then clears it; leaving the cached zone clears immediately", () => {
    let frame!: () => void;
    const detector = createKanbanCollisionDetection(() => columns, { requestFrame: callback => { frame = callback; return 1; }, cancelFrame: () => {} });
    detector(args(280, 450));
    const missing = args(280, 450);
    missing.droppableRects.delete("card-zone:progress");
    expect(detector(missing)[0]?.id).toBe("card-zone:progress");
    frame();
    expect(detector(missing)).toEqual([]);
    detector(args(280, 450));
    expect(detector(args(190, 450))).toEqual([]);
    detector(args(480, 200));
    detector.clearIfOutside({ x: 800, y: 200 });
    expect(detector.getCardTarget()).toBeNull();
    detector.reset();
  });

  it("appends to a collapsed zone even when its hidden cards remain in board data", () => {
    const detector = createKanbanCollisionDetection(() => columns);
    const input = args(280, 150);
    const zone = input.droppableContainers.find(item => item.id === "card-zone:progress")!;
    zone.data.current = { type: "card-container", columnId: "progress", collapsed: true };
    expect(detector(input)[0]?.id).toBe("card-zone:progress");
    expect(detector.getCardTarget()).toEqual({ columnId: "progress", placement: "append" });
    detector.reset();
  });
});
