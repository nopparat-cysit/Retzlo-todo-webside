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
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { CalendarClock, CheckSquare, Plus } from "lucide-react";
import { FormEvent, useState } from "react";

import { KanbanColumn } from "@/components/kanban/column";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMediumDateTime } from "@/lib/date-format";
import { moveCard, reorderColumns } from "@/lib/kanban/reorder";
import { getStatusMeta } from "@/lib/kanban/status";
import { getCardColorMeta, normalizeCardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { Card, CardStatus, ChecklistItem, ColumnWithCards } from "@/types/kanban";

interface BoardData {
  id: string;
  name: string;
  columns: ColumnWithCards[];
}

export function KanbanBoard({ board }: { board: BoardData }) {
  const [columns, setColumns] = useState(board.columns);
  const [dragSnapshot, setDragSnapshot] = useState<ColumnWithCards[] | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeDropColumnId, setActiveDropColumnId] = useState<string | null>(null);
  const [columnName, setColumnName] = useState("");
  const [syncError, setSyncError] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function createColumn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!columnName.trim()) {
      return;
    }

    const response = await fetch("/api/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId: board.id, name: columnName.trim() })
    });
    const data = (await response.json()) as { column?: ColumnWithCards; error?: string };

    if (data.column) {
      const column: ColumnWithCards = { ...data.column, cards: [] };
      setColumns((current) => [...current, column]);
      setColumnName("");
    } else {
      setSyncError(data.error ?? "Something did not sync. Try again.");
    }
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
      return;
    }

    setSyncError(data.error ?? "Something did not sync. Try again.");
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
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="lofi-panel flex flex-col justify-between gap-3 rounded-lg p-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">{board.name}</h2>
          <p className="text-sm text-stone-400">Drag cards across columns. Due dates appear on the calendar.</p>
        </div>
        <form className="flex gap-2" onSubmit={createColumn}>
          <Input
            className="w-48"
            value={columnName}
            onChange={(event) => setColumnName(event.target.value)}
            placeholder="Column name"
          />
          <Button aria-label="Add column">
            <Plus className="h-4 w-4" />
            Column
          </Button>
        </form>
      </div>
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
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                activeCardId={activeCardId}
                isDropTarget={activeDropColumnId === column.id}
                onCreateCard={createCard}
                onCardDeleted={deleteCard}
                onCardSaved={saveCard}
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
