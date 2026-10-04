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
import { CheckSquare, Coins, GripVertical, KeyRound, Plus, Sparkles, Star, Trash2, X, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { playCardCreateSound } from "@/lib/sound";
import { AppModal } from "@/components/ui/app-modal";
import { useAppModal } from "@/components/ui/app-modal";
import { DraftRecoveryModal } from "@/components/ui/draft-recovery-modal";
import { useToast } from "@/components/ui/toast";
import { DateTimeField } from "@/components/ui/date-time-field";
import { Input, Textarea } from "@/components/ui/input";
import { ColorSwatchPicker } from "@/components/ui/color-swatch-picker";
import { RetroStickerPicker } from "@/components/ui/retro-sticker-picker";
import { AssigneePicker } from "./assignee-picker";
import { CardChatTimeline } from "@/components/kanban/card-chat-timeline";
import { AiBreakdownModal } from "@/components/ai/ai-breakdown-modal";
import { ApiKeyModal } from "@/components/ai/api-key-modal";
import { getAiAuthHeaders } from "@/lib/ai/client-key";
import { useFormDraft } from "@/hooks/use-form-draft";
import { composeDueDate, composeStartDate } from "@/lib/kanban/due-date";
import {
  DIFFICULTY_CONFIGS,
  DIFFICULTY_SCORES,
  getDifficultyMetadata,
  getStoredStoryPoints,
  type CustomStoryPoint,
  type DifficultyScore
} from "@/lib/kanban/difficulty";
import { getPrivateCoinEntry, resolveCardRewardPayload } from "@/lib/kanban/private-coins";
import { getStatusMeta, getStoredStatuses, type CustomStatusOption } from "@/lib/kanban/status";
import { CardAttributesEditModal } from "@/components/kanban/card-attributes-edit-modal";
import { cardStickerOptions, normalizeRetroStickerSelection } from "@/lib/stickers/retro-stickers";
import { cardColorOptions, getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";
import { getPriorityColorConfig, resolveBoardPriorities } from "@/lib/kanban/priority";
import { cn } from "@/lib/utils";
import type { Card, CardAssignee, CardPriority, CardStatus, ChecklistItem, CustomPriority } from "@/types/kanban";

interface CardModalProps {
  card?: Card;
  mode: "create" | "edit";
  open: boolean;
  onClose: () => void;
  onDelete?: () => Promise<void>;
  footerAction?: ReactNode;
  members?: CardAssignee[];
  currentUserId?: string;
  boardId?: string;
  boardPriorities?: CustomPriority[];
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
    priority: CardPriority;
    isStarred: boolean;
    rewardCoins?: number;
    privateCoins?: any;
    stickers?: string[];
    difficulty?: DifficultyScore | null;
    assigneeIds?: string[];
  }) => Promise<void>;
}

