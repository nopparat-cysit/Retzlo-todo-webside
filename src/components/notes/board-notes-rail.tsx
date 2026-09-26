"use client";

import { FormEvent, useMemo, useState, useCallback, useEffect } from "react";
import { CheckCircle2, FileText, FolderKanban, Globe, Lock, Plus, RotateCcw, Save, Star, Trash2, X } from "lucide-react";

import { useLiveSync } from "@/hooks/use-live-sync";

import { AppModal } from "@/components/ui/app-modal";
import { useAppModal } from "@/components/ui/app-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input, Textarea } from "@/components/ui/input";
import { formatMediumDateTime } from "@/lib/date-format";
import { cardColorOptions, getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { ProjectNote } from "@/types/note";

type NoteFilter = "starred" | "recent" | "all" | "completed";
type NoteSort = "updated" | "created" | "title";
type NoteScope = "private" | "board" | "team";
const NOTE_EMOJIS = ["📝", "✨", "🌙", "☕", "📌", "💡", "🎧", "🌿", "⭐", "🔥", "🎯", "📚", "💭", "🧠", "🗓️", "🔖", "🎨", "🚀"];

export function BoardNotesRail({
  projectId,
  initialNotes,
  activeBoardId,
  activeBoardName,
  availableBoards = []
}: {
  projectId: string;
  initialNotes: ProjectNote[];
  activeBoardId?: string;
  activeBoardName?: string;
  availableBoards?: Array<{ id: string; name: string }>;
}) {
  const [notes, setNotes] = useState<ProjectNote[]>(initialNotes);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);
  const [filter, setFilter] = useState<NoteFilter>("starred");
  const [sortBy, setSortBy] = useState<NoteSort>("updated");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ProjectNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
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

  const refreshNotes = useCallback(async () => {
    try {
      const url = activeBoardId
        ? `/api/projects/${projectId}/notes?boardId=${activeBoardId}&includeGeneral=true`
        : `/api/projects/${projectId}/notes`;
      const response = await fetch(url, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" }
      });
      if (!response.ok) return;
      const data = (await response.json()) as { notes?: ProjectNote[] };
      if (Array.isArray(data.notes)) {
        const nextNotes = data.notes.map(normalizeNote);
        setNotes(nextNotes);
      }
    } catch {
      // Ignore background sync errors
    }
  }, [projectId, activeBoardId]);

  const { broadcastChange } = useLiveSync({
    channelKey: `notes:${projectId}`,
    intervalMs: 3000,
    canSync: () => !isCreateOpen && !selectedNote && !document.querySelector("[role='dialog']"),
    onSync: refreshNotes
  });

  async function createNote(payload: {
    title: string;
    content: string;
    emoji: string;
    color: CardColor;
    scope: NoteScope;
  }) {
    setError(null);

    const isHidden = payload.scope === "private";
    const boardId = payload.scope === "board" ? (activeBoardId ?? null) : null;

    const response = await fetch(`/api/projects/${projectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: payload.title,
        content: payload.content,
        emoji: payload.emoji,
        color: payload.color,
        isHidden,
        boardId
      })
    });
    const data = (await response.json()) as { note?: ProjectNote; error?: string };

    if (!response.ok || !data.note) {
      const msg = data.error ?? "Something did not sync. Try again.";
      setError(msg);
      toast({ message: msg, type: "error" });
      return;
    }

    const note = normalizeNote(data.note);
    setNotes((current) => [note, ...current]);
    setIsCreateOpen(false);
    toast({ message: "Note created successfully!", type: "success" });
    broadcastChange();
  }

  async function updateNote(
    noteId: string,
    payload: Partial<Pick<ProjectNote, "title" | "content" | "emoji" | "isStarred" | "color" | "isHidden">> & {
      isCompleted?: boolean;
      boardId?: string | null;
    }
  ) {
    setError(null);
    const response = await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { note?: ProjectNote; error?: string };

    if (!response.ok || !data.note) {
      const msg = data.error ?? "Something did not sync. Try again.";
      setError(msg);
      toast({ message: msg, type: "error" });
      return;
    }

    const note = normalizeNote(data.note);
    setNotes((current) => current.map((item) => (item.id === note.id ? note : item)));
    setSelectedNote((current) => (current?.id === note.id ? note : current));
    if (payload.isCompleted !== undefined) {
      toast({ message: payload.isCompleted ? "Note completed" : "Note restored", type: "info" });
    } else if (payload.isStarred !== undefined) {
      toast({ message: payload.isStarred ? "Note starred" : "Note unstarred", type: "info" });
    } else {
      toast({ message: "Note saved successfully!", type: "success" });
    }
    broadcastChange();
  }

  async function deleteNote(noteId: string) {
    setError(null);
    const response = await fetch(`/api/notes/${noteId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      const msg = data.error ?? "Something did not sync. Try again.";
      setError(msg);
      toast({ message: msg, type: "error" });
      return;
    }

    setNotes((current) => current.filter((note) => note.id !== noteId));
    setSelectedNote((current) => (current?.id === noteId ? null : current));
    toast({ message: "Note deleted successfully!", type: "success" });
    broadcastChange();
  }

  return (
    <aside className="board-notes-rail lofi-panel hidden xl:flex min-h-0 flex-col rounded-lg p-4">
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
        <FilterSelect
          value={filter}
          options={[
            { value: "starred", label: "Starred" },
            { value: "recent", label: "Recent" },
            { value: "all", label: "All notes" },
            { value: "completed", label: "Completed" }
          ]}
          onValueChange={setFilter}
        />
        <FilterSelect
          value={sortBy}
          options={[
            { value: "updated", label: "Updated" },
            { value: "created", label: "Created" },
            { value: "title", label: "Title" }
          ]}
          onValueChange={setSortBy}
        />
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
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      {note.isHidden ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-1.5 py-0.5 text-[10px] font-medium text-dusk-amber">
                          <Lock className="h-2.5 w-2.5" />
                          Private
                        </span>
                      ) : note.board ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-lavender/30 bg-dusk-lavender/10 px-1.5 py-0.5 text-[10px] font-medium text-dusk-lavender">
                          <FolderKanban className="h-2.5 w-2.5" />
                          {note.board.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-stone-400">
                          <Globe className="h-2.5 w-2.5" />
                          Team
                        </span>
                      )}
                      {note.completedAt ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-mint/25 bg-dusk-mint/10 px-1.5 py-0.5 text-[10px] text-dusk-mint">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Done
                        </span>
                      ) : null}
                    </div>
                    <h3 className="flex items-center gap-2 truncate text-sm font-medium text-stone-100">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-sm">
                        {note.emoji}
                      </span>
                      <span className="truncate">{note.title}</span>
                    </h3>
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
        <NoteModal
          title="Add note"
          submitLabel="Add note"
          activeBoardName={activeBoardName}
          hasActiveBoard={Boolean(activeBoardId)}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={createNote}
        />
      ) : null}
      {selectedNote ? (
        <EditNoteModal
          note={selectedNote}
          activeBoardName={activeBoardName}
          hasActiveBoard={Boolean(activeBoardId)}
          onClose={() => setSelectedNote(null)}
          onDelete={() => deleteNote(selectedNote.id)}
          onToggleComplete={() => updateNote(selectedNote.id, { isCompleted: !selectedNote.completedAt })}
          onSubmit={async (payload) => {
            const isHidden = payload.scope === "private";
            const boardId = payload.scope === "board" ? (activeBoardId ?? null) : null;
            await updateNote(selectedNote.id, {
              title: payload.title,
              content: payload.content,
              emoji: payload.emoji,
              color: payload.color,
              isHidden,
              boardId
            });
            setSelectedNote(null);
          }}
        />
      ) : null}
    </aside>
  );
}

