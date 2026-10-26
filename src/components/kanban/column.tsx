"use client";

import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, GripVertical, Minus, Plus, Settings, Trash2, X, Zap } from "lucide-react";
import { useEffect, useRef, useState, memo } from "react";

import { CardModal } from "@/components/kanban/card-modal";
import { KanbanCard } from "@/components/kanban/card";
import { BoardMockupPreview } from "@/components/kanban/board-mockup-preview";
import { ColumnIconGlyph, ColumnIconPicker } from "@/components/kanban/column-icon-picker";
import { ColumnStatusPicker } from "@/components/kanban/column-status-picker";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { ColorSwatchPicker } from "@/components/ui/color-swatch-picker";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import {
  columnThemeOptions,
  columnThemeSwatchOptions,
  getColumnThemeOption,
  type ColumnIconId,
  type ColumnThemeId
} from "@/lib/kanban/column-settings";
import { calculateColumnPoints, type DifficultyScore } from "@/lib/kanban/difficulty";
import { cn } from "@/lib/utils";
import type { Card, CardAssignee, CardPriority, CardStatus, ChecklistItem, ColumnWithCards, CustomPriority } from "@/types/kanban";

export const DEFAULT_COLUMN_WIDTH = 335;
export const MIN_COLUMN_WIDTH = 260;
export const MAX_COLUMN_WIDTH = 600;

export interface KanbanColumnProps {
  column: ColumnWithCards;
  boardId?: string;
  activeCardId: string | null;
  isDragDisabled?: boolean;
  isDropTarget: boolean;
  members?: CardAssignee[];
  currentUserId?: string;
  priorities?: CustomPriority[];
  density?: "comfortable" | "compact";
  onEditCard?: (card: Card) => void;
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
      priority?: CardPriority;
      isStarred?: boolean;
      rewardCoins?: number;
      privateCoins?: any;
      stickers?: string[];
      difficulty?: DifficultyScore | null;
      assigneeIds?: string[];
    }
  ) => Promise<void>;
  onCardDeleted: (cardId: string) => void;
  onCardSaved: (card: Card) => void;
  onColumnDeleted: (columnId: string) => Promise<void>;
  onColumnSaved: (
    columnId: string,
    payload: {
      name: string;
      color: ColumnThemeId;
      icon: ColumnIconId;
      defaultCardStatus: CardStatus;
      wipLimit?: number | null;
    }
  ) => Promise<void>;
  isFirst?: boolean;
  hasActiveFilters?: boolean;
}

