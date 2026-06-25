import { ProjectCalendar, type CalendarCard, type CalendarNote } from "@/components/kanban/project-calendar";
import { prisma } from "@/lib/prisma";
import { normalizeCardColor } from "@/lib/theme/card-colors";
import type { CardStatus, ChecklistItem } from "@/types/kanban";

export default async function CalendarPage({ params }: { params: { id: string } }) {
  const [cards, notes] = await Promise.all([
    prisma.card.findMany({
      where: {
        dueDate: { not: null },
        column: { board: { projectId: params.id } }
      },
      include: {
        column: {
          select: {
            name: true,
            boardId: true
          }
        }
      },
      orderBy: [{ dueDate: "asc" }, { position: "asc" }]
    }),
    prisma.note.findMany({
      where: {
        projectId: params.id,
        completedAt: null,
        dueDate: { not: null }
      },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
    })
  ]);

  return <ProjectCalendar projectId={params.id} initialCards={cards.map(toCalendarCard)} initialNotes={notes.map(toCalendarNote)} />;
}

function toCalendarCard(card: {
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
  column: {
    name: string;
    boardId: string;
  };
}): CalendarCard {
  return {
    id: card.id,
    title: card.title,
    description: card.description,
    position: card.position,
    status: card.status as CardStatus,
    color: normalizeCardColor(card.color),
    checklist: Array.isArray(card.checklist) ? (card.checklist as ChecklistItem[]) : [],
    dueDate: card.dueDate ? card.dueDate.toISOString() : null,
    dueDateAllDay: card.dueDateAllDay,
    priority: card.priority as "LOW" | "MEDIUM" | "HIGH",
    isStarred: card.isStarred,
    columnId: card.columnId,
    column: card.column
  };
}

function toCalendarNote(note: {
  id: string;
  title: string;
  content: string;
  color: string;
  isStarred: boolean;
  dueDate: Date | null;
  dueDateAllDay: boolean;
}): CalendarNote {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    color: normalizeCardColor(note.color),
    isStarred: note.isStarred,
    dueDate: note.dueDate?.toISOString() ?? new Date().toISOString(),
    dueDateAllDay: note.dueDateAllDay
  };
}
