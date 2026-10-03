"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Coins,
  FileText,
  MoreVertical,
  Plus,
  Sparkles,
  Square,
  Star,
  Trash2,
  User as UserIcon,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Card, CardAssignee, CardPriority, CardStatus, ColumnWithCards } from "@/types/kanban";
import { formatCardDateRange } from "@/lib/kanban/due-date";
import { playCardDoneSound } from "@/lib/sound";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getColumnThemeOption } from "@/lib/kanban/column-settings";

function checkIsOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  return !isNaN(d.getTime()) && d.getTime() < Date.now();
}

interface BoardListViewProps {
  columns: ColumnWithCards[];
  allColumns: ColumnWithCards[];
  members: CardAssignee[];
  currentUserId?: string;
  onEditCard: (card: Card) => void;
  onCreateCard: (columnId: string, title: string) => Promise<void> | void;
  onCardDeleted?: (cardId: string) => void;
  onCardSaved?: (card: Card) => void;
}

const PRIORITY_CONFIG: Record<
  CardPriority,
  { label: string; icon: typeof ArrowUp; badgeClass: string }
> = {
  HIGH: {
    label: "High",
    icon: ArrowUp,
    badgeClass: "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400"
  },
  MEDIUM: {
    label: "Medium",
    icon: ArrowRight,
    badgeClass: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400"
  },
  LOW: {
    label: "Low",
    icon: ArrowDown,
    badgeClass: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400"
  }
};

