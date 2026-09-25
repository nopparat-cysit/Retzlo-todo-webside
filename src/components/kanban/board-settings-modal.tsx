"use client";

import { FormEvent, useEffect, useState, useMemo, useRef } from "react";
import { Lock, Settings, X } from "lucide-react";

import { AppModal } from "@/components/ui/app-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BoardGeneralTab,
  BoardAccessTab,
  BoardColumnsTab,
  BoardDangerTab,
  type BoardColumnInfo,
  type BoardMemberInfo
} from "./board-settings";

export type { BoardColumnInfo, BoardMemberInfo };

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

const EMPTY_MEMBERS: string[] = [];
const EMPTY_COLUMNS: BoardColumnInfo[] = [];

export function BoardSettingsModal({
  open,
  onClose,
  projectId,
  boardId,
  boardName,
  isPrivate: initialIsPrivate,
  memberUserIds: initialMemberUserIds = EMPTY_MEMBERS,
  columnsPreview: initialColumns = EMPTY_COLUMNS,
  canManage = true,
  onSaved,
  onDeleted
}: BoardSettingsModalProps) {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<string>("general");
  const [name, setName] = useState(boardName);
  const [baseName, setBaseName] = useState(boardName);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [baseIsPrivate, setBaseIsPrivate] = useState(initialIsPrivate);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(initialMemberUserIds);
  const [baseMemberIds, setBaseMemberIds] = useState<string[]>(initialMemberUserIds);

  const [projectMembers, setProjectMembers] = useState<BoardMemberInfo[]>([]);
  const [columns, setColumns] = useState<BoardColumnInfo[]>(initialColumns);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prevOpenRef = useRef(false);
  const prevBoardIdRef = useRef(boardId);

  // Sync state ONLY when modal transitions to open or boardId changes
  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    const boardChanged = open && prevBoardIdRef.current !== boardId;

    if (justOpened || boardChanged) {
      setName(boardName);
      setBaseName(boardName);
      setIsPrivate(initialIsPrivate);
      setBaseIsPrivate(initialIsPrivate);
      setSelectedMemberIds(initialMemberUserIds);
      setBaseMemberIds(initialMemberUserIds);
      setColumns(initialColumns);
      setError(null);
      setActiveTab("general");
      setMemberSearchQuery("");
    }

    prevOpenRef.current = open;
    prevBoardIdRef.current = boardId;
  }, [open, boardId, boardName, initialIsPrivate, initialMemberUserIds, initialColumns]);

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
        setName((prev) => (prev === boardName || !prev.trim() ? (boardData.board.name || prev) : prev));
        setBaseName(boardData.board.name || boardName);

        if (typeof boardData.board.isPrivate === "boolean") {
          setIsPrivate(boardData.board.isPrivate);
          setBaseIsPrivate(boardData.board.isPrivate);
        }

        if (Array.isArray(boardData.board.members)) {
          const fetchedMemberIds = boardData.board.members.map((m: { userId: string }) => m.userId);
          setSelectedMemberIds(fetchedMemberIds);
          setBaseMemberIds(fetchedMemberIds);
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
  }, [open, projectId, boardId, boardName]);

  const isDirty = useMemo(() => {
    if (name.trim() !== baseName.trim()) return true;
    if (isPrivate !== baseIsPrivate) return true;
    const currentSet = new Set(selectedMemberIds);
    const baseSet = new Set(baseMemberIds);
    if (currentSet.size !== baseSet.size) return true;
    for (const id of currentSet) {
      if (!baseSet.has(id)) return true;
    }
    return false;
  }, [name, baseName, isPrivate, baseIsPrivate, selectedMemberIds, baseMemberIds]);

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
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("board-renamed", {
            detail: { id: boardId, name: data.board.name }
          })
        );
      }
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
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-stone-200/80 pb-4 dark:border-white/10">
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
                    <span className="inline-flex items-center gap-1 rounded-full border border-stone-200/80 bg-stone-100/80 px-2 py-0.2 text-[9px] font-medium text-stone-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400">
                      Public
                    </span>
                  )}
                </div>
                <h2 id="board-settings-title" className="mt-0.5 text-xl font-bold text-stone-900 truncate max-w-sm sm:max-w-md dark:text-white">
                  {boardName}
                </h2>
              </div>
            </div>

            <button
              className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-100"
              type="button"
              onClick={onClose}
              aria-label="Close board settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full bg-stone-100/90 border border-stone-200/90 p-1 rounded-xl dark:border-white/10 dark:bg-white/[0.03]">
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
                <span className="ml-1.5 rounded-full bg-stone-200/80 px-1.5 text-[10px] font-mono text-stone-700 dark:bg-white/10 dark:text-stone-300">
                  {columns.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="danger" className="text-xs py-1.5 text-red-500 hover:text-red-600 data-[state=active]:text-red-700 data-[state=active]:bg-red-50 dark:text-red-400 dark:data-[state=active]:text-red-300 dark:data-[state=active]:bg-red-400/15">
                Danger
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: General */}
            <TabsContent value="general">
              <BoardGeneralTab
                name={name}
                onNameChange={setName}
                isPrivate={isPrivate}
                onPrivacyChange={setIsPrivate}
                canManage={canManage}
                selectedMemberCount={selectedMemberIds.length}
                totalProjectMembersCount={projectMembers.length}
                onGoToAccessTab={() => setActiveTab("access")}
              />
            </TabsContent>

            {/* TAB 2: Access & Members */}
            <TabsContent value="access">
              <BoardAccessTab
                isPrivate={isPrivate}
                onSwitchToPrivate={() => setIsPrivate(true)}
                projectMembersCount={projectMembers.length}
                filteredMembers={filteredMembers}
                selectedMemberIds={selectedMemberIds}
                memberSearchQuery={memberSearchQuery}
                onSearchChange={setMemberSearchQuery}
                onToggleMember={toggleMember}
                onSelectAll={selectAllMembers}
                onClearAll={clearAllMembers}
              />
            </TabsContent>

            {/* TAB 3: Columns & Workflow */}
            <TabsContent value="columns">
              <BoardColumnsTab
                columns={columns}
                totalCards={totalCards}
              />
            </TabsContent>

            {/* TAB 4: Danger Zone */}
            <TabsContent value="danger">
              <BoardDangerTab
                boardName={boardName}
                canManage={canManage}
                isDeleting={isDeleting}
                onDeleteClick={() => setDeleteConfirmOpen(true)}
              />
            </TabsContent>
          </Tabs>

          {error ? <p className="mt-3 text-xs text-red-500 dark:text-red-400">{error}</p> : null}

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-stone-200/80 pt-3 dark:border-white/10">
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