function NoteModal({
  title,
  submitLabel,
  activeBoardName,
  hasActiveBoard,
  onClose,
  onSubmit
}: {
  title: string;
  submitLabel: string;
  activeBoardName?: string;
  hasActiveBoard?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    content: string;
    emoji: string;
    color: CardColor;
    scope: NoteScope;
  }) => void | Promise<void>;
}) {
  const [noteTitle, setNoteTitle] = useState("");
  const [content, setContent] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [color, setColor] = useState<CardColor>("DEFAULT");
  const [scope, setScope] = useState<NoteScope>("private");
  const isDirty = noteTitle.trim().length > 0 || content.trim().length > 0;

  return (
    <AppModal
      open
      onClose={onClose}
      hasUnsavedChanges={isDirty}
      onDiscard={onClose}
      labelledBy="board-note-modal-title"
      contentClassName="lofi-panel flex max-h-[calc(100vh-2rem)] max-w-4xl flex-col overflow-hidden rounded-2xl"
    >
      <form
        className="flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            title: noteTitle,
            content,
            emoji,
            color,
            scope
          });
        }}
      >
        <ModalHeader title={title} onClose={onClose} />
        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
          <div className="scrollbar-soft min-h-0 space-y-4 overflow-y-auto p-5">
            <Input
              name="title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title"
              required
            />
            <Textarea
              className="min-h-[320px]"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a note..."
            />
          </div>
          <aside className="scrollbar-soft min-h-0 space-y-5 overflow-y-auto border-t border-white/10 bg-white/[0.025] p-5 lg:border-l lg:border-t-0">
            <ScopeSelector
              scope={scope}
              onChange={setScope}
              activeBoardName={activeBoardName}
              hasActiveBoard={hasActiveBoard}
            />
            <EmojiPicker selectedEmoji={emoji} onChange={setEmoji} />
            <ColorPicker selectedColor={color} onChange={setColor} />
          </aside>
        </div>
        <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button>{submitLabel}</Button>
        </div>
      </form>
    </AppModal>
  );
}

