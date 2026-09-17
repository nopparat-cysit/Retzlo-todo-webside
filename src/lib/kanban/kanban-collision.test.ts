import { describe, expect, it } from "vitest";
import { createKanbanCollisionDetection } from "./kanban-collision";

describe("createKanbanCollisionDetection", () => {
  const columns = [
    { id: "col-1", cards: [{ id: "c1" }, { id: "c2" }] },
    { id: "col-2", cards: [] }
  ];

  it("filters column containers when dragging a column", () => {
    const detector = createKanbanCollisionDetection(() => columns);

    const mockArgs: any = {
      active: {
        id: "column:col-1",
        data: { current: { type: "column" } },
        rect: { current: { translated: { top: 0, left: 0, bottom: 100, right: 100, width: 100, height: 100 } } }
      },
      collisionRect: { top: 0, left: 0, bottom: 100, right: 100, width: 100, height: 100 },
      droppableRects: new Map([
        ["column:col-2", { top: 0, left: 120, bottom: 100, right: 220, width: 100, height: 100 }],
        ["card:c1", { top: 10, left: 10, bottom: 30, right: 90, width: 80, height: 20 }]
      ]),
      droppableContainers: [
        { id: "column:col-2", data: { current: { type: "column" } } },
        { id: "card:c1", data: { current: { type: "card" } } }
      ],
      pointerCoordinates: { x: 50, y: 50 }
    };

    const collisions = detector(mockArgs);
    // Should only match column container, not card container
    expect(collisions.some((c) => String(c.id).startsWith("card:"))).toBe(false);
  });

  it("handles empty column when dragging a card over it", () => {
    const detector = createKanbanCollisionDetection(() => columns);

    const mockArgs: any = {
      active: {
        id: "card:c1",
        data: { current: { type: "card" } },
        rect: { current: { translated: { top: 0, left: 120, bottom: 20, right: 200, width: 80, height: 20 } } }
      },
      collisionRect: { top: 0, left: 120, bottom: 20, right: 200, width: 80, height: 20 },
      droppableRects: new Map([
        ["column:col-2", { top: 0, left: 100, bottom: 300, right: 250, width: 150, height: 300 }]
      ]),
      droppableContainers: [
        { id: "column:col-2", data: { current: { type: "column" } } }
      ],
      pointerCoordinates: { x: 150, y: 50 }
    };

    const collisions = detector(mockArgs);
    expect(collisions[0]?.id).toBe("column:col-2");
  });

  it("excludes active card container to prevent self-collision when column already contains optimistic active card", () => {
    // col-2 now contains c1 optimistically
    const columnsWithOptimisticCard = [
      { id: "col-1", cards: [{ id: "c2" }] },
      { id: "col-2", cards: [{ id: "c1" }] }
    ];
    const detector = createKanbanCollisionDetection(() => columnsWithOptimisticCard);

    const mockArgs: any = {
      active: {
        id: "card:c1",
        data: { current: { type: "card" } },
        rect: { current: { translated: { top: 50, left: 120, bottom: 70, right: 200, width: 80, height: 20 } } }
      },
      collisionRect: { top: 50, left: 120, bottom: 70, right: 200, width: 80, height: 20 },
      droppableRects: new Map([
        ["column:col-2", { top: 0, left: 100, bottom: 300, right: 250, width: 150, height: 300 }],
        ["card:c1", { top: 50, left: 120, bottom: 70, right: 200, width: 80, height: 20 }]
      ]),
      droppableContainers: [
        { id: "column:col-2", data: { current: { type: "column" } } },
        { id: "card:c1", data: { current: { type: "card" } } }
      ],
      pointerCoordinates: { x: 150, y: 60 }
    };

    const collisions = detector(mockArgs);
    // Must NOT return card:c1 (self), should return the column container col-2
    expect(collisions[0]?.id).toBe("column:col-2");
  });
});
