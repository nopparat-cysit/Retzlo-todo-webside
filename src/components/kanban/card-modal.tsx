"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormEvent, ReactNode, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { CalendarClock, CheckSquare, Coins, FileText, GripVertical, Plus, Star, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { RetroStickerPicker } from "@/components/stickers/retro-sticker-picker";
import { applyDueShortcut, composeDueDate } from "@/lib/kanban/due-date";
import { getPrivateCoinEntry, resolveCardRewardPayload } from "@/lib/kanban/private-coins";
import { getStatusMeta, statusOptions } from "@/lib/kanban/status";
import { normalizeRetroStickerSelection } from "@/lib/stickers/retro-stickers";
import { cardColorOptions, getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { Card, CardStatus, ChecklistItem } from "@/types/kanban";

interface CardModalProps {
  card?: Card;
  mode: "create" | "edit";
  open: boolean;
  onClose: () => void;
  onDelete?: () => Promise<void>;
  footerAction?: ReactNode;
  onSubmit: (payload: {
    title: string;
    description: string | null;
    note: string | null;
    status: CardStatus;
    color: CardColor;
    checklist: ChecklistItem[];
    dueDate: string | null;
    dueDateAllDay: boolean;
    priority: "LOW" | "MEDIUM" | "HIGH";
    isStarred: boolean;
    rewardCoins?: number;
    privateCoins?: any;
    stickers?: string[];
  }) => Promise<void>;
}

function dateValue(card?: Card) {
  return card?.dueDate ? card.dueDate.slice(0, 10) : "";
}

function timeValue(card?: Card) {
  if (!card?.dueDate || card.dueDateAllDay) {
    return "";
  }

  const date = new Date(card.dueDate);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function CardModal({ card, mode, open, onClose, onDelete, footerAction, onSubmit }: CardModalProps) {
  const [date, setDate] = useState(dateValue(card));
  const [time, setTime] = useState(timeValue(card));
  const [selectedStatus, setSelectedStatus] = useState<CardStatus>(card?.status ?? "TODO");
  const [selectedColor, setSelectedColor] = useState<CardColor>(normalizeCardColor(card?.color));
  const [selectedPriority, setSelectedPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(card?.priority ?? "MEDIUM");
  const [isStarred, setIsStarred] = useState(card?.isStarred ?? false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card?.checklist ?? []);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [note, setNote] = useState(card?.note ?? "");
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Gamification fields
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [privateGlobalCoins, setPrivateGlobalCoins] = useState(0);
  const [rewardCoins, setRewardCoins] = useState(card?.rewardCoins ?? 0);
  const [showCoinRewards, setShowCoinRewards] = useState(Boolean(card?.rewardCoins));
  const [stickers, setStickers] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDate(dateValue(card));
    setTime(timeValue(card));
    setSelectedStatus(card?.status ?? "TODO");
    setSelectedColor(normalizeCardColor(card?.color));
    setSelectedPriority(card?.priority ?? "MEDIUM");
    setIsStarred(card?.isStarred ?? false);
    setChecklist(card?.checklist ?? []);
    setNewChecklistItem("");
    setNote(card?.note ?? "");
    setTitle(card?.title ?? "");
    setDescription(card?.description ?? "");

    setRewardCoins(card?.rewardCoins ?? 0);
    setShowCoinRewards(Boolean(card?.rewardCoins));
    setStickers(normalizeRetroStickerSelection(card?.stickers));

    async function fetchUser() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const d = await res.json() as { user: { id: string } };
          const privateCoins = getPrivateCoinEntry(card?.privateCoins, d.user.id).coins;
          setActiveUserId(d.user.id);
          setPrivateGlobalCoins(privateCoins);
          if (privateCoins > 0) {
            setShowCoinRewards(true);
          }
        }
      } catch {}
    }
    void fetchUser();
  }, [card, open]);

  const hasChanges = useMemo(() => {
    if (mode === "create") {
      return (
        title.trim() !== "" ||
        description.trim() !== "" ||
        note.trim() !== "" ||
        checklist.length > 0 ||
        selectedStatus !== "TODO" ||
        selectedPriority !== "MEDIUM" ||
        isStarred ||
        rewardCoins > 0 ||
        stickers.length > 0 ||
        date !== "" ||
        time !== ""
      );
    }

    if (!card) return false;

    const initialTitle = card.title ?? "";
    const initialDesc = card.description ?? "";
    const initialNote = card.note ?? "";
    const initialStatus = card.status ?? "TODO";
    const initialColor = normalizeCardColor(card.color);
    const initialPriority = card.priority ?? "MEDIUM";
    const initialStarred = card.isStarred ?? false;
    const initialReward = card.rewardCoins ?? 0;
    const initialStickers = normalizeRetroStickerSelection(card.stickers);
    const initialDate = dateValue(card);
    const initialTime = timeValue(card);

    const checklistChanged =
      checklist.length !== (card.checklist?.length ?? 0) ||
      checklist.some((item, idx) => {
        const initialItem = card.checklist?.[idx];
        return !initialItem || item.label !== initialItem.label || item.checked !== initialItem.checked;
      });

    const stickersChanged =
      stickers.length !== initialStickers.length ||
      stickers.some((s, idx) => s !== initialStickers[idx]);

    return (
      title !== initialTitle ||
      description !== initialDesc ||
      note !== initialNote ||
      selectedStatus !== initialStatus ||
      selectedColor !== initialColor ||
      selectedPriority !== initialPriority ||
      isStarred !== initialStarred ||
      rewardCoins !== initialReward ||
      date !== initialDate ||
      time !== initialTime ||
      checklistChanged ||
      stickersChanged
    );
  }, [
    mode,
    card,
    title,
    description,
    note,
    selectedStatus,
    selectedColor,
    selectedPriority,
    isStarred,
    rewardCoins,
    stickers,
    date,
    time,
    checklist
  ]);

  const handleCloseRequest = useCallback(() => {
    if (hasChanges) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCloseRequest();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasChanges, handleCloseRequest]);

  if (!open || !mounted) {
    return null;
  }

  function addChecklistItem() {
    if (!newChecklistItem.trim()) {
      return;
    }

    setChecklist((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        label: newChecklistItem.trim(),
        checked: false
      }
    ]);
    setNewChecklistItem("");
  }

  function reorderChecklist(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setChecklist((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return current;
      }

      return arrayMove(current, oldIndex, newIndex);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);
    const due = composeDueDate(date, time);
    const rewardPayload = resolveCardRewardPayload({
      activeUserId,
      enabled: showCoinRewards,
      privateCoins: card?.privateCoins,
      privateGlobalCoins,
      rewardCoins
    });

    await onSubmit({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      note: note || null,
      status: selectedStatus,
      color: selectedColor,
      checklist,
      dueDate: due.dueDate,
      dueDateAllDay: due.dueDateAllDay,
      priority: selectedPriority,
      isStarred,
      rewardCoins: rewardPayload.rewardCoins,
      privateCoins: rewardPayload.privateCoins,
      stickers: normalizeRetroStickerSelection(stickers)
    });
    setIsSaving(false);
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === backdropRef.current) {
      handleCloseRequest();
    }
  };

  const modal = (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-ink-950/80 px-4 py-6 backdrop-blur-sm"
        onClick={handleBackdropClick}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <form className="lofi-panel flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg" onSubmit={handleSubmit}>
        <div className="shrink-0 border-b border-white/10 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">{mode === "create" ? "New card" : "Edit card"}</p>
            <h2 className="mt-1 text-2xl font-semibold">{mode === "create" ? "Create card" : "Card details"}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={showCoinRewards ? "Hide coin rewards" : "Show coin rewards"}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-md border transition hover:scale-105",
                showCoinRewards
                  ? "border-dusk-amber/60 bg-dusk-amber/15 text-dusk-amber"
                  : "border-white/10 text-stone-500 hover:border-dusk-amber/40 hover:text-dusk-amber"
              )}
              onClick={() => setShowCoinRewards((value) => !value)}
              title={showCoinRewards ? "Hide Coin Rewards" : "Show Coin Rewards"}
            >
              <Coins className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={isStarred ? "Unstar card" : "Star card"}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-md border transition hover:scale-105",
                isStarred
                  ? "border-dusk-amber/60 bg-dusk-amber/15 text-dusk-amber"
                  : "border-white/10 text-stone-500 hover:border-dusk-amber/40 hover:text-dusk-amber"
              )}
              onClick={() => setIsStarred((v) => !v)}
            >
              <Star className={cn("h-4 w-4", isStarred && "fill-dusk-amber")} />
            </button>
            <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={handleCloseRequest}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        </div>

        <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)] lg:items-start">
          <div className="grid gap-4">
          <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card title" required />
          <Textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details, links, context..." />
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-200">
              <FileText className="h-4 w-4 text-dusk-lavender" />
              Note (บันทึกข้อความ)
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write custom card notes here..."
              rows={4}
            />
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-200">
              <CheckSquare className="h-4 w-4 text-dusk-cyan" />
              Checklist
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorderChecklist}>
              <SortableContext items={checklist.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {checklist.map((item) => (
                    <SortableChecklistItem
                      key={item.id}
                      item={item}
                      onCheckedChange={(checked) =>
                        setChecklist((current) =>
                          current.map((currentItem) =>
                            currentItem.id === item.id ? { ...currentItem, checked } : currentItem
                          )
                        )
                      }
                      onDelete={() => setChecklist((current) => current.filter((currentItem) => currentItem.id !== item.id))}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <div className="mt-3 flex gap-2">
              <Input
                value={newChecklistItem}
                onChange={(event) => setNewChecklistItem(event.target.value)}
                placeholder="Checklist item"
              />
              <Button className="h-10 w-10 shrink-0 px-0" type="button" onClick={addChecklistItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          </div>

          <div className="grid gap-4 lg:sticky lg:top-0">
          <div className="space-y-2 text-sm text-stone-300">
            <span>Status</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {statusOptions.map((option) => (
                <StatusButton
                  key={option.value}
                  selected={selectedStatus === option.value}
                  status={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2 text-sm text-stone-300">
            <span>Priority</span>
            <div className="flex gap-2">
              {(["LOW", "MEDIUM", "HIGH"] as const).map((p) => {
                const isSelected = selectedPriority === p;
                let activeClass = "";
                if (p === "HIGH") {
                  activeClass = isSelected
                    ? "border-red-400 bg-red-400/20 text-red-200"
                    : "border-white/10 text-stone-400 hover:text-stone-200";
                } else if (p === "MEDIUM") {
                  activeClass = isSelected
                    ? "border-dusk-amber bg-dusk-amber/20 text-dusk-amber"
                    : "border-white/10 text-stone-400 hover:text-stone-200";
                } else {
                  activeClass = isSelected
                    ? "border-dusk-lavender bg-dusk-lavender/20 text-dusk-lavender"
                    : "border-white/10 text-stone-400 hover:text-stone-200";
                }

                return (
                  <button
                    key={p}
                    className={cn(
                      "flex-1 h-10 rounded-md border text-sm font-medium transition",
                      activeClass
                    )}
                    type="button"
                    onClick={() => setSelectedPriority(p)}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <ColorPicker selectedColor={selectedColor} onChange={setSelectedColor} />

          <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-200">
              <CalendarClock className="h-4 w-4 text-dusk-amber" />
              Due date
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                ["today", "Today"],
                ["tomorrow", "Tomorrow"],
                ["next-week", "Next week"],
                ["clear", "Clear date"]
              ].map(([value, label]) => (
                <Button
                  className="h-8 px-3"
                  key={value}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setDate(applyDueShortcut(value as "today" | "tomorrow" | "next-week" | "clear"));
                    if (value === "clear") setTime("");
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </div>
            <p className="mt-2 text-xs text-stone-500">No time means all day.</p>
          </div>

          {/* ── Coin Rewards & Stickers ── */}
          <div className="grid gap-3">
            {/* Coins */}
            {showCoinRewards ? (
            <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-200">
                <Coins className="h-4 w-4 text-dusk-amber" />
                <span className="text-xs uppercase tracking-wider text-dusk-amber font-bold">Coin Rewards</span>
              </div>
              <div className="space-y-3">
                <label className="block space-y-1 text-xs text-stone-400">
                  <span className="text-stone-300 font-medium">Project Coins (🪙 ของทีม)</span>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={rewardCoins}
                    onChange={(e) => setRewardCoins(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 w-full rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
                  />
                  <span>Awarded to assignee upon completion.</span>
                </label>

                <label className="block space-y-1 text-xs text-stone-400">
                  <span className="text-stone-300 font-medium">My Private Coins (🪙 ส่วนตัว)</span>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={privateGlobalCoins}
                    onChange={(e) => setPrivateGlobalCoins(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 w-full rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
                  />
                  <span>Your private reward (only you can see this).</span>
                </label>
              </div>
            </div>
            ) : null}

            <RetroStickerPicker value={stickers} onChange={(nextValue) => setStickers(normalizeRetroStickerSelection(nextValue))} />
          </div>

          </div>
        </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-white/10 p-5">
          {footerAction}
          {mode === "edit" && onDelete ? (
            <Button type="button" variant="danger" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete card
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={handleCloseRequest}>
            Cancel
          </Button>
          <Button disabled={isSaving}>{isSaving ? "Saving..." : "Save card"}</Button>
        </div>
      </form>
      </div>
      <ConfirmModal
        open={showConfirmClose}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard changes"
        variant="danger"
        onConfirm={() => {
          setShowConfirmClose(false);
          onClose();
        }}
        onClose={() => setShowConfirmClose(false)}
      />
    </>
  );

  return createPortal(modal, document.body);
}

function ColorPicker({
  selectedColor,
  onChange
}: {
  selectedColor: CardColor;
  onChange: (color: CardColor) => void;
}) {
  return (
    <div className="space-y-2 text-sm text-stone-300">
      <span>Card color</span>
      <div className="flex flex-wrap gap-2">
        {cardColorOptions.map((option) => {
          const meta = getCardColorMeta(option.value);

          return (
            <button
              key={option.value}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full border bg-white/[0.035] transition hover:scale-105 hover:border-white/25",
                selectedColor === option.value
                  ? "border-dusk-amber ring-2 ring-dusk-amber/45 ring-offset-2 ring-offset-ink-950"
                  : "border-white/10"
              )}
              title={option.label}
              type="button"
              onClick={() => onChange(option.value)}
            >
              <span className={cn("h-5 w-5 rounded-full border", meta.swatchClass)} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatusButton({
  status,
  selected,
  onClick
}: {
  status: CardStatus;
  selected: boolean;
  onClick: () => void;
}) {
  const meta = getStatusMeta(status);

  return (
    <button
      className={cn(
        "h-10 rounded-md border px-3 text-sm font-medium transition",
        selected ? meta.selectedButtonClass : meta.buttonClass
      )}
      type="button"
      onClick={onClick}
    >
      {meta.label}
    </button>
  );
}

function SortableChecklistItem({
  item,
  onCheckedChange,
  onDelete
}: {
  item: ChecklistItem;
  onCheckedChange: (checked: boolean) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md bg-ink-950/50 px-3 py-2 text-sm transition",
        isDragging && "border border-dusk-lavender/50 bg-dusk-lavender/10 shadow-lg"
      )}
    >
      <button
        className="cursor-grab text-stone-500 hover:text-dusk-lavender active:cursor-grabbing"
        type="button"
        aria-label="Drag checklist item"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <input
        className="h-4 w-4 accent-dusk-lavender"
        checked={item.checked}
        type="checkbox"
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <span className="flex-1">{item.label}</span>
      <button className="text-stone-500 hover:text-red-300" type="button" onClick={onDelete}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
