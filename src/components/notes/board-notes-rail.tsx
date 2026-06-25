"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, FileText, Plus, RotateCcw, Save, Star, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ModalPortal } from "@/components/ui/modal-portal";
import { formatMediumDateTime } from "@/lib/date-format";
import { cardColorOptions, getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { ProjectNote } from "@/types/note";

type NoteFilter = "starred" | "recent" | "all" | "completed";
type NoteSort = "updated" | "created" | "title";
const NOTE_EMOJIS = ["📝", "✨", "🌙", "☕", "📌", "💡", "🎧", "🌿", "⭐", "🔥", "🎯", "📚", "💭", "🧠", "🗓️", "🔖", "🎨", "🚀"];

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
    const activeNotes = notes.filter((note) => !note.completedAt);
    const filtered =
      filter === "completed"
        ? notes.filter((note) => note.completedAt)
        : filter === "starred"
          ? activeNotes.filter((note) => note.isStarred)
        : filter === "recent"
          ? activeNotes.slice(0, 8)
          : activeNotes;

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
        emoji: formData.get("emoji"),
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

  async function updateNote(noteId: string, payload: Partial<Pick<ProjectNote, "title" | "content" | "emoji" | "isStarred" | "color">> & { isCompleted?: boolean }) {
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
          <option value="completed">Completed</option>
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
            <article key={note.id} className={cn("relative rounded-md border p-3", colorMeta.softClass)}>
              <button
                className={cn(
                  "absolute right-2.5 top-2.5 z-10 text-stone-600 hover:text-dusk-amber disabled:cursor-not-allowed disabled:opacity-40",
                  note.isStarred && "text-dusk-amber"
                )}
                disabled={!note.canManage}
                type="button"
                aria-label={note.isStarred ? "Unstar note" : "Star note"}
                onClick={() => updateNote(note.id, { isStarred: !note.isStarred })}
              >
                <Star className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-2 pr-6">
                <button className="min-w-0 flex-1 text-left" type="button" onClick={() => note.canManage && setSelectedNote(note)}>
                  <h3 className="flex items-center gap-2 truncate text-sm font-medium text-stone-100">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-sm">
                      {note.emoji}
                    </span>
                    <span className="truncate">{note.title}</span>
                  </h3>
                  {note.completedAt ? (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-dusk-mint/25 bg-dusk-mint/10 px-2 py-0.5 text-[10px] text-dusk-mint">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </span>
                  ) : null}
                  <p className="mt-1 line-clamp-3 text-xs leading-5 text-stone-500">{note.content || "No content."}</p>
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-stone-600">{formatMediumDateTime(note.completedAt ?? note.updatedAt)}</p>
                {note.canManage ? (
                  <button
                    className="inline-flex h-7 items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 text-[11px] text-stone-300 transition hover:border-dusk-mint/35 hover:text-dusk-mint"
                    type="button"
                    onClick={() => updateNote(note.id, { isCompleted: !note.completedAt })}
                  >
                    {note.completedAt ? <RotateCcw className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {note.completedAt ? "Restore" : "Done"}
                  </button>
                ) : null}
              </div>
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
          onToggleComplete={() => updateNote(selectedNote.id, { isCompleted: !selectedNote.completedAt })}
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            updateNote(selectedNote.id, {
              title: String(formData.get("title") ?? ""),
              content: String(formData.get("content") ?? ""),
              emoji: String(formData.get("emoji") ?? "📝"),
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
    <ModalPortal>
      <div className="fixed inset-0 z-[1000] grid place-items-center bg-ink-950/80 px-4 py-4 backdrop-blur-sm">
        <form className="lofi-panel flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl" onSubmit={onSubmit}>
          <ModalHeader title={title} onClose={onClose} />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
            <div className="scrollbar-soft min-h-0 space-y-4 overflow-y-auto p-5">
              <Input name="title" placeholder="Note title" required />
              <Textarea className="min-h-[320px]" name="content" placeholder="Write a note..." />
            </div>
            <aside className="scrollbar-soft min-h-0 space-y-5 overflow-y-auto border-t border-white/10 bg-white/[0.025] p-5 lg:border-l lg:border-t-0">
              <EmojiPicker selectedEmoji="📝" />
              <ColorPicker selectedColor="DEFAULT" />
            </aside>
          </div>
          <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button>{submitLabel}</Button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}

function EditNoteModal({
  note,
  onClose,
  onDelete,
  onToggleComplete,
  onSubmit
}: {
  note: ProjectNote;
  onClose: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[1000] grid place-items-center bg-ink-950/80 px-4 py-4 backdrop-blur-sm">
        <form className="lofi-panel flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl" onSubmit={onSubmit}>
          <ModalHeader title="Edit note" onClose={onClose} />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
            <div className="scrollbar-soft min-h-0 space-y-4 overflow-y-auto p-5">
              <Input name="title" defaultValue={note.title} placeholder="Note title" required />
              <Textarea className="min-h-[320px]" name="content" defaultValue={note.content} placeholder="Write a note..." />
            </div>
            <aside className="scrollbar-soft min-h-0 space-y-5 overflow-y-auto border-t border-white/10 bg-white/[0.025] p-5 lg:border-l lg:border-t-0">
              <EmojiPicker selectedEmoji={note.emoji ?? "📝"} />
              <ColorPicker selectedColor={normalizeCardColor(note.color)} />
            </aside>
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 px-5 py-4">
            <Button type="button" variant="secondary" onClick={onToggleComplete}>
              {note.completedAt ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {note.completedAt ? "Restore" : "Mark complete"}
            </Button>
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
    </ModalPortal>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
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

function EmojiPicker({ selectedEmoji }: { selectedEmoji: string }) {
  return (
    <div className="space-y-2 text-sm text-stone-300">
      <span>Note emoji</span>
      <div className="grid grid-cols-6 gap-2">
        {NOTE_EMOJIS.map((option) => (
          <label
            key={option}
            className={cn(
              "grid h-10 cursor-pointer place-items-center rounded-lg border bg-white/[0.035] text-lg transition hover:-translate-y-0.5 hover:border-dusk-lavender/40",
              selectedEmoji === option ? "border-dusk-amber bg-dusk-amber/10" : "border-white/10"
            )}
          >
            <input className="sr-only" defaultChecked={selectedEmoji === option} name="emoji" type="radio" value={option} />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

function normalizeNote(note: ProjectNote): ProjectNote {
  return {
    ...note,
    emoji: note.emoji ?? "📝",
    color: normalizeCardColor(note.color),
    isStarred: note.isStarred ?? false,
    isHidden: note.isHidden ?? false,
    completedAt: note.completedAt ? new Date(note.completedAt).toISOString() : null,
    createdAt: new Date(note.createdAt).toISOString(),
    updatedAt: new Date(note.updatedAt).toISOString(),
    canManage: note.canManage ?? false,
    canToggleHidden: note.canToggleHidden ?? false
  };
}
