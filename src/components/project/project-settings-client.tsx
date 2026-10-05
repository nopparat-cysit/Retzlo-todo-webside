"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckSquare,
  ChevronRight,
  ExternalLink,
  FolderKanban,
  Layers,
  Palette,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Volume2
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { BoardAttributesTab } from "@/components/kanban/board-attributes-tab";
import { BoardGeneralTab } from "@/components/kanban/board-settings/general-tab";
import { BoardColumnsTab } from "@/components/kanban/board-settings/columns-tab";
import { BoardDangerTab } from "@/components/kanban/board-settings/danger-tab";
import type { BoardColumnInfo } from "@/components/kanban/board-settings/types";
import { DEFAULT_PRIORITIES, resolveBoardPriorities } from "@/lib/kanban/priority";
import type { CustomPriority } from "@/types/kanban";
import { ProjectBoardsManager } from "@/components/project/project-boards-manager";
import { SettingsForm } from "@/components/project/settings-form";
import { SoundToggle } from "@/components/project/sound-toggle";
import { cn } from "@/lib/utils";

export type SettingsTabId =
  | "identity"
  | "access"
  | "boards"
  | "board-general"
  | "board-columns"
  | "attributes"
  | "features"
  | "preferences"
  | "all";

const VALID_TABS: readonly SettingsTabId[] = [
  "identity",
  "access",
  "boards",
  "board-general",
  "board-columns",
  "attributes",
  "features",
  "preferences",
  "all"
] as const;

interface TabItem {
  id: SettingsTabId;
  group: string;
  label: string;
  shortLabel: string;
  icon: typeof FolderKanban;
  badge?: string | number;
  description: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: TabItem[];
}

interface ProjectSettingsClientProps {
  projectId: string;
  project: {
    id: string;
    name: string;
    description: string | null;
    coverImage: string | null;
    themeColor: string | null;
    sticker: string | null;
    allowMemberPrivateItems: boolean;
    notesEnabled: boolean;
    members: { role: string }[];
  };
  formattedBoards: Array<{
    id: string;
    name: string;
    projectId: string;
    isPrivate: boolean;
    createdAt: string;
    memberUserIds: string[];
    members: Array<{
      userId: string;
      user: {
        id: string;
        name: string | null;
        email: string;
        avatar: string | null;
      };
    }>;
    cardCount: number;
  }>;
  projectMembers: Array<{
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      avatar: string | null;
    };
  }>;
  canManage: boolean;
  initialTab?: string;
  themeToggleSlot?: ReactNode;
}

