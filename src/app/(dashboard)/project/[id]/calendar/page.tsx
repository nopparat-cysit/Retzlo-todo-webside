import { notFound } from "next/navigation";
import { ProjectCalendar, type CalendarCard, type CalendarNote } from "@/components/kanban/project-calendar";
import { prisma } from "@/lib/prisma";
import { normalizeCardColor } from "@/lib/theme/card-colors";
import { getProjectMembership, requireUserId, canManageAuthoredItem, canToggleHiddenItem } from "@/lib/project-auth";
import { normalizeDiaryChecklist } from "@/lib/diary/checklist";
import { serializeDiaryRewardClaimedDates } from "@/lib/diary/payout";
import type { CardStatus, ChecklistItem } from "@/types/kanban";
import type { ProjectDiaryItem } from "@/types/diary-item";

export default async function CalendarPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) {
    notFound();
  }

  const membership = await getProjectMembership(params.id, userId);
  if (!membership) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { allowMemberPrivateItems: true }
  });

  if (!project) {
    notFound();
  }

  const [cards, notes, diaryItems] = await Promise.all([
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
    }),
    prisma.diaryItem.findMany({
      where: {
        projectId: params.id,
        isHidden: false
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
  ]);

  const initialDiaryItems = toProjectDiaryItems(diaryItems, {
    membership,
    userId,
    allowMemberPrivateItems: project.allowMemberPrivateItems
  });

  return (
    <ProjectCalendar
      projectId={params.id}
      initialCards={cards.map(toCalendarCard)}
      initialNotes={notes.map(toCalendarNote)}
      initialDiaryItems={initialDiaryItems}
    />
  );
}

function toProjectDiaryItems(
  items: any[],
  context: {
    membership: { role: string };
    userId: string;
    allowMemberPrivateItems: boolean;
  }
): ProjectDiaryItem[] {
  return items.map((item) => ({
    ...item,
    color: normalizeCardColor(item.color),
    checklist: normalizeDiaryChecklist(item.checklist, item.startDate),
    rewardClaimedDates: serializeDiaryRewardClaimedDates(item.rewardClaimedDates),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    canManage: canManageAuthoredItem(context.membership, context.userId, item.authorId),
    canToggleHidden: canToggleHiddenItem(
      context.membership,
      context.userId,
      item.authorId,
      context.allowMemberPrivateItems
    )
  }));
}

function toCalendarCard(card: {
  id: string;
  title: string;
  description: string | null;
  note: string | null;
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
    note: card.note,
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
