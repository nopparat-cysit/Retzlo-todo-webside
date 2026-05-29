"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { CalendarClock, CheckSquare } from "lucide-react";
import { useState } from "react";

import { CardModal } from "@/components/kanban/card-modal";
import { formatMediumDateTime } from "@/lib/date-format";
import { getStatusMeta } from "@/lib/kanban/status";
import { getCardColorMeta, normalizeCardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/kanban";

export function KanbanCard({
  card,
  columnId,
  isDragPreviewTarget = false,
  onDeleted,
  onSaved
}: {
  card: Card;
  columnId: string;
  isDragPreviewTarget?: boolean;
  onSaved: (card: Card) => void;
  onDeleted: (cardId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card:${card.id}`,
    data: { type: "card", cardId: card.id, columnId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const completedChecklist = card.checklist.filter((item) => item.checked).length;
  const statusMeta = getStatusMeta(card.status);
  const colorMeta = getCardColorMeta(card.color);

  async function saveCard(payload: {
    title: string;
    description: string | null;
    status: Card["status"];
    color: Card["color"];
    checklist: Card["checklist"];
    dueDate: string | null;
    dueDateAllDay: boolean;
  }) {
    const response = await fetch("/api/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: card.id,
        ...payload
      })
    });
    const data = (await response.json()) as { card?: Card };

    if (data.card) {
      onSaved({
        ...data.card,
        color: normalizeCardColor(data.card.color),
        checklist: Array.isArray(data.card.checklist) ? data.card.checklist : [],
        dueDate: data.card.dueDate ? new Date(data.card.dueDate).toISOString() : null,
        dueDateAllDay: data.card.dueDateAllDay ?? false
      });
      setIsEditing(false);
    }
  }

  async function deleteCard() {
    const response = await fetch(`/api/cards?cardId=${card.id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      onDeleted(card.id);
      setIsEditing(false);
    }
  }

  return (
    <article
      id={`card-${card.id}`}
      ref={setNodeRef}
      style={style}
      className={cn(
        "scroll-mt-24 cursor-grab rounded-md border p-3 text-sm shadow-sm transition active:cursor-grabbing",
        colorMeta.cardClass,
        isDragging && "opacity-60",
        isDragPreviewTarget && "border-dusk-lavender/50 bg-dusk-lavender/10 opacity-25"
      )}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        if (event.button === 0) {
          setIsEditing(true);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIsEditing(true);
        }
      }}
    >
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
        {card.description ? <p className="line-clamp-3 text-stone-400">{card.description}</p> : null}
        {card.dueDate ? (
          <p className="inline-flex items-center gap-1 rounded bg-dusk-amber/10 px-2 py-1 text-xs text-dusk-amber">
            <CalendarClock className="h-3 w-3" />
            {formatMediumDateTime(card.dueDate, card.dueDateAllDay)}
          </p>
        ) : null}
      </div>
      <CardModal
        card={card}
        mode="edit"
        open={isEditing}
        onClose={() => setIsEditing(false)}
        onDelete={deleteCard}
        onSubmit={saveCard}
      />
    </article>
  );
}
