import { prisma } from "@/lib/prisma";

export async function seedWelcomeWorkspace(userId: string, userName?: string) {
  const displayName = userName?.trim() || "Dreamer";
  const defaultColumns = [
    { name: "Backlog", defaultCardStatus: "TODO" as const, position: 0 },
    { name: "In Progress", defaultCardStatus: "DOING" as const, position: 1 },
    { name: "Done", defaultCardStatus: "DONE" as const, position: 2 }
  ];

  const project = await prisma.project.create({
    data: {
      name: "✨ Welcome to Retzlo",
      description: "Your starter workspace. Feel free to explore, move cards, or customize as you like!",
      type: "WORK",
      themeColor: "LAVENDER",
      sticker: "/stickers/retro/retro-sticker-01-cassette.png",
      members: {
        create: {
          userId,
          role: "OWNER"
        }
      },
      boards: {
        create: {
          name: "Main Board",
          columns: {
            create: defaultColumns
          }
        }
      }
    },
    include: {
      boards: {
        include: {
          columns: true
        }
      }
    }
  });

  const board = project.boards[0];
  if (board && board.columns.length >= 3) {
    const backlogCol = board.columns.find((c) => c.name === "Backlog") || board.columns[0];
    const inProgressCol = board.columns.find((c) => c.name === "In Progress") || board.columns[1];
    const doneCol = board.columns.find((c) => c.name === "Done") || board.columns[2];

    const sampleCards = [
      {
        columnId: backlogCol.id,
        title: `👋 Welcome to Retzlo, ${displayName}!`,
        description: "Click this card to explore task details, checklists, color themes, and retro stickers.\n\nTip: You can assign members, set due dates, and track difficulty scores.",
        status: "TODO" as const,
        color: "LAVENDER" as const,
        priority: "MEDIUM" as const,
        position: 0,
        checklist: [
          { id: "cl-1", text: "Explore the Kanban board", checked: false },
          { id: "cl-2", text: "Try changing a card's color theme", checked: false },
          { id: "cl-3", text: "Listen to lofi tracks on the Cassette deck", checked: false }
        ]
      },
      {
        columnId: inProgressCol.id,
        title: "🎵 Drag this card across columns",
        description: "Retzlo supports smooth drag-and-drop with optimistic updates. Drag me to 'Done' to see column points update in real time!",
        status: "DOING" as const,
        color: "CYAN" as const,
        priority: "HIGH" as const,
        position: 0,
        rewardCoins: 5,
        stickers: ["/stickers/retro/retro-sticker-01-cassette.png"],
        checklist: []
      },
      {
        columnId: doneCol.id,
        title: "✨ Create your account",
        description: "You've successfully joined Retzlo. Your retro lofi work and life desk is ready.",
        status: "DONE" as const,
        color: "AMBER" as const,
        priority: "LOW" as const,
        position: 0,
        isStarred: true,
        checklist: [
          { id: "cl-done", text: "Sign up and enter workspace", checked: true }
        ]
      }
    ];

    for (const cardData of sampleCards) {
      await prisma.card.create({
        data: cardData
      });
    }
  }

  return project;
}
