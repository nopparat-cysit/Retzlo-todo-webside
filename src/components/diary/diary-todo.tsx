"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { formatDiaryDate } from "@/lib/date-format";
import { getCardColorMeta } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { DiaryTask } from "@/types/diary";

interface DiaryTodoProps {
  projectId: string;
  selectedDate: string;
  tasks: DiaryTask[];
  days?: number;
}

export function DiaryTodo({ projectId, selectedDate, tasks, days = 5 }: DiaryTodoProps) {
  const router = useRouter();
  const dates = Array.from({ length: days }, (_, index) => addDays(selectedDate, index));
  const tasksByDate = new Map<string, DiaryTask[]>();

  for (const task of tasks) {
    const key = task.dueDate.slice(0, 10);
    const current = tasksByDate.get(key) ?? [];
    current.push(task);
    tasksByDate.set(key, current);
  }

  function changeDate(value: string) {
    router.push(`/project/${projectId}/diary?date=${value}`);
  }

  return (
    <div className="space-y-4">
      <Panel className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-dusk-lavender" />
            <h2 className="text-2xl font-semibold">Diary Todo</h2>
          </div>
          <p className="mt-1 text-sm text-stone-400">
            Tasks arranged by day from the selected date.
          </p>
        </div>
        <label className="space-y-2 text-sm text-stone-300">
          <span>Pick day</span>
          <Input
            className="w-52"
            type="date"
            value={selectedDate}
            onChange={(event) => changeDate(event.target.value)}
          />
        </label>
      </Panel>
      <div className="grid gap-3">
        {dates.map((date) => {
          const dayTasks = tasksByDate.get(date) ?? [];
          const isToday = date === new Date().toISOString().slice(0, 10);

          return (
            <section
              key={date}
              className="lofi-panel grid gap-3 rounded-lg p-4 md:grid-cols-[180px_1fr]"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">
                  {isToday ? "Today" : "Day"}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-stone-100">
                  {formatDate(date)}
                </h3>
                <p className="mt-1 text-sm text-stone-500">{dayTasks.length} task(s)</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {dayTasks.length === 0 ? (
                  <div className="rounded-md border border-dashed border-white/10 p-4 text-sm text-stone-500">
                    No task for this day.
                  </div>
                ) : (
                  dayTasks.map((task) => {
                    const colorMeta = getCardColorMeta(task.color);

                    return (
                      <article key={task.id} className={cn("rounded-md border p-3", colorMeta.softClass)}>
                        <p className="font-medium text-stone-100">{task.title}</p>
                        {Array.isArray(task.stickers) && task.stickers.length > 0 && (
                          <div className="flex gap-1.5 mt-1 select-none text-base">
                            {task.stickers.map((st, i) => (
                              <span key={i} title="Sticker stamp">{st}</span>
                            ))}
                          </div>
                        )}
                        {task.description ? (
                          <p className="mt-2 line-clamp-2 text-sm text-stone-400">{task.description}</p>
                        ) : null}
                        <p className={cn("mt-3 text-xs", colorMeta.accentClass)}>{task.column.name}</p>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function addDays(date: string, days: number) {
  const current = new Date(`${date}T12:00:00.000Z`);
  current.setUTCDate(current.getUTCDate() + days);
  return current.toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return formatDiaryDate(`${date}T12:00:00.000+07:00`);
}
