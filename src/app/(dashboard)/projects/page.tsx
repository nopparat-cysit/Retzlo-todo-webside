import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import type { Prisma } from "@prisma/client";

import {
  ProjectsDashboard,
  type GlobalCalendarCard,
  type GlobalCalendarDiary,
  type GlobalCalendarDiaryRaw,
  type ProjectDashboardItem,
  type UserProfile,
} from "@/components/project/projects-dashboard";
import { FabHub } from "@/components/hub/fab-hub";
import { authOptions } from "@/lib/auth";
import { normalizeDiaryChecklist, type DiaryRewardCoinType } from "@/lib/diary/checklist";
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
        members: {
          where: { userId: session.user.id },
          select: { role: true }
        },
        boards: {
          orderBy: { createdAt: "asc" },
          include: {
            members: {
              select: { userId: true }
            },
            columns: {
              orderBy: { position: "asc" },
              include: {
                cards: {
                  orderBy: { position: "asc" },
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
      orderBy: { createdAt: "desc" },
      take: 100
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
    isAdmin: session.user.globalRole === "ADMIN" || session.user.globalRole === "SUPERADMIN",
  };

  return (
    <>
      <ProjectsDashboard
        projects={(projects ?? []).map((p) => toProjectDashboardItem(p, session.user.id))}
        calendarCards={(calendarCards ?? []).map(toGlobalCalendarCard)}
        calendarDiaries={(diaryItems ?? []).map(toGlobalCalendarDiary)}
        userProfile={userProfile}
        databaseWarning={databaseWarning}
      />
      <FabHub />
    </>
  );
}

function toProjectDashboardItem(
  project: {
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
    members?: Array<{ role: string }>;
    boards: Array<{
      id: string;
      name: string;
      isPrivate: boolean;
      members?: Array<{ userId: string }>;
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
  },
  currentUserId?: string
): ProjectDashboardItem {
  const userRole = project.members?.[0]?.role;
  const isOwner = userRole === "OWNER" || userRole === "ADMIN";

  const visibleBoards = (project.boards ?? []).filter((b) => {
    if (!b.isPrivate) return true;
    if (isOwner) return true;
    return b.members?.some((m) => m.userId === currentUserId);
  });

  const board = visibleBoards[0] ?? null;

  const boardsList = visibleBoards.map((b) => {
    const columns = Array.isArray(b.columns) ? b.columns : [];
    const cards = columns.flatMap((c) => (Array.isArray(c.cards) ? c.cards : []));
    const totalCards = cards.length;
    const doneCards = cards.filter((c) => c.status === "DONE").length;

    return {
      id: b.id,
      name: b.name,
      isPrivate: Boolean(b.isPrivate),
      columnCount: columns.length,
      totalCards,
      doneCards,
      columnsPreview: columns.map((c) => ({
        id: c.id,
        name: c.name,
        cardCount: Array.isArray(c.cards) ? c.cards.length : 0
      }))
    };
  });

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    type: project.type,
    coverImage: project.coverImage,
    themeColor: project.themeColor,
    sticker: project.sticker,
    isOwner,
    counts: {
      boards: project._count?.boards ?? 0,
      members: project._count?.members ?? 0,
      notes: project._count?.notes ?? 0
    },
    boardsList,
    board: board
      ? {
          id: board.id,
          columns: (board.columns ?? []).map((column) => ({
            id: column.id,
            name: column.name,
            cards: (column.cards ?? []).map((card) => ({
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
  const dateStr = card.dueDate instanceof Date
    ? card.dueDate.toISOString()
    : typeof card.dueDate === "string"
    ? card.dueDate
    : new Date().toISOString();

  return {
    id: card.id,
    title: card.title || "Untitled Card",
    status: (card.status || "TODO") as CardStatus,
    dueDate: dateStr,
    dueDateAllDay: Boolean(card.dueDateAllDay),
    project: {
      id: card.column?.board?.project?.id ?? "",
      name: card.column?.board?.project?.name ?? "Workspace"
    }
  };
}

type DiaryWithProject = Prisma.DiaryItemGetPayload<{
  include: {
    project: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

function toGlobalCalendarDiary(diary: DiaryWithProject): GlobalCalendarDiaryRaw {
  const startDateStr = diary.startDate instanceof Date
    ? diary.startDate.toISOString()
    : typeof diary.startDate === "string"
    ? diary.startDate
    : new Date().toISOString();

  return {
    id: diary.id,
    title: diary.title,
    description: diary.description ?? "",
    color: diary.color ?? "DEFAULT",
    intervalDays: diary.intervalDays || 1,
    repeatUnit: (diary.repeatUnit === "MONTH" ? "MONTH" : "DAY") as "DAY" | "MONTH",
    startDate: startDateStr,
    checklist: normalizeDiaryChecklist(diary.checklist, diary.startDate),
    rewardCoins: diary.rewardCoins ?? 0,
    rewardCoinType: (diary.rewardCoinType || "PROJECT") as DiaryRewardCoinType,
    rewardClaimedDates: Array.isArray(diary.rewardClaimedDates) ? (diary.rewardClaimedDates as string[]) : [],
    isStarred: Boolean(diary.isStarred),
    isHidden: Boolean(diary.isHidden),
    dueTime: diary.dueTime ?? null,
    projectId: diary.projectId ?? null,
    project: diary.project
      ? {
          id: diary.project.id,
          name: diary.project.name
        }
      : null
  };
}
