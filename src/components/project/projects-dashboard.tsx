"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  FolderKanban,
  KanbanSquare,
  Layers3,
  Plus,
  Sparkles,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { defaultCalendarFilters, filterCalendarItems } from "@/lib/calendar/view";
import { formatShortDue } from "@/lib/date-format";
import { getStatusMeta } from "@/lib/kanban/status";
import { cn } from "@/lib/utils";
import type { CardStatus } from "@/types/kanban";

export interface ProjectDashboardItem {
  id: string;
  name: string;
  description: string | null;
  counts: {
    boards: number;
    members: number;
    notes: number;
  };
  board: {
    id: string;
    columns: Array<{
      id: string;
      name: string;
      cards: Array<{
        id: string;
        title: string;
        status: CardStatus;
      }>;
    }>;
  } | null;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export interface GlobalCalendarCard {
  id: string;
  title: string;
  status: CardStatus;
  dueDate: string;
  dueDateAllDay: boolean;
  project: {
    id: string;
    name: string;
  };
}

export function ProjectsDashboard({
  projects,
  calendarCards
}: {
  projects: ProjectDashboardItem[];
  calendarCards: GlobalCalendarCard[];
}) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [calendarStatusFilters, setCalendarStatusFilters] = useState(defaultCalendarFilters.statuses);
  const [calendarTimeScope, setCalendarTimeScope] = useState(defaultCalendarFilters.timeScope);
  const [calendarRange, setCalendarRange] = useState<"7" | "30" | "all">("30");
  const boardCount = projects.reduce((total, project) => total + project.counts.boards, 0);
  const memberCount = projects.reduce((total, project) => total + project.counts.members, 0);
  const selectedProjectId = projects[0]?.id ?? "";
  const filteredCalendarCards = useMemo(() => {
    const filtered = filterCalendarItems(
      calendarCards.map((card) => ({ ...card, type: "card" as const })),
      {
        ...defaultCalendarFilters,
        statuses: calendarStatusFilters,
        timeScope: calendarTimeScope
      }
    );

    if (calendarRange === "all") return filtered;

    const limit = Number(calendarRange);
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + limit);

    return filtered.filter((card) => {
      const due = new Date(card.dueDate);

      return due >= startOfDay(now) && due <= endOfDay(end);
    });
  }, [calendarCards, calendarRange, calendarStatusFilters, calendarTimeScope]);

  return (
    <main className="min-h-screen w-screen overflow-x-hidden px-4 py-4 sm:px-5 lg:px-6">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="lofi-panel flex flex-col rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md border border-dusk-lavender/40 bg-dusk-lavender/15 text-dusk-lavender">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-dusk-amber">RETROD</p>
              <h1 className="text-xl font-semibold">Workspaces</h1>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">Project</label>
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none transition focus:border-dusk-lavender/70 focus:ring-2 focus:ring-dusk-lavender/20"
              value={selectedProjectId}
              onChange={(event) => {
                if (event.target.value) {
                  router.push(`/project/${event.target.value}/board`);
                }
              }}
            >
              {projects.length === 0 ? <option value="">No projects</option> : null}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-3">
            <StatTile icon={FolderKanban} label="Projects" value={projects.length} />
            <StatTile icon={KanbanSquare} label="Boards" value={boardCount} />
            <StatTile icon={Layers3} label="Members" value={memberCount} />
          </div>

          <div className="mt-5 flex-1 rounded-md border border-white/10 bg-ink-950/35 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-100">
                <CalendarDays className="h-4 w-4 text-dusk-cyan" />
                Calendar
              </div>
              <span className="rounded bg-white/5 px-2 py-1 text-[11px] text-stone-500">{filteredCalendarCards.length}</span>
            </div>
            <div className="mb-3 grid gap-2">
              <select
                className="h-9 rounded-md border border-white/10 bg-ink-950/60 px-2 text-xs text-stone-100 outline-none focus:border-dusk-lavender/70"
                value={calendarRange}
                onChange={(event) => setCalendarRange(event.target.value as "7" | "30" | "all")}
              >
                <option value="7">Next 7 days</option>
                <option value="30">Next 30 days</option>
                <option value="all">All dates</option>
              </select>
              <select
                className="h-9 rounded-md border border-white/10 bg-ink-950/60 px-2 text-xs text-stone-100 outline-none focus:border-dusk-lavender/70"
                value={calendarTimeScope}
                onChange={(event) => setCalendarTimeScope(event.target.value as typeof calendarTimeScope)}
              >
                <option value="all">All times</option>
                <option value="allDay">All-day only</option>
                <option value="timed">Timed only</option>
              </select>
              <div className="grid grid-cols-2 gap-1.5">
                {(["TODO", "DOING", "WAITING", "DONE"] as const).map((status) => {
                  const meta = getStatusMeta(status);

                  return (
                    <label key={status} className="flex cursor-pointer items-center gap-1.5 rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-stone-300">
                      <input
                        checked={calendarStatusFilters[status]}
                        className="h-3.5 w-3.5 accent-dusk-lavender"
                        type="checkbox"
                        onChange={(event) =>
                          setCalendarStatusFilters((current) => ({
                            ...current,
                            [status]: event.target.checked
                          }))
                        }
                      />
                      <span className={cn("h-2 w-2 rounded-full border", meta.badgeClass)} />
                      <span>{meta.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              {filteredCalendarCards.slice(0, 8).map((card) => {
                const status = getStatusMeta(card.status);

                return (
                  <Link
                    key={card.id}
                    className="block rounded-md border border-white/10 bg-white/[0.04] p-3 transition hover:border-dusk-lavender/50 hover:bg-white/[0.07]"
                    href={`/project/${card.project.id}/calendar`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-medium text-stone-100">{card.title}</p>
                      <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[10px]", status.badgeClass)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-1 text-xs text-dusk-cyan">
                      <Clock className="h-3 w-3" />
                      {formatDue(card)}
                    </p>
                    <p className="mt-1 truncate text-xs text-stone-500">{card.project.name}</p>
                  </Link>
                );
              })}
              {filteredCalendarCards.length === 0 ? (
                <div className="rounded-md border border-dashed border-white/10 p-4 text-sm text-stone-500">
                  No cards match the calendar filters.
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-dusk-amber">Project Index</p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Choose your board</h2>
            </div>
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="lofi-panel grid min-h-[420px] place-items-center rounded-lg p-8 text-center">
              <div className="max-w-md">
                <FolderKanban className="mx-auto h-10 w-10 text-dusk-lavender" />
                <h3 className="mt-4 text-2xl font-semibold">No projects yet</h3>
                <p className="mt-2 text-sm text-stone-400">Create the first workspace and RETROD will open its board for you.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>
      </div>

      {isCreateOpen ? <CreateProjectModal onClose={() => setIsCreateOpen(false)} /> : null}
    </main>
  );
}

function ProjectCard({ project }: { project: ProjectDashboardItem }) {
  const cards = project.board?.columns.flatMap((column) => column.cards) ?? [];
  const done = cards.filter((card) => card.status === "DONE").length;
  const completion = cards.length ? Math.round((done / cards.length) * 100) : 0;
  const statusCounts = countStatuses(cards);

  return (
    <article className="lofi-panel flex min-h-[370px] flex-col overflow-hidden rounded-lg p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold">{project.name}</h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-stone-400">
            {project.description ?? "No description yet."}
          </p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-dusk-lavender/30 bg-dusk-lavender/10">
          <KanbanSquare className="h-5 w-5 text-dusk-lavender" />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
        <ProjectMetric label="Members" value={project.counts.members} />
        <ProjectMetric label="Notes" value={project.counts.notes} />
        <ProjectMetric label="Cards" value={cards.length} />
      </div>

      <GraphicPreview completion={completion} statusCounts={statusCounts} columns={project.board?.columns.length ?? 0} />

      <Link
        className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-dusk-lavender px-4 text-sm font-medium text-ink-950 shadow-glow transition hover:bg-dusk-amber"
        href={`/project/${project.id}/board`}
      >
        Go to board
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

function GraphicPreview({
  completion,
  statusCounts,
  columns
}: {
  completion: number;
  statusCounts: Record<CardStatus, number>;
  columns: number;
}) {
  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-md border border-white/10 bg-ink-950/35 p-4">
      <div className="absolute right-4 top-4 h-24 w-24 rounded-full border border-dusk-lavender/20 bg-dusk-lavender/10 blur-sm" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Flow</p>
          <p className="mt-1 text-3xl font-semibold">{completion}%</p>
        </div>
        <div className="grid h-20 w-20 place-items-center rounded-full border border-dusk-lavender/30 bg-white/[0.04]">
          <CheckCircle2 className="h-8 w-8 text-emerald-200" />
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-4 items-end gap-2">
        {(["TODO", "DOING", "WAITING", "DONE"] as const).map((status, index) => {
          const meta = getStatusMeta(status);
          const height = total ? Math.max(18, Math.round((statusCounts[status] / total) * 112)) : 18 + index * 14;

          return (
            <div key={status} className="flex min-h-32 flex-col justify-end gap-2">
              <div
                className={cn("rounded-t-md border transition", meta.badgeClass)}
                style={{ height }}
                title={meta.label}
              />
              <p className="truncate text-center text-[10px] text-stone-500">{meta.label}</p>
            </div>
          );
        })}
      </div>

      <div className="relative mt-4 flex items-center justify-between rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-stone-400">
        <span>{columns} columns</span>
        <span>{total} cards</span>
      </div>
    </div>
  );
}

function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description")
      })
    });
    const data = (await response.json()) as { project?: { id: string }; error?: string };

    setIsPending(false);

    if (!response.ok || !data.project) {
      setError(data.error ?? "Could not create project.");
      return;
    }

    router.push(`/project/${data.project.id}/board`);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form className="lofi-panel w-full max-w-lg rounded-lg p-5" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Workspace</p>
            <h2 className="mt-1 text-2xl font-semibold">New Project</h2>
          </div>
          <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <Input name="name" placeholder="Project name" required />
          <Textarea name="description" placeholder="Description" />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isPending}>{isPending ? "Creating..." : "Create Project"}</Button>
        </div>
      </form>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value
}: {
  icon: typeof FolderKanban;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3">
      <Icon className="h-4 w-4 text-dusk-lavender" />
      <div>
        <p className="text-lg font-semibold leading-none">{value}</p>
        <p className="mt-1 text-xs text-stone-500">{label}</p>
      </div>
    </div>
  );
}

function ProjectMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
      <p className="text-base font-semibold leading-none text-stone-100">{value}</p>
      <p className="mt-1 text-[11px] text-stone-500">{label}</p>
    </div>
  );
}

function countStatuses(cards: Array<{ status: CardStatus }>) {
  return cards.reduce<Record<CardStatus, number>>(
    (acc, card) => ({
      ...acc,
      [card.status]: acc[card.status] + 1
    }),
    {
      TODO: 0,
      DOING: 0,
      WAITING: 0,
      DONE: 0
    }
  );
}

function formatDue(card: GlobalCalendarCard) {
  return formatShortDue(card.dueDate, card.dueDateAllDay);
}
