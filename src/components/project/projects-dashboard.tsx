"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Clock,
  FolderKanban,
  Gift,
  Image as ImageIcon,
  KanbanSquare,
  Layers3,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input, Textarea } from "@/components/ui/input";
import { UserProfilePopover } from "@/components/project/user-profile-popover";
import { defaultCalendarFilters, filterCalendarItems } from "@/lib/calendar/view";
import { formatShortDue } from "@/lib/date-format";
import { getStatusMeta } from "@/lib/kanban/status";
import { cn } from "@/lib/utils";
import type { CardStatus } from "@/types/kanban";

export interface ProjectDashboardItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  coverImage: string | null;
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

export interface UserProfile {
  name: string | null;
  avatar: string | null;
  status: string;
  email: string;
}

export function ProjectsDashboard({
  projects,
  calendarCards,
  userProfile,
}: {
  projects: ProjectDashboardItem[];
  calendarCards: GlobalCalendarCard[];
  userProfile?: UserProfile;
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
    <main className="soft-grid-bg min-h-screen w-full overflow-x-hidden px-4 py-4 sm:px-5 lg:px-6">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="lofi-panel relative flex flex-col overflow-hidden rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-dusk-lavender/25 bg-dusk-lavender/10 text-dusk-lavender">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-dusk-amber">RETROD</p>
                <h1 className="text-xl font-semibold">Workspaces</h1>
              </div>
            </div>
            {userProfile && (
              <UserProfilePopover
                avatar={userProfile.avatar}
                email={userProfile.email}
                initials={(userProfile.name ?? userProfile.email)
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
                name={userProfile.name ?? userProfile.email}
                status={userProfile.status}
                statusColor={
                  userProfile.status === "ONLINE"
                    ? "bg-emerald-400"
                    : userProfile.status === "BUSY"
                    ? "bg-dusk-amber"
                    : "bg-stone-500"
                }
                variant="avatar"
              />
            )}
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">Project</label>
            <select
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.065] px-3 text-sm text-stone-100 outline-none transition focus:border-dusk-lavender/70 focus:ring-4 focus:ring-dusk-lavender/20"
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

          <Link
            href="/projects/rewards"
            className="mt-4 flex items-center justify-between rounded-xl border border-dusk-amber/20 bg-dusk-amber/5 px-4 py-3 text-sm font-medium text-dusk-amber transition hover:border-dusk-amber/45 hover:bg-dusk-amber/10"
          >
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-dusk-amber" />
              <span>Redeem Rewards (แลกรางวัล)</span>
            </div>
            <ArrowRight className="h-4 w-4 text-dusk-amber" />
          </Link>

          <div className="mt-5 flex-1 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-100">
                <CalendarDays className="h-4 w-4 text-dusk-cyan" />
                Calendar
              </div>
              <span className="rounded bg-white/5 px-2 py-1 text-[11px] text-stone-500">{filteredCalendarCards.length}</span>
            </div>
            <div className="mb-3 grid gap-2">
              <select
                className="h-9 rounded-xl border border-white/10 bg-white/[0.065] px-2 text-xs text-stone-100 outline-none focus:border-dusk-lavender/70"
                value={calendarRange}
                onChange={(event) => setCalendarRange(event.target.value as "7" | "30" | "all")}
              >
                <option value="7">Next 7 days</option>
                <option value="30">Next 30 days</option>
                <option value="all">All dates</option>
              </select>
              <select
                className="h-9 rounded-xl border border-white/10 bg-white/[0.065] px-2 text-xs text-stone-100 outline-none focus:border-dusk-lavender/70"
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
                    <label key={status} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-2 py-1 text-[11px] text-stone-300">
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
                    className="block rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-dusk-lavender/45 hover:bg-white/[0.065]"
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
                <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-stone-500">
                  No cards match the calendar filters.
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="lofi-panel relative mb-4 flex flex-col justify-between gap-3 overflow-hidden rounded-2xl p-5 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-start gap-3">
              <BackButton className="mt-1" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.35em] text-dusk-amber">Project Index</p>
                <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Choose your board</h2>
              </div>
            </div>
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="lofi-panel grid min-h-[420px] place-items-center overflow-hidden rounded-2xl p-8 text-center">
              <div className="max-w-md">
                <div className="asset-sticker-peek mx-auto mb-2 h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-white/5 opacity-90" />
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
  const router = useRouter();
  const cards = project.board?.columns.flatMap((column) => column.cards) ?? [];
  const columnCount = project.board?.columns.length ?? 0;
  const isDiaryProject = project.type === "DIARY";
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <article className="lofi-panel group relative flex min-h-[390px] flex-col overflow-hidden rounded-2xl transition duration-200 hover:-translate-y-0.5 hover:border-dusk-lavender/35 hover:shadow-xl hover:shadow-dusk-lavender/10">
        <div className="relative h-36 overflow-hidden border-b border-white/10">
          {project.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.coverImage} alt="cover" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_22%_20%,rgba(229,189,114,0.22),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(213,154,179,0.22),transparent_32%),linear-gradient(135deg,rgba(35,31,68,0.86),rgba(63,46,86,0.78)_48%,rgba(11,13,31,0.94))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-14">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink-950/55 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-dusk-amber backdrop-blur">
              {isDiaryProject ? <BookOpenCheck className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
              {isDiaryProject ? "Diary First" : "Workspace"}
            </div>
            <h3 className="truncate text-2xl font-semibold text-stone-50">{project.name}</h3>
          </div>
        </div>

        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-ink-950/70 text-stone-300 backdrop-blur-sm transition hover:border-dusk-lavender/50 hover:text-dusk-lavender"
            aria-label="Project options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-50 w-40 overflow-hidden rounded-lg border border-white/15 bg-[#020208] shadow-[0_22px_58px_rgba(0,0,0,0.78),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-stone-300 transition hover:bg-dusk-lavender/10 hover:text-dusk-lavender"
                  onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit project
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-400/10"
                  onClick={() => { setMenuOpen(false); setDeleteOpen(true); }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete project
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-stone-400">
            {project.description ?? "A quiet project workspace for tasks, notes, due dates, and rewards."}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
            <ProjectMetric icon={KanbanSquare} label="Boards" value={project.counts.boards} />
            <ProjectMetric icon={Layers3} label="Members" value={project.counts.members} />
            <ProjectMetric icon={Pencil} label="Notes" value={project.counts.notes} />
            <ProjectMetric icon={FolderKanban} label="Cards" value={cards.length} />
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-stone-400">
            <span>{columnCount} columns</span>
            <span>{project.board ? "Board ready" : "No board yet"}</span>
          </div>

          <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-[1fr_auto]">
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-dusk-lavender px-4 text-sm font-semibold text-ink-950 shadow-[0_10px_24px_rgba(169,162,255,0.18)] transition hover:-translate-y-0.5 hover:bg-dusk-amber"
              href={`/project/${project.id}/${isDiaryProject ? "diary" : "board"}`}
            >
              {isDiaryProject ? "Open diary" : "Open board"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-dusk-amber/25 bg-dusk-amber/5 px-4 text-sm font-medium text-dusk-amber transition hover:border-dusk-amber/55 hover:bg-dusk-amber/10"
              href={`/project/${project.id}/rewards`}
            >
              <Gift className="h-4 w-4" />
              Rewards
            </Link>
          </div>
        </div>
      </article>

      {/* Edit modal */}
      {editOpen && (
        <EditProjectModal
          project={project}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); router.refresh(); }}
        />
      )}

      {/* Delete modal */}
      <ConfirmModal
        open={deleteOpen}
        title="Delete project"
        message={`This will permanently delete "${project.name}" and all its boards, columns, and cards. This action cannot be undone.`}
        confirmLabel="Delete project"
        variant="danger"
        validateText={project.name}
        validatePlaceholder={`Type "${project.name}" to confirm`}
        onConfirm={async () => {
          const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
          if (res.ok) {
            setDeleteOpen(false);
            router.refresh();
          }
        }}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}

