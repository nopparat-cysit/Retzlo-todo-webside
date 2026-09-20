"use client";

import { useState } from "react";
import { FolderKanban, Globe, Lock, MoreVertical, Plus, Trash2, Users, Edit3, Check, X, Sparkles, Settings } from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { BoardSummary } from "@/types/kanban";
import { BoardSettingsModal } from "@/components/kanban/board-settings-modal";

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
}

export function ProjectBoardsManager({
  projectId,
  canManage,
  initialBoards,
  projectMembers
}: ProjectBoardsManagerProps) {
  const [boards, setBoards] = useState<BoardSummary[]>(initialBoards);
  const { toast } = useToast();

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
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
          memberUserIds: newIsPrivate ? newMemberIds : []
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not create sub-project");
      }

      setBoards((prev) => [...prev, data.board]);
      setIsCreateOpen(false);
      setNewBoardName("");
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
    <section className="lofi-panel rounded-2xl p-5 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Multi-Board</p>
          <h2 className="mt-1 text-lg font-semibold text-stone-100 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-dusk-lavender" />
            Sub-projects & Boards
          </h2>
          <p className="mt-0.5 text-xs text-stone-400">
            Manage separate project boards and configure member visibility per board.
          </p>
        </div>

        {canManage && (
          <Button
            type="button"
            className="text-xs shrink-0 self-start sm:self-auto"
            onClick={() => {
              setNewBoardName("");
              setNewIsPrivate(false);
              setNewMemberIds([]);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Sub-project
          </Button>
        )}
      </div>

      {/* Boards List */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
        {boards.map((b) => {
          const isOnlyBoard = boards.length <= 1;
          const memberCount = b.members?.length ?? b.memberUserIds?.length ?? 0;

          return (
            <div
              key={b.id}
              className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.035] p-4 transition-all hover:border-dusk-lavender/40 hover:bg-white/[0.05]"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-stone-100 text-sm truncate" title={b.name}>
                    {b.name}
                  </h3>
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
                        <div
                          key={m.userId}
                          className="grid h-5 w-5 place-items-center rounded-full border border-stone-800 bg-dusk-lavender/30 text-[9px] font-bold text-stone-200"
                          title={m.user.name ?? m.user.email}
                        >
                          {(m.user.name?.[0] ?? m.user.email[0]).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    {b.members.length > 4 && (
                      <span className="text-[10px] text-stone-500">+{b.members.length - 4}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              {canManage && (
                <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-white/5 pt-3">
                  <button
                    type="button"
                    onClick={() => setDetailedSettingsBoard(b)}
                    className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-dusk-amber transition hover:bg-dusk-amber/10"
                    title="Detailed board settings"
                  >
                    <Settings className="h-3 w-3" />
                    Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingBoard(b);
                      setEditName(b.name);
                    }}
                    className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-stone-400 transition hover:bg-white/10 hover:text-stone-200"
                    title="Rename board"
                  >
                    <Edit3 className="h-3 w-3" />
                    Rename
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccessBoard(b);
                      setAccessIsPrivate(b.isPrivate);
                      setAccessMemberIds(b.memberUserIds ?? b.members?.map((m) => m.userId) ?? []);
                    }}
                    className="flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-medium text-dusk-lavender transition hover:bg-dusk-lavender/10"
                    title="Configure member access"
                  >
                    <Users className="h-3 w-3" />
                    Access
                  </button>

                  {!isOnlyBoard && (
                    <button
                      type="button"
                      onClick={() => setDeletingBoard(b)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-stone-500 transition hover:bg-dusk-rose/10 hover:text-dusk-rose"
                      title="Delete board"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal 1: Create Sub-project */}
      {isCreateOpen && (
        <AppModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          labelledBy="create-board-modal-title"
          contentClassName="lofi-panel w-full max-w-md rounded-2xl p-5"
        >
          <form onSubmit={handleCreateBoard} className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-dusk-amber">Sub-project</p>
              <h3 id="create-board-modal-title" className="text-xl font-semibold text-stone-100 mt-0.5">
                Create Sub-project Board
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Add a new Kanban workspace lane for your team.
              </p>
            </div>

            <label className="block space-y-1.5 text-sm text-stone-300">
              <span>Board name</span>
              <Input
                autoFocus
                required
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="e.g. Mobile App, Design System, Marketing..."
              />
            </label>

            {/* Privacy Selection */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Access Visibility
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewIsPrivate(false)}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-3 text-left transition",
                    !newIsPrivate
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
                  onClick={() => setNewIsPrivate(true)}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-3 text-left transition",
                    newIsPrivate
                      ? "border-dusk-amber/60 bg-dusk-amber/15 text-dusk-amber"
                      : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20"
                  )}
                >
                  <Lock className="h-4 w-4 mb-1" />
                  <span className="text-xs font-semibold">Private Board</span>
                  <span className="text-[10px] text-stone-500 leading-tight mt-0.5">
                    Only selected members can see
                  </span>
                </button>
              </div>
            </div>

            {/* Member Checkboxes if Private */}
            {newIsPrivate && (
              <div className="space-y-2 border-t border-white/10 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-300">Grant Access to Members</span>
                  <span className="text-stone-500">{newMemberIds.length} selected</span>
                </div>
                <div className="scrollbar-soft max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-white/10 bg-black/20 p-2">
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
                            ? "bg-dusk-amber/15 text-dusk-amber font-medium"
                            : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[9px] font-bold">
                            {(m.user.name?.[0] ?? m.user.email[0]).toUpperCase()}
                          </div>
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
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button disabled={!newBoardName.trim() || isCreating}>
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
                          <div className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[9px] font-bold">
                            {(m.user.name?.[0] ?? m.user.email[0]).toUpperCase()}
                          </div>
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
