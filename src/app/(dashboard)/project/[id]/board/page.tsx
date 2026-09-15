import { notFound } from "next/navigation";

import { KanbanBoard } from "@/components/kanban/board";
import { BoardNotesRail } from "@/components/notes/board-notes-rail";
import { ErrorState } from "@/components/ui/state";
import { prisma } from "@/lib/prisma";
import {
  canManageAuthoredItem,
  canToggleHiddenItem,
  getProjectMembership,
  isOwnerRole,
  requireUserId
} from "@/lib/project-auth";
import { getColumnIconOption, getColumnThemeOption } from "@/lib/kanban/column-settings";
import { normalizeCardColor } from "@/lib/theme/card-colors";
import { extractDifficulty } from "@/lib/kanban/difficulty";
import { extractAssigneeIds, resolveAssignees } from "@/lib/kanban/assignees";
import { isDatabaseConnectionError } from "@/lib/safe-db";
import type { CardAssignee, CardStatus, ChecklistItem, ColumnWithCards } from "@/types/kanban";
import type { ProjectNote } from "@/types/note";

function toColumns(
  columns: Array<{
    id: string;
    name: string;
    position: number;
    color?: string | null;
    icon?: string | null;
    defaultCardStatus?: string | null;
    cards: Array<{
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
      rewardCoins: number;
      privateCoins: unknown;
      stickers: unknown;
    }>;
  }>,
  members: CardAssignee[] = []
): ColumnWithCards[] {
  return columns.map((column) => ({
    id: column.id,
    name: column.name,
    position: column.position,
    color: getColumnThemeOption(column.color).id,
    icon: getColumnIconOption(column.icon).id,
    defaultCardStatus: (column.defaultCardStatus ?? "TODO") as CardStatus,
    cards: column.cards.map((card) => {
      const assigneeIds = extractAssigneeIds(card.privateCoins);
      return {
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
        difficulty: extractDifficulty(card.privateCoins),
        assigneeIds,
        assignees: resolveAssignees(assigneeIds, members)
      };
    })
  }));
}


function toProjectNotes(notes: Array<{
  id: string;
  title: string;
  content: string;
  emoji: string;
  color: string;
  isStarred: boolean;
  isHidden: boolean;
  completedAt: Date | null;
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
}>,
context: {
  membership: { role: string };
  userId: string;
  allowMemberPrivateItems: boolean;
}): ProjectNote[] {
  return notes.map((note) => ({
    ...note,
    color: normalizeCardColor(note.color),
    completedAt: note.completedAt ? note.completedAt.toISOString() : null,
    dueDate: note.dueDate ? note.dueDate.toISOString() : null,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    canManage: canManageAuthoredItem(context.membership, context.userId, note.authorId),
    canToggleHidden: canToggleHiddenItem(
      context.membership,
      context.userId,
      note.authorId,
      context.allowMemberPrivateItems
    )
  }));
}

export default async function BoardPage({ params }: { params: { id: string } }) {
  const userId = await requireUserId();

  if (!userId) {
    notFound();
  }

  let membership: Awaited<ReturnType<typeof getProjectMembership>>;
  let project: { allowMemberPrivateItems: boolean; notesEnabled: boolean } | null;
  let board: any = null;
  let notes: any[] = [];
  let projectMembers: any[] = [];

  try {
    membership = await getProjectMembership(params.id, userId);

    if (!membership) {
      notFound();
    }

    project = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        allowMemberPrivateItems: true,
        notesEnabled: true
      }
    });

    if (!project) {
      notFound();
    }

    [board, notes, projectMembers] = await Promise.all([
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
      project.notesEnabled
        ? prisma.note.findMany({
            where: isOwnerRole(membership.role)
              ? { projectId: params.id }
              : {
                  projectId: params.id,
                  OR: [{ isHidden: false }, { authorId: userId }]
                },
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
        : Promise.resolve([]),
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
      return <ProjectDataUnavailable title="Board is waiting for the database" />;
    }

    throw error;
  }

  if (!board) {
    notFound();
  }

  const members: CardAssignee[] = (projectMembers || []).map((pm) => ({
    id: pm.user.id,
    name: pm.user.name,
    email: pm.user.email,
    avatar: pm.user.avatar,
    role: pm.role
  }));

  return (
    <div className={project.notesEnabled ? "grid h-full min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_340px]" : "h-full min-h-0"}>
      <KanbanBoard
        board={{
          id: board.id,
          name: board.name,
          columns: toColumns(board.columns, members)
        }}
        members={members}
      />
      {project.notesEnabled ? (
        <BoardNotesRail
          projectId={params.id}
          initialNotes={toProjectNotes(notes, {
            membership,
            userId,
            allowMemberPrivateItems: project.allowMemberPrivateItems
          })}
        />
      ) : null}
    </div>
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
