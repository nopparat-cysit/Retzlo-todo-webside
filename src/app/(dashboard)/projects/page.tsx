import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import {
  ProjectsDashboard,
  type GlobalCalendarCard,
  type ProjectDashboardItem,
  type UserProfile,
} from "@/components/project/projects-dashboard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CardStatus } from "@/types/kanban";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [projects, calendarCards, userRecord] = await Promise.all([
    prisma.project.findMany({
      where: {
        members: { some: { userId: session.user.id } }
      },
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
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
  ]);

  const userProfile: UserProfile = {
    name: userRecord?.name ?? null,
    avatar: userRecord?.avatar ?? null,
    status: userRecord?.status ?? "ONLINE",
    email: userRecord?.email ?? session.user.email ?? "",
  };

  return (
    <ProjectsDashboard
      projects={projects.map(toProjectDashboardItem)}
      calendarCards={calendarCards.map(toGlobalCalendarCard)}
      userProfile={userProfile}
    />
  );
}

function toProjectDashboardItem(project: {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
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
    coverImage: project.coverImage,
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
