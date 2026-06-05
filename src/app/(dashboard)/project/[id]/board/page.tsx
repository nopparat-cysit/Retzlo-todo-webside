import { notFound } from "next/navigation";

import { KanbanBoard } from "@/components/kanban/board";
import { BoardNotesRail } from "@/components/notes/board-notes-rail";
import { prisma } from "@/lib/prisma";
import { normalizeCardColor } from "@/lib/theme/card-colors";
import type { CardStatus, ChecklistItem, ColumnWithCards } from "@/types/kanban";
import type { ProjectNote } from "@/types/note";

function toColumns(columns: Array<{
  id: string;
  name: string;
  position: number;
  cards: Array<{
    id: string;
    title: string;
    description: string | null;
    position: number;
    status: string;
    color: string;
    checklist: unknown;
    dueDate: Date | null;
    dueDateAllDay: boolean;
    priority: string;
    isStarred: boolean;
    columnId: string;
    rewardCoins: number;
    privateCoins: unknown;
    stickers: unknown;
  }>;
}>): ColumnWithCards[] {
  return columns.map((column) => ({
    id: column.id,
    name: column.name,
    position: column.position,
    cards: column.cards.map((card) => ({
      ...card,
      status: card.status as CardStatus,
      color: normalizeCardColor(card.color),
      checklist: Array.isArray(card.checklist) ? (card.checklist as ChecklistItem[]) : [],
      dueDate: card.dueDate ? card.dueDate.toISOString() : null,
      dueDateAllDay: card.dueDateAllDay,
      priority: card.priority as "LOW" | "MEDIUM" | "HIGH",
      isStarred: card.isStarred,
      rewardCoins: card.rewardCoins,
      privateCoins: card.privateCoins,
      stickers: Array.isArray(card.stickers) ? (card.stickers as string[]) : [],
    }))
  }));
}


function toProjectNotes(notes: Array<{
  id: string;
  title: string;
  content: string;
  color: string;
  isStarred: boolean;
  dueDate: Date | null;
  dueDateAllDay: boolean;
  projectId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    name: string | null;
    email: string;
  };
}>): ProjectNote[] {
  return notes.map((note) => ({
    ...note,
    color: normalizeCardColor(note.color),
    dueDate: note.dueDate ? note.dueDate.toISOString() : null,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString()
  }));
}

export default async function BoardPage({ params }: { params: { id: string } }) {
  const [board, notes] = await Promise.all([
    prisma.board.findFirst({
      where: { projectId: params.id },
      orderBy: { createdAt: "asc" },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            cards: { orderBy: { position: "asc" } }
          }
        }
      }
    }),
    prisma.note.findMany({
      where: { projectId: params.id },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [{ isStarred: "desc" }, { updatedAt: "desc" }],
      take: 40
    })
  ]);

  if (!board) {
    notFound();
  }

  return (
    <div className="grid h-[calc(100vh-1.5rem)] min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
      <KanbanBoard
        board={{
          id: board.id,
          name: board.name,
          columns: toColumns(board.columns)
        }}
      />
      <BoardNotesRail projectId={params.id} initialNotes={toProjectNotes(notes)} />
    </div>
  );
}
