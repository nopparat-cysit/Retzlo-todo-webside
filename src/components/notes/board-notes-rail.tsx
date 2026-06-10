"use client";

import { FormEvent, useMemo, useState } from "react";
import { FileText, Plus, Save, Star, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatMediumDateTime } from "@/lib/date-format";
import { cardColorOptions, getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { ProjectNote } from "@/types/note";

type NoteFilter = "starred" | "recent" | "all";
type NoteSort = "updated" | "created" | "title";

export function BoardNotesRail({
  projectId,
  initialNotes
}: {
  projectId: string;
  initialNotes: ProjectNote[];
}) {
  const [notes, setNotes] = useState<ProjectNote[]>(initialNotes);
  const [filter, setFilter] = useState<NoteFilter>("starred");
  const [sortBy, setSortBy] = useState<NoteSort>("updated");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ProjectNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visibleNotes = useMemo(() => {
    const filtered =
      filter === "starred"
        ? notes.filter((note) => note.isStarred)
        : filter === "recent"
          ? notes.slice(0, 8)
          : notes;

    return [...filtered].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }

      const key = sortBy === "created" ? "createdAt" : "updatedAt";
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    });
  }, [filter, notes, sortBy]);

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch(`/api/projects/${projectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        content: formData.get("content"),
        color: formData.get("color")
      })
    });
    const data = (await response.json()) as { note?: ProjectNote; error?: string };

    if (!response.ok || !data.note) {
      setError(data.error ?? "Something did not sync. Try again.");
      return;
    }

    const note = normalizeNote(data.note);
    setNotes((current) => [note, ...current]);
    setSelectedNote(note);
    setIsCreateOpen(false);
    form.reset();
  }

  async function updateNote(noteId: string, payload: Partial<Pick<ProjectNote, "title" | "content" | "isStarred" | "color">>) {
    setError(null);
    const response = await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { note?: ProjectNote; error?: string };

    if (!response.ok || !data.note) {
      setError(data.error ?? "Something did not sync. Try again.");
      return;
    }

    const note = normalizeNote(data.note);
    setNotes((current) => current.map((item) => (item.id === note.id ? note : item)));
    setSelectedNote((current) => (current?.id === note.id ? note : current));
  }

  async function deleteNote(noteId: string) {
    setError(null);
    const response = await fetch(`/api/notes/${noteId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Something did not sync. Try again.");
      return;
    }

    setNotes((current) => current.filter((note) => note.id !== noteId));
    setSelectedNote((current) => (current?.id === noteId ? null : current));
  }

  return (
    <aside className="lofi-panel flex min-h-0 flex-col rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-dusk-lavender" />
            <h2 className="text-lg font-semibold">Notes</h2>
          </div>
          <p className="mt-1 text-xs text-stone-500">Pinned thoughts for this board.</p>
        </div>
        <Button className="h-9 px-3" type="button" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          className="h-9 rounded-md border border-white/10 bg-ink-950/50 px-2 text-xs text-stone-100 outline-none"
          value={filter}
          onChange={(event) => setFilter(event.target.value as NoteFilter)}
        >
          <option value="starred">Starred</option>
          <option value="recent">Recent</option>
          <option value="all">All notes</option>
        </select>
        <select
          className="h-9 rounded-md border border-white/10 bg-ink-950/50 px-2 text-xs text-stone-100 outline-none"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as NoteSort)}
        >
          <option value="updated">Updated</option>
          <option value="created">Created</option>
          <option value="title">Title</option>
        </select>
      </div>

      {error ? <p className="mt-3 rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}

      <div className="scrollbar-soft mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {visibleNotes.length === 0 ? (
          <div className="rounded-md border border-dashed border-white/10 p-4 text-sm text-stone-500">
            No notes in this view.
          </div>
        ) : (
          visibleNotes.map((note) => {
            const colorMeta = getCardColorMeta(note.color);

            return (
            <article key={note.id} className={cn("rounded-md border p-3", colorMeta.softClass)}>
              <div className="flex items-start gap-2">
                <button
                  className={cn(
                    "mt-0.5 text-stone-600 hover:text-dusk-amber disabled:cursor-not-allowed disabled:opacity-40",
                    note.isStarred && "text-dusk-amber"
                  )}
                  disabled={!note.canManage}
                  type="button"
                  aria-label={note.isStarred ? "Unstar note" : "Star note"}
                  onClick={() => updateNote(note.id, { isStarred: !note.isStarred })}
                >
                  <Star className="h-4 w-4" />
                </button>
                <button className="min-w-0 flex-1 text-left" type="button" onClick={() => note.canManage && setSelectedNote(note)}>
                  <h3 className="truncate text-sm font-medium text-stone-100">{note.title}</h3>
                  <p className="mt-1 line-clamp-3 text-xs leading-5 text-stone-500">{note.content || "No content."}</p>
                </button>
              </div>
              <p className="mt-2 text-[11px] text-stone-600">{formatMediumDateTime(note.updatedAt)}</p>
            </article>
            );
          })
        )}
      </div>

      {isCreateOpen ? (
        <NoteModal title="Add note" submitLabel="Add note" onClose={() => setIsCreateOpen(false)} onSubmit={createNote} />
      ) : null}
      {selectedNote ? (
        <EditNoteModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onDelete={() => deleteNote(selectedNote.id)}
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            updateNote(selectedNote.id, {
              title: String(formData.get("title") ?? ""),
              content: String(formData.get("content") ?? ""),
              color: normalizeCardColor(formData.get("color"))
            });
          }}
        />
      ) : null}
    </aside>
  );
}

