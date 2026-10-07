"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FolderKanban, Globe, LayoutGrid, List, Lock, MoreVertical, Plus, Search, Trash2, Users, Edit3, Check, X, Sparkles, Settings, ExternalLink } from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { BoardSummary } from "@/types/kanban";
import { BoardSettingsModal } from "@/components/kanban/board-settings-modal";
import { BoardTemplatePicker } from "@/components/kanban/board-template-picker";
import { DEFAULT_BOARD_TEMPLATE_ID, type BoardTemplateId } from "@/lib/kanban/board-templates";

interface ProjectMemberInfo {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar?: string | null;
  };
}

interface ProjectBoardsManagerProps {
  projectId: string;
  canManage: boolean;
  initialBoards: BoardSummary[];
  projectMembers: ProjectMemberInfo[];
  onConfigureBoard?: (boardId: string, subTab?: "general" | "columns" | "attributes") => void;
}

export function ProjectBoardsManager({
  projectId,
  canManage,
  initialBoards,
  projectMembers,
  onConfigureBoard
}: ProjectBoardsManagerProps) {
  const [boards, setBoards] = useState<BoardSummary[]>(initialBoards);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const highlightedBoardId = searchParams.get("boardId");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PUBLIC" | "PRIVATE">("ALL");
  const [layoutMode, setLayoutMode] = useState<"grid" | "table">("table");

  // Auto-scroll and highlight target board if specified in query params
  useEffect(() => {
    if (highlightedBoardId) {
      setTimeout(() => {
        const el = document.getElementById(`board-setting-card-${highlightedBoardId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
    }
  }, [highlightedBoardId]);

  const publicCount = useMemo(() => boards.filter((b) => !b.isPrivate).length, [boards]);
  const privateCount = useMemo(() => boards.filter((b) => b.isPrivate).length, [boards]);
  const totalCardsCount = useMemo(
    () => boards.reduce((acc, b) => acc + (b.cardCount ?? 0), 0),
    [boards]
  );

  const filteredBoards = useMemo(() => {
    return boards.filter((b) => {
      if (filterType === "PUBLIC" && b.isPrivate) return false;
      if (filterType === "PRIVATE" && !b.isPrivate) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return b.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [boards, filterType, searchQuery]);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardTemplateId, setNewBoardTemplateId] = useState<BoardTemplateId>(DEFAULT_BOARD_TEMPLATE_ID);
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [newMemberIds, setNewMemberIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Name Modal State
  const [editingBoard, setEditingBoard] = useState<BoardSummary | null>(null);
  const [editName, setEditName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Manage Access Modal State
  const [accessBoard, setAccessBoard] = useState<BoardSummary | null>(null);
  const [accessIsPrivate, setAccessIsPrivate] = useState(false);
  const [accessMemberIds, setAccessMemberIds] = useState<string[]>([]);
  const [isSavingAccess, setIsSavingAccess] = useState(false);

  // Detailed Settings Modal State
  const [detailedSettingsBoard, setDetailedSettingsBoard] = useState<BoardSummary | null>(null);

  // Delete Confirm State
  const [deletingBoard, setDeletingBoard] = useState<BoardSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Create Board Handler
  async function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newBoardName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBoardName.trim(),
          isPrivate: newIsPrivate,
          memberUserIds: newIsPrivate ? newMemberIds : [],
          templateId: newBoardTemplateId
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not create sub-project");
      }

      setBoards((prev) => [...prev, data.board]);
      setIsCreateOpen(false);
      setNewBoardName("");
      setNewBoardTemplateId(DEFAULT_BOARD_TEMPLATE_ID);
      setNewIsPrivate(false);
      setNewMemberIds([]);
      toast({ message: `Sub-project "${data.board.name}" created! ✦`, type: "success" });
    } catch (err) {
      toast({ message: err instanceof Error ? err.message : "Failed to create board", type: "error" });
    } finally {
      setIsCreating(false);
    }
  }

  // 2. Edit Board Name Handler
  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBoard || !editName.trim() || isEditing) return;

    setIsEditing(true);
    try {
      const response = await fetch(`/api/boards/${editingBoard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not update name");
      }

      setBoards((prev) =>
        prev.map((b) => (b.id === editingBoard.id ? { ...b, name: data.board.name } : b))
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("board-renamed", {
            detail: { id: editingBoard.id, name: data.board.name }
          })
        );
      }
      setEditingBoard(null);
      toast({ message: "Board name updated", type: "success" });
    } catch (err) {
      toast({ message: err instanceof Error ? err.message : "Failed to update", type: "error" });
    } finally {
      setIsEditing(false);
    }
  }

  // 3. Save Access Handler
  async function handleSaveAccess(e: React.FormEvent) {
    e.preventDefault();
    if (!accessBoard || isSavingAccess) return;

    setIsSavingAccess(true);
    try {
      const response = await fetch(`/api/boards/${accessBoard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPrivate: accessIsPrivate,
          memberUserIds: accessIsPrivate ? accessMemberIds : []
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not update board access");
      }

      setBoards((prev) =>
        prev.map((b) =>
          b.id === accessBoard.id
            ? {
                ...b,
                isPrivate: data.board.isPrivate,
                memberUserIds: data.board.memberUserIds,
                members: data.board.members
              }
            : b
        )
      );
      setAccessBoard(null);
      toast({ message: "Board access permissions saved! 🔒", type: "success" });
    } catch (err) {
      toast({ message: err instanceof Error ? err.message : "Failed to save access", type: "error" });
    } finally {
      setIsSavingAccess(false);
    }
  }

  // 4. Delete Board Handler
  async function handleDeleteBoard() {
    if (!deletingBoard || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/boards/${deletingBoard.id}`, {
        method: "DELETE"
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not delete board");
      }

      setBoards((prev) => prev.filter((b) => b.id !== deletingBoard.id));
      toast({ message: `Sub-project "${deletingBoard.name}" deleted.`, type: "success" });
      setDeletingBoard(null);
    } catch (err) {
      toast({ message: err instanceof Error ? err.message : "Failed to delete", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  }

  function toggleNewMember(userId: string) {
    setNewMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  function toggleAccessMember(userId: string) {
    setAccessMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  return (
    <section className="space-y-3">
      {/* ── Summary + primary action ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-theme-muted" aria-label="Board statistics">
          <span className="inline-flex items-center gap-1 rounded-md border border-theme-border bg-theme-panel px-2 py-0.5 text-[11px]">
            <span className="text-theme-muted">Total Boards:</span>
            <span className="font-semibold text-theme-foreground">{boards.length}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-theme-border bg-theme-panel px-2 py-0.5 text-[11px]">
            <span className="text-theme-muted">Total Tasks:</span>
            <span className="font-semibold text-theme-foreground">{totalCardsCount}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-theme-border bg-theme-panel px-2 py-0.5 text-[11px]">
            <span className="text-theme-muted">Public Boards:</span>
            <span className="font-semibold text-theme-foreground">{publicCount}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-theme-border bg-theme-panel px-2 py-0.5 text-[11px]">
            <span className="text-theme-muted">Private Boards:</span>
            <span className="font-semibold text-theme-foreground">{privateCount}</span>
          </span>
        </div>

        {canManage && (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setNewBoardName("");
              setNewBoardTemplateId(DEFAULT_BOARD_TEMPLATE_ID);
              setNewIsPrivate(false);
              setNewMemberIds([]);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            New board
          </Button>
        )}
      </div>

      {/* ── Search, Filter & Layout Controls for Multi-Board UX ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search boards by name..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-8 pr-3 text-xs text-stone-200 placeholder:text-stone-500 outline-none focus:border-dusk-lavender/50 focus:ring-1 focus:ring-dusk-lavender/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter Chips & View Mode */}
        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium transition cursor-pointer",
                filterType === "ALL"
                  ? "bg-dusk-lavender/20 text-dusk-lavender font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              )}
            >
              All ({boards.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("PUBLIC")}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium transition cursor-pointer",
                filterType === "PUBLIC"
                  ? "bg-dusk-cyan/20 text-dusk-cyan font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              )}
            >
              Public ({publicCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("PRIVATE")}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium transition cursor-pointer",
                filterType === "PRIVATE"
                  ? "bg-amber-500/20 text-amber-300 font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              )}
            >
              Private ({privateCount})
            </button>
          </div>

          {/* Layout Toggle: Grid vs Table */}
          <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
            <button
              type="button"
              onClick={() => setLayoutMode("grid")}
              title="Grid Cards view"
              className={cn(
                "p-1 rounded text-xs transition cursor-pointer",
                layoutMode === "grid"
                  ? "bg-white/10 text-white font-bold"
                  : "text-stone-500 hover:text-stone-300"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("table")}
              title="List Table view"
              className={cn(
                "p-1 rounded text-xs transition cursor-pointer",
                layoutMode === "table"
                  ? "bg-white/10 text-white font-bold"
                  : "text-stone-500 hover:text-stone-300"
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Boards List: Grid or Table Mode ── */}
      {filteredBoards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-8 text-center">
          <p className="text-sm font-medium text-stone-300">No boards match your filter</p>
          <p className="mt-1 text-xs text-stone-500">Try adjusting your search query or filter category.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterType("ALL");
            }}
            className="mt-3 text-xs text-dusk-lavender hover:underline"
          >
            Reset filter
          </button>
        </div>
      ) : layoutMode === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          {filteredBoards.map((b) => {
            const isOnlyBoard = boards.length <= 1;
            const memberCount = b.members?.length ?? b.memberUserIds?.length ?? 0;
            const isHighlighted = b.id === highlightedBoardId;

            return (
              <div
                key={b.id}
                id={`board-setting-card-${b.id}`}
                className={cn(
                  "group relative flex flex-col justify-between rounded-xl border bg-white/[0.035] p-4 transition-all hover:border-dusk-lavender/40 hover:bg-white/[0.05]",
                  isHighlighted
                    ? "border-dusk-lavender ring-2 ring-dusk-lavender/50 bg-dusk-lavender/10 shadow-lg shadow-dusk-lavender/10"
                    : "border-white/10"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-stone-100 text-sm truncate" title={b.name}>
                        {b.name}
                      </h3>
                      {isHighlighted && (
                        <span className="inline-block mt-0.5 rounded bg-dusk-lavender/20 px-1.5 py-0.2 text-[9px] font-bold text-dusk-lavender">
                          Current Selection
                        </span>
                      )}
                    </div>
                    {b.isPrivate ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 shrink-0"
                        title="Visible only to specified members"
                      >
                        <Lock className="h-2.5 w-2.5" />
                        Private ({memberCount})
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-dusk-cyan/30 bg-dusk-cyan/10 px-2 py-0.5 text-[10px] font-medium text-dusk-cyan shrink-0"
                        title="Visible to all team members"
                      >
                        <Globe className="h-2.5 w-2.5" />
                        Public
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500">
                    {b.cardCount !== undefined ? `${b.cardCount} cards` : "Active board"}
                  </p>

                  {/* Member Avatars Preview if Private */}
                  {b.isPrivate && b.members && b.members.length > 0 && (
                    <div className="flex items-center gap-1 pt-1 overflow-hidden">
                      <span className="text-[10px] text-stone-500">Access:</span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {b.members.slice(0, 4).map((m) => (
                          <Avatar
                            key={m.userId}
                            user={{
                              id: m.userId,
                              name: m.user.name,
                              email: m.user.email,
                              avatar: m.user.avatar
                            }}
                            size={20}
                            className="ring-1 ring-white dark:ring-stone-900 shrink-0"
                            showTooltip
                          />
                        ))}
                      </div>
                      {b.members.length > 4 && (
                        <span className="text-[10px] text-stone-500">+{b.members.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                  <Link
                    href={`/project/${projectId}/board?boardId=${b.id}`}
                    className="flex h-7.5 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-xs font-semibold text-stone-200 transition hover:border-dusk-lavender/50 hover:bg-white/10 hover:text-white"
                    title="เปิดดูบอร์ดนี้ในมุมมอง Kanban"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-dusk-lavender" />
                    <span>เปิดบอร์ด</span>
                  </Link>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onConfigureBoard) {
                            onConfigureBoard(b.id, "general");
                          } else {
                            setDetailedSettingsBoard(b);
                          }
                        }}
                        className="flex h-7.5 items-center gap-1.5 rounded-lg border border-dusk-amber/30 bg-dusk-amber/10 px-2.5 text-xs font-semibold text-dusk-amber transition hover:bg-dusk-amber/20 cursor-pointer"
                        title="ตั้งค่าบอร์ด สิทธิ์สมาชิก และระดับความสำคัญ"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        <span>Settings</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingBoard(b);
                          setEditName(b.name);
                        }}
                        className="grid h-7.5 w-7.5 place-items-center rounded-lg border border-white/10 text-stone-400 transition hover:bg-white/10 hover:text-stone-200 cursor-pointer"
                        title="เปลี่ยนชื่อบอร์ด"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onConfigureBoard) {
                            onConfigureBoard(b.id, "general");
                          } else {
                            setAccessBoard(b);
                            setAccessIsPrivate(b.isPrivate);
                            setAccessMemberIds(b.memberUserIds ?? b.members?.map((m) => m.userId) ?? []);
                          }
                        }}
                        className="grid h-7.5 w-7.5 place-items-center rounded-lg border border-white/10 text-stone-400 transition hover:bg-white/10 hover:text-stone-200 cursor-pointer"
                        title="กำหนดสิทธิ์สมาชิก (Access)"
                      >
                        <Users className="h-3.5 w-3.5" />
                      </button>

                      {!isOnlyBoard && (
                        <button
                          type="button"
                          onClick={() => setDeletingBoard(b)}
                          className="grid h-7.5 w-7.5 place-items-center rounded-lg border border-red-500/20 text-red-400 transition hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                          title="ลบบอร์ดนี้"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Layout for Many Boards */
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="border-b border-white/10 bg-white/[0.04] text-[11px] uppercase font-semibold text-stone-400">
              <tr>
                <th className="py-2.5 px-4">Board Name</th>
                <th className="py-2.5 px-4">Visibility</th>
                <th className="py-2.5 px-4 text-center">Tasks</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBoards.map((b) => {
                const isOnlyBoard = boards.length <= 1;
                const memberCount = b.members?.length ?? b.memberUserIds?.length ?? 0;
                const isHighlighted = b.id === highlightedBoardId;

                return (
                  <tr
                    key={b.id}
                    id={`board-setting-card-${b.id}`}
                    className={cn(
                      "transition hover:bg-white/[0.03]",
                      isHighlighted && "bg-dusk-lavender/10 font-medium"
                    )}
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-3.5 w-3.5 text-dusk-lavender shrink-0" />
                        <span className="font-semibold text-stone-100">{b.name}</span>
                        {isHighlighted && (
                          <span className="rounded bg-dusk-lavender/20 px-1.5 py-0.2 text-[9px] font-bold text-dusk-lavender">
                            Current
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      {b.isPrivate ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">
                          <Lock className="h-2.5 w-2.5" />
                          Private ({memberCount})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-cyan/30 bg-dusk-cyan/10 px-2 py-0.5 text-[10px] text-dusk-cyan">
                          <Globe className="h-2.5 w-2.5" />
                          Public
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">
                      {b.cardCount !== undefined ? b.cardCount : "-"}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/project/${projectId}/board?boardId=${b.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-stone-200 transition hover:border-dusk-lavender/40 hover:bg-white/10"
                        >
                          <ExternalLink className="h-3 w-3 text-dusk-lavender" />
                          <span>เปิดบอร์ด</span>
                        </Link>

                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (onConfigureBoard) {
                                  onConfigureBoard(b.id, "general");
                                } else {
                                  setDetailedSettingsBoard(b);
                                }
                              }}
                              className="rounded px-2 py-1 text-[11px] font-medium text-dusk-amber hover:bg-dusk-amber/10 transition cursor-pointer"
                            >
                              Settings
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onConfigureBoard) {
                                  onConfigureBoard(b.id, "general");
                                } else {
                                  setAccessBoard(b);
                                  setAccessIsPrivate(b.isPrivate);
                                  setAccessMemberIds(b.memberUserIds ?? b.members?.map((m) => m.userId) ?? []);
                                }
                              }}
                              className="rounded px-2 py-1 text-[11px] font-medium text-dusk-lavender hover:bg-dusk-lavender/10 transition cursor-pointer"
                            >
                              Access
                            </button>
                            {!isOnlyBoard && (
                              <button
                                type="button"
                                onClick={() => setDeletingBoard(b)}
                                className="rounded p-1 text-stone-400 hover:text-red-400 transition cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal 1: Create Sub-project */}
      {isCreateOpen && (
        <AppModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          labelledBy="create-board-modal-title"
          contentClassName="w-full max-w-3xl overflow-hidden rounded-2xl"
        >
          <form onSubmit={handleCreateBoard} className="max-h-[calc(100dvh-1.5rem)] space-y-4 overflow-y-auto rounded-2xl border border-theme-border bg-theme-panel p-4 text-theme-foreground shadow-2xl sm:p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-theme-accent">Sub-project</p>
              <h3 id="create-board-modal-title" className="mt-0.5 text-xl font-semibold text-theme-foreground">
                Create Sub-project Board
              </h3>
              <p className="mt-1 text-xs text-theme-muted">
                Add a new Kanban workspace lane for your team.
              </p>
            </div>

            <label className="block space-y-1.5 text-sm text-theme-foreground">
              <span>Board name</span>
              <Input
                autoFocus
                required
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="e.g. Mobile App, Design System, Marketing..."
              />
            </label>

            <BoardTemplatePicker
              selectedId={newBoardTemplateId}
              onSelect={setNewBoardTemplateId}
              disabled={isCreating}
            />

            {/* Privacy Selection */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted">
                Access Visibility
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewIsPrivate(false)}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-3 text-left transition",
                    !newIsPrivate
                      ? "border-theme-accent bg-theme-paper-strong text-theme-accent"
                      : "border-theme-border bg-theme-paper text-theme-muted hover:border-theme-accent hover:text-theme-foreground"
                  )}
                >
                  <Globe className="h-4 w-4 mb-1" />
                  <span className="text-xs font-semibold">Public to Team</span>
                  <span className="mt-0.5 text-[10px] leading-tight text-theme-muted">
                    All project members can view
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewIsPrivate(true)}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-3 text-left transition",
                    newIsPrivate
                      ? "border-theme-accent bg-theme-paper-strong text-theme-accent"
                      : "border-theme-border bg-theme-paper text-theme-muted hover:border-theme-accent hover:text-theme-foreground"
                  )}
                >
                  <Lock className="h-4 w-4 mb-1" />
                  <span className="text-xs font-semibold">Private Board</span>
                  <span className="mt-0.5 text-[10px] leading-tight text-theme-muted">
                    Only selected members can see
                  </span>
                </button>
              </div>
            </div>

            {/* Member Checkboxes if Private */}
            {newIsPrivate && (
              <div className="space-y-2 border-t border-theme-border pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-theme-foreground">Grant Access to Members</span>
                  <span className="text-theme-muted">{newMemberIds.length} selected</span>
                </div>
                <div className="scrollbar-soft max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-theme-border bg-theme-paper p-2">
                  {projectMembers.map((m) => {
                    const isSelected = newMemberIds.includes(m.userId);
                    return (
                      <button
                        key={m.userId}
                        type="button"
                        onClick={() => toggleNewMember(m.userId)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg p-2 text-xs transition",
                          isSelected
                            ? "bg-theme-paper-strong font-medium text-theme-accent"
                            : "text-theme-muted hover:bg-theme-paper-strong hover:text-theme-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Avatar
                            user={{
                              id: m.userId,
                              name: m.user.name,
                              email: m.user.email,
                              avatar: m.user.avatar
                            }}
                            size={20}
                          />
                          <span className="truncate">{m.user.name ?? m.user.email}</span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-theme-accent" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-theme-border pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!newBoardName.trim() || isCreating}>
                {isCreating ? "Creating..." : "Create Board"}
              </Button>
            </div>
          </form>
        </AppModal>
      )}

      {/* Modal 2: Edit Name */}
      {editingBoard && (
        <AppModal
          open={Boolean(editingBoard)}
          onClose={() => setEditingBoard(null)}
          labelledBy="edit-board-title"
          contentClassName="lofi-panel w-full max-w-sm rounded-2xl p-5"
        >
          <form onSubmit={handleUpdateName} className="space-y-4">
            <h3 id="edit-board-title" className="text-lg font-semibold text-stone-100">
              Rename Board
            </h3>
            <Input
              autoFocus
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Board name..."
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditingBoard(null)}>
                Cancel
              </Button>
              <Button disabled={!editName.trim() || isEditing}>
                {isEditing ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </AppModal>
      )}

      {/* Modal 3: Manage Member Access */}
      {accessBoard && (
        <AppModal
          open={Boolean(accessBoard)}
          onClose={() => setAccessBoard(null)}
          labelledBy="manage-access-title"
          contentClassName="lofi-panel w-full max-w-md rounded-2xl p-5"
        >
          <form onSubmit={handleSaveAccess} className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Access Control</p>
              <h3 id="manage-access-title" className="text-xl font-semibold text-stone-100 mt-0.5 truncate">
                Access for {accessBoard.name}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Configure whether this board is visible to everyone or restricted to specific users.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccessIsPrivate(false)}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-3 text-left transition",
                  !accessIsPrivate
                    ? "border-dusk-cyan/60 bg-dusk-cyan/15 text-dusk-cyan"
                    : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20"
                )}
              >
                <Globe className="h-4 w-4 mb-1" />
                <span className="text-xs font-semibold">Public to Team</span>
                <span className="text-[10px] text-stone-500 leading-tight mt-0.5">
                  All project members can view
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAccessIsPrivate(true)}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-3 text-left transition",
                  accessIsPrivate
                    ? "border-dusk-amber/60 bg-dusk-amber/15 text-dusk-amber"
                    : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20"
                )}
              >
                <Lock className="h-4 w-4 mb-1" />
                <span className="text-xs font-semibold">Restricted Access</span>
                <span className="text-[10px] text-stone-500 leading-tight mt-0.5">
                  Only assigned members can see
                </span>
              </button>
            </div>

            {accessIsPrivate && (
              <div className="space-y-2 border-t border-white/10 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-300">Select Allowed Members</span>
                  <span className="text-stone-500">{accessMemberIds.length} allowed</span>
                </div>
                <div className="scrollbar-soft max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-white/10 bg-black/20 p-2">
                  {projectMembers.map((m) => {
                    const isSelected = accessMemberIds.includes(m.userId);
                    return (
                      <button
                        key={m.userId}
                        type="button"
                        onClick={() => toggleAccessMember(m.userId)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg p-2 text-xs transition",
                          isSelected
                            ? "bg-dusk-amber/15 text-dusk-amber font-medium"
                            : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Avatar
                            user={{
                              id: m.userId,
                              name: m.user.name,
                              email: m.user.email,
                              avatar: m.user.avatar
                            }}
                            size={20}
                          />
                          <span className="truncate">{m.user.name ?? m.user.email}</span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-dusk-amber shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <Button type="button" variant="ghost" onClick={() => setAccessBoard(null)}>
                Cancel
              </Button>
              <Button disabled={isSavingAccess}>
                {isSavingAccess ? "Saving..." : "Save Access"}
              </Button>
            </div>
          </form>
        </AppModal>
      )}

      {/* Confirm Modal: Delete Board */}
      {deletingBoard && (
        <ConfirmModal
          open={Boolean(deletingBoard)}
          title={`Delete Sub-project "${deletingBoard.name}"?`}
          message="All columns, cards, and data in this board will be permanently removed. This cannot be undone."
          confirmLabel="Delete Sub-project"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDeleteBoard}
          onClose={() => setDeletingBoard(null)}
        />
      )}

      {/* Detailed Board Settings Modal */}
      {detailedSettingsBoard && (
        <BoardSettingsModal
          open={Boolean(detailedSettingsBoard)}
          onClose={() => setDetailedSettingsBoard(null)}
          projectId={projectId}
          boardId={detailedSettingsBoard.id}
          boardName={detailedSettingsBoard.name}
          isPrivate={detailedSettingsBoard.isPrivate}
          memberUserIds={
            detailedSettingsBoard.memberUserIds ??
            detailedSettingsBoard.members?.map((m) => m.userId) ??
            []
          }
          canManage={canManage}
          onSaved={(updated) => {
            setBoards((prev) =>
              prev.map((b) =>
                b.id === updated.id
                  ? {
                      ...b,
                      name: updated.name,
                      isPrivate: updated.isPrivate,
                      memberUserIds: updated.memberUserIds
                    }
                  : b
              )
            );
            setDetailedSettingsBoard(null);
          }}
          onDeleted={(boardId) => {
            setBoards((prev) => prev.filter((b) => b.id !== boardId));
            setDetailedSettingsBoard(null);
          }}
        />
      )}
    </section>
  );
}