export function ProjectSettingsClient({
  projectId,
  project,
  formattedBoards,
  projectMembers,
  canManage,
  initialTab,
  themeToggleSlot
}: ProjectSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(() => {
    if (initialTab && VALID_TABS.includes(initialTab as SettingsTabId)) {
      return initialTab as SettingsTabId;
    }
    return "identity";
  });

  const { toast } = useToast();
  const [boardsList, setBoardsList] = useState(formattedBoards);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    () => formattedBoards[0]?.id || ""
  );
  const [attributeSubTab, setAttributeSubTab] = useState<"status" | "priority" | "story-points">("status");
  const [boardPriorities, setBoardPriorities] = useState<CustomPriority[]>(DEFAULT_PRIORITIES);

  const activeBoard = boardsList.find((b) => b.id === selectedBoardId) || boardsList[0];
  const [boardName, setBoardName] = useState(activeBoard?.name || "");
  const [boardIsPrivate, setBoardIsPrivate] = useState(Boolean(activeBoard?.isPrivate));
  const [boardMemberUserIds, setBoardMemberUserIds] = useState<string[]>(
    activeBoard?.memberUserIds || []
  );
  const [boardColumns, setBoardColumns] = useState<BoardColumnInfo[]>([]);
  const [boardMemberSearchQuery, setBoardMemberSearchQuery] = useState("");
  const [isSavingBoard, setIsSavingBoard] = useState(false);
  const [isDeletingBoard, setIsDeletingBoard] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const subTabParam = params.get("subTab");
      const boardIdParam = params.get("boardId");

      if (tabParam === "board") {
        setActiveTab("board-general");
      } else if (tabParam === "columns") {
        setActiveTab("board-columns");
      } else if (tabParam && VALID_TABS.includes(tabParam as SettingsTabId)) {
        setActiveTab(tabParam as SettingsTabId);
      } else if (boardIdParam) {
        setActiveTab("board-general");
      }

      if (subTabParam && ["status", "priority", "story-points"].includes(subTabParam)) {
        setAttributeSubTab(subTabParam as "status" | "priority" | "story-points");
      }

      if (boardIdParam && boardsList.some((b) => b.id === boardIdParam)) {
        setSelectedBoardId(boardIdParam);
      }
    }
  }, [boardsList]);

  // Sync board details, priorities, and columns when selectedBoardId changes
  useEffect(() => {
    if (!selectedBoardId) return;
    let isMounted = true;
    const current = boardsList.find((b) => b.id === selectedBoardId);
    if (current) {
      setBoardName(current.name);
      setBoardIsPrivate(Boolean(current.isPrivate));
      setBoardMemberUserIds(current.memberUserIds || []);
    }
    fetch(`/api/boards/${selectedBoardId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.board) return;
        setBoardName(data.board.name);
        setBoardIsPrivate(Boolean(data.board.isPrivate));
        setBoardMemberUserIds(data.board.members?.map((m: any) => m.userId) || []);
        if (data.board.customPriorities) {
          setBoardPriorities(resolveBoardPriorities(data.board.customPriorities));
        }
        if (data.board.columns) {
          setBoardColumns(
            data.board.columns.map((c: any) => ({
              id: c.id,
              name: c.name,
              color: c.color,
              wipLimit: c.wipLimit,
              defaultCardStatus: c.defaultCardStatus,
              cardCount: c._count?.cards ?? c.cards?.length ?? 0
            }))
          );
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [selectedBoardId, boardsList]);

  const handlePrioritiesChange = async (nextPriorities: CustomPriority[]) => {
    setBoardPriorities(nextPriorities);
    if (!selectedBoardId) return;
    try {
      await fetch(`/api/boards/${selectedBoardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPriorities: nextPriorities })
      });
      window.dispatchEvent(
        new CustomEvent("board-priorities-updated", {
          detail: { boardId: selectedBoardId, priorities: nextPriorities }
        })
      );
    } catch {
      // handled
    }
  };

  const handleSaveBoardGeneral = async () => {
    if (!selectedBoardId || !boardName.trim() || isSavingBoard) return;
    setIsSavingBoard(true);
    try {
      const res = await fetch(`/api/boards/${selectedBoardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: boardName.trim(),
          isPrivate: boardIsPrivate,
          memberUserIds: boardIsPrivate ? boardMemberUserIds : []
        })
      });
      const data = await res.json();
      if (!res.ok || !data.board) throw new Error(data.error || "Failed to update board");
      setBoardsList((prev) =>
        prev.map((b) =>
          b.id === selectedBoardId
            ? {
                ...b,
                name: data.board.name,
                isPrivate: data.board.isPrivate,
                memberUserIds: data.board.memberUserIds ?? (boardIsPrivate ? boardMemberUserIds : [])
              }
            : b
        )
      );
      toast({ message: `บันทึกการตั้งค่าบอร์ด "${data.board.name}" สำเร็จ ✦`, type: "success" });
      window.dispatchEvent(
        new CustomEvent("board-renamed", {
          detail: { id: selectedBoardId, name: data.board.name }
        })
      );
    } catch (err) {
      toast({ message: err instanceof Error ? err.message : "Failed to update board", type: "error" });
    } finally {
      setIsSavingBoard(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!selectedBoardId || isDeletingBoard) return;
    setIsDeletingBoard(true);
    try {
      const res = await fetch(`/api/boards/${selectedBoardId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete board");
      }
      toast({ message: `ลบบอร์ดเรียบร้อยแล้ว`, type: "success" });
      setDeleteConfirmOpen(false);
      const remaining = boardsList.filter((b) => b.id !== selectedBoardId);
      setBoardsList(remaining);
      if (remaining.length > 0) {
        setSelectedBoardId(remaining[0].id);
      }
      handleTabChange("boards");
    } catch (err) {
      toast({ message: err instanceof Error ? err.message : "Failed to delete board", type: "error" });
    } finally {
      setIsDeletingBoard(false);
    }
  };

  const handleOpenBoardConfig = (boardId: string, subTab?: "general" | "columns" | "attributes") => {
    setSelectedBoardId(boardId);
    const targetTab: SettingsTabId =
      subTab === "columns"
        ? "board-columns"
        : subTab === "attributes"
        ? "attributes"
        : "board-general";
    handleTabChange(targetTab);
  };

  const handleTabChange = (tabId: SettingsTabId) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      window.history.replaceState(null, "", url.toString());
    }
  };

  const filteredBoardMembers = useMemo(() => {
    if (!boardMemberSearchQuery.trim()) return projectMembers;
    const q = boardMemberSearchQuery.toLowerCase();
    return projectMembers.filter(
      (m) =>
        m.user.name?.toLowerCase().includes(q) ||
        m.user.email.toLowerCase().includes(q)
    );
  }, [projectMembers, boardMemberSearchQuery]);

  const navGroups: NavGroup[] = [
    {
      id: "general",
      title: "General",
      items: [
        {
          id: "identity",
          group: "General",
          label: "Details & Identity",
          shortLabel: "Details",
          icon: Sparkles,
          description: "ชื่อ รายละเอียด ภาพปก และภาพลักษณ์ของพื้นที่ทำงาน"
        },
        {
          id: "access",
          group: "General",
          label: "Access & Team",
          shortLabel: "Access",
          icon: Users,
          badge: projectMembers.length,
          description: "สิทธิ์การเข้าถึง รายชื่อสมาชิก และการจัดการคำเชิญในโปรเจกต์"
        }
      ]
    },
    {
      id: "workflow",
      title: "Workflow",
      items: [
        {
          id: "boards",
          group: "Workflow",
          label: "Boards & Sub-projects",
          shortLabel: "Boards",
          icon: FolderKanban,
          badge: boardsList.length,
          description: "จัดการบอร์ดทั้งหมดในโปรเจกต์ สร้างบอร์ดใหม่ และกำหนดสิทธิ์รายบอร์ด"
        },
        {
          id: "board-general",
          group: "Workflow",
          label: "Board Details & Access",
          shortLabel: "Board Details",
          icon: Settings,
          description: "ตั้งค่าชื่อบอร์ด ความเป็นส่วนตัว สิทธิ์การเข้าถึง และลบบอร์ด"
        },
        {
          id: "board-columns",
          group: "Workflow",
          label: "Columns & Workflow",
          shortLabel: "Columns",
          icon: Layers,
          description: "ขั้นตอนการทำงาน (Workflow Stages), WIP Limits และการแมปสถานะ"
        },
        {
          id: "attributes",
          group: "Workflow",
          label: "Card Attributes & Types",
          shortLabel: "Attributes",
          icon: CheckSquare,
          description: "โครงสร้างสถานะ (Statuses), ระดับความสำคัญ (Priorities) และ Story Points"
        }
      ]
    },
    {
      id: "system",
      title: "System & Privacy",
      items: [
        {
          id: "features",
          group: "System & Privacy",
          label: "Features & Privacy",
          shortLabel: "Features",
          icon: ShieldCheck,
          description: "เปิด/ปิดแถบบันทึก โหมดไอเทมส่วนตัว และโซนอันตราย (ลบโปรเจกต์)"
        },
        {
          id: "preferences",
          group: "System & Privacy",
          label: "Preferences & Theme",
          shortLabel: "Preferences",
          icon: Palette,
          description: "ปรับแต่งธีมการแสดงผลและระบบเสียงเฉพาะเครื่องของคุณ"
        }
      ]
    },
    {
      id: "overview",
      title: "Overview",
      items: [
        {
          id: "all",
          group: "Overview",
          label: "All Settings",
          shortLabel: "All",
          icon: Layers,
          description: "ดูภาพรวมและจัดการการตั้งค่าทุกส่วนพร้อมกันในหน้าเดียว"
        }
      ]
    }
  ];

  const allTabs = navGroups.flatMap((g) => g.items);
  const currentTabInfo = allTabs.find((t) => t.id === activeTab) ?? allTabs[0];

  return (
    <div className="scrollbar-soft h-full min-h-0 overflow-y-auto px-1 sm:px-2">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-12 pt-2">
        {/* Mobile Header (< lg) */}
        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Link
              href={`/project/${projectId}/board`}
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to board</span>
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100/80 px-2.5 py-0.5 text-[11px] font-medium text-stone-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {formattedBoards.length} boards · {projectMembers.length} members
            </span>
          </div>

          {/* Mobile Horizontal Tabs */}
          <div className="flex overflow-x-auto gap-2 border-b border-stone-200 pb-2 dark:border-white/10 scrollbar-none">
            {allTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer",
                    isActive
                      ? "bg-indigo-600 text-white dark:bg-dusk-lavender/25 dark:text-dusk-lavender border border-indigo-600 dark:border-dusk-lavender/40 font-semibold shadow-xs"
                      : "bg-stone-100 text-stone-600 border border-stone-200 hover:text-stone-900 dark:bg-white/[0.03] dark:text-stone-400 dark:border-white/5 dark:hover:text-stone-200"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.shortLabel}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                        isActive
                          ? "bg-white/20 text-white dark:bg-dusk-lavender dark:text-stone-950"
                          : "bg-stone-200 text-stone-700 dark:bg-white/10 dark:text-stone-300"
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Master-Detail Layout on Desktop (lg+) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Sidebar (Sticky on Desktop) */}
          <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-2 space-y-4">
            {/* Back to Board link */}
            <Link
              href={`/project/${projectId}/board`}
              className="group inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors px-1"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-stone-500 group-hover:text-stone-800 dark:group-hover:text-stone-100" />
              <span>Back to board</span>
            </Link>

            {/* Space Identity Card */}
            <div className="lofi-panel rounded-2xl p-4 border border-stone-200 bg-stone-50/90 dark:border-white/10 dark:bg-white/[0.03] space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-stone-300 bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-amber-500/10 flex items-center justify-center font-bold text-base text-indigo-700 dark:border-white/15 dark:text-indigo-300 shadow-xs">
                  {project.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={project.coverImage}
                      alt={project.name}
                      className="h-full w-full object-cover"
                    />
                  ) : project.sticker ? (
                    <span className="text-xl">{project.sticker}</span>
                  ) : (
                    <span>{project.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-dusk-amber">
                      Project Space
                    </span>
                  </div>
                  <h2
                    className="truncate text-sm font-bold text-stone-900 dark:text-stone-100"
                    title={project.name}
                  >
                    {project.name}
                  </h2>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {formattedBoards.length} boards · {projectMembers.length} members
                  </p>
                </div>
              </div>
            </div>

            {/* Jira-style Grouped Navigation Panel */}
            <nav className="lofi-panel rounded-2xl p-3 border border-stone-200 bg-stone-50/90 dark:border-white/10 dark:bg-white/[0.02] space-y-4">
              {navGroups.map((group) => (
                <div key={group.id} className="space-y-1">
                  <div className="px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                    {group.title}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleTabChange(tab.id)}
                          className={cn(
                            "relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition cursor-pointer text-left",
                            isActive
                              ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-xs dark:bg-dusk-lavender/15 dark:text-dusk-lavender dark:border-dusk-lavender/40 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-md before:bg-indigo-600 dark:before:bg-dusk-lavender"
                              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-transparent dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-white/[0.04]"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isActive
                                  ? "text-indigo-600 dark:text-dusk-lavender"
                                  : "text-stone-400 dark:text-stone-500"
                              )}
                            />
                            <span className="truncate">{tab.label}</span>
                          </div>
                          {tab.badge !== undefined && (
                            <span
                              className={cn(
                                "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold shrink-0",
                                isActive
                                  ? "bg-indigo-200/80 text-indigo-800 dark:bg-dusk-lavender dark:text-stone-950"
                                  : "bg-stone-200 text-stone-700 dark:bg-white/10 dark:text-stone-300"
                              )}
                            >
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Right Detail Pane */}
          <main className="flex-1 min-w-0 space-y-5 w-full">
            {/* Active Section Header Banner */}
            <section className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-dusk-amber">
                    <span>{currentTabInfo.group}</span>
                    <ChevronRight className="h-3 w-3 text-stone-400 dark:text-stone-500" />
                    <span className="text-stone-700 dark:text-stone-300">
                      {currentTabInfo.shortLabel}
                    </span>
                  </div>
                  <h1 className="mt-1 text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
                    <currentTabInfo.icon className="h-5 w-5 text-indigo-600 dark:text-dusk-lavender" />
                    <span>{currentTabInfo.label}</span>
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                    {currentTabInfo.description}
                  </p>
                </div>
              </div>
            </section>

            {/* TAB: Identity (Details & Identity) */}
            {(activeTab === "identity" || activeTab === "all") && (
              <div className="space-y-4">
                {activeTab === "all" && (
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2 pt-2 dark:border-white/10">
                    <Sparkles className="h-4 w-4 text-amber-600 dark:text-dusk-amber" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      1. ข้อมูลและภาพลักษณ์โปรเจกต์ (Details & Identity)
                    </h2>
                  </div>
                )}
                <SettingsForm
                  project={project}
                  canManagePrivacy={canManage}
                  viewMode="identity"
                />
              </div>
            )}

            {/* TAB: Access (Access & Team) */}
            {(activeTab === "access" || activeTab === "all") && (
              <div className="space-y-4">
                {activeTab === "all" && (
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2 pt-4 dark:border-white/10">
                    <Users className="h-4 w-4 text-cyan-600 dark:text-dusk-cyan" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      2. สมาชิกและสิทธิ์เข้าถึง (Access & Team)
                    </h2>
                  </div>
                )}

                <section className="lofi-panel rounded-2xl p-5 sm:p-6 border border-stone-200 bg-white dark:border-white/10 dark:bg-white/[0.02] space-y-6">
                  {/* Access Header & CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5 dark:border-white/10">
                    <div>
                      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span>Space Members</span>
                        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
                          {projectMembers.length} คน
                        </span>
                      </h3>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        สมาชิกทุกคนในโปรเจกต์สามารถเข้าถึงและร่วมทำงานในกระดานสาธารณะได้
                      </p>
                    </div>

                    <Link href={`/project/${projectId}/members`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto inline-flex items-center gap-2"
                      >
                        <span>จัดการสมาชิกและคำเชิญ</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>

                  {/* Members Preview Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {projectMembers.map((member) => {
                      const isOwner = member.role.toUpperCase() === "OWNER";
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-3 dark:border-white/5 dark:bg-white/[0.02]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar user={member.user} size={36} />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-stone-900 dark:text-stone-100">
                                {member.user.name || member.user.email.split("@")[0]}
                              </p>
                              <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">
                                {member.user.email}
                              </p>
                            </div>
                          </div>

                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0",
                              isOwner
                                ? "border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300"
                                : "border border-stone-200 bg-stone-100 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-300"
                            )}
                          >
                            <Shield className="h-3 w-3" />
                            {isOwner ? "Owner" : "Member"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Policy Summary Callout */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 text-xs text-stone-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-stone-400 space-y-1.5">
                    <p className="font-semibold text-stone-900 dark:text-stone-200">
                      นโยบายการเข้าถึง (Access Policy):
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                      <li>
                        <strong>Owner:</strong> สามารถจัดการชื่อและภาพปกโปรเจกต์
                        กำหนดการตั้งค่าความเป็นส่วนตัว เชิญหรือถอนสมาชิก และลบโปรเจกต์ได้
                      </li>
                      <li>
                        <strong>Member:</strong> สามารถร่วมสร้างการ์ด จัดการงาน บันทึกโน้ต
                        และสร้างบอร์ดส่วนตัว (หากเปิดใช้งาน)
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
            )}

            {/* TAB: Boards (Boards & Sub-projects) */}
            {(activeTab === "boards" || activeTab === "all") && (
              <div className="space-y-4">
                {activeTab === "all" && (
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2 pt-4 dark:border-white/10">
                    <FolderKanban className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      3. บอร์ดและโปรเจกต์ย่อย (Boards & Sub-projects)
                    </h2>
                  </div>
                )}
                <ProjectBoardsManager
                  projectId={projectId}
                  canManage={canManage}
                  initialBoards={boardsList}
                  projectMembers={projectMembers}
                  onConfigureBoard={handleOpenBoardConfig}
                />
              </div>
            )}

            {/* TAB: Board General & Access */}
            {(activeTab === "board-general" || activeTab === "all") && (
              <div className="space-y-4">
                {activeTab === "all" && (
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2 pt-4 dark:border-white/10">
                    <Settings className="h-4 w-4 text-amber-600 dark:text-dusk-amber" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      4. ข้อมูลบอร์ดและสิทธิ์เข้าถึง (Board Details & Access)
                    </h2>
                  </div>
                )}

                {/* Active Board Selector Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-dusk-amber">
                          Active Board
                        </span>
                        {boardIsPrivate ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-2 py-0.2 text-[9px] font-semibold text-dusk-amber">
                            Private
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-2 py-0.2 text-[9px] font-medium text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                            Public
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {boardName || activeBoard?.name || "Select Board"}
                      </h2>
                    </div>
                  </div>

                  {boardsList.length > 1 && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">เลือกบอร์ด:</span>
                      <select
                        value={selectedBoardId}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          setSelectedBoardId(nextId);
                          if (typeof window !== "undefined") {
                            const url = new URL(window.location.href);
                            url.searchParams.set("boardId", nextId);
                            window.history.replaceState(null, "", url.toString());
                          }
                        }}
                        className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 shadow-xs dark:border-white/10 dark:bg-stone-900 dark:text-stone-200 cursor-pointer"
                      >
                        {boardsList.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} {b.isPrivate ? "🔒 (Private)" : "🌐 (Public)"}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {selectedBoardId ? (
                  <div className="space-y-4">
                    <section className="lofi-panel rounded-2xl p-5 border border-stone-200 bg-white dark:border-white/10 dark:bg-white/[0.02] space-y-4">
                      <BoardGeneralTab
                        name={boardName}
                        onNameChange={setBoardName}
                        isPrivate={boardIsPrivate}
                        onPrivacyChange={setBoardIsPrivate}
                        canManage={canManage}
                        selectedMemberCount={boardMemberUserIds.length}
                        totalProjectMembersCount={projectMembers.length}
                        projectMembers={projectMembers.map((m) => ({
                          id: m.userId,
                          userId: m.userId,
                          role: m.role,
                          name: m.user.name,
                          email: m.user.email,
                          avatar: m.user.avatar
                        }))}
                        filteredMembers={filteredBoardMembers.map((m) => ({
                          id: m.userId,
                          userId: m.userId,
                          role: m.role,
                          name: m.user.name,
                          email: m.user.email,
                          avatar: m.user.avatar
                        }))}
                        selectedMemberIds={boardMemberUserIds}
                        memberSearchQuery={boardMemberSearchQuery}
                        onSearchChange={setBoardMemberSearchQuery}
                        onToggleMember={(userId) => {
                          setBoardMemberUserIds((prev) =>
                            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
                          );
                        }}
                        onSelectAll={() => setBoardMemberUserIds(projectMembers.map((m) => m.userId))}
                        onClearAll={() => setBoardMemberUserIds([])}
                      />

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-white/10">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={!canManage || isSavingBoard || !boardName.trim()}
                          onClick={() => handleSaveBoardGeneral()}
                          className="font-semibold shadow-xs"
                        >
                          {isSavingBoard ? "กำลังบันทึก..." : "บันทึกการตั้งค่าบอร์ด (Save Changes)"}
                        </Button>
                      </div>
                    </section>

                    {/* Danger Zone */}
                    {canManage && (
                      <section className="lofi-panel rounded-2xl p-5 border border-red-200 bg-red-50/20 dark:border-red-500/20 dark:bg-red-500/[0.03]">
                        <BoardDangerTab
                          boardName={boardName || activeBoard?.name || "บอร์ดนี้"}
                          canManage={canManage && boardsList.length > 1}
                          isDeleting={isDeletingBoard}
                          onDeleteClick={() => setDeleteConfirmOpen(true)}
                        />
                      </section>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center text-xs text-stone-500 dark:border-white/10 dark:bg-white/[0.02]">
                    ยังไม่มีบอร์ดในโปรเจกต์นี้
                  </div>
                )}
              </div>
            )}

            {/* TAB: Board Columns & Workflow */}
            {(activeTab === "board-columns" || activeTab === "all") && (
              <div className="space-y-4">
                {activeTab === "all" && (
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2 pt-4 dark:border-white/10">
                    <Layers className="h-4 w-4 text-purple-600 dark:text-dusk-lavender" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      5. ขั้นตอนงานและคอลัมน์ (Columns & Workflow)
                    </h2>
                  </div>
                )}

                {/* Active Board Selector Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-purple-200 bg-purple-50 text-purple-700 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-dusk-amber">
                        Workflow Stage Columns
                      </span>
                      <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {boardName || activeBoard?.name || "Select Board"}
                      </h2>
                    </div>
                  </div>

                  {boardsList.length > 1 && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">เลือกบอร์ด:</span>
                      <select
                        value={selectedBoardId}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          setSelectedBoardId(nextId);
                          if (typeof window !== "undefined") {
                            const url = new URL(window.location.href);
                            url.searchParams.set("boardId", nextId);
                            window.history.replaceState(null, "", url.toString());
                          }
                        }}
                        className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 shadow-xs dark:border-white/10 dark:bg-stone-900 dark:text-stone-200 cursor-pointer"
                      >
                        {boardsList.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {selectedBoardId ? (
                  <section className="lofi-panel rounded-2xl p-5 border border-stone-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
                    <BoardColumnsTab
                      columns={boardColumns}
                      totalCards={boardColumns.reduce((acc, c) => acc + (c.cardCount ?? 0), 0)}
                      projectId={projectId}
                      boardId={selectedBoardId}
                      canManage={canManage}
                      onColumnsChange={setBoardColumns}
                    />
                  </section>
                ) : (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center text-xs text-stone-500 dark:border-white/10 dark:bg-white/[0.02]">
                    ยังไม่มีบอร์ดในโปรเจกต์นี้
                  </div>
                )}
              </div>
            )}

            {/* TAB: Attributes (Card Attributes & Types) */}
            {(activeTab === "attributes" || activeTab === "all") && (
              <div className="space-y-4">
                {activeTab === "all" && (
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2 pt-4 dark:border-white/10">
                    <CheckSquare className="h-4 w-4 text-teal-600 dark:text-dusk-cyan" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      6. สถานะและแอตทริบิวต์การ์ด (Card Attributes & Types)
                    </h2>
                  </div>
                )}

                {/* Interactive Board Attributes Manager */}
                <section className="lofi-panel rounded-2xl p-5 border border-stone-200 bg-white dark:border-white/10 dark:bg-white/[0.02] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-4 dark:border-white/10">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-dusk-amber">
                        Interactive Attribute Manager
                      </p>
                      <h3 className="mt-0.5 text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
                        <span>จัดการคุณสมบัติการ์ด (Status, Priority &amp; Story Points)</span>
                      </h3>
                      <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                        ปรับแต่งสถานะคอลัมน์ ลำดับความสำคัญ และคะแนนความยาก พร้อมซิงค์เรียลไทม์กับทุกบอร์ด
                      </p>
                    </div>

                    {formattedBoards.length > 1 && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">เลือกบอร์ด:</span>
                        <select
                          value={selectedBoardId}
                          onChange={(e) => setSelectedBoardId(e.target.value)}
                          className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 shadow-xs dark:border-white/10 dark:bg-stone-900 dark:text-stone-200 cursor-pointer"
                        >
                          {formattedBoards.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {selectedBoardId ? (
                    <BoardAttributesTab
                      key={`board-attr-${selectedBoardId}-${attributeSubTab}`}
                      boardId={selectedBoardId}
                      canManage={canManage}
                      priorities={boardPriorities}
                      onPrioritiesChange={handlePrioritiesChange}
                      initialSubTab={attributeSubTab}
                    />
                  ) : (
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center text-xs text-stone-500 dark:border-white/10 dark:bg-white/[0.02]">
                      ยังไม่มีบอร์ดในโปรเจกต์นี้ โปรดสร้างบอร์ดใหม่ในแท็บ &ldquo;Boards &amp; Sub-projects&rdquo; ก่อนปรับแต่งคุณสมบัติการ์ด
                    </div>
                  )}
                </section>

                <div className="grid grid-cols-1 gap-4">
                  {/* 1. Workflow Statuses */}
                  <section className="lofi-panel rounded-2xl p-5 border border-stone-200 bg-white dark:border-white/10 dark:bg-white/[0.02] space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-dusk-amber">
                        Work States
                      </p>
                      <h3 className="mt-1 text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100">
                        สถานะการ์ดมาตรฐาน (Standard Card Statuses)
                      </h3>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        วงจรชีวิตงานของ Retzlo ประกอบด้วยสถานะพื้นฐานที่สอดคล้องกับ Kanban
                        และการประมวลผลความคืบหน้า
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 dark:border-dusk-lavender/20 dark:bg-dusk-lavender/10">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-dusk-lavender" />
                          <span className="text-xs font-bold text-indigo-700 dark:text-dusk-lavender">
                            TODO
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400">
                          งานที่รอการดำเนินการ หรืออยู่ในรายการ Backlog
                        </p>
                      </div>

                      <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3.5 dark:border-dusk-cyan/20 dark:bg-dusk-cyan/10">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-dusk-cyan" />
                          <span className="text-xs font-bold text-teal-700 dark:text-dusk-cyan">
                            DOING
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400">
                          งานที่กำลังอยู่ระหว่างการปฏิบัติหรือพัฒนา
                        </p>
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-dusk-amber/20 dark:bg-dusk-amber/10">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-600 dark:bg-dusk-amber" />
                          <span className="text-xs font-bold text-amber-700 dark:text-dusk-amber">
                            WAITING
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400">
                          รอการตรวจ รอความคิดเห็น หรือติดอุปสรรคภายนอก
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            DONE
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400">
                          งานที่เสร็จสิ้นสมบูรณ์และได้รับรางวัลเหรียญ
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* 2. Priority Scale & Story Points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Priority Levels */}
                    <section className="lofi-panel rounded-2xl p-5 border border-stone-200 bg-white dark:border-white/10 dark:bg-white/[0.02] space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-dusk-amber">
                          Priority Matrix
                        </p>
                        <h3 className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
                          ระดับความสำคัญ (Priority Levels)
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          ลำดับความเร่งด่วนสำหรับการจัดการ Backlog
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-xs dark:border-red-500/20 dark:bg-red-500/10">
                          <span className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-300">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            P0 - Urgent
                          </span>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400">ด่วนที่สุด / บล็อกเกอร์</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50/60 px-3 py-2 text-xs dark:border-orange-500/20 dark:bg-orange-500/10">
                          <span className="flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-300">
                            <span className="h-2 w-2 rounded-full bg-orange-500" />
                            P1 - High
                          </span>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400">สำคัญมาก / มีผลต่อเป้าหมาย</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs dark:border-amber-500/20 dark:bg-amber-500/10">
                          <span className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            P2 - Medium
                          </span>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400">มาตรฐานประจำวัน</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-cyan-200 bg-cyan-50/60 px-3 py-2 text-xs dark:border-cyan-500/20 dark:bg-cyan-500/10">
                          <span className="flex items-center gap-2 font-semibold text-cyan-700 dark:text-cyan-300">
                            <span className="h-2 w-2 rounded-full bg-cyan-500" />
                            P3 - Low
                          </span>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400">งานเสริม / ปรับปรุง</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.02]">
                          <span className="flex items-center gap-2 font-semibold text-stone-700 dark:text-stone-300">
                            <span className="h-2 w-2 rounded-full bg-stone-400" />
                            P4 - None
                          </span>
                          <span className="text-[11px] text-stone-500 dark:text-stone-400">ทั่วไป / ไอเดีย</span>
                        </div>
                      </div>
                    </section>

                    {/* Story Points & Sizing */}
                    <section className="lofi-panel rounded-2xl p-5 border border-stone-200 bg-white dark:border-white/10 dark:bg-white/[0.02] space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-dusk-amber">
                          Estimation & Velocity
                        </p>
                        <h3 className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
                          Story Points & การประเมินขนาด
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          ชุดคะแนนสำหรับการวางแผนสปรินต์และการวัดผลงาน
                        </p>
                      </div>

                      <div className="space-y-3 pt-1">
                        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                          <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                            Fibonacci Scale (Default)
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {["1 pt", "3 pts", "5 pts", "8 pts", "16 pts", "21 pts"].map((pt) => (
                              <span
                                key={pt}
                                className="rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender"
                              >
                                {pt}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                          <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                            T-Shirt Sizing & Linear
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {["XS", "S", "M", "L", "XL"].map((sz) => (
                              <span
                                key={sz}
                                className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300"
                              >
                                {sz}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-1">
                          <Link href={`/project/${projectId}/board`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full text-xs inline-flex items-center justify-center gap-1.5"
                            >
                              <span>ไปยังบอร์ดเพื่อปรับแต่งคอลัมน์</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Features (Features & Privacy) */}
            {(activeTab === "features" || activeTab === "all") && (
              <div className="space-y-4">
                {activeTab === "all" && (
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2 pt-4 dark:border-white/10">
                    <ShieldCheck className="h-4 w-4 text-cyan-600 dark:text-dusk-cyan" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      5. สิทธิ์และฟีเจอร์ (Features & Privacy)
                    </h2>
                  </div>
                )}
                <SettingsForm
                  project={project}
                  canManagePrivacy={canManage}
                  viewMode="features"
                />
              </div>
            )}

            {/* TAB: Preferences (Preferences & Theme) */}
            {(activeTab === "preferences" || activeTab === "all") && (
              <div className="space-y-4">
                {activeTab === "all" && (
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2 pt-4 dark:border-white/10">
                    <Palette className="h-4 w-4 text-rose-600 dark:text-dusk-rose" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      6. การตั้งค่าส่วนบุคคล (Preferences & Theme)
                    </h2>
                  </div>
                )}
                <section
                  className={cn(
                    "lofi-panel rounded-2xl p-5 sm:p-6 border border-stone-200 bg-white dark:border-white/10 dark:bg-white/[0.02]",
                    activeTab === "preferences" && "max-w-4xl"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-dusk-lavender/20 dark:bg-dusk-lavender/10 dark:text-dusk-lavender">
                      <Palette className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-600 dark:text-dusk-amber">
                        Personal preferences
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-stone-900 dark:text-stone-100">
                        Theme mode & Sound effects
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm leading-6 text-stone-500 dark:text-stone-400">
                        ตั้งค่าการแสดงผลและเสียงตอบสนองเฉพาะเบราว์เซอร์นี้
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                        Theme mode
                      </h4>
                      <p className="mb-3 mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">
                        เลือกสไตล์ภาพของ Retzlo สำหรับเครื่องของคุณ (บันทึกเฉพาะในเบราว์เซอร์นี้)
                      </p>
                      {themeToggleSlot}
                    </div>

                    <div className="border-t border-stone-200 pt-5 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-indigo-600 dark:text-dusk-lavender" />
                        <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                          Sound feedback
                        </h4>
                      </div>
                      <p className="mb-4 mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">
                        เปิด/ปิดเสียงและปรับระดับเสียงแจ้งเตือนเมื่อทำงานเสร็จ
                      </p>
                      <SoundToggle />
                    </div>
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>

      <ConfirmModal
        open={deleteConfirmOpen}
        title={`ลบบอร์ด "${boardName || activeBoard?.name || ""}"`}
        message="คุณแน่ใจหรือไม่ว่าต้องการลบบอร์ดนี้อย่างถาวร? การ์ดและขั้นตอนงานทั้งหมดในบอร์ดนี้จะถูกลบและไม่สามารถกู้คืนได้"
        confirmLabel="ลบบอร์ดถาวร"
        cancelLabel="ยกเลิก"
        variant="danger"
        isLoading={isDeletingBoard}
        onConfirm={handleDeleteBoard}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
