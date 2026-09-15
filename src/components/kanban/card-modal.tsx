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
import { FormEvent, ReactNode, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { CheckSquare, Coins, FileText, GripVertical, Plus, Star, Trash2, X, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppModal } from "@/components/ui/app-modal";
import { useAppModal } from "@/components/ui/app-modal";
import { DraftRecoveryModal } from "@/components/ui/draft-recovery-modal";
import { useToast } from "@/components/ui/toast";
import { DateTimeField } from "@/components/ui/date-time-field";
import { Input, Textarea } from "@/components/ui/input";
import { ColorSwatchPicker } from "@/components/ui/color-swatch-picker";
import { RetroStickerPicker } from "@/components/ui/retro-sticker-picker";
import { AssigneePicker } from "./assignee-picker";
import { useFormDraft } from "@/hooks/use-form-draft";
import { composeDueDate, composeStartDate } from "@/lib/kanban/due-date";
import {
  DIFFICULTY_CONFIGS,
  DIFFICULTY_SCORES,
  getDifficultyMetadata,
  type DifficultyScore
} from "@/lib/kanban/difficulty";
import { getPrivateCoinEntry, resolveCardRewardPayload } from "@/lib/kanban/private-coins";
import { getStatusMeta, statusOptions } from "@/lib/kanban/status";
import { normalizeRetroStickerSelection } from "@/lib/stickers/retro-stickers";
import { cardColorOptions, getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { Card, CardAssignee, CardStatus, ChecklistItem } from "@/types/kanban";

interface CardModalProps {
  card?: Card;
  mode: "create" | "edit";
  open: boolean;
  onClose: () => void;
  onDelete?: () => Promise<void>;
  footerAction?: ReactNode;
  members?: CardAssignee[];
  onSubmit: (data: {
    title: string;
    description: string | null;
    note: string | null;
    status: CardStatus;
    color: CardColor;
    checklist: ChecklistItem[];
    startDate?: string | null;
    startDateAllDay?: boolean;
    dueDate: string | null;
    dueDateAllDay: boolean;
    priority: "LOW" | "MEDIUM" | "HIGH";
    isStarred: boolean;
    rewardCoins?: number;
    privateCoins?: any;
    stickers?: string[];
    difficulty?: DifficultyScore | null;
    assigneeIds?: string[];
  }) => Promise<void>;
}

function startDateValue(card?: Card) {
  return card?.startDate ? card.startDate.slice(0, 10) : "";
}

function startTimeValue(card?: Card) {
  if (!card?.startDate || card.startDateAllDay) {
    return "";
  }

  const date = new Date(card.startDate);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
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

export function CardModal({ card, mode, open, onClose, onDelete, footerAction, members = [], onSubmit }: CardModalProps) {
  const [startDate, setStartDate] = useState(startDateValue(card));
  const [startTime, setStartTime] = useState(startTimeValue(card));
  const [date, setDate] = useState(dateValue(card));
  const [time, setTime] = useState(timeValue(card));
  const [selectedStatus, setSelectedStatus] = useState<CardStatus>(card?.status ?? "TODO");
  const [selectedColor, setSelectedColor] = useState<CardColor>(normalizeCardColor(card?.color));
  const [selectedPriority, setSelectedPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(card?.priority ?? "MEDIUM");
  const [difficulty, setDifficulty] = useState<DifficultyScore | null>(card?.difficulty ?? null);
  const [assigneeIds, setAssigneeIds] = useState<string[]>(card?.assigneeIds ?? []);
  const [isStarred, setIsStarred] = useState(card?.isStarred ?? false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card?.checklist ?? []);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [note, setNote] = useState(card?.note ?? "");
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);

  // Gamification fields
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [privateGlobalCoins, setPrivateGlobalCoins] = useState(0);
  const [rewardCoins, setRewardCoins] = useState(card?.rewardCoins ?? 0);
  const [showCoinRewards, setShowCoinRewards] = useState(Boolean(card?.rewardCoins));
  const [stickers, setStickers] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const isSubmittingRef = useRef(false);
  const { toast } = useToast();

  const draftKey = mode === "create" ? `card:new:${card?.columnId ?? "default"}` : `card:edit:${card?.id ?? "unknown"}`;

  const currentFormData = useMemo(
    () => ({
      title,
      description,
      note,
      startDate,
      startTime,
      date,
      time,
      selectedStatus,
      selectedColor,
      selectedPriority,
      isStarred,
      rewardCoins,
      privateGlobalCoins,
      stickers,
      checklist,
      difficulty,
      assigneeIds
    }),
    [
      title,
      description,
      note,
      startDate,
      startTime,
      date,
      time,
      selectedStatus,
      selectedColor,
      selectedPriority,
      isStarred,
      rewardCoins,
      privateGlobalCoins,
      stickers,
      checklist,
      difficulty,
      assigneeIds
    ]
  );

  const hasMeaningfulDraftData = useCallback((data: typeof currentFormData) => {
    return Boolean(
      (data.title && data.title.trim()) ||
      (data.description && data.description.trim()) ||
      (data.note && data.note.trim()) ||
      (data.checklist && data.checklist.length > 0) ||
      (data.assigneeIds && data.assigneeIds.length > 0) ||
      (data.startDate && data.startDate.trim()) ||
      (data.date && data.date.trim())
    );
  }, []);

  const handleRestoreDraft = useCallback((draft: typeof currentFormData) => {
    if (draft.title !== undefined) setTitle(draft.title);
    if (draft.description !== undefined) setDescription(draft.description);
    if (draft.note !== undefined) setNote(draft.note);
    if (draft.startDate !== undefined) setStartDate(draft.startDate);
    if (draft.startTime !== undefined) setStartTime(draft.startTime);
    if (draft.date !== undefined) setDate(draft.date);
    if (draft.time !== undefined) setTime(draft.time);
    if (draft.selectedStatus !== undefined) setSelectedStatus(draft.selectedStatus);
    if (draft.selectedColor !== undefined) setSelectedColor(draft.selectedColor);
    if (draft.selectedPriority !== undefined) setSelectedPriority(draft.selectedPriority);
    if (draft.isStarred !== undefined) setIsStarred(draft.isStarred);
    if (draft.rewardCoins !== undefined) setRewardCoins(draft.rewardCoins);
    if (draft.privateGlobalCoins !== undefined) setPrivateGlobalCoins(draft.privateGlobalCoins);
    if (draft.stickers !== undefined) setStickers(draft.stickers);
    if (draft.checklist !== undefined) setChecklist(draft.checklist);
    if (draft.difficulty !== undefined) setDifficulty(draft.difficulty);
    if (draft.assigneeIds !== undefined) setAssigneeIds(draft.assigneeIds);
    toast({ message: "กู้คืนข้อมูลร่างเรียบร้อยแล้ว", type: "success" });
  }, [toast]);

  const {
    isRecoveryOpen,
    draftTimestamp,
    restoreDraft,
    discardDraft,
    clearDraft
  } = useFormDraft({
    draftKey,
    currentData: currentFormData,
    enabled: open && mounted,
    hasMeaningfulData: hasMeaningfulDraftData,
    onRestore: handleRestoreDraft
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStartDate(startDateValue(card));
    setStartTime(startTimeValue(card));
    setDate(dateValue(card));
    setTime(timeValue(card));
    setSelectedStatus(card?.status ?? "TODO");
    setSelectedColor(normalizeCardColor(card?.color));
    setSelectedPriority(card?.priority ?? "MEDIUM");
    setDifficulty(card?.difficulty ?? null);
    setAssigneeIds(card?.assigneeIds ?? []);
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
        difficulty !== null ||
        assigneeIds.length > 0 ||
        isStarred ||
        rewardCoins > 0 ||
        stickers.length > 0 ||
        startDate !== "" ||
        startTime !== "" ||
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
    const initialDifficulty = card.difficulty ?? null;
    const initialAssignees = card.assigneeIds ?? [];
    const initialStarred = card.isStarred ?? false;
    const initialReward = card.rewardCoins ?? 0;
    const initialStickers = normalizeRetroStickerSelection(card.stickers);
    const initialStartDate = startDateValue(card);
    const initialStartTime = startTimeValue(card);
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

    const assigneesChanged =
      assigneeIds.length !== initialAssignees.length ||
      assigneeIds.some((id) => !initialAssignees.includes(id));

    return (
      title !== initialTitle ||
      description !== initialDesc ||
      note !== initialNote ||
      selectedStatus !== initialStatus ||
      selectedColor !== initialColor ||
      selectedPriority !== initialPriority ||
      difficulty !== initialDifficulty ||
      assigneesChanged ||
      isStarred !== initialStarred ||
      rewardCoins !== initialReward ||
      startDate !== initialStartDate ||
      startTime !== initialStartTime ||
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
    difficulty,
    assigneeIds,
    isStarred,
    rewardCoins,
    stickers,
    startDate,
    startTime,
    date,
    time,
    checklist
  ]);

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
    if (!title.trim() || isSubmittingRef.current || isSaving) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);
    const start = composeStartDate(startDate, startTime);
    const due = composeDueDate(date, time);
    const rewardPayload = resolveCardRewardPayload({
      activeUserId,
      enabled: showCoinRewards,
      privateCoins: card?.privateCoins,
      privateGlobalCoins,
      rewardCoins
    });

    try {
      await onSubmit({
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? "") || null,
        note: note || null,
        status: selectedStatus,
        color: selectedColor,
        checklist,
        startDate: start.startDate,
        startDateAllDay: start.startDateAllDay,
        dueDate: due.dueDate,
        dueDateAllDay: due.dueDateAllDay,
        priority: selectedPriority,
        isStarred,
        rewardCoins: rewardPayload.rewardCoins,
        privateCoins: rewardPayload.privateCoins,
        stickers: normalizeRetroStickerSelection(stickers),
        difficulty,
        assigneeIds
      });
      clearDraft();
    } finally {
      isSubmittingRef.current = false;
      setIsSaving(false);
    }
  }

  const modal = (
    <AppModal
        open={open && mounted}
        onClose={onClose}
        hasUnsavedChanges={hasChanges}
        onDiscard={() => {
          clearDraft();
          onClose();
        }}
        labelledBy="card-modal-title"
        contentClassName="lofi-panel flex max-h-[92vh] max-w-5xl flex-col overflow-hidden rounded-lg"
      >
      <form
        className="flex max-h-[92vh] w-full flex-col overflow-hidden"
        onSubmit={handleSubmit}
      >
        <div className="shrink-0 border-b border-white/10 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">{mode === "create" ? "New card" : "Edit card"}</p>
            <h2 id="card-modal-title" className="mt-1 text-2xl font-semibold">{mode === "create" ? "Create card" : "Card details"}</h2>
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
              <Star className="h-4 w-4" />
            </button>
            <CardModalCloseButton
              className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </CardModalCloseButton>
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

          {/* Difficulty Score (1, 3, 5, 8, 16, 21) */}
          <div className="space-y-2 text-sm text-stone-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>คะแนนความยาก (Story Points)</span>
              </span>
              {difficulty ? (
                <span className="text-xs text-stone-400 font-medium">
                  {getDifficultyMetadata(difficulty)?.title}
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              <button
                type="button"
                className={cn(
                  "h-9 rounded-md border text-xs font-semibold transition flex items-center justify-center",
                  difficulty === null
                    ? "border-white/30 bg-white/10 text-stone-200 shadow-xs font-bold"
                    : "border-white/10 text-stone-500 hover:text-stone-300 hover:border-white/20"
                )}
                onClick={() => setDifficulty(null)}
                title="ไม่กำหนดคะแนนความยาก"
              >
                -
              </button>
              {DIFFICULTY_SCORES.map((score) => {
                const isSelected = difficulty === score;
                const meta = DIFFICULTY_CONFIGS[score];
                return (
                  <button
                    key={score}
                    type="button"
                    title={`${meta.title} — ${meta.description}`}
                    className={cn(
                      "h-9 rounded-md border text-xs font-bold transition flex items-center justify-center gap-0.5",
                      isSelected
                        ? meta.activeChipClass
                        : "border-white/10 text-stone-400 hover:text-stone-200 hover:border-white/20"
                    )}
                    onClick={() => setDifficulty(isSelected ? null : score)}
                  >
                    ⚡{score}
                  </button>
                );
              })}
            </div>
            {difficulty ? (
              <p className="text-[11px] text-stone-400">
                {getDifficultyMetadata(difficulty)?.description}
              </p>
            ) : (
              <p className="text-[11px] text-stone-500">
                ระดับความยาก: 1, 3, 5, 8, 16, 21 pts
              </p>
            )}
          </div>

          {/* ผู้รับผิดชอบ (Assignees) */}
          <AssigneePicker
            members={members}
            selectedIds={assigneeIds}
            onChange={setAssigneeIds}
            disabled={isSaving}
          />

          {/* วันที่เริ่ม และ วันที่สิ้นสุด (Start Date & Due Date) */}
          <div className="space-y-3">
            <DateTimeField
              label="วันที่เริ่ม (Start Date)"
              description="กำหนดวันเริ่มต้นของงาน (ไม่มีเวลาระบุ = ตลอดวัน)"
              value={{ date: startDate, time: startTime }}
              onChange={(nextValue) => {
                setStartDate(nextValue.date);
                setStartTime(nextValue.time);
              }}
            />

            <DateTimeField
              label="วันที่สิ้นสุด (Due / End Date)"
              description="กำหนดวันสิ้นสุดหรือส่งงาน (ไม่มีเวลาระบุ = ตลอดวัน)"
              value={{ date, time }}
              onChange={(nextValue) => {
                setDate(nextValue.date);
                setTime(nextValue.time);
              }}
            />
            {startDate && date && startDate > date ? (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300">
                ⚠️ ข้อสังเกต: วันที่เริ่มต้น ({startDate}) อยู่หลังวันที่สิ้นสุด ({date})
              </p>
            ) : null}
          </div>

          <ColorPicker selectedColor={selectedColor} onChange={setSelectedColor} />

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
          <CardModalCancelButton />
          <Button disabled={isSaving}>{isSaving ? "Saving..." : "Save card"}</Button>
        </div>
      </form>
    </AppModal>
  );

  return (
    <>
      {modal}
      <DraftRecoveryModal
        open={isRecoveryOpen}
        savedAt={draftTimestamp}
        onRestore={restoreDraft}
        onDiscard={discardDraft}
      />
    </>
  );
}

function CardModalCloseButton({ className, children, ...props }: React.ComponentPropsWithoutRef<"button">) {
  const { requestClose } = useAppModal();
  return (
    <button type="button" onClick={requestClose} className={className} {...props}>
      {children}
    </button>
  );
}

function CardModalCancelButton() {
  const { requestClose } = useAppModal();
  return (
    <Button type="button" variant="ghost" onClick={requestClose}>
      Cancel
    </Button>
  );
}

function ColorPicker({
  selectedColor,
  onChange
}: {
  selectedColor: CardColor;
  onChange: (color: CardColor) => void;
}) {
  return (
    <ColorSwatchPicker
      label="Card color"
      value={selectedColor}
      onChange={onChange}
    />
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
