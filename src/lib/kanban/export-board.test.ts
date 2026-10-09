import { describe, expect, it } from "vitest";
import {
  generateCsvContent,
  prepareExportRows,
  type ExportCardRow
} from "@/lib/kanban/export-board";
import type { ColumnWithCards } from "@/types/kanban";

describe("Export Board Utilities (CSV, Excel, PDF, PNG)", () => {
  const mockColumns: ColumnWithCards[] = [
    {
      id: "col-1",
      name: "To Do",
      position: 0,
      color: "default",
      icon: "kanban",
      defaultCardStatus: "TODO",
      cards: [
        {
          id: "card-1",
          title: "Setup Discord Nitro Theme, with commas",
          description: "A \"quoted\" description\nwith newline",
          note: "Private note",
          position: 0,
          status: "TODO",
          color: "BLUE",
          checklist: [
            { id: "chk-1", label: "Task 1", checked: true },
            { id: "chk-2", label: "Task 2", checked: false }
          ],
          startDate: "2026-10-01T00:00:00.000Z",
          dueDate: "2026-10-05T00:00:00.000Z",
          dueDateAllDay: true,
          priority: "HIGH",
          isStarred: true,
          columnId: "col-1",
          difficulty: 3,
          assigneeIds: ["user-1", "user-2"]
        }
      ]
    },
    {
      id: "col-2",
      name: "Done",
      position: 1,
      color: "mint",
      icon: "kanban",
      defaultCardStatus: "DONE",
      cards: [
        {
          id: "card-2",
          title: "Simple Task",
          description: null,
          note: null,
          position: 0,
          status: "DONE",
          color: "DEFAULT",
          checklist: [],
          dueDate: null,
          dueDateAllDay: false,
          priority: "LOW",
          isStarred: false,
          columnId: "col-2",
          difficulty: null,
          assigneeIds: []
        }
      ]
    }
  ];

  const mockMembers = [
    { id: "user-1", name: "Alice", email: "alice@example.com" },
    { id: "user-2", name: "Bob", email: "bob@example.com" }
  ];

  it("prepareExportRows formats all fields correctly including multi-assignees and checklists", () => {
    const rows = prepareExportRows(mockColumns, mockMembers);

    expect(rows).toHaveLength(2);

    const first = rows[0];
    expect(first.index).toBe(1);
    expect(first.title).toBe("Setup Discord Nitro Theme, with commas");
    expect(first.columnName).toBe("To Do");
    expect(first.status).toBe("To Do");
    expect(first.priorityCode).toBe("P0");
    expect(first.assignees).toBe("Alice, Bob");
    expect(first.difficulty).toBe("3 pts");
    expect(first.checklistProgress).toBe("1/2 (50%)");
    expect(first.isStarred).toContain("⭐");

    const second = rows[1];
    expect(second.index).toBe(2);
    expect(second.title).toBe("Simple Task");
    expect(second.status).toBe("Done");
    expect(second.assignees).toBe("-");
    expect(second.difficulty).toBe("-");
    expect(second.checklistProgress).toBe("-");
  });

  it("generateCsvContent outputs valid RFC 4180 CSV with UTF-8 BOM", () => {
    const rows = prepareExportRows(mockColumns, mockMembers);
    const csv = generateCsvContent(rows);

    // Must start with UTF-8 BOM so Excel opens UTF-8 correctly
    expect(csv.startsWith("\uFEFF")).toBe(true);

    // Headers must exist
    expect(csv).toContain("Task Title");
    expect(csv).toContain("Status");
    expect(csv).toContain("Priority");
    expect(csv).toContain("Assignees");

    // Commas and quotes must be escaped
    expect(csv).toContain('"Setup Discord Nitro Theme, with commas"');
    expect(csv).toContain('"A ""quoted"" description\nwith newline"');

    // Values match
    expect(csv).toContain('"Alice, Bob"');
  });

  it("supports custom board priorities in export", () => {
    const customPriorities = [
      { id: "cp-1", label: "Critical Urgent", color: "#ef4444", level: 1 },
      { id: "cp-2", label: "Low Priority", color: "#3b82f6", level: 2 }
    ];

    const customColumns: ColumnWithCards[] = [
      {
        id: "col-1",
        name: "Backlog",
        position: 0,
        color: "default",
        icon: "kanban",
        defaultCardStatus: "TODO",
        cards: [
          {
            id: "card-custom",
            title: "Urgent fix",
            description: "",
            note: "",
            position: 0,
            status: "TODO",
            color: "DEFAULT",
            checklist: [],
            dueDate: null,
            dueDateAllDay: false,
            priority: "cp-1",
            isStarred: false,
            columnId: "col-1"
          }
        ]
      }
    ];

    const rows = prepareExportRows(customColumns, [], customPriorities);
    expect(rows[0].priority).toContain("Critical Urgent");
  });
});
