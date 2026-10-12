import { describe, expect, it } from "vitest";

import { serializeCard } from "./serialize-card";

describe("Phase 2 Kanban Features - Serialization & Activity Data", () => {
  it("serializes card with archive status and attachments correctly", () => {
    const rawCard = {
      id: "c-123",
      title: "Complete Landing Page",
      description: "Needs logo and copy",
      note: "Urgent request",
      status: "IN_PROGRESS",
      color: "INDIGO",
      position: 2,
      columnId: "col-1",
      checklist: [{ id: "check-1", label: "Hero section", checked: true }],
      startDate: new Date("2026-10-10T08:00:00Z"),
      startDateAllDay: false,
      dueDate: new Date("2026-10-15T18:00:00Z"),
      dueDateAllDay: true,
      priority: "HIGH",
      isStarred: true,
      rewardCoins: 50,
      privateCoins: null,
      stickers: ["rocket", "fire"],
      isArchived: true,
      archivedAt: new Date("2026-10-12T10:00:00Z"),
      attachments: [
        {
          id: "att-1",
          cardId: "c-123",
          userId: "user-1",
          name: "wireframe.png",
          url: "https://res.cloudinary.com/demo/image/upload/sample.png",
          size: 1048576,
          fileType: "image/png",
          createdAt: new Date("2026-10-11T12:00:00Z"),
          user: {
            id: "user-1",
            name: "Alex",
            email: "alex@example.com",
            avatar: null
          }
        }
      ],
      createdAt: new Date("2026-10-09T00:00:00Z"),
      updatedAt: new Date("2026-10-12T10:00:00Z")
    };

    const serialized = serializeCard(rawCard as any);

    expect(serialized.id).toBe("c-123");
    expect(serialized.isArchived).toBe(true);
    expect(serialized.archivedAt).toBe("2026-10-12T10:00:00.000Z");
    expect(serialized.attachments).toHaveLength(1);
    expect(serialized.attachments?.[0].name).toBe("wireframe.png");
    expect(serialized.attachments?.[0].fileType).toBe("image/png");
    expect(serialized.attachments?.[0].createdAt).toBe("2026-10-11T12:00:00.000Z");
    expect(serialized.attachments?.[0].user?.name).toBe("Alex");
  });

  it("handles null or undefined archive and attachment values gracefully", () => {
    const rawCard = {
      id: "c-456",
      title: "Simple Task",
      description: null,
      note: null,
      status: "TODO",
      color: "DEFAULT",
      position: 0,
      columnId: "col-2",
      checklist: [],
      startDate: null,
      startDateAllDay: false,
      dueDate: null,
      dueDateAllDay: false,
      priority: "MEDIUM",
      isStarred: false,
      rewardCoins: 0,
      privateCoins: null,
      stickers: [],
      isArchived: false,
      archivedAt: null,
      attachments: []
    };

    const serialized = serializeCard(rawCard as any);

    expect(serialized.isArchived).toBe(false);
    expect(serialized.archivedAt).toBeNull();
    expect(serialized.attachments).toEqual([]);
  });
});
