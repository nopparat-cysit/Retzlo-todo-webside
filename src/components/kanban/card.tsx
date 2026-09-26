"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { CalendarClock, CheckSquare, Clock, FileText, Star, Zap } from "lucide-react";
import { memo, useEffect, useState } from "react";

import { AssigneeStack } from "@/components/kanban/assignee-avatar";
import { RetroStickerImage } from "@/components/stickers/retro-sticker-picker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatMediumDateTime, formatShortDate } from "@/lib/date-format";
import { formatCardDateRange } from "@/lib/kanban/due-date";
import { getDifficultyMetadata, type DifficultyScore } from "@/lib/kanban/difficulty";
import { resolveAssignees } from "@/lib/kanban/assignees";
import { getStatusMeta } from "@/lib/kanban/status";
import { normalizeRetroStickerSelection } from "@/lib/stickers/retro-stickers";
import { getCardColorMeta } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { Card, CardAssignee } from "@/types/kanban";

export interface KanbanCardProps {
  card: Card;
  columnId: string;
  isDragPreviewTarget?: boolean;
  isDragDisabled?: boolean;
  members?: CardAssignee[];
  currentUserId?: string;
  density?: "comfortable" | "compact";
  onEdit?: (card: Card) => void;
  onSaved?: (card: Card) => void;
  onDeleted?: (cardId: string) => void;
}

function areCardPropsEqual(prev: KanbanCardProps, next: KanbanCardProps) {
  if (prev.isDragPreviewTarget !== next.isDragPreviewTarget) return false;
  if (prev.isDragDisabled !== next.isDragDisabled) return false;
  if (prev.columnId !== next.columnId) return false;
  if (prev.currentUserId !== next.currentUserId) return false;
  if (prev.density !== next.density) return false;
  if (prev.onEdit !== next.onEdit) return false;
  if (prev.members !== next.members) return false;
  if (prev.card === next.card) return true;
  return (
    prev.card.id === next.card.id &&
    prev.card.title === next.card.title &&
    prev.card.description === next.card.description &&
    prev.card.status === next.card.status &&
    prev.card.color === next.card.color &&
    prev.card.position === next.card.position &&
    prev.card.dueDate === next.card.dueDate &&
    prev.card.dueDateAllDay === next.card.dueDateAllDay &&
    prev.card.startDate === next.card.startDate &&
    prev.card.startDateAllDay === next.card.startDateAllDay &&
    prev.card.priority === next.card.priority &&
    prev.card.isStarred === next.card.isStarred &&
    prev.card.rewardCoins === next.card.rewardCoins &&
    prev.card.difficulty === next.card.difficulty &&
    prev.card.note === next.card.note &&
    prev.card.checklist === next.card.checklist &&
    prev.card.stickers === next.card.stickers &&
    prev.card.assigneeIds === next.card.assigneeIds &&
    prev.card.assignees === next.card.assignees
  );
}

