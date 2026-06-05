"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { CalendarClock, CheckSquare, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { CardModal } from "@/components/kanban/card-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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
  const isOverdue = mounted && card.dueDate && new Date(card.dueDate) < new Date() && card.status !== "DONE";

  async function saveCard(payload: {
    title: string;
    description: string | null;
    status: Card["status"];
    color: Card["color"];
    checklist: Card["checklist"];
    dueDate: string | null;
    dueDateAllDay: boolean;
    priority: "LOW" | "MEDIUM" | "HIGH";
    isStarred: boolean;
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
        dueDateAllDay: data.card.dueDateAllDay ?? false,
        isStarred: data.card.isStarred ?? false,
      });
      setIsEditing(false);
    }
  }

  async function deleteCard() {
    setIsDeleting(true);
    const response = await fetch(`/api/cards?cardId=${card.id}`, {
      method: "DELETE"
    });
    setIsDeleting(false);

    if (response.ok) {
      onDeleted(card.id);
      setIsEditing(false);
      setIsDeleteConfirmOpen(false);
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
        card.status === "DONE" && "card-completed",
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
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1">
            <p className="font-medium text-stone-100">{card.title}</p>
            {Array.isArray(card.stickers) && card.stickers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 select-none text-[1.15rem] leading-none">
                {card.stickers.map((st, i) => (
                  <span key={i} className="inline-block hover:scale-125 transition-transform duration-200 cursor-default" title="Sticker stamp">{st}</span>
                ))}
              </div>
            )}
          </div>
          {card.isStarred && (
            <Star className="h-3.5 w-3.5 shrink-0 fill-dusk-amber text-dusk-amber" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={cn("rounded border px-2 py-1 text-xs", statusMeta.badgeClass)}>{statusMeta.label}</span>
          <span className={cn(
            "rounded border px-2 py-1 text-xs uppercase tracking-wide",
            card.priority === "HIGH" && "border-red-400/20 bg-red-400/10 text-red-400 font-semibold",
            card.priority === "MEDIUM" && "border-dusk-amber/20 bg-dusk-amber/10 text-dusk-amber",
            card.priority === "LOW" && "border-white/5 bg-white/5 text-stone-400"
          )}>
            {card.priority ?? "MEDIUM"}
          </span>
          {isOverdue ? (
            <span className="inline-flex items-center gap-1 rounded border border-red-500/20 bg-red-400/10 px-2 py-1 text-xs text-red-400 font-semibold animate-pulse">
              ⚠️ Overdue
            </span>
          ) : null}
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
        onDelete={async () => {
          setIsEditing(false);
          setIsDeleteConfirmOpen(true);
        }}
        onSubmit={saveCard}
      />
      <ConfirmModal
        open={isDeleteConfirmOpen}
        title="Delete card"
        message={`Are you sure you want to delete "${card.title}"? This action cannot be undone.`}
        confirmLabel="Delete card"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={deleteCard}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />
    </article>
  );
}
