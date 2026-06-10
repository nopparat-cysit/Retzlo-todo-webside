"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { BookOpen, FileText, Plus, Star, X, CalendarClock, Repeat, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { composeDueDate } from "@/lib/kanban/due-date";
import { cardColorOptions, getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";

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
  const [redStar, setRedStar] = useState<RedStar | null>(null);
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

  function navigateTo(href: string) {
    setIsOpen(false);
    router.push(href);
  }

  function openCreateModal(mode: "diary" | "note") {
    setIsOpen(false);
    setActiveModal(mode);
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
          {/* Pinned Red Star */}
          {redStar && (
            <button
              type="button"
              className="fab-action-btn group flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-2.5 text-sm font-medium text-red-300 shadow-lg backdrop-blur-md transition hover:border-red-400/60 hover:bg-red-500/25"
              onClick={() => navigateTo(redStar.href)}
            >
              <span className="max-w-[160px] truncate text-xs text-red-200">{redStar.title}</span>
              <Star className="h-4 w-4 shrink-0 fill-red-400 text-red-400" />
            </button>
          )}

          {/* Note Quick Create Modal Button */}
          <button
            type="button"
            id="fab-note-btn"
            className="fab-action-btn flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-950/80 px-4 py-2.5 text-sm font-medium text-stone-200 shadow-lg backdrop-blur-md transition hover:border-dusk-cyan/40 hover:bg-dusk-cyan/10 hover:text-dusk-cyan"
            onClick={() => openCreateModal("note")}
          >
            <span>Notes</span>
            <FileText className="h-4 w-4 shrink-0" />
          </button>

          {/* Diary Quick Create Modal Button */}
          <button
            type="button"
            id="fab-diary-btn"
            className="fab-action-btn flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-950/80 px-4 py-2.5 text-sm font-medium text-stone-200 shadow-lg backdrop-blur-md transition hover:border-dusk-lavender/40 hover:bg-dusk-lavender/10 hover:text-dusk-lavender"
            onClick={() => openCreateModal("diary")}
          >
            <span>Diary</span>
            <BookOpen className="h-4 w-4 shrink-0" />
          </button>
        </div>

        {/* Main Floating Button */}
        <button
          type="button"
          id="fab-hub-btn"
          aria-label={isOpen ? "Close hub menu" : "Open hub menu"}
          className={cn(
            "fab-main grid h-14 w-14 place-items-center rounded-full border shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-all duration-300",
            isOpen
              ? "border-dusk-rose/40 bg-dusk-rose/20 text-dusk-rose hover:bg-dusk-rose/30 rotate-45"
              : "border-dusk-lavender/30 bg-dusk-lavender/15 text-dusk-lavender hover:border-dusk-lavender/60 hover:bg-dusk-lavender/25"
          )}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>

      {/* Centered Modal */}
      {activeModal && (
        <FabCreateModal mode={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </>
  );
}

function FabCreateModal({
  mode,
  onClose
}: {
  mode: "diary" | "note";
  onClose: () => void;
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
  const [diaryDueTime, setDiaryDueTime] = useState("");
  const [diaryIntervalDays, setDiaryIntervalDays] = useState(1);
  const [isHidden, setIsHidden] = useState(false);

  const DIARY_PRESETS = [
    { label: "Daily", days: 1 },
    { label: "3 days", days: 3 },
    { label: "Weekly", days: 7 },
    { label: "2 weeks", days: 14 },
    { label: "Monthly", days: 30 }
  ];

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

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Failed to create note.");
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
          dueTime: diaryDueTime || null,
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

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Failed to create diary checklist.");
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
    <div className="fixed inset-0 z-[300] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form
        className="lofi-panel max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl p-5"
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
          <button
            className="rounded-md p-2 text-stone-400 hover:bg-white/10"
            type="button"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && (
          <div className="py-6 text-center text-sm text-stone-400 font-mono">Loading workspaces...</div>
        )}

        {!loading && (
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

            {/* Date & Time settings */}
            {mode === "note" ? (
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
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-stone-300">
                    <span>Start date</span>
                    <Input
                      type="date"
                      value={diaryStartDate}
                      onChange={(e) => setDiaryStartDate(e.target.value)}
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm text-stone-300">
                    <span>Due time (optional)</span>
                    <Input
                      type="time"
                      value={diaryDueTime}
                      onChange={(e) => setDiaryDueTime(e.target.value)}
                    />
                  </label>
                </div>

                {/* Show every presets & custom count */}
                <div className="space-y-2 text-sm text-stone-300">
                  <span>Show every (days)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {DIARY_PRESETS.map((p) => (
                      <button
                        key={p.days}
                        type="button"
                        className={cn(
                          "h-7 rounded-md border px-2.5 text-xs transition",
                          diaryIntervalDays === p.days
                            ? "border-dusk-amber bg-dusk-amber/15 text-dusk-amber"
                            : "border-white/10 bg-white/5 text-stone-400 hover:border-dusk-amber/40"
                        )}
                        onClick={() => setDiaryIntervalDays(p.days)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={diaryIntervalDays}
                    onChange={(e) => setDiaryIntervalDays(Number(e.target.value))}
                    required
                  />
                  <p className="text-[11px] text-stone-500">
                    Shows every {diaryIntervalDays} day{diaryIntervalDays > 1 ? "s" : ""}
                  </p>
                </div>
              </>
            )}

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
