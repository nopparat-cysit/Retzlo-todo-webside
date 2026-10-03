"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronDown,
  Copy,
  FolderKanban,
  KanbanSquare,
  Lock,
  MoreVertical,
  Plus,
  Settings,
  Star,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { BoardSettingsModal } from "@/components/kanban/board-settings-modal";
import { BoardTemplatePicker } from "@/components/kanban/board-template-picker";
import { DEFAULT_BOARD_TEMPLATE_ID, type BoardTemplateId } from "@/lib/kanban/board-templates";

interface BoardTabItem {
  id: string;
  name: string;
  isPrivate: boolean;
}

interface BoardSidebarDropdownProps {
  projectId: string;
  boards: BoardTabItem[];
  initialActiveBoardId?: string;
  canManage?: boolean;
  dragHandle?: React.ReactNode;
}

export function BoardSidebarDropdown({
  projectId,
  boards,
  initialActiveBoardId,
  canManage = false,
  dragHandle
}: BoardSidebarDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [targetSettingsBoard, setTargetSettingsBoard] = useState<BoardTabItem | null>(null);
  const [settingsInitialTab, setSettingsInitialTab] = useState<"general" | "access">("general");

  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardTemplateId, setNewBoardTemplateId] = useState<BoardTemplateId>(DEFAULT_BOARD_TEMPLATE_ID);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

  const [boardsList, setBoardsList] = useState<BoardTabItem[]>(boards);
  const [switchingBoardId, setSwitchingBoardId] = useState<string | null>(null);
  const [starredBoardIds, setStarredBoardIds] = useState<string[]>([]);

  const requestedBoardId = searchParams.get("boardId");
  const activeBoardId =
    boardsList.find((board) => board.id === requestedBoardId)?.id ??
    boardsList.find((board) => board.id === initialActiveBoardId)?.id ??
    boardsList[0]?.id ??
    "";
  const isBoardRoute = pathname === `/project/${projectId}/board`;

  // Load expanded state & starred boards from localStorage
  useEffect(() => {
    try {
      const savedExp = localStorage.getItem(`retrod:boards-accordion:${projectId}`);
      if (savedExp !== null) {
        setIsExpanded(savedExp === "true");
      }
      const savedStars = localStorage.getItem(`retrod:starred-boards:${projectId}`);
      if (savedStars) {
        setStarredBoardIds(JSON.parse(savedStars));
      }
    } catch {}
  }, [projectId]);

  useEffect(() => {
    setBoardsList(boards);
  }, [boards]);

  useEffect(() => {
    setSwitchingBoardId(null);
    if (typeof document !== "undefined" && activeBoardId) {
      document.cookie = `project_${projectId}_last_board=${activeBoardId}; path=/; max-age=31536000; SameSite=Lax`;
      try {
        localStorage.setItem(`project_${projectId}_last_board`, activeBoardId);
      } catch {}
    }
  }, [projectId, activeBoardId]);

  useEffect(() => {
    const handleBoardRenamed = (e: CustomEvent<{ id: string; name: string }>) => {
      if (e.detail?.id && e.detail?.name) {
        setBoardsList((prev) =>
          prev.map((b) => (b.id === e.detail.id ? { ...b, name: e.detail.name } : b))
        );
      }
    };
    window.addEventListener("board-renamed" as any, handleBoardRenamed);
    return () => window.removeEventListener("board-renamed" as any, handleBoardRenamed);
  }, []);

  const activeBoard = boardsList.find((b) => b.id === activeBoardId) ?? boardsList[0];

  const toggleAccordion = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`retrod:boards-accordion:${projectId}`, String(next));
      } catch {}
      return next;
    });
  };

  const handleToggleStar = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setStarredBoardIds((prev) => {
      const isStarred = prev.includes(boardId);
      const next = isStarred ? prev.filter((id) => id !== boardId) : [...prev, boardId];
      try {
        localStorage.setItem(`retrod:starred-boards:${projectId}`, JSON.stringify(next));
      } catch {}
      const targetBoard = boardsList.find((b) => b.id === boardId);
      toast({
        message: isStarred
          ? `Unstarred "${targetBoard?.name ?? "Board"}"`
          : `⭐ Starred "${targetBoard?.name ?? "Board"}"!`,
        type: "success"
      });
      return next;
    });
  };

  const handleSaveAsTemplate = (board: BoardTabItem, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const templates = JSON.parse(localStorage.getItem("retrod:saved-board-templates") || "[]");
      const newTemplate = {
        id: `custom-${Date.now()}`,
        name: `${board.name} Template`,
        sourceBoardId: board.id,
        savedAt: new Date().toISOString()
      };
      templates.push(newTemplate);
      localStorage.setItem("retrod:saved-board-templates", JSON.stringify(templates));
      toast({ message: `Saved "${board.name}" as template! 📋`, type: "success" });
    } catch {
      toast({ message: "Saved template locally! 📋", type: "success" });
    }
  };

  const handleOpenSettingsModal = (board: BoardTabItem, tab: "general" | "access" = "general") => {
    setTargetSettingsBoard(board);
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
  };

  async function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newBoardName.trim() || isCreatingBoard) return;

    setIsCreatingBoard(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBoardName.trim(),
          isPrivate: false,
          templateId: newBoardTemplateId
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create board");
      }

      setBoardsList((prev) => [...prev, data.board]);
      setIsCreateBoardOpen(false);
      setNewBoardName("");
      setNewBoardTemplateId(DEFAULT_BOARD_TEMPLATE_ID);
      toast({ message: `Board "${data.board.name}" created! ✦`, type: "success" });
      router.push(`/project/${projectId}/board?boardId=${data.board.id}`);
      router.refresh();
    } catch (err) {
      toast({
        message: err instanceof Error ? err.message : "Failed to create board",
        type: "error"
      });
    } finally {
      setIsCreatingBoard(false);
    }
  }

  return (
    <div className="w-full select-none">
      {/* ── Accordion Header: Boards ── */}
      <div
        className={cn(
          "group/header relative flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border px-3 text-sm transition duration-200",
          isBoardRoute
            ? "border-dusk-lavender/30 bg-dusk-lavender/10 text-stone-900 font-semibold dark:text-stone-100"
            : "border-transparent bg-transparent text-stone-600 hover:border-stone-300/40 hover:bg-black/5 hover:text-stone-900 dark:text-stone-400 dark:hover:border-white/10 dark:hover:bg-white/[0.055] dark:hover:text-stone-100"
        )}
        onClick={toggleAccordion}
      >
        <div className="flex min-w-0 items-center gap-2">
          {dragHandle}
          <FolderKanban
            className={cn(
              "project-sidebar-icon h-4 w-4 shrink-0 transition-colors",
              isBoardRoute ? "text-dusk-lavender" : "text-stone-400 group-hover/header:text-stone-200"
            )}
          />
          <span className="sidebar-expanded-only truncate font-medium">Boards</span>
          <span className="sidebar-expanded-only rounded-full bg-white/10 px-1.5 py-0.2 font-mono text-[10px] text-stone-400">
            {boardsList.length}
          </span>
        </div>

        <div className="sidebar-expanded-only flex items-center gap-1">
          {canManage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreateBoardOpen(true);
              }}
              title="Create new board"
              aria-label="Create new board"
              className="grid h-6 w-6 place-items-center rounded-md text-stone-400 hover:bg-white/10 hover:text-dusk-lavender transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            aria-label={isExpanded ? "Collapse boards" : "Expand boards"}
            className="grid h-6 w-6 place-items-center rounded-md text-stone-500 hover:bg-white/10 hover:text-stone-200 transition cursor-pointer"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isExpanded ? "rotate-0" : "-rotate-90"
              )}
            />
          </button>
        </div>
      </div>

      {/* ── Sub-menu: Direct List of Boards (No Dropdown needed!) ── */}
      {isExpanded && (
        <div className="sidebar-expanded-only ml-3.5 mt-1 max-h-60 space-y-0.5 overflow-y-auto border-l border-stone-200/60 pl-2.5 py-0.5 scrollbar-soft dark:border-white/10">
          {boardsList.length > 0 ? (
            boardsList.map((b) => {
              const isActive = isBoardRoute && b.id === activeBoardId;
              const isSwitching = switchingBoardId === b.id;
              const isStarred = starredBoardIds.includes(b.id);

              return (
                <div
                  key={b.id}
                  className={cn(
                    "group/board-row relative flex items-center justify-between rounded-lg text-xs transition duration-150",
                    isActive
                      ? "border border-dusk-lavender/40 bg-dusk-lavender/15 font-semibold text-stone-900 shadow-xs dark:text-stone-100"
                      : "text-stone-500 hover:bg-white/[0.06] hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200",
                    isSwitching && "animate-pulse"
                  )}
                >
                  <Link
                    href={`/project/${projectId}/board?boardId=${encodeURIComponent(b.id)}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      if (typeof document !== "undefined") {
                        document.cookie = `project_${projectId}_last_board=${b.id}; path=/; max-age=31536000; SameSite=Lax`;
                        try {
                          localStorage.setItem(`project_${projectId}_last_board`, b.id);
                        } catch {}
                      }
                      if (b.id !== activeBoardId) {
                        setSwitchingBoardId(b.id);
                        window.dispatchEvent(
                          new CustomEvent("board-switching", { detail: { targetBoardId: b.id } })
                        );
                      } else if (switchingBoardId) {
                        setSwitchingBoardId(null);
                        window.dispatchEvent(
                          new CustomEvent("board-switching", { detail: { targetBoardId: activeBoardId } })
                        );
                      }
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pl-2 pr-1"
                    title={b.name}
                  >
                    {isStarred ? (
                      <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                    ) : b.isPrivate ? (
                      <Lock className="h-3 w-3 shrink-0 text-stone-400" />
                    ) : (
                      <KanbanSquare className="h-3 w-3 shrink-0 text-stone-400" />
                    )}
                    <span className="truncate">{b.name}</span>
                  </Link>

                  {/* ── More Action Menu (...) ── */}
                  <div className="flex items-center pr-1 opacity-0 group-hover/board-row:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Options for ${b.name}`}
                          className="grid h-6 w-6 place-items-center rounded text-stone-400 hover:bg-white/10 hover:text-stone-100 transition cursor-pointer"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="w-56 z-[1200]">
                        <DropdownMenuLabel className="truncate text-xs font-semibold text-stone-200">
                          {b.name}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* 1. กดดาว (Star / Unstar) */}
                        <DropdownMenuItem
                          onClick={(e) => handleToggleStar(b.id, e)}
                          className="cursor-pointer text-xs"
                        >
                          <Star
                            className={cn(
                              "mr-2 h-3.5 w-3.5",
                              isStarred ? "fill-amber-400 text-amber-400" : "text-stone-400"
                            )}
                          />
                          <span>{isStarred ? "Unstar board" : "Star board"}</span>
                        </DropdownMenuItem>

                        {/* 2. เพิ่มคน (Add / Manage Members) */}
                        {canManage && (
                          <DropdownMenuItem
                            onClick={() => handleOpenSettingsModal(b, "access")}
                            className="cursor-pointer text-xs"
                          >
                            <Users className="mr-2 h-3.5 w-3.5 text-stone-400" />
                            <span>Manage members</span>
                          </DropdownMenuItem>
                        )}

                        {/* 3. เซฟเทมเพลต (Save as Template) */}
                        <DropdownMenuItem
                          onClick={(e) => handleSaveAsTemplate(b, e)}
                          className="cursor-pointer text-xs"
                        >
                          <Copy className="mr-2 h-3.5 w-3.5 text-stone-400" />
                          <span>Save as template</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* 4. Settings -> ไปหน้า Settings ของบอร์ดนั้นทันที */}
                        <DropdownMenuItem
                          onClick={() => {
                            router.push(`/project/${projectId}/settings?boardId=${encodeURIComponent(b.id)}`);
                          }}
                          className="cursor-pointer text-xs font-medium text-stone-100"
                        >
                          <Settings className="mr-2 h-3.5 w-3.5 text-dusk-lavender" />
                          <span>Board settings</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="px-2 py-1 text-[11px] text-stone-500">No boards yet</p>
          )}

          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateBoardOpen(true)}
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-stone-400 hover:bg-white/[0.04] hover:text-dusk-lavender transition cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Create new board</span>
            </button>
          )}
        </div>
      )}

      {/* ── Board Settings Modal (for quick access or member management) ── */}
      {targetSettingsBoard && canManage && (
        <BoardSettingsModal
          open={isSettingsOpen}
          onClose={() => {
            setIsSettingsOpen(false);
            setTargetSettingsBoard(null);
          }}
          projectId={projectId}
          boardId={targetSettingsBoard.id}
          boardName={targetSettingsBoard.name}
          isPrivate={targetSettingsBoard.isPrivate}
          canManage={canManage}
          onSaved={(updated) => {
            setBoardsList((prev) =>
              prev.map((b) =>
                b.id === updated.id
                  ? { ...b, name: updated.name, isPrivate: updated.isPrivate }
                  : b
              )
            );
            setIsSettingsOpen(false);
            setTargetSettingsBoard(null);
            router.refresh();
          }}
          onDeleted={() => {
            setIsSettingsOpen(false);
            const remaining = boardsList.filter((b) => b.id !== targetSettingsBoard.id);
            setBoardsList(remaining);
            setTargetSettingsBoard(null);
            if (remaining.length > 0) {
              router.push(`/project/${projectId}/board?boardId=${remaining[0].id}`);
            } else {
              router.push(`/project/${projectId}/board`);
            }
            router.refresh();
          }}
        />
      )}

      {/* ── Create Board Modal ── */}
      {canManage && (
        <AppModal
          open={isCreateBoardOpen}
          onClose={() => {
            if (!isCreatingBoard) {
              setIsCreateBoardOpen(false);
              setNewBoardName("");
              setNewBoardTemplateId(DEFAULT_BOARD_TEMPLATE_ID);
            }
          }}
          labelledBy="create-board-modal-title"
          contentClassName="w-full max-w-3xl overflow-hidden rounded-2xl"
        >
          <form
            onSubmit={handleCreateBoard}
            className="max-h-[calc(100dvh-2rem)] space-y-3.5 overflow-y-auto rounded-2xl border border-theme-border bg-theme-panel p-4 text-theme-foreground shadow-2xl sm:p-5"
          >
            <div>
              <h3
                id="create-board-modal-title"
                className="flex items-center gap-2 text-lg font-semibold text-theme-foreground"
              >
                <FolderKanban className="h-5 w-5 text-theme-accent" />
                Create New Board
              </h3>
              <p className="mt-1 text-xs text-theme-muted">
                Add a new board channel to organize tasks in this project.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-theme-foreground">
                Board Name
              </label>
              <Input
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="e.g. Marketing Roadmap, Sprint 2..."
                maxLength={80}
                autoFocus
                required
                disabled={isCreatingBoard}
              />
            </div>
            <BoardTemplatePicker
              selectedId={newBoardTemplateId}
              onSelect={setNewBoardTemplateId}
              disabled={isCreatingBoard}
            />
            <div className="flex items-center justify-end gap-2 border-t border-theme-border pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsCreateBoardOpen(false);
                  setNewBoardName("");
                  setNewBoardTemplateId(DEFAULT_BOARD_TEMPLATE_ID);
                }}
                disabled={isCreatingBoard}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newBoardName.trim() || isCreatingBoard}
                variant="primary"
                className="font-semibold"
              >
                {isCreatingBoard ? "Creating..." : "Create Board"}
              </Button>
            </div>
          </form>
        </AppModal>
      )}
    </div>
  );
}
