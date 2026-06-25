"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { BookOpen, CheckCircle2, ExternalLink, FileText, Pin, Plus, Save, SlidersHorizontal, Star, X } from "lucide-react";
import { DiaryChecklistEditor, DiaryChecklistPreview } from "@/components/diary/diary-checklist";
import { cn } from "@/lib/utils";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModalPortal } from "@/components/ui/modal-portal";
import { normalizeDiaryChecklist, type DiaryChecklistItem } from "@/lib/diary/checklist";
import { composeDueDate } from "@/lib/kanban/due-date";
import { cardColorOptions, getCardColorMeta, type CardColor } from "@/lib/theme/card-colors";

const RED_STAR_KEY = "retrod:redStar";

interface RedStar {
  type: "diary" | "note";
  id: string;
  title: string;
  href: string;
}

interface ProjectItem {
  id: string;
  name: string;
  allowMemberPrivateItems: boolean;
}

interface DisplayDiaryItem {
  canManage: boolean;
  checklist: DiaryChecklistItem[];
  id: string;
  title: string;
  description: string | null;
  intervalDays: number;
  dueTime: string | null;
  projectId: string | null;
  projectName: string | null;
  startDate: string;
}

interface DisplayNote {
  id: string;
  title: string;
  content: string;
  completedAt: string | null;
  projectId: string;
  projectName: string;
}

type ActiveDisplayItem =
  | ({ type: "diary" } & DisplayDiaryItem)
  | ({ type: "note" } & DisplayNote);

function getRedStar(): RedStar | null {
  try {
    const raw = localStorage.getItem(RED_STAR_KEY);
    return raw ? (JSON.parse(raw) as RedStar) : null;
  } catch {
    return null;
  }
}

