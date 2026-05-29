"use client";

import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import { useState } from "react";

import { CardModal } from "@/components/kanban/card-modal";
import { KanbanCard } from "@/components/kanban/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Card, CardStatus, ChecklistItem, ColumnWithCards } from "@/types/kanban";

export function KanbanColumn({
  column,
  activeCardId,
  isDropTarget,
  onCreateCard,
  onCardDeleted,
  onCardSaved
}: {
  column: ColumnWithCards;
  activeCardId: string | null;
  isDropTarget: boolean;
  onCreateCard: (
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
  ) => Promise<void>;
  onCardDeleted: (cardId: string) => void;
  onCardSaved: (card: Card) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `column:${column.id}`,
    data: { type: "column", columnId: column.id }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex h-full min-h-0 w-80 shrink-0 flex-col rounded-lg border border-white/10 bg-white/[0.045] transition",
        isDropTarget && "border-dusk-lavender/60 bg-dusk-lavender/[0.08] shadow-lg shadow-dusk-lavender/10 ring-2 ring-dusk-lavender/20",
        isDragging && "opacity-70"
      )}
    >
      <header className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
        <button className="text-stone-500 hover:text-dusk-lavender" aria-label="Drag column" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <h2 className="flex-1 text-sm font-semibold text-stone-100">{column.name}</h2>
        <span className="rounded bg-white/5 px-2 py-1 text-xs text-stone-400">{column.cards.length}</span>
      </header>
      <div className={cn("scrollbar-soft flex-1 space-y-3 overflow-y-auto p-3", isDropTarget && "bg-white/[0.025]")}>
        <SortableContext items={column.cards.map((card) => `card:${card.id}`)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              columnId={column.id}
              isDragPreviewTarget={activeCardId === card.id}
              onDeleted={onCardDeleted}
              onSaved={onCardSaved}
            />
          ))}
        </SortableContext>
        {column.cards.length === 0 ? (
          <div
            className={cn(
              "rounded-md border border-dashed border-white/10 p-4 text-center text-sm text-stone-500 transition",
              isDropTarget && "border-dusk-lavender/60 bg-dusk-lavender/10 text-dusk-lavender"
            )}
          >
            Drop a card here.
          </div>
        ) : null}
      </div>
      <div className="border-t border-white/10 p-3">
        <Button className="w-full" type="button" variant="ghost" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add card
        </Button>
      </div>
      <CardModal
        mode="create"
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (payload) => {
          await onCreateCard(column.id, payload);
          setIsModalOpen(false);
        }}
      />
    </section>
  );
}
