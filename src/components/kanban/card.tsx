"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { CalendarClock, CheckSquare, Clock, FileText, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { CardModal } from "@/components/kanban/card-modal";
import { AssigneeStack } from "@/components/kanban/assignee-avatar";
import { RetroStickerImage } from "@/components/stickers/retro-sticker-picker";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import { formatMediumDateTime, formatShortDate } from "@/lib/date-format";
import { formatCardDateRange } from "@/lib/kanban/due-date";
import { getDifficultyMetadata, type DifficultyScore } from "@/lib/kanban/difficulty";
import { resolveAssignees } from "@/lib/kanban/assignees";
import { getStatusMeta } from "@/lib/kanban/status";
import { normalizeRetroStickerSelection } from "@/lib/stickers/retro-stickers";
import { getCardColorMeta, normalizeCardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { Card, CardAssignee } from "@/types/kanban";

export function KanbanCard({
  card,
  columnId,
  isDragPreviewTarget = false,
  isDragDisabled = false,
  members = [],
  currentUserId,
  onSaved,
  onDeleted
}: {
  card: Card;
  columnId: string;
  isDragPreviewTarget?: boolean;
  isDragDisabled?: boolean;
  members?: CardAssignee[];
  currentUserId?: string;
  onSaved: (card: Card) => void;
  onDeleted: (cardId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    setMounted(true);
  }, []);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card:${card.id}`,
    data: { type: "card", cardId: card.id, columnId },
    disabled: { draggable: isDragDisabled },
    // Board state owns placement; sortable transforms would move cards twice.
    strategy: () => null,
    animateLayoutChanges: () => false
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const completedChecklist = card.checklist.filter((item) => item.checked).length;
  const statusMeta = getStatusMeta(card.status);
  const colorMeta = getCardColorMeta(card.color);
  const visibleStickers = normalizeRetroStickerSelection(card.stickers);
  const isOverdue = mounted && card.dueDate && new Date(card.dueDate) < new Date() && card.status !== "DONE";

  async function saveCard(payload: {
    title: string;
    description: string | null;
    status: import("@/types/kanban").CardStatus;
    color: import("@/lib/theme/card-colors").CardColor;
    checklist: import("@/types/kanban").ChecklistItem[];
    startDate?: string | null;
    startDateAllDay?: boolean;
    dueDate: string | null;
    dueDateAllDay: boolean;
    priority: "LOW" | "MEDIUM" | "HIGH";
    isStarred: boolean;
    rewardCoins?: number;
    privateCoins?: unknown;
    stickers?: string[];
    difficulty?: DifficultyScore | null;
    assigneeIds?: string[];
  }) {
    const response = await fetch("/api/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: card.id,
        ...payload
      })
    });
    const data = (await response.json()) as { card?: Card; error?: string };

    if (data.card) {
      const updatedAssigneeIds = data.card.assigneeIds !== undefined ? data.card.assigneeIds : card.assigneeIds;
      const resolved = (data.card.assignees && data.card.assignees.length > 0)
        ? data.card.assignees
        : resolveAssignees(updatedAssigneeIds, members);

      onSaved({
        ...data.card,
        color: normalizeCardColor(data.card.color),
        checklist: Array.isArray(data.card.checklist) ? data.card.checklist : [],
        startDate: data.card.startDate !== undefined ? data.card.startDate : card.startDate,
        startDateAllDay: data.card.startDateAllDay !== undefined ? data.card.startDateAllDay : card.startDateAllDay,
        dueDate: data.card.dueDate ? new Date(data.card.dueDate).toISOString() : null,
        dueDateAllDay: data.card.dueDateAllDay ?? false,
        isStarred: data.card.isStarred ?? false,
        difficulty: data.card.difficulty !== undefined ? data.card.difficulty : card.difficulty,
        assigneeIds: updatedAssigneeIds,
        assignees: resolved,
      });
      setIsEditing(false);
      toast({ message: "Card updated.", type: "success" });
    } else {
      toast({ message: data.error ?? "Could not save card.", type: "error" });
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
      toast({ message: "Card deleted.", type: "success" });
    } else {
      const data = await response.json().catch(() => ({}));
      toast({ message: data.error ?? "Could not delete card.", type: "error" });
    }
  }

  return (
    <>
      <article
        id={`card-${card.id}`}
        ref={setNodeRef}
        style={style}
        className={cn(
          "scroll-mt-24 cursor-grab rounded-xl border p-3 text-sm shadow-sm transition duration-200 active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/60 select-none touch-none",
          colorMeta.cardClass,
          card.status === "DONE" && "card-completed",
          isDragging && "opacity-60",
          isDragPreviewTarget && "border-dusk-lavender/50 bg-dusk-lavender/10 opacity-25"
        )}
        suppressHydrationWarning
        {...attributes}
        {...listeners}
        role="button"
        tabIndex={0}
        onClick={(event) => {
          if (event.button === 0 && !isDragging) {
            setIsEditing(true);
          }
        }}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !isDragging) {
            event.preventDefault();
            setIsEditing(true);
          }
        }}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-900 break-words dark:text-stone-100 leading-snug">{card.title}</p>
              {visibleStickers.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1.5 select-none leading-none">
                  {visibleStickers.map((st, i) => (
                    <span
                      key={`${st}-${i}`}
                      className="inline-grid h-7 w-7 cursor-default place-items-center transition-transform duration-200 hover:scale-110"
                      title="Retro sticker"
                    >
                      <RetroStickerImage size={28} src={st} />
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
              {isOverdue && (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="relative flex items-center justify-center cursor-help"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className="relative flex h-5 w-5 items-center justify-center rounded-full border border-red-300 bg-red-50 text-red-600 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-400 hover:border-red-400 hover:bg-red-100 dark:hover:bg-red-500/25 transition shadow-xs"
                          aria-label="Overdue task indicator"
                        >
                          <Clock className="h-3 w-3 animate-pulse text-red-600 dark:text-red-400" />
                          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end" className="border-red-300 bg-white text-[11px] font-medium text-red-700 shadow-md dark:border-red-500/30 dark:bg-ink-950/98 dark:text-red-200">
                      <p className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-red-600 dark:text-red-400 shrink-0" />
                        <span>Overdue · {card.dueDate ? formatMediumDateTime(card.dueDate, card.dueDateAllDay) : "Past due"}</span>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {card.isStarred && (
                <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500 dark:fill-dusk-amber dark:text-dusk-amber" />
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", statusMeta.badgeClass)}>{statusMeta.label}</span>
            <span className={cn(
              "rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide",
              card.priority === "HIGH" && "border-red-200 bg-red-50 text-red-700 font-semibold dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-400",
              card.priority === "MEDIUM" && "border-amber-200 bg-amber-50 text-amber-700 font-medium dark:border-dusk-amber/20 dark:bg-dusk-amber/10 dark:text-dusk-amber",
              card.priority === "LOW" && "border-stone-200 bg-stone-100 text-stone-600 font-medium dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300"
            )}>
              {card.priority ?? "MEDIUM"}
            </span>
            {card.difficulty ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold select-none",
                  getDifficultyMetadata(card.difficulty)?.badgeClass
                )}
                title={getDifficultyMetadata(card.difficulty)?.title}
              >
                <Zap className="h-3 w-3" />
                {getDifficultyMetadata(card.difficulty)?.pointsLabel}
              </span>
            ) : null}
            {card.checklist.length > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:border-dusk-cyan/20 dark:bg-dusk-cyan/10 dark:text-dusk-cyan">
                <CheckSquare className="h-3 w-3" />
                {completedChecklist}/{card.checklist.length}
              </span>
            ) : null}
            {card.note ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:border-dusk-lavender/20 dark:bg-dusk-lavender/10 dark:text-dusk-lavender" title="This card has a note">
                <FileText className="h-3 w-3" />
                Note
              </span>
            ) : null}
          </div>
          {card.description ? <p className="line-clamp-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300/90 break-words">{card.description}</p> : null}
          {(card.startDate || card.dueDate || (card.assignees && card.assignees.length > 0) || (card.assigneeIds && card.assigneeIds.length > 0)) ? (
            <div className="flex items-center justify-between gap-2 pt-1">
              {(card.startDate || card.dueDate) ? (
                <p
                  className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-dusk-amber/20 dark:bg-dusk-amber/10 dark:text-dusk-amber whitespace-nowrap min-w-0 max-w-[70%]"
                  title={
                    card.startDate && card.dueDate
                      ? `เริ่ม: ${formatMediumDateTime(card.startDate, card.startDateAllDay)} — กำหนดส่ง: ${formatMediumDateTime(card.dueDate, card.dueDateAllDay)}`
                      : card.startDate
                        ? `เริ่ม: ${formatMediumDateTime(card.startDate, card.startDateAllDay)}`
                        : card.dueDate
                          ? `กำหนดส่ง: ${formatMediumDateTime(card.dueDate, card.dueDateAllDay)}`
                          : undefined
                  }
                >
                  <CalendarClock className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {formatCardDateRange({
                      startDate: card.startDate,
                      startDateAllDay: card.startDateAllDay,
                      dueDate: card.dueDate,
                      dueDateAllDay: card.dueDateAllDay,
                      formatFn: (val) => formatShortDate(val)
                    })}
                  </span>
                </p>
              ) : <div />}
              <AssigneeStack
                assignees={
                  (card.assignees && card.assignees.length > 0)
                    ? card.assignees
                    : (card.assigneeIds && card.assigneeIds.length > 0 && members.length > 0)
                      ? resolveAssignees(card.assigneeIds, members)
                      : []
                }
                size={22}
              />
            </div>
          ) : null}
        </div>
      </article>
      <CardModal
        card={card}
        mode="edit"
        open={isEditing}
        members={members}
        currentUserId={currentUserId}
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
    </>
  );
}