export function FabHub() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"diary" | "note" | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pinAfterCreate, setPinAfterCreate] = useState(false);
  const [redStar, setRedStar] = useState<RedStar | null>(null);
  const [activeDisplayItem, setActiveDisplayItem] = useState<ActiveDisplayItem | null>(null);
  const [displayLoading, setDisplayLoading] = useState(false);
  const [displayError, setDisplayError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load red star on mount
  useEffect(() => {
    setRedStar(getRedStar());

    function onStorage(e: StorageEvent) {
      if (e.key === RED_STAR_KEY) {
        try {
          setRedStar(e.newValue ? (JSON.parse(e.newValue) as RedStar) : null);
        } catch {
          setRedStar(null);
        }
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen || !redStar) {
      setActiveDisplayItem(null);
      setDisplayError(null);
      setDisplayLoading(false);
      return;
    }

    let alive = true;

    async function loadSelectedDisplay() {
      setDisplayLoading(true);
      setDisplayError(null);

      try {
        if (redStar?.type === "diary") {
          const response = await fetch("/api/hub/diary");
          const data = (await response.json()) as { items?: DisplayDiaryItem[]; error?: string };

          if (!response.ok) {
            throw new Error(data.error ?? "Could not load diary display.");
          }

          const item = data.items?.find((entry) => entry.id === redStar.id) ?? null;
          if (!alive) return;
          setActiveDisplayItem(item ? { ...item, type: "diary" } : null);
          setDisplayError(item ? null : "This diary list is no longer available. Choose another one.");
        } else if (redStar?.type === "note") {
          const response = await fetch("/api/hub/notes");
          const data = (await response.json()) as { notes?: DisplayNote[]; error?: string };

          if (!response.ok) {
            throw new Error(data.error ?? "Could not load note display.");
          }

          const note = data.notes?.find((entry) => entry.id === redStar.id) ?? null;
          if (!alive) return;
          setActiveDisplayItem(note ? { ...note, type: "note" } : null);
          setDisplayError(note ? null : "This note is no longer available. Choose another one.");
        }
      } catch (err) {
        if (!alive) return;
        setActiveDisplayItem(null);
        setDisplayError(err instanceof Error ? err.message : "Could not load the selected display.");
      } finally {
        if (alive) setDisplayLoading(false);
      }
    }

    void loadSelectedDisplay();
    return () => {
      alive = false;
    };
  }, [isOpen, redStar]);

  function navigateTo(href: string) {
    setIsOpen(false);
    router.push(href);
  }

  function openCreateModal(mode: "diary" | "note", shouldPin = false) {
    setIsOpen(false);
    setPinAfterCreate(shouldPin);
    setActiveModal(mode);
  }

  function openPicker() {
    setIsOpen(false);
    setIsPickerOpen(true);
  }

  function toggleHub() {
    if (!redStar) {
      openPicker();
      return;
    }

    setIsOpen((prev) => !prev);
  }

  function clearDisplay() {
    setRedStarItem(null);
    setIsOpen(false);
  }

  async function updatePinnedDiaryChecklist(item: DisplayDiaryItem, checklist: DiaryChecklistItem[]) {
    setDisplayError(null);
    const normalizedChecklist = normalizeDiaryChecklist(checklist, item.startDate);
    const response = await fetch(`/api/diary-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checklist: normalizedChecklist })
    });
    const data = (await response.json()) as { diaryItem?: { checklist?: unknown }; error?: string };

    if (!response.ok) {
      setDisplayError(data.error ?? "Could not update this diary checklist.");
      return;
    }

    setActiveDisplayItem((current) => {
      if (current?.type !== "diary" || current.id !== item.id) {
        return current;
      }

      return {
        ...current,
        checklist: normalizeDiaryChecklist(data.diaryItem?.checklist ?? normalizedChecklist, item.startDate)
      };
    });
  }

  return (
    <>
      <div ref={containerRef} className="fixed bottom-6 right-6 z-[120] flex flex-col items-end gap-3">
        {/* Action buttons */}
        <div
          className={cn(
            "flex flex-col items-end gap-2 transition-all duration-300",
            isOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
          )}
        >
          {redStar ? (
            <PinnedDisplayPanel
              activeItem={activeDisplayItem}
              fallbackItem={redStar}
              isLoading={displayLoading}
              error={displayError}
              onOpen={() => navigateTo(redStar.href)}
              onChange={openPicker}
              onClear={clearDisplay}
              onCreate={openCreateModal}
              onDiaryChecklistChange={updatePinnedDiaryChecklist}
            />
          ) : null}
        </div>

        {/* Main Floating Button */}
        <button
          type="button"
          id="fab-hub-btn"
          aria-label={redStar ? (isOpen ? "Close display panel" : "Open display panel") : "Choose display"}
          className={cn(
            "fab-main grid h-14 w-14 place-items-center rounded-full border shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-all duration-300",
            isOpen
              ? "border-dusk-rose/40 bg-dusk-rose/20 text-dusk-rose hover:bg-dusk-rose/30 rotate-45"
              : "border-dusk-lavender/30 bg-dusk-lavender/15 text-dusk-lavender hover:border-dusk-lavender/60 hover:bg-dusk-lavender/25"
          )}
          onClick={toggleHub}
        >
          {isOpen ? <X className="h-6 w-6" /> : redStar ? <Star className="h-6 w-6 fill-current" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>

      {/* Centered Modal */}
      {activeModal && (
        <FabCreateModal
          mode={activeModal}
          pinAfterCreate={pinAfterCreate}
          onClose={() => setActiveModal(null)}
        />
      )}

      {isPickerOpen && (
        <FabDisplayPicker
          activeItem={redStar}
          onClose={() => setIsPickerOpen(false)}
          onCreate={(mode) => {
            setIsPickerOpen(false);
            openCreateModal(mode, true);
          }}
        />
      )}
    </>
  );
}

function PinnedDisplayPanel({
  activeItem,
  fallbackItem,
  isLoading,
  error,
  onOpen,
  onChange,
  onClear,
  onCreate,
  onDiaryChecklistChange
}: {
  activeItem: ActiveDisplayItem | null;
  fallbackItem: RedStar;
  isLoading: boolean;
  error: string | null;
  onOpen: () => void;
  onChange: () => void;
  onClear: () => void;
  onCreate: (mode: "diary" | "note") => void;
  onDiaryChecklistChange: (item: DisplayDiaryItem, checklist: DiaryChecklistItem[]) => void;
}) {
  const isDiary = fallbackItem.type === "diary";
  const title = activeItem?.title ?? fallbackItem.title;
  const body = activeItem?.type === "note" ? activeItem.content || "No note content yet." : "Loading the selected display...";
  const projectName =
    activeItem?.type === "diary"
      ? activeItem.projectName ?? "My Diary"
      : activeItem?.type === "note"
        ? activeItem.projectName
        : isDiary
          ? "Diary"
          : "Note";

  return (
    <div className="motion-floating-in w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-2xl border border-white/12 bg-ink-950/92 text-left text-stone-100 shadow-[0_18px_54px_rgba(0,0,0,0.42)] backdrop-blur-xl">
      <div className="border-b border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={cn("text-xs uppercase tracking-[0.22em]", isDiary ? "text-dusk-lavender" : "text-dusk-cyan")}>
              {isDiary ? "Pinned diary list" : "Pinned note"}
            </p>
            <h3 className="mt-1 truncate text-base font-semibold">{title}</h3>
          </div>
          <Star className="mt-0.5 h-4 w-4 shrink-0 fill-red-400 text-red-400" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-stone-400">
          <span className="rounded-full border border-white/10 bg-white/[0.055] px-2 py-0.5">
            {projectName}
          </span>
          {activeItem?.type === "diary" ? (
            <>
              <span className="rounded-full border border-dusk-cyan/20 bg-dusk-cyan/10 px-2 py-0.5 text-dusk-cyan">
                Every {activeItem.intervalDays}d
              </span>
              {activeItem.dueTime ? (
                <span className="rounded-full border border-dusk-amber/20 bg-dusk-amber/10 px-2 py-0.5 text-dusk-amber">
                  {activeItem.dueTime}
                </span>
              ) : null}
            </>
          ) : activeItem?.type === "note" && activeItem.completedAt ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-dusk-mint/25 bg-dusk-mint/10 px-2 py-0.5 text-dusk-mint">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm text-stone-400">
            Loading selected display...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-dusk-rose/25 bg-dusk-rose/10 p-4 text-sm leading-6 text-dusk-rose">
            {error}
          </div>
        ) : activeItem?.type === "diary" ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
            {activeItem.description ? (
              <p className="mb-3 whitespace-pre-wrap text-sm leading-6 text-stone-300">{activeItem.description}</p>
            ) : null}
            {activeItem.checklist.length > 0 ? (
              <DiaryChecklistPreview
                canManage={activeItem.canManage}
                selectedDate={new Date().toISOString().slice(0, 10)}
                value={activeItem.checklist}
                onChange={(checklist) => onDiaryChecklistChange(activeItem, checklist)}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-stone-500">
                No checklist task yet.
              </div>
            )}
          </div>
        ) : (
          <p className="max-h-32 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-stone-300 scrollbar-soft">
            {body}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="fab-action-btn flex items-center justify-center gap-2 rounded-xl border border-dusk-lavender/25 bg-dusk-lavender/15 px-3 py-2 text-xs font-medium text-dusk-lavender transition hover:border-dusk-lavender/50 hover:bg-dusk-lavender/20"
            onClick={onOpen}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </button>
          <button
            type="button"
            className="fab-action-btn flex items-center justify-center gap-2 rounded-xl border border-dusk-amber/25 bg-dusk-amber/10 px-3 py-2 text-xs font-medium text-dusk-amber transition hover:border-dusk-amber/45 hover:bg-dusk-amber/15"
            onClick={onChange}
          >
            <Pin className="h-3.5 w-3.5" />
            Change
          </button>
          <button
            type="button"
            className="fab-action-btn flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-medium text-stone-300 transition hover:border-dusk-lavender/35 hover:bg-white/[0.075] hover:text-stone-100"
            onClick={() => onCreate("diary")}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Diary
          </button>
          <button
            type="button"
            className="fab-action-btn flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-medium text-stone-300 transition hover:border-dusk-cyan/35 hover:bg-white/[0.075] hover:text-stone-100"
            onClick={() => onCreate("note")}
          >
            <FileText className="h-3.5 w-3.5" />
            Note
          </button>
        </div>
        <button
          type="button"
          className="mt-2 w-full rounded-xl border border-red-300/15 bg-red-400/5 px-3 py-2 text-xs text-red-200 transition hover:border-red-300/30 hover:bg-red-400/10"
          onClick={onClear}
        >
          Clear display
        </button>
      </div>
    </div>
  );
}

function FabDisplayPicker({
  activeItem,
  onClose,
  onCreate
}: {
  activeItem: RedStar | null;
  onClose: () => void;
  onCreate: (mode: "diary" | "note") => void;
}) {
  const [tab, setTab] = useState<"diary" | "note">(activeItem?.type ?? "diary");
  const [diaryItems, setDiaryItems] = useState<DisplayDiaryItem[]>([]);
  const [notes, setNotes] = useState<DisplayNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadItems() {
      setLoading(true);
      setError(null);

      try {
        const [diaryResponse, notesResponse] = await Promise.all([
          fetch("/api/hub/diary"),
          fetch("/api/hub/notes")
        ]);

        const diaryData = (await diaryResponse.json()) as { items?: DisplayDiaryItem[]; error?: string };
        const notesData = (await notesResponse.json()) as { notes?: DisplayNote[]; error?: string };

        if (!diaryResponse.ok) {
          throw new Error(diaryData.error ?? "Could not load diary lists.");
        }

        if (!notesResponse.ok) {
          throw new Error(notesData.error ?? "Could not load notes.");
        }

        if (!alive) return;
        setDiaryItems(diaryData.items ?? []);
        setNotes(notesData.notes ?? []);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Could not load display choices.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void loadItems();
    return () => {
      alive = false;
    };
  }, []);

  function chooseDiary(item: DisplayDiaryItem) {
    setRedStarItem({
      type: "diary",
      id: item.id,
      title: item.title,
      href: item.projectId ? `/project/${item.projectId}/diary` : "/hub/diary"
    });
    onClose();
  }

  function chooseNote(note: DisplayNote) {
    setRedStarItem({
      type: "note",
      id: note.id,
      title: note.title,
      href: `/project/${note.projectId}/notes`
    });
    onClose();
  }

  function clearDisplay() {
    setRedStarItem(null);
    onClose();
  }

  const activeNotes = notes.filter((note) => !note.completedAt);
  const activeList = tab === "diary" ? diaryItems : activeNotes;

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[300] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <div className="lofi-panel max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">FAB Display</p>
            <h2 className="mt-1 text-2xl font-semibold">Choose what stays visible</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-stone-400">
              Pick one diary list or note to keep on the bottom-right button. It stays there until you change it.
            </p>
          </div>
          <button className="rounded-md p-2 text-stone-400 hover:bg-white/10" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
          <div className="flex gap-2">
            <button
              type="button"
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition",
                tab === "diary"
                  ? "border-dusk-lavender bg-dusk-lavender/15 text-dusk-lavender"
                  : "border-white/10 bg-white/5 text-stone-300 hover:border-dusk-lavender/40"
              )}
              onClick={() => setTab("diary")}
            >
              Diary list
            </button>
            <button
              type="button"
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition",
                tab === "note"
                  ? "border-dusk-cyan bg-dusk-cyan/15 text-dusk-cyan"
                  : "border-white/10 bg-white/5 text-stone-300 hover:border-dusk-cyan/40"
              )}
              onClick={() => setTab("note")}
            >
              Note
            </button>
          </div>

          {activeItem ? (
            <Button type="button" variant="ghost" onClick={clearDisplay}>
              Clear display
            </Button>
          ) : null}
        </div>

        <div className="max-h-[54vh] overflow-y-auto p-4 scrollbar-soft">
          {loading ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-6 text-center text-sm text-stone-400">
              Loading display choices...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : activeList.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-6 text-center">
              <p className="text-sm text-stone-300">
                No {tab === "diary" ? "diary lists" : "notes"} yet.
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Create one now, then choose it for the bottom-right display.
              </p>
              <Button className="mt-4" type="button" onClick={() => onCreate(tab)}>
                <Plus className="h-4 w-4" />
                Create {tab === "diary" ? "diary" : "note"}
              </Button>
            </div>
          ) : tab === "diary" ? (
            <div className="grid gap-2">
              {diaryItems.map((item) => {
                const isActive = activeItem?.type === "diary" && activeItem.id === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "flex items-start justify-between gap-4 rounded-lg border p-3 text-left transition",
                      isActive
                        ? "border-red-400/35 bg-red-500/10"
                        : "border-white/10 bg-white/[0.035] hover:border-dusk-lavender/40 hover:bg-dusk-lavender/10"
                    )}
                    onClick={() => chooseDiary(item)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-stone-100">{item.title}</span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-stone-400">
                        {item.description || "No description."}
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-stone-500">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                          {item.projectName ?? "My Diary"}
                        </span>
                        <span className="rounded-full border border-dusk-cyan/20 bg-dusk-cyan/10 px-2 py-0.5 text-dusk-cyan">
                          Every {item.intervalDays}d
                        </span>
                        {item.dueTime ? (
                          <span className="rounded-full border border-dusk-amber/20 bg-dusk-amber/10 px-2 py-0.5 text-dusk-amber">
                            {item.dueTime}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <Star className={cn("mt-1 h-4 w-4 shrink-0", isActive ? "fill-red-400 text-red-400" : "text-stone-600")} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-2">
              {activeNotes.map((note) => {
                const isActive = activeItem?.type === "note" && activeItem.id === note.id;

                return (
                  <button
                    key={note.id}
                    type="button"
                    className={cn(
                      "flex items-start justify-between gap-4 rounded-lg border p-3 text-left transition",
                      isActive
                        ? "border-red-400/35 bg-red-500/10"
                        : "border-white/10 bg-white/[0.035] hover:border-dusk-cyan/40 hover:bg-dusk-cyan/10"
                    )}
                    onClick={() => chooseNote(note)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-stone-100">{note.title}</span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-stone-400">
                        {note.content || "No content."}
                      </span>
                      <span className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-stone-500">
                        {note.projectName}
                      </span>
                    </span>
                    <Star className={cn("mt-1 h-4 w-4 shrink-0", isActive ? "fill-red-400 text-red-400" : "text-stone-600")} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 p-4">
          <Button type="button" variant="ghost" onClick={() => onCreate(tab)}>
            <Plus className="h-4 w-4" />
            Create {tab === "diary" ? "diary" : "note"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

function FabCreateModal({
  mode,
  onClose,
  pinAfterCreate
}: {
  mode: "diary" | "note";
  onClose: () => void;
  pinAfterCreate: boolean;
}) {
  const params = useParams();
  const projectIdFromUrl = params.id as string | undefined;

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [color, setColor] = useState<CardColor>("DEFAULT");
  
  // Note specific states
  const [noteDate, setNoteDate] = useState("");
  const [noteTime, setNoteTime] = useState("");
  
  // Diary specific states
  const [diaryStartDate, setDiaryStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [diaryIntervalDays, setDiaryIntervalDays] = useState(1);
  const [diaryChecklist, setDiaryChecklist] = useState<DiaryChecklistItem[]>([]);
  const [isHidden, setIsHidden] = useState(false);

  // Fetch projects on mount to allow select option
  useEffect(() => {
    setLoading(true);
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) {
          const list: ProjectItem[] = data.projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            allowMemberPrivateItems: p.allowMemberPrivateItems ?? false
          }));
          setProjects(list);
          
          if (projectIdFromUrl && list.some((p) => p.id === projectIdFromUrl)) {
            setSelectedProjectId(projectIdFromUrl);
          } else if (mode === "note" && list.length > 0) {
            setSelectedProjectId(list[0].id);
          } else {
            setSelectedProjectId("");
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load projects", err);
        setError("Failed to load projects.");
      })
      .finally(() => setLoading(false));
  }, [projectIdFromUrl, mode]);

  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const allowMemberPrivateItems = currentProject?.allowMemberPrivateItems ?? false;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    if (!title) {
      setError("Title is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "note") {
        if (!selectedProjectId) {
          setError("Please select a project.");
          setIsSubmitting(false);
          return;
        }
        
        const due = composeDueDate(noteDate, noteTime);
        const payload = {
          title,
          content: String(formData.get("content") ?? ""),
          color,
          dueDate: due.dueDate,
          dueDateAllDay: due.dueDateAllDay,
          isHidden
        };

        const response = await fetch(`/api/projects/${selectedProjectId}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = (await response.json()) as { note?: { id: string; title: string; projectId: string }; error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to create note.");
        }

        if (pinAfterCreate && data.note) {
          setRedStarItem({
            type: "note",
            id: data.note.id,
            title: data.note.title,
            href: `/project/${data.note.projectId}/notes`
          });
        }
      } else {
        // Diary mode
        const isPersonal = selectedProjectId === "";
        const payload = {
          title,
          description: String(formData.get("description") ?? ""),
          color,
          intervalDays: diaryIntervalDays,
          startDate: diaryStartDate,
          dueTime: null,
          checklist: normalizeDiaryChecklist(diaryChecklist, diaryStartDate),
          isStarred: false,
          isHidden: isPersonal ? false : isHidden
        };

        const url = isPersonal 
          ? "/api/hub/diary" 
          : `/api/projects/${selectedProjectId}/diary-items`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = (await response.json()) as {
          diaryItem?: { id: string; title: string; projectId: string | null };
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to create diary checklist.");
        }

        if (pinAfterCreate && data.diaryItem) {
          setRedStarItem({
            type: "diary",
            id: data.diaryItem.id,
            title: data.diaryItem.title,
            href: data.diaryItem.projectId ? `/project/${data.diaryItem.projectId}/diary` : "/hub/diary"
          });
        }
      }

      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message ?? "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-ink-950/85 px-4 py-4 backdrop-blur-sm">
      <form
        className={cn("lofi-panel flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-xl p-5", mode === "diary" ? "max-w-4xl" : "max-w-xl")}
        onSubmit={handleSubmit}
      >
        {/* Modal Header */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">
              {mode === "note" ? "Add Project Note" : "Add Recurring Diary"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              {mode === "note" ? "Create Note" : "Create Diary"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {mode === "diary" ? (
              <button
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs transition",
                  isSettingsOpen
                    ? "border-dusk-amber/40 bg-dusk-amber/10 text-dusk-amber"
                    : "border-white/10 bg-white/[0.035] text-stone-300 hover:border-dusk-amber/35"
                )}
                type="button"
                onClick={() => setIsSettingsOpen((current) => !current)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Settings
              </button>
            ) : null}
            <button
              className="rounded-md p-2 text-stone-400 hover:bg-white/10"
              type="button"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-6 text-center text-sm text-stone-400 font-mono">Loading workspaces...</div>
        )}

        {!loading && mode === "note" && (
          <div className="grid gap-4">
            {/* Project / Workspace Selector */}
            <div className="space-y-2 text-sm text-stone-300">
              <span>Workspace / Target</span>
              {mode === "note" ? (
                projects.length === 0 ? (
                  <p className="text-xs text-red-300">
                    You have no projects joined. Please create a project first.
                  </p>
                ) : (
                  <select
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.065] px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-dusk-lavender/20"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    required
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )
              ) : (
                <select
                  className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.065] px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-dusk-lavender/20"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">My Diary (Personal)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Title */}
            <Input
              name="title"
              placeholder={mode === "note" ? "Note title" : "Diary title"}
              required
            />

            {/* Content / Description */}
            {mode === "note" ? (
              <Textarea
                className="min-h-32"
                name="content"
                placeholder="Write your note..."
              />
            ) : (
              <Textarea
                className="min-h-24"
                name="description"
                placeholder="What checklist items should repeat?"
              />
            )}

            {/* Color Selector */}
            <ColorPicker selectedColor={color} onChange={setColor} />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-stone-300">
                <span>Due date (optional)</span>
                <Input
                  type="date"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm text-stone-300">
                <span>Due time (optional)</span>
                <Input
                  type="time"
                  value={noteTime}
                  disabled={!noteDate}
                  onChange={(e) => setNoteTime(e.target.value)}
                />
              </label>
            </div>

            {/* Privacy Checkbox */}
            {(mode === "note" || selectedProjectId !== "") && allowMemberPrivateItems && (
              <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-stone-300">
                <span>Hide from other members</span>
                <input
                  checked={isHidden}
                  className="h-4 w-4 accent-dusk-lavender"
                  type="checkbox"
                  onChange={(e) => setIsHidden(e.target.checked)}
                />
              </label>
            )}

            {error && (
              <p className="text-xs text-red-300 border border-red-300/20 bg-red-400/10 p-3 rounded-xl">
                {error}
              </p>
            )}
          </div>
        )}

        {!loading && mode === "diary" && (
          <div className={cn("grid min-h-0 flex-1 gap-5 overflow-hidden", isSettingsOpen && "lg:grid-cols-[minmax(0,1fr)_18rem]")}>
            <section className="flex min-h-0 flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.2em] text-dusk-lavender">Details</p>
              <div className="space-y-2 text-sm text-stone-300">
                <span>Workspace / Target</span>
                <select
                  className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.065] px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-dusk-lavender/20"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">My Diary (Personal)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input name="title" placeholder="Diary title" required />
              <Textarea
                className="min-h-24"
                name="description"
                placeholder="What checklist items should repeat?"
              />
              <ColorPicker selectedColor={color} onChange={setColor} />
              <DiaryChecklistEditor
                defaultRepeatDays={diaryIntervalDays}
                defaultStartDate={diaryStartDate}
                onDefaultRepeatDaysChange={setDiaryIntervalDays}
                value={diaryChecklist}
                onChange={setDiaryChecklist}
              />
            </section>

            <aside className={cn("space-y-4 self-start rounded-xl border border-white/10 bg-white/[0.025] p-4", !isSettingsOpen && "hidden")}>
              <p className="text-xs uppercase tracking-[0.2em] text-dusk-amber">Settings</p>
              <label className="space-y-2 text-sm text-stone-300">
                <span>Start date</span>
                <Input
                  type="date"
                  value={diaryStartDate}
                  onChange={(e) => setDiaryStartDate(e.target.value)}
                  required
                />
              </label>
              {selectedProjectId !== "" && allowMemberPrivateItems ? (
                <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-stone-300">
                  <span>Hide from other members</span>
                  <input
                    checked={isHidden}
                    className="h-4 w-4 accent-dusk-lavender"
                    type="checkbox"
                    onChange={(e) => setIsHidden(e.target.checked)}
                  />
                </label>
              ) : null}

              {error && (
                <p className="text-xs text-red-300 border border-red-300/20 bg-red-400/10 p-3 rounded-xl">
                  {error}
                </p>
              )}
            </aside>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button disabled={isSubmitting || (mode === "note" && projects.length === 0)}>
            <Save className="h-4 w-4" />
            {isSubmitting ? "Creating..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
    </ModalPortal>
  );
}

function ColorPicker({ selectedColor, onChange }: { selectedColor: CardColor; onChange: (c: CardColor) => void }) {
  return (
    <div className="space-y-2 text-sm text-stone-300">
      <span>Color</span>
      <div className="flex flex-wrap gap-2">
        {cardColorOptions.map((option) => {
          const meta = getCardColorMeta(option.value);
          return (
            <button
              key={option.value}
              type="button"
              title={option.label}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full border bg-white/[0.035] transition hover:scale-105",
                selectedColor === option.value
                  ? "border-dusk-amber ring-2 ring-dusk-amber/45 ring-offset-2 ring-offset-ink-950"
                  : "border-white/10"
              )}
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

export function setRedStarItem(item: RedStar | null) {
  if (item) {
    localStorage.setItem(RED_STAR_KEY, JSON.stringify(item));
  } else {
    localStorage.removeItem(RED_STAR_KEY);
  }
  window.dispatchEvent(new StorageEvent("storage", { key: RED_STAR_KEY, newValue: item ? JSON.stringify(item) : null }));
}
