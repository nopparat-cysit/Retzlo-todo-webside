"use client";

import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, GripVertical, Minus, Plus, Settings, Trash2, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CardModal } from "@/components/kanban/card-modal";
import { KanbanCard } from "@/components/kanban/card";
import { ColumnIconGlyph, ColumnIconPicker } from "@/components/kanban/column-icon-picker";
import { ColumnStatusPicker } from "@/components/kanban/column-status-picker";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import {
  columnThemeOptions,
  getColumnThemeOption,
  type ColumnIconId,
  type ColumnThemeId
} from "@/lib/kanban/column-settings";
import { calculateColumnPoints, type DifficultyScore } from "@/lib/kanban/difficulty";
import { cn } from "@/lib/utils";
import type { Card, CardAssignee, CardStatus, ChecklistItem, ColumnWithCards } from "@/types/kanban";

export function KanbanColumn({
  column,
  activeCardId,
  isDragDisabled = false,
  isDropTarget,
  members = [],
  currentUserId,
  onCreateCard,
  onCardDeleted,
  onCardSaved,
  onColumnDeleted,
  onColumnSaved,
  isFirst = false,
  hasActiveFilters = false
}: {
  column: ColumnWithCards;
  activeCardId: string | null;
  isDragDisabled?: boolean;
  isDropTarget: boolean;
  members?: CardAssignee[];
  currentUserId?: string;
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
      priority?: "LOW" | "MEDIUM" | "HIGH";
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
}) {
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
          "column-collapsed-rail group lofi-panel shrink-0 rounded-2xl border border-white/10 bg-white/[0.035] hover:border-dusk-lavender/50 cursor-pointer flex flex-col items-center py-3.5 select-none transition-all duration-200",
          theme.columnClass
        )}
        onClick={toggleCollapse}
        title={`คลิกเพื่อขยายคอลัมน์ ${column.name}`}
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
          <ColumnIconGlyph className="text-dusk-amber transition-transform duration-200 group-hover:scale-110" icon={column.icon} />
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
              title={`คะแนนความยากรวม: ${totalPoints} pts`}
            >
              <Zap className="h-2.5 w-2.5 text-amber-400" />
              <span>{totalPoints}</span>
            </span>
          )}
          <span
            className="inline-grid min-w-[22px] place-items-center rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-stone-400"
            title={`การ์ดทั้งหมด: ${totalCards}`}
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
      style={style}
      className={cn(
        "group flex h-full min-h-0 w-[84vw] max-w-[336px] sm:w-[336px] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_14px_34px_rgba(0,0,0,0.16)] transition",
        theme.columnClass,
        isWipExceeded && "wip-exceeded border-dusk-amber/30",
        isDropTarget &&
          "border-dusk-lavender/60 bg-dusk-lavender/[0.08] shadow-lg shadow-dusk-lavender/10 ring-2 ring-dusk-lavender/20",
        isDragging && "opacity-70"
      )}
    >
      {/* ── Header ── */}
      <header className={cn("flex items-center gap-1.5 border-b border-white/10 px-2.5 py-2 select-none", theme.headerClass)}>
        <button
          suppressHydrationWarning
          className="shrink-0 text-stone-600 transition-colors hover:text-dusk-lavender group-hover:text-stone-400 cursor-grab active:cursor-grabbing"
          aria-label="Drag column"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <ColumnIconGlyph className="shrink-0 text-dusk-amber" icon={column.icon} />
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-100" title={column.name}>
          {column.name}
        </h2>

        <div className="flex items-center gap-1 shrink-0">
          {wipLimit && (
            <span
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md border px-1 py-0.5 text-[9px] font-mono font-semibold",
                isWipExceeded
                  ? "animate-pulse border-dusk-amber/30 bg-dusk-amber/15 text-dusk-amber"
                  : "border-white/10 bg-white/5 text-stone-400"
              )}
              title={`WIP Limit: ${wipLimit} cards (${totalCards}/${wipLimit})`}
            >
              LIMIT {wipLimit}
            </span>
          )}

          {totalPoints > 0 && (
            <span
              className="shrink-0 inline-flex items-center gap-0.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-1 py-0.5 text-[10px] font-semibold text-amber-400 select-none"
              title={`คะแนนความยากรวม: ${totalPoints} pts`}
            >
              <Zap className="h-2.5 w-2.5 text-amber-400" />
              <span>{totalPoints}</span>
            </span>
          )}

          <span
            className="shrink-0 inline-grid min-w-[18px] place-items-center rounded-md bg-white/5 px-1 py-0.5 text-[10px] font-medium text-stone-400"
            title={doneCount > 0 ? `เสร็จแล้ว ${doneCount} จาก ${totalCards} ใบ` : `การ์ดทั้งหมด ${totalCards} ใบ`}
          >
            {doneCount > 0 ? `${doneCount}/${totalCards}` : totalCards}
          </span>

          <button
            className="grid h-7 w-7 sm:h-6 sm:w-6 place-items-center rounded-md text-stone-500 transition hover:bg-white/10 hover:text-stone-300"
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
            className="grid h-7 w-7 sm:h-6 sm:w-6 place-items-center rounded-md text-stone-500 transition hover:bg-white/10 hover:text-stone-300"
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
      <div className="h-[2px] w-full bg-white/5">
        <div
          className="h-full bg-dusk-lavender/60 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${doneCount} of ${totalCards} cards done`}
        />
      </div>

      {/* ── Cards List ── */}
      <div ref={setCardZoneRef} data-card-zone={column.id} className={cn("scrollbar-soft min-h-20 flex-1 space-y-3 overflow-y-auto p-3", isDropTarget && "bg-white/[0.025]")}>
        <SortableContext items={column.cards.map((card) => `card:${card.id}`)} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              isDragDisabled={isDragDisabled}
              columnId={column.id}
              members={members}
              currentUserId={currentUserId}
              isDragPreviewTarget={activeCardId === card.id}
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
      <div className="border-t border-white/10 px-3 pb-3 pt-2">
        {isQuickAddOpen ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-2 transition-all duration-200 focus-within:border-dusk-lavender/40 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_12px_rgba(169,162,255,0.06)]">
            <textarea
              ref={quickInputRef}
              rows={1}
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={handleQuickKeyDown}
              placeholder="Card title…"
              disabled={isSubmitting}
              className={cn(
                "w-full resize-none rounded bg-transparent text-sm text-stone-100 placeholder-stone-500 outline-none",
                "scrollbar-soft overflow-hidden transition-all duration-200 focus:rows-2",
                isSubmitting && "opacity-50"
              )}
              style={{ fieldSizing: "content" } as React.CSSProperties}
              aria-label="Quick add card title"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-3 text-xs text-dusk-lavender hover:bg-dusk-lavender/10 hover:text-dusk-lavender"
                  disabled={!quickTitle.trim() || isSubmitting}
                  onClick={() => void handleQuickSubmit()}
                >
                  Add
                </Button>
                <span className="text-[10px] text-stone-500 select-none">↵ to add • Esc</span>
              </div>
              <button
                type="button"
                onClick={closeQuickAdd}
                className="rounded p-1 text-stone-500 transition-colors hover:text-stone-300"
                aria-label="Cancel quick add"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={openQuickAdd}
              className={cn(
                "flex w-full items-center gap-1.5 rounded-full px-2.5 py-2 sm:py-1.5 text-xs text-stone-500",
                "transition-colors hover:bg-white/5 hover:text-stone-300"
              )}
              aria-label="Quick add card"
            >
              <Plus className="h-3.5 w-3.5" />
              Quick add
            </button>
            <Button className="w-full h-9 sm:h-8" type="button" variant="ghost" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add card
            </Button>
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
          contentClassName="lofi-panel w-full max-w-lg rounded-2xl p-5 shadow-[0_24px_68px_rgba(0,0,0,0.46)]"
        >
          <form
            onSubmit={handleSaveIntent}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Column settings</p>
                <h3 id="column-settings-title" className="mt-1 text-2xl font-semibold text-stone-100">Edit column</h3>
                <p className="mt-1 text-sm leading-6 text-stone-400">
                  Adjust the lane name, color, and icon shown on the board.
                </p>
              </div>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-400 transition hover:border-dusk-rose/35 hover:bg-dusk-rose/10 hover:text-dusk-rose"
                aria-label="Close column settings"
                onClick={closeSettings}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="space-y-2 text-sm text-stone-300">
              <span>Column name</span>
              <Input
                autoFocus
                maxLength={80}
                placeholder="Backlog, Review, Done..."
                required
                value={settingsName}
                onChange={(event) => setSettingsName(event.target.value)}
              />
            </label>

            <div className="mt-4 space-y-4">
              <ColumnThemePicker value={settingsColor} onChange={setSettingsColor} />
              <ColumnIconPicker value={settingsIcon} onChange={setSettingsIcon} />
              <ColumnStatusPicker value={settingsDefaultCardStatus} onChange={setSettingsDefaultCardStatus} />
              <label className="block space-y-1.5 text-sm text-stone-300">
                <div className="flex items-center justify-between">
                  <span>Card limit (WIP)</span>
                  <span className="text-[11px] text-stone-500">Optional • Default: none</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={settingsWipLimit}
                  onChange={(event) => setSettingsWipLimit(event.target.value)}
                  placeholder="No limit (leave empty)"
                />
              </label>
            </div>

            {totalCards > 0 ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-dusk-amber/25 bg-dusk-amber/10 px-3 py-2 text-sm text-dusk-amber">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Move or delete all cards before deleting this column.
              </p>
            ) : null}

            {settingsError ? (
              <p className="mt-4 rounded-xl border border-dusk-rose/25 bg-dusk-rose/10 px-3 py-2 text-sm text-dusk-rose">
                {settingsError}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="danger"
                disabled={totalCards > 0 || isSavingSettings}
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeSettings}>
                  Cancel
                </Button>
                <Button disabled={!settingsName.trim() || isSavingSettings}>Save column</Button>
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
    </section>
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
