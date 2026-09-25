"use client";

import { FormEvent, useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  Check,
  CheckSquare,
  Columns,
  FolderKanban,
  Globe,
  Layers3,
  Lock,
  Search,
  Settings,
  Trash2,
  Users,
  X
} from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface BoardColumnInfo {
  id: string;
  name: string;
  position?: number;
  color?: string;
  icon?: string;
  defaultCardStatus?: string;
  wipLimit?: number | null;
  cardCount?: number;
}

export interface BoardMemberInfo {
  id: string;
  name: string | null;
  email: string;
  avatar?: string | null;
  role?: string;
}

export interface BoardSettingsModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  boardId: string;
  boardName: string;
  isPrivate: boolean;
  memberUserIds?: string[];
  columnsPreview?: BoardColumnInfo[];
  canManage?: boolean;
  onSaved?: (updated: { id: string; name: string; isPrivate: boolean; memberUserIds?: string[] }) => void;
  onDeleted?: (boardId: string) => void;
}

export function BoardSettingsModal({
  open,
  onClose,
  projectId,
  boardId,
  boardName,
  isPrivate: initialIsPrivate,
  memberUserIds: initialMemberUserIds = [],
  columnsPreview: initialColumns = [],
  canManage = true,
  onSaved,
  onDeleted
}: BoardSettingsModalProps) {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<string>("general");
  const [name, setName] = useState(boardName);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(initialMemberUserIds);

  const [projectMembers, setProjectMembers] = useState<BoardMemberInfo[]>([]);
  const [columns, setColumns] = useState<BoardColumnInfo[]>(initialColumns);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when props change
  useEffect(() => {
    if (open) {
      setName(boardName);
      setIsPrivate(initialIsPrivate);
      setSelectedMemberIds(initialMemberUserIds);
      setError(null);
      setActiveTab("general");
    }
  }, [open, boardName, initialIsPrivate, initialMemberUserIds]);

  // Fetch full board info and project members
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setIsLoadingDetails(true);

    Promise.all([
      fetch(`/api/projects/${projectId}/members`)
        .then((res) => (res.ok ? res.json() : { members: [] }))
        .catch(() => ({ members: [] })),
      fetch(`/api/boards/${boardId}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null)
    ]).then(([membersData, boardData]) => {
      if (!isMounted) return;
      setIsLoadingDetails(false);

      if (membersData?.members) {
        setProjectMembers(membersData.members);
      }

      if (boardData?.board) {
        if (boardData.board.name) setName(boardData.board.name);
        if (typeof boardData.board.isPrivate === "boolean") setIsPrivate(boardData.board.isPrivate);

        if (Array.isArray(boardData.board.members)) {
          setSelectedMemberIds(boardData.board.members.map((m: { userId: string }) => m.userId));
        }

        if (Array.isArray(boardData.board.columns)) {
          setColumns(
            (boardData.board.columns as Array<BoardColumnInfo & { cards?: unknown[] }>).map((c) => ({
              id: c.id,
              name: c.name,
              position: c.position,
              color: c.color,
              icon: c.icon,
              defaultCardStatus: c.defaultCardStatus,
              wipLimit: c.wipLimit,
              cardCount: Array.isArray(c.cards) ? c.cards.length : 0
            }))
          );
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [open, projectId, boardId]);

  const isDirty = useMemo(() => {
    if (name.trim() !== boardName) return true;
    if (isPrivate !== initialIsPrivate) return true;
    const currentSet = new Set(selectedMemberIds);
    const initialSet = new Set(initialMemberUserIds);
    if (currentSet.size !== initialSet.size) return true;
    for (const id of currentSet) {
      if (!initialSet.has(id)) return true;
    }
    return false;
  }, [name, boardName, isPrivate, initialIsPrivate, selectedMemberIds, initialMemberUserIds]);

  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery.trim()) return projectMembers;
    const query = memberSearchQuery.toLowerCase();
    return projectMembers.filter(
      (m) => m.name?.toLowerCase().includes(query) || m.email.toLowerCase().includes(query)
    );
  }, [projectMembers, memberSearchQuery]);

  function toggleMember(userId: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  function selectAllMembers() {
    setSelectedMemberIds(projectMembers.map((m) => m.id));
  }

  function clearAllMembers() {
    setSelectedMemberIds([]);
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

    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          isPrivate,
          memberUserIds: isPrivate ? selectedMemberIds : []
        })
      });

      const data = await res.json();

      if (!res.ok || !data.board) {
        const msg = data.error ?? "Could not save board settings.";
        setError(msg);
        toast({ message: msg, type: "error" });
        return;
      }

      toast({ message: `Board "${data.board.name}" settings saved.`, type: "success" });
      if (onSaved) {
        onSaved({
          id: boardId,
          name: data.board.name,
          isPrivate: data.board.isPrivate,
          memberUserIds: isPrivate ? selectedMemberIds : []
        });
      }
      onClose();
    } catch {
      setError("An unexpected error occurred while saving board settings.");
      toast({ message: "Could not save board settings.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteBoard() {
    setIsDeleting(true);
    setDeleteConfirmOpen(false);

    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not delete board");
      }

      toast({ message: `Board "${name}" deleted.`, type: "success" });
      if (onDeleted) {
        onDeleted(boardId);
      }
      onClose();
    } catch (err) {
      toast({
        message: err instanceof Error ? err.message : "Failed to delete board",
        type: "error"
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const totalCards = useMemo(() => {
    return columns.reduce((acc, col) => acc + (col.cardCount ?? 0), 0);
  }, [columns]);

  return (
    <>
      <AppModal
        open={open}
        onClose={onClose}
        labelledBy="board-settings-title"
        contentClassName="max-w-2xl"
        hasUnsavedChanges={isDirty}
      >
        <form className="lofi-panel w-full rounded-2xl p-5 sm:p-6" onSubmit={handleSaveIntent}>
          {/* Header */}
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-dusk-amber/30 bg-dusk-amber/10 text-dusk-amber">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-dusk-amber">
                    Board Settings
                  </span>
                  {isPrivate ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-2 py-0.2 text-[9px] font-semibold text-dusk-amber">
                      <Lock className="h-2.5 w-2.5" />
                      Private
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.2 text-[9px] font-medium text-stone-400">
                      Public
                    </span>
                  )}
                </div>
                <h2 id="board-settings-title" className="mt-0.5 text-xl font-bold text-white truncate max-w-sm sm:max-w-md">
                  {boardName}
                </h2>
              </div>
            </div>

            <button
              className="rounded-md p-1.5 text-stone-400 hover:bg-white/10 hover:text-stone-100 transition"
              type="button"
              onClick={onClose}
              aria-label="Close board settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full bg-white/[0.03] border border-white/10 p-1 rounded-xl">
              <TabsTrigger value="general" className="text-xs py-1.5">
                General
              </TabsTrigger>
              <TabsTrigger value="access" className="text-xs py-1.5 relative">
                Access
                {isPrivate && (
                  <span className="ml-1.5 rounded-full bg-dusk-amber/20 px-1.5 text-[10px] font-mono text-dusk-amber font-semibold">
                    {selectedMemberIds.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="columns" className="text-xs py-1.5">
                Columns
                <span className="ml-1.5 rounded-full bg-white/10 px-1.5 text-[10px] font-mono">
                  {columns.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="danger" className="text-xs py-1.5 text-red-400 data-[state=active]:text-red-300 data-[state=active]:bg-red-400/15">
                Danger
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: General */}
            <TabsContent value="general" className="space-y-4 pt-3 mt-0">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="board-name-input" className="font-semibold text-stone-200">
                    Board Name
                  </label>
                  <span className="text-stone-500 font-mono text-[11px]">{name.length}/80</span>
                </div>
                <Input
                  id="board-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  required
                  placeholder="e.g. Sprint 1, Marketing Campaign, Backlog"
                  disabled={!canManage}
                />
              </div>

              {/* Privacy Selector */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-stone-200">Board Privacy & Access Mode</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Control who can discover, view, and interact with tasks on this board.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={!canManage}
                    onClick={() => setIsPrivate(false)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                      !isPrivate
                        ? "border-dusk-lavender/60 bg-dusk-lavender/15 text-white ring-1 ring-dusk-lavender/30"
                        : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-stone-300"
                    )}
                  >
                    <div className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                      !isPrivate ? "border-dusk-lavender/40 bg-dusk-lavender/20 text-dusk-lavender" : "border-white/10 bg-white/5 text-stone-500"
                    )}>
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-100">Public Workspace Board</p>
                      <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                        All workspace members can view and collaborate on this board.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={!canManage}
                    onClick={() => setIsPrivate(true)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                      isPrivate
                        ? "border-dusk-amber/60 bg-dusk-amber/15 text-white ring-1 ring-dusk-amber/30"
                        : "border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-stone-300"
                    )}
                  >
                    <div className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                      isPrivate ? "border-dusk-amber/40 bg-dusk-amber/20 text-dusk-amber" : "border-white/10 bg-white/5 text-stone-500"
                    )}>
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-100">Private Sub-Board</p>
                      <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                        Restricted board. Only specifically selected members have access.
                      </p>
                    </div>
                  </button>
                </div>

                {isPrivate && (
                  <div className="flex items-center justify-between rounded-lg border border-dusk-amber/20 bg-dusk-amber/5 px-3 py-2 text-xs text-dusk-amber">
                    <span className="font-medium">
                      🔒 Currently {selectedMemberIds.length} of {projectMembers.length} members granted access.
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("access")}
                      className="font-semibold underline hover:text-white transition"
                    >
                      Configure Members →
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: Access & Members */}
            <TabsContent value="access" className="space-y-3 pt-3 mt-0">
              {!isPrivate ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center">
                  <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl border border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender">
                    <Globe className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-200">This board is Public</h4>
                  <p className="mt-1 text-xs text-stone-400 max-w-sm mx-auto">
                    All {projectMembers.length} workspace members automatically have access to this board.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 text-xs"
                    onClick={() => {
                      setIsPrivate(true);
                    }}
                  >
                    <Lock className="h-3 w-3 mr-1.5 text-dusk-amber" />
                    Switch to Private to Restrict Access
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-stone-200">Board Members Access</p>
                      <p className="text-[11px] text-stone-400">
                        Select which workspace members can see and manage cards on this private board.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        onClick={selectAllMembers}
                      >
                        Select All
                      </Button>
                      <span className="text-stone-600">·</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        onClick={clearAllMembers}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

                  {/* Search members */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      placeholder="Search workspace members..."
                      className="h-8.5 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-xs text-stone-200 placeholder-stone-400 outline-none transition focus:border-dusk-lavender/50 focus:bg-white/[0.06]"
                    />
                  </div>

                  {/* Member list */}
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-soft rounded-xl border border-stone-200/90 bg-stone-100/70 p-2 dark:border-white/10 dark:bg-ink-950/40">
                    {filteredMembers.length === 0 ? (
                      <p className="py-4 text-center text-xs text-stone-500 font-mono">
                        {memberSearchQuery ? "No members match search." : "No workspace members found."}
                      </p>
                    ) : (
                      filteredMembers.map((m) => {
                        const isSelected = selectedMemberIds.includes(m.id);
                        return (
                          <div
                            key={m.id}
                            onClick={() => toggleMember(m.id)}
                            className={cn(
                              "flex items-center justify-between gap-3 rounded-lg border p-2 cursor-pointer transition select-none",
                              isSelected
                                ? "border-dusk-amber/40 bg-dusk-amber/15 text-stone-900 font-semibold dark:text-white"
                                : "border-stone-200/80 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50 dark:border-white/5 dark:bg-white/[0.02] dark:text-stone-400 dark:hover:border-white/15 dark:hover:bg-white/[0.04]"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar
                                src={m.avatar}
                                initials={m.name?.[0] || m.email[0]}
                                name={m.name || m.email}
                                size={28}
                              />
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-stone-200">
                                  {m.name || m.email.split("@")[0]}
                                </p>
                                <p className="truncate text-[10px] text-stone-500">{m.email}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {m.role && (
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.2 text-[9px] font-mono text-stone-400">
                                  {m.role}
                                </span>
                              )}
                              <div className={cn(
                                "grid h-5 w-5 place-items-center rounded border transition",
                                isSelected
                                  ? "border-dusk-amber bg-dusk-amber text-ink-950"
                                  : "border-white/20 bg-white/5"
                              )}>
                                {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 3: Columns & Workflow */}
            <TabsContent value="columns" className="space-y-3 pt-3 mt-0">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-stone-200">Board Workflow Stages</p>
                  <p className="text-[11px] text-stone-400">
                    Overview of columns, card limits, and stages configured on this board.
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-right font-mono text-[11px] text-stone-300">
                  Total: {totalCards} {totalCards === 1 ? "card" : "cards"}
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-stone-200/90 bg-stone-100/70 p-2.5 max-h-60 overflow-y-auto scrollbar-soft dark:border-white/10 dark:bg-ink-950/40">
                {columns.length === 0 ? (
                  <p className="py-6 text-center text-xs text-stone-500 font-mono">
                    No columns found on this board.
                  </p>
                ) : (
                  columns.map((col, index) => (
                    <div
                      key={col.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-stone-200/80 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.025]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-white/5 font-mono text-[10px] text-stone-400">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-stone-200 truncate">{col.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-stone-500">
                            <span>Status: {col.defaultCardStatus ?? "TODO"}</span>
                            {col.wipLimit ? (
                              <span className="text-dusk-amber font-semibold">
                                · WIP Limit: {col.wipLimit}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-stone-300 font-semibold">
                          {col.cardCount ?? 0} cards
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <p className="text-[11px] text-stone-500 italic">
                Tip: You can reorder, rename, or configure column WIP limits directly on the Kanban board view.
              </p>
            </TabsContent>

            {/* TAB 4: Danger Zone */}
            <TabsContent value="danger" className="pt-3 mt-0">
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-500/40 bg-red-500/20 text-red-300">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-200">Delete this Board</h4>
                    <p className="text-xs text-red-300/80 mt-1 leading-relaxed">
                      Permanently remove &ldquo;{boardName}&rdquo; along with all its columns, cards, checklist items, and comments. This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-red-500/20 flex justify-end">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="text-xs font-semibold"
                    disabled={!canManage || isDeleting}
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete Board
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
            <span className="text-[11px] text-stone-500">
              {isDirty ? "• Unsaved changes" : "All changes saved"}
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={isSaving || !name.trim() || !canManage}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </form>
      </AppModal>

      {/* Confirm Save Modal */}
      <ConfirmModal
        open={confirmSaveOpen}
        title="Save board changes"
        message={`Are you sure you want to save changes to "${name.trim() || boardName}"?`}
        confirmLabel="Save Changes"
        isLoading={isSaving}
        variant="default"
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={handleSave}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={deleteConfirmOpen}
        title={`Delete "${boardName}"`}
        message={`This will permanently delete the board "${boardName}" and all of its tasks. To confirm, please type the board name below.`}
        confirmLabel="Delete Board"
        variant="danger"
        validateText={boardName}
        validatePlaceholder={`Type "${boardName}" to confirm`}
        isLoading={isDeleting}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteBoard}
      />
    </>
  );
}
