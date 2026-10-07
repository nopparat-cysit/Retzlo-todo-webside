"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckSquare,
  ExternalLink,
  FolderKanban,
  Globe,
  Layers,
  Lock,
  Palette,
  Settings,
  Sparkles,
  Trash2,
  Users
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { BoardAttributesTab } from "@/components/kanban/board-attributes-tab";
import { BoardGeneralTab } from "@/components/kanban/board-settings/general-tab";
import { BoardColumnsTab } from "@/components/kanban/board-settings/columns-tab";
import type { BoardColumnInfo } from "@/components/kanban/board-settings/types";
import { DEFAULT_PRIORITIES, resolveBoardPriorities } from "@/lib/kanban/priority";
import type { CustomPriority } from "@/types/kanban";
import { ProjectBoardsManager } from "@/components/project/project-boards-manager";
import { SettingsForm } from "@/components/project/settings-form";
import { SoundToggle } from "@/components/project/sound-toggle";
import { SettingsRow, SettingsSection } from "@/components/settings/settings-section";
import { isBoardScopedTab, resolveSettingsTab, type SettingsTabId } from "@/lib/settings/tabs";
import { cn } from "@/lib/utils";

export type { SettingsTabId } from "@/lib/settings/tabs";

type AttributeSubTab = "status" | "priority" | "story-points";
const ATTRIBUTE_SUB_TABS: readonly AttributeSubTab[] = ["status", "priority", "story-points"];

/** Tabs whose content is a simple form and reads better in a narrow column. */
const NARROW_TABS: readonly SettingsTabId[] = ["identity", "access", "board-general", "preferences"];

interface TabItem {
  id: SettingsTabId;
  label: string;
  shortLabel: string;
  icon: typeof FolderKanban;
  badge?: string | number;
  description: string;
}

interface NavGroup {
  id: "project" | "boards" | "personal";
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
  initialBoardId?: string;
  themeToggleSlot?: ReactNode;
}

