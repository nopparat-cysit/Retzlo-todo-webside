"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, FolderKanban, Lock, Plus, Settings } from "lucide-react";
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
}

export function BoardSidebarDropdown({
  projectId,
  boards,
  initialActiveBoardId,
  canManage = false
}: BoardSidebarDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardTemplateId, setNewBoardTemplateId] = useState<BoardTemplateId>(DEFAULT_BOARD_TEMPLATE_ID);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [boardsList, setBoardsList] = useState<BoardTabItem[]>(boards);
  const [switchingBoardId, setSwitchingBoardId] = useState<string | null>(null);
  const requestedBoardId = searchParams.get("boardId");
  const activeBoardId =
    boardsList.find((board) => board.id === requestedBoardId)?.id ??
    boardsList.find((board) => board.id === initialActiveBoardId)?.id ??
    boardsList[0]?.id ??
    "";
  const isBoardRoute = pathname === `/project/${projectId}/board`;

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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open boards menu"
            aria-current={isBoardRoute ? "page" : undefined}
            className={cn(
              "project-nav-link group relative flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm transition duration-200",
              isBoardRoute
                ? "project-nav-link-active border-dusk-lavender/40 bg-dusk-lavender/15 text-stone-900 font-semibold dark:text-stone-100"
                : "border-transparent bg-transparent text-stone-500 hover:border-stone-300/40 hover:bg-black/5 hover:text-stone-900 dark:text-stone-400 dark:hover:border-white/10 dark:hover:bg-white/[0.055] dark:hover:text-stone-100"
            )}
          >
            <FolderKanban className={cn("project-sidebar-icon h-4 w-4 shrink-0", isBoardRoute ? "text-dusk-lavender" : "text-stone-400")} />
            <span className="sidebar-expanded-only truncate">Boards</span>
            <ChevronDown className="sidebar-expanded-only ml-auto h-3.5 w-3.5 shrink-0 text-stone-500" />
            <span className={cn(
              "project-nav-active-marker absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition",
              isBoardRoute ? "bg-dusk-lavender shadow-[0_0_10px_rgba(169,162,255,0.55)]" : "bg-transparent"
            )} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-72 max-w-[calc(100vw-3rem)]">
          <DropdownMenuLabel className="flex items-center justify-between gap-3">
            <span>Boards</span>
            <span className="font-mono text-[10px] font-normal normal-case tracking-normal text-stone-400">
              {boardsList.length}
            </span>
          </DropdownMenuLabel>
          {boardsList.length ? boardsList.map((b) => {
            const isActive = b.id === activeBoardId;
            const isSwitching = switchingBoardId === b.id;
            return (
              <DropdownMenuItem key={b.id} asChild>
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
                      window.dispatchEvent(new CustomEvent("board-switching", { detail: { targetBoardId: b.id } }));
                    } else if (switchingBoardId) {
                      setSwitchingBoardId(null);
                      window.dispatchEvent(new CustomEvent("board-switching", { detail: { targetBoardId: activeBoardId } }));
                    }
                  }}
                  className={cn(
                    "w-full",
                    isActive && "bg-theme-paper-strong font-semibold text-theme-foreground hover:bg-theme-paper-strong focus:bg-theme-paper-strong",
                    isSwitching && "animate-pulse"
                  )}
                >
                  {b.isPrivate ? <Lock className="h-3.5 w-3.5 shrink-0 text-stone-500" /> : <FolderKanban className="h-3.5 w-3.5 shrink-0 text-stone-500" />}
                  <span className="min-w-0 flex-1 truncate">{b.name}</span>
                  {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
                </Link>
              </DropdownMenuItem>
            );
          }) : (
            <DropdownMenuItem disabled>No boards yet</DropdownMenuItem>
          )}
          {canManage && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={!activeBoard} onSelect={() => setIsSettingsOpen(true)}>
                <Settings className="h-3.5 w-3.5 text-stone-500" />
                Board settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsCreateBoardOpen(true)}>
                <Plus className="h-3.5 w-3.5 text-stone-500" />
                Create new board
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeBoard && canManage && (
        <BoardSettingsModal
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          projectId={projectId}
          boardId={activeBoard.id}
          boardName={activeBoard.name}
          isPrivate={activeBoard.isPrivate}
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
            router.refresh();
          }}
          onDeleted={() => {
            setIsSettingsOpen(false);
            const remaining = boardsList.filter((b) => b.id !== activeBoard.id);
            setBoardsList(remaining);
            if (remaining.length > 0) {
              router.push(`/project/${projectId}/board?boardId=${remaining[0].id}`);
            } else {
              router.push(`/project/${projectId}/board`);
            }
            router.refresh();
          }}
        />
      )}

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
          <form onSubmit={handleCreateBoard} className="max-h-[calc(100dvh-2rem)] space-y-3.5 overflow-y-auto rounded-2xl border border-theme-border bg-theme-panel p-4 text-theme-foreground shadow-2xl sm:p-5">
            <div>
              <h3 id="create-board-modal-title" className="flex items-center gap-2 text-lg font-semibold text-theme-foreground">
                <FolderKanban className="h-5 w-5 text-theme-accent" />
                Create New Board
              </h3>
              <p className="mt-1 text-xs text-theme-muted">
                Add a new board channel to organize tasks in this project.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-theme-foreground">Board Name</label>
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
    </>
  );
}
