import { DiaryTodo } from "@/components/diary/diary-todo";
import { prisma } from "@/lib/prisma";
import { normalizeCardColor } from "@/lib/theme/card-colors";
import type { DiaryTask } from "@/types/diary";

function normalizeDate(date: string | string[] | undefined) {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  return new Date().toISOString().slice(0, 10);
}

function addDays(date: string, days: number) {
  const current = new Date(`${date}T00:00:00.000Z`);
  current.setUTCDate(current.getUTCDate() + days);
  return current;
}

function toDiaryTasks(tasks: Array<{
  id: string;
  title: string;
  description: string | null;
  color: string;
  dueDate: Date | null;
  stickers: unknown;
  column: {
    name: string;
    boardId: string;
  };
}>): DiaryTask[] {
  return tasks
    .filter((task): task is typeof task & { dueDate: Date } => Boolean(task.dueDate))
    .map((task) => ({
      ...task,
      color: normalizeCardColor(task.color),
      dueDate: task.dueDate.toISOString(),
      stickers: Array.isArray(task.stickers) ? (task.stickers as string[]) : []
    }));
}

export default async function DiaryPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { date?: string | string[] };
}) {
  const selectedDate = normalizeDate(searchParams.date);
  const from = addDays(selectedDate, 0);
  const to = addDays(selectedDate, 5);
  const tasks = await prisma.card.findMany({
    where: {
      dueDate: {
        gte: from,
        lt: to
      },
      column: {
        board: {
          projectId: params.id
        }
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
  });

  return <DiaryTodo projectId={params.id} selectedDate={selectedDate} tasks={toDiaryTasks(tasks)} />;
}
