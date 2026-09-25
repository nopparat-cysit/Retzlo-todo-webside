"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CalendarClock, Check, CheckSquare, Edit3, Plus, Search, RotateCcw, Clock, Sparkles, User, Users, UserX, X } from "lucide-react";
import { FormEvent, useState, useEffect, useRef, useMemo, useCallback } from "react";

import { useLiveSync } from "@/hooks/use-live-sync";
import { useSearchParams } from "next/navigation";
import { CardModal } from "@/components/kanban/card-modal";
import { createKanbanCollisionDetection } from "@/lib/kanban/kanban-collision";
import { KanbanColumn } from "@/components/kanban/column";
import { ColumnIconPicker } from "@/components/kanban/column-icon-picker";
import { ColumnStatusPicker } from "@/components/kanban/column-status-picker";
import { triggerCelebration } from "@/components/kanban/card-celebration";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { AssigneeAvatar } from "@/components/kanban/assignee-avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import { formatMediumDateTime } from "@/lib/date-format";
import {
  columnThemeOptions,
  getColumnIconOption,
  getColumnThemeOption,
  type ColumnIconId,
  type ColumnThemeId
} from "@/lib/kanban/column-settings";
import { moveCard, reorderColumns, type MoveCardInput } from "@/lib/kanban/reorder";
import { createCardDragSession, getCardDropTarget, prepareCardMove, type CardDragSession } from "@/lib/kanban/drag-session";
import { createBoardSyncGuard, runBoardReorder } from "@/lib/kanban/board-sync";
import { extractAssigneeIds, filterCardsByAssignee, resolveAssignees } from "@/lib/kanban/assignees";
import { extractStartDate, extractStartDateAllDay } from "@/lib/kanban/due-date";
import { getStatusMeta } from "@/lib/kanban/status";
import { getCardColorMeta, normalizeCardColor } from "@/lib/theme/card-colors";
import { playCardDoneSound, playCardCreateSound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { areColumnsEqual } from "@/lib/kanban/column-equality";
import { extractDifficulty, type DifficultyScore } from "@/lib/kanban/difficulty";
import type { Card, CardAssignee, CardStatus, ChecklistItem, ColumnWithCards } from "@/types/kanban";

interface BoardData {
  id: string;
  name: string;
  projectId?: string;
  columns: ColumnWithCards[];
}

interface MoveAction {
  cardId: string;
  title: string;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceIndex: number;
  destinationIndex: number;
}

function normalizeColumn(column: ColumnWithCards, members: CardAssignee[] = []): ColumnWithCards {
  return {
    ...column,
    color: getColumnThemeOption(column.color).id,
    icon: getColumnIconOption(column.icon).id,
    defaultCardStatus: column.defaultCardStatus ?? "TODO",
    wipLimit: column.wipLimit ?? null,
    cards: column.cards.map((c) => normalizeCard(c, members))
  };
}

export function KanbanBoard({
  board,
  members = [],
  currentUserId
}: {
  board: BoardData;
  members?: CardAssignee[];
  currentUserId?: string;
}) {
  const searchParams = useSearchParams();
  const cardIdFromUrl = searchParams.get("cardId");
  const [selectedCardFromUrl, setSelectedCardFromUrl] = useState<Card | null>(null);
  const [columns, setColumns] = useState(() => board.columns.map((col) => normalizeColumn(col, members)));

  useEffect(() => {
    if (cardIdFromUrl && columns.length > 0) {
      for (const col of columns) {
        const found = col.cards.find((c) => c.id === cardIdFromUrl);
        if (found) {
          setSelectedCardFromUrl(found);
          break;
        }
      }
    }
  }, [cardIdFromUrl, columns]);
  const columnsRef = useRef(columns);
  columnsRef.current = columns;
  const dragSnapshotRef = useRef<ColumnWithCards[] | null>(null);
  const dragSessionRef = useRef<CardDragSession | null>(null);
  const lastCardDropTargetRef = useRef<MoveCardInput | null>(null);
  const syncGuard = useMemo(() => createBoardSyncGuard(), []);
  const [isSavingReorder, setIsSavingReorder] = useState(false);
  const applyColumns = useCallback((next: ColumnWithCards[]) => {
    columnsRef.current = next;
    setColumns(next);
  }, []);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeDropColumnId, setActiveDropColumnId] = useState<string | null>(null);
  const [columnName, setColumnName] = useState("");
  const [columnWipLimit, setColumnWipLimit] = useState("");
  const [columnColor, setColumnColor] = useState<ColumnThemeId>("default");
  const [columnIcon, setColumnIcon] = useState<ColumnIconId>("kanban");
  const [columnDefaultCardStatus, setColumnDefaultCardStatus] = useState<CardStatus>("TODO");
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const isCreatingColumnRef = useRef(false);
  const mutationLockUntilRef = useRef<number>(0);
  const isPointerInteractingRef = useRef<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const collisionDetection = useMemo(
    () => createKanbanCollisionDetection(() => columnsRef.current),
    []
  );

  useEffect(() => () => collisionDetection.reset(), [collisionDetection]);

  // Global Pointer Release Listener to reset interaction lock
  useEffect(() => {
    const handlePointerRelease = (event: PointerEvent) => {
      isPointerInteractingRef.current = false;
      collisionDetection.clearIfOutside({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("pointerup", handlePointerRelease, true);
    window.addEventListener("pointercancel", handlePointerRelease, true);
    return () => {
      window.removeEventListener("pointerup", handlePointerRelease, true);
      window.removeEventListener("pointercancel", handlePointerRelease, true);
    };
  }, [collisionDetection]);

  // Premium Features States
  const [searchQuery, setSearchQuery] = useState("");
  const [isTodayFilterActive, setIsTodayFilterActive] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const selectedAssignee = useMemo(
    () => members.find((m) => m.id === assigneeFilter),
    [members, assigneeFilter]
  );
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [moveHistory, setMoveHistory] = useState<MoveAction[]>([]);

  // Board Name Editing States
  const [boardName, setBoardName] = useState(board.name);
  const [isEditingBoardName, setIsEditingBoardName] = useState(false);
  const [editingBoardNameValue, setEditingBoardNameValue] = useState(board.name);
  const [isSavingBoardName, setIsSavingBoardName] = useState(false);
  const [confirmRenameOpen, setConfirmRenameOpen] = useState(false);
  const boardNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBoardName(board.name);
    setEditingBoardNameValue(board.name);
  }, [board.name]);

  useEffect(() => {
    const handleBoardRenamed = (e: CustomEvent<{ id: string; name: string }>) => {
      if (e.detail?.id === board.id && e.detail?.name) {
        setBoardName(e.detail.name);
        setEditingBoardNameValue(e.detail.name);
      }
    };
    window.addEventListener("board-renamed" as any, handleBoardRenamed);
    return () => window.removeEventListener("board-renamed" as any, handleBoardRenamed);
  }, [board.id]);

  const requestRenameBoard = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = editingBoardNameValue.trim();
    if (!trimmed || trimmed === boardName) {
      setIsEditingBoardName(false);
      setEditingBoardNameValue(boardName);
      return;
    }
    setConfirmRenameOpen(true);
  };

  const handleConfirmRenameBoard = async () => {
    const trimmed = editingBoardNameValue.trim();
    if (!trimmed) return;
    setIsSavingBoardName(true);
    setConfirmRenameOpen(false);

    try {
      const response = await fetch(`/api/boards/${board.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to rename board");
      }

      setBoardName(data.board.name);
      setEditingBoardNameValue(data.board.name);
      setIsEditingBoardName(false);
      toast({ message: `Board renamed to "${data.board.name}".`, type: "success" });
      broadcastChange("BOARD_UPDATED");

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("board-renamed", {
            detail: { id: board.id, name: data.board.name }
          })
        );
      }
    } catch (err) {
      toast({
        message: err instanceof Error ? err.message : "Failed to rename board",
        type: "error"
      });
    } finally {
      setIsSavingBoardName(false);
    }
  };

  // Synchronize Focus Mode with Topbar Toggle
  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsFocusMode(document.body.classList.contains("focus-mode"));
    }

    const handleFocusModeChange = (e: CustomEvent<{ isFocusMode: boolean }>) => {
      setIsFocusMode(Boolean(e.detail?.isFocusMode));
    };

    window.addEventListener("focus-mode-toggle" as any, handleFocusModeChange);
    return () => {
      window.removeEventListener("focus-mode-toggle" as any, handleFocusModeChange);
    };
  }, []);

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => {
      const next = !prev;
      if (typeof document !== "undefined") {
        document.body.classList.toggle("focus-mode", next);
      }
      window.dispatchEvent(
        new CustomEvent("focus-mode-toggle", { detail: { isFocusMode: next } })
      );
      return next;
    });
  }, []);

  // Shortcut Key Listener (N -> Focus Quick Add)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) return;

      // N -> Focus Quick Add
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("focus-quick-add"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Validate the same revision before fetching and before applying a background response.
  const refreshBoard = useCallback(async () => {
    try {
      await syncGuard.sync(async () => {
        const response = await fetch(`/api/boards/${board.id}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" }
        });
        if (!response.ok) return null;
        const data = await response.json() as { board?: { columns?: ColumnWithCards[] } };
        return data.board?.columns?.map(column => normalizeColumn(column, members)) ?? null;
      }, nextColumns => {
        if (nextColumns && !areColumnsEqual(columnsRef.current, nextColumns)) applyColumns(nextColumns);
      });
    } catch {
      // Background sync failures remain silent.
    }
  }, [board.id, members, syncGuard, applyColumns]);

  const { broadcastChange, syncNow } = useLiveSync({
    channelKey: board.projectId ? [`board:${board.id}`, `project:${board.projectId}`] : `board:${board.id}`,
    intervalMs: 2500,
    canSync: () => {
      if (!syncGuard.canSync()) return false;
      if (isPointerInteractingRef.current) return false;
      if (activeCardId) return false;
      if (Date.now() < mutationLockUntilRef.current) return false;
      if (isColumnModalOpen) return false;
      if (typeof document !== "undefined" && document.querySelector("[role='dialog']")) return false;
      return true;
    },
    onSync: refreshBoard,
  });

  async function persistReorder(
    request: () => Promise<Response>,
    previous: ColumnWithCards[],
    onSuccess: () => void
  ) {
    if (syncGuard.isSaving()) return;
    setIsSavingReorder(true);
    setSyncError(null);
    try {
      const result = await runBoardReorder(syncGuard, request, onSuccess, () => {
        applyColumns(previous);
        setSyncError("Something did not sync. Try again.");
        toast({ message: "Sync failed. Changes rolled back.", type: "error" });
      });
      if (result === "success") void syncNow();
    } finally {
      setIsSavingReorder(false);
    }
  }

  const undoLastMove = async () => {
    if (!syncGuard.canSync() || moveHistory.length === 0) return;
    const lastMove = moveHistory[moveHistory.length - 1];
    const session = createCardDragSession(columnsRef.current, lastMove.cardId);
    if (!session) return;
    const move = prepareCardMove(session, {
      cardId: session.cardId,
      sourceColumnId: session.sourceColumnId,
      destinationColumnId: lastMove.sourceColumnId,
      destinationIndex: lastMove.sourceIndex
    });
    if (!move) return;
    applyColumns(move.columns);
    await persistReorder(() => fetch("/api/cards/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(move.payload)
    }), session.snapshot, () => {
      setMoveHistory(current => current.slice(0, -1));
      toast({ message: `Undo card move: "${lastMove.title}" ↩️`, type: "success" });
      broadcastChange("CARD_UNDO");
    });
  };

  // Keyboard Ctrl+Z Listener for Undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        void undoLastMove();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveHistory, columns]);

  async function createColumn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSyncError(null);

    if (!columnName.trim() || isCreatingColumnRef.current || isCreatingColumn) {
      return;
    }

    isCreatingColumnRef.current = true;
    setIsCreatingColumn(true);
    try {
      const response = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId: board.id,
          name: columnName.trim(),
          color: columnColor,
          icon: columnIcon,
          defaultCardStatus: columnDefaultCardStatus,
          wipLimit: columnWipLimit.trim() ? parseInt(columnWipLimit.trim(), 10) : null
        })
      });
      const data = (await response.json()) as { column?: ColumnWithCards; error?: string };

      if (data.column) {
        mutationLockUntilRef.current = Date.now() + 1500;
        const column = normalizeColumn({ ...data.column, cards: [] });
        setColumns((current) => [...current, column]);
        setColumnName("");
        setColumnWipLimit("");
        setColumnColor("default");
        setColumnIcon("kanban");
        setColumnDefaultCardStatus("TODO");
        setIsColumnModalOpen(false);
        toast({ message: "Column created.", type: "success" });
        broadcastChange("COLUMN_CREATED");
      } else {
        const msg = data.error ?? "Something did not sync. Try again.";
        setSyncError(msg);
        toast({ message: msg, type: "error" });
      }
    } finally {
      isCreatingColumnRef.current = false;
      setIsCreatingColumn(false);
    }
  }

  function openCreateColumnModal() {
    setColumnName("");
    setColumnColor("default");
    setColumnIcon("kanban");
    setColumnDefaultCardStatus("TODO");
    setColumnWipLimit("");
    setSyncError(null);
    setIsColumnModalOpen(true);
  }

  async function updateColumn(
    columnId: string,
    payload: {
      name: string;
      color: ColumnThemeId;
      icon: ColumnIconId;
      defaultCardStatus: CardStatus;
      wipLimit?: number | null;
    }
  ) {
    setSyncError(null);

    const response = await fetch(`/api/columns/${columnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { column?: ColumnWithCards; error?: string };

    if (data.column) {
      mutationLockUntilRef.current = Date.now() + 1500;
      setColumns((current) =>
        current.map((col) => {
          if (col.id !== columnId) return col;
          return {
            ...col,
            name: data.column!.name,
            color: getColumnThemeOption(data.column!.color).id,
            icon: getColumnIconOption(data.column!.icon).id,
            defaultCardStatus: data.column!.defaultCardStatus ?? col.defaultCardStatus,
            wipLimit: data.column!.wipLimit !== undefined ? data.column!.wipLimit : col.wipLimit,
            cards: col.cards
          };
        })
      );
      toast({ message: "Column updated.", type: "success" });
      broadcastChange("COLUMN_UPDATED");
      return;
    }

    const message = data.error ?? "Column could not be saved.";
    setSyncError(message);
    toast({ message, type: "error" });
    throw new Error(message);
  }

  async function deleteColumn(columnId: string) {
    setSyncError(null);

    const response = await fetch(`/api/columns/${columnId}`, {
      method: "DELETE"
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };

    if (data.ok) {
      mutationLockUntilRef.current = Date.now() + 1500;
      setColumns((current) =>
        current
          .filter((column) => column.id !== columnId)
          .map((column, position) => ({
            ...column,
            position
          }))
      );
      toast({ message: "Column deleted.", type: "success" });
      broadcastChange("COLUMN_DELETED");
      return;
    }

    const message = data.error ?? "Column could not be deleted.";
    setSyncError(message);
    toast({ message, type: "error" });
    throw new Error(message);
  }

  async function createCard(
    columnId: string,
    payload: {
      title: string;
      description: string | null;
      status: CardStatus;
      color: Card["color"];
      checklist: ChecklistItem[];
      dueDate: string | null;
      dueDateAllDay: boolean;
      priority?: "LOW" | "MEDIUM" | "HIGH";
      isStarred?: boolean;
      rewardCoins?: number;
      privateCoins?: any;
      stickers?: string[];
      difficulty?: DifficultyScore | null;
      assigneeIds?: string[];
    }
  ) {
    const response = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId, ...payload })
    });
    const data = (await response.json()) as { card?: Card; error?: string };

    if (data.card) {
      mutationLockUntilRef.current = Date.now() + 1500;
      const card = normalizeCard(data.card, members);
      setColumns((current) =>
        current.map((column) =>
          column.id === columnId ? { ...column, cards: [...column.cards, card] } : column
        )
      );
      playCardCreateSound();
      toast({ message: "Card added.", type: "success" });
      broadcastChange("CARD_CREATED");
      return;
    }

    setSyncError(data.error ?? "Something did not sync. Try again.");
    toast({ message: data.error ?? "Something did not sync.", type: "error" });
  }

  function saveCard(card: Card) {
    mutationLockUntilRef.current = Date.now() + 1500;
    setColumns((current) =>
      current.map((column) => ({
        ...column,
        cards: column.cards.map((existingCard) => (existingCard.id === card.id ? normalizeCard(card, members) : existingCard))
      }))
    );
    broadcastChange("CARD_UPDATED");
  }

  function deleteCard(cardId: string) {
    mutationLockUntilRef.current = Date.now() + 1500;
    setColumns((current) =>
      current.map((column) => ({
        ...column,
        cards: column.cards
          .filter((card) => card.id !== cardId)
          .map((card, position) => ({
            ...card,
            position
          }))
      }))
    );
    broadcastChange("CARD_DELETED");
  }

  function handleDragStart(event: DragStartEvent) {
    if (syncGuard.isSaving()) return;
    isPointerInteractingRef.current = true;
    syncGuard.startDrag();
    collisionDetection.reset();
    lastCardDropTargetRef.current = null;
    dragSnapshotRef.current = columnsRef.current;
    if (String(event.active.id).startsWith("card:")) {
      const cardId = String(event.active.id).slice("card:".length);
      const session = createCardDragSession(columnsRef.current, cardId);
      dragSessionRef.current = session;
      if (session) {
        setActiveCardId(cardId);
        setActiveCard(session.snapshot.find(column => column.id === session.sourceColumnId)!.cards[session.sourceIndex]);
      }
    }
  }

  function finishDrag() {
    isPointerInteractingRef.current = false;
    syncGuard.endDrag();
    collisionDetection.reset();
    dragSessionRef.current = null;
    dragSnapshotRef.current = null;
    lastCardDropTargetRef.current = null;
    setActiveCardId(null);
    setActiveDropColumnId(null);
    setActiveCard(null);
  }

  function handleDragCancel() {
    if (dragSnapshotRef.current) applyColumns(dragSnapshotRef.current);
    finishDrag();
  }

  function handleDragOver() {
    const session = dragSessionRef.current;
    if (!session) return;
    const target = getCardDropTarget(session, columnsRef.current, collisionDetection.getCardTarget());
    if (!target) {
      lastCardDropTargetRef.current = null;
      setActiveDropColumnId(null);
      return;
    }
    const last = lastCardDropTargetRef.current;
    if (last?.destinationColumnId === target.destinationColumnId && last.destinationIndex === target.destinationIndex) return;
    lastCardDropTargetRef.current = target;
    setActiveDropColumnId(target.destinationColumnId);
    applyColumns(moveCard(session.snapshot, target).columns);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const session = dragSessionRef.current;
    const previous = dragSnapshotRef.current ?? columnsRef.current;
    const target = session ? getCardDropTarget(session, columnsRef.current, collisionDetection.getCardTarget()) : null;
    const columnTarget = collisionDetection.getColumnTarget();
    finishDrag();
    if (!session) {
      if (!String(event.active.id).startsWith("column:") || !columnTarget?.startsWith("column:")) return;
      const sourceColumnId = String(event.active.id).slice("column:".length);
      const destinationColumnId = columnTarget.slice("column:".length);
      if (sourceColumnId === destinationColumnId) return;
      const next = reorderColumns(previous, sourceColumnId, destinationColumnId);
      applyColumns(next);
      await persistReorder(() => fetch("/api/columns/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId: board.id, columnIds: next.map(column => column.id) })
      }), previous, () => {
        toast({ message: "Columns reordered.", type: "success" });
        broadcastChange("COLUMN_REORDER");
      });
      return;
    }

    const move = prepareCardMove(session, target);
    if (!move || !target) {
      applyColumns(previous);
      return;
    }
    applyColumns(move.columns);
    await persistReorder(() => fetch("/api/cards/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(move.payload)
    }), session.snapshot, () => {
      const card = session.snapshot.find(column => column.id === session.sourceColumnId)!.cards[session.sourceIndex];
      setMoveHistory(current => [...current, {
        cardId: session.cardId, title: card.title,
        sourceColumnId: session.sourceColumnId, destinationColumnId: target.destinationColumnId,
        sourceIndex: session.sourceIndex, destinationIndex: target.destinationIndex
      }]);
      const destination = move.columns.find(column => column.id === target.destinationColumnId);
      if (destination?.defaultCardStatus === "DONE" && session.sourceColumnId !== destination.id) {
        const cardEl = document.getElementById(`card-${session.cardId}`);
        const rect = cardEl?.getBoundingClientRect();
        triggerCelebration(rect ? rect.left + rect.width / 2 : window.innerWidth / 2, rect ? rect.top + rect.height / 2 : window.innerHeight / 2);
        playCardDoneSound();
        toast({ message: "Task complete! ✦", type: "success" });
      } else {
        toast({ message: "Card moved.", type: "success" });
      }
      broadcastChange("CARD_MOVED");
    });
  }

  // Helper to check if a card is due today or overdue
  const isCardDueTodayOrOverdue = (card: Card) => {
    if (!card.dueDate) return false;
    const dueDate = new Date(card.dueDate);
    const now = new Date();

    // Overdue
    if (dueDate < now && card.status !== "DONE") return true;

    // Today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return dueDate >= todayStart && dueDate <= todayEnd;
  };

  // Dynamic Filtering based on Search Query, Today Filter & Assignee Filter
  // Skip filtering during drag so all cards remain in DOM for accurate collision detection
  const filteredColumns = activeCardId
    ? columns
    : columns.map((column) => {
        const baseCards = column.cards.filter((card) => {
          const matchesSearch =
            card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (card.description && card.description.toLowerCase().includes(searchQuery.toLowerCase()));

          const matchesToday = !isTodayFilterActive || isCardDueTodayOrOverdue(card);

          return matchesSearch && matchesToday;
        });

        return {
          ...column,
          cards: filterCardsByAssignee(baseCards, assigneeFilter)
        };
      });

  // Active filter count & reset helper
  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    (isTodayFilterActive ? 1 : 0) +
    (assigneeFilter !== "ALL" ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery("");
    setIsTodayFilterActive(false);
    setAssigneeFilter("ALL");
  };

  // Statistics Computations
  const totalCards = columns.reduce((acc, col) => acc + col.cards.length, 0);
  const doneCards = columns.reduce((acc, col) => acc + col.cards.filter((c) => c.status === "DONE").length, 0);
  const overdueCards = columns.reduce((acc, col) => acc + col.cards.filter((c) => c.dueDate && new Date(c.dueDate) < new Date() && c.status !== "DONE").length, 0);
  const doingCards = columns.reduce((acc, col) => acc + col.cards.filter((c) => c.status === "DOING").length, 0);

  return (
    <div
      className="flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden"
      onPointerDownCapture={(e) => {
        const target = e.target as HTMLElement | null;
        if (target?.closest?.("article, [role='button'], button, input, textarea")) {
          isPointerInteractingRef.current = true;
        }
      }}
      onPointerUpCapture={() => {
        isPointerInteractingRef.current = false;
      }}
      onPointerCancelCapture={() => {
        isPointerInteractingRef.current = false;
      }}
    >
      {/* ── Header ── */}
      <div className="lofi-panel relative grid gap-2.5 rounded-2xl p-3 sm:p-3.5 max-w-full">
        {/* Overdue Indicator Icon (Top-Right Corner Pulsing Icon with Portal Hover Details) */}
        {overdueCards > 0 ? (
          <div className="!absolute !top-2.5 !right-2.5 sm:!top-3 sm:!right-3 z-30">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsTodayFilterActive((prev) => !prev)}
                    className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/15 text-red-400 hover:border-red-400 hover:bg-red-500/25 transition shadow-[0_0_12px_rgba(239,68,68,0.25)] cursor-pointer"
                    aria-label={`${overdueCards} overdue cards`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-400 animate-ping opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                    </span>
                    <Clock className="h-4 w-4 text-red-400 animate-pulse ml-0.5" />
                    <span className="sr-only">{overdueCards} overdue</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end" className="border-red-500/30 bg-ink-950/98 p-2.5 text-xs text-stone-200 shadow-2xl">
                  <div className="flex items-center gap-1.5 font-semibold text-red-300 border-b border-white/10 pb-1.5 mb-1.5">
                    <Clock className="h-3.5 w-3.5 text-red-400" />
                    <span>{overdueCards} Overdue {overdueCards === 1 ? "Card" : "Cards"}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-tight">
                    There {overdueCards === 1 ? "is 1 task" : `are ${overdueCards} tasks`} past due date.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : null}

        <div className={cn("flex flex-col gap-2.5 2xl:flex-row 2xl:items-start 2xl:justify-between", overdueCards > 0 && "pr-10 sm:pr-12")}>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.22em] text-dusk-amber font-semibold">Board Channel</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              {isEditingBoardName ? (
                <form onSubmit={requestRenameBoard} className="flex items-center gap-1.5">
                  <input
                    ref={boardNameInputRef}
                    type="text"
                    value={editingBoardNameValue}
                    onChange={(e) => setEditingBoardNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsEditingBoardName(false);
                        setEditingBoardNameValue(boardName);
                      }
                    }}
                    onPointerDownCapture={(e) => {
                      e.stopPropagation();
                    }}
                    maxLength={80}
                    className="h-8 rounded-lg border border-indigo-400 bg-white px-2.5 text-base sm:text-lg font-semibold text-stone-900 shadow-xs outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-dusk-lavender/50 dark:bg-white/[0.08] dark:text-stone-100 select-text"
                    placeholder="Board name..."
                    autoFocus
                    disabled={isSavingBoardName}
                  />
                  <button
                    type="submit"
                    disabled={isSavingBoardName || !editingBoardNameValue.trim()}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 transition cursor-pointer"
                    title="Save board name"
                    aria-label="Save board name"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingBoardName(false);
                      setEditingBoardNameValue(boardName);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200 dark:border-white/10 dark:bg-white/5 dark:text-stone-400 transition cursor-pointer"
                    title="Cancel (Esc)"
                    aria-label="Cancel renaming"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="group/title flex items-center gap-1.5">
                  <h2
                    className="text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100 cursor-pointer rounded-md hover:text-indigo-600 dark:hover:text-dusk-lavender transition select-text"
                    onClick={() => {
                      const selection = typeof window !== "undefined" ? window.getSelection()?.toString() : "";
                      if (selection && selection.trim().length > 0) return;
                      setEditingBoardNameValue(boardName);
                      setIsEditingBoardName(true);
                    }}
                    title="Click to rename board (or drag to copy text)"
                  >
                    {boardName}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBoardNameValue(boardName);
                      setIsEditingBoardName(true);
                    }}
                    className="opacity-0 group-hover/title:opacity-100 focus:opacity-100 transition grid h-6 w-6 place-items-center rounded text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200 cursor-pointer"
                    title="Rename board"
                    aria-label="Rename board"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {isFocusMode && (
                <button
                  type="button"
                  onClick={toggleFocusMode}
                  title="Click to exit Focus Mode (or press F)"
                  aria-label="Exit focus mode"
                  className="group/focus inline-flex items-center gap-1.5 rounded-full border border-dusk-amber/40 bg-dusk-amber/15 px-2 py-0.5 text-[10px] text-dusk-amber font-mono font-medium hover:bg-dusk-amber/25 hover:border-dusk-amber/60 transition cursor-pointer"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-dusk-amber animate-pulse" />
                  <span>FOCUS ACTIVE</span>
                  <X className="h-3 w-3 opacity-70 group-hover/focus:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
            <p className="text-xs text-stone-500">
              {isFocusMode ? (
                <>
                  Focus mode active. Press <kbd className="rounded bg-white/5 px-1 py-0.5 font-mono text-xs">F</kbd> or click the badge to exit.
                </>
              ) : (
                <>
                  Drag cards across columns. Press <kbd className="rounded bg-white/5 px-1 py-0.5 font-mono text-xs">F</kbd> for focus.
                </>
              )}
            </p>
          </div>

          {/* ── Premium Control Bar ── */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full 2xl:w-auto 2xl:flex 2xl:items-center">
            <div className="flex h-9 sm:h-10 2xl:w-28 min-w-0 flex-1 items-center justify-between gap-1 rounded-xl border border-stone-200/90 bg-white shadow-xs dark:border-white/10 dark:bg-white/[0.025] px-2 sm:px-3">
              <span className="truncate text-[10px] uppercase tracking-wider text-stone-500 select-none">Total</span>
              <span className="text-sm sm:text-base font-bold leading-none text-stone-900 dark:text-stone-200">{totalCards}</span>
            </div>
            <div className="flex h-9 sm:h-10 2xl:w-28 min-w-0 flex-1 items-center justify-between gap-1 rounded-xl border border-stone-200/90 bg-white shadow-xs dark:border-white/10 dark:bg-white/[0.025] px-2 sm:px-3">
              <span className="flex items-center min-w-0 text-[10px] uppercase tracking-wider text-indigo-600 dark:text-dusk-lavender select-none">
                <span className="mr-1 h-2 w-2 rounded-full bg-indigo-500 dark:bg-dusk-lavender shrink-0" />
                <span className="truncate hidden min-[360px]:inline">Prog</span>
              </span>
              <span className="text-sm sm:text-base font-bold leading-none text-indigo-600 dark:text-dusk-lavender">{doingCards}</span>
            </div>
            <div className="flex h-9 sm:h-10 2xl:w-28 min-w-0 flex-1 items-center justify-between gap-1 rounded-xl border border-stone-200/90 bg-white shadow-xs dark:border-white/10 dark:bg-white/[0.025] px-2 sm:px-3">
              <span className="flex items-center min-w-0 text-[10px] uppercase tracking-wider text-amber-600 dark:text-dusk-amber select-none">
                <span className="mr-1 h-2 w-2 rounded-full bg-amber-500 dark:bg-dusk-amber shrink-0" />
                <span className="truncate">Done</span>
              </span>
              <span className="text-sm sm:text-base font-bold leading-none text-amber-600 dark:text-dusk-amber">{doneCards}</span>
            </div>
          </div>
        </div>

        {/* ── Filters & Actions ── */}
        <div className="flex flex-wrap items-center justify-start gap-1.5 sm:gap-2">
          {/* Live Search */}
          <div className="group/search relative flex items-center flex-1 min-w-[130px] sm:flex-initial">
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-stone-400 transition-colors group-focus-within/search:text-indigo-600 dark:text-stone-500 dark:group-focus-within/search:text-dusk-lavender" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards..."
              className="h-9 w-full sm:w-44 rounded-xl border border-stone-200/90 bg-white pl-8 pr-7 text-xs font-medium text-stone-900 placeholder:text-stone-400 shadow-xs outline-none transition hover:border-stone-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/[0.045] dark:text-stone-100 dark:placeholder:text-stone-500 dark:hover:border-white/20 dark:focus:border-dusk-lavender/50 dark:focus:bg-white/5 dark:focus:ring-dusk-lavender/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 grid h-4 w-4 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-200"
                aria-label="Clear card search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Today Quick Filter */}
          <button
            type="button"
            onClick={() => setIsTodayFilterActive(!isTodayFilterActive)}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer select-none active:scale-95",
              isTodayFilterActive
                ? "border-amber-400 bg-amber-50 text-amber-800 ring-1 ring-amber-400/40 dark:border-dusk-amber/50 dark:bg-dusk-amber/20 dark:text-dusk-amber"
                : "border-stone-300/80 bg-white text-stone-700 hover:border-amber-400/70 hover:bg-amber-50/40 hover:text-amber-800 hover:shadow-xs dark:border-white/15 dark:bg-white/[0.05] dark:text-stone-200 dark:hover:border-white/30 dark:hover:bg-white/[0.09] dark:hover:text-white"
            )}
          >
            <CalendarClock className={cn("h-3.5 w-3.5 transition-colors", isTodayFilterActive ? "text-amber-600 dark:text-dusk-amber" : "text-amber-600/80 dark:text-dusk-amber/80")} />
            <span>Today</span>
          </button>

          {/* My Tasks Quick Filter */}
          {currentUserId && (
            <button
              type="button"
              onClick={() => {
                setAssigneeFilter((prev) => (prev === currentUserId ? "ALL" : currentUserId));
              }}
              className={cn(
                "flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer select-none active:scale-95",
                assigneeFilter === currentUserId
                  ? "border-indigo-400 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-400/40 dark:border-dusk-lavender/50 dark:bg-dusk-lavender/20 dark:text-dusk-lavender"
                  : "border-stone-300/80 bg-white text-stone-700 hover:border-indigo-400/70 hover:bg-indigo-50/40 hover:text-indigo-800 hover:shadow-xs dark:border-white/15 dark:bg-white/[0.05] dark:text-stone-200 dark:hover:border-white/30 dark:hover:bg-white/[0.09] dark:hover:text-white"
              )}
            >
              <User className={cn("h-3.5 w-3.5 transition-colors", assigneeFilter === currentUserId ? "text-indigo-600 dark:text-dusk-lavender" : "text-indigo-600/80 dark:text-dusk-lavender/80")} />
              <span>My Tasks</span>
            </button>
          )}

          {/* Assignee Filter */}
          <div className="flex items-center gap-1.5">
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger
                aria-label="Filter cards by assignee"
                className={cn(
                  "h-9 w-auto min-w-[120px] sm:min-w-[135px] max-w-[180px] sm:max-w-[210px] gap-1.5 sm:gap-2 rounded-xl border px-2.5 sm:px-3 text-xs font-semibold transition-all duration-150 cursor-pointer select-none shadow-xs active:scale-95 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0",
                  assigneeFilter !== "ALL"
                    ? "border-indigo-400 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-400/40 [&>svg]:text-indigo-600 dark:border-dusk-lavender/50 dark:bg-dusk-lavender/20 dark:text-dusk-lavender dark:[&>svg]:text-dusk-lavender"
                    : "border-stone-300/80 bg-white text-stone-800 hover:border-indigo-400/70 hover:bg-indigo-50/40 hover:text-indigo-800 hover:shadow-xs dark:border-white/15 dark:bg-white/[0.05] dark:text-stone-200 dark:hover:border-white/30 dark:hover:bg-white/[0.09] dark:hover:text-white"
                )}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  {selectedAssignee ? (
                    <AssigneeAvatar user={selectedAssignee} size={16} />
                  ) : assigneeFilter === "UNASSIGNED" ? (
                    <UserX className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-dusk-lavender" />
                  ) : (
                    <Users className="h-3.5 w-3.5 shrink-0 text-indigo-600/80 dark:text-dusk-lavender/80" />
                  )}
                  <SelectValue placeholder="All Assignees" />
                </span>
              </SelectTrigger>
              <SelectContent align="start" className="min-w-[15rem] max-w-[22rem]">
                <SelectGroup>
                  <SelectItem value="ALL" className="cursor-pointer">
                    All Assignees
                  </SelectItem>
                  <SelectItem value="UNASSIGNED" className="cursor-pointer">
                    Unassigned
                  </SelectItem>
                </SelectGroup>
                {members.length > 0 && (
                  <>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Members ({members.length})</SelectLabel>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id} className="cursor-pointer">
                          {member.name ? `${member.name} (${member.email})` : member.email}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </>
                )}
              </SelectContent>
            </Select>
            {assigneeFilter !== "ALL" && (
              <button
                type="button"
                onClick={() => setAssigneeFilter("ALL")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-stone-300/80 bg-white text-stone-600 shadow-xs transition-all duration-150 cursor-pointer active:scale-95 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-white/15 dark:bg-white/[0.05] dark:text-stone-400 dark:hover:border-white/30 dark:hover:bg-white/10 dark:hover:text-white"
                title="Clear assignee filter"
                aria-label="Clear assignee filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Clear All Filters Button */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-2.5 sm:px-3 text-xs font-semibold text-amber-800 shadow-xs transition-all duration-150 cursor-pointer active:scale-95 hover:bg-amber-100 hover:border-amber-400 dark:border-dusk-amber/40 dark:bg-dusk-amber/15 dark:text-dusk-amber dark:hover:border-dusk-amber/60 dark:hover:bg-dusk-amber/25 select-none"
              title="Reset all active filters"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear filters ({activeFilterCount})</span>
            </button>
          )}

          {/* Undo */}
          <button
            type="button"
            disabled={moveHistory.length === 0 || isSavingReorder || Boolean(activeCardId)}
            onClick={undoLastMove}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 text-xs font-semibold shadow-xs transition-all duration-150 select-none",
              moveHistory.length > 0
                ? "cursor-pointer border-teal-400 bg-teal-50 text-teal-800 hover:bg-teal-100 hover:border-teal-500 hover:shadow-xs active:scale-95 dark:border-dusk-cyan/50 dark:bg-dusk-cyan/15 dark:text-dusk-cyan dark:hover:bg-dusk-cyan/25"
                : "cursor-not-allowed border-stone-200/50 bg-stone-100/60 text-stone-400/80 opacity-50 dark:border-white/5 dark:bg-white/[0.01] dark:text-stone-600"
            )}
            title="Undo last card move (Ctrl+Z)"
          >
            <RotateCcw className={cn("h-3.5 w-3.5", moveHistory.length > 0 ? "text-teal-600 dark:text-dusk-cyan" : "text-stone-400/80")} />
            <span className="hidden sm:inline">Undo</span>
          </button>

          {/* Add Column Form */}
          <Button
            className="h-9 shrink-0 rounded-xl px-2.5 sm:px-3.5 text-xs font-semibold cursor-pointer active:scale-95 shadow-xs hover:shadow-sm"
            type="button"
            aria-label="Add column"
            onClick={openCreateColumnModal}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden min-[360px]:inline">Column</span>
          </Button>
        </div>
      </div>

      {/* ── Stats Bar Panel ── */}
      {isColumnModalOpen ? (
        <AppModal
          open={isColumnModalOpen}
          onClose={() => {
            setColumnName("");
            setColumnColor("default");
            setColumnIcon("kanban");
            setColumnDefaultCardStatus("TODO");
            setColumnWipLimit("");
            setIsColumnModalOpen(false);
          }}
          hasUnsavedChanges={
            columnName.trim() !== "" ||
            columnColor !== "default" ||
            columnIcon !== "kanban" ||
            columnDefaultCardStatus !== "TODO" ||
            columnWipLimit.trim() !== ""
          }
          labelledBy="create-column-title"
          contentClassName="lofi-panel w-full max-w-md rounded-2xl p-5 shadow-[0_24px_68px_rgba(0,0,0,0.46)]"
        >
          <form
            onSubmit={createColumn}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Board column</p>
                <h3 id="create-column-title" className="mt-1 text-2xl font-semibold text-stone-100">Create column</h3>
                <p className="mt-1 text-sm leading-6 text-stone-400">Name the new lane for this board.</p>
              </div>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-400 transition hover:border-dusk-rose/35 hover:bg-dusk-rose/10 hover:text-dusk-rose"
                aria-label="Close column modal"
                onClick={() => {
                  setColumnName("");
                  setColumnColor("default");
                  setColumnIcon("kanban");
                  setColumnDefaultCardStatus("TODO");
                  setColumnWipLimit("");
                  setIsColumnModalOpen(false);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="space-y-2 text-sm text-stone-300">
              <span>Column name</span>
              <Input
                autoFocus
                value={columnName}
                onChange={(event) => setColumnName(event.target.value)}
                placeholder="Backlog, Review, Done..."
                required
              />
            </label>

            <div className="mt-4 space-y-4">
              <ColumnThemePicker value={columnColor} onChange={setColumnColor} />
              <ColumnIconPicker value={columnIcon} onChange={setColumnIcon} />
              <ColumnStatusPicker value={columnDefaultCardStatus} onChange={setColumnDefaultCardStatus} />
              <label className="block space-y-1.5 text-sm text-stone-300">
                <div className="flex items-center justify-between">
                  <span>Card limit (WIP)</span>
                  <span className="text-[11px] text-stone-500">Optional • Default: none</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={columnWipLimit}
                  onChange={(event) => setColumnWipLimit(event.target.value)}
                  placeholder="No limit (leave empty)"
                />
              </label>
            </div>

            {syncError ? (
              <p className="mt-3 rounded-xl border border-dusk-rose/25 bg-dusk-rose/10 px-3 py-2 text-sm text-dusk-rose">
                {syncError}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setColumnName("");
                  setColumnColor("default");
                  setColumnIcon("kanban");
                  setColumnDefaultCardStatus("TODO");
                  setColumnWipLimit("");
                  setIsColumnModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button disabled={!columnName.trim() || isCreatingColumn}>
                <Plus className="h-4 w-4" />
                {isCreatingColumn ? "Adding..." : "Add column"}
              </Button>
            </div>
          </form>
        </AppModal>
      ) : null}

      {/* ── Board Columns Grid ── */}
      {syncError ? <p className="mt-4 rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{syncError}</p> : null}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragMove={handleDragOver}
        onDragStart={handleDragStart}
      >
        {columns.length === 0 ? (
          <div className="lofi-panel mt-4 flex min-h-[320px] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.035] text-dusk-amber shadow-inner">
              <Plus className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-stone-100">No columns on this board yet</h3>
            <p className="mt-1.5 max-w-sm text-xs text-stone-400">
              Create your first column like &ldquo;To Do&rdquo;, &ldquo;In Progress&rdquo;, or &ldquo;Done&rdquo; to start organizing tasks.
            </p>
            <Button
              className="mt-5 text-xs"
              type="button"
              onClick={openCreateColumnModal}
            >
              <Plus className="h-3.5 w-3.5" />
              Add First Column
            </Button>
          </div>
        ) : (
          <div className="relative mt-4 flex min-h-0 flex-1">
            <div className="scrollbar-soft scroll-touch-x flex min-h-0 flex-1 gap-4 overflow-x-auto pb-1 snap-x snap-mandatory">
              <SortableContext items={columns.map((column) => `column:${column.id}`)} strategy={horizontalListSortingStrategy}>
                {filteredColumns.map((column, index) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    activeCardId={activeCardId}
                    isDragDisabled={isSavingReorder}
                    isDropTarget={activeDropColumnId === column.id}
                    onCreateCard={createCard}
                    onCardDeleted={deleteCard}
                    onCardSaved={saveCard}
                    onColumnDeleted={deleteColumn}
                    onColumnSaved={updateColumn}
                    isFirst={index === 0}
                    members={members}
                    currentUserId={currentUserId}
                    hasActiveFilters={activeFilterCount > 0}
                  />
                ))}
              </SortableContext>
            </div>
            {/* Horizontal scroll fade hint */}
            <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-[#fbfaf8]/90 dark:from-ink-950/80 to-transparent" />
          </div>
        )}
        <DragOverlay adjustScale={false} dropAnimation={null} zIndex={10000}>
          {activeCard ? <KanbanCardDragPreview card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      {selectedCardFromUrl && (
        <CardModal
          card={selectedCardFromUrl}
          mode="edit"
          open={Boolean(selectedCardFromUrl)}
          onClose={() => setSelectedCardFromUrl(null)}
          members={members}
          currentUserId={currentUserId}
          onDelete={async () => {
            deleteCard(selectedCardFromUrl.id);
            setSelectedCardFromUrl(null);
          }}
          onSubmit={async (data) => {
            const response = await fetch("/api/cards", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cardId: selectedCardFromUrl.id, ...data })
            });
            const resData = (await response.json()) as { card?: Card };
            if (resData.card) {
              saveCard(resData.card);
              setSelectedCardFromUrl(null);
            }
          }}
        />
      )}

      <ConfirmModal
        open={confirmRenameOpen}
        title="Rename Board"
        message={`Are you sure you want to rename "${boardName}" to "${editingBoardNameValue.trim()}"?`}
        confirmLabel="Rename"
        isLoading={isSavingBoardName}
        variant="default"
        onClose={() => setConfirmRenameOpen(false)}
        onConfirm={handleConfirmRenameBoard}
      />
    </div>
  );
}

function ColumnThemePicker({
  onChange,
  value
}: {
  onChange: (value: ColumnThemeId) => void;
  value: ColumnThemeId;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Color</span>
        <span className="text-xs text-stone-600 dark:text-stone-500">{getColumnThemeOption(value).label}</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {columnThemeOptions.map((option) => (
          <button
            key={option.id}
            aria-label={`Use ${option.label} column color`}
            className={cn(
              "grid h-9 place-items-center rounded-lg border transition hover:-translate-y-0.5 hover:border-dusk-lavender/40",
              option.id === value
                ? "border-dusk-amber bg-dusk-amber/15 shadow-[0_0_0_2px_rgba(249,199,132,0.25)]"
                : "border-stone-200/80 bg-white dark:border-white/10 dark:bg-white/[0.035]"
            )}
            title={option.label}
            type="button"
            onClick={() => onChange(option.id)}
          >
            <span className={cn("h-4 w-4 rounded-full", option.swatchClass)} />
          </button>
        ))}
      </div>
    </div>
  );
}

function KanbanCardDragPreview({ card }: { card: Card }) {
  const completedChecklist = card.checklist.filter((item) => item.checked).length;
  const statusMeta = getStatusMeta(card.status);
  const colorMeta = getCardColorMeta(card.color);

  return (
    <article className={cn("pointer-events-none w-72 rotate-1 rounded-xl border p-3 text-sm shadow-2xl shadow-dusk-lavender/30 ring-2 ring-dusk-lavender/30", colorMeta.cardClass)}>
      <div className="space-y-2">
        <p className="font-semibold text-stone-900 dark:text-stone-100">{card.title}</p>
        <div className="flex flex-wrap gap-2">
          <span className={cn("rounded border px-2 py-1 text-xs", statusMeta.badgeClass)}>{statusMeta.label}</span>
          {card.checklist.length > 0 ? (
            <span className="inline-flex items-center gap-1 rounded bg-dusk-cyan/10 px-2 py-1 text-xs text-dusk-cyan">
              <CheckSquare className="h-3 w-3" />
              {completedChecklist}/{card.checklist.length}
            </span>
          ) : null}
        </div>
        {card.dueDate ? (
          <p className="inline-flex items-center gap-1 rounded bg-dusk-amber/10 px-2 py-1 text-xs text-dusk-amber">
            <CalendarClock className="h-3 w-3" />
            {formatMediumDateTime(card.dueDate, card.dueDateAllDay)}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function normalizeCard(card: Card, members: CardAssignee[] = []): Card {
  const privateCoins = card.privateCoins;
  const assigneeIds = (card.assigneeIds && card.assigneeIds.length > 0)
    ? card.assigneeIds
    : extractAssigneeIds(privateCoins);
  const difficulty = card.difficulty !== undefined && card.difficulty !== null
    ? card.difficulty
    : extractDifficulty(privateCoins);
  const startDate = card.startDate !== undefined
    ? card.startDate
    : extractStartDate(privateCoins);
  const startDateAllDay = card.startDateAllDay !== undefined
    ? card.startDateAllDay
    : extractStartDateAllDay(privateCoins);

  return {
    ...card,
    color: normalizeCardColor(card.color),
    checklist: Array.isArray(card.checklist) ? card.checklist : [],
    startDate,
    startDateAllDay,
    dueDate: card.dueDate ? new Date(card.dueDate).toISOString() : null,
    dueDateAllDay: card.dueDateAllDay ?? false,
    difficulty,
    assigneeIds,
    assignees: (card.assignees && card.assignees.length > 0)
      ? card.assignees
      : resolveAssignees(assigneeIds, members)
  };
}
