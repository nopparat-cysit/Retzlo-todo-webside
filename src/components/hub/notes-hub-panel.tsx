"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock, CheckCircle2, Eye, EyeOff, FileText, RotateCcw, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { EmptyState } from "@/components/ui/state";
import { setRedStarItem } from "@/components/hub/fab-hub";
import { formatMediumDate, formatMediumDateTime } from "@/lib/date-format";
import { getCardColorMeta } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { ProjectNote } from "@/types/note";

const FILTER_KEY = "retrod:hub:notes:filter";
const PROJECT_KEY = "retrod:hub:notes:project";
const SORT_KEY = "retrod:hub:notes:sort";

type NoteFilter = "all" | "starred" | "dated" | "undated" | "completed";
type NoteSort = "updated" | "created" | "due" | "title";

interface HubNote extends ProjectNote {
  projectName: string;
}

interface NotesHubPanelProps {
  initialNotes: HubNote[];
  projects: { id: string; name: string }[];
}

export function NotesHubPanel({ initialNotes, projects }: NotesHubPanelProps) {
  const [notes, setNotes] = useState<HubNote[]>(initialNotes);
  const [filter, setFilterState] = useState<NoteFilter>("all");
  const [projectFilter, setProjectFilterState] = useState<string>("all");
  const [sortBy, setSortByState] = useState<NoteSort>("updated");
  const [redStarId, setRedStarIdState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loaded = useRef(false);

  // Load persisted filters
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      const f = localStorage.getItem(FILTER_KEY) as NoteFilter | null;
      const p = localStorage.getItem(PROJECT_KEY);
      const s = localStorage.getItem(SORT_KEY) as NoteSort | null;
      if (f) setFilterState(f);
      if (p) setProjectFilterState(p);
      if (s) setSortByState(s);
      const star = localStorage.getItem("retrod:redStar");
      if (star) {
        const parsed = JSON.parse(star) as { type: string; id: string };
        if (parsed.type === "note") setRedStarIdState(parsed.id);
      }
    } catch {}
  }, []);

  function setFilter(f: NoteFilter) {
    setFilterState(f);
    localStorage.setItem(FILTER_KEY, f);
  }

  function setProjectFilter(p: string) {
    setProjectFilterState(p);
    localStorage.setItem(PROJECT_KEY, p);
  }

  function setSortBy(s: NoteSort) {
    setSortByState(s);
    localStorage.setItem(SORT_KEY, s);
  }

  const visibleNotes = useMemo(() => {
    const filtered = notes.filter((note) => {
      if (projectFilter !== "all" && note.projectId !== projectFilter) return false;
      const isCompleted = Boolean(note.completedAt);
      if (filter === "completed") return isCompleted;
      if (isCompleted) return false;
      if (filter === "starred") return note.isStarred;
      if (filter === "dated") return Boolean(note.dueDate);
      if (filter === "undated") return !note.dueDate;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "due") {
        const aT = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bT = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return aT - bT;
      }
      const key = sortBy === "created" ? "createdAt" : "updatedAt";
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    });
  }, [filter, projectFilter, sortBy, notes]);

  async function updateNote(noteId: string, payload: { isStarred?: boolean; isHidden?: boolean; isCompleted?: boolean }) {
    setError(null);
    const response = await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { note?: HubNote; error?: string };
    if (!response.ok || !data.note) {
      setError(data.error ?? "Update failed.");
      return;
    }
    setNotes((cur) => cur.map((n) => (n.id === data.note!.id ? { ...n, ...data.note! } : n)));
  }

  function toggleRedStar(note: HubNote) {
    setRedStarIdState(note.id);
    setRedStarItem({ type: "note", id: note.id, title: note.title, href: "/hub/notes" });
  }

  const FILTER_TABS: { value: NoteFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "starred", label: "Starred" },
    { value: "dated", label: "Dated" },
    { value: "undated", label: "Undated" },
    { value: "completed", label: "Completed" }
  ];

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="lofi-panel flex items-center gap-3 rounded-xl p-5">
        <FileText className="h-6 w-6 text-dusk-cyan" />
        <div>
          <h1 className="text-2xl font-semibold">Notes Hub</h1>
          <p className="mt-0.5 text-sm text-stone-400">All notes across every project.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="lofi-panel flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={cn(
                "h-8 rounded-lg border px-3 text-xs capitalize transition",
                filter === value
                  ? "border-dusk-cyan bg-dusk-cyan text-ink-950"
                  : "border-white/10 bg-white/5 text-stone-300 hover:border-dusk-cyan/50"
              )}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <FilterSelect
            triggerClassName="h-8"
            value={projectFilter}
            options={[
              { value: "all", label: "All projects" },
              ...projects.map((p) => ({ value: p.id, label: p.name }))
            ]}
            onValueChange={setProjectFilter}
          />
          <FilterSelect
            triggerClassName="h-8"
            value={sortBy}
            options={[
              { value: "updated", label: "Updated" },
              { value: "created", label: "Created" },
              { value: "due", label: "Due date" },
              { value: "title", label: "Title" }
            ]}
            onValueChange={setSortBy}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>
      )}

      {/* Notes grid */}
      {visibleNotes.length === 0 ? (
        <EmptyState
          className="lofi-panel border-dashed bg-white/[0.015] p-10"
          title="No notes match"
          message="Change the filters or add a note from a project board."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visibleNotes.map((note) => {
            const colorMeta = getCardColorMeta(note.color);
            const isRedStarred = redStarId === note.id;

            return (
              <article key={note.id} className={cn("relative lofi-panel flex min-h-52 flex-col rounded-xl p-4", colorMeta.softClass)}>
                {/* Red star button */}
                {note.canManage && (
                  <button
                    type="button"
                    className={cn(
                      "absolute right-3.5 top-3.5 z-10 grid h-7 w-7 place-items-center rounded-lg border text-stone-500 transition hover:border-red-400/50 hover:text-red-400",
                      isRedStarred
                        ? "border-red-400/40 bg-red-500/10 text-red-400"
                        : "border-white/10 bg-white/[0.04]"
                    )}
                    aria-label={isRedStarred ? "Pinned to FAB" : "Pin to FAB"}
                    onClick={() => toggleRedStar(note)}
                  >
                    <Star className={cn("h-3.5 w-3.5", isRedStarred && "fill-red-400")} />
                  </button>
                )}
                <div className="mb-3 flex items-start gap-3">
                  <div className="min-w-0 flex-1 pr-8">
                    {/* Project badge */}
                    <span className="mb-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-stone-400">
                      {note.projectName}
                    </span>
                    {note.isHidden && (
                      <span className="ml-1.5 inline-flex items-center gap-1 rounded-full border border-dusk-rose/25 bg-dusk-rose/10 px-2 py-0.5 text-[10px] text-dusk-rose">
                        <EyeOff className="h-3 w-3" /> Hidden
                      </span>
                    )}
                    {note.completedAt && (
                      <span className="ml-1.5 inline-flex items-center gap-1 rounded-full border border-dusk-mint/25 bg-dusk-mint/10 px-2 py-0.5 text-[10px] text-dusk-mint">
                        <CheckCircle2 className="h-3 w-3" /> Completed {formatMediumDate(note.completedAt)}
                      </span>
                    )}
                    <h3 className="mt-1 flex items-center gap-2 truncate text-base font-semibold text-stone-100">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-base">
                        {note.emoji}
                      </span>
                      <span className="truncate">{note.title}</span>
                    </h3>
                    <p className="mt-1.5 line-clamp-4 text-sm leading-6 text-stone-400">{note.content || "No content."}</p>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-stone-500">
                  <span>Updated {formatMediumDate(note.updatedAt)}</span>
                  {note.dueDate && (
                    <span className="inline-flex items-center gap-1 rounded border border-dusk-cyan/20 bg-dusk-cyan/10 px-2 py-0.5 text-dusk-cyan">
                      <CalendarClock className="h-3 w-3" />
                      {formatMediumDateTime(note.dueDate, note.dueDateAllDay)}
                    </span>
                  )}
                </div>

                {note.canToggleHidden && (
                  <Button
                    className="mt-3 w-full"
                    type="button"
                    variant="ghost"
                    onClick={() => updateNote(note.id, { isHidden: !note.isHidden })}
                  >
                    {note.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {note.isHidden ? "Show note" : "Hide note"}
                  </Button>
                )}
                {note.canManage && (
                  <Button
                    className="mt-3 w-full"
                    type="button"
                    variant={note.completedAt ? "ghost" : "secondary"}
                    onClick={() => updateNote(note.id, { isCompleted: !note.completedAt })}
                  >
                    {note.completedAt ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    {note.completedAt ? "Restore note" : "Mark complete"}
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