export function BoardListView({
  columns,
  allColumns,
  members,
  currentUserId,
  onEditCard,
  onCreateCard,
  onCardDeleted,
  onCardSaved
}: BoardListViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [addingInColumnId, setAddingInColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleGroup = (columnId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const handleQuickAdd = async (columnId: string) => {
    if (!newCardTitle.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onCreateCard(columnId, newCardTitle.trim());
      setNewCardTitle("");
      setAddingInColumnId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCardComplete = async (card: Card, e: React.MouseEvent) => {
    e.stopPropagation();
    const isDone = card.status === "DONE";
    const nextStatus: CardStatus = isDone ? "TODO" : "DONE";

    // Find destination column corresponding to next status
    const targetCol =
      allColumns.find((c) => c.defaultCardStatus === nextStatus) ||
      (nextStatus === "DONE" ? allColumns[allColumns.length - 1] : allColumns[0]);

    if (!targetCol) return;

    if (!isDone) {
      playCardDoneSound();
    }

    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          status: nextStatus,
          columnId: targetCol.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.card && onCardSaved) {
          onCardSaved(data.card);
        }
      }
    } catch {}
  };

  const handleMoveColumn = async (card: Card, targetColumn: ColumnWithCards) => {
    if (card.columnId === targetColumn.id) return;
    const nextStatus = targetColumn.defaultCardStatus || card.status;

    if (nextStatus === "DONE" && card.status !== "DONE") {
      playCardDoneSound();
    }

    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          status: nextStatus,
          columnId: targetColumn.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.card && onCardSaved) {
          onCardSaved(data.card);
        }
      }
    } catch {}
  };

  const totalCardsCount = columns.reduce((acc, col) => acc + col.cards.length, 0);

  if (columns.length === 0) {
    return (
      <div className="lofi-panel mt-4 flex min-h-[320px] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <h3 className="text-base font-semibold text-stone-100">No columns on this board yet</h3>
        <p className="mt-1 text-xs text-stone-400">Switch to Board view to add your first column.</p>
      </div>
    );
  }

  return (
    <div className="relative mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white/70 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-ink-950/40">
      {/* ── Table Container with Horizontal Scroll ── */}
      <div className="scrollbar-soft flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-[850px] text-xs">
          {/* ── Table Header ── */}
          <div className="sticky top-0 z-20 flex items-center border-b border-stone-200/80 bg-stone-100/90 px-4 py-2.5 font-semibold text-stone-600 backdrop-blur-md dark:border-white/10 dark:bg-stone-900/90 dark:text-stone-300">
            <div className="w-10 text-center">#</div>
            <div className="flex-1 min-w-[240px] pl-2">Work (Task Title)</div>
            <div className="w-36 px-2">Assignee</div>
            <div className="w-28 px-2 text-center">Priority</div>
            <div className="w-36 px-2">Status / Column</div>
            <div className="w-24 px-2 text-center">Points</div>
            <div className="w-32 px-2 text-right">Due Date</div>
            <div className="w-12 text-center">•••</div>
          </div>

          {/* ── Grouped Sections by Column ── */}
          <div className="divide-y divide-stone-200/50 dark:divide-white/5">
            {columns.map((column) => {
              const isCollapsed = collapsedGroups[column.id] ?? false;
              const themeOption = getColumnThemeOption(column.color);
              const cardCount = column.cards.length;

              return (
                <div key={column.id} className="group/section">
                  {/* ── Section Accordion Header (Status Group) ── */}
                  <div
                    onClick={() => toggleGroup(column.id)}
                    className="flex cursor-pointer select-none items-center justify-between bg-stone-50/70 px-4 py-2 transition-colors hover:bg-stone-100/70 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={isCollapsed ? `Expand ${column.name}` : `Collapse ${column.name}`}
                        className="grid h-5 w-5 place-items-center rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {/* Theme color indicator dot */}
                      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0 shadow-xs", themeOption.swatchClass)} />

                      <span className="font-bold text-stone-800 dark:text-stone-200">{column.name}</span>
                      <span className="rounded-full bg-stone-200/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-stone-600 dark:bg-white/10 dark:text-stone-400">
                        {cardCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddingInColumnId(column.id);
                          setCollapsedGroups((prev) => ({ ...prev, [column.id]: false }));
                        }}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-stone-500 hover:bg-white/10 hover:text-dusk-lavender transition"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>

                  {/* ── Rows of Cards inside this group ── */}
                  {!isCollapsed && (
                    <div className="divide-y divide-stone-200/40 dark:divide-white/[0.03]">
                      {column.cards.map((card, idx) => {
                        const priorityConfig = PRIORITY_CONFIG[card.priority] || PRIORITY_CONFIG.MEDIUM;
                        const PriorityIcon = priorityConfig.icon;
                        const isCardDone = card.status === "DONE";
                        const cardOverdue = checkIsOverdue(card.dueDate);
                        const checklistTotal = card.checklist.length;
                        const checklistDone = card.checklist.filter((i) => i.checked).length;
                        const firstAssignee = card.assignees?.[0];

                        return (
                          <div
                            key={card.id}
                            onClick={() => onEditCard(card)}
                            className={cn(
                              "group/row flex cursor-pointer items-center px-4 py-2 transition-colors hover:bg-stone-50 dark:hover:bg-white/[0.04]",
                              isCardDone && "bg-stone-50/40 opacity-75 dark:bg-black/20"
                            )}
                          >
                            {/* Checkbox Complete */}
                            <div className="w-10 text-center">
                              <button
                                type="button"
                                onClick={(e) => handleToggleCardComplete(card, e)}
                                title={isCardDone ? "Mark incomplete" : "Mark as Done"}
                                className={cn(
                                  "grid h-5 w-5 place-items-center rounded border transition-all cursor-pointer",
                                  isCardDone
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-stone-300 bg-white hover:border-emerald-500 dark:border-stone-600 dark:bg-transparent"
                                )}
                              >
                                {isCardDone && <Check className="h-3 w-3 stroke-[3]" />}
                              </button>
                            </div>

                            {/* Work Title */}
                            <div className="flex-1 min-w-[240px] pl-2 flex items-center gap-2">
                              {card.isStarred && (
                                <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                              )}
                              <span
                                className={cn(
                                  "font-medium text-stone-900 transition-colors group-hover/row:text-indigo-600 dark:text-stone-100 dark:group-hover/row:text-dusk-lavender truncate",
                                  isCardDone && "line-through text-stone-400 dark:text-stone-500"
                                )}
                              >
                                {card.title}
                              </span>

                              {/* Badges: Checklist */}
                              {checklistTotal > 0 && (
                                <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-1.5 py-0.2 font-mono text-[10px] text-stone-600 dark:bg-white/10 dark:text-stone-400">
                                  <CheckSquare className="h-2.5 w-2.5" />
                                  <span>
                                    {checklistDone}/{checklistTotal}
                                  </span>
                                </span>
                              )}

                              {/* Description badge */}
                              {card.description && (
                                <FileText className="h-3 w-3 shrink-0 text-stone-400 opacity-70" />
                              )}
                            </div>

                            {/* Assignee */}
                            <div className="w-36 px-2 flex items-center gap-1.5 truncate">
                              {firstAssignee ? (
                                <>
                                  <div className="grid h-5 w-5 place-items-center rounded-full bg-dusk-lavender/30 text-[9px] font-bold text-stone-900 dark:text-stone-100 shrink-0">
                                    {(firstAssignee.name?.[0] ?? firstAssignee.email[0]).toUpperCase()}
                                  </div>
                                  <span className="truncate text-stone-700 dark:text-stone-300">
                                    {firstAssignee.name ?? firstAssignee.email}
                                  </span>
                                  {card.assignees && card.assignees.length > 1 && (
                                    <span className="text-[10px] text-stone-400">
                                      +{card.assignees.length - 1}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="flex items-center gap-1 text-stone-400 italic">
                                  <UserIcon className="h-3 w-3" />
                                  <span>Unassigned</span>
                                </span>
                              )}
                            </div>

                            {/* Priority */}
                            <div className="w-28 px-2 flex justify-center">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold shadow-2xs",
                                  priorityConfig.badgeClass
                                )}
                              >
                                <PriorityIcon className="h-3 w-3 shrink-0" />
                                <span>{priorityConfig.label}</span>
                              </span>
                            </div>

                            {/* Status Dropdown */}
                            <div className="w-36 px-2" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex w-full items-center justify-between rounded-md border border-stone-200/80 bg-white px-2 py-1 text-[11px] font-medium text-stone-700 hover:border-stone-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300 dark:hover:border-white/20"
                                  >
                                    <span className="truncate">{column.name}</span>
                                    <ChevronDown className="h-3 w-3 shrink-0 text-stone-400" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-44 z-[1200]">
                                  <DropdownMenuLabel className="text-xs">Move to column</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {allColumns.map((col) => (
                                    <DropdownMenuItem
                                      key={col.id}
                                      onClick={() => handleMoveColumn(card, col)}
                                      className={cn(
                                        "cursor-pointer text-xs flex items-center justify-between",
                                        col.id === column.id && "font-bold text-dusk-lavender"
                                      )}
                                    >
                                      <span>{col.name}</span>
                                      {col.id === column.id && <Check className="h-3.5 w-3.5" />}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Points / Difficulty */}
                            <div className="w-24 px-2 flex items-center justify-center gap-1 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                              {card.difficulty ? (
                                <span className="rounded bg-stone-100 px-1.5 py-0.2 font-bold dark:bg-white/5">
                                  ⚡ {card.difficulty}
                                </span>
                              ) : null}
                              {card.rewardCoins ? (
                                <span className="flex items-center text-amber-500">
                                  <Coins className="h-3 w-3 mr-0.5" />
                                  {card.rewardCoins}
                                </span>
                              ) : null}
                              {!card.difficulty && !card.rewardCoins && <span className="text-stone-400">-</span>}
                            </div>

                            {/* Due Date */}
                            <div className="w-32 px-2 text-right">
                              {card.dueDate ? (
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 text-[11px] font-medium",
                                    cardOverdue && !isCardDone
                                      ? "text-red-600 font-bold dark:text-red-400"
                                      : "text-stone-600 dark:text-stone-400"
                                  )}
                                >
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatCardDateRange({ dueDate: card.dueDate, dueDateAllDay: card.dueDateAllDay })}</span>
                                </span>
                              ) : (
                                <span className="text-stone-400">-</span>
                              )}
                            </div>

                            {/* More Actions Menu */}
                            <div className="w-12 text-center" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className="grid h-6 w-6 place-items-center rounded text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 z-[1200]">
                                  <DropdownMenuItem onClick={() => onEditCard(card)} className="cursor-pointer text-xs">
                                    Edit task
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {onCardDeleted && (
                                    <DropdownMenuItem
                                      onClick={() => onCardDeleted(card.id)}
                                      className="cursor-pointer text-xs text-red-600 focus:text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                      Delete task
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}

                      {/* Inline quick create row */}
                      {addingInColumnId === column.id ? (
                        <div className="flex items-center gap-2 bg-stone-100/60 px-4 py-2 dark:bg-white/[0.03]">
                          <Plus className="h-4 w-4 text-dusk-lavender shrink-0" />
                          <input
                            type="text"
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleQuickAdd(column.id);
                              if (e.key === "Escape") {
                                setAddingInColumnId(null);
                                setNewCardTitle("");
                              }
                            }}
                            autoFocus
                            placeholder="Type a title and press Enter..."
                            className="flex-1 bg-transparent text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none dark:text-stone-100"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(column.id)}
                            disabled={!newCardTitle.trim() || isSubmitting}
                            className="rounded-md bg-dusk-lavender px-2.5 py-1 text-[11px] font-semibold text-stone-950 transition hover:bg-dusk-lavender/90 disabled:opacity-40"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingInColumnId(null);
                              setNewCardTitle("");
                            }}
                            className="grid h-6 w-6 place-items-center rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setAddingInColumnId(column.id)}
                          className="flex cursor-pointer items-center gap-2 px-4 py-2 text-stone-400 transition hover:bg-stone-50 hover:text-dusk-lavender dark:hover:bg-white/[0.02]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span className="text-[11px] font-medium">+ Create task in {column.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Summary Footer ── */}
          <div className="flex items-center justify-between border-t border-stone-200/80 bg-stone-50/50 px-4 py-2.5 text-[11px] text-stone-500 dark:border-white/10 dark:bg-stone-900/40">
            <span>
              Total: <strong>{totalCardsCount}</strong> tasks across {columns.length} columns
            </span>
            <span className="text-stone-400">Click any row to view and edit details</span>
          </div>
        </div>
      </div>
    </div>
  );
}