function EditNoteModal({
  note,
  activeBoardName,
  hasActiveBoard,
  onClose,
  onDelete,
  onToggleComplete,
  onSubmit
}: {
  note: ProjectNote;
  activeBoardName?: string;
  hasActiveBoard?: boolean;
  onClose: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onSubmit: (payload: {
    title: string;
    content: string;
    emoji: string;
    color: CardColor;
    scope: NoteScope;
  }) => void | Promise<void>;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? "");
  const [emoji, setEmoji] = useState(note.emoji ?? "📝");
  const [color, setColor] = useState<CardColor>(normalizeCardColor(note.color));
  const [scope, setScope] = useState<NoteScope>(
    note.isHidden ? "private" : note.boardId ? "board" : "team"
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isDirty = useMemo(() => {
    const origScope: NoteScope = note.isHidden ? "private" : note.boardId ? "board" : "team";
    return (
      title !== note.title ||
      content !== (note.content ?? "") ||
      emoji !== (note.emoji ?? "📝") ||
      color !== normalizeCardColor(note.color) ||
      scope !== origScope
    );
  }, [note, title, content, emoji, color, scope]);

  return (
    <>
      <AppModal
        open
        onClose={onClose}
        hasUnsavedChanges={isDirty}
        onDiscard={onClose}
        labelledBy="board-note-modal-title"
        contentClassName="lofi-panel flex max-h-[calc(100vh-2rem)] max-w-4xl flex-col overflow-hidden rounded-2xl"
      >
        <form
          className="flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              title,
              content,
              emoji,
              color,
              scope
            });
          }}
        >
          <ModalHeader title="Edit note" onClose={onClose} />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.8fr)]">
            <div className="scrollbar-soft min-h-0 space-y-4 overflow-y-auto p-5">
              <Input
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                required
              />
              <Textarea
                className="min-h-[320px]"
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a note..."
              />
            </div>
            <aside className="scrollbar-soft min-h-0 space-y-5 overflow-y-auto border-t border-white/10 bg-white/[0.025] p-5 lg:border-l lg:border-t-0">
              <ScopeSelector
                scope={scope}
                onChange={setScope}
                activeBoardName={activeBoardName}
                hasActiveBoard={hasActiveBoard}
              />
              <EmojiPicker selectedEmoji={emoji} onChange={setEmoji} />
              <ColorPicker selectedColor={color} onChange={setColor} />
            </aside>
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 px-5 py-4">
            <Button type="button" variant="secondary" onClick={onToggleComplete}>
              {note.completedAt ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {note.completedAt ? "Restore" : "Mark complete"}
            </Button>
            <Button type="button" variant="danger" onClick={() => setIsDeleteConfirmOpen(true)}>
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
      </AppModal>

      <ConfirmModal
        open={isDeleteConfirmOpen}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete note"
        variant="danger"
        onConfirm={() => {
          setIsDeleteConfirmOpen(false);
          onDelete();
        }}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />
    </>
  );
}

