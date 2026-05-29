import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import {
  ProjectsDashboard,
  type GlobalCalendarCard,
  type ProjectDashboardItem
} from "@/components/project/projects-dashboard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CardStatus } from "@/types/kanban";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [projects, calendarCards] = await Promise.all([
    prisma.project.findMany({
      where: {
        members: { some: { userId: session.user.id } }
      },
      include: {
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
    })
  ]);

  return (
    <ProjectsDashboard
      projects={projects.map(toProjectDashboardItem)}
      calendarCards={calendarCards.map(toGlobalCalendarCard)}
    />
  );
}

function toProjectDashboardItem(project: {
  id: string;
  name: string;
  description: string | null;
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
