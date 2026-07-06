"use client";

import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, GripVertical, Minus, Plus, Settings, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CardModal } from "@/components/kanban/card-modal";
import { KanbanCard } from "@/components/kanban/card";
import { ColumnIconGlyph, ColumnIconPicker } from "@/components/kanban/column-icon-picker";
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
import { cn } from "@/lib/utils";
import type { Card, CardStatus, ChecklistItem, ColumnWithCards } from "@/types/kanban";

export function KanbanColumn({
  column,
  activeCardId,
  isDropTarget,
  onCreateCard,
  onCardDeleted,
  onCardSaved,
  onColumnDeleted,
  onColumnSaved,
  isFirst = false
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
      priority?: "LOW" | "MEDIUM" | "HIGH";
      isStarred?: boolean;
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
    }
  ) => Promise<void>;
  isFirst?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settingsName, setSettingsName] = useState(column.name);
  const [settingsColor, setSettingsColor] = useState<ColumnThemeId>(column.color);
  const [settingsIcon, setSettingsIcon] = useState<ColumnIconId>(column.icon);
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
  }, [column.color, column.icon, column.name]);

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
    data: { type: "column", columnId: column.id }
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
  const doneCount = column.cards.filter((c) => c.status === "DONE").length;
  const progressPct = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;

  const nameLower = column.name.toLowerCase();
  const isWIPTarget = nameLower.includes("doing") || nameLower.includes("progress") || nameLower.includes("active");
  const wipLimit = isWIPTarget ? 4 : nameLower.includes("todo") ? 8 : null;
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
        icon: settingsIcon
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
    if (!title || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onCreateCard(column.id, {
        title,
        description: null,
        status: "TODO",
        color: "DEFAULT",
        checklist: [],
        dueDate: null,
        dueDateAllDay: false
      });
      closeQuickAdd();
    } finally {
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
        className="column-collapsed-rail group lofi-panel shrink-0 rounded-2xl border border-white/10 bg-white/[0.035] hover:border-dusk-lavender/50 cursor-pointer flex flex-col items-center py-4"
        onClick={toggleCollapse}
        title={`Expand ${column.name}`}
      >
        <button
          className="text-stone-500 hover:text-dusk-lavender mb-4 transition-colors"
          type="button"
          aria-label="Expand column"
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse();
          }}
        >
          <Plus className="h-4 w-4" />
        </button>
        <ColumnIconGlyph className="mb-3 text-dusk-amber" icon={column.icon} />
        <h2 className="column-collapsed-title text-sm text-stone-300 truncate w-32 text-center select-none mb-4">
          {column.name}
        </h2>
        <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-stone-400 select-none">
          {totalCards}
        </span>
      </div>
    );
  }

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex h-full min-h-0 w-72 sm:w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_14px_34px_rgba(0,0,0,0.16)] transition",
        theme.columnClass,
        isWipExceeded && "wip-exceeded border-dusk-amber/30",
        isDropTarget &&
          "border-dusk-lavender/60 bg-dusk-lavender/[0.08] shadow-lg shadow-dusk-lavender/10 ring-2 ring-dusk-lavender/20",
        isDragging && "opacity-70"
      )}
    >
      {/* ── Header ── */}
      <header className={cn("flex items-center gap-2 border-b border-white/10 px-3 py-3", theme.headerClass)}>
        <button
          suppressHydrationWarning
          className="text-stone-600 transition-colors hover:text-dusk-lavender group-hover:text-stone-400"
          aria-label="Drag column"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <ColumnIconGlyph className="shrink-0 text-dusk-amber" icon={column.icon} />
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-100">{column.name}</h2>
        {wipLimit && (
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full border select-none font-mono font-semibold",
            isWipExceeded 
              ? "border-dusk-amber/30 bg-dusk-amber/15 text-dusk-amber animate-pulse" 
              : "border-white/5 bg-white/5 text-stone-500"
          )}>
            LIMIT {wipLimit}
          </span>
        )}
        {totalCards > 0 && (
          <span className="text-xs text-stone-500">
            {doneCount}/{totalCards}
          </span>
        )}
        <span className="rounded-lg bg-white/5 px-2 py-1 text-xs text-stone-400">{totalCards}</span>
        
        {/* Collapse Button */}
        <button
          className="ml-1 rounded-md p-1 text-stone-500 transition hover:bg-white/10 hover:text-stone-300"
          type="button"
          aria-label="Column settings"
          onClick={() => {
            setSettingsError(null);
            setIsSettingsOpen(true);
          }}
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          className="text-stone-500 hover:text-stone-300"
          type="button"
          aria-label="Collapse column"
          onClick={toggleCollapse}
        >
          <Minus className="h-4 w-4" />
        </button>
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

        {/* ── Empty Drop Zone ── */}
        {totalCards === 0 && (
          <div
            className={cn(
              "rounded-2xl border border-dashed border-white/10 p-4 text-center text-sm text-stone-500 transition-all duration-300",
              isDropTarget &&
                "animate-pulse border-dusk-lavender/60 bg-dusk-lavender/10 text-dusk-lavender shadow-[0_0_18px_2px_rgba(169,162,255,0.15)]"
            )}
          >
            {isDropTarget ? "Release to drop" : "Drop a card here."}
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
            <div className="mt-2 flex items-center gap-2">
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
              <button
                type="button"
                onClick={closeQuickAdd}
                className="ml-auto rounded p-1 text-stone-500 transition-colors hover:text-stone-300"
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
                "flex w-full items-center gap-1.5 rounded-full px-2 py-1.5 text-xs text-stone-500",
                "transition-colors hover:bg-white/5 hover:text-stone-300"
              )}
              aria-label="Quick add card"
            >
              <Plus className="h-3.5 w-3.5" />
              Quick add
            </button>
            <Button className="w-full" type="button" variant="ghost" onClick={() => setIsModalOpen(true)}>
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
            settingsName !== column.name ||
            settingsColor !== column.color ||
            settingsIcon !== column.icon
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
        open={isModalOpen}
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
