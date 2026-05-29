"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarClock, FileText, Plus, Save, Star, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatMediumDate, formatMediumDateTime } from "@/lib/date-format";
import { applyDueShortcut, composeDueDate } from "@/lib/kanban/due-date";
import { cardColorOptions, getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { ProjectNote } from "@/types/note";

type NoteFilter = "all" | "starred" | "dated" | "undated";
type NoteSort = "updated" | "created" | "due" | "title";

interface NotesPanelProps {
  projectId: string;
  initialNotes: ProjectNote[];
  compact?: boolean;
}

export function NotesPanel({ projectId, initialNotes }: NotesPanelProps) {
  const [notes, setNotes] = useState<ProjectNote[]>(initialNotes);
  const [filter, setFilter] = useState<NoteFilter>("all");
  const [sortBy, setSortBy] = useState<NoteSort>("updated");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ProjectNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visibleNotes = useMemo(() => {
    const filtered = notes.filter((note) => {
      if (filter === "starred") return note.isStarred;
      if (filter === "dated") return Boolean(note.dueDate);
      if (filter === "undated") return !note.dueDate;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "due") {
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
        return aTime - bTime;
      }

      const key = sortBy === "created" ? "createdAt" : "updatedAt";
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    });
  }, [filter, notes, sortBy]);

  async function createNote(payload: NotePayload) {
    const note = await saveNote(`/api/projects/${projectId}/notes`, "POST", payload);

    if (!note) return;

    setNotes((current) => [note, ...current]);
    setSelectedNote(note);
    setIsCreateOpen(false);
  }

  async function updateNote(noteId: string, payload: Partial<NotePayload & { isStarred: boolean }>) {
    const note = await saveNote(`/api/notes/${noteId}`, "PATCH", payload);

    if (!note) return;

    setNotes((current) => current.map((item) => (item.id === note.id ? note : item)));
    setSelectedNote((current) => (current?.id === note.id ? note : current));
  }

  async function saveNote(url: string, method: "POST" | "PATCH", payload: Partial<NotePayload & { isStarred: boolean }>) {
    setError(null);
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { note?: ProjectNote; error?: string };

    if (!response.ok || !data.note) {
      setError(data.error ?? "Something did not sync. Try again.");
      return null;
    }

    return normalizeNote(data.note);
  }

  async function deleteNote(noteId: string) {
    setError(null);
    const response = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Something did not sync. Try again.");
      return;
    }

    setNotes((current) => current.filter((note) => note.id !== noteId));
    setSelectedNote(null);
  }

  return (
    <section className="space-y-4">
      <div className="lofi-panel flex flex-col justify-between gap-3 rounded-lg p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-dusk-lavender" />
            <h2 className="text-2xl font-semibold">Notes</h2>
          </div>
          <p className="mt-1 text-sm text-stone-400">Project notes shown as cards. Dated notes appear on the calendar.</p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add note
        </Button>
      </div>

      <div className="lofi-panel flex flex-col gap-3 rounded-lg p-4 md:flex-row md:items-center md:justify-between">
        <div className="grid grid-cols-2 gap-2 sm:flex">
          {(["all", "starred", "dated", "undated"] as const).map((value) => (
            <button
              key={value}
              className={cn(
                "h-9 rounded-md border px-3 text-sm capitalize transition",
                filter === value
                  ? "border-dusk-lavender bg-dusk-lavender text-ink-950"
                  : "border-white/10 bg-white/5 text-stone-200 hover:border-dusk-lavender/60"
              )}
              type="button"
              onClick={() => setFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <select
          className="h-9 rounded-md border border-white/10 bg-ink-950/50 px-3 text-sm text-stone-100 outline-none"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as NoteSort)}
        >
          <option value="updated">Updated</option>
          <option value="created">Created</option>
          <option value="due">Due date</option>
          <option value="title">Title</option>
        </select>
      </div>

      {error ? <p className="rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}

      {visibleNotes.length === 0 ? (
        <div className="lofi-panel rounded-lg p-8 text-center text-sm text-stone-500">No notes in this view.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visibleNotes.map((note) => {
            const colorMeta = getCardColorMeta(note.color);

            return (
              <article key={note.id} className={cn("lofi-panel flex min-h-56 flex-col rounded-lg p-4", colorMeta.softClass)}>
                <div className="mb-3 flex items-start gap-3">
                  <button
                    className={cn("mt-1 text-stone-600 hover:text-dusk-amber", note.isStarred && "text-dusk-amber")}
                    type="button"
                    onClick={() => updateNote(note.id, { isStarred: !note.isStarred })}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button className="min-w-0 flex-1 text-left" type="button" onClick={() => setSelectedNote(note)}>
                    <h3 className="truncate text-lg font-semibold text-stone-100">{note.title}</h3>
                    <p className="mt-2 line-clamp-5 text-sm leading-6 text-stone-400">{note.content || "No content."}</p>
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-stone-500">
                  <span>Updated {formatMediumDate(note.updatedAt)}</span>
                  {note.dueDate ? (
                    <span className="inline-flex items-center gap-1 rounded border border-dusk-cyan/20 bg-dusk-cyan/10 px-2 py-1 text-dusk-cyan">
                      <CalendarClock className="h-3 w-3" />
                      {formatNoteDue(note)}
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {isCreateOpen ? (
        <NoteEditorModal title="Add note" onClose={() => setIsCreateOpen(false)} onSubmit={createNote} />
      ) : null}
      {selectedNote ? (
        <NoteEditorModal
          note={selectedNote}
          title="Edit note"
          onClose={() => setSelectedNote(null)}
          onDelete={() => deleteNote(selectedNote.id)}
          onSubmit={(payload) => updateNote(selectedNote.id, payload)}
        />
      ) : null}
    </section>
  );
}

interface NotePayload {
  title: string;
  content: string;
  color: CardColor;
  dueDate: string | null;
  dueDateAllDay: boolean;
}

function NoteEditorModal({
  note,
  title,
  onClose,
  onDelete,
  onSubmit
}: {
  note?: ProjectNote;
  title: string;
  onClose: () => void;
  onDelete?: () => void;
  onSubmit: (payload: NotePayload) => void;
}) {
  const [date, setDate] = useState(note?.dueDate ? note.dueDate.slice(0, 10) : "");
  const [time, setTime] = useState(note?.dueDate && !note.dueDateAllDay ? timeValue(note.dueDate) : "");
  const [color, setColor] = useState<CardColor>(normalizeCardColor(note?.color));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const due = composeDueDate(date, time);

    onSubmit({
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      color,
      dueDate: due.dueDate,
      dueDateAllDay: due.dueDateAllDay
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form className="lofi-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg p-5" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Note Card</p>
            <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
          </div>
          <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <Input name="title" defaultValue={note?.title ?? ""} placeholder="Note title" required />
          <Textarea className="min-h-44" name="content" defaultValue={note?.content ?? ""} placeholder="Write a note..." />
          <ColorPicker selectedColor={color} onChange={setColor} />
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-200">
              <CalendarClock className="h-4 w-4 text-dusk-cyan" />
              Calendar
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                ["today", "Today"],
                ["tomorrow", "Tomorrow"],
                ["next-week", "Next week"],
                ["clear", "Clear date"]
              ].map(([value, label]) => (
                <Button
                  className="h-8 px-3"
                  key={value}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setDate(applyDueShortcut(value as "today" | "tomorrow" | "next-week" | "clear"));
                    if (value === "clear") setTime("");
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </div>
            <p className="mt-2 text-xs text-stone-500">No time means all day.</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {onDelete ? (
            <Button type="button" variant="danger" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>
            <Save className="h-4 w-4" />
            Save note
          </Button>
        </div>
      </form>
    </div>
  );
}

function timeValue(value: string) {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatNoteDue(note: ProjectNote) {
  if (!note.dueDate) return "";

  return formatMediumDateTime(note.dueDate, note.dueDateAllDay);
}

function ColorPicker({
  selectedColor,
  onChange
}: {
  selectedColor: CardColor;
  onChange: (color: CardColor) => void;
}) {
  return (
    <div className="space-y-2 text-sm text-stone-300">
      <span>Note color</span>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {cardColorOptions.map((option) => {
          const meta = getCardColorMeta(option.value);

          return (
            <button
              key={option.value}
              className={cn(
                "grid h-10 place-items-center rounded-md border transition hover:scale-[1.03]",
                selectedColor === option.value ? "border-dusk-amber bg-white/10 ring-2 ring-dusk-amber/40" : "border-white/10 bg-white/[0.035]"
              )}
              title={option.label}
              type="button"
              onClick={() => onChange(option.value)}
            >
              <span className={cn("h-5 w-5 rounded-full border", meta.swatchClass)} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function normalizeNote(note: ProjectNote): ProjectNote {
  return {
    ...note,
    color: normalizeCardColor(note.color),
    isStarred: note.isStarred ?? false,
    dueDate: note.dueDate ? new Date(note.dueDate).toISOString() : null,
    dueDateAllDay: note.dueDateAllDay ?? false,
    createdAt: new Date(note.createdAt).toISOString(),
    updatedAt: new Date(note.updatedAt).toISOString()
  };
}
