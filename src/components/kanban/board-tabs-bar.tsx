"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderKanban, Lock, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { BoardSettingsModal } from "@/components/kanban/board-settings-modal";

interface BoardTabItem {
  id: string;
  name: string;
  isPrivate: boolean;
}

interface BoardTabsBarProps {
  projectId: string;
  projectName?: string;
  boards: BoardTabItem[];
  activeBoardId: string;
  canManage?: boolean;
}

export function BoardTabsBar({
  projectId,
  projectName,
  boards,
  activeBoardId,
  canManage = false
}: BoardTabsBarProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [boardsList, setBoardsList] = useState<BoardTabItem[]>(boards);
  const [switchingBoardId, setSwitchingBoardId] = useState<string | null>(null);

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

  if (boardsList.length <= 1 && !canManage) {
    return null;
  }

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
          isPrivate: false
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create board");
      }

      setBoardsList((prev) => [...prev, data.board]);
      setIsCreateBoardOpen(false);
      setNewBoardName("");
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
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3">
        {/* Scrollable Tabs */}
        <div className="scrollbar-soft flex items-center gap-1.5 overflow-x-auto min-w-0 pr-2">
          {projectName ? (
            <div className="flex items-center gap-1.5 text-xs shrink-0 mr-2">
              <span className="font-semibold text-stone-100 truncate max-w-[130px] sm:max-w-[180px] select-text" title={projectName}>
                {projectName}
              </span>
              <span className="text-stone-600 font-mono select-none">/</span>
              <span className="text-[10px] uppercase tracking-wider text-dusk-amber/90 font-mono select-none font-semibold">
                Boards:
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-dusk-amber/90 font-mono select-none mr-2 shrink-0 font-semibold">
              <FolderKanban className="h-3.5 w-3.5 text-dusk-amber" />
              <span>Boards:</span>
            </div>
          )}
          {boardsList.map((b) => {
            const isSwitching = switchingBoardId === b.id;
            const isActive = (b.id === activeBoardId && !switchingBoardId) || isSwitching;

            return (
              <div
                key={b.id}
                className={cn(
                  "group flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all select-none",
                  isActive
                    ? "border-dusk-amber/50 bg-dusk-amber/15 text-dusk-amber shadow-[0_0_12px_rgba(249,199,132,0.12)] font-semibold"
                    : "border-white/10 bg-white/[0.04] text-stone-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white",
                  isSwitching && "animate-pulse ring-1 ring-dusk-amber/40"
                )}
              >
                <Link
                  href={`/project/${projectId}/board?boardId=${b.id}`}
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
                        new CustomEvent("board-switching", {
                          detail: { targetBoardId: b.id }
                        })
                      );
                    } else if (switchingBoardId) {
                      setSwitchingBoardId(null);
                      window.dispatchEvent(
                        new CustomEvent("board-switching", {
                          detail: { targetBoardId: activeBoardId }
                        })
                      );
                    }
                  }}
                  className="flex items-center gap-1.5 min-w-0"
                >
                  {b.isPrivate ? (
                    <Lock className={cn("h-3 w-3 shrink-0", isActive ? "text-dusk-amber" : "text-stone-400")} />
                  ) : (
                    <FolderKanban className={cn("h-3 w-3 shrink-0", isActive ? "text-dusk-amber" : "text-stone-400")} />
                  )}
                  <span className="truncate max-w-[140px] select-text">{b.name}</span>
                </Link>

              </div>
            );
          })}

          {/* Action Icons right after boards (ต่อหลัง) */}
          {canManage && (
            <div className="flex items-center gap-1 shrink-0 ml-0.5">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-stone-400 hover:border-dusk-lavender/50 hover:bg-dusk-lavender/15 hover:text-dusk-lavender transition-all cursor-pointer shadow-xs active:scale-95"
                title="Board Settings (ตั้งค่าบอร์ด)"
                aria-label="Board Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsCreateBoardOpen(true)}
                className="grid h-8 w-8 place-items-center rounded-lg border border-dashed border-white/20 bg-white/[0.03] text-stone-400 hover:border-dusk-amber/60 hover:bg-dusk-amber/15 hover:text-dusk-amber transition-all cursor-pointer shadow-xs active:scale-95"
                title="Create new board (สร้างบอร์ดใหม่)"
                aria-label="Create new board"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

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
            }
          }}
          labelledBy="create-board-modal-title"
        >
          <form onSubmit={handleCreateBoard} className="space-y-4 p-5 sm:p-6">
            <div>
              <h3 id="create-board-modal-title" className="text-lg font-semibold text-stone-100 flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-dusk-amber" />
                Create New Board
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Add a new board channel to organize tasks in this project.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-300 mb-1.5 block">Board Name</label>
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
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsCreateBoardOpen(false);
                  setNewBoardName("");
                }}
                disabled={isCreatingBoard}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newBoardName.trim() || isCreatingBoard}
                className="bg-dusk-amber text-ink-950 hover:bg-dusk-amber/90 font-semibold"
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