function KanbanCardComponent({
  card,
  columnId,
  isDragPreviewTarget = false,
  isDragDisabled = false,
  members = [],
  density = "comfortable",
  onEdit
}: KanbanCardProps) {
  const [mounted, setMounted] = useState(false);
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

  const isCompact = density === "compact";
  const compactStickers = visibleStickers.slice(0, 2);

  return (
    <article
      id={`card-${card.id}`}
      ref={setNodeRef}
      style={style}
      className={cn(
        "scroll-mt-24 cursor-grab rounded-xl border text-sm shadow-sm transition duration-200 active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/60 select-none touch-none",
        isCompact ? "p-2 sm:p-2.5" : "p-2.5 sm:p-3",
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
          const selection = typeof window !== "undefined" ? window.getSelection()?.toString() : "";
          if (selection && selection.trim().length > 0) return;
          onEdit?.(card);
        }
      }}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && !isDragging) {
          event.preventDefault();
          onEdit?.(card);
        }
      }}
    >
      {isCompact ? (
        /* ── Compact View (ย่อข้อมูล Minimalist & High Density) ── */
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex-1 min-w-0 flex items-start gap-1.5">
              {compactStickers.length > 0 && (
                <div className="flex shrink-0 items-center gap-0.5 pt-0.5 select-none leading-none">
                  {compactStickers.map((st, i) => (
                    <span
                      key={`${st}-${i}`}
                      className="inline-grid h-4.5 w-4.5 cursor-default place-items-center"
                      title="Retro sticker"
                    >
                      <RetroStickerImage size={18} src={st} />
                    </span>
                  ))}
                </div>
              )}
              <p className="font-medium text-xs sm:text-[13px] text-stone-900 break-words dark:text-stone-100 leading-snug line-clamp-2 select-none">
                {card.title}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0 pt-0.5">
              {isOverdue && (
                <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400" title="Overdue">
                  <Clock className="h-2.5 w-2.5 animate-pulse" />
                </span>
              )}
              {card.isStarred && (
                <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-500 dark:fill-dusk-amber dark:text-dusk-amber" />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <span
              className={cn(
                "rounded-md border px-1.5 py-0.2 text-[10px] uppercase font-semibold",
                card.priority === "HIGH" && "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-400",
                card.priority === "MEDIUM" && "border-amber-200 bg-amber-50 text-amber-700 dark:border-dusk-amber/20 dark:bg-dusk-amber/10 dark:text-dusk-amber",
                card.priority === "LOW" && "border-stone-200 bg-stone-100 text-stone-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300"
              )}
            >
              {card.priority ?? "MEDIUM"}
            </span>

            {card.difficulty ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.2 text-[10px] font-semibold select-none",
                  getDifficultyMetadata(card.difficulty)?.badgeClass
                )}
                title={getDifficultyMetadata(card.difficulty)?.title}
              >
                <Zap className="h-2.5 w-2.5" />
                {card.difficulty} pts
              </span>
            ) : null}

            {card.checklist.length > 0 ? (
              <span className="inline-flex items-center gap-0.5 rounded-md border border-teal-200 bg-teal-50 px-1.5 py-0.2 text-[10px] font-medium text-teal-700 dark:border-dusk-cyan/20 dark:bg-dusk-cyan/10 dark:text-dusk-cyan">
                <CheckSquare className="h-2.5 w-2.5" />
                {completedChecklist}/{card.checklist.length}
              </span>
            ) : null}

            {card.note ? (
              <span className="inline-flex items-center gap-0.5 rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.2 text-[10px] font-medium text-indigo-700 dark:border-dusk-lavender/20 dark:bg-dusk-lavender/10 dark:text-dusk-lavender" title="Has note">
                <FileText className="h-2.5 w-2.5" />
              </span>
            ) : null}

            {(card.startDate || card.dueDate || (card.assignees && card.assignees.length > 0) || (card.assigneeIds && card.assigneeIds.length > 0)) && (
              <div className="ml-auto flex items-center gap-1.5">
                {(card.startDate || card.dueDate) && (
                  <span className="text-[10px] text-stone-500 font-mono">
                    {formatCardDateRange({
                      startDate: card.startDate,
                      startDateAllDay: card.startDateAllDay,
                      dueDate: card.dueDate,
                      dueDateAllDay: card.dueDateAllDay,
                      formatFn: (val) => formatShortDate(val)
                    })}
                  </span>
                )}
                <AssigneeStack
                  assignees={
                    card.assignees && card.assignees.length > 0
                      ? card.assignees
                      : card.assigneeIds && card.assigneeIds.length > 0 && members.length > 0
                        ? resolveAssignees(card.assigneeIds, members)
                        : []
                  }
                  size={16}
                  max={2}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Comfortable View (สบายตา ปรับสัดส่วนให้ไม่บวมเกินไป) ── */
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-900 break-words dark:text-stone-100 leading-snug select-none">
                {card.title}
              </p>
              {visibleStickers.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1.5 select-none leading-none">
                  {visibleStickers.map((st, i) => (
                    <span
                      key={`${st}-${i}`}
                      className="inline-grid h-6 w-6 cursor-default place-items-center transition-transform duration-200 hover:scale-110"
                      title="Retro sticker"
                    >
                      <RetroStickerImage size={22} src={st} />
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
          {card.description ? <p className="line-clamp-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300/90 break-words">{card.description}</p> : null}
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
      )}
    </article>
  );
}

export const KanbanCard = memo(KanbanCardComponent, areCardPropsEqual);
