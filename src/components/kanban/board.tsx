"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CalendarClock, CheckSquare, Plus, Search, Eye, EyeOff, RotateCcw, Clock, Sparkles, X } from "lucide-react";
import { FormEvent, useState, useEffect } from "react";

import { KanbanColumn } from "@/components/kanban/column";
import { ColumnIconPicker } from "@/components/kanban/column-icon-picker";
import { triggerCelebration } from "@/components/kanban/card-celebration";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatMediumDateTime } from "@/lib/date-format";
import {
  columnThemeOptions,
  getColumnIconOption,
  getColumnThemeOption,
  type ColumnIconId,
  type ColumnThemeId
} from "@/lib/kanban/column-settings";
import { moveCard, reorderColumns } from "@/lib/kanban/reorder";
import { getStatusMeta } from "@/lib/kanban/status";
import { getCardColorMeta, normalizeCardColor } from "@/lib/theme/card-colors";
import { playCardDoneSound, playCardCreateSound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import type { Card, CardStatus, ChecklistItem, ColumnWithCards } from "@/types/kanban";

interface BoardData {
  id: string;
  name: string;
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

function normalizeColumn(column: ColumnWithCards): ColumnWithCards {
  return {
    ...column,
    color: getColumnThemeOption(column.color).id,
    icon: getColumnIconOption(column.icon).id,
    cards: column.cards.map(normalizeCard)
  };
}

export function KanbanBoard({ board }: { board: BoardData }) {
  const [columns, setColumns] = useState(() => board.columns.map(normalizeColumn));
  const [dragSnapshot, setDragSnapshot] = useState<ColumnWithCards[] | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeDropColumnId, setActiveDropColumnId] = useState<string | null>(null);
  const [columnName, setColumnName] = useState("");
  const [columnColor, setColumnColor] = useState<ColumnThemeId>("default");
  const [columnIcon, setColumnIcon] = useState<ColumnIconId>("kanban");
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Premium Features States
  const [searchQuery, setSearchQuery] = useState("");
  const [isTodayFilterActive, setIsTodayFilterActive] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [moveHistory, setMoveHistory] = useState<MoveAction[]>([]);

  // Focus Mode Toggle Helper
  const toggleFocusMode = () => {
    const nextMode = !isFocusMode;
    setIsFocusMode(nextMode);
    if (typeof document !== "undefined") {
      document.body.classList.toggle("focus-mode", nextMode);
    }
  };

  // Focus Mode & Shortcut Key Listeners (F & N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) return;

      // F -> Focus Mode
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFocusMode();
      }

      // N -> Focus Quick Add
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("focus-quick-add"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (typeof document !== "undefined") {
        document.body.classList.remove("focus-mode");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocusMode]);

  // Undo Reordering Helper
  const undoLastMove = async () => {
    if (moveHistory.length === 0) return;
    const lastMove = moveHistory[moveHistory.length - 1];

    // Pop from stack
    setMoveHistory((current) => current.slice(0, -1));

    const target = {
      cardId: lastMove.cardId,
      sourceColumnId: lastMove.destinationColumnId, // Swap to reverse
      destinationColumnId: lastMove.sourceColumnId, // Swap to reverse
      destinationIndex: lastMove.sourceIndex
    };

    setColumns((current) => {
      const next = moveCard(current, target).columns;

      // Sync DB reorder
      const sourceOrderedCardIds = next.find((col) => col.id === target.sourceColumnId)?.cards.map((c) => c.id) ?? [];
      const destinationOrderedCardIds = next.find((col) => col.id === target.destinationColumnId)?.cards.map((c) => c.id) ?? [];

      void fetch("/api/cards/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: target.cardId,
          sourceColumnId: target.sourceColumnId,
          destinationColumnId: target.destinationColumnId,
          sourceOrderedCardIds,
          destinationOrderedCardIds
        })
      });

      return next;
    });

    toast({ message: `Undo card move: "${lastMove.title}" ↩️`, type: "info" });
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

    if (!columnName.trim()) {
      return;
    }

    const response = await fetch("/api/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId: board.id, name: columnName.trim(), color: columnColor, icon: columnIcon })
    });
    const data = (await response.json()) as { column?: ColumnWithCards; error?: string };

    if (data.column) {
      const column = normalizeColumn({ ...data.column, cards: [] });
      setColumns((current) => [...current, column]);
      setColumnName("");
      setColumnColor("default");
      setColumnIcon("kanban");
      setIsColumnModalOpen(false);
      toast({ message: "Column created.", type: "success" });
    } else {
      const msg = data.error ?? "Something did not sync. Try again.";
      setSyncError(msg);
      toast({ message: msg, type: "error" });
    }
  }

  async function updateColumn(
    columnId: string,
    payload: {
      name: string;
      color: ColumnThemeId;
      icon: ColumnIconId;
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
      const nextColumn = normalizeColumn(data.column);
      setColumns((current) => current.map((column) => (column.id === columnId ? nextColumn : column)));
      toast({ message: "Column updated.", type: "success" });
      return;
    }

    const message = data.error ?? "Column did not sync. Try again.";
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
      setColumns((current) =>
        current
          .filter((column) => column.id !== columnId)
          .map((column, position) => ({
            ...column,
            position
          }))
      );
      toast({ message: "Column deleted.", type: "success" });
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
    }
  ) {
    const response = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId, ...payload })
    });
    const data = (await response.json()) as { card?: Card; error?: string };

    if (data.card) {
      const card = normalizeCard(data.card);
      setColumns((current) =>
        current.map((column) =>
          column.id === columnId ? { ...column, cards: [...column.cards, card] } : column
        )
      );
      playCardCreateSound();
      toast({ message: "Card added.", type: "success" });
      return;
    }

    setSyncError(data.error ?? "Something did not sync. Try again.");
    toast({ message: data.error ?? "Something did not sync.", type: "error" });
  }

  function saveCard(card: Card) {
    setColumns((current) =>
      current.map((column) => ({
        ...column,
        cards: column.cards.map((existingCard) => (existingCard.id === card.id ? normalizeCard(card) : existingCard))
      }))
    );
  }

  function deleteCard(cardId: string) {
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
  }

  function getCardDropTarget(event: DragOverEvent | DragEndEvent, currentColumns: ColumnWithCards[]) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return null;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== "card") {
      return null;
    }

    const sourceColumnId = activeData.columnId as string;
    const cardId = activeData.cardId as string;
    const destinationColumnId =
      overData?.type === "card"
        ? (overData.columnId as string)
        : overData?.type === "column"
          ? (overData.columnId as string)
          : sourceColumnId;
    const destinationColumn = currentColumns.find((column) => column.id === destinationColumnId);
    const overCardIndex =
      overData?.type === "card" && destinationColumn
        ? destinationColumn.cards.findIndex((card) => `card:${card.id}` === over.id)
        : destinationColumn?.cards.length ?? 0;
    const destinationIndex = overCardIndex < 0 ? destinationColumn?.cards.length ?? 0 : overCardIndex;

    return {
      cardId,
      sourceColumnId,
      destinationColumnId,
      destinationIndex
    };
  }

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "card") {
      setDragSnapshot(columns);
      const cardId = event.active.data.current.cardId as string;
      const card = columns.flatMap((column) => column.cards).find((item) => item.id === cardId) ?? null;
      setActiveCardId(cardId);
      setActiveCard(card);
    }
  }

  function handleDragCancel() {
    if (dragSnapshot) {
      setColumns(dragSnapshot);
    }

    setDragSnapshot(null);
    setActiveCardId(null);
    setActiveDropColumnId(null);
    setActiveCard(null);
  }

  function handleDragOver(event: DragOverEvent) {
    const baseColumns = dragSnapshot ?? columns;
    const target = getCardDropTarget(event, baseColumns);

    if (!target) {
      setActiveDropColumnId(null);
      return;
    }

    setActiveDropColumnId(target.destinationColumnId);
    setColumns(moveCard(baseColumns, target).columns);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const previous = dragSnapshot ?? columns;
    setDragSnapshot(null);
    setActiveCardId(null);
    setActiveDropColumnId(null);
    setActiveCard(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === "column" && overData?.type === "column") {
      const previous = columns;
      const next = reorderColumns(columns, activeData.columnId, overData.columnId);
      setColumns(next);

      const response = await fetch("/api/columns/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId: board.id, columnIds: next.map((column) => column.id) })
      });

      if (!response.ok) {
        setColumns(previous);
        setSyncError("Something did not sync. Try again.");
      }

      return;
    }

    if (activeData?.type !== "card") {
      return;
    }

    const target = getCardDropTarget(event, previous);

    if (!target) {
      return;
    }

    const next = moveCard(previous, target).columns;
    setColumns(next);

    // Save Undo Action History
    const sourceColumn = previous.find((col) => col.id === target.sourceColumnId);
    const sourceIndex = sourceColumn?.cards.findIndex((c) => c.id === target.cardId) ?? 0;
    const hasMoved = target.sourceColumnId !== target.destinationColumnId || sourceIndex !== target.destinationIndex;

    if (hasMoved) {
      const newMove: MoveAction = {
        cardId: target.cardId,
        title: activeCard?.title ?? "Card",
        sourceColumnId: target.sourceColumnId,
        destinationColumnId: target.destinationColumnId,
        sourceIndex,
        destinationIndex: target.destinationIndex
      };
      setMoveHistory((current) => [...current, newMove]);
    }

    // Celebration: detect if card moved into the last column
    const destinationColumn = next.find((col) => col.id === target.destinationColumnId);
    const isLastColumn = destinationColumn?.id === next[next.length - 1]?.id;
    const movedFromDifferentColumn = target.sourceColumnId !== target.destinationColumnId;
    if (isLastColumn && movedFromDifferentColumn) {
      const cardEl = document.getElementById(`card-${target.cardId}`);
      if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        triggerCelebration(rect.left + rect.width / 2, rect.top + rect.height / 2);
      } else {
        triggerCelebration(window.innerWidth / 2, window.innerHeight / 2);
      }
      playCardDoneSound();
      toast({ message: "Task complete! ✦", type: "success" });
    }

    const sourceOrderedCardIds = next.find((column) => column.id === target.sourceColumnId)?.cards.map((card) => card.id) ?? [];
    const destinationOrderedCardIds = next.find((column) => column.id === target.destinationColumnId)?.cards.map((card) => card.id) ?? [];
    const response = await fetch("/api/cards/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: target.cardId,
        sourceColumnId: target.sourceColumnId,
        destinationColumnId: target.destinationColumnId,
        sourceOrderedCardIds,
        destinationOrderedCardIds
      })
    });

    if (!response.ok) {
      setColumns(previous);
      setSyncError("Something did not sync. Try again.");
      toast({ message: "Sync failed. Changes rolled back.", type: "error" });
    }
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

  // Dynamic Filtering based on Search Query & Today Filter
  const filteredColumns = columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => {
      const matchesSearch =
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (card.description && card.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesToday = !isTodayFilterActive || isCardDueTodayOrOverdue(card);

      return matchesSearch && matchesToday;
    })
  }));

  // Statistics Computations
  const totalCards = columns.reduce((acc, col) => acc + col.cards.length, 0);
  const doneCards = columns.reduce((acc, col) => acc + col.cards.filter((c) => c.status === "DONE").length, 0);
  const overdueCards = columns.reduce((acc, col) => acc + col.cards.filter((c) => c.dueDate && new Date(c.dueDate) < new Date() && c.status !== "DONE").length, 0);
  const doingCards = columns.reduce((acc, col) => acc + col.cards.filter((c) => c.status === "DOING").length, 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ── Header ── */}
      <div className="lofi-panel grid gap-2 rounded-2xl p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-dusk-amber">Board Channel</p>
          <h2 className="mt-0.5 flex flex-wrap items-center gap-2 text-lg font-semibold">
            {board.name}
            {isFocusMode && (
              <span className="rounded bg-dusk-amber/15 border border-dusk-amber/30 px-1.5 py-0.5 text-[10px] text-dusk-amber font-mono font-medium animate-pulse">
                FOCUS ACTIVE
              </span>
            )}
          </h2>
          <p className="text-xs text-stone-500">
            Drag cards across columns. Press <kbd className="rounded bg-white/5 px-1 py-0.5 font-mono text-xs">F</kbd> for focus.
          </p>
        </div>

        {/* ── Premium Control Bar ── */}
        <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
          <div className="flex h-11 w-[8.25rem] shrink-0 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3">
            <span className="text-[9px] uppercase tracking-wider text-stone-500 select-none">Total</span>
            <span className="text-base font-bold leading-none text-stone-200">{totalCards}</span>
          </div>
          <div className="flex h-11 w-[8.25rem] shrink-0 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3">
            <span className="flex items-center text-[9px] uppercase tracking-wider text-dusk-lavender select-none">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-dusk-lavender" />
              Progress
            </span>
            <span className="text-base font-bold leading-none text-dusk-lavender">{doingCards}</span>
          </div>
          <div className="flex h-11 w-[8.25rem] shrink-0 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3">
            <span className="flex items-center text-[9px] uppercase tracking-wider text-dusk-amber select-none">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-dusk-amber" />
              Done
            </span>
            <span className="text-base font-bold leading-none text-dusk-amber">{doneCards}</span>
          </div>
          <div className="flex h-11 w-[8.25rem] shrink-0 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3">
            <span className="flex items-center text-[9px] uppercase tracking-wider text-dusk-rose select-none">
              <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full bg-dusk-rose", overdueCards > 0 ? "animate-pulse" : "")} />
              Overdue
            </span>
            <span className="text-base font-bold leading-none text-dusk-rose">{overdueCards}</span>
          </div>
        </div>
        </div>

        {/* â”€â”€ Premium Control Bar â”€â”€ */}
          <div className="flex flex-wrap items-center justify-start gap-2">
          {/* Live Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards..."
              className="h-9 w-44 rounded-xl border border-white/10 bg-white/[0.045] pl-9 pr-8 text-xs text-stone-100 placeholder-stone-500 outline-none transition focus:border-dusk-lavender/50 focus:bg-white/5"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-xs text-stone-500 hover:text-stone-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Today Quick Filter */}
          <button
            type="button"
            onClick={() => setIsTodayFilterActive(!isTodayFilterActive)}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition select-none",
              isTodayFilterActive
                ? "border-dusk-amber/40 bg-dusk-amber/15 text-dusk-amber font-semibold"
                : "border-white/10 bg-white/[0.035] text-stone-300 hover:border-white/20 hover:bg-white/5"
            )}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Today
          </button>

          {/* Focus Toggle */}
          <button
            type="button"
            onClick={toggleFocusMode}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition select-none",
              isFocusMode
                ? "border-dusk-lavender/40 bg-dusk-lavender/15 text-dusk-lavender font-semibold"
                : "border-white/10 bg-white/[0.035] text-stone-300 hover:border-white/20 hover:bg-white/5"
            )}
          >
            {isFocusMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {isFocusMode ? "Focus mode" : "Focus"}
          </button>

          {/* Undo */}
          <button
            type="button"
            disabled={moveHistory.length === 0}
            onClick={undoLastMove}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition select-none",
              moveHistory.length > 0
                ? "border-dusk-cyan/40 bg-dusk-cyan/15 text-dusk-cyan hover:bg-dusk-cyan/20"
                : "border-white/5 bg-white/[0.01] text-stone-600 cursor-not-allowed"
            )}
            title="Undo last card move (Ctrl+Z)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Undo
          </button>

          {/* Add Column Form */}
          <Button
            className="h-9 text-xs"
            type="button"
            aria-label="Add column"
            onClick={() => {
              setSyncError(null);
              setIsColumnModalOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Column
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
            setIsColumnModalOpen(false);
          }}
          hasUnsavedChanges={columnName.trim() !== "" || columnColor !== "default" || columnIcon !== "kanban"}
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
                  setIsColumnModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button disabled={!columnName.trim()}>
                <Plus className="h-4 w-4" />
                Add column
              </Button>
            </div>
          </form>
        </AppModal>
      ) : null}

      {/* ── Board Columns Grid ── */}
      {syncError ? <p className="mt-4 rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{syncError}</p> : null}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
      >
        <div className="scrollbar-soft mt-4 flex min-h-0 flex-1 gap-4 overflow-x-auto pb-1">
          <SortableContext items={columns.map((column) => `column:${column.id}`)} strategy={horizontalListSortingStrategy}>
            {filteredColumns.map((column, index) => (
              <KanbanColumn
                key={column.id}
                column={column}
                activeCardId={activeCardId}
                isDropTarget={activeDropColumnId === column.id}
                onCreateCard={createCard}
                onCardDeleted={deleteCard}
                onCardSaved={saveCard}
                onColumnDeleted={deleteColumn}
                onColumnSaved={updateColumn}
                isFirst={index === 0}
              />
            ))}
          </SortableContext>
        </div>
        <DragOverlay adjustScale={false} dropAnimation={null} zIndex={10000}>
          {activeCard ? <KanbanCardDragPreview card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
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
        <span className="text-xs uppercase tracking-[0.16em] text-stone-400">Color</span>
        <span className="text-xs text-stone-500">{getColumnThemeOption(value).label}</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {columnThemeOptions.map((option) => (
          <button
            key={option.id}
            aria-label={`Use ${option.label} column color`}
            className={cn(
              "grid h-9 place-items-center rounded-lg border bg-white/[0.035] transition hover:-translate-y-0.5 hover:border-dusk-lavender/40",
              option.id === value
                ? "border-dusk-amber shadow-[0_0_0_2px_rgba(249,199,132,0.16)]"
                : "border-white/10"
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
    <article className={cn("pointer-events-none w-72 rotate-1 rounded-md border p-3 text-sm shadow-2xl shadow-dusk-lavender/30 ring-2 ring-dusk-lavender/30", colorMeta.cardClass)}>
      <div className="space-y-2">
        <p className="font-medium text-stone-100">{card.title}</p>
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

function normalizeCard(card: Card): Card {
  return {
    ...card,
    color: normalizeCardColor(card.color),
    checklist: Array.isArray(card.checklist) ? card.checklist : [],
    dueDate: card.dueDate ? new Date(card.dueDate).toISOString() : null,
    dueDateAllDay: card.dueDateAllDay ?? false
  };
}