function formatLocalDate(isoString?: string | null, isAllDay = false): string {
  if (!isoString) return "";
  if (isAllDay) {
    return isoString.slice(0, 10);
  }
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) {
    return isoString.slice(0, 10);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startDateValue(card?: Card) {
  return formatLocalDate(card?.startDate, card?.startDateAllDay);
}

function startTimeValue(card?: Card) {
  if (!card?.startDate || card.startDateAllDay) {
    return "";
  }

  const date = new Date(card.startDate);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function dateValue(card?: Card) {
  return formatLocalDate(card?.dueDate, card?.dueDateAllDay);
}

function timeValue(card?: Card) {
  if (!card?.dueDate || card.dueDateAllDay) {
    return "";
  }

  const date = new Date(card.dueDate);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function CardModal({ card, mode, open, onClose, onDelete, footerAction, members = [], currentUserId, boardId, boardPriorities, onSubmit }: CardModalProps) {
  const [startDate, setStartDate] = useState(startDateValue(card));
  const [startTime, setStartTime] = useState(startTimeValue(card));
  const [date, setDate] = useState(dateValue(card));
  const [time, setTime] = useState(timeValue(card));
  const [selectedStatus, setSelectedStatus] = useState<CardStatus>(card?.status ?? "TODO");
  const [selectedColor, setSelectedColor] = useState<CardColor>(normalizeCardColor(card?.color));
  const [selectedPriority, setSelectedPriority] = useState<CardPriority>(card?.priority ?? "MEDIUM");

  // Dynamic Statuses, Priorities, and Story Points
  const [statuses, setStatuses] = useState<CustomStatusOption[]>(() => getStoredStatuses(boardId));
  const [storyPoints, setStoryPoints] = useState<CustomStoryPoint[]>(() => getStoredStoryPoints(boardId));
  const [localPriorities, setLocalPriorities] = useState<CustomPriority[]>(() => resolveBoardPriorities(boardPriorities));

  // Edit Attributes Modal State
  const [isEditAttributesOpen, setIsEditAttributesOpen] = useState(false);
  const [editAttributesTab, setEditAttributesTab] = useState<"status" | "priority" | "story-points">("status");

  // Keep localPriorities in sync if boardPriorities changes from parent
  useEffect(() => {
    if (boardPriorities && boardPriorities.length > 0) {
      setLocalPriorities(resolveBoardPriorities(boardPriorities));
    }
  }, [boardPriorities]);

  // Global Sync Listeners
  useEffect(() => {
    const handleStatusSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.boardId || detail.boardId === boardId) {
        if (detail?.statuses) setStatuses(detail.statuses);
        else setStatuses(getStoredStatuses(boardId));
      }
    };
    const handleStoryPointsSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.boardId || detail.boardId === boardId) {
        if (detail?.points) setStoryPoints(detail.points);
        else setStoryPoints(getStoredStoryPoints(boardId));
      }
    };
    const handlePrioritiesSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.boardId || detail.boardId === boardId) {
        if (detail?.customPriorities || detail?.priorities) {
          setLocalPriorities(resolveBoardPriorities(detail.customPriorities || detail.priorities));
        }
      }
    };

    window.addEventListener("retzlo:statuses-updated", handleStatusSync);
    window.addEventListener("retzlo:story-points-updated", handleStoryPointsSync);
    window.addEventListener("retzlo:priorities-updated", handlePrioritiesSync);
    window.addEventListener("board-priorities-updated", handlePrioritiesSync);
    return () => {
      window.removeEventListener("retzlo:statuses-updated", handleStatusSync);
      window.removeEventListener("retzlo:story-points-updated", handleStoryPointsSync);
      window.removeEventListener("retzlo:priorities-updated", handlePrioritiesSync);
      window.removeEventListener("board-priorities-updated", handlePrioritiesSync);
    };
  }, [boardId]);

  const activePriorities = useMemo(() => {
    const resolved = resolveBoardPriorities(localPriorities);
    if (selectedPriority && !resolved.some((p) => p.label.toUpperCase() === selectedPriority.toUpperCase() || p.id === selectedPriority)) {
      return [
        ...resolved,
        {
          id: `legacy-${selectedPriority}`,
          label: selectedPriority,
          level: resolved.length + 1,
          color: "stone"
        }
      ];
    }
    return resolved;
  }, [localPriorities, selectedPriority]);
  const [difficulty, setDifficulty] = useState<DifficultyScore | null>(card?.difficulty ?? null);
  const currentDifficultyMeta = useMemo(() => {
    return getDifficultyMetadata(difficulty, storyPoints);
  }, [difficulty, storyPoints]);
  const [assigneeIds, setAssigneeIds] = useState<string[]>(card?.assigneeIds ?? []);
  const [isStarred, setIsStarred] = useState(card?.isStarred ?? false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card?.checklist ?? []);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [aiBreakdownOpen, setAiBreakdownOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyModalReason, setApiKeyModalReason] = useState<string | undefined>(undefined);

  // Gamification fields
  const [activeUserId, setActiveUserId] = useState<string | null>(currentUserId ?? null);

  useEffect(() => {
    if (currentUserId) {
      setActiveUserId(currentUserId);
    }
  }, [currentUserId]);

  const [privateGlobalCoins, setPrivateGlobalCoins] = useState(0);
  const [rewardCoins, setRewardCoins] = useState(card?.rewardCoins ?? 0);
  const [showCoinRewards, setShowCoinRewards] = useState(Boolean(card?.rewardCoins));
  const [stickers, setStickers] = useState<string[]>(() => normalizeRetroStickerSelection(card?.stickers));
  const [mounted, setMounted] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const isSubmittingRef = useRef(false);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  }, [open, card?.id]);

  const draftKey = mode === "create" ? `card:new:${card?.columnId ?? "default"}` : `card:edit:${card?.id ?? "unknown"}`;

  const currentFormData = useMemo(
    () => ({
      title,
      description,
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
      (data.checklist && data.checklist.length > 0) ||
      (data.assigneeIds && data.assigneeIds.length > 0) ||
      (data.startDate && data.startDate.trim()) ||
      (data.date && data.date.trim())
    );
  }, []);

  const handleRestoreDraft = useCallback((draft: typeof currentFormData) => {
    if (draft.title !== undefined) setTitle(draft.title);
    if (draft.description !== undefined) setDescription(draft.description);
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

  const hasChanges = useMemo(() => {
    const initialTitle = card?.title ?? "";
    const initialDesc = card?.description ?? "";
    const initialStatus = card?.status ?? "TODO";
    const initialColor = normalizeCardColor(card?.color);
    const initialPriority = card?.priority ?? "MEDIUM";
    const initialDifficulty = card?.difficulty ?? null;
    const initialAssignees = card?.assigneeIds ?? [];
    const initialStarred = card?.isStarred ?? false;
    const initialReward = card?.rewardCoins ?? 0;
    const initialStickers = normalizeRetroStickerSelection(card?.stickers);
    const initialStartDate = startDateValue(card);
    const initialStartTime = startTimeValue(card);
    const initialDate = dateValue(card);
    const initialTime = timeValue(card);

    const checklistChanged =
      checklist.length !== (card?.checklist?.length ?? 0) ||
      checklist.some((item, idx) => {
        const initialItem = card?.checklist?.[idx];
        return !initialItem || item.label !== initialItem.label || item.checked !== initialItem.checked;
      });

    const stickersChanged =
      stickers.length !== initialStickers.length ||
      stickers.some((s, idx) => s !== initialStickers[idx]);

    const assigneesChanged =
      assigneeIds.length !== initialAssignees.length ||
      assigneeIds.some((id) => !initialAssignees.includes(id));

    const textChanged =
      mode === "create"
        ? title.trim() !== "" || description.trim() !== ""
        : title.trim() !== initialTitle.trim() || description.trim() !== initialDesc.trim();

    return (
      textChanged ||
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

  const isDraftEqualInitial = useCallback(
    (draft: typeof currentFormData) => {
      if (mode === "create") {
        const initialStatus = card?.status ?? "TODO";
        const initialColor = normalizeCardColor(card?.color);
        const initialPriority = card?.priority ?? "MEDIUM";
        return (
          (!draft.title || !draft.title.trim()) &&
          (!draft.description || !draft.description.trim()) &&
          (!draft.checklist || draft.checklist.length === 0) &&
          (draft.selectedStatus === initialStatus || !draft.selectedStatus) &&
          (normalizeCardColor(draft.selectedColor) === initialColor || !draft.selectedColor) &&
          (draft.selectedPriority === initialPriority || !draft.selectedPriority) &&
          (draft.difficulty === null || draft.difficulty === undefined) &&
          (!draft.assigneeIds || draft.assigneeIds.length === 0) &&
          !draft.isStarred &&
          (!draft.rewardCoins || draft.rewardCoins === 0) &&
          (!draft.stickers || draft.stickers.length === 0) &&
          (!draft.startDate || !draft.startDate.trim()) &&
          (!draft.startTime || !draft.startTime.trim()) &&
          (!draft.date || !draft.date.trim()) &&
          (!draft.time || !draft.time.trim())
        );
      }

      if (!card) return false;

      const initialTitle = card.title ?? "";
      const initialDesc = card.description ?? "";
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

      const draftTitle = draft.title ?? "";
      const draftDesc = draft.description ?? "";
      const draftStatus = draft.selectedStatus ?? "TODO";
      const draftColor = normalizeCardColor(draft.selectedColor);
      const draftPriority = draft.selectedPriority ?? "MEDIUM";
      const draftDifficulty = draft.difficulty ?? null;
      const draftAssignees = draft.assigneeIds ?? [];
      const draftStarred = Boolean(draft.isStarred);
      const draftReward = draft.rewardCoins ?? 0;
      const draftStickers = normalizeRetroStickerSelection(draft.stickers);
      const draftStartDate = draft.startDate ?? "";
      const draftStartTime = draft.startTime ?? "";
      const draftDate = draft.date ?? "";
      const draftTime = draft.time ?? "";

      const checklistMatches =
        (draft.checklist?.length ?? 0) === (card.checklist?.length ?? 0) &&
        (draft.checklist ?? []).every((item, idx) => {
          const initialItem = card.checklist?.[idx];
          return initialItem && item.label === initialItem.label && item.checked === initialItem.checked;
        });

      const stickersMatches =
        draftStickers.length === initialStickers.length &&
        draftStickers.every((s, idx) => s === initialStickers[idx]);

      const assigneesMatches =
        draftAssignees.length === initialAssignees.length &&
        draftAssignees.every((id) => initialAssignees.includes(id));

      return (
        draftTitle === initialTitle &&
        draftDesc === initialDesc &&
        draftStatus === initialStatus &&
        draftColor === initialColor &&
        draftPriority === initialPriority &&
        draftDifficulty === initialDifficulty &&
        draftStarred === initialStarred &&
        draftReward === initialReward &&
        draftStartDate === initialStartDate &&
        draftStartTime === initialStartTime &&
        draftDate === initialDate &&
        draftTime === initialTime &&
        checklistMatches &&
        stickersMatches &&
        assigneesMatches
      );
    },
    [card, mode]
  );

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
    isDirty: hasChanges,
    hasMeaningfulData: hasMeaningfulDraftData,
    isDraftEqualInitial,
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

  function handleApplyAiChecklist(params: {
    items: string[];
    mode: "append" | "replace";
    suggestedDifficulty?: 1 | 3 | 5 | 8;
    suggestedPriority?: "LOW" | "MEDIUM" | "HIGH";
  }) {
    const newItems: ChecklistItem[] = params.items.map((label) => ({
      id: crypto.randomUUID(),
      label,
      checked: false
    }));

    if (params.mode === "replace") {
      setChecklist(newItems);
    } else {
      setChecklist((current) => [...current, ...newItems]);
    }

    if (params.suggestedDifficulty && !difficulty) {
      setDifficulty(params.suggestedDifficulty as DifficultyScore);
    }

    if (params.suggestedPriority && selectedPriority === "MEDIUM") {
      setSelectedPriority(params.suggestedPriority);
    }
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
        note: null,
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
        contentClassName="lofi-panel flex w-full max-h-[90dvh] sm:max-h-[92dvh] max-w-5xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
      >
      <form
        className="flex max-h-[90dvh] sm:max-h-[92dvh] w-full flex-col overflow-hidden"
        onSubmit={handleSubmit}
      >
        <div className="shrink-0 border-b border-white/10 p-3.5 sm:p-5">
        <div className="mx-auto -mt-1 mb-2.5 h-1 w-8 rounded-full bg-white/20 sm:hidden" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">{mode === "create" ? "New card" : "Edit card"}</p>
            <h2 id="card-modal-title" className="mt-1 text-xl sm:text-2xl font-semibold">{mode === "create" ? "Create card" : "Card details"}</h2>
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

        <div ref={modalBodyRef} className="scrollbar-soft min-h-0 flex-1 overflow-y-auto p-3.5 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(18rem,2fr)] lg:items-start">
          <div className="grid gap-4">
          <div className="space-y-1.5">
            <label htmlFor="card-title" className="text-sm font-medium text-stone-600 dark:text-stone-300">Card title</label>
            <Input id="card-title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card title" required />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="card-description" className="text-sm font-medium text-stone-600 dark:text-stone-300">Description</label>
            <Textarea id="card-description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details, links, context..." />
          </div>

          {/* Mobile Quick Status & Priority Bar */}
          <div className="lg:hidden rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">Status</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditAttributesTab("status");
                    setIsEditAttributesOpen(true);
                  }}
                  className="h-5 w-5 rounded-md grid place-items-center text-stone-400 hover:text-stone-100 hover:bg-white/10 transition cursor-pointer"
                  title="Add or Edit Statuses"
                  aria-label="Add or Edit Statuses"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {statuses.map((option) => (
                  <StatusButton
                    key={`mobile-${option.value}`}
                    selected={selectedStatus === option.value}
                    status={option.value}
                    customStatuses={statuses}
                    onClick={() => setSelectedStatus(option.value as CardStatus)}
                  />
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400 font-medium">Priority</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditAttributesTab("priority");
                    setIsEditAttributesOpen(true);
                  }}
                  className="h-5 w-5 rounded-md grid place-items-center text-stone-400 hover:text-stone-100 hover:bg-white/10 transition cursor-pointer"
                  title="Add or Edit Priorities"
                  aria-label="Add or Edit Priorities"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activePriorities.map((item) => {
                  const colorConfig = getPriorityColorConfig(item.color);
                  const isSelected =
                    selectedPriority?.toUpperCase() === item.id.toUpperCase() ||
                    selectedPriority?.toUpperCase() === item.label.toUpperCase();
                  return (
                    <button
                      key={`mobile-${item.id}`}
                      type="button"
                      onClick={() => setSelectedPriority(item.id as CardPriority)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg border text-xs font-semibold transition text-center flex items-center gap-1.5",
                        isSelected
                          ? cn(colorConfig.pillClass, "ring-1 ring-white/20 font-bold")
                          : "border-stone-200 bg-stone-50 text-stone-700 hover:border-indigo-300 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400 dark:hover:text-stone-200"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full shrink-0", colorConfig.dotClass)} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
            <div className="mb-3 flex items-center justify-between text-sm font-medium text-stone-200">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-dusk-cyan" />
                <span>Checklist</span>
                {checklist.length > 0 && (
                  <span className="text-xs text-stone-400 font-mono">
                    ({checklist.filter((i) => i.checked).length}/{checklist.length})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAiBreakdownOpen(true)}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-dusk-lavender/40 bg-dusk-lavender/10 px-2.5 py-1 text-xs font-semibold text-dusk-lavender shadow-xs transition-all hover:border-dusk-lavender hover:bg-dusk-lavender/20 hover:scale-102 active:scale-98 cursor-pointer"
                  title="สร้างเช็กลิสต์ด้วย AI มีจำนวนแนะนำ กำหนดจำนวนได้ และยืนยันก่อนสร้าง"
                >
                  <Sparkles className="h-3.5 w-3.5 text-dusk-amber animate-pulse" />
                  <span>AI Breakdown</span>
                  <span className="rounded bg-dusk-lavender/20 px-1 py-0.2 text-[10px] font-mono text-dusk-lavender/90">
                    1 cr
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setApiKeyModalReason(undefined);
                    setApiKeyModalOpen(true);
                  }}
                  className="rounded-lg p-1 text-stone-400 hover:bg-white/10 hover:text-stone-200 transition cursor-pointer"
                  title="ตั้งค่า AI API Key (สำหรับใช้งานบน Vercel/เบราว์เซอร์)"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                </button>
              </div>
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

          {mode === "edit" && card?.id ? (
            <CardChatTimeline
              cardId={card.id}
              currentUserId={activeUserId ?? currentUserId ?? undefined}
            />
          ) : null}
          </div>

          <div className="grid gap-4 lg:sticky lg:top-0">
          <div className="space-y-2 text-sm text-stone-300 hidden lg:block">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-300">Status</span>
              <button
                type="button"
                onClick={() => {
                  setEditAttributesTab("status");
                  setIsEditAttributesOpen(true);
                }}
                className="h-6 w-6 rounded-md grid place-items-center text-stone-400 hover:text-stone-100 hover:bg-white/10 transition cursor-pointer"
                title="Add or Edit Statuses"
                aria-label="Add or Edit Statuses"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {statuses.map((option) => (
                <StatusButton
                  key={option.value}
                  selected={selectedStatus === option.value}
                  status={option.value}
                  customStatuses={statuses}
                  onClick={() => setSelectedStatus(option.value as CardStatus)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2 text-sm text-stone-300 hidden lg:block">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-300">Priority</span>
              <button
                type="button"
                onClick={() => {
                  setEditAttributesTab("priority");
                  setIsEditAttributesOpen(true);
                }}
                className="h-6 w-6 rounded-md grid place-items-center text-stone-400 hover:text-stone-100 hover:bg-white/10 transition cursor-pointer"
                title="Add or Edit Priorities"
                aria-label="Add or Edit Priorities"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activePriorities.map((item) => {
                const colorConfig = getPriorityColorConfig(item.color);
                const isSelected =
                  selectedPriority?.toUpperCase() === item.id.toUpperCase() ||
                  selectedPriority?.toUpperCase() === item.label.toUpperCase();

                return (
                  <button
                    key={item.id}
                    className={cn(
                      "h-9 px-3 rounded-md border text-xs font-medium transition flex items-center gap-1.5",
                      isSelected
                        ? cn(colorConfig.pillClass, "ring-2 ring-indigo-500/30 font-semibold shadow-xs")
                        : "border-stone-200 bg-stone-50 text-stone-700 hover:border-indigo-300 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400 dark:hover:text-stone-200"
                    )}
                    type="button"
                    onClick={() => setSelectedPriority(item.id as CardPriority)}
                  >
                    <span className={cn("w-2 h-2 rounded-full shrink-0", colorConfig.dotClass)} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Score (Story Points) */}
          <div className="space-y-2 text-sm text-stone-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>คะแนนความยาก (Story Points)</span>
                </span>
                {difficulty ? (
                  <span className="text-xs text-stone-400 font-medium">
                    {currentDifficultyMeta?.title}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditAttributesTab("story-points");
                  setIsEditAttributesOpen(true);
                }}
                className="h-6 w-6 rounded-md grid place-items-center text-stone-400 hover:text-stone-100 hover:bg-white/10 transition cursor-pointer"
                title="Add or Edit Story Points"
                aria-label="Add or Edit Story Points"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
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
              {storyPoints.map((point) => {
                const isSelected = difficulty === point.score;
                const meta = getDifficultyMetadata(point.score, storyPoints);
                return (
                  <button
                    key={point.score}
                    type="button"
                    title={`${meta?.title || point.score} — ${meta?.description || ""}`}
                    className={cn(
                      "h-9 rounded-md border text-xs font-bold transition flex items-center justify-center gap-0.5",
                      isSelected
                        ? meta?.activeChipClass
                        : "border-white/10 text-stone-400 hover:text-stone-200 hover:border-white/20"
                    )}
                    onClick={() => setDifficulty(isSelected ? null : (point.score as any))}
                  >
                    ⚡{point.label || point.score}
                  </button>
                );
              })}
            </div>
            {difficulty ? (
              <p className="text-[11px] text-stone-400">
                {currentDifficultyMeta?.description}
              </p>
            ) : (
              <p className="text-[11px] text-stone-500">
                ระดับความยาก: {storyPoints.map((p) => p.label || p.score).join(", ")} pts
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
                  <span className="text-stone-700 dark:text-stone-300 font-medium">Project Coins (🪙 ของทีม)</span>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={rewardCoins}
                    onChange={(e) => setRewardCoins(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none focus:border-dusk-lavender/70 dark:border-white/10 dark:bg-ink-950/60 dark:text-stone-100"
                  />
                  <span className="text-stone-500">Awarded to assignee upon completion.</span>
                </label>

                <label className="block space-y-1 text-xs text-stone-400">
                  <span className="text-stone-700 dark:text-stone-300 font-medium">My Private Coins (🪙 ส่วนตัว)</span>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={privateGlobalCoins}
                    onChange={(e) => setPrivateGlobalCoins(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none focus:border-dusk-lavender/70 dark:border-white/10 dark:bg-ink-950/60 dark:text-stone-100"
                  />
                  <span className="text-stone-500">Your private reward (only you can see this).</span>
                </label>
              </div>
            </div>
            ) : null}

            <RetroStickerPicker options={cardStickerOptions} value={stickers} onChange={(nextValue) => setStickers(normalizeRetroStickerSelection(nextValue))} />
          </div>

          </div>
        </div>
        </div>

        <div className="flex shrink-0 flex-wrap sm:flex-nowrap justify-end gap-2 border-t border-white/10 p-3.5 sm:p-5 pb-safe">
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
      <AiBreakdownModal
        open={aiBreakdownOpen}
        onClose={() => setAiBreakdownOpen(false)}
        cardTitle={title}
        cardDescription={description}
        onApply={handleApplyAiChecklist}
      />
      <ApiKeyModal
        open={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        reason={apiKeyModalReason}
        onSaved={() => {
          setAiBreakdownOpen(true);
        }}
      />
      <CardAttributesEditModal
        open={isEditAttributesOpen}
        onClose={() => setIsEditAttributesOpen(false)}
        initialTab={editAttributesTab}
        boardId={boardId}
        statuses={statuses}
        onUpdateStatuses={setStatuses}
        priorities={localPriorities}
        onUpdatePriorities={setLocalPriorities}
        storyPoints={storyPoints}
        onUpdateStoryPoints={setStoryPoints}
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
  customStatuses,
  onClick
}: {
  status: string;
  selected: boolean;
  customStatuses?: CustomStatusOption[];
  onClick: () => void;
}) {
  const meta = getStatusMeta(status, customStatuses);

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
        "flex items-center gap-2 rounded-lg border border-stone-200/90 bg-stone-50/90 px-3 py-2 text-sm text-stone-800 transition dark:border-white/10 dark:bg-ink-950/50 dark:text-stone-200",
        isDragging && "border-dusk-lavender/50 bg-dusk-lavender/10 shadow-lg"
      )}
    >
      <button
        className="cursor-grab text-stone-400 hover:text-dusk-lavender active:cursor-grabbing dark:text-stone-500"
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
      <span className={cn("flex-1", item.checked && "line-through text-stone-400 dark:text-stone-500")}>
        {item.label}
      </span>
      <button
        className="text-stone-400 hover:text-red-500 dark:text-stone-500 dark:hover:text-red-300 transition"
        type="button"
        onClick={onDelete}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