export function ProjectSettingsClient({
  projectId,
  project,
  formattedBoards,
  projectMembers,
  canManage,
  initialTab,
  initialBoardId,
  themeToggleSlot
}: ProjectSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(() =>
    resolveSettingsTab({ tab: initialTab, boardId: initialBoardId })
  );

  const { toast } = useToast();
  const [boardsList, setBoardsList] = useState(formattedBoards);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(() =>
    initialBoardId && formattedBoards.some((b) => b.id === initialBoardId)
      ? initialBoardId
      : formattedBoards[0]?.id || ""
  );
  const [attributeSubTab, setAttributeSubTab] = useState<AttributeSubTab>("status");
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

  // Read deep-link params once on mount (tab, subTab, boardId).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const boardIdParam = params.get("boardId");
    const subTabParam = params.get("subTab");

    setActiveTab(resolveSettingsTab({ tab: params.get("tab"), boardId: boardIdParam }));

    if (subTabParam && (ATTRIBUTE_SUB_TABS as readonly string[]).includes(subTabParam)) {
      setAttributeSubTab(subTabParam as AttributeSubTab);
    }
    if (boardIdParam && formattedBoards.some((b) => b.id === boardIdParam)) {
      setSelectedBoardId(boardIdParam);
    }
  }, [formattedBoards]);

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
        setBoardMemberUserIds(data.board.members?.map((m: { userId: string }) => m.userId) || []);
        if (data.board.customPriorities) {
          setBoardPriorities(resolveBoardPriorities(data.board.customPriorities));
        }
        if (data.board.columns) {
          setBoardColumns(
            data.board.columns.map(
              (c: {
                id: string;
                name: string;
                color: string | null;
                wipLimit: number | null;
                defaultCardStatus: string | null;
                _count?: { cards: number };
                cards?: unknown[];
              }): BoardColumnInfo => ({
                id: c.id,
                name: c.name,
                color: c.color ?? undefined,
                wipLimit: c.wipLimit,
                defaultCardStatus: c.defaultCardStatus ?? undefined,
                cardCount: c._count?.cards ?? c.cards?.length ?? 0
              })
            )
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
      const res = await fetch(`/api/boards/${selectedBoardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPriorities: nextPriorities })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกระดับความสำคัญ");
      }
      window.dispatchEvent(
        new CustomEvent("board-priorities-updated", {
          detail: { boardId: selectedBoardId, priorities: nextPriorities }
        })
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกระดับความสำคัญ";
      toast({ message: msg, type: "error" });
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
    handleBoardSelect(boardId);
    const targetTab: SettingsTabId =
      subTab === "columns"
        ? "board-columns"
        : subTab === "attributes"
        ? "attributes"
        : "board-general";
    handleTabChange(targetTab);
  };

  function handleTabChange(tabId: SettingsTabId) {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      url.searchParams.delete("subTab");
      window.history.replaceState(null, "", url.toString());
    }
  }

  function handleBoardSelect(nextId: string) {
    setSelectedBoardId(nextId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("boardId", nextId);
      window.history.replaceState(null, "", url.toString());
    }
  }

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
      id: "project",
      title: "Project",
      items: [
        {
          id: "identity",
          label: "General",
          shortLabel: "General",
          icon: Sparkles,
          description: "ชื่อ คำอธิบาย ภาพปก ฟีเจอร์ของโปรเจกต์ และการลบโปรเจกต์"
        },
        {
          id: "access",
          label: "Members",
          shortLabel: "Members",
          icon: Users,
          badge: projectMembers.length,
          description: "รายชื่อสมาชิก บทบาท และสิทธิ์การเข้าถึงโปรเจกต์"
        }
      ]
    },
    {
      id: "boards",
      title: "Boards",
      items: [
        {
          id: "boards",
          label: "All boards",
          shortLabel: "Boards",
          icon: FolderKanban,
          badge: boardsList.length,
          description: "สร้าง ค้นหา และจัดการบอร์ดทั้งหมดในโปรเจกต์"
        },
        {
          id: "board-general",
          label: "Board details",
          shortLabel: "Board",
          icon: Settings,
          description: "ชื่อบอร์ด ความเป็นส่วนตัว และสมาชิกที่เข้าถึงบอร์ดนี้"
        },
        {
          id: "board-columns",
          label: "Columns",
          shortLabel: "Columns",
          icon: Layers,
          description: "ขั้นตอนการทำงาน WIP limits และการแมปสถานะของบอร์ดนี้"
        },
        {
          id: "attributes",
          label: "Card attributes",
          shortLabel: "Attributes",
          icon: CheckSquare,
          description: "Status, Priority และ Story Points ที่ใช้ในการ์ดของบอร์ดนี้"
        }
      ]
    },
    {
      id: "personal",
      title: "Personal",
      items: [
        {
          id: "preferences",
          label: "Theme & sound",
          shortLabel: "Theme",
          icon: Palette,
          description: "ตั้งค่าเฉพาะเบราว์เซอร์นี้ ไม่กระทบสมาชิกคนอื่น"
        }
      ]
    }
  ];

  const allTabs = navGroups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.title })));
  const currentTabInfo = allTabs.find((t) => t.id === activeTab) ?? allTabs[0];
  const isBoardTab = isBoardScopedTab(activeTab);
  const isNarrow = NARROW_TABS.includes(activeTab);
  const displayBoardName = boardName || activeBoard?.name || "บอร์ดนี้";

  const noBoardsState = (
    <div className="rounded-xl border border-dashed border-theme-border p-8 text-center text-xs text-theme-muted">
      ยังไม่มีบอร์ดในโปรเจกต์นี้ —{" "}
      <button type="button" className="font-semibold text-theme-accent hover:underline" onClick={() => handleTabChange("boards")}>
        สร้างบอร์ดใหม่
      </button>
    </div>
  );

  return (
    <div className="scrollbar-soft h-full min-h-0 overflow-y-auto px-1 sm:px-2">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-12 pt-2 lg:flex-row lg:items-start lg:gap-8">
        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden w-52 shrink-0 lg:sticky lg:top-2 lg:block">
          <Link
            href={`/project/${projectId}/board`}
            className="group mb-4 inline-flex items-center gap-1.5 px-2 text-xs font-medium text-theme-muted transition-colors hover:text-theme-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to board</span>
          </Link>

          <div className="mb-4 flex items-center gap-2.5 px-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg border border-theme-border bg-theme-paper text-sm font-bold text-theme-accent">
              {project.coverImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={project.coverImage} alt="" className="h-full w-full object-cover" />
              ) : project.sticker ? (
                <span className="text-base">{project.sticker}</span>
              ) : (
                <span>{project.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-theme-muted">Project Space</p>
              <p className="truncate text-sm font-semibold text-theme-foreground" title={project.name}>
                {project.name}
              </p>
            </div>
          </div>

          <nav aria-label="Settings" className="space-y-4">
            {navGroups.map((group) => (
              <div key={group.id}>
                <p className="px-2 pb-1 text-[11px] font-semibold text-theme-muted">{group.title}</p>
                <ul className="space-y-0.5">
                  {group.items.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const isSubItem = group.id === "boards" && tab.id !== "boards";
                    return (
                      <li key={tab.id}>
                        <button
                          type="button"
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => handleTabChange(tab.id)}
                          className={cn(
                            "flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-[13px] transition",
                            isSubItem && "pl-4",
                            isActive
                              ? "bg-theme-paper-strong font-semibold text-theme-foreground"
                              : "text-theme-muted hover:bg-theme-paper hover:text-theme-foreground"
                          )}
                        >
                          <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive && "text-theme-accent")} />
                          <span className="flex-1 truncate">{tab.label}</span>
                          {tab.badge !== undefined && (
                            <span className="text-[11px] tabular-nums text-theme-muted">{tab.badge}</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Mobile header + tabs ── */}
        <div className="flex flex-col gap-2 lg:hidden">
          <Link
            href={`/project/${projectId}/board`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-theme-muted hover:text-theme-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to board</span>
          </Link>
          <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto border-b border-theme-border px-1 pb-2">
            {allTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs transition",
                    isActive
                      ? "bg-theme-paper-strong font-semibold text-theme-foreground"
                      : "text-theme-muted hover:bg-theme-paper hover:text-theme-foreground"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive && "text-theme-accent")} />
                  <span>{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Detail pane ── */}
        <main className={cn("w-full min-w-0 flex-1 space-y-5", isNarrow && "lg:max-w-3xl")}>
          <header className="border-b border-theme-border pb-3">
            <p className="text-xs text-theme-muted">
              {currentTabInfo.group} / {currentTabInfo.shortLabel}
            </p>
            <h1 className="mt-0.5 text-lg font-semibold text-theme-foreground">{currentTabInfo.label}</h1>
            <p className="mt-0.5 text-xs text-theme-muted">{currentTabInfo.description}</p>
          </header>

          {/* One board scope bar shared by all board-level tabs */}
          {isBoardTab && boardsList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-theme-border bg-theme-paper/60 px-3 py-2">
              <FolderKanban className="h-3.5 w-3.5 text-theme-accent" />
              <span className="text-xs text-theme-muted">Active Board</span>
              {boardsList.length > 1 ? (
                <select
                  aria-label="เลือกบอร์ด"
                  value={selectedBoardId}
                  onChange={(e) => handleBoardSelect(e.target.value)}
                  className="h-7 cursor-pointer rounded-md border border-theme-border bg-theme-panel px-2 text-xs font-semibold text-theme-foreground"
                >
                  {boardsList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs font-semibold text-theme-foreground">{displayBoardName}</span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-theme-border px-2 py-0.5 text-[10px] text-theme-muted">
                {boardIsPrivate ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                {boardIsPrivate ? "Private" : "Public"}
              </span>
              <Link
                href={`/project/${projectId}/board?boardId=${selectedBoardId}`}
                className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-theme-muted hover:text-theme-foreground"
              >
                Open board
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* TAB: General */}
          {activeTab === "identity" && <SettingsForm project={project} canManagePrivacy={canManage} />}

          {/* TAB: Members */}
          {activeTab === "access" && (
            <>
              <SettingsSection
                title={`Space Members · ${projectMembers.length}`}
                description="สมาชิกทุกคนเข้าถึงและทำงานร่วมกันในบอร์ดสาธารณะได้"
                actions={
                  <Link href={`/project/${projectId}/members`}>
                    <Button variant="secondary" size="sm">
                      <span>จัดการสมาชิกและคำเชิญ</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                }
              >
                {projectMembers.map((member) => {
                  const isOwner = member.role.toUpperCase() === "OWNER";
                  return (
                    <div key={member.id} className="flex items-center gap-3 px-4 py-2.5">
                      <Avatar user={member.user} size={28} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-theme-foreground">
                          {member.user.name || member.user.email.split("@")[0]}
                        </p>
                        <p className="truncate text-xs text-theme-muted">{member.user.email}</p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          isOwner
                            ? "border-theme-warning-border bg-theme-warning-surface text-theme-warning"
                            : "border-theme-border text-theme-muted"
                        )}
                      >
                        {isOwner ? "Owner" : "Member"}
                      </span>
                    </div>
                  );
                })}
              </SettingsSection>

              <SettingsSection title="Roles" description="สิ่งที่แต่ละบทบาททำได้ในโปรเจกต์นี้">
                <SettingsRow
                  label="Owner"
                  description="จัดการชื่อและภาพปก ตั้งค่าความเป็นส่วนตัว เชิญหรือถอนสมาชิก และลบโปรเจกต์"
                />
                <SettingsRow
                  label="Member"
                  description="สร้างและจัดการการ์ด บันทึกโน้ต และสร้างไอเทมส่วนตัว (หากเปิดใช้งาน)"
                />
              </SettingsSection>
            </>
          )}

          {/* TAB: All boards */}
          {activeTab === "boards" && (
            <ProjectBoardsManager
              projectId={projectId}
              canManage={canManage}
              initialBoards={boardsList}
              projectMembers={projectMembers}
              onConfigureBoard={handleOpenBoardConfig}
            />
          )}

          {/* TAB: Board details & access */}
          {activeTab === "board-general" &&
            (selectedBoardId ? (
              <>
                <SettingsSection
                  title="Board details & access"
                  flush
                  footer={
                    <Button
                      type="button"
                      size="sm"
                      disabled={!canManage || isSavingBoard || !boardName.trim()}
                      onClick={() => handleSaveBoardGeneral()}
                    >
                      {isSavingBoard ? "กำลังบันทึก..." : "Save changes"}
                    </Button>
                  }
                >
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
                </SettingsSection>

                {canManage && (
                  <SettingsSection title="Danger zone" tone="danger">
                    <SettingsRow
                      label="Delete this board"
                      description={
                        boardsList.length > 1
                          ? `ลบ “${displayBoardName}” พร้อมคอลัมน์ การ์ด เช็กลิสต์ และคอมเมนต์ทั้งหมดอย่างถาวร`
                          : "โปรเจกต์ต้องมีอย่างน้อย 1 บอร์ด จึงลบบอร์ดสุดท้ายไม่ได้"
                      }
                    >
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={boardsList.length <= 1 || isDeletingBoard}
                        onClick={() => setDeleteConfirmOpen(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete board
                      </Button>
                    </SettingsRow>
                  </SettingsSection>
                )}
              </>
            ) : (
              noBoardsState
            ))}

          {/* TAB: Columns */}
          {activeTab === "board-columns" &&
            (selectedBoardId ? (
              <SettingsSection title="Workflow columns" description="ลากเพื่อเรียงลำดับ ตั้ง WIP limit และสถานะเริ่มต้นของการ์ด" flush>
                <BoardColumnsTab
                  columns={boardColumns}
                  totalCards={boardColumns.reduce((acc, c) => acc + (c.cardCount ?? 0), 0)}
                  projectId={projectId}
                  boardId={selectedBoardId}
                  canManage={canManage}
                  onColumnsChange={setBoardColumns}
                />
              </SettingsSection>
            ) : (
              noBoardsState
            ))}

          {/* TAB: Card attributes */}
          {activeTab === "attributes" &&
            (selectedBoardId ? (
              <SettingsSection title="Card attributes" description="ซิงค์กับ Kanban, Card modal และ Table view ทันที" flush>
                <BoardAttributesTab
                  key={`board-attr-${selectedBoardId}-${attributeSubTab}`}
                  boardId={selectedBoardId}
                  canManage={canManage}
                  priorities={boardPriorities}
                  onPrioritiesChange={handlePrioritiesChange}
                  initialSubTab={attributeSubTab}
                />
              </SettingsSection>
            ) : (
              noBoardsState
            ))}

          {/* TAB: Personal preferences */}
          {activeTab === "preferences" && (
            <SettingsSection title="Appearance & sound" description="บันทึกเฉพาะในเบราว์เซอร์นี้">
              <SettingsRow label="Theme mode" description="Light, Dark หรือตามระบบปฏิบัติการ">
                <div className="w-full sm:w-72">{themeToggleSlot}</div>
              </SettingsRow>
              <SettingsRow label="Sound feedback" description="เสียงแจ้งเมื่อย้ายการ์ดไป Done และระดับเสียง" stacked>
                <SoundToggle />
              </SettingsRow>
            </SettingsSection>
          )}
        </main>
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