function KanbanColumnComponent({
  column,
  boardId,
  activeCardId,
  isDragDisabled = false,
  isDropTarget,
  members = [],
  currentUserId,
  priorities,
  density = "comfortable",
  onEditCard,
  onCreateCard,
  onCardDeleted,
  onCardSaved,
  onColumnDeleted,
  onColumnSaved,
  isFirst = false,
  hasActiveFilters = false
}: KanbanColumnProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settingsName, setSettingsName] = useState(column.name);
  const [settingsColor, setSettingsColor] = useState<ColumnThemeId>(column.color);
  const [settingsIcon, setSettingsIcon] = useState<ColumnIconId>(column.icon);
  const [settingsDefaultCardStatus, setSettingsDefaultCardStatus] = useState<CardStatus>(column.defaultCardStatus);
  const [settingsWipLimit, setSettingsWipLimit] = useState<string>(
    column.wipLimit ? String(column.wipLimit) : ""
  );
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const quickInputRef = useRef<HTMLTextAreaElement>(null);
  const theme = getColumnThemeOption(column.color);

  useEffect(() => {
    const collapsed = localStorage.getItem(`column-collapsed-${column.id}`) === "true";
    setIsCollapsed(collapsed);
  }, [column.id]);

  useEffect(() => {
    setSettingsName(column.name);
    setSettingsColor(column.color);
    setSettingsIcon(column.icon);
    setSettingsDefaultCardStatus(column.defaultCardStatus);
    setSettingsWipLimit(column.wipLimit ? String(column.wipLimit) : "");
  }, [column.color, column.defaultCardStatus, column.icon, column.name, column.wipLimit]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(`column-collapsed-${column.id}`, String(newState));
  };

  const [columnWidth, setColumnWidth] = useState<number>(DEFAULT_COLUMN_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const isHighlightActive = isHandleHovered || isResizing;
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(DEFAULT_COLUMN_WIDTH);

  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem(`column-width-${column.id}`);
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= MIN_COLUMN_WIDTH && parsed <= MAX_COLUMN_WIDTH) {
          setColumnWidth(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [column.id]);

  const handleResizeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = columnWidth;
    setIsResizing(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - resizeStartXRef.current;
      const nextWidth = Math.min(
        Math.max(resizeStartWidthRef.current + deltaX, MIN_COLUMN_WIDTH),
        MAX_COLUMN_WIDTH
      );
      setColumnWidth(nextWidth);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      const finalDelta = upEvent.clientX - resizeStartXRef.current;
      const finalWidth = Math.min(
        Math.max(resizeStartWidthRef.current + finalDelta, MIN_COLUMN_WIDTH),
        MAX_COLUMN_WIDTH
      );
      setColumnWidth(finalWidth);
      setIsResizing(false);
      try {
        localStorage.setItem(`column-width-${column.id}`, String(finalWidth));
      } catch {
        // ignore
      }
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  const handleResetWidth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setColumnWidth(DEFAULT_COLUMN_WIDTH);
    try {
      localStorage.removeItem(`column-width-${column.id}`);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isFirst) return;

    const handleFocusEvent = () => {
      openQuickAdd();
    };

    window.addEventListener("focus-quick-add", handleFocusEvent);
    return () => {
      window.removeEventListener("focus-quick-add", handleFocusEvent);
    };
  }, [isFirst]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `column:${column.id}`,
    data: { type: "column", columnId: column.id },
    disabled: { draggable: isDragDisabled }
  });
  const { setNodeRef: setCardZoneRef } = useDroppable({
    id: `card-zone:${column.id}`,
    data: { type: "card-container", columnId: column.id, collapsed: isCollapsed },
    disabled: isDragDisabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  // Auto-focus the quick-add input when it opens
  useEffect(() => {
    if (isQuickAddOpen && quickInputRef.current) {
      quickInputRef.current.focus();
    }
  }, [isQuickAddOpen]);

  const totalCards = column.cards.length;
  const totalPoints = calculateColumnPoints(column.cards);
  const doneCount = column.cards.filter((c) => c.status === "DONE").length;
  const progressPct = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;

  const wipLimit = column.wipLimit ?? null;
  const isWipExceeded = wipLimit !== null && totalCards > wipLimit;

  function openQuickAdd() {
    setQuickTitle("");
    setIsQuickAddOpen(true);
  }

  function closeQuickAdd() {
    setIsQuickAddOpen(false);
    setQuickTitle("");
  }

  function closeSettings() {
    setSettingsName(column.name);
    setSettingsColor(column.color);
    setSettingsIcon(column.icon);
    setSettingsDefaultCardStatus(column.defaultCardStatus);
    setSettingsWipLimit(column.wipLimit ? String(column.wipLimit) : "");
    setSettingsError(null);
    setIsSettingsOpen(false);
  }

  function handleSaveIntent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settingsName.trim() || isSavingSettings) return;
    setIsSaveConfirmOpen(true);
  }

  async function executeSaveSettings() {
    setIsSavingSettings(true);
    setSettingsError(null);
    setIsSaveConfirmOpen(false);

    try {
      await onColumnSaved(column.id, {
        name: settingsName.trim(),
        color: settingsColor,
        icon: settingsIcon,
        defaultCardStatus: settingsDefaultCardStatus,
        wipLimit: settingsWipLimit.trim() ? parseInt(settingsWipLimit.trim(), 10) : null
      });
      setIsSettingsOpen(false);
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "Column did not sync. Try again.");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function executeDeleteColumn() {
    setIsSavingSettings(true);
    setSettingsError(null);
    setIsDeleteConfirmOpen(false);

    try {
      await onColumnDeleted(column.id);
      setIsSettingsOpen(false);
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "Column could not be deleted.");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleQuickSubmit() {
    const title = quickTitle.trim();
    if (!title || isSubmittingRef.current || isSubmitting) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await onCreateCard(column.id, {
        title,
        description: null,
        status: column.defaultCardStatus,
        color: "DEFAULT",
        checklist: [],
        dueDate: null,
        dueDateAllDay: false
      });
      closeQuickAdd();
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function handleQuickKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleQuickSubmit();
    }
    if (e.key === "Escape") {
      closeQuickAdd();
    }
  }

  if (isCollapsed) {
    return (
      <div
        ref={node => { setNodeRef(node); setCardZoneRef(node); }}
        style={style}
        data-card-zone={column.id}
        className={cn(
          "column-collapsed-rail group relative overflow-hidden shrink-0 rounded-2xl border hover:border-dusk-lavender/50 cursor-pointer flex flex-col items-center py-3.5 select-none transition-all duration-200",
          theme.columnClass
        )}
        onClick={toggleCollapse}
        title={`Click to expand column ${column.name}`}
      >

        {/* Top: Expand button & Column Icon */}
        <div className="flex flex-col items-center gap-2">
          <button
            className="grid h-7 w-7 place-items-center rounded-lg text-stone-400 transition-colors hover:bg-white/10 hover:text-dusk-lavender"
            type="button"
            aria-label={`Expand ${column.name}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
          >
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          </button>
          <ColumnIconGlyph className={cn("transition-transform duration-200 group-hover:scale-110", theme.iconColorClass)} icon={column.icon} />
        </div>

        {/* Center: Vertical Column Title */}
        <div className="my-auto flex flex-1 items-center justify-center overflow-hidden py-3">
          <span
            className="column-collapsed-title max-h-52 truncate text-xs font-semibold text-stone-300 transition-colors group-hover:text-stone-100"
            title={column.name}
          >
            {column.name}
          </span>
        </div>

        {/* Bottom: Points & Card Count Badges */}
        <div className="mt-auto flex flex-col items-center gap-1.5">
          {totalPoints > 0 && (
            <span
              className="inline-flex items-center gap-0.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 select-none"
              title={`Total story points: ${totalPoints} pts`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{totalPoints}</span>
            </span>
          )}
          <span
            className="inline-grid min-w-[22px] place-items-center rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-stone-400"
            title={`Total cards: ${totalCards}`}
          >
            {totalCards}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section
      ref={setNodeRef}
      style={{
        ...style,
        width: isCollapsed ? undefined : `${columnWidth}px`,
        maxWidth: isCollapsed ? undefined : `${columnWidth}px`,
        minWidth: isCollapsed ? undefined : `${MIN_COLUMN_WIDTH}px`
      }}
      className={cn(
        "group relative flex h-full min-h-0 w-[84vw] sm:w-[320px] md:w-[335px] xl:w-[345px] shrink-0 snap-center flex-col rounded-2xl border shadow-[0_14px_34px_rgba(0,0,0,0.16)]",
        isResizing ? "transition-none select-none" : "transition duration-200",
        theme.columnClass,
        isWipExceeded && "wip-exceeded border-dusk-amber/30",
        isDropTarget &&
          "border-dusk-lavender/60 bg-dusk-lavender/[0.08] shadow-lg shadow-dusk-lavender/10 ring-2 ring-dusk-lavender/20",
        isDragging && "opacity-70"
      )}
    >
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl">

      {/* ── Header ── */}
      <header className={cn("flex items-center gap-1.5 border-b px-2.5 py-2 select-none", theme.headerClass)}>
        <button
          suppressHydrationWarning
          className="shrink-0 text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-600 dark:hover:text-dusk-lavender group-hover:text-stone-400 cursor-grab active:cursor-grabbing"
          aria-label="Drag column"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <ColumnIconGlyph className={cn("shrink-0", theme.iconColorClass)} icon={column.icon} />
        <h2
          className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-900 dark:text-stone-100 select-text cursor-text"
          title={column.name}
          onPointerDownCapture={(e) => {
            e.stopPropagation();
          }}
        >
          {column.name}
        </h2>

        <div className="flex items-center gap-1 shrink-0">
          {wipLimit && (
            <span
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md border px-1 py-0.5 text-[9px] font-mono font-semibold",
                isWipExceeded
                  ? "animate-pulse border-amber-400 bg-amber-100 text-amber-800 dark:border-dusk-amber/30 dark:bg-dusk-amber/15 dark:text-dusk-amber"
                  : "border-stone-200 bg-stone-100 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400"
              )}
              title={`WIP Limit: ${wipLimit} cards (${totalCards}/${wipLimit})`}
            >
              LIMIT {wipLimit}
            </span>
          )}

          {totalPoints > 0 && (
            <span
              className="shrink-0 inline-flex items-center gap-0.5 rounded-md border border-amber-300 bg-amber-50 px-1 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 select-none"
              title={`Total story points: ${totalPoints} pts`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{totalPoints}</span>
            </span>
          )}

          <span
            className="shrink-0 inline-grid min-w-[18px] place-items-center rounded-md border border-stone-200/80 bg-stone-100 px-1 py-0.5 text-[10px] font-medium text-stone-600 dark:border-transparent dark:bg-white/5 dark:text-stone-400"
            title={doneCount > 0 ? `Completed ${doneCount} of ${totalCards} cards` : `Total cards: ${totalCards}`}
          >
            {doneCount > 0 ? `${doneCount}/${totalCards}` : totalCards}
          </span>

          <button
            className="grid h-7 w-7 sm:h-6 sm:w-6 place-items-center rounded-md text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-800 dark:text-stone-500 dark:hover:bg-white/10 dark:hover:text-stone-300"
            type="button"
            aria-label="Column settings"
            title="Column settings"
            onClick={() => {
              setSettingsName(column.name);
              setSettingsColor(column.color);
              setSettingsIcon(column.icon);
              setSettingsDefaultCardStatus(column.defaultCardStatus);
              setSettingsWipLimit(column.wipLimit ? String(column.wipLimit) : "");
              setSettingsError(null);
              setIsSettingsOpen(true);
            }}
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
          <button
            className="grid h-7 w-7 sm:h-6 sm:w-6 place-items-center rounded-md text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-800 dark:text-stone-500 dark:hover:bg-white/10 dark:hover:text-stone-300"
            type="button"
            aria-label="Collapse column"
            title="Collapse column"
            onClick={toggleCollapse}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* ── Progress Bar ── */}
      <div className="h-[2px] w-full bg-stone-200 dark:bg-white/5">
        <div
          className="h-full bg-indigo-500 dark:bg-dusk-lavender/60 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${doneCount} of ${totalCards} cards done`}
        />
      </div>

      {/* ── Cards List ── */}
      <div ref={setCardZoneRef} data-card-zone={column.id} className={cn("scrollbar-soft min-h-20 flex-1 overflow-y-auto p-2.5 sm:p-3", density === "compact" ? "space-y-1.5" : "space-y-2.5", isDropTarget && "bg-white/[0.025]")}>
        <SortableContext items={column.cards.map((card) => `card:${card.id}`)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              isDragDisabled={isDragDisabled}
              columnId={column.id}
              members={members}
              currentUserId={currentUserId}
              priorities={priorities}
              density={density}
              isDragPreviewTarget={activeCardId === card.id}
              onEdit={onEditCard}
              onDeleted={onCardDeleted}
              onSaved={onCardSaved}
            />
          ))}
        </SortableContext>

        {/* ── Empty Drop Zone ── */}
        {totalCards === 0 && (
          <div
            className={cn(
              "rounded-2xl border border-dashed border-white/10 p-4 text-center text-sm text-stone-500 transition-all duration-300",
              isDropTarget &&
                "animate-pulse border-dusk-lavender/60 bg-dusk-lavender/10 text-dusk-lavender shadow-[0_0_18px_2px_rgba(169,162,255,0.15)]"
            )}
          >
            {isDropTarget ? (
              "Release to drop"
            ) : hasActiveFilters ? (
              <div className="space-y-1">
                <p className="text-xs font-medium text-stone-400">No cards match filter</p>
                <p className="text-[11px] text-stone-600">Try clearing active filters</p>
              </div>
            ) : (
              "Drop a card here."
            )}
          </div>
        )}
      </div>

      {/* ── Quick-Add Form ── */}
      <div className={cn("border-t px-3 pb-3 pt-2", theme.headerClass)}>
        {isQuickAddOpen ? (
          <div className="rounded-xl border border-indigo-400/80 bg-white p-2.5 shadow-md transition-all duration-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 dark:border-dusk-lavender/50 dark:bg-ink-900/95 dark:focus-within:border-dusk-lavender dark:focus-within:ring-dusk-lavender/15">
            <textarea
              ref={quickInputRef}
              rows={2}
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={handleQuickKeyDown}
              placeholder="Card title..."
              disabled={isSubmitting}
              className="quick-add-textarea block w-full resize-none bg-transparent p-0 text-sm font-normal text-stone-900 placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500 !border-0 !border-none !outline-none !shadow-none !ring-0 focus:!border-none focus:!outline-none focus:!shadow-none focus:!ring-0 scrollbar-soft overflow-hidden leading-relaxed"
              style={{ border: "none", outline: "none", boxShadow: "none", background: "transparent", fieldSizing: "content" } as React.CSSProperties}
              aria-label="Quick add card title"
            />
            <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-white/5">
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  className={cn(
                    "h-7 px-3 text-xs font-semibold rounded-lg transition-all shadow-xs",
                    quickTitle.trim()
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-dusk-lavender dark:text-ink-950 dark:hover:bg-dusk-lavender/90"
                      : "bg-stone-200 text-stone-400 dark:bg-white/10 dark:text-stone-500 cursor-not-allowed"
                  )}
                  disabled={!quickTitle.trim() || isSubmitting}
                  onClick={() => void handleQuickSubmit()}
                >
                  {isSubmitting ? "Adding…" : "Add"}
                </Button>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 select-none">↵ Enter</span>
              </div>
              <button
                type="button"
                onClick={closeQuickAdd}
                className="grid h-7 w-7 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200"
                aria-label="Cancel quick add"
                title="Cancel (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={openQuickAdd}
              className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 bg-white/40 text-xs font-medium text-stone-600 transition hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-white/15 dark:bg-white/[0.02] dark:text-stone-400 dark:hover:border-dusk-lavender/40 dark:hover:bg-white/[0.05] dark:hover:text-stone-200"
              aria-label="Quick add card"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Quick add</span>
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              title="Add card with details"
              aria-label="Add card with full details"
              className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-200 shadow-xs"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Full Card Modal ── */}
      {isSettingsOpen ? (
        <AppModal
          open={isSettingsOpen}
          onClose={closeSettings}
          hasUnsavedChanges={
            settingsName.trim() !== column.name.trim() ||
            settingsColor !== column.color ||
            settingsIcon !== column.icon ||
            settingsDefaultCardStatus !== column.defaultCardStatus ||
            settingsWipLimit.trim() !== (column.wipLimit ? String(column.wipLimit) : "")
          }
          labelledBy="column-settings-title"
          contentClassName="w-full max-w-4xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-theme-border bg-theme-panel p-5 sm:p-6 text-theme-foreground shadow-2xl"
        >
          <form
            onSubmit={handleSaveIntent}
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-theme-border pb-3.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-theme-accent">Column settings</p>
                <h3 id="column-settings-title" className="mt-0.5 flex items-center gap-2 text-xl font-bold text-theme-foreground sm:text-2xl">
                  <span>Edit column</span>
                </h3>
                <p className="mt-1 text-xs text-theme-muted">
                  Adjust the lane name, color, and icon shown on the board.
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-theme-muted transition hover:bg-theme-paper hover:text-theme-foreground cursor-pointer"
                aria-label="Close column settings"
                onClick={closeSettings}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Controls (7 of 12 columns) */}
              <div className="md:col-span-7 space-y-4">
                <label className="block space-y-1.5 text-xs font-bold uppercase tracking-wider text-theme-foreground">
                  <span>
                    Column name <span className="text-theme-danger">*</span>
                  </span>
                  <Input
                    autoFocus
                    maxLength={80}
                    placeholder="e.g. Backlog, Review, Done..."
                    required
                    value={settingsName}
                    onChange={(event) => setSettingsName(event.target.value)}
                    className="h-10 rounded-xl bg-theme-paper text-sm font-medium"
                  />
                </label>

                <div className="space-y-4">
                  <ColumnThemePicker value={settingsColor} onChange={setSettingsColor} />
                  <ColumnIconPicker value={settingsIcon} onChange={setSettingsIcon} />
                  <ColumnStatusPicker value={settingsDefaultCardStatus} onChange={setSettingsDefaultCardStatus} boardId={boardId} />
                  <label className="block space-y-1.5 text-xs font-bold uppercase tracking-wider text-theme-foreground">
                    <div className="flex items-center justify-between">
                      <span>Card limit (WIP)</span>
                      <span className="font-normal normal-case text-[11px] text-theme-muted">
                        Optional • Default: none
                      </span>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={settingsWipLimit}
                      onChange={(event) => setSettingsWipLimit(event.target.value)}
                      placeholder="No limit (leave empty)"
                      className="h-10 rounded-xl bg-theme-paper text-sm font-medium"
                    />
                  </label>
                </div>
              </div>

              {/* Right Column: Live Mockup Preview (5 of 12 columns) */}
              <div className="md:col-span-5 md:sticky md:top-0 space-y-3">
                <div className="rounded-xl border border-theme-border bg-theme-paper p-3 shadow-xs">
                  <BoardMockupPreview
                    title="Live Column Mockup Preview"
                    badgeText="Editing Stage"
                    subtitle="Preview how your updated column appearance, status & WIP limit look on the board"
                    compact={true}
                    columns={[
                      {
                        id: column.id,
                        name: settingsName.trim() || column.name,
                        color: settingsColor,
                        icon: settingsIcon,
                        defaultCardStatus: settingsDefaultCardStatus,
                        wipLimit:
                          settingsWipLimit.trim() && !isNaN(parseInt(settingsWipLimit.trim(), 10))
                            ? parseInt(settingsWipLimit.trim(), 10)
                            : null,
                        cardCount: totalCards || 2,
                        isHighlighted: true,
                        highlightBadge: "EDITING"
                      }
                    ]}
                  />
                </div>

                <div className="rounded-xl border border-theme-border/60 bg-theme-paper/50 p-3 text-[11px] text-theme-muted leading-relaxed">
                  💡 <strong>Stage preview:</strong> Live updates will be synced immediately to all team members currently viewing this board.
                </div>
              </div>
            </div>

            {totalCards > 0 ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-dusk-amber/30 bg-dusk-amber/10 px-3 py-2 text-xs text-dusk-amber">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Move or delete all cards before deleting this column.</span>
              </p>
            ) : null}

            {settingsError ? (
              <p className="mt-4 rounded-xl border border-theme-danger/30 bg-theme-danger/10 p-3 text-xs text-theme-danger">
                {settingsError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-2 border-t border-theme-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="danger"
                disabled={totalCards > 0 || isSavingSettings}
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeSettings}>
                  Cancel
                </Button>
                <Button
                  disabled={!settingsName.trim() || isSavingSettings}
                  variant="primary"
                  className="font-semibold px-4 cursor-pointer"
                >
                  {isSavingSettings ? "Saving..." : "Save column"}
                </Button>
              </div>
            </div>
          </form>
        </AppModal>
      ) : null}

      <CardModal
        mode="create"
        card={isModalOpen ? ({ columnId: column.id, status: column.defaultCardStatus } as any) : undefined}
        open={isModalOpen}
        members={members}
        currentUserId={currentUserId}
        boardId={boardId}
        boardPriorities={priorities}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (payload) => {
          await onCreateCard(column.id, payload);
          setIsModalOpen(false);
        }}
      />

      <ConfirmModal
        open={isDeleteConfirmOpen}
        title="Delete column"
        message={`Are you sure you want to delete "${column.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isSavingSettings}
        onConfirm={executeDeleteColumn}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />

      <ConfirmModal
        open={isSaveConfirmOpen}
        title="Save column changes"
        message={`Are you sure you want to save changes to "${settingsName}"?`}
        confirmLabel="Save"
        isLoading={isSavingSettings}
        onConfirm={executeSaveSettings}
        onClose={() => setIsSaveConfirmOpen(false)}
      />
      </div>

      {/* ── Curved Column Resize Guide Line (Top & Bottom Arcs + Vertical Middle) ── */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-30 transition-opacity duration-150",
          isHighlightActive ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Top-Right Corner Arc following rounded-2xl border with smooth fade-out tip */}
        <svg
          className={cn(
            "pointer-events-none absolute -top-px -right-px h-4 w-4 overflow-visible transition-colors duration-150",
            isResizing
              ? "text-indigo-500 drop-shadow-[0_0_10px_rgba(169,162,255,0.8)] dark:text-dusk-lavender"
              : "text-indigo-400/80 drop-shadow-[0_0_6px_rgba(169,162,255,0.4)] dark:text-dusk-lavender/80"
          )}
          viewBox="0 0 16 16"
          fill="none"
        >
          <defs>
            <linearGradient id={`top-arc-fade-${column.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="30%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="70%" stopColor="currentColor" stopOpacity="0.8" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M 0 1 A 15 15 0 0 1 15 16"
            stroke={`url(#top-arc-fade-${column.id})`}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Vertical Middle Line running flush along right border */}
        <div
          className={cn(
            "pointer-events-none absolute top-[15px] bottom-[15px] -right-px w-[2px] transition-all duration-150",
            isResizing
              ? "bg-indigo-500 shadow-[0_0_10px_rgba(169,162,255,0.8)] dark:bg-dusk-lavender"
              : "bg-indigo-400/80 shadow-[0_0_6px_rgba(169,162,255,0.4)] dark:bg-dusk-lavender/80"
          )}
        />

        {/* Bottom-Right Corner Arc following rounded-2xl border with smooth fade-out tip */}
        <svg
          className={cn(
            "pointer-events-none absolute -bottom-px -right-px h-4 w-4 overflow-visible transition-colors duration-150",
            isResizing
              ? "text-indigo-500 drop-shadow-[0_0_10px_rgba(169,162,255,0.8)] dark:text-dusk-lavender"
              : "text-indigo-400/80 drop-shadow-[0_0_6px_rgba(169,162,255,0.4)] dark:text-dusk-lavender/80"
          )}
          viewBox="0 0 16 16"
          fill="none"
        >
          <defs>
            <linearGradient id={`bottom-arc-fade-${column.id}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
              <stop offset="30%" stopColor="currentColor" stopOpacity="0.8" />
              <stop offset="70%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 15 0 A 15 15 0 0 1 0 15"
            stroke={`url(#bottom-arc-fade-${column.id})`}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ── Column Horizontal Resize Handle (Hover & Drag on X-axis) ── */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize column ${column.name}`}
        title="Drag horizontally to resize column width (Double-click to reset)"
        onPointerDown={handleResizeStart}
        onDoubleClick={handleResetWidth}
        onMouseEnter={() => setIsHandleHovered(true)}
        onMouseLeave={() => setIsHandleHovered(false)}
        className={cn(
          "group/resize absolute top-0 -right-2 bottom-0 z-40 flex w-4 cursor-col-resize items-center justify-center select-none touch-none",
          isResizing ? "pointer-events-auto" : ""
        )}
      >

        {/* Center Grab Handle Pill - elevated, tactile, and floating above border */}
        <div
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex h-9 w-4 items-center justify-center rounded-full border-2 transition-all duration-150 z-50",
            isResizing
              ? "scale-110 border-indigo-400 bg-indigo-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.6)] dark:border-white/50 dark:bg-dusk-lavender dark:text-ink-950 opacity-100"
              : cn(
                  "border-indigo-300/80 bg-white text-indigo-600 shadow-md dark:border-dusk-lavender/60 dark:bg-[#16172e] dark:text-dusk-lavender dark:shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_10px_rgba(169,162,255,0.3)]",
                  isHandleHovered ? "opacity-100 scale-105" : "opacity-0 group-hover/resize:opacity-100"
                )
          )}
        >
          <GripVertical className="h-3 w-3 text-current" />
        </div>

        {/* Live width badge while dragging */}
        {isResizing && (
          <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-6 rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-1 text-xs font-mono font-bold text-stone-100 shadow-2xl dark:border-dusk-lavender/40 dark:bg-[#0c0d1e] dark:text-dusk-lavender whitespace-nowrap z-50 animate-in fade-in zoom-in-95">
            {columnWidth}px
          </div>
        )}

        {/* Hover Tooltip: Explains drag to resize & double-click to reset */}
        {isHandleHovered && !isResizing && (
          <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-6 z-50 flex flex-col gap-1 rounded-xl border border-stone-200/90 bg-white/98 p-2.5 text-left shadow-2xl backdrop-blur-xl dark:border-dusk-lavender/35 dark:bg-[#0c0d1e]/98 dark:shadow-[0_16px_36px_rgba(0,0,0,0.7),0_0_20px_rgba(169,162,255,0.15)] animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-indigo-100 text-indigo-700 dark:bg-dusk-lavender/20 dark:text-dusk-lavender text-[10px]">
                ↔
              </span>
              <span>ปรับขนาดคอลัมน์ ({columnWidth}px)</span>
            </div>
            <div className="flex flex-col gap-0.5 text-[10px] text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1 w-1 rounded-full bg-indigo-500 dark:bg-dusk-lavender" />
                <span>คลิกค้างแล้วลากซ้าย-ขวาเพื่อขยาย/ย่อ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1 w-1 rounded-full bg-teal-500 dark:bg-dusk-cyan" />
                <span>ดับเบิลคลิกเพื่อคืนค่าเริ่มต้น ({DEFAULT_COLUMN_WIDTH}px)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export const KanbanColumn = memo(KanbanColumnComponent);

function ColumnThemePicker({
  onChange,
  value
}: {
  onChange: (value: ColumnThemeId) => void;
  value: ColumnThemeId;
}) {
  return (
    <ColorSwatchPicker
      label="Color"
      value={value}
      onChange={onChange}
      options={columnThemeSwatchOptions}
    />
  );
}