// ── Edit Project Modal ──────────────────────────────────────────────────────

function EditProjectModal({
  project,
  onClose,
  onSaved,
}: {
  project: ProjectDashboardItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [coverPreview, setCoverPreview] = useState<string | null>(project.coverImage ?? null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function handleCoverUpload(file: File) {
    setIsUploadingCover(true);
    // Local preview
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/projects/${project.id}/cover`, { method: "POST", body: fd });
    const data = (await res.json()) as { coverImage?: string; error?: string };
    setIsUploadingCover(false);
    if (!res.ok) setError(data.error ?? "Cover upload failed.");
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    });
    setIsSaving(false);
    if (!res.ok) {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "Could not save.");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form className="lofi-panel w-full max-w-lg rounded-lg" onSubmit={handleSave}>
        {/* Cover area */}
        <div
          className="relative h-28 cursor-pointer overflow-hidden rounded-t-lg"
          onClick={() => coverInputRef.current?.click()}
          title="Click to change cover"
        >
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-dusk-lavender/20 via-dusk-rose/10 to-dusk-cyan/10" />
          )}
          <div className="absolute inset-0 grid place-items-center bg-ink-950/50 opacity-0 transition hover:opacity-100">
            {isUploadingCover ? (
              <svg className="h-6 w-6 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <div className="flex items-center gap-2 text-sm text-white">
                <ImageIcon className="h-4 w-4" /> Change cover
              </div>
            )}
          </div>
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }}
        />

        {/* Form body */}
        <div className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Workspace</p>
              <h2 className="mt-1 text-2xl font-semibold">Edit Project</h2>
            </div>
            <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            <label className="block space-y-1.5 text-sm text-stone-300">
              <span className="text-xs uppercase tracking-[0.15em] text-stone-500">Project name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
            </label>
            <label className="block space-y-1.5 text-sm text-stone-300">
              <span className="text-xs uppercase tracking-[0.15em] text-stone-500">Description</span>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="resize-none" maxLength={500} />
            </label>
            {error && <p className="text-sm text-red-300">{error}</p>}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button disabled={isSaving || !name.trim()}>{isSaving ? "Saving..." : "Save changes"}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}


function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [projectType, setProjectType] = useState<"WORK" | "DIARY">("WORK");

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
        description: formData.get("description"),
        type: projectType
      })
    });
    const data = (await response.json()) as { project?: { id: string }; error?: string };

    setIsPending(false);

    if (!response.ok || !data.project) {
      setError(data.error ?? "Could not create project.");
      return;
    }

    router.push(`/project/${data.project.id}/${projectType === "DIARY" ? "diary" : "board"}`);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
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
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { value: "WORK", label: "Work board", icon: KanbanSquare },
              { value: "DIARY", label: "Diary only", icon: BookOpenCheck }
            ].map((option) => {
              const Icon = option.icon;
              const selected = projectType === option.value;

              return (
                <button
                  key={option.value}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition",
                    selected
                      ? "border-dusk-lavender bg-dusk-lavender/15 text-dusk-lavender"
                      : "border-white/10 bg-white/[0.035] text-stone-300 hover:border-dusk-lavender/45"
                  )}
                  type="button"
                  onClick={() => setProjectType(option.value as "WORK" | "DIARY")}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
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
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <Icon className="h-4 w-4 text-dusk-lavender" />
      <div>
        <p className="text-lg font-semibold leading-none">{value}</p>
        <p className="mt-1 text-xs text-stone-500">{label}</p>
      </div>
    </div>
  );
}

function ProjectMetric({
  icon: Icon,
  label,
  value
}: {
  icon: typeof FolderKanban;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 transition group-hover:border-white/20">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Icon className="h-3.5 w-3.5 text-dusk-lavender" />
        <p className="text-base font-semibold leading-none text-stone-100">{value}</p>
      </div>
      <p className="truncate text-[11px] text-stone-500">{label}</p>
    </div>
  );
}

function formatDue(card: GlobalCalendarCard) {
  return formatShortDue(card.dueDate, card.dueDateAllDay);
}
