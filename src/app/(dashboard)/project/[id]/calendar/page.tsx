import { notFound } from "next/navigation";
import { ProjectCalendar, type CalendarCard, type CalendarNote } from "@/components/kanban/project-calendar";
import { ErrorState } from "@/components/ui/state";
import { prisma } from "@/lib/prisma";
import { normalizeCardColor } from "@/lib/theme/card-colors";
import {
  canAccessBoard,
  canManageAuthoredItem,
  canToggleHiddenItem,
  getProjectMembership,
  isOwnerRole,
  requireUserId
} from "@/lib/project-auth";
import { normalizeDiaryChecklist } from "@/lib/diary/checklist";
import { serializeDiaryRewardClaimedDates } from "@/lib/diary/payout";
import { extractAssigneeIds, resolveAssignees } from "@/lib/kanban/assignees";
import { extractStartDate, extractStartDateAllDay } from "@/lib/kanban/due-date";
import { extractDifficulty } from "@/lib/kanban/difficulty";
import { normalizeRetroStickerSelection } from "@/lib/stickers/retro-stickers";
import { isDatabaseConnectionError } from "@/lib/safe-db";
import type { CardAssignee, CardStatus, ChecklistItem } from "@/types/kanban";
import type { ProjectDiaryItem } from "@/types/diary-item";

export default async function CalendarPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();
  if (!userId) {
    notFound();
  }

  let membership: Awaited<ReturnType<typeof getProjectMembership>>;
  let project: { allowMemberPrivateItems: boolean } | null;
  let cards: any[] = [];
  let notes: any[] = [];
  let diaryItems: any[] = [];
  let projectMembers: any[] = [];

  try {
    const userMembership = await getProjectMembership(params.id, userId);
    if (!userMembership) {
      notFound();
    }
    membership = userMembership;

    project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { allowMemberPrivateItems: true }
    });

    if (!project) {
      notFound();
    }

    const allBoards = await prisma.board.findMany({
      where: { projectId: params.id },
      include: { members: { select: { userId: true } } }
    });
    const isOwner = isOwnerRole(userMembership.role);
    const accessibleBoards = allBoards.filter((b) =>
      canAccessBoard(b, userId, userMembership.role)
    );
    const accessibleBoardIds = accessibleBoards.map((b) => b.id);

    [cards, notes, diaryItems, projectMembers] = await Promise.all([
      prisma.card.findMany({
        where: {
          dueDate: { not: null },
          column: {
            board: isOwner
              ? { projectId: params.id }
              : { id: { in: accessibleBoardIds } }
          }
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
        where: isOwner
          ? {
              projectId: params.id,
              completedAt: null,
              dueDate: { not: null }
            }
          : {
              projectId: params.id,
              completedAt: null,
              dueDate: { not: null },
              OR: [
                { authorId: userId },
                {
                  isHidden: false,
                  OR: [
                    { boardId: null },
                    { boardId: { in: accessibleBoardIds } }
                  ]
                }
              ]
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
      }),
      prisma.projectMember.findMany({
        where: { projectId: params.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: "asc" }
      })
    ]);
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return <ProjectDataUnavailable title="Calendar is waiting for the database" />;
    }

    throw error;
  }

  const members: CardAssignee[] = (projectMembers || []).map((pm) => ({
    id: pm.user.id,
    name: pm.user.name,
    email: pm.user.email,
    avatar: pm.user.avatar
  }));

  const initialDiaryItems = toProjectDiaryItems(diaryItems, {
    membership,
    userId,
    allowMemberPrivateItems: project.allowMemberPrivateItems
  });

  return (
    <ProjectCalendar
      projectId={params.id}
      initialCards={cards.map((card) => toCalendarCard(card, members))}
      initialNotes={notes.map(toCalendarNote)}
      initialDiaryItems={initialDiaryItems}
      members={members}
      currentUserId={userId}
    />
  );
}

function ProjectDataUnavailable({ title }: { title: string }) {
  return (
    <div className="grid h-full min-h-0 place-items-center p-4">
      <ErrorState
        className="w-full max-w-xl"
        title={title}
        message="The database connection is unavailable right now. Try refreshing once Supabase is reachable again."
      />
    </div>
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
  rewardCoins?: number;
  privateCoins?: unknown;
  stickers?: unknown;
  column: {
    name: string;
    boardId: string;
  };
}, members: CardAssignee[] = []): CalendarCard {
  const assigneeIds = extractAssigneeIds(card.privateCoins);
  return {
    id: card.id,
    title: card.title,
    description: card.description,
    note: card.note,
    position: card.position,
    status: card.status as CardStatus,
    color: normalizeCardColor(card.color),
    checklist: Array.isArray(card.checklist) ? (card.checklist as ChecklistItem[]) : [],
    startDate: extractStartDate(card.privateCoins),
    startDateAllDay: extractStartDateAllDay(card.privateCoins),
    dueDate: card.dueDate ? card.dueDate.toISOString() : null,
    dueDateAllDay: card.dueDateAllDay,
    priority: card.priority as "LOW" | "MEDIUM" | "HIGH",
    isStarred: card.isStarred,
    rewardCoins: card.rewardCoins ?? 0,
    privateCoins: card.privateCoins,
    stickers: normalizeRetroStickerSelection(card.stickers),
    difficulty: extractDifficulty(card.privateCoins),
    columnId: card.columnId,
    column: card.column,
    assigneeIds,
    assignees: resolveAssignees(assigneeIds, members)
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
