"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState, useCallback, type CSSProperties, type MouseEvent } from "react";
import { useLiveSync } from "@/hooks/use-live-sync";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  FileText,
  FolderKanban,
  Gift,
  Image as ImageIcon,
  KanbanSquare,
  Layers3,
  LayoutDashboard,
  LayoutGrid,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  X,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { AppModal } from "@/components/ui/app-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EntityCard } from "@/components/ui/entity-card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/state";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";
import { DiaryItemModal, type DiaryPayload, type HubDiaryItem } from "@/components/hub/diary-hub-panel";
import { RetroStickerImage } from "@/components/stickers/retro-sticker-picker";
import { BoardSettingsModal } from "@/components/kanban/board-settings-modal";
import { ProjectAppearanceControls } from "@/components/project/project-appearance-controls";
import { UserProfilePopover } from "@/components/project/user-profile-popover";
import { NotificationsPopover } from "@/components/notifications/notifications-popover";
import { defaultCalendarFilters, filterCalendarItems } from "@/lib/calendar/view";
import { formatShortDue } from "@/lib/date-format";
import { getStatusMeta } from "@/lib/kanban/status";
import { DEFAULT_PROJECT_STICKER } from "@/lib/projects/appearance";
import { sortProjectsByStarred } from "@/lib/projects/sort";
import { getDiaryChecklistSummary } from "@/lib/diary/checklist";
import { isDiaryItemDueOnDate } from "@/lib/diary/recurrence";
import { getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { CardStatus } from "@/types/kanban";

export interface ProjectBoardSummary {
  id: string;
  name: string;
  isPrivate: boolean;
  columnCount: number;
  totalCards: number;
  doneCards: number;
  columnsPreview: Array<{
    id: string;
    name: string;
    cardCount: number;
  }>;
}

export interface ProjectDashboardItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  coverImage: string | null;
  themeColor: string;
  sticker: string;
  isOwner?: boolean;
  counts: {
    boards: number;
    members: number;
    notes: number;
  };
  boardsList?: ProjectBoardSummary[];
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

import type { DiaryChecklistItem, DiaryRewardCoinType } from "@/lib/diary/checklist";

export interface GlobalCalendarDiaryRaw {
  id: string;
  title: string;
  description: string | null;
  color: string;
  intervalDays: number;
  startDate: string;
  checklist: DiaryChecklistItem[];
  rewardCoins: number;
  rewardCoinType: DiaryRewardCoinType;
  rewardClaimedDates: string[];
  isStarred: boolean;
  isHidden: boolean;
  dueTime: string | null;
  projectId: string | null;
  project: {
    id: string;
    name: string;
  } | null;
}

export interface GlobalCalendarDiary extends GlobalCalendarDiaryRaw {
  diaryId: string;
  dueDate?: string;
  checklistSummary?: {
    completedCount: number;
    dueCount: number;
    hasChecklist: boolean;
    isDue: boolean;
    totalCount: number;
  };
  rawItem?: GlobalCalendarDiaryRaw;
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
  calendarDiaries = [],
  userProfile,
  databaseWarning,
}: {
  projects: ProjectDashboardItem[];
  calendarCards: GlobalCalendarCard[];
  calendarDiaries?: GlobalCalendarDiaryRaw[];
  userProfile?: UserProfile;
  databaseWarning?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectList, setProjectList] = useState<ProjectDashboardItem[]>(projects);
  const [selectedDiary, setSelectedDiary] = useState<HubDiaryItem | null>(null);
  const [calendarStatusFilters, setCalendarStatusFilters] = useState(defaultCalendarFilters.statuses);
  const [calendarTimeScope, setCalendarTimeScope] = useState(defaultCalendarFilters.timeScope);
  const [calendarRange, setCalendarRange] = useState<"7" | "30" | "all">("30");
  const [starredProjectIds, setStarredProjectIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState<"all" | "starred" | "work" | "diary">("all");

  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id ?? "");
  const [viewMode, setViewMode] = useState<"boards" | "workspaces">("boards");
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [boardSearchQuery, setBoardSearchQuery] = useState("");
  const [editingBoard, setEditingBoard] = useState<ProjectBoardSummary | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<ProjectBoardSummary | null>(null);
  const [editingProjectForSettings, setEditingProjectForSettings] = useState<ProjectDashboardItem | null>(null);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);

  useEffect(() => {
    setProjectList(projects);
    if (projects.length > 0 && (!activeProjectId || !projects.some((p) => p.id === activeProjectId))) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId]);

  const sortedProjects = useMemo(() => sortProjectsByStarred(projectList, starredProjectIds), [projectList, starredProjectIds]);
  const activeProject = useMemo(() => {
    return projectList.find((p) => p.id === activeProjectId) ?? sortedProjects[0] ?? null;
  }, [projectList, activeProjectId, sortedProjects]);
  const selectedProjectId = activeProject?.id ?? sortedProjects[0]?.id ?? "";

  const starredCount = useMemo(() => projectList.filter((p) => starredProjectIds.has(p.id)).length, [projectList, starredProjectIds]);
  const workCount = useMemo(() => projectList.filter((p) => p.type !== "DIARY").length, [projectList]);
  const diaryCount = useMemo(() => projectList.filter((p) => p.type === "DIARY").length, [projectList]);

  const activeProjectBoards = useMemo(() => {
    if (!activeProject) return [];
    const boards =
      activeProject.boardsList && activeProject.boardsList.length > 0
        ? activeProject.boardsList
        : activeProject.board
        ? [
            {
              id: activeProject.board.id,
              name: "Main Kanban",
              isPrivate: false,
              columnCount: activeProject.board.columns.length,
              totalCards: activeProject.board.columns.reduce((s, col) => s + col.cards.length, 0),
              doneCards: activeProject.board.columns.reduce(
                (s, col) => s + col.cards.filter((c) => c.status === "DONE").length,
                0
              ),
              columnsPreview: activeProject.board.columns.map((col) => ({
                id: col.id,
                name: col.name,
                cardCount: col.cards.length
              }))
            }
          ]
        : [];

    if (!boardSearchQuery.trim()) return boards;
    const q = boardSearchQuery.toLowerCase().trim();
    return boards.filter((b) => b.name.toLowerCase().includes(q));
  }, [activeProject, boardSearchQuery]);

  const activeProjectTotalCards = useMemo(() => {
    if (!activeProject) return 0;
    if (activeProject.boardsList && activeProject.boardsList.length > 0) {
      return activeProject.boardsList.reduce((sum, b) => sum + b.totalCards, 0);
    }
    return activeProject.board?.columns.reduce((sum, col) => sum + col.cards.length, 0) ?? 0;
  }, [activeProject]);

  const activeProjectDoneCards = useMemo(() => {
    if (!activeProject) return 0;
    if (activeProject.boardsList && activeProject.boardsList.length > 0) {
      return activeProject.boardsList.reduce((sum, b) => sum + b.doneCards, 0);
    }
    return activeProject.board?.columns.reduce((sum, col) => sum + col.cards.filter((c) => c.status === "DONE").length, 0) ?? 0;
  }, [activeProject]);

  const activeProjectProgress = useMemo(() => {
    if (activeProjectTotalCards === 0) return 0;
    return Math.round((activeProjectDoneCards / activeProjectTotalCards) * 100);
  }, [activeProjectTotalCards, activeProjectDoneCards]);

  const displayedProjects = useMemo(() => {
    return sortedProjects.filter((project) => {
      if (activeFilterTab === "starred" && !starredProjectIds.has(project.id)) {
        return false;
      }
      if (activeFilterTab === "work" && project.type === "DIARY") {
        return false;
      }
      if (activeFilterTab === "diary" && project.type !== "DIARY") {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = project.name.toLowerCase().includes(q);
        const matchDesc = (project.description ?? "").toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [sortedProjects, activeFilterTab, starredProjectIds, searchQuery]);

  const onSync = useCallback(() => {
    router.refresh();
  }, [router]);

  const { broadcastChange } = useLiveSync({
    channelKey: "projects",
    intervalMs: 8000,
    canSync: () => !isCreateOpen && !selectedDiary && !document.querySelector("[role='dialog']"),
    onSync
  });

  function handleUpdateProject(updated: ProjectDashboardItem) {
    setProjectList((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    broadcastChange();
  }

  function handleDeleteProject(id: string) {
    setProjectList((prev) => prev.filter((p) => p.id !== id));
    broadcastChange();
  }

  function handleCreateBoard(newBoard: ProjectBoardSummary) {
    if (!activeProject) return;
    setProjectList((prev) =>
      prev.map((p) => {
        if (p.id !== activeProject.id) return p;
        const currentBoards = p.boardsList ?? [];
        return {
          ...p,
          counts: { ...p.counts, boards: p.counts.boards + 1 },
          boardsList: [...currentBoards, newBoard]
        };
      })
    );
    broadcastChange();
    toast({ message: `Board "${newBoard.name}" created.`, type: "success" });
  }

  function handleUpdateBoard(updatedBoard: ProjectBoardSummary) {
    if (!activeProject) return;
    setProjectList((prev) =>
      prev.map((p) => {
        if (p.id !== activeProject.id) return p;
        const currentBoards = p.boardsList ?? [];
        return {
          ...p,
          boardsList: currentBoards.map((b) => (b.id === updatedBoard.id ? updatedBoard : b))
        };
      })
    );
    broadcastChange();
    toast({ message: `Board updated to "${updatedBoard.name}".`, type: "success" });
  }

  function handleDeleteBoard(boardId: string) {
    if (!activeProject) return;
    setProjectList((prev) =>
      prev.map((p) => {
        if (p.id !== activeProject.id) return p;
        const currentBoards = p.boardsList ?? [];
        return {
          ...p,
          counts: { ...p.counts, boards: Math.max(0, p.counts.boards - 1) },
          boardsList: currentBoards.filter((b) => b.id !== boardId)
        };
      })
    );
    broadcastChange();
  }

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("retrod:starred-projects");
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (Array.isArray(parsed)) {
          setStarredProjectIds(new Set(parsed.filter((id): id is string => typeof id === "string")));
        }
      }
    } catch {
      setStarredProjectIds(new Set());
    }
  }, []);

  function toggleProjectStar(projectId: string) {
    setStarredProjectIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }

      window.localStorage.setItem("retrod:starred-projects", JSON.stringify([...next]));
      return next;
    });
  }

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

  const filteredCalendarItems = useMemo(() => {
    const cardItems = filteredCalendarCards.map((card) => ({
      ...card,
      type: "card" as const
    }));

    const limit = calendarRange === "all" ? 30 : Number(calendarRange);
    const now = new Date();
    const diariesList: Array<GlobalCalendarDiary & { type: "diary" }> = [];
    const todayKey = now.toISOString().slice(0, 10);

    for (let offset = 0; offset <= limit; offset++) {
      const date = new Date(now);
      date.setDate(now.getDate() + offset);
      const dateStr = date.toISOString().slice(0, 10);

      // diaries list in calendar will only generate when that date has arrived, not in advance!
      if (dateStr > todayKey) {
        continue;
      }

      for (const diary of calendarDiaries) {
        const isDue = isDiaryItemDueOnDate(diary.startDate, dateStr, diary.intervalDays);
        if (isDue) {
          const checklistSummary = getDiaryChecklistSummary(diary, dateStr);
          diariesList.push({
            ...diary,
            type: "diary",
            id: `diary-${diary.id}-${dateStr}`,
            diaryId: diary.id,
            dueDate: dateStr,
            checklistSummary,
            rawItem: diary
          });
        }
      }
    }

    const merged = [...cardItems, ...diariesList];

    merged.sort((a, b) => {
      const dateA = new Date(a.dueDate ?? "");
      const dateB = new Date(b.dueDate ?? "");
      return dateA.getTime() - dateB.getTime();
    });

    merged.sort((a, b) => {
      const aDone = a.type === "card"
        ? a.status === "DONE"
        : !!(a.checklistSummary && a.checklistSummary.dueCount > 0 && a.checklistSummary.completedCount === a.checklistSummary.dueCount);
      const bDone = b.type === "card"
        ? b.status === "DONE"
        : !!(b.checklistSummary && b.checklistSummary.dueCount > 0 && b.checklistSummary.completedCount === b.checklistSummary.dueCount);
      if (aDone && !bDone) return 1;
      if (!aDone && bDone) return -1;
      return 0;
    });

    return merged;
  }, [filteredCalendarCards, calendarDiaries, calendarRange]);

  async function handleSaveDiary(payload: DiaryPayload) {
    if (!selectedDiary) return;
    try {
      const response = await fetch(`/api/diary-items/${selectedDiary.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        toast({
          message: "Diary updated successfully.",
          type: "success"
        });
        setSelectedDiary(null);
        router.refresh();
      } else {
        toast({
          message: "Failed to update the diary item.",
          type: "error"
        });
      }
    } catch {
      toast({
        message: "An unexpected error occurred.",
        type: "error"
      });
    }
  }

  async function handleDeleteDiary() {
    if (!selectedDiary) return;
    try {
      const response = await fetch(`/api/diary-items/${selectedDiary.id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        toast({
          message: "Diary deleted successfully.",
          type: "success"
        });
        setSelectedDiary(null);
        router.refresh();
      } else {
        toast({
          message: "Failed to delete the diary.",
          type: "error"
        });
      }
    } catch {
      toast({
        message: "An unexpected error occurred.",
        type: "error"
      });
    }
  }

  return (
    <main className="soft-grid-bg h-screen w-full overflow-hidden p-3 sm:p-4 lg:p-5">
      <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <aside className="lofi-panel relative flex min-h-0 flex-col overflow-hidden rounded-2xl p-5 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-dusk-lavender/25 bg-dusk-lavender/10 text-dusk-lavender">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-dusk-amber">Retzlo</p>
                <h1 className="text-xl font-semibold">Workspaces</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsPopover />
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
          </div>

          <div className="mt-5">
            <FilterSelect
              label="Active Project"
              value={selectedProjectId}
              options={[
                ...(projects.length === 0 ? [{ value: "", label: "No projects" }] : []),
                ...sortedProjects.map((project) => ({ value: project.id, label: project.name }))
              ]}
              onValueChange={(value) => {
                if (value) {
                  setActiveProjectId(value);
                  setViewMode("boards");
                }
              }}
            />
          </div>

          <Link
            href="/projects/rewards"
            className="group mt-4 flex items-center justify-between rounded-xl border border-dusk-amber/30 bg-gradient-to-r from-dusk-amber/10 via-dusk-amber/5 to-transparent px-4 py-3 text-sm font-semibold text-dusk-amber transition hover:border-dusk-amber/60 hover:from-dusk-amber/20 hover:shadow-[0_4px_16px_rgba(229,189,114,0.15)]"
          >
            <div className="flex items-center gap-2.5">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-dusk-amber/20 text-dusk-amber transition group-hover:scale-110">
                <Gift className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-dusk-amber">Arcade Store</p>
                <p className="text-stone-200 text-xs font-medium">Redeem Rewards</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-dusk-amber transition group-hover:translate-x-0.5" />
          </Link>

          <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 backdrop-blur">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-200">
                <CalendarDays className="h-3.5 w-3.5 text-dusk-cyan" />
                Agenda & Deadlines
              </div>
              <span className="rounded-full border border-dusk-cyan/20 bg-dusk-cyan/10 px-2 py-0.5 text-[10px] font-mono font-medium text-dusk-cyan">
                {filteredCalendarItems.length}
              </span>
            </div>

            {/* Segmented Range Selector */}
            <div className="mb-2 flex rounded-lg border border-white/10 bg-black/20 p-0.5">
              {(["7", "30", "all"] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setCalendarRange(range)}
                  className={cn(
                    "flex-1 rounded-md py-1 text-center text-[11px] font-medium transition",
                    calendarRange === range
                      ? "bg-dusk-cyan/20 text-dusk-cyan font-semibold shadow-sm border border-dusk-cyan/30"
                      : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.04]"
                  )}
                >
                  {range === "7" ? "7 Days" : range === "30" ? "30 Days" : "All"}
                </button>
              ))}
            </div>

            {/* Status Pills Filter */}
            <div className="mb-2.5 grid grid-cols-2 gap-1">
              {(["TODO", "DOING", "WAITING", "DONE"] as const).map((status) => {
                const meta = getStatusMeta(status);
                const isChecked = calendarStatusFilters[status];
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setCalendarStatusFilters((current) => ({
                        ...current,
                        [status]: !current[status]
                      }))
                    }
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-medium transition text-left",
                      isChecked
                        ? "border-white/15 bg-white/[0.08] text-stone-200"
                        : "border-transparent bg-white/[0.02] text-stone-500 opacity-50 hover:opacity-100"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full border shrink-0", meta.badgeClass)} />
                    <span className="truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-soft">
              {filteredCalendarItems.slice(0, 8).map((item) => {
                if (item.type === "card") {
                  const status = getStatusMeta(item.status);
                  return (
                    <Link
                      key={item.id}
                      className="block rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-dusk-lavender/45 hover:bg-white/[0.065]"
                      href={`/project/${item.project.id}/calendar`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-medium text-stone-100">{item.title}</p>
                        <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[10px]", status.badgeClass)}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-xs text-dusk-cyan">
                        <Clock className="h-3 w-3" />
                        {formatDue(item)}
                      </p>
                      <p className="mt-1 truncate text-xs text-stone-500">{item.project.name}</p>
                    </Link>
                  );
                } else {
                  const diaryItem = item as Required<Pick<GlobalCalendarDiary, "checklistSummary" | "dueDate" | "dueTime" | "title" | "id" | "rawItem">> & { project: GlobalCalendarDiary["project"] };
                  const highlight = getDiaryHighlightStatus(diaryItem);
                  let borderClass = "border-white/10 bg-white/[0.04] hover:border-dusk-lavender/45 hover:bg-white/[0.065]";
                  if (highlight === "warn-red") {
                    borderClass = "border-red-500/40 bg-red-500/5 hover:border-red-500/60";
                  } else if (highlight === "completed") {
                    borderClass = "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50";
                  }

                  return (
                    <button
                      key={diaryItem.id}
                      type="button"
                      className={cn("block w-full text-left rounded-xl border p-3 transition", borderClass)}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!diaryItem.rawItem) return;
                        const hubItem: HubDiaryItem = {
                          ...diaryItem.rawItem,
                          color: normalizeCardColor(diaryItem.rawItem.color),
                          authorId: "",
                          createdAt: diaryItem.rawItem.startDate,
                          updatedAt: diaryItem.rawItem.startDate,
                          canManage: true,
                          canToggleHidden: true,
                          author: { name: null, email: "" },
                          projectName: diaryItem.rawItem.project?.name ?? null
                        };
                        setSelectedDiary(hubItem);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-medium text-stone-100">{diaryItem.title}</p>
                        {diaryItem.checklistSummary.dueCount > 0 ? (
                          <span className="shrink-0 rounded border border-dusk-cyan/20 bg-dusk-cyan/10 px-1.5 py-0.5 text-[10px] text-dusk-cyan font-mono">
                            {diaryItem.checklistSummary.completedCount}/{diaryItem.checklistSummary.dueCount}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-xs text-dusk-cyan">
                        <Clock className="h-3 w-3" />
                        {diaryItem.dueTime ? `${diaryItem.dueDate} ${diaryItem.dueTime}` : `${diaryItem.dueDate}`}
                      </p>
                      <p className="mt-1 truncate text-xs text-stone-500">
                        {diaryItem.project ? diaryItem.project.name : "Personal Diary"}
                      </p>
                    </button>
                  );
                }
              })}
              {filteredCalendarItems.length === 0 ? (
                <EmptyState
                  className="border-dashed bg-white/[0.02] p-4 text-left"
                  title="No calendar matches"
                  message="No cards or diaries match the selected filters."
                />
              ) : null}
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col">
          {databaseWarning ? (
            <div className="mb-4 rounded-2xl border border-dusk-rose/25 bg-dusk-rose/10 px-4 py-3 text-sm leading-6 text-dusk-rose">
              {databaseWarning}
            </div>
          ) : null}

          {/* Unified Studio Command Header */}
          <div className="lofi-panel sticky top-0 z-30 mb-4 flex shrink-0 flex-col gap-3.5 rounded-2xl p-4 sm:p-5 backdrop-blur-xl border border-white/10 bg-ink-950/75 shadow-lg">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <BackButton />
                {activeProject ? (
                  <Popover open={workspaceDropdownOpen} onOpenChange={setWorkspaceDropdownOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-1.5 text-left transition hover:border-dusk-lavender/50 hover:bg-white/[0.07] data-[state=open]:border-dusk-lavender/50 data-[state=open]:bg-white/[0.07]"
                        aria-label="Switch active workspace"
                      >
                        <div className="grid h-8 w-8 place-items-center rounded-lg border border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender shrink-0">
                          {activeProject.sticker ? (
                            <RetroStickerImage alt={activeProject.name} size={24} src={activeProject.sticker} />
                          ) : (
                            <FolderKanban className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-dusk-amber">
                              Active Workspace
                            </span>
                            <span className="text-[10px] text-stone-500">· {projectList.length} total</span>
                          </div>
                          <h2 className="flex items-center gap-1.5 truncate text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-dusk-lavender transition-colors">
                            <span className="truncate">{activeProject.name}</span>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 shrink-0 text-stone-400 group-hover:text-stone-200 transition-transform duration-200",
                                workspaceDropdownOpen && "rotate-180 text-dusk-lavender"
                              )}
                            />
                          </h2>
                        </div>
                      </button>
                    </PopoverTrigger>

                    <PopoverContent
                      align="start"
                      sideOffset={8}
                      className="w-72 sm:w-80 overflow-hidden rounded-2xl border border-dusk-lavender/30 bg-[#080714]/98 p-2 shadow-2xl backdrop-blur-xl z-[750]"
                    >
                      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                        Switch Workspace
                      </p>
                      <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-soft pr-1">
                        {sortedProjects.map((p) => {
                          const isSelected = p.id === activeProject.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setActiveProjectId(p.id);
                                setViewMode("boards");
                                setWorkspaceDropdownOpen(false);
                              }}
                              className={cn(
                                "flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition",
                                isSelected
                                  ? "border border-dusk-lavender/30 bg-dusk-lavender/15 text-white font-semibold"
                                  : "text-stone-300 hover:bg-white/[0.06] hover:text-white"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="h-7 w-7 shrink-0 place-items-center grid rounded-lg bg-white/5 border border-white/10">
                                  {p.sticker ? (
                                    <RetroStickerImage alt={p.name} size={20} src={p.sticker} />
                                  ) : (
                                    <FolderKanban className="h-3.5 w-3.5 text-stone-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate font-semibold">{p.name}</p>
                                  <p className="text-[10px] text-stone-500 font-mono">
                                    {p.counts.boards} {p.counts.boards === 1 ? "board" : "boards"}
                                  </p>
                                </div>
                              </div>
                              {isSelected && <Check className="h-4 w-4 text-dusk-lavender shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-2 border-t border-white/10 pt-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setWorkspaceDropdownOpen(false);
                            setIsCreateOpen(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-dusk-amber hover:bg-dusk-amber/10 transition"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Create New Workspace</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setWorkspaceDropdownOpen(false);
                            setViewMode("workspaces");
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-stone-400 hover:bg-white/5 hover:text-stone-200 transition"
                        >
                          <LayoutGrid className="h-3.5 w-3.5" />
                          <span>View All Workspaces Grid</span>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold tracking-tight text-white">Workspaces</h2>
                  </div>
                )}
              </div>

              {/* View mode toggle + Primary action button */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex rounded-xl border border-white/10 bg-black/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("boards")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                      viewMode === "boards"
                        ? "border border-dusk-lavender/40 bg-dusk-lavender/20 text-dusk-lavender font-semibold shadow-sm"
                        : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.04]"
                    )}
                  >
                    <KanbanSquare className="h-3.5 w-3.5" />
                    <span>Boards Hub</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("workspaces")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                      viewMode === "workspaces"
                        ? "border border-dusk-lavender/40 bg-dusk-lavender/20 text-dusk-lavender font-semibold shadow-sm"
                        : "text-stone-400 hover:text-stone-200 hover:bg-white/[0.04]"
                    )}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>All Workspaces</span>
                    <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono">
                      {projectList.length}
                    </span>
                  </button>
                </div>

                {viewMode === "boards" && activeProject ? (
                  <Button
                    type="button"
                    onClick={() => setIsCreateBoardOpen(true)}
                    className="shrink-0 bg-dusk-lavender text-ink-950 hover:bg-dusk-amber transition-all shadow-[0_10px_26px_rgba(169,162,255,0.2)] font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    New Board
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="shrink-0 bg-dusk-lavender text-ink-950 hover:bg-dusk-amber transition-all shadow-[0_10px_26px_rgba(169,162,255,0.2)] font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                )}
              </div>
            </div>

            {/* Sub-navigation bar when viewing active workspace boards */}
            {viewMode === "boards" && activeProject ? (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-2 border-t border-white/10 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setViewMode("boards")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dusk-lavender/40 bg-dusk-lavender/15 px-3 py-1.5 text-xs font-bold text-dusk-lavender shadow-sm"
                >
                  <KanbanSquare className="h-3.5 w-3.5 text-dusk-lavender" />
                  <span>Boards Hub</span>
                  <span className="rounded-full bg-dusk-lavender/25 px-1.5 py-0.2 text-[10px] font-mono text-dusk-lavender">
                    {activeProject.boardsList?.length ?? activeProject.counts.boards}
                  </span>
                </button>

                <Link
                  href={`/project/${activeProject.id}/calendar`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-stone-400 transition hover:border-dusk-cyan/40 hover:bg-dusk-cyan/10 hover:text-dusk-cyan"
                >
                  <CalendarDays className="h-3.5 w-3.5 text-dusk-cyan" />
                  <span>Calendar</span>
                </Link>

                <Link
                  href={`/project/${activeProject.id}/notes`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-stone-400 transition hover:border-dusk-rose/40 hover:bg-dusk-rose/10 hover:text-dusk-rose"
                >
                  <FileText className="h-3.5 w-3.5 text-dusk-rose" />
                  <span>Notes</span>
                  <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono">
                    {activeProject.counts.notes}
                  </span>
                </Link>

                <Link
                  href={`/project/${activeProject.id}/members`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-stone-400 transition hover:border-white/30 hover:bg-white/[0.08] hover:text-stone-200"
                >
                  <Users className="h-3.5 w-3.5 text-stone-300" />
                  <span>Members</span>
                  <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono">
                    {activeProject.counts.members}
                  </span>
                </Link>

                <Link
                  href={`/project/${activeProject.id}/rewards`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-stone-400 transition hover:border-dusk-amber/40 hover:bg-dusk-amber/10 hover:text-dusk-amber"
                >
                  <Gift className="h-3.5 w-3.5 text-dusk-amber" />
                  <span>Rewards</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setEditingProjectForSettings(activeProject)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-stone-400 transition hover:border-white/30 hover:bg-white/[0.08] hover:text-stone-200"
                >
                  <Settings className="h-3.5 w-3.5 text-stone-300" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </div>
            ) : (
              /* Search and Category Filter Toolbar when in All Workspaces view */
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between border-t border-white/10">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search workspaces..."
                    className="h-8.5 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-8 text-xs text-stone-200 placeholder-stone-400 outline-none transition focus:border-dusk-lavender/50 focus:bg-white/[0.06]"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveFilterTab("all")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                      activeFilterTab === "all"
                        ? "border border-dusk-lavender/40 bg-dusk-lavender/15 text-dusk-lavender font-semibold"
                        : "border border-white/10 bg-white/[0.03] text-stone-400 hover:text-stone-200 hover:bg-white/[0.06]"
                    )}
                  >
                    <LayoutGrid className="h-3 w-3" />
                    <span>All</span>
                    <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px]">{projectList.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilterTab("starred")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                      activeFilterTab === "starred"
                        ? "border border-dusk-amber/40 bg-dusk-amber/15 text-dusk-amber font-semibold"
                        : "border border-white/10 bg-white/[0.03] text-stone-400 hover:text-stone-200 hover:bg-white/[0.06]"
                    )}
                  >
                    <Star className="h-3 w-3 fill-current" />
                    <span>Starred</span>
                    <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px]">{starredCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilterTab("work")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                      activeFilterTab === "work"
                        ? "border border-dusk-cyan/40 bg-dusk-cyan/15 text-dusk-cyan font-semibold"
                        : "border border-white/10 bg-white/[0.03] text-stone-400 hover:text-stone-200 hover:bg-white/[0.06]"
                    )}
                  >
                    <KanbanSquare className="h-3 w-3" />
                    <span>Work</span>
                    <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px]">{workCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilterTab("diary")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
                      activeFilterTab === "diary"
                        ? "border border-dusk-rose/40 bg-dusk-rose/15 text-dusk-rose font-semibold"
                        : "border border-white/10 bg-white/[0.03] text-stone-400 hover:text-stone-200 hover:bg-white/[0.06]"
                    )}
                  >
                    <BookOpenCheck className="h-3 w-3" />
                    <span>Diary</span>
                    <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px]">{diaryCount}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {projectList.length === 0 ? (
            <div className="lofi-panel grid min-h-0 flex-1 place-items-center overflow-hidden rounded-2xl p-8 text-center">
              <div className="max-w-md">
                <div className="mx-auto mb-2 h-24 w-24">
                  <RetroStickerImage alt="Paper note sticker" size={96} src="/stickers/retro/retro-sticker-12-paper-note.png" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold">No projects yet</h3>
                <p className="mt-2 text-sm text-stone-400">Create the first workspace and Retzlo will open its board for you.</p>
                <Button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-5 bg-dusk-lavender text-ink-950 font-bold hover:bg-dusk-amber transition"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create Workspace
                </Button>
              </div>
            </div>
          ) : viewMode === "boards" && activeProject ? (
            /* BOARDS HUB VIEW FOR ACTIVE WORKSPACE */
            <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-soft">
              {/* Workspace Hero Banner */}
              <div className="relative mb-5 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent p-4 sm:p-5 backdrop-blur-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-ink-950/60 p-2 shadow-inner">
                      {activeProject.sticker ? (
                        <RetroStickerImage alt={activeProject.name} size={42} src={activeProject.sticker} />
                      ) : (
                        <FolderKanban className="h-8 w-8 text-dusk-lavender" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
                          {activeProject.name}
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-amber">
                          {activeProject.type === "DIARY" ? "Diary Space" : "Workspace"}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 max-w-xl text-xs text-stone-400">
                        {activeProject.description ?? "Central workspace for boards, pipelines, notes, and deadlines."}
                      </p>
                    </div>
                  </div>

                  {/* Quick stats in Hero */}
                  <div className="flex items-center gap-2 self-start shrink-0 sm:self-center">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-stone-400">Tasks</p>
                      <p className="text-sm font-bold font-mono text-stone-200">{activeProjectTotalCards}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-stone-400">Done</p>
                      <p className="text-sm font-bold font-mono text-dusk-cyan">{activeProjectDoneCards}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-stone-400">Progress</p>
                      <p className="text-sm font-bold font-mono text-dusk-lavender">{activeProjectProgress}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boards in Active Workspace Header + Filter */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-stone-100">
                    Boards in {activeProject.name}
                  </h3>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs font-mono font-medium text-stone-300">
                    {activeProjectBoards.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      value={boardSearchQuery}
                      onChange={(e) => setBoardSearchQuery(e.target.value)}
                      placeholder="Filter boards..."
                      className="h-8.5 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-8 text-xs text-stone-200 placeholder-stone-400 outline-none transition focus:border-dusk-lavender/50 focus:bg-white/[0.06]"
                    />
                    {boardSearchQuery ? (
                      <button
                        type="button"
                        onClick={() => setBoardSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                        aria-label="Clear board search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    onClick={() => setIsCreateBoardOpen(true)}
                    size="sm"
                    className="shrink-0 bg-dusk-lavender text-ink-950 hover:bg-dusk-amber transition font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <span>New Board</span>
                  </Button>
                </div>
              </div>

              {/* Boards Grid */}
              {activeProjectBoards.length === 0 && boardSearchQuery ? (
                <div className="lofi-panel grid min-h-[220px] place-items-center rounded-2xl border border-white/10 p-6 text-center">
                  <div>
                    <h4 className="text-base font-bold text-stone-200">No boards match &ldquo;{boardSearchQuery}&rdquo;</h4>
                    <p className="mt-1 text-xs text-stone-400">Try another search term or clear the filter.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 text-xs"
                      onClick={() => setBoardSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid min-w-0 content-start gap-4 pb-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {activeProjectBoards.map((board) => (
                    <WorkspaceBoardCard
                      key={board.id}
                      board={board}
                      projectId={activeProject.id}
                      onEdit={(b) => setEditingBoard(b)}
                      onDelete={(b) => setDeletingBoard(b)}
                      canManage={activeProject.isOwner !== false}
                    />
                  ))}
                  <QuickCreateBoardBlueprintCard
                    projectName={activeProject.name}
                    onCreateClick={() => setIsCreateBoardOpen(true)}
                  />
                </div>
              )}
            </div>
          ) : (
            /* ALL WORKSPACES GRID VIEW */
            displayedProjects.length === 0 ? (
              <div className="lofi-panel grid min-h-[320px] flex-1 place-items-center overflow-hidden rounded-2xl p-8 text-center border border-white/10">
                <div className="max-w-md">
                  <div className="mx-auto mb-3 h-20 w-20">
                    <RetroStickerImage alt="Empty sticker" size={80} src="/stickers/retro/retro-sticker-12-paper-note.png" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-100">No matching workspaces</h3>
                  <p className="mt-1.5 text-sm text-stone-400">
                    {searchQuery ? `No workspaces matching "${searchQuery}".` : "No workspaces in this category yet."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 text-xs"
                    onClick={() => { setSearchQuery(""); setActiveFilterTab("all"); }}
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-soft">
                <div className="grid min-w-0 content-start gap-4 pb-4 xl:grid-cols-2">
                  {displayedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      isStarred={starredProjectIds.has(project.id)}
                      project={project}
                      onToggleStar={() => toggleProjectStar(project.id)}
                      onUpdateProject={handleUpdateProject}
                      onDeleteProject={handleDeleteProject}
                    />
                  ))}
                  {displayedProjects.length === 1 ? (
                    <QuickCreateBlueprintCard onCreateClick={() => setIsCreateOpen(true)} />
                  ) : null}
                </div>
              </div>
            )
          )}
        </section>

        {projectList.length > 0 ? <ProjectSupportColumn projects={sortedProjects} calendarCards={filteredCalendarCards} /> : null}
      </div>

      {isCreateOpen ? <CreateProjectModal onClose={() => setIsCreateOpen(false)} onCreated={broadcastChange} /> : null}
      {selectedDiary ? (
        <DiaryItemModal
          item={selectedDiary}
          title="Edit Diary"
          isPersonal={!selectedDiary.projectId}
          selectedDate={new Date().toISOString().slice(0, 10)}
          onClose={() => setSelectedDiary(null)}
          onDelete={handleDeleteDiary}
          onSubmit={handleSaveDiary}
        />
      ) : null}
      {isCreateBoardOpen && activeProject ? (
        <CreateBoardModal
          projectId={activeProject.id}
          projectName={activeProject.name}
          onClose={() => setIsCreateBoardOpen(false)}
          onCreated={handleCreateBoard}
        />
      ) : null}
      {editingBoard && activeProject ? (
        <BoardSettingsModal
          open={Boolean(editingBoard)}
          onClose={() => setEditingBoard(null)}
          projectId={activeProject.id}
          boardId={editingBoard.id}
          boardName={editingBoard.name}
          isPrivate={editingBoard.isPrivate}
          columnsPreview={editingBoard.columnsPreview}
          canManage={activeProject.isOwner !== false}
          onSaved={(updated) => {
            handleUpdateBoard({
              ...editingBoard,
              name: updated.name,
              isPrivate: updated.isPrivate
            });
            setEditingBoard(null);
            router.refresh();
          }}
          onDeleted={(boardId) => {
            handleDeleteBoard(boardId);
            setEditingBoard(null);
            router.refresh();
          }}
        />
      ) : null}
      {deletingBoard ? (
        <ConfirmModal
          open={Boolean(deletingBoard)}
          title="Delete board"
          message={`This will permanently delete "${deletingBoard.name}" and all its columns and cards. This action cannot be undone.`}
          confirmLabel="Delete board"
          variant="danger"
          validateText={deletingBoard.name}
          validatePlaceholder={`Type "${deletingBoard.name}" to confirm`}
          onConfirm={async () => {
            const res = await fetch(`/api/boards/${deletingBoard.id}`, { method: "DELETE" });
            if (res.ok) {
              handleDeleteBoard(deletingBoard.id);
              toast({ message: `Board "${deletingBoard.name}" deleted.`, type: "success" });
              setDeletingBoard(null);
              router.refresh();
            } else {
              const data = await res.json().catch(() => ({}));
              toast({ message: data.error ?? "Could not delete board.", type: "error" });
            }
          }}
          onClose={() => setDeletingBoard(null)}
        />
      ) : null}
      {editingProjectForSettings ? (
        <EditProjectModal
          project={editingProjectForSettings}
          onClose={() => setEditingProjectForSettings(null)}
          onSaved={(updated) => {
            setEditingProjectForSettings(null);
            if (updated) {
              handleUpdateProject(updated);
            }
            router.refresh();
          }}
        />
      ) : null}
    </main>
  );
}

function ProjectSupportColumn({
  projects,
  calendarCards
}: {
  projects: ProjectDashboardItem[];
  calendarCards: Array<GlobalCalendarCard & { type: "card" }>;
}) {
  const totalCards = projects.reduce(
    (count, project) => count + (project.board?.columns.reduce((sum, column) => sum + column.cards.length, 0) ?? 0),
    0
  );
  const totalNotes = projects.reduce((count, project) => count + project.counts.notes, 0);
  const totalBoards = projects.reduce((count, project) => count + project.counts.boards, 0);
  const activeProjects = projects.filter((project) => project.board || project.type === "DIARY").length;
  const rhythmItems = calendarCards.slice(0, 4);

  return (
    <aside className="hidden min-h-0 min-w-0 2xl:sticky 2xl:top-5 2xl:block 2xl:h-[calc(100vh-2.5rem)]">
      <section className="lofi-panel relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl p-5 border border-white/10">
        <div className="shrink-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-dusk-amber font-semibold">Studio Pulse</p>
              <h4 className="mt-1 text-base font-bold text-stone-100">Upcoming Deadlines</h4>
            </div>
            <div className="h-10 w-10 shrink-0 rotate-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/stickers/retro/retro-sticker-42-hourglass.png" alt="" className="h-full w-full object-contain" />
            </div>
          </div>
          <div className="space-y-2">
            {rhythmItems.length > 0 ? (
              rhythmItems.map((item) => {
                const status = getStatusMeta(item.status);

                return (
                  <Link
                    key={item.id}
                    href={`/project/${item.project.id}/calendar`}
                    className="block rounded-xl border border-white/10 bg-white/[0.035] p-2.5 transition hover:border-dusk-lavender/45 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full border", status.badgeClass)} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-stone-100">{item.title}</p>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500">
                          <span className="truncate">{item.project.name}</span>
                          <span className="text-dusk-cyan font-mono text-[10px] shrink-0 ml-1">{formatDue(item)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <EmptyState
                className="border-dashed bg-ink-950/20 p-4 text-left"
                title="No due dates queued"
                message="Add dates to cards and the next moves will appear here."
              />
            )}
          </div>
        </div>

        <div className="mt-5 shrink-0">
          <p className="text-[10px] uppercase tracking-[0.28em] text-dusk-amber font-semibold">Studio Metrics</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <ProjectStatusMetric label="Projects" value={projects.length} tone="lavender" />
            <ProjectStatusMetric label="Active" value={activeProjects} tone="cyan" />
            <ProjectStatusMetric label="Boards" value={totalBoards} tone="amber" />
            <ProjectStatusMetric label="Cards" value={totalCards} tone="lavender" />
            <ProjectStatusMetric label="Notes" value={totalNotes} tone="rose" />
            <ProjectStatusMetric label="Due soon" value={calendarCards.length} tone="cyan" />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
          <div className="flex items-center justify-between text-stone-300">
            <span className="font-semibold flex items-center gap-1.5 text-xs text-stone-200">
              <Zap className="h-3.5 w-3.5 text-dusk-amber" />
              Omni Command
            </span>
            <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-stone-300">
              Ctrl + K
            </kbd>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-stone-400">
            Search across all boards, cards, and notes instantly from anywhere.
          </p>
        </div>

        <div className="mt-auto min-h-0 pt-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Workspace mood</p>
              <p className="mt-0.5 text-xs font-semibold text-stone-100">
                {calendarCards.length > 0 ? "Ready for focused work" : "Calm, no dated pressure"}
              </p>
            </div>
            <div className="h-10 w-10 shrink-0 -rotate-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/stickers/retro/retro-sticker-49-cozy-flame.png" alt="" className="h-full w-full object-contain" />
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}

function ProjectStatusMetric({
  label,
  value,
  tone = "lavender",
  compact = false
}: {
  label: string;
  value: number;
  tone?: "lavender" | "amber" | "cyan" | "rose";
  compact?: boolean;
}) {
  const toneClass = {
    lavender: "text-dusk-lavender border-dusk-lavender/25 bg-dusk-lavender/10",
    amber: "text-dusk-amber border-dusk-amber/25 bg-dusk-amber/10",
    cyan: "text-dusk-cyan border-dusk-cyan/25 bg-dusk-cyan/10",
    rose: "text-dusk-rose border-dusk-rose/25 bg-dusk-rose/10"
  }[tone];

  return (
    <div className={cn("rounded-xl border", compact ? "px-3 py-2" : "px-3 py-2.5", toneClass)}>
      <p className={cn("uppercase opacity-75 font-semibold", compact ? "text-[9px] tracking-[0.16em]" : "text-[10px] tracking-[0.2em]")}>{label}</p>
      <p className={cn("font-bold leading-none font-mono", compact ? "mt-1 text-base" : "mt-1.5 text-lg")}>{value}</p>
    </div>
  );
}

function WorkspaceBoardCard({
  board,
  projectId,
  onEdit,
  onDelete,
  canManage = true
}: {
  board: ProjectBoardSummary;
  projectId: string;
  onEdit: (board: ProjectBoardSummary) => void;
  onDelete: (board: ProjectBoardSummary) => void;
  canManage?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  function toggleMenu(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8,
      left: Math.max(16, rect.right - 170)
    });
    setMenuOpen((prev) => !prev);
  }

  const progressPercent = board.totalCards > 0 ? Math.round((board.doneCards / board.totalCards) * 100) : 0;

  return (
    <div className="lofi-panel group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-md transition-all duration-300 hover:border-dusk-lavender/40 hover:bg-white/[0.045] hover:shadow-2xl hover:shadow-dusk-lavender/5">
      <div>
        {/* Top bar: Board icon + Title + Lock/Public badge + 3-dots */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender">
              <KanbanSquare className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-base font-bold text-stone-100 group-hover:text-dusk-lavender transition-colors">
                  {board.name}
                </h4>
                {board.isPrivate ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-2 py-0.5 text-[9px] font-semibold text-dusk-amber">
                    <Lock className="h-2.5 w-2.5" />
                    Private
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-stone-400">
                    Public
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-stone-400 font-mono">
                {board.columnCount} {board.columnCount === 1 ? "column" : "columns"} · {board.totalCards} {board.totalCards === 1 ? "task" : "tasks"}
              </p>
            </div>
          </div>

          {canManage ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={toggleMenu}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-stone-400 hover:border-dusk-lavender/40 hover:bg-white/[0.08] hover:text-stone-200 transition"
                aria-label="Board options"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
        </div>

        {/* Progress bar */}
        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 font-medium text-stone-300 text-[11px]">
              <TrendingUp className="h-3 w-3 text-dusk-cyan" />
              Task Progress
            </span>
            <span className="text-[10px] font-semibold text-dusk-cyan font-mono">
              {board.totalCards > 0 ? `${board.doneCards}/${board.totalCards} done (${progressPercent}%)` : "No tasks yet"}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-dusk-cyan to-dusk-lavender transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Columns Preview Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {board.columnsPreview && board.columnsPreview.length > 0 ? (
            board.columnsPreview.map((col) => (
              <span
                key={col.id}
                className="inline-flex items-center gap-1 rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[10px] text-stone-400"
              >
                <span className="truncate max-w-[100px]">{col.name}</span>
                <span className="font-mono text-[9px] text-stone-500 font-semibold">({col.cardCount})</span>
              </span>
            ))
          ) : (
            <span className="text-[11px] text-stone-500">3 default columns</span>
          )}
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="mt-5 pt-3 border-t border-white/10">
        <Link
          href={`/project/${projectId}/board?boardId=${board.id}`}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-dusk-lavender text-ink-950 font-bold text-xs shadow-[0_8px_20px_rgba(169,162,255,0.2)] transition hover:bg-dusk-amber hover:shadow-[0_8px_20px_rgba(229,189,114,0.25)]"
        >
          <span>Open Board</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {menuOpen && (
        <>
          <button
            aria-label="Close board options"
            className="fixed inset-0 z-[150] cursor-default"
            type="button"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="fixed z-[151] w-44 overflow-hidden rounded-xl border border-dusk-lavender/18 bg-[#080714]/95 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
            style={
              menuPosition
                ? { top: menuPosition.top, left: menuPosition.left }
                : { top: 16, right: 16 }
            }
          >
            <button
              type="button"
              className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-xs font-medium text-stone-200 transition hover:bg-dusk-lavender/12 hover:text-dusk-lavender"
              onClick={() => {
                setMenuOpen(false);
                onEdit(board);
              }}
            >
              <Settings className="h-3.5 w-3.5" /> Board settings
            </button>
            <button
              type="button"
              className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-xs font-medium text-dusk-rose transition hover:bg-dusk-rose/12"
              onClick={() => {
                setMenuOpen(false);
                onDelete(board);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete board
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function QuickCreateBoardBlueprintCard({
  projectName,
  onCreateClick
}: {
  projectName: string;
  onCreateClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onCreateClick}
      className="lofi-panel group flex min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.015] p-6 text-center transition-all duration-300 hover:border-dusk-lavender/50 hover:bg-white/[0.035] hover:shadow-xl hover:shadow-dusk-lavender/10"
    >
      <div className="relative mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender transition-transform duration-300 group-hover:scale-110 shadow-inner">
        <Plus className="h-6 w-6" />
      </div>
      <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-dusk-amber">
        <Sparkles className="h-3 w-3" /> New Pipeline
      </span>
      <h4 className="mt-2 text-base font-bold text-stone-100 group-hover:text-dusk-lavender transition-colors">
        + Create New Board
      </h4>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-stone-400">
        Add another board or workflow to {projectName}.
      </p>
      <div className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-stone-200 transition group-hover:border-dusk-lavender/40 group-hover:bg-dusk-lavender/20 group-hover:text-white">
        <Plus className="h-3.5 w-3.5" />
        <span>Create Board</span>
      </div>
    </button>
  );
}

function CreateBoardModal({
  projectId,
  projectName,
  onClose,
  onCreated
}: {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onCreated: (newBoard: ProjectBoardSummary) => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || isPending) return;
    setIsPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          isPrivate
        })
      });

      const data = await res.json();

      if (!res.ok || !data.board) {
        const msg = data.error ?? "Failed to create board.";
        setError(msg);
        toast({ message: msg, type: "error" });
        return;
      }

      const newBoardSummary: ProjectBoardSummary = {
        id: data.board.id,
        name: data.board.name,
        isPrivate: data.board.isPrivate,
        columnCount: 3,
        totalCards: 0,
        doneCards: 0,
        columnsPreview: [
          { id: "col-1", name: "Backlog", cardCount: 0 },
          { id: "col-2", name: "In Progress", cardCount: 0 },
          { id: "col-3", name: "Done", cardCount: 0 }
        ]
      };

      onCreated(newBoardSummary);
      onClose();
    } catch {
      setError("An unexpected error occurred.");
      toast({ message: "An unexpected error occurred.", type: "error" });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AppModal open onClose={onClose} labelledBy="create-board-title" contentClassName="max-w-md">
      <form className="lofi-panel w-full max-w-md rounded-2xl p-5" onSubmit={handleSubmit}>
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-dusk-amber font-semibold">
              {projectName}
            </p>
            <h2 id="create-board-title" className="mt-0.5 text-xl font-bold text-white">
              Create New Board
            </h2>
          </div>
          <button
            className="rounded-md p-1.5 text-stone-400 hover:bg-white/10 hover:text-stone-100"
            type="button"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block space-y-1.5 text-sm text-stone-300">
            <span>Board Name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing Pipeline, Sprint 12, Bugs..."
              maxLength={80}
              required
              autoFocus
            />
          </label>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs font-semibold text-stone-200">Board Privacy</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={cn(
                  "rounded-lg border p-2.5 text-left text-xs transition",
                  !isPrivate
                    ? "border-dusk-lavender bg-dusk-lavender/15 text-dusk-lavender font-semibold"
                    : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20"
                )}
              >
                <p className="font-bold flex items-center gap-1">Public</p>
                <p className="mt-1 text-[10px] opacity-75">All workspace members can access</p>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={cn(
                  "rounded-lg border p-2.5 text-left text-xs transition",
                  isPrivate
                    ? "border-dusk-amber bg-dusk-amber/15 text-dusk-amber font-semibold"
                    : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20"
                )}
              >
                <p className="font-bold flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Private
                </p>
                <p className="mt-1 text-[10px] opacity-75">Only you and invited members</p>
              </button>
            </div>
          </div>

          {error ? <p className="text-xs text-red-400">{error}</p> : null}
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-white/10 pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isPending || !name.trim()}>
            {isPending ? "Creating..." : "Create Board"}
          </Button>
        </div>
      </form>
    </AppModal>
  );
}



function QuickCreateBlueprintCard({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onCreateClick}
      className="lofi-panel group flex min-h-[420px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.015] p-6 text-center transition-all duration-300 hover:border-dusk-lavender/50 hover:bg-white/[0.035] hover:shadow-xl hover:shadow-dusk-lavender/10"
    >
      <div className="relative mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender transition-transform duration-300 group-hover:scale-110 shadow-inner">
        <Plus className="h-7 w-7" />
      </div>
      <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-dusk-amber">
        <Sparkles className="h-3 w-3" /> New Workspace
      </span>
      <h4 className="mt-2 text-base font-bold text-stone-100 group-hover:text-dusk-lavender transition-colors">
        Create another workspace
      </h4>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-stone-400">
        Add a dedicated space for sprints, clients, personal goals, or daily habit reflection.
      </p>
      <div className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-stone-200 transition group-hover:border-dusk-lavender/40 group-hover:bg-dusk-lavender/20 group-hover:text-white">
        <Plus className="h-3.5 w-3.5" />
        <span>Create Workspace</span>
      </div>
    </button>
  );
}

function ProjectCard({
  isStarred,
  project,
  onToggleStar,
  onUpdateProject,
  onDeleteProject,
}: {
  isStarred: boolean;
  project: ProjectDashboardItem;
  onToggleStar: () => void;
  onUpdateProject?: (updated: ProjectDashboardItem) => void;
  onDeleteProject?: (id: string) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const cards = project.board?.columns.flatMap((column) => column.cards) ?? [];
  const columnCount = project.board?.columns.length ?? 0;
  const isDiaryProject = project.type === "DIARY";
  const colorMeta = getCardColorMeta(project.themeColor);
  const doneCards = cards.filter((c) => c.status === "DONE").length;
  const totalCards = cards.length;
  const progressPercent = totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function toggleProjectMenu(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 8,
      left: Math.max(16, rect.right - 184)
    });
    setMenuOpen((value) => !value);
  }

  return (
    <>
      <EntityCard
        tone={project.themeColor}
        title={<span className="sr-only">{project.name}</span>}
        className={cn("lofi-panel group flex min-h-[420px] flex-col p-0 hover:shadow-2xl hover:shadow-dusk-lavender/10 border border-white/10 hover:border-dusk-lavender/40 transition-all duration-300", colorMeta.softClass)}
      >
        <div className="relative h-44 sm:h-48 overflow-hidden border-b border-white/10">
          {project.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.coverImage} alt="cover" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_22%_20%,rgba(229,189,114,0.22),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(213,154,179,0.22),transparent_32%),linear-gradient(135deg,rgba(35,31,68,0.86),rgba(63,46,86,0.78)_48%,rgba(11,13,31,0.94))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-transparent" />

          {/* Top Left: Type badge */}
          <div className="absolute left-3.5 top-3 z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink-950/65 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-dusk-amber backdrop-blur-md">
              {isDiaryProject ? <BookOpenCheck className="h-3 w-3" /> : <KanbanSquare className="h-3 w-3" />}
              {isDiaryProject ? "Diary Studio" : "Work Studio"}
            </div>
          </div>

          {/* Top Right: Star toggle & 3-dots Menu */}
          <div className="absolute right-3.5 top-3 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleStar}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-xl border bg-ink-950/60 text-stone-200 backdrop-blur-md transition hover:border-dusk-amber/55 hover:bg-ink-950/80 hover:text-dusk-amber",
                isStarred && "border-dusk-amber/55 bg-dusk-amber/15 text-dusk-amber"
              )}
              aria-label={isStarred ? "Unstar project" : "Star project"}
              aria-pressed={isStarred}
            >
              <Star className={cn("h-3.5 w-3.5", isStarred && "fill-dusk-amber")} />
            </button>

            <button
              type="button"
              onClick={toggleProjectMenu}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-xl border backdrop-blur-md transition",
                menuOpen
                  ? "border-dusk-amber/55 bg-ink-950/90 text-dusk-amber shadow-[0_10px_26px_rgba(0,0,0,0.35)]"
                  : "border-white/15 bg-ink-950/60 text-stone-200 hover:border-dusk-lavender/55 hover:bg-ink-950/80 hover:text-dusk-lavender"
              )}
              aria-label="Project options"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Bottom Right Sticker Stamp */}
          {project.sticker ? (
            <div className="absolute bottom-3 right-4 z-10 transition duration-300 group-hover:scale-110 group-hover:rotate-6 drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)] pointer-events-none">
              <RetroStickerImage alt={project.name} size={44} src={project.sticker} />
            </div>
          ) : null}

          {/* Bottom Left Title */}
          <div className="absolute bottom-3 left-4 right-16">
            <h3 className="truncate text-xl font-bold tracking-tight text-white drop-shadow-md group-hover:text-dusk-lavender transition-colors">
              {project.name}
            </h3>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <p className="line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-stone-400">
            {project.description ?? "A quiet project workspace for tasks, notes, due dates, and rewards."}
          </p>

          {/* Task Pipeline / Progress Bar */}
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.025] p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-stone-300 text-[11px]">
                <TrendingUp className="h-3 w-3 text-dusk-cyan" />
                Tasks Progress
              </span>
              <span className="text-[10px] font-semibold text-dusk-cyan font-mono">
                {totalCards > 0 ? `${doneCards}/${totalCards} done (${progressPercent}%)` : `${columnCount} columns ready`}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-dusk-cyan to-dusk-lavender transition-all duration-500"
                style={{ width: `${totalCards > 0 ? progressPercent : 0}%` }}
              />
            </div>
          </div>

          {/* Stat Pills Grid */}
          <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
            <div className="rounded-lg border border-white/5 bg-white/[0.03] py-1.5 px-1">
              <p className="text-xs font-bold text-stone-200 font-mono">{project.counts.boards}</p>
              <p className="text-[9px] uppercase tracking-wider text-stone-400">Boards</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.03] py-1.5 px-1">
              <p className="text-xs font-bold text-stone-200 font-mono">{project.counts.members}</p>
              <p className="text-[9px] uppercase tracking-wider text-stone-400">Members</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.03] py-1.5 px-1">
              <p className="text-xs font-bold text-stone-200 font-mono">{project.counts.notes}</p>
              <p className="text-[9px] uppercase tracking-wider text-stone-400">Notes</p>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.03] py-1.5 px-1">
              <p className="text-xs font-bold text-stone-200 font-mono">{cards.length}</p>
              <p className="text-[9px] uppercase tracking-wider text-stone-400">Cards</p>
            </div>
          </div>

          {/* Quick-Launch Action Hub */}
          <div className="mt-auto pt-4 border-t border-white/10 flex items-center gap-2">
            <Link
              href={`/project/${project.id}/${isDiaryProject ? "diary" : "board"}`}
              className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-dusk-lavender px-3 text-xs font-bold text-ink-950 shadow-[0_8px_20px_rgba(169,162,255,0.2)] transition hover:bg-dusk-amber hover:shadow-[0_8px_20px_rgba(229,189,114,0.25)]"
            >
              <span>{isDiaryProject ? "Open Diary" : "Launch Board"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href={`/project/${project.id}/calendar`}
              title="Calendar View"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-stone-300 transition hover:border-dusk-cyan/50 hover:bg-dusk-cyan/10 hover:text-dusk-cyan"
            >
              <CalendarDays className="h-4 w-4" />
            </Link>

            <Link
              href={`/project/${project.id}/notes`}
              title="Project Notes"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-stone-300 transition hover:border-dusk-rose/50 hover:bg-dusk-rose/10 hover:text-dusk-rose"
            >
              <FileText className="h-4 w-4" />
            </Link>

            <Link
              href={`/project/${project.id}/rewards`}
              title="Rewards Store"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-stone-300 transition hover:border-dusk-amber/50 hover:bg-dusk-amber/10 hover:text-dusk-amber"
            >
              <Gift className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </EntityCard>

      {menuOpen && (
        <>
          <button
            aria-label="Close project options"
            className="fixed inset-0 z-[150] cursor-default"
            type="button"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="fixed z-[151] w-44 overflow-hidden rounded-xl border border-dusk-lavender/18 bg-[#080714]/95 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
            style={(menuPosition
              ? { top: menuPosition.top, left: menuPosition.left }
              : { top: 16, right: 16 }) as CSSProperties}
          >
            <button
              type="button"
              className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-stone-200 transition hover:bg-dusk-lavender/12 hover:text-dusk-lavender"
              onClick={() => { setMenuOpen(false); setEditOpen(true); }}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit project
            </button>
            <button
              type="button"
              className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-dusk-rose transition hover:bg-dusk-rose/12"
              onClick={() => { setMenuOpen(false); setDeleteOpen(true); }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete project
            </button>
          </div>
        </>
      )}

      {/* Edit modal */}
      {editOpen && (
        <EditProjectModal
          project={project}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setEditOpen(false);
            if (updated && onUpdateProject) {
              onUpdateProject(updated);
            }
            router.refresh();
          }}
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
            if (onDeleteProject) {
              onDeleteProject(project.id);
            }
            toast({ message: "Project deleted.", type: "success" });
            router.refresh();
          } else {
            const data = await res.json().catch(() => ({}));
            toast({ message: data.error ?? "Could not delete project.", type: "error" });
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
  onSaved: (updated?: ProjectDashboardItem) => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [coverPreview, setCoverPreview] = useState<string | null>(project.coverImage ?? null);
  const [themeColor, setThemeColor] = useState<CardColor>(normalizeCardColor(project.themeColor));
  const [sticker, setSticker] = useState(project.sticker || DEFAULT_PROJECT_STICKER);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isDirty =
    name !== project.name ||
    description !== (project.description ?? "") ||
    coverPreview !== (project.coverImage ?? null) ||
    themeColor !== normalizeCardColor(project.themeColor) ||
    sticker !== (project.sticker || DEFAULT_PROJECT_STICKER);

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
    if (!res.ok) {
      setError(data.error ?? "Cover upload failed.");
      toast({ message: data.error ?? "Cover upload failed.", type: "error" });
    } else {
      if (data.coverImage) setCoverPreview(data.coverImage);
      toast({ message: "Cover image updated.", type: "success" });
    }
  }

  function handleSaveIntent(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setConfirmSaveOpen(true);
  }

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    setConfirmSaveOpen(false);
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        coverImage: coverPreview,
        themeColor,
        sticker
      }),
    });
    setIsSaving(false);
    if (!res.ok) {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "Could not save.");
      toast({ message: d.error ?? "Could not save project settings.", type: "error" });
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { project?: Partial<ProjectDashboardItem> };
    toast({ message: "Project settings updated.", type: "success" });
    const updatedProject: ProjectDashboardItem = {
      ...project,
      name: name.trim(),
      description: description.trim() || null,
      coverImage: coverPreview,
      themeColor,
      sticker,
      ...(data.project ?? {})
    };
    onSaved(updatedProject);
  }

  return (
    <>
      <AppModal
        open
        onClose={onClose}
        labelledBy="project-settings-title"
        contentClassName="max-w-5xl"
        hasUnsavedChanges={isDirty}
      >
        <form className="lofi-panel flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl" onSubmit={handleSaveIntent}>
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Project settings</p>
              <h2 id="project-settings-title" className="mt-1 text-2xl font-semibold">Edit project</h2>
            </div>
            <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {error ? (
              <p className="mb-4 rounded-xl border border-dusk-rose/25 bg-dusk-rose/10 px-4 py-2.5 text-sm text-dusk-rose">
                {error}
              </p>
            ) : null}

            <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <label className="block space-y-1.5 text-sm text-stone-300">
                  <span>Project name</span>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Design system, Marketing plan..."
                    maxLength={80}
                    required
                  />
                </label>

                <label className="block space-y-1.5 text-sm text-stone-300">
                  <span>Description</span>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional context for your team..."
                    rows={4}
                    maxLength={500}
                  />
                </label>
                <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Project media</p>
                <h3 className="mt-1 text-xl font-semibold text-stone-100">Cover image</h3>
                <p className="mt-1 text-sm leading-6 text-stone-500">Use the same cover style that appears on the project card.</p>
              </div>

              <button
                className="group relative mt-5 block aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-ink-950/45 text-left"
                title="Upload project cover"
                type="button"
                onClick={() => coverInputRef.current?.click()}
              >
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview} alt="Project cover" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_20%_15%,rgba(249,199,132,0.18),transparent_32%),linear-gradient(135deg,rgba(169,162,255,0.2),rgba(103,232,249,0.1),rgba(244,114,182,0.1))]" />
                )}
                <div className="absolute inset-0 grid place-items-center bg-ink-950/45 opacity-0 transition group-hover:opacity-100">
                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950/70 px-3 py-2 text-sm font-medium text-white">
                    {isUploadingCover ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {coverPreview ? "Change cover" : "Upload cover"}
                  </span>
                </div>
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleCoverUpload(f); }}
              />
              <p className="mt-2 flex items-center gap-2 text-xs text-stone-600">
                <ImageIcon className="h-3.5 w-3.5" />
                JPG, PNG, WebP, or GIF. Max 5 MB.
              </p>

              <div className="mt-5 rounded-xl border border-white/10 bg-ink-950/25 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Quick summary</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <ProjectStatusMetric label="Boards" value={project.counts.boards} tone="amber" compact />
                  <ProjectStatusMetric label="Notes" value={project.counts.notes} tone="rose" compact />
                  <ProjectStatusMetric label="Cards" value={project.board?.columns.reduce((sum, column) => sum + column.cards.length, 0) ?? 0} compact />
                </div>
              </div>

              <div className="mt-5">
                <ProjectAppearanceControls
                  color={themeColor}
                  sticker={sticker}
                  onColorChange={setThemeColor}
                  onStickerChange={setSticker}
                />
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button disabled={isSaving || !name.trim()}>{isSaving ? "Saving..." : "Save changes"}</Button>
          </div>
        </form>
      </AppModal>

      <ConfirmModal
        open={confirmSaveOpen}
        title="Save changes"
        message={`Save changes to "${name.trim() || project.name}"?`}
        confirmLabel="Save"
        isLoading={isSaving}
        variant="default"
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={handleSave}
      />
    </>
  );
}

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated?: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);
  const [projectType, setProjectType] = useState<"WORK" | "DIARY">("WORK");
  const [themeColor, setThemeColor] = useState<CardColor>("DEFAULT");
  const [sticker, setSticker] = useState(DEFAULT_PROJECT_STICKER);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPendingRef.current || isPending) return;
    isPendingRef.current = true;
    setError(null);
    setIsPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          type: projectType,
          themeColor,
          sticker
        })
      });
      const data = (await response.json()) as { project?: { id: string }; error?: string };

      if (!response.ok || !data.project) {
        const msg = data.error ?? "Could not create project.";
        setError(msg);
        toast({ message: msg, type: "error" });
        return;
      }

      toast({ message: "Project created.", type: "success" });
      onCreated?.();
      onClose();
      router.push(`/project/${data.project.id}/${projectType === "DIARY" ? "diary" : "board"}`);
      router.refresh();
    } finally {
      isPendingRef.current = false;
      setIsPending(false);
    }
  }

  return (
    <AppModal
      open
      onClose={onClose}
      labelledBy="create-project-title"
      contentClassName="max-w-lg"
    >
      <form className="lofi-panel w-full max-w-lg rounded-lg p-5" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Workspace</p>
            <h2 id="create-project-title" className="mt-1 text-2xl font-semibold">New Project</h2>
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
          <ProjectAppearanceControls
            color={themeColor}
            sticker={sticker}
            onColorChange={setThemeColor}
            onStickerChange={setSticker}
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isPending}>{isPending ? "Creating..." : "Create Project"}</Button>
        </div>
      </form>
    </AppModal>
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

function getDiaryHighlightStatus(item: {
  checklistSummary: { dueCount: number; completedCount: number };
  dueTime: string | null;
  dueDate: string;
}) {
  if (item.checklistSummary.dueCount === 0) {
    return "default";
  }
  const isCompleted = item.checklistSummary.completedCount === item.checklistSummary.dueCount;
  if (isCompleted) {
    return "completed";
  }

  if (item.dueTime) {
    const now = new Date();
    const dateParts = item.dueDate.split("-").map(Number); // [YYYY, MM, DD]
    const [hours, minutes] = item.dueTime.split(":").map(Number);
    const dueDateTime = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hours, minutes);

    if (now > dueDateTime) {
      return "warn-red";
    }

    const diffMs = dueDateTime.getTime() - now.getTime();
    if (diffMs > 0 && diffMs <= 60 * 60 * 1000) {
      return "warn-red";
    }
  }

  return "default";
}
