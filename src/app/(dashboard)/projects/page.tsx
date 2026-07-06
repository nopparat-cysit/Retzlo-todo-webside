import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import {
  ProjectsDashboard,
  type GlobalCalendarCard,
  type GlobalCalendarDiary,
  type ProjectDashboardItem,
  type UserProfile,
} from "@/components/project/projects-dashboard";
import { FabHub } from "@/components/hub/fab-hub";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDatabaseErrorMessage } from "@/lib/safe-db";
import type { CardStatus } from "@/types/kanban";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  let databaseWarning: string | undefined;

  const [projects, calendarCards, userRecord, diaryItems] = await Promise.all([
    prisma.project.findMany({
      where: {
        members: { some: { userId: session.user.id } }
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        coverImage: true,
        themeColor: true,
        sticker: true,
        _count: {
          select: {
            boards: true,
            members: true,
            notes: true
          }
        },
        boards: {
          take: 1,
          orderBy: { createdAt: "asc" },
          include: {
            columns: {
              orderBy: { position: "asc" },
              take: 4,
              include: {
                cards: {
                  orderBy: { position: "asc" },
                  take: 12,
                  select: {
                    id: true,
                    title: true,
                    status: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.card.findMany({
      where: {
        dueDate: { not: null },
        column: {
          board: {
            project: {
              members: { some: { userId: session.user.id } }
            }
          }
        }
      },
      include: {
        column: {
          select: {
            board: {
              select: {
                project: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [{ dueDate: "asc" }, { position: "asc" }],
      take: 24
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, avatar: true, status: true, email: true },
    }),
    prisma.diaryItem.findMany({
      where: {
        OR: [
          { authorId: session.user.id, projectId: null },
          {
            projectId: { not: null },
            project: {
              members: { some: { userId: session.user.id } }
            }
          }
        ]
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]).catch((error) => {
    console.error("Failed to load projects dashboard data", error);
    databaseWarning = getDatabaseErrorMessage(error);

    return [
      [],
      [],
      {
        name: session.user.name ?? null,
        avatar: null,
        status: "ONLINE",
        email: session.user.email ?? "",
      },
      []
    ] as const;
  });

  const userProfile: UserProfile = {
    name: userRecord?.name ?? null,
    avatar: userRecord?.avatar ?? null,
    status: userRecord?.status ?? "ONLINE",
    email: userRecord?.email ?? session.user.email ?? "",
  };

  return (
    <>
      <ProjectsDashboard
        projects={projects.map(toProjectDashboardItem)}
        calendarCards={calendarCards.map(toGlobalCalendarCard)}
        calendarDiaries={(diaryItems ?? []).map(toGlobalCalendarDiary)}
        userProfile={userProfile}
        databaseWarning={databaseWarning}
      />
      <FabHub />
    </>
  );
}

function toProjectDashboardItem(project: {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  themeColor: string;
  sticker: string;
  type: string;
  _count: {
    boards: number;
    members: number;
    notes: number;
  };
  boards: Array<{
    id: string;
    columns: Array<{
      id: string;
      name: string;
      cards: Array<{
        id: string;
        title: string;
        status: string;
      }>;
    }>;
  }>;
}): ProjectDashboardItem {
  const board = project.boards[0] ?? null;

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    type: project.type,
    coverImage: project.coverImage,
    themeColor: project.themeColor,
    sticker: project.sticker,
    counts: {
      boards: project._count.boards,
      members: project._count.members,
      notes: project._count.notes
    },
    board: board
      ? {
          id: board.id,
          columns: board.columns.map((column) => ({
            id: column.id,
            name: column.name,
            cards: column.cards.map((card) => ({
              id: card.id,
              title: card.title,
              status: card.status as CardStatus
            }))
          }))
        }
      : null
  };
}

function toGlobalCalendarCard(card: {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  dueDateAllDay: boolean;
  column: {
    board: {
      project: {
        id: string;
        name: string;
      };
    };
  };
}): GlobalCalendarCard {
  return {
    id: card.id,
    title: card.title,
    status: card.status as CardStatus,
    dueDate: card.dueDate?.toISOString() ?? new Date().toISOString(),
    dueDateAllDay: card.dueDateAllDay,
    project: card.column.board.project
  };
}

function toGlobalCalendarDiary(diary: any): GlobalCalendarDiary {
  return {
    id: diary.id,
    diaryId: diary.id,
    title: diary.title,
    description: diary.description ?? "",
    color: diary.color,
    intervalDays: diary.intervalDays,
    startDate: diary.startDate.toISOString(),
    checklist: diary.checklist ?? [],
    rewardCoins: diary.rewardCoins,
    rewardCoinType: diary.rewardCoinType,
    rewardClaimedDates: diary.rewardClaimedDates ?? [],
    isStarred: diary.isStarred,
    isHidden: diary.isHidden,
    dueTime: diary.dueTime,
    projectId: diary.projectId,
    project: diary.project
      ? {
          id: diary.project.id,
          name: diary.project.name
        }
      : null
  };
}
