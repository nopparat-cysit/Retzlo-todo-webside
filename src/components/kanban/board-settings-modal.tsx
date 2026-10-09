"use client";

import { FormEvent, useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Layers, Lock, Settings, Sparkles, X, Zap } from "lucide-react";

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
import { BoardPrioritiesTab } from "./board-priorities-tab";
import { BoardAttributesTab } from "./board-attributes-tab";
import { resolveBoardPriorities } from "@/lib/kanban/priority";
import type { CustomPriority } from "@/types/kanban";

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
  customPriorities?: CustomPriority[] | null;
  defaultTab?: string;
  canManage?: boolean;
  onSaved?: (updated: {
    id: string;
    name: string;
    isPrivate: boolean;
    memberUserIds?: string[];
    customPriorities?: CustomPriority[] | null;
  }) => void;
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
  customPriorities: initialCustomPriorities,
  defaultTab = "general",
  canManage = true,
  onSaved,
  onDeleted
}: BoardSettingsModalProps) {
  const { toast } = useToast();

  const resolveTabState = (tabInput?: string): { tab: string; subTab: "status" | "priority" | "story-points" } => {
    if (tabInput === "priorities" || tabInput === "priority") {
      return { tab: "attributes", subTab: "priority" };
    }
    if (tabInput === "statuses" || tabInput === "status") {
      return { tab: "attributes", subTab: "status" };
    }
    if (tabInput === "story-points" || tabInput === "points") {
      return { tab: "attributes", subTab: "story-points" };
    }
    if (tabInput === "attributes") {
      return { tab: "attributes", subTab: "status" };
    }
    if (tabInput === "access") {
      return { tab: "general", subTab: "status" };
    }
    return { tab: tabInput || "general", subTab: "status" };
  };

  const initialTabState = resolveTabState(defaultTab);
  const [activeTab, setActiveTab] = useState<string>(initialTabState.tab);
  const [attributeSubTab, setAttributeSubTab] = useState<"status" | "priority" | "story-points">(initialTabState.subTab);
  const [name, setName] = useState(boardName);
  const [baseName, setBaseName] = useState(boardName);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [baseIsPrivate, setBaseIsPrivate] = useState(initialIsPrivate);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(initialMemberUserIds);
  const [baseMemberIds, setBaseMemberIds] = useState<string[]>(initialMemberUserIds);

  const [priorities, setPriorities] = useState<CustomPriority[]>(() => resolveBoardPriorities(initialCustomPriorities));
  const [basePriorities, setBasePriorities] = useState<CustomPriority[]>(() => resolveBoardPriorities(initialCustomPriorities));

  const [projectMembers, setProjectMembers] = useState<BoardMemberInfo[]>([]);
  const [columns, setColumns] = useState<BoardColumnInfo[]>(initialColumns);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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
      const resolved = resolveBoardPriorities(initialCustomPriorities);
      setPriorities(resolved);
      setBasePriorities(resolved);
      setError(null);
      const nextTabState = resolveTabState(defaultTab);
      setActiveTab(nextTabState.tab);
      setAttributeSubTab(nextTabState.subTab);
      setMemberSearchQuery("");
    }

    prevOpenRef.current = open;
    prevBoardIdRef.current = boardId;
  }, [open, boardId, boardName, initialIsPrivate, initialMemberUserIds, initialColumns, initialCustomPriorities, defaultTab]);

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

        if (boardData.board.customPriorities !== undefined) {
          const fetchedPriorities = resolveBoardPriorities(boardData.board.customPriorities);
          setPriorities(fetchedPriorities);
          setBasePriorities(fetchedPriorities);
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
    if (JSON.stringify(priorities) !== JSON.stringify(basePriorities)) return true;
    const currentSet = new Set(selectedMemberIds);
    const baseSet = new Set(baseMemberIds);
    if (currentSet.size !== baseSet.size) return true;
    for (const id of currentSet) {
      if (!baseSet.has(id)) return true;
    }
    return false;
  }, [name, baseName, isPrivate, baseIsPrivate, selectedMemberIds, baseMemberIds, priorities, basePriorities]);

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

  async function handleSaveIntent(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || isSaving) return;

    setError(null);
    setIsSaving(true);

    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          isPrivate,
          memberUserIds: isPrivate ? selectedMemberIds : [],
          customPriorities: priorities
        })
      });

      const data = await res.json();

      if (!res.ok || !data.board) {
        const msg = data.error ?? "Could not save board settings.";
        setError(msg);
        toast({ message: msg, type: "error" });
        return;
      }

      toast({ message: `Board "${data.board.name}" settings saved successfully`, type: "success" });
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("board-renamed", {
            detail: { id: boardId, name: data.board.name }
          })
        );
        window.dispatchEvent(
          new CustomEvent("board-priorities-updated", {
            detail: { boardId, customPriorities: data.board.customPriorities }
          })
        );
      }
      if (onSaved) {
        onSaved({
          id: boardId,
          name: data.board.name,
          isPrivate: data.board.isPrivate,
          memberUserIds: isPrivate ? selectedMemberIds : [],
          customPriorities: data.board.customPriorities
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

      toast({ message: `Board "${name}" deleted successfully`, type: "success" });
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
        contentClassName="max-w-4xl lg:max-w-5xl w-full my-auto overflow-hidden rounded-2xl shadow-2xl p-0 border border-theme-border"
        hasUnsavedChanges={isDirty}
      >
        <form
          className="lofi-panel flex flex-col w-full h-[88vh] sm:h-[82vh] max-h-[720px] min-h-[500px] rounded-2xl overflow-hidden p-0 border-0 shadow-none bg-theme-panel text-theme-foreground"
          onSubmit={handleSaveIntent}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-theme-border shrink-0 flex items-center justify-between gap-3 bg-theme-panel/90 backdrop-blur-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-dusk-amber/30 bg-dusk-amber/10 text-dusk-amber">
                <Settings className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
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
                <h2 id="board-settings-title" className="mt-0.5 text-base sm:text-lg font-bold text-stone-900 truncate max-w-xs sm:max-w-md dark:text-white">
                  {boardName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {projectId && (
                <Link
                  href={`/project/${projectId}/settings?tab=board-general&boardId=${boardId}`}
                  onClick={onClose}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-dusk-lavender mr-1"
                >
                  <span>Open Full Settings ↗</span>
                </Link>
              )}
              <button
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-100 cursor-pointer"
                type="button"
                onClick={onClose}
                aria-label="Close board settings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Master-Detail Layout */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden w-full">
            {/* Left Sidebar */}
            <aside className="w-full md:w-52 lg:w-56 shrink-0 border-b md:border-b-0 md:border-r border-stone-200/80 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.015] p-3 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-2.5">
                <div className="hidden md:block px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                  Board Settings
                </div>
                <TabsList className="flex flex-row md:flex-col w-full bg-stone-100/70 border border-stone-200/60 p-1 rounded-xl dark:border-white/5 dark:bg-white/[0.02] gap-1 h-auto overflow-x-auto md:overflow-visible">
                  <TabsTrigger
                    value="general"
                    className="w-full justify-start text-xs py-2 px-2.5 font-medium transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>⚙️</span>
                      <span>General &amp; Access</span>
                    </span>
                    {isPrivate && (
                      <span className="ml-auto rounded-full bg-dusk-amber/20 px-1.5 text-[10px] font-mono text-dusk-amber font-semibold">
                        {selectedMemberIds.length}
                      </span>
                    )}
                  </TabsTrigger>

                  <TabsTrigger
                    value="columns"
                    className="w-full justify-start text-xs py-2 px-2.5 font-medium transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>📋</span>
                      <span>Columns</span>
                    </span>
                    <span className="ml-auto rounded-full bg-stone-200/80 px-1.5 text-[10px] font-mono text-stone-700 dark:bg-white/10 dark:text-stone-300 font-semibold">
                      {columns.length}
                    </span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="attributes"
                    className="w-full justify-start text-xs py-2 px-2.5 font-medium transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>🏷️</span>
                      <span>Card Attributes</span>
                    </span>
                    <span className="ml-auto rounded-full bg-indigo-500/15 px-1.5 text-[10px] font-mono text-indigo-700 dark:bg-dusk-lavender/20 dark:text-dusk-lavender font-semibold">
                      {priorities.length}
                    </span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="danger"
                    className="w-full justify-start text-xs py-2 px-2.5 font-medium text-red-500 hover:text-red-600 data-[state=active]:text-red-700 data-[state=active]:bg-red-50 dark:text-red-400 dark:data-[state=active]:text-red-300 dark:data-[state=active]:bg-red-400/15 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Danger Zone</span>
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Link to Full Page Settings */}
              {projectId && (
                <div className="hidden md:block pt-2 border-t border-stone-200/70 dark:border-white/5 mt-3">
                  <Link
                    href={`/project/${projectId}/settings?tab=board-general&boardId=${boardId}`}
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-dusk-lavender dark:hover:text-white transition group"
                  >
                    <span>Open Full View</span>
                    <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )}
            </aside>

            {/* Right Content Pane */}
            <div className="flex-1 min-h-0 min-w-0 p-4 sm:p-5 overflow-y-auto scrollbar-soft space-y-4">
              {/* TAB 1: General & Access */}
              <TabsContent value="general" className="mt-0">
                <BoardGeneralTab
                  name={name}
                  onNameChange={setName}
                  isPrivate={isPrivate}
                  onPrivacyChange={setIsPrivate}
                  canManage={canManage}
                  selectedMemberCount={selectedMemberIds.length}
                  totalProjectMembersCount={projectMembers.length}
                  projectMembers={projectMembers}
                  filteredMembers={filteredMembers}
                  selectedMemberIds={selectedMemberIds}
                  memberSearchQuery={memberSearchQuery}
                  onSearchChange={setMemberSearchQuery}
                  onToggleMember={toggleMember}
                  onSelectAll={selectAllMembers}
                  onClearAll={clearAllMembers}
                />
              </TabsContent>

              {/* TAB 2: Card Attributes (Status, Priority, Story Points) */}
              <TabsContent value="attributes" className="mt-0">
                <BoardAttributesTab
                  boardId={boardId}
                  canManage={canManage}
                  priorities={priorities}
                  onPrioritiesChange={setPriorities}
                  initialSubTab={attributeSubTab}
                />
              </TabsContent>

              {/* Backward-compat alias for direct priorities tab */}
              <TabsContent value="priorities" className="mt-0">
                <BoardAttributesTab
                  boardId={boardId}
                  canManage={canManage}
                  priorities={priorities}
                  onPrioritiesChange={setPriorities}
                  initialSubTab="priority"
                />
              </TabsContent>

              {/* TAB 3: Workflow Stages */}
              <TabsContent value="columns" className="mt-0">
                <BoardColumnsTab
                  columns={columns}
                  totalCards={totalCards}
                  projectId={projectId}
                  boardId={boardId}
                  canManage={canManage}
                  onColumnsChange={setColumns}
                />
              </TabsContent>

              {/* TAB 4: Danger Zone */}
              <TabsContent value="danger" className="mt-0">
                <BoardDangerTab
                  boardName={boardName}
                  canManage={canManage}
                  isDeleting={isDeleting}
                  onDeleteClick={() => setDeleteConfirmOpen(true)}
                />
              </TabsContent>

              {error ? <p className="mt-3 text-xs text-red-500 dark:text-red-400">{error}</p> : null}
            </div>
          </Tabs>

          {/* Footer Actions */}
          <div className="px-5 py-3 border-t border-stone-200/80 dark:border-white/10 shrink-0 flex items-center justify-between gap-3 bg-stone-50/70 dark:bg-stone-900/60">
            <span className="text-[11px] text-stone-500">
              {isDirty ? "• Unsaved changes pending" : "All changes saved"}
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button disabled={isSaving || !name.trim() || !canManage} className="min-w-[120px]">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </AppModal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={deleteConfirmOpen}
        title={`Confirm Deletion of Board "${boardName}"`}
        message={`Deleting this board will permanently remove all tasks, columns, and checklists in it. To confirm, type the board name below.`}
        confirmLabel="Permanently Delete Board"
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