function NoteModal({
  title,
  submitLabel,
  onClose,
  onSubmit
}: {
  title: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form className="lofi-panel w-full max-w-lg rounded-lg p-5" onSubmit={onSubmit}>
        <ModalHeader title={title} onClose={onClose} />
        <div className="space-y-3">
          <Input name="title" placeholder="Note title" required />
          <Textarea className="min-h-40" name="content" placeholder="Write a note..." />
          <ColorPicker selectedColor="DEFAULT" />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>{submitLabel}</Button>
        </div>
      </form>
    </div>
  );
}

function EditNoteModal({
  note,
  onClose,
  onDelete,
  onSubmit
}: {
  note: ProjectNote;
  onClose: () => void;
  onDelete: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form className="lofi-panel w-full max-w-lg rounded-lg p-5" onSubmit={onSubmit}>
        <ModalHeader title="Edit note" onClose={onClose} />
        <div className="space-y-3">
          <Input name="title" defaultValue={note.title} placeholder="Note title" required />
          <Textarea className="min-h-40" name="content" defaultValue={note.content} placeholder="Write a note..." />
          <ColorPicker selectedColor={normalizeCardColor(note.color)} />
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="danger" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Board Note</p>
        <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
      </div>
      <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function ColorPicker({ selectedColor }: { selectedColor: CardColor }) {
  return (
    <div className="space-y-2 text-sm text-stone-300">
      <span>Note color</span>
      <div className="flex flex-wrap gap-2">
        {cardColorOptions.map((option) => {
          const meta = getCardColorMeta(option.value);

          return (
            <label
              key={option.value}
              className={cn(
                "grid h-8 w-8 cursor-pointer place-items-center rounded-full border bg-white/[0.035] transition hover:scale-105 hover:border-white/25",
                selectedColor === option.value
                  ? "border-dusk-amber ring-2 ring-dusk-amber/45 ring-offset-2 ring-offset-ink-950"
                  : "border-white/10"
              )}
              title={option.label}
            >
              <input className="sr-only" defaultChecked={selectedColor === option.value} name="color" type="radio" value={option.value} />
              <span className={cn("h-5 w-5 rounded-full border", meta.swatchClass)} />
            </label>
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
    isHidden: note.isHidden ?? false,
    createdAt: new Date(note.createdAt).toISOString(),
    updatedAt: new Date(note.updatedAt).toISOString(),
    canManage: note.canManage ?? false,
    canToggleHidden: note.canToggleHidden ?? false
  };
}