function ScopeSelector({
  scope,
  onChange,
  activeBoardName,
  hasActiveBoard
}: {
  scope: NoteScope;
  onChange: (scope: NoteScope) => void;
  activeBoardName?: string;
  hasActiveBoard?: boolean;
}) {
  return (
    <div className="space-y-2 text-sm text-stone-300">
      <div className="flex items-center justify-between">
        <span className="font-medium text-xs text-stone-400 uppercase tracking-wider">Visibility Scope</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {/* Private Option - Default */}
        <label
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-xs transition select-none",
            scope === "private"
              ? "border-dusk-amber/50 bg-dusk-amber/15 text-dusk-amber font-medium shadow-[0_0_12px_rgba(249,199,132,0.1)]"
              : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-stone-200"
          )}
        >
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span>Private Note</span>
                <span className="rounded bg-dusk-amber/20 px-1 py-0.2 text-[9px] font-mono text-dusk-amber uppercase">Default</span>
              </div>
              <p className="text-[10px] text-stone-500 font-normal">Only you can see this (โน้ตส่วนตัว)</p>
            </div>
          </div>
          <input
            type="radio"
            name="scope"
            value="private"
            checked={scope === "private"}
            onChange={() => onChange("private")}
            className="sr-only"
          />
        </label>

        {/* Board Option */}
        {hasActiveBoard && (
          <label
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-xs transition select-none",
              scope === "board"
                ? "border-dusk-lavender/50 bg-dusk-lavender/15 text-dusk-lavender font-medium shadow-[0_0_12px_rgba(196,181,253,0.1)]"
                : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-stone-200"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <FolderKanban className="h-3.5 w-3.5 shrink-0" />
              <div className="min-w-0">
                <span className="truncate block font-medium">Board: {activeBoardName || "Current"}</span>
                <p className="text-[10px] text-stone-500 font-normal truncate">Members of this board only</p>
              </div>
            </div>
            <input
              type="radio"
              name="scope"
              value="board"
              checked={scope === "board"}
              onChange={() => onChange("board")}
              className="sr-only"
            />
          </label>
        )}

        {/* Team Option */}
        <label
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-xs transition select-none",
            scope === "team"
              ? "border-dusk-cyan/50 bg-dusk-cyan/15 text-dusk-cyan font-medium shadow-[0_0_12px_rgba(103,232,249,0.1)]"
              : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-stone-200"
          )}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 shrink-0" />
            <div>
              <span>Entire Project (Team)</span>
              <p className="text-[10px] text-stone-500 font-normal">Visible to all project members</p>
            </div>
          </div>
          <input
            type="radio"
            name="scope"
            value="team"
            checked={scope === "team"}
            onChange={() => onChange("team")}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Board Note</p>
        <h2 id="board-note-modal-title" className="mt-1 text-2xl font-semibold">{title}</h2>
      </div>
      <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function ColorPicker({
  selectedColor,
  onChange
}: {
  selectedColor: CardColor;
  onChange?: (color: CardColor) => void;
}) {
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
              <input
                className="sr-only"
                checked={selectedColor === option.value}
                onChange={() => onChange?.(option.value)}
                name="color"
                type="radio"
                value={option.value}
              />
              <span className={cn("h-5 w-5 rounded-full border", meta.swatchClass)} />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function EmojiPicker({
  selectedEmoji,
  onChange
}: {
  selectedEmoji: string;
  onChange?: (emoji: string) => void;
}) {
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
            <input
              className="sr-only"
              checked={selectedEmoji === option}
              onChange={() => onChange?.(option)}
              name="emoji"
              type="radio"
              value={option}
            />
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
    boardId: note.boardId ?? null,
    board: note.board ? { id: note.board.id, name: note.board.name } : null,
    completedAt: note.completedAt ? new Date(note.completedAt).toISOString() : null,
    createdAt: new Date(note.createdAt).toISOString(),
    updatedAt: new Date(note.updatedAt).toISOString(),
    canManage: note.canManage ?? false,
    canToggleHidden: note.canToggleHidden ?? false
  };
}
