import { describe, expect, it } from "vitest";
import { extractAiCreateCardProposal } from "./chat-actions";

describe("extractAiCreateCardProposal", () => {
  const dummyContext = {
    projectId: "proj-123",
    boardId: "board-456",
    boardName: "Sprint Board",
    columns: [
      { id: "col-1", name: "To Do", defaultCardStatus: "TODO" },
      { id: "col-2", name: "In Progress", defaultCardStatus: "DOING" },
      { id: "col-3", name: "Done", defaultCardStatus: "DONE" }
    ]
  };

  it("extracts proposal with valid dueDate and maps to calendar format", () => {
    const aiReply = `Sure! I have prepared your schedule:
<retzlo_create_cards>[
  {
    "columnName": "To Do",
    "title": "Architecture Review",
    "description": "Review system design with team",
    "priority": "HIGH",
    "dueDate": "2026-11-20",
    "dueDateAllDay": true
  },
  {
    "columnName": "In Progress",
    "title": "API Implementation",
    "description": null,
    "priority": "MEDIUM",
    "dueDate": "2026-11-22T15:00:00.000Z",
    "dueDateAllDay": false
  }
]</retzlo_create_cards>`;

    const result = extractAiCreateCardProposal(aiReply, dummyContext);

    expect(result.proposal).not.toBeNull();
    expect(result.proposal?.cards).toHaveLength(2);

    const firstCard = result.proposal!.cards[0];
    expect(firstCard.title).toBe("Architecture Review");
    expect(firstCard.columnId).toBe("col-1");
    expect(firstCard.status).toBe("TODO");
    expect(firstCard.dueDate).toBe("2026-11-20T00:00:00.000Z");
    expect(firstCard.dueDateAllDay).toBe(true);

    const secondCard = result.proposal!.cards[1];
    expect(secondCard.title).toBe("API Implementation");
    expect(secondCard.columnId).toBe("col-2");
    expect(secondCard.status).toBe("DOING");
    expect(secondCard.dueDate).toBe("2026-11-22T15:00:00.000Z");
    expect(secondCard.dueDateAllDay).toBe(false);

    expect(result.reply).toBe("Sure! I have prepared your schedule:");
  });

  it("handles null context gracefully", () => {
    const aiReply = `<retzlo_create_cards>[{"columnName":"To Do","title":"Task 1"}]</retzlo_create_cards>`;
    const result = extractAiCreateCardProposal(aiReply, null);
    expect(result.proposal).toBeNull();
    expect(result.reply).toContain("Cards can only be created from a project with an active board");
  });

  it("ignores reply without create cards tags", () => {
    const aiReply = "Here are some ideas on how to plan your week: 1. Do research 2. Code";
    const result = extractAiCreateCardProposal(aiReply, dummyContext);
    expect(result.proposal).toBeNull();
    expect(result.reply).toBe(aiReply);
  });
});
