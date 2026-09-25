"use client";

import { FormEvent, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { useLiveSync } from "@/hooks/use-live-sync";
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  Globe,
  Grid2X2,
  Grid3X3,
  LayoutGrid,
  List,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Star,
  Trash2,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppModal } from "@/components/ui/app-modal";
import { useAppModal } from "@/components/ui/app-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/state";
import { RetroStickerImage } from "@/components/stickers/retro-sticker-picker";
import { formatMediumDate, formatMediumDateTime } from "@/lib/date-format";
import { applyDueShortcut, composeDueDate } from "@/lib/kanban/due-date";
import { isSharedIconPath, sharedIconOptions } from "@/lib/stickers/shared-icon-options";
import { cardColorOptions, getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { ProjectNote } from "@/types/note";

type NoteFilter = "all" | "starred" | "dated" | "undated" | "completed";
type NoteSort = "updated" | "created" | "due" | "title";
type NoteViewMode = "grid-2" | "grid-3" | "grid-4" | "list";
type NoteScope = "private" | "board" | "team";
const DEFAULT_NOTE_STICKER = "/stickers/retro/retro-sticker-12-paper-note.png";
const NOTE_FILTERS: Array<{ value: NoteFilter; label: string; hint: string }> = [
  { value: "all", label: "Active", hint: "Open notes" },
  { value: "starred", label: "Starred", hint: "Pinned ideas" },
  { value: "dated", label: "Dated", hint: "Calendar notes" },
  { value: "undated", label: "Undated", hint: "Free notes" },
  { value: "completed", label: "Completed", hint: "Archived wins" }
];
const NOTE_VIEW_MODES: Array<{ value: NoteViewMode; label: string; icon: typeof Grid2X2 }> = [
  { value: "grid-2", label: "2", icon: Grid2X2 },
  { value: "grid-3", label: "3", icon: Grid3X3 },
  { value: "grid-4", label: "4", icon: LayoutGrid },
  { value: "list", label: "List", icon: List }
];

interface NotesPanelProps {
  projectId: string;
  initialNotes: ProjectNote[];
  allowMemberPrivateItems: boolean;
  isOwner: boolean;
  compact?: boolean;
  availableBoards?: Array<{ id: string; name: string; isPrivate?: boolean }>;
}

export function NotesPanel({
  projectId,
  initialNotes,
  allowMemberPrivateItems,
  isOwner,
  availableBoards = []
}: NotesPanelProps) {
  const [notes, setNotes] = useState<ProjectNote[]>(initialNotes);
  const [filter, setFilter] = useState<NoteFilter>("all");
  const [boardFilter, setBoardFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<NoteSort>("updated");
  const [viewMode, setViewMode] = useState<NoteViewMode>("grid-3");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ProjectNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const visibleNotes = useMemo(() => {
    const filtered = notes.filter((note) => {
      if (boardFilter === "general") {
        if (note.boardId) return false;
      } else if (boardFilter !== "all") {
        if (note.boardId !== boardFilter) return false;
      }

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
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
        return aTime - bTime;
      }

      const key = sortBy === "created" ? "createdAt" : "updatedAt";
      return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    });
  }, [filter, boardFilter, notes, sortBy]);
  const activeNotes = useMemo(() => notes.filter((note) => !note.completedAt), [notes]);
  const completedNotes = useMemo(() => notes.filter((note) => note.completedAt), [notes]);
  const recentNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4),
    [notes]
  );
  const filterCounts: Record<NoteFilter, number> = {
    all: activeNotes.length,
    starred: activeNotes.filter((note) => note.isStarred).length,
    dated: activeNotes.filter((note) => note.dueDate).length,
    undated: activeNotes.filter((note) => !note.dueDate).length,
    completed: completedNotes.length
  };

  const refreshNotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/notes`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" }
      });
      if (!response.ok) return;
      const data = (await response.json()) as { notes?: ProjectNote[] };
      if (Array.isArray(data.notes)) {
        setNotes(data.notes.map(normalizeNote));
      }
    } catch {
      // Ignore background sync errors
    }
  }, [projectId]);

  const { broadcastChange } = useLiveSync({
    channelKey: `notes:${projectId}`,
    intervalMs: 3000,
    canSync: () => !isCreateOpen && !selectedNote && !document.querySelector("[role='dialog']"),
    onSync: refreshNotes
  });

  async function createNote(payload: NotePayload) {
    const note = await saveNote(`/api/projects/${projectId}/notes`, "POST", payload);

    if (!note) {
      toast({ message: "Could not create note.", type: "error" });
      return null;
    }

    setNotes((current) => [note, ...current]);
    setIsCreateOpen(false);
    toast({ message: "Note created successfully!", type: "success" });
    broadcastChange();
    return note;
  }

  async function updateNote(noteId: string, payload: Partial<NotePayload & { isStarred: boolean; isHidden: boolean; isCompleted: boolean }>) {
    const note = await saveNote(`/api/notes/${noteId}`, "PATCH", payload);

    if (!note) {
      toast({ message: "Could not update note.", type: "error" });
      return;
    }

    setNotes((current) => current.map((item) => (item.id === note.id ? note : item)));
    setSelectedNote((current) => (current?.id === note.id ? note : current));
    if (payload.isCompleted !== undefined) {
      toast({ message: payload.isCompleted ? "Note completed" : "Note restored", type: "info" });
    } else if (payload.isStarred !== undefined) {
      toast({ message: payload.isStarred ? "Note starred" : "Note unstarred", type: "info" });
    } else if (payload.isHidden !== undefined) {
      toast({ message: payload.isHidden ? "Note hidden from members" : "Note visible to members", type: "info" });
    } else {
      toast({ message: "Note saved successfully!", type: "success" });
    }
    broadcastChange();
  }

  async function saveNote(
    url: string,
    method: "POST" | "PATCH",
    payload: Partial<NotePayload & { isStarred: boolean; isHidden: boolean; isCompleted: boolean }>
  ) {
    setError(null);
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { note?: ProjectNote; error?: string };

    if (!response.ok || !data.note) {
      const err = data.error ?? "Something did not sync. Try again.";
      setError(err);
      return null;
    }

    return normalizeNote(data.note);
  }

  async function deleteNote(noteId: string) {
    setError(null);
    const response = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      const err = data.error ?? "Something did not sync. Try again.";
      setError(err);
      toast({ message: err, type: "error" });
      return;
    }

    setNotes((current) => current.filter((note) => note.id !== noteId));
    setSelectedNote(null);
    toast({ message: "Note deleted successfully!", type: "success" });
    broadcastChange();
  }

  async function quickCreateNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("quickTitle") ?? "").trim();
    const content = String(formData.get("quickContent") ?? "").trim();

    if (!title) {
      setError("Note title is required.");
      return;
    }

    const note = await createNote({
      title,
      content,
      emoji: DEFAULT_NOTE_STICKER,
      color: "DEFAULT",
      dueDate: null,
      dueDateAllDay: false,
      isHidden: false
    });

    if (note) form.reset();
  }

  return (
    <section className="grid h-full min-h-0 grid-rows-[max-content_minmax(0,1fr)] gap-3" data-notes-layout="reward-style">
      <div className="lofi-panel relative isolate overflow-hidden rounded-lg px-4 py-2.5" data-notes-hero-layout="single-row">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-dusk-amber">
              <FileText className="h-3.5 w-3.5" />
              Note Studio
            </div>
            <h2 className="mt-1 text-lg font-semibold text-stone-100 sm:text-xl">Notes that feel easy to return to</h2>
            <p className="mt-0.5 max-w-2xl text-xs leading-5 text-stone-400">
              Capture ideas, pin important notes, date them for calendar rhythm, then archive completed notes without mixing them with hidden visibility.
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <NoteStat label="Active" value={activeNotes.length} tone="lavender" />
            <NoteStat label="Starred" value={filterCounts.starred} tone="amber" />
            <NoteStat label="Done" value={completedNotes.length} tone="mint" />
            <div className="relative h-12 w-14">
              <Image
                alt=""
                className="object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)]"
                fill
                sizes="56px"
                src="/stickers/retro/retro-sticker-12-paper-note.png"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 gap-3 grid-cols-1 md:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_20rem]">
        <aside className="lofi-panel hidden md:flex min-h-0 flex-col rounded-lg p-3" data-notes-collection-rail="note-shelves">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-dusk-amber">Shelves</p>
              <p className="mt-1 text-xs text-stone-500">Choose a note view.</p>
            </div>
            <Button className="h-9 px-3" type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-1 gap-2">
            {NOTE_FILTERS.map((item) => (
              <button
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition",
                  filter === item.value
                    ? "border-dusk-lavender/65 bg-dusk-lavender/15 text-stone-100"
                    : "border-white/10 bg-white/[0.035] text-stone-300 hover:border-dusk-lavender/35"
                )}
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold truncate">{item.label}</span>
                  <span className="hidden xl:block text-xs text-stone-500 truncate">{item.hint}</span>
                </span>
                <span className="rounded-md bg-ink-950/45 px-2 py-0.5 text-xs text-dusk-lavender shrink-0">{filterCounts[item.value]}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
            <div className="rounded-lg border border-white/10 bg-ink-950/35 p-2.5">
              <FilterSelect
                label="Sort"
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
            {availableBoards.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-ink-950/35 p-2.5">
                <FilterSelect
                  label="Board Scope"
                  value={boardFilter}
                  options={[
                    { value: "all", label: "All boards & notes" },
                    { value: "general", label: "Project-wide only (No board)" },
                    ...availableBoards.map((b) => ({
                      value: b.id,
                      label: `${b.name}${b.isPrivate ? " (Private)" : ""}`
                    }))
                  ]}
                  onValueChange={setBoardFilter}
                />
              </div>
            )}
          </div>
          {!allowMemberPrivateItems && !isOwner ? (
            <div className="mt-3 rounded-lg border border-dusk-amber/20 bg-dusk-amber/10 p-3 text-xs leading-5 text-dusk-amber">
              This project does not allow members to hide their own notes.
            </div>
          ) : null}
        </aside>

        <main className="lofi-panel flex min-h-0 flex-col rounded-lg p-3" data-notes-board="note-cards">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-dusk-amber">{NOTE_FILTERS.find((item) => item.value === filter)?.label}</p>
              <h3 className="mt-1 text-xl font-semibold text-stone-100">Note board</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="flex rounded-lg border border-white/10 bg-ink-950/45 p-1"
                data-notes-view-mode-toggle="grid-list"
              >
                {NOTE_VIEW_MODES.map((mode) => {
                  const Icon = mode.icon;

                  return (
                    <button
                      key={mode.value}
                      className={cn(
                        "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md px-2 text-xs font-semibold text-stone-400 transition hover:text-stone-100",
                        viewMode === mode.value && "bg-dusk-lavender text-ink-950 shadow-[0_8px_20px_rgba(167,151,255,0.18)] hover:text-ink-950"
                      )}
                      title={`${mode.label} view`}
                      type="button"
                      onClick={() => setViewMode(mode.value)}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
              <Button className="h-9 rounded-lg px-3.5 text-xs font-semibold" type="button" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add note
              </Button>
            </div>
          </div>
          {/* Mobile Filter Controls (< md) */}
          <div className="md:hidden mb-3 space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {NOTE_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                    filter === item.value
                      ? "border border-dusk-lavender/40 bg-dusk-lavender/15 text-dusk-lavender font-semibold shadow-sm"
                      : "border border-white/10 bg-white/[0.03] text-stone-400 hover:text-stone-200"
                  )}
                >
                  <span>{item.label}</span>
                  <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono">
                    {filterCounts[item.value]}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg border border-white/10 bg-ink-950/35 p-1.5">
                <FilterSelect
                  label="Sort"
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
              {availableBoards.length > 0 && (
                <div className="flex-1 rounded-lg border border-white/10 bg-ink-950/35 p-1.5">
                  <FilterSelect
                    label="Board Scope"
                    value={boardFilter}
                    options={[
                      { value: "all", label: "All boards & notes" },
                      { value: "general", label: "Project-wide only" },
                      ...availableBoards.map((b) => ({
                        value: b.id,
                        label: `${b.name}${b.isPrivate ? " (Private)" : ""}`
                      }))
                    ]}
                    onValueChange={setBoardFilter}
                  />
                </div>
              )}
            </div>
          </div>
          {error ? <p className="mb-3 rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}
          {visibleNotes.length === 0 ? (
            <EmptyState
              className="border-dashed bg-white/[0.025] p-8"
              title="No notes in this view"
              message="Adjust the filters or capture a new note."
              action={<Button size="sm" onClick={() => setIsCreateOpen(true)}>Add note</Button>}
            />
          ) : null}
          <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto pr-1">
            <div
              className={cn(
                "gap-3",
                viewMode === "list" && "flex flex-col",
                viewMode === "grid-2" && "grid md:grid-cols-2",
                viewMode === "grid-3" && "grid md:grid-cols-2 xl:grid-cols-3",
                viewMode === "grid-4" && "grid sm:grid-cols-2 xl:grid-cols-4"
              )}
              data-notes-board-view={viewMode}
            >
              {visibleNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  list={viewMode === "list"}
                  note={note}
                  onComplete={() => updateNote(note.id, { isCompleted: !note.completedAt })}
                  onEdit={() => note.canManage && setSelectedNote(note)}
                  onHide={() => updateNote(note.id, { isHidden: !note.isHidden })}
                  onStar={() => updateNote(note.id, { isStarred: !note.isStarred })}
                />
              ))}
            </div>
          </div>
        </main>

        <aside className="lofi-panel hidden xl:flex min-h-0 flex-col rounded-lg p-3" data-notes-quick-capture="quick-capture">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-dusk-amber">Quick capture</p>
              <p className="mt-1 text-xs text-stone-500">Drop a thought fast.</p>
            </div>
            <div className="relative h-14 w-14 shrink-0">
              <Image alt="" className="object-contain" fill sizes="56px" src="/stickers/retro/retro-sticker-11-pencil.png" />
            </div>
          </div>
          <form className="rounded-lg border border-white/10 bg-ink-950/35 p-3" onSubmit={quickCreateNote}>
            <Input name="quickTitle" placeholder="Small note title" required />
            <Textarea className="mt-2 min-h-[120px]" name="quickContent" placeholder="Tiny detail, link, or reminder..." />
            <Button className="mt-3 w-full" type="submit">
              <Plus className="h-4 w-4" />
              Save quick note
            </Button>
          </form>
          <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-white/[0.025]">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <span className="text-xs uppercase tracking-[0.22em] text-stone-500">Recently touched</span>
              <span className="text-xs text-dusk-lavender">{recentNotes.length}</span>
            </div>
            <div className="scrollbar-soft max-h-full space-y-2 overflow-y-auto p-2">
              {recentNotes.length > 0 ? (
                recentNotes.map((note) => (
                  <button
                    className="flex w-full items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] p-2 text-left hover:border-dusk-lavender/40"
                    key={note.id}
                    type="button"
                    onClick={() => note.canManage && setSelectedNote(note)}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-ink-950/45 text-base">
                      {renderNoteSticker(note.emoji, "h-8 w-8")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-stone-200">{note.title}</span>
                      <span className="block text-xs text-stone-500">{formatMediumDate(note.updatedAt)}</span>
                    </span>
                  </button>
                ))
              ) : (
                <EmptyState className="border-0 bg-transparent p-4" title="No recent notes yet" message="Updated notes will appear here." />
              )}
            </div>
          </div>
        </aside>
      </div>

      {isCreateOpen ? (
        <NoteEditorModal
          allowMemberPrivateItems={allowMemberPrivateItems}
          availableBoards={availableBoards}
          title="Add note"
          onClose={() => setIsCreateOpen(false)}
          onSubmit={createNote}
        />
      ) : null}
      {selectedNote ? (
        <NoteEditorModal
          note={selectedNote}
          availableBoards={availableBoards}
          title="Edit note"
          onClose={() => setSelectedNote(null)}
          onDelete={() => deleteNote(selectedNote.id)}
          onToggleComplete={() => updateNote(selectedNote.id, { isCompleted: !selectedNote.completedAt })}
          onSubmit={async (payload) => {
            await updateNote(selectedNote.id, payload);
            setSelectedNote(null);
          }}
          allowMemberPrivateItems={allowMemberPrivateItems}
        />
      ) : null}
    </section>
  );
}

function NoteStat({ label, value, tone }: { label: string; value: number; tone: "lavender" | "amber" | "mint" }) {
  const toneClass = {
    lavender: "border-dusk-lavender/25 bg-dusk-lavender/10 text-dusk-lavender",
    amber: "border-dusk-amber/25 bg-dusk-amber/10 text-dusk-amber",
    mint: "border-dusk-mint/25 bg-dusk-mint/10 text-dusk-mint"
  }[tone];

  return (
    <div className={cn("grid min-w-20 rounded-lg border px-3 py-1.5", toneClass)}>
      <span className="text-[11px] uppercase tracking-wider text-stone-400">{label}</span>
      <span className="text-base font-semibold text-stone-100">{value}</span>
    </div>
  );
}

function NoteCard({
  note,
  featured = false,
  list = false,
  onComplete,
  onEdit,
  onHide,
  onStar
}: {
  note: ProjectNote;
  featured?: boolean;
  list?: boolean;
  onComplete: () => void;
  onEdit: () => void;
  onHide: () => void;
  onStar: () => void;
}) {
  const colorMeta = getCardColorMeta(note.color);

  return (
    <article
      className={cn(
        "relative flex min-h-0 flex-col rounded-lg border border-white/10 bg-white/[0.035] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)]",
        colorMeta.softClass,
        featured && "min-h-[180px] border-dusk-lavender/30 bg-dusk-lavender/[0.08]",
        list && "min-h-0"
      )}
    >
      <button
        className={cn(
          "absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-ink-950/35 text-stone-500 transition hover:border-dusk-amber/40 hover:text-dusk-amber disabled:cursor-not-allowed disabled:opacity-40",
          note.isStarred && "border-dusk-amber/40 bg-dusk-amber/10 text-dusk-amber"
        )}
        disabled={!note.canManage}
        type="button"
        onClick={onStar}
      >
        <Star className="h-4 w-4" />
      </button>

      <div className={cn("flex items-start pr-8", list && "items-center")}>
        <button className="min-w-0 flex-1 text-left" type="button" onClick={onEdit}>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {note.completedAt ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-dusk-mint/25 bg-dusk-mint/10 px-2 py-1 text-[11px] text-dusk-mint">
                <CheckCircle2 className="h-3 w-3" />
                Completed {formatMediumDate(note.completedAt)}
              </span>
            ) : null}
            {note.isHidden ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-2 py-1 text-[11px] font-medium text-dusk-amber">
                <Lock className="h-3 w-3" />
                Private
              </span>
            ) : note.board ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-dusk-lavender/30 bg-dusk-lavender/10 px-2 py-1 text-[11px] font-medium text-dusk-lavender">
                <FolderKanban className="h-3 w-3" />
                {note.board.name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-stone-400">
                <Globe className="h-3 w-3" />
                Team
              </span>
            )}
            {note.dueDate ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-dusk-cyan/20 bg-dusk-cyan/10 px-2 py-1 text-[11px] text-dusk-cyan">
                <CalendarClock className="h-3 w-3" />
                {formatNoteDue(note)}
              </span>
            ) : null}
          </div>
          <h3 className={cn("flex items-center gap-2 truncate font-semibold text-stone-100", featured ? "text-xl" : "text-base")}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-950/40 text-lg">
              {renderNoteSticker(note.emoji, "h-8 w-8")}
            </span>
            <span className="truncate">{note.title}</span>
          </h3>
          <p className={cn("mt-2 text-sm leading-6 text-stone-400", list ? "line-clamp-1" : featured ? "line-clamp-4" : "line-clamp-3")}>
            {note.content || "No content."}
          </p>
        </button>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-stone-500">
        <span>Updated {formatMediumDate(note.updatedAt)}</span>
        <div className="flex flex-wrap items-center gap-2">
          {note.canManage ? (
            <button
              className="inline-flex h-8 items-center gap-1 rounded-md border border-white/10 bg-white/[0.035] px-2 text-stone-300 hover:border-dusk-mint/35 hover:text-dusk-mint"
              type="button"
              onClick={onComplete}
            >
              {note.completedAt ? <RotateCcw className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {note.completedAt ? "Restore" : "Done"}
            </button>
          ) : null}
          {note.canToggleHidden ? (
            <button
              className="inline-flex h-8 items-center gap-1 rounded-md border border-white/10 bg-white/[0.035] px-2 text-stone-300 hover:border-dusk-rose/35 hover:text-dusk-rose"
              type="button"
              onClick={onHide}
            >
              {note.isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {note.isHidden ? "Show" : "Hide"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

interface NotePayload {
  title: string;
  content: string;
  emoji: string;
  color: CardColor;
  dueDate: string | null;
  dueDateAllDay: boolean;
  isHidden: boolean;
  boardId?: string | null;
}

function NoteEditorModal({
  note,
  title,
  onClose,
  onDelete,
  onToggleComplete,
  onSubmit,
  allowMemberPrivateItems = false,
  availableBoards = []
}: {
  note?: ProjectNote;
  title: string;
  onClose: () => void;
  onDelete?: () => void;
  onToggleComplete?: () => void;
  onSubmit: (payload: NotePayload) => void | Promise<unknown>;
  allowMemberPrivateItems?: boolean;
  availableBoards?: Array<{ id: string; name: string; isPrivate?: boolean }>;
}) {
  const [titleValue, setTitleValue] = useState(note?.title ?? "");
  const [contentValue, setContentValue] = useState(note?.content ?? "");
  const [date, setDate] = useState(note?.dueDate ? note.dueDate.slice(0, 10) : "");
  const [time, setTime] = useState(note?.dueDate && !note.dueDateAllDay ? timeValue(note.dueDate) : "");
  const [color, setColor] = useState<CardColor>(normalizeCardColor(note?.color));
  const [emoji, setEmoji] = useState(note?.emoji ?? DEFAULT_NOTE_STICKER);
  // Default to private if new note!
  const [scope, setScope] = useState<NoteScope>(
    note ? (note.isHidden ? "private" : note.boardId ? "board" : "team") : "private"
  );
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    note?.boardId || (availableBoards[0]?.id ?? "")
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isDirty = useMemo(() => {
    if (!note) {
      return titleValue.trim().length > 0 || contentValue.trim().length > 0;
    }
    const origDate = note.dueDate ? note.dueDate.slice(0, 10) : "";
    const origTime = note.dueDate && !note.dueDateAllDay ? timeValue(note.dueDate) : "";
    const origScope: NoteScope = note.isHidden ? "private" : note.boardId ? "board" : "team";
    return (
      titleValue !== (note.title ?? "") ||
      contentValue !== (note.content ?? "") ||
      emoji !== (note.emoji ?? DEFAULT_NOTE_STICKER) ||
      color !== normalizeCardColor(note.color) ||
      scope !== origScope ||
      (scope === "board" && selectedBoardId !== (note.boardId ?? "")) ||
      date !== origDate ||
      time !== origTime
    );
  }, [note, titleValue, contentValue, emoji, color, scope, selectedBoardId, date, time]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const due = composeDueDate(date, time);
    const isHidden = scope === "private";
    const boardId = scope === "board" ? (selectedBoardId || availableBoards[0]?.id || null) : null;

    await onSubmit({
      title: titleValue,
      content: contentValue,
      emoji,
      color,
      dueDate: due.dueDate,
      dueDateAllDay: due.dueDateAllDay,
      isHidden,
      boardId
    });
    onClose();
  }

  return (
    <>
      <AppModal
        open
        onClose={onClose}
        hasUnsavedChanges={isDirty}
        onDiscard={onClose}
        labelledBy="note-card-title"
        contentClassName="lofi-panel flex max-h-[calc(100vh-2rem)] max-w-5xl flex-col overflow-hidden rounded-2xl"
      >
        <NoteEditorModalContent
          title={title}
          note={note}
          titleValue={titleValue}
          setTitleValue={setTitleValue}
          contentValue={contentValue}
          setContentValue={setContentValue}
          emoji={emoji}
          setEmoji={setEmoji}
          color={color}
          setColor={setColor}
          scope={scope}
          setScope={setScope}
          selectedBoardId={selectedBoardId}
          setSelectedBoardId={setSelectedBoardId}
          availableBoards={availableBoards}
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
          allowMemberPrivateItems={allowMemberPrivateItems}
          onToggleComplete={onToggleComplete}
          onRequestDelete={onDelete ? () => setIsDeleteConfirmOpen(true) : undefined}
          onSubmit={handleSubmit}
        />
      </AppModal>

      {onDelete ? (
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
      ) : null}
    </>
  );
}

function NoteEditorModalContent({
  title,
  note,
  titleValue,
  setTitleValue,
  contentValue,
  setContentValue,
  emoji,
  setEmoji,
  color,
  setColor,
  scope,
  setScope,
  selectedBoardId,
  setSelectedBoardId,
  availableBoards,
  date,
  setDate,
  time,
  setTime,
  allowMemberPrivateItems,
  onToggleComplete,
  onRequestDelete,
  onSubmit
}: {
  title: string;
  note?: ProjectNote;
  titleValue: string;
  setTitleValue: (val: string) => void;
  contentValue: string;
  setContentValue: (val: string) => void;
  emoji: string;
  setEmoji: (val: string) => void;
  color: CardColor;
  setColor: (val: CardColor) => void;
  scope: NoteScope;
  setScope: (val: NoteScope) => void;
  selectedBoardId: string;
  setSelectedBoardId: (val: string) => void;
  availableBoards: Array<{ id: string; name: string; isPrivate?: boolean }>;
  date: string;
  setDate: (val: string) => void;
  time: string;
  setTime: (val: string) => void;
  allowMemberPrivateItems: boolean;
  onToggleComplete?: () => void;
  onRequestDelete?: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const { requestClose } = useAppModal();

  return (
    <form className="flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden" onSubmit={onSubmit}>
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Note Card</p>
          <h2 id="note-card-title" className="mt-1 text-2xl font-semibold">{title}</h2>
        </div>
        <button
          className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100"
          type="button"
          aria-label="Close note"
          onClick={requestClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
        <div className="scrollbar-soft min-h-0 space-y-4 overflow-y-auto p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-2xl">
              {renderNoteSticker(emoji, "h-12 w-12")}
            </div>
            <Input
              name="title"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              placeholder="Note title"
              required
            />
          </div>
          <Textarea
            className="min-h-[360px]"
            name="content"
            value={contentValue}
            onChange={(e) => setContentValue(e.target.value)}
            placeholder="Write a note..."
          />
        </div>

        <aside className="scrollbar-soft min-h-0 space-y-5 overflow-y-auto border-t border-white/10 bg-white/[0.025] p-5 lg:border-l lg:border-t-0">
          <div className="space-y-2 text-sm text-stone-300">
            <span className="font-medium text-xs text-stone-400 uppercase tracking-wider">Visibility Scope</span>
            <div className="flex flex-col gap-2">
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
                  name="modal-scope"
                  value="private"
                  checked={scope === "private"}
                  onChange={() => setScope("private")}
                  className="sr-only"
                />
              </label>

              {availableBoards.length > 0 && (
                <div
                  className={cn(
                    "rounded-lg border p-2.5 text-xs transition select-none",
                    scope === "board"
                      ? "border-dusk-lavender/50 bg-dusk-lavender/15 text-dusk-lavender font-medium shadow-[0_0_12px_rgba(196,181,253,0.1)]"
                      : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-stone-200"
                  )}
                >
                  <label className="flex cursor-pointer items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                      <div className="min-w-0">
                        <span className="truncate block font-medium">Sub-project Board</span>
                        <p className="text-[10px] text-stone-500 font-normal truncate">Members of selected board only</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="modal-scope"
                      value="board"
                      checked={scope === "board"}
                      onChange={() => setScope("board")}
                      className="sr-only"
                    />
                  </label>
                  {scope === "board" && (
                    <div className="mt-2.5 pt-2 border-t border-stone-200/80 dark:border-white/10">
                      <div className="relative">
                        <select
                          value={selectedBoardId}
                          onChange={(e) => setSelectedBoardId(e.target.value)}
                          className="w-full appearance-none rounded-md border border-stone-300/80 bg-white py-2 pl-3 pr-8 text-xs text-stone-800 focus:border-indigo-500 focus:outline-none dark:border-white/15 dark:bg-ink-950 dark:text-stone-200 dark:focus:border-dusk-lavender cursor-pointer"
                        >
                          {availableBoards.map((b) => (
                            <option key={b.id} value={b.id} className="bg-white text-stone-900 dark:bg-ink-950 dark:text-stone-100">
                              {b.name} {b.isPrivate ? "(Private)" : ""}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  name="modal-scope"
                  value="team"
                  checked={scope === "team"}
                  onChange={() => setScope("team")}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <NoteStickerPicker selectedSticker={emoji} onChange={setEmoji} />
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </div>
            <p className="mt-2 text-xs text-stone-500">No time means all day.</p>
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 px-5 py-4">
        {onToggleComplete ? (
          <Button type="button" variant="secondary" onClick={onToggleComplete}>
            {note?.completedAt ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {note?.completedAt ? "Restore note" : "Mark complete"}
          </Button>
        ) : null}
        {onRequestDelete ? (
          <Button type="button" variant="danger" onClick={onRequestDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        ) : null}
        <Button type="button" variant="ghost" onClick={requestClose}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4" />
          Save note
        </Button>
      </div>
    </form>
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
      <div className="flex flex-wrap gap-2">
        {cardColorOptions.map((option) => {
          const meta = getCardColorMeta(option.value);

          return (
            <button
              key={option.value}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full border bg-white/[0.035] transition hover:scale-105 hover:border-white/25",
                selectedColor === option.value
                  ? "border-dusk-amber ring-2 ring-dusk-amber/45 ring-offset-2 ring-offset-ink-950"
                  : "border-white/10"
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

function NoteStickerPicker({
  selectedSticker,
  onChange
}: {
  selectedSticker: string;
  onChange: (sticker: string) => void;
}) {
  return (
    <div className="space-y-2 text-sm text-stone-300">
      <span>Note sticker</span>
      <div className="grid max-h-60 grid-cols-5 gap-2 overflow-y-auto pr-1 scrollbar-soft">
        {sharedIconOptions.map((option) => (
          <button
            key={option.id}
            className={cn(
              "grid h-12 w-12 place-items-center overflow-visible rounded-lg border bg-white/[0.035] p-1.5 transition hover:-translate-y-0.5 hover:border-dusk-lavender/40",
              selectedSticker === option.src ? "border-dusk-amber bg-dusk-amber/10" : "border-white/10"
            )}
            type="button"
            onClick={() => onChange(option.src)}
            title={option.label}
          >
            <RetroStickerImage alt={option.label} size={44} src={option.src} />
          </button>
        ))}
      </div>
    </div>
  );
}

function renderNoteSticker(value: string, className?: string) {
  if (isSharedIconPath(value)) {
    return <RetroStickerImage alt="" className={className} size={44} src={value} />;
  }

  return <span>{value || "Note"}</span>;
}

function normalizeNote(note: ProjectNote): ProjectNote {
  return {
    ...note,
    emoji: note.emoji ?? DEFAULT_NOTE_STICKER,
    color: normalizeCardColor(note.color),
    isStarred: note.isStarred ?? false,
    isHidden: note.isHidden ?? false,
    boardId: note.boardId ?? null,
    board: note.board ? { id: note.board.id, name: note.board.name } : null,
    completedAt: note.completedAt ? new Date(note.completedAt).toISOString() : null,
    dueDate: note.dueDate ? new Date(note.dueDate).toISOString() : null,
    dueDateAllDay: note.dueDateAllDay ?? false,
    createdAt: new Date(note.createdAt).toISOString(),
    updatedAt: new Date(note.updatedAt).toISOString(),
    canManage: note.canManage ?? false,
    canToggleHidden: note.canToggleHidden ?? false
  };
}
