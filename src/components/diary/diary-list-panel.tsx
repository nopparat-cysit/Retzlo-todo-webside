"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState, useEffect, useCallback } from "react";
import {
  BookOpenCheck,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Coins,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Repeat,
  Save,
  SlidersHorizontal,
  CheckSquare,
  Shield,
  Sparkles,
  Star,
  Trash2,
  X,
  Circle
} from "lucide-react";

import { useLiveSync } from "@/hooks/use-live-sync";
import { DiaryChecklistEditor, DiaryChecklistPreview } from "@/components/diary/diary-checklist";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/state";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ColorSwatchPicker } from "@/components/ui/color-swatch-picker";
import { useToast } from "@/components/ui/toast";
import {
  getDiaryChecklistSummary,
  hasDiaryRewardBeenClaimed,
  isDiaryChecklistItemCompletedOnDate,
  isDiaryChecklistItemDueOnDate,
  normalizeDiaryChecklist,
  toggleDiaryChecklistCompletion,
  type DiaryChecklistItem,
  type DiaryRewardCoinType
} from "@/lib/diary/checklist";
import { formatMediumDate } from "@/lib/date-format";
import { cardColorOptions, getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { ProjectDiaryItem } from "@/types/diary-item";

interface DiaryListPanelProps {
  projectId: string;
  initialItems: ProjectDiaryItem[];
  selectedDate: string;
  allowMemberPrivateItems: boolean;
  isOwner: boolean;
}

interface DiaryPayload {
  title: string;
  description: string;
  color: CardColor;
  intervalDays: number;
  startDate: string;
  checklist: DiaryChecklistItem[];
  rewardCoins: number;
  rewardCoinType: DiaryRewardCoinType;
  rewardClaimedDates?: string[];
  selectedDate?: string;
  isStarred: boolean;
  isHidden: boolean;
  dueTime: string | null;
}

type DiaryFilter = "all" | "today" | "upcoming" | "starred" | "hidden";
type DiarySort = "due" | "title" | "starred" | "date";

type DiaryItemWithSummary = ProjectDiaryItem & {
  checklistSummary: ReturnType<typeof getDiaryChecklistSummary>;
  isDueToday: boolean;
};

export function DiaryListPanel({
  projectId,
  initialItems,
  selectedDate,
  allowMemberPrivateItems,
  isOwner
}: DiaryListPanelProps) {
  const [items, setItems] = useState<ProjectDiaryItem[]>(initialItems);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProjectDiaryItem | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [filter, setFilter] = useState<DiaryFilter>("all");
  const [sortBy, setSortBy] = useState<DiarySort>("due");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [pendingUpdatePayload, setPendingUpdatePayload] = useState<any>(null);

  const itemsWithSummary = useMemo<DiaryItemWithSummary[]>(() => {
    const list = [...items].map((item) => {
      const checklistSummary = getDiaryChecklistSummary(item, selectedDate);

      return {
        ...item,
        checklistSummary,
        isDueToday: checklistSummary.isDue
      };
    });

    return list.sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "starred") {
        if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
      }
      if (sortBy === "date") {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      // default "due"
      if (a.isDueToday !== b.isDueToday) return a.isDueToday ? -1 : 1;
      if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [items, selectedDate, sortBy]);

  const visibleItems = useMemo(() => {
    return itemsWithSummary.filter((item) => {
      if (filter === "today") return item.isDueToday;
      if (filter === "upcoming") return !item.isDueToday;
      if (filter === "starred") return item.isStarred;
      if (filter === "hidden") return item.isHidden;
      return true;
    });
  }, [filter, itemsWithSummary]);

  const focusedItem = visibleItems.find((item) => item.id === focusedItemId) ?? visibleItems[0] ?? null;
  const todayDueItems = itemsWithSummary.filter((item) => item.isDueToday);
  const completedTodayCount = todayDueItems.reduce((total, item) => total + item.checklistSummary.completedCount, 0);
  const dueTodayCount = todayDueItems.reduce((total, item) => {
    if (item.checklistSummary.hasChecklist) return total + item.checklistSummary.dueCount;
    return total + (item.checklistSummary.isDue ? 1 : 0);
  }, 0);


  async function saveItem(url: string, method: "POST" | "PATCH", payload: Partial<DiaryPayload>) {
    setError(null);
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { diaryItem?: ProjectDiaryItem; error?: string };

    if (!response.ok || !data.diaryItem) {
      const msg = data.error ?? "Something did not sync. Try again.";
      setError(msg);
      toast({ message: msg, type: "error" });
      return null;
    }

    return normalizeDiaryItem(data.diaryItem);
  }

  const refreshDiary = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/diary-items`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" }
      });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data?.diaryItems)) {
        setItems(data.diaryItems.map(normalizeDiaryItem));
      }
    } catch {
      // Ignore background sync errors
    }
  }, [projectId]);

  const { broadcastChange } = useLiveSync({
    channelKey: [`project:${projectId}`, `diary:${projectId}`],
    intervalMs: 3000,
    canSync: () => {
      if (isCreateOpen || selectedItem) return false;
      if (isDeleteConfirmOpen || isUpdateConfirmOpen) return false;
      if (typeof document !== "undefined" && document.querySelector("[role='dialog']")) return false;
      return true;
    },
    onSync: refreshDiary
  });

  async function createItem(payload: DiaryPayload) {
    const item = await saveItem(`/api/projects/${projectId}/diary-items`, "POST", payload);

    if (!item) return;

    setItems((current) => [item, ...current]);
    setFocusedItemId(item.id);
    setIsCreateOpen(false);
    toast({ message: "Diary item created.", type: "success" });
    broadcastChange();
  }

  async function updateItem(itemId: string, payload: Partial<DiaryPayload>, showToast = true) {
    const item = await saveItem(`/api/diary-items/${itemId}`, "PATCH", payload);

    if (!item) return false;

    setItems((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
    setSelectedItem((current) => (current?.id === item.id ? item : current));
    if (showToast) {
      toast({ message: "Diary item updated.", type: "success" });
    }
    broadcastChange();
    return true;
  }

  async function updateChecklist(item: ProjectDiaryItem, checklist: DiaryChecklistItem[]) {
    await updateItem(item.id, { checklist: normalizeDiaryChecklist(checklist, item.startDate), selectedDate }, false);
  }

  async function deleteItem(itemId: string) {
    setError(null);
    const response = await fetch(`/api/diary-items/${itemId}`, { method: "DELETE" });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      const msg = data.error ?? "Something did not sync. Try again.";
      setError(msg);
      toast({ message: msg, type: "error" });
      return;
    }

    setItems((current) => current.filter((item) => item.id !== itemId));
    setFocusedItemId((current) => (current === itemId ? null : current));
    setSelectedItem(null);
    toast({ message: "Diary item deleted.", type: "success" });
    broadcastChange();
  }

  return (
    <section data-diary-layout="reward-style" className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
      <div className="lofi-panel rounded-lg p-4">
        <div data-diary-hero-layout="single-row" className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-dusk-amber">
              <BookOpenCheck className="h-4 w-4" />
              Diary List
            </div>
            <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3">
              <h2 className="text-xl font-semibold leading-tight text-stone-100 sm:text-2xl">Today rhythm</h2>
              <p className="text-xs font-medium text-dusk-amber">{formatMediumDate(`${selectedDate}T00:00:00.000Z`)}</p>
            </div>
            <p className="mt-1 max-w-xl text-sm text-stone-400">
              Recurring checklists for the routines that matter today. Upcoming items stay calm and lower in priority.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 xl:ml-auto">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/project/${projectId}/calendar`}
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-stone-200 transition hover:border-dusk-lavender/50 hover:bg-white/[0.08]"
              >
                <CalendarDays className="h-4 w-4 text-dusk-lavender" />
                <span>View in Calendar</span>
              </Link>
              <DiaryMetric label="Due today" value={dueTodayCount} tone="lavender" />
              <DiaryMetric label="Done" value={completedTodayCount} tone="cyan" />
              <DiaryMetric label="Starred" value={itemsWithSummary.filter((item) => item.isStarred).length} tone="amber" />
            </div>
            <Button className="h-12 shrink-0" type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add diary
            </Button>
            <Image
              alt=""
              aria-hidden="true"
              className="pointer-events-none hidden h-16 w-16 shrink-0 object-contain drop-shadow-[0_10px_14px_rgba(8,8,23,0.5)] sm:block xl:h-20 xl:w-20"
              height={96}
              src="/stickers/retro/retro-sticker-02-diary-notebook.png"
              width={96}
            />
          </div>
        </div>
      </div>

      <div className="grid min-h-0 gap-3 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside data-diary-list-rail="pinned-lists" className="lofi-panel flex min-h-0 flex-col rounded-lg p-4">
          <div className="mb-3 flex flex-col gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-dusk-amber">Diary Shelf</p>
                <h3 className="mt-1 text-lg font-semibold text-stone-100">Rituals</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-stone-400">
                {visibleItems.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <FilterSelect
                value={filter}
                options={[
                  { value: "all", label: "All rituals" },
                  { value: "today", label: "Due today" },
                  { value: "upcoming", label: "Upcoming" },
                  { value: "starred", label: "Starred" },
                  { value: "hidden", label: "Hidden" }
                ]}
                onValueChange={setFilter}
              />

              <FilterSelect
                value={sortBy}
                options={[
                  { value: "due", label: "Sort: Due status" },
                  { value: "title", label: "Sort: Title" },
                  { value: "starred", label: "Sort: Starred" },
                  { value: "date", label: "Sort: Start date" }
                ]}
                onValueChange={setSortBy}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-soft">
            {visibleItems.length === 0 ? (
              <DiaryEmptyState label="No diary checklist item in this filter." />
            ) : filter === "all" ? (
              <div className="space-y-4">
                {visibleItems.filter((i) => i.isDueToday).length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Due Today</h4>
                    <div className="space-y-2">
                      {visibleItems
                        .filter((i) => i.isDueToday)
                        .map((item) => (
                          <DiaryListButton
                            key={item.id}
                            item={item}
                            selected={focusedItem?.id === item.id}
                            onClick={() => setFocusedItemId(item.id)}
                          />
                        ))}
                    </div>
                  </div>
                )}
                {visibleItems.filter((i) => !i.isDueToday).length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Upcoming</h4>
                    <div className="space-y-2">
                      {visibleItems
                        .filter((i) => !i.isDueToday)
                        .map((item) => (
                          <DiaryListButton
                            key={item.id}
                            item={item}
                            selected={focusedItem?.id === item.id}
                            onClick={() => setFocusedItemId(item.id)}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              visibleItems.map((item) => (
                <DiaryListButton
                  key={item.id}
                  item={item}
                  selected={focusedItem?.id === item.id}
                  onClick={() => setFocusedItemId(item.id)}
                />
              ))
            )}
          </div>
          <Button className="mt-3 w-full" type="button" variant="ghost" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create diary list
          </Button>
        </aside>

        <main data-diary-checklist-panel="today-checklist" className="lofi-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl p-0">
          {error ? <div className="p-4 pb-0"><p className="rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p></div> : null}
          {!allowMemberPrivateItems && !isOwner ? (
            <div className="p-4 pb-0">
              <div className="rounded-lg border border-dusk-amber/20 bg-dusk-amber/10 px-4 py-3 text-sm text-dusk-amber">
                This project does not allow members to hide their own diary items.
              </div>
            </div>
          ) : null}

          {focusedItem ? (
            <DiaryFocusCard
              item={focusedItem}
              selectedDate={selectedDate}
              onEdit={() => setSelectedItem(focusedItem)}
              onStar={() => updateItem(focusedItem.id, { isStarred: !focusedItem.isStarred })}
              onToggleHidden={() => updateItem(focusedItem.id, { isHidden: !focusedItem.isHidden })}
              onDelete={() => setIsDeleteConfirmOpen(true)}
              onChecklistChange={(checklist) => updateChecklist(focusedItem, checklist)}
            />
          ) : (
            <div className="grid min-h-0 flex-1 place-items-center p-8 text-center">
              <div>
                <Image
                  alt=""
                  aria-hidden="true"
                  className="mx-auto h-16 w-16 object-contain opacity-80"
                  height={80}
                  src="/stickers/retro/retro-sticker-15-cloud.png"
                  width={80}
                />
                <h3 className="mt-3 text-lg font-semibold text-stone-100">A quiet diary shelf</h3>
                <p className="mt-1 text-sm text-stone-500">Create or loosen the filter to see a diary checklist here.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {isCreateOpen ? (
        <DiaryItemModal
          allowMemberPrivateItems={allowMemberPrivateItems}
          selectedDate={selectedDate}
          title="Add diary"
          onClose={() => setIsCreateOpen(false)}
          onSubmit={createItem}
        />
      ) : null}
      {selectedItem ? (
        <DiaryItemModal
          allowMemberPrivateItems={allowMemberPrivateItems}
          item={selectedItem}
          selectedDate={selectedDate}
          title="Edit diary"
          onClose={() => setSelectedItem(null)}
          onDelete={() => setIsDeleteConfirmOpen(true)}
          onSubmit={async (payload) => {
            const didSave = await updateItem(selectedItem.id, payload);
            if (didSave) setSelectedItem(null);
          }}
        />
      ) : null}

      <ConfirmModal
        open={isDeleteConfirmOpen}
        title="Delete diary ritual"
        message={`Are you sure you want to delete "${(selectedItem || focusedItem)?.title ?? "this ritual"}"? This action cannot be undone.`}
        confirmLabel="Delete ritual"
        variant="danger"
        onConfirm={async () => {
          const target = selectedItem || focusedItem;
          if (target) {
            await deleteItem(target.id);
            setIsDeleteConfirmOpen(false);
          }
        }}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />
    </section>
  );
}

function DiaryMetric({
  label,
  tone,
  value
}: {
  label: string;
  tone: "amber" | "cyan" | "lavender";
  value: number;
}) {
  return (
    <div
      className={cn(
        "min-w-24 rounded-lg border bg-ink-950/55 px-3 py-2",
        tone === "amber" && "border-dusk-amber/25",
        tone === "cyan" && "border-dusk-cyan/25",
        tone === "lavender" && "border-dusk-lavender/25"
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold",
          tone === "amber" && "text-dusk-amber",
          tone === "cyan" && "text-dusk-cyan",
          tone === "lavender" && "text-dusk-lavender"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function getDiaryStatusColor(item: DiaryItemWithSummary) {
  if (!item.isDueToday) {
    return "default";
  }

  const isCompleted = item.checklistSummary.dueCount > 0 && item.checklistSummary.completedCount === item.checklistSummary.dueCount;
  if (isCompleted) {
    return "completed";
  }

  if (item.dueTime) {
    const now = new Date();
    const [hours, minutes] = item.dueTime.split(":").map(Number);
    const dueDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    if (now > dueDateTime) {
      return "overdue";
    }

    const diffMs = dueDateTime.getTime() - now.getTime();
    if (diffMs > 0 && diffMs <= 60 * 60 * 1000) {
      return "close";
    }
  }

  return "due";
}

function DiaryListButton({
  item,
  onClick,
  selected
}: {
  item: DiaryItemWithSummary;
  onClick: () => void;
  selected: boolean;
}) {
  const status = getDiaryStatusColor(item);
  let borderClass = "";
  if (status === "completed") {
    borderClass = selected ? "border-emerald-500 bg-emerald-500/10" : "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50";
  } else if (status === "overdue") {
    borderClass = selected ? "border-red-500 bg-red-500/10" : "border-red-500/30 bg-red-500/5 hover:border-red-500/50";
  } else if (status === "close") {
    borderClass = selected ? "border-amber-500 bg-amber-500/10 animate-pulse" : "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50";
  } else {
    borderClass = selected
      ? "border-dusk-lavender/55 bg-dusk-lavender/12"
      : "border-white/10 bg-white/[0.035] hover:border-dusk-lavender/35 hover:bg-white/[0.055]";
  }

  return (
    <button
      className={cn(
        "w-full rounded-lg border p-3 text-left transition",
        borderClass,
        !item.isDueToday && "opacity-65"
      )}
      type="button"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-stone-100">{item.title}</p>
          <p className="mt-1 text-xs text-stone-500">{getDiarySummaryLabel(item)}</p>
        </div>
        {item.isStarred ? <Star className="h-4 w-4 shrink-0 fill-dusk-amber text-dusk-amber" /> : null}
      </div>
    </button>
  );
}

function getDiaryLofiSticker(color: CardColor) {
  switch (color) {
    case "AMBER":
      return {
        src: "/stickers/retro/retro-sticker-01-coin-reward.png",
        quote: "Celebrate the small wins. Each step brings you closer to your rhythm."
      };
    case "CYAN":
      return {
        src: "/stickers/retro/retro-sticker-15-cloud.png",
        quote: "Flow with the day. Breathe, focus, and take one step at a time."
      };
    case "ROSE":
      return {
        src: "/stickers/retro/retro-sticker-19-heart.png",
        quote: "Be kind to yourself. Consistency gently beats perfection."
      };
    case "EMERALD":
      return {
        src: "/stickers/retro/retro-sticker-44-leaf-sprout.png",
        quote: "Growth is quietly happening, step by step."
      };
    case "LAVENDER":
    default:
      return {
        src: "/stickers/retro/retro-sticker-02-diary-notebook.png",
        quote: "Quiet progress is still progress. Cherish the journey."
      };
  }
}

function DiaryFocusCard({
  item,
  onChecklistChange,
  onEdit,
  onStar,
  onToggleHidden,
  onDelete,
  selectedDate
}: {
  item: DiaryItemWithSummary;
  onChecklistChange: (checklist: DiaryChecklistItem[]) => void;
  onEdit: () => void;
  onStar: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
  selectedDate: string;
}) {
  const { toast } = useToast();
  const [newStepLabel, setNewStepLabel] = useState("");
  const colorMeta = getCardColorMeta(item.color);
  const lofiSticker = getDiaryLofiSticker(item.color);

  const normalizedChecklist = useMemo(
    () => normalizeDiaryChecklist(item.checklist, selectedDate),
    [item.checklist, selectedDate]
  );

  const sortedChecklist = useMemo(() => {
    return [...normalizedChecklist].sort((a, b) => {
      const aDue = isDiaryChecklistItemDueOnDate(a, selectedDate);
      const bDue = isDiaryChecklistItemDueOnDate(b, selectedDate);
      if (aDue !== bDue) return aDue ? -1 : 1;

      const aComp = isDiaryChecklistItemCompletedOnDate(a, selectedDate);
      const bComp = isDiaryChecklistItemCompletedOnDate(b, selectedDate);
      if (aComp !== bComp) return aComp ? 1 : -1;

      return a.label.localeCompare(b.label);
    });
  }, [normalizedChecklist, selectedDate]);

  const dueItems = useMemo(
    () => sortedChecklist.filter((chk) => isDiaryChecklistItemDueOnDate(chk, selectedDate)),
    [sortedChecklist, selectedDate]
  );
  const completedDueCount = useMemo(
    () => dueItems.filter((chk) => isDiaryChecklistItemCompletedOnDate(chk, selectedDate)).length,
    [dueItems, selectedDate]
  );
  const progressPercent = dueItems.length > 0 ? Math.round((completedDueCount / dueItems.length) * 100) : 0;
  const isAllDueCompleted = dueItems.length > 0 && completedDueCount === dueItems.length;

  const hasReward = item.rewardCoins > 0;
  const rewardClaimed = hasDiaryRewardBeenClaimed(item.rewardClaimedDates, selectedDate);
  const rewardReady = hasReward && isAllDueCompleted && !rewardClaimed;

  const handleToggleChecklist = (checklistItemId: string, currentCompleted: boolean) => {
    const nextList = toggleDiaryChecklistCompletion(
      normalizedChecklist,
      checklistItemId,
      selectedDate,
      !currentCompleted
    );
    onChecklistChange(nextList);
  };

  const handleAddStep = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const label = newStepLabel.trim();
    if (!label) return;

    const newStep: DiaryChecklistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label,
      description: "",
      intervalDays: 1,
      startDate: selectedDate,
      dueTime: null,
      completedDates: []
    };

    const nextList = [...normalizedChecklist, newStep];
    onChecklistChange(nextList);
    setNewStepLabel("");
    toast({ message: `Added step: "${label}"`, type: "success" });
  };

  const handleDeleteStep = (stepId: string, stepLabel: string) => {
    const nextList = normalizedChecklist.filter((s) => s.id !== stepId);
    onChecklistChange(nextList);
    toast({ message: `Removed step: "${stepLabel}"`, type: "success" });
  };

  return (
    <article className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* Header Banner - Compact & Low-Profile */}
      <div className={cn("border-b border-white/10 bg-white/[0.015] px-4 py-3 sm:px-5 sm:py-3.5", colorMeta.softClass)}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("h-3 w-3 shrink-0 rounded-full border", colorMeta.swatchClass)} />
              <h2 className="truncate text-base sm:text-lg font-bold tracking-tight text-stone-100">
                {item.title}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <DiaryStatusBadges item={item} />
                {hasReward ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold select-none shadow-sm",
                      rewardClaimed
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : rewardReady
                          ? "border-dusk-amber/40 bg-dusk-amber/20 text-dusk-amber animate-pulse"
                          : "border-dusk-amber/25 bg-dusk-amber/10 text-dusk-amber"
                    )}
                    title={rewardClaimed ? "Reward claimed today" : `Reward: +${item.rewardCoins} coins upon 100% completion`}
                  >
                    <Coins className="h-3.5 w-3.5" />
                    +{item.rewardCoins} {item.rewardCoinType === "GLOBAL" ? "Global" : "Project"} Coins
                  </span>
                ) : null}
              </div>
            </div>

            {/* Description & metadata row */}
            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-stone-400">
              {item.description ? (
                <p className="max-w-xl truncate text-xs italic text-stone-300/80">
                  &ldquo;{item.description}&rdquo;
                </p>
              ) : null}
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                {item.description ? <span>•</span> : null}
                <span>Created by {item.author.name ?? item.author.email}</span>
                <span>•</span>
                <span>Started {formatMediumDate(item.startDate)}</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              aria-label={item.isStarred ? "Unstar diary checklist" : "Star diary checklist"}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-400 transition hover:border-dusk-amber/45 hover:text-dusk-amber active:scale-95",
                item.isStarred && "border-dusk-amber/35 bg-dusk-amber/10 text-dusk-amber"
              )}
              disabled={!item.canManage}
              title={item.isStarred ? "Unstar ritual" : "Star ritual"}
              type="button"
              onClick={onStar}
            >
              <Star className={cn("h-3.5 w-3.5", item.isStarred && "fill-dusk-amber")} />
            </button>

            {item.canManage ? (
              <>
                <button
                  aria-label="Edit diary checklist"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-400 transition hover:border-dusk-lavender/45 hover:text-dusk-lavender active:scale-95"
                  title="Edit ritual"
                  type="button"
                  onClick={onEdit}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  aria-label="Delete diary checklist"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-400 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 active:scale-95"
                  title="Delete ritual"
                  type="button"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* 2-Column Ritual Studio Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5 scrollbar-soft lg:p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Left Column (Desktop): Checklist Studio */}
          <div className="order-1 flex min-h-0 flex-col gap-4 rounded-2xl border border-white/10 bg-ink-950/40 p-4 sm:p-5 xl:order-1">
            {/* Checklist Header & Progress */}
            <div className="border-b border-white/8 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg border border-dusk-cyan/25 bg-dusk-cyan/10 text-dusk-cyan">
                    <CheckSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-200">Ritual Checklist</h3>
                    <p className="text-[11px] text-stone-400">Step-by-step routine for this ritual</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {dueItems.length > 0 ? (
                    <span className="rounded-full border border-dusk-cyan/25 bg-dusk-cyan/10 px-2.5 py-0.5 text-xs font-medium text-dusk-cyan">
                      {completedDueCount}/{dueItems.length} completed ({progressPercent}%)
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-stone-400">
                      {sortedChecklist.length} steps
                    </span>
                  )}
                </div>
              </div>

              {dueItems.length > 0 ? (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-dusk-cyan via-dusk-lavender to-emerald-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              ) : null}

              {/* Progress Coin Reward Callout */}
              {hasReward ? (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-dusk-amber/20 bg-dusk-amber/[0.06] px-3 py-1.5 text-xs text-dusk-amber">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Coins className="h-3.5 w-3.5" />
                    {rewardClaimed
                      ? "รับเหรียญรางวัลประจำวันเรียบร้อยแล้ว!"
                      : rewardReady
                        ? "ทำครบทุกข้อแล้ว! พร้อมรับเหรียญรางวัล"
                        : `ทำครบทุกข้อวันนี้เพื่อรับ +${item.rewardCoins} Coins`}
                  </span>
                  <span className="font-mono text-[11px] opacity-80">
                    {completedDueCount}/{dueItems.length}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Checklist Items List */}
            <div className="space-y-2.5">
              {sortedChecklist.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
                  <p className="text-sm text-stone-400">No steps in this checklist yet.</p>
                  <p className="mt-1 text-xs text-stone-500">Break down this ritual by adding subtasks below.</p>
                </div>
              ) : (
                sortedChecklist.map((chk) => {
                  const isDue = isDiaryChecklistItemDueOnDate(chk, selectedDate);
                  const isCompleted = isDiaryChecklistItemCompletedOnDate(chk, selectedDate);

                  return (
                    <div
                      key={chk.id}
                      className={cn(
                        "group flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-3 transition hover:border-dusk-lavender/30 hover:bg-white/[0.045]",
                        isDue && "border-dusk-lavender/20 bg-dusk-lavender/[0.04]",
                        isCompleted && "opacity-60",
                        !isDue && "opacity-45"
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <button
                          aria-label={isCompleted ? "Mark step incomplete" : "Mark step complete"}
                          className={cn(
                            "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border transition",
                            isCompleted
                              ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300"
                              : "border-white/20 bg-ink-950/60 text-stone-400 group-hover:border-dusk-cyan/50 group-hover:text-dusk-cyan",
                            (!item.canManage || !isDue) && "cursor-default opacity-70"
                          )}
                          disabled={!item.canManage || !isDue}
                          type="button"
                          onClick={() => handleToggleChecklist(chk.id, isCompleted)}
                        >
                          {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-sm font-medium text-stone-100 break-words",
                              isCompleted && "line-through text-stone-400/80"
                            )}
                          >
                            {chk.label}
                          </span>
                          {chk.description ? (
                            <p className="mt-0.5 text-xs text-stone-400 line-clamp-2">{chk.description}</p>
                          ) : null}
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-stone-400">
                            <span className="inline-flex items-center gap-1 rounded bg-white/[0.05] px-1.5 py-0.5">
                              <Repeat className="h-2.5 w-2.5" />
                              Every {chk.intervalDays}d
                            </span>
                            {chk.startDate ? (
                              <span className="inline-flex items-center gap-1 rounded bg-white/[0.05] px-1.5 py-0.5" title={`Start date: ${chk.startDate}`}>
                                <Calendar className="h-2.5 w-2.5" />
                                Starts {chk.startDate}
                              </span>
                            ) : null}
                            {chk.dueTime ? (
                              <span className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono">{chk.dueTime}</span>
                            ) : null}
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5",
                                isDue ? "bg-dusk-cyan/15 text-dusk-cyan" : "bg-white/[0.05] text-stone-500"
                              )}
                            >
                              {isDue ? "Due today" : "Upcoming"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {item.canManage ? (
                        <button
                          aria-label={`Remove step ${chk.label}`}
                          className="opacity-0 group-hover:opacity-100 grid h-6 w-6 shrink-0 place-items-center rounded text-stone-500 transition hover:bg-red-400/10 hover:text-red-300"
                          title="Remove step"
                          type="button"
                          onClick={() => handleDeleteStep(chk.id, chk.label)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Add Inline Step */}
            {item.canManage ? (
              <form className="mt-2 flex items-center gap-2 border-t border-white/8 pt-3" onSubmit={handleAddStep}>
                <div className="relative flex-1">
                  <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <Input
                    className="h-10 pl-9 pr-3 text-sm bg-ink-950/60 border-white/10 placeholder:text-stone-500"
                    placeholder="Add a step to this ritual... (Press Enter)"
                    value={newStepLabel}
                    onChange={(e) => setNewStepLabel(e.target.value)}
                  />
                </div>
                <Button
                  className="h-10 shrink-0 px-4 text-xs font-semibold"
                  disabled={!newStepLabel.trim()}
                  type="submit"
                  variant="secondary"
                >
                  Add Step
                </Button>
              </form>
            ) : null}
          </div>

          {/* Right Column (Desktop): Insights, Coins & Metadata Shelf */}
          <div className="order-2 flex flex-col gap-4 xl:order-2">
            {/* Reward Card */}
            <div className="rounded-2xl border border-dusk-amber/30 bg-ink-950/50 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-dusk-amber">
                  <Coins className="h-4 w-4" />
                  <span>Milestone Reward</span>
                </div>
                {hasReward ? (
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      rewardClaimed
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : rewardReady
                          ? "border-dusk-amber/35 bg-dusk-amber/15 text-dusk-amber animate-pulse"
                          : "border-white/10 bg-white/5 text-stone-400"
                    )}
                  >
                    {rewardClaimed ? "Claimed ✓" : rewardReady ? "Ready to Claim!" : "In Progress"}
                  </span>
                ) : null}
              </div>

              {hasReward ? (
                <div className="mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-2xl font-bold text-dusk-amber">+{item.rewardCoins}</span>
                    <span className="text-xs text-stone-400">
                      {item.rewardCoinType === "GLOBAL" ? "Global Coins" : "Project Coins"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-400">
                    {rewardClaimed
                      ? "Reward claimed for today's routine!"
                      : "Automatically rewarded once 100% of today's checklist is complete."}
                  </p>
                </div>
              ) : (
                <div className="mt-2 text-xs text-stone-400">
                  <p>No coin reward configured for this ritual.</p>
                  {item.canManage ? (
                    <button
                      className="mt-2 text-[11px] font-medium text-dusk-amber underline underline-offset-2 hover:text-amber-300"
                      type="button"
                      onClick={onEdit}
                    >
                      Configure coin reward
                    </button>
                  ) : null}
                </div>
              )}
            </div>

            {/* Schedule & Rhythm Card */}
            <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-dusk-lavender">
                <Clock className="h-4 w-4" />
                <span>Schedule & Rhythm</span>
              </div>
              <div className="mt-3 space-y-2.5 text-xs text-stone-300">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-stone-400">Frequency</span>
                  <span className="font-medium text-stone-200">
                    Every {item.intervalDays} day{item.intervalDays > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-stone-400">Target Time</span>
                  <span className="font-mono text-stone-200">{item.dueTime ?? "Anytime"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-stone-400">Started Date</span>
                  <span className="text-stone-200">{formatMediumDate(item.startDate)}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-stone-400">Today&apos;s Status</span>
                  <span className={cn("font-medium", item.isDueToday ? "text-dusk-cyan" : "text-stone-400")}>
                    {item.isDueToday ? "Scheduled today" : "Rest / Off-cycle"}
                  </span>
                </div>
              </div>
            </div>

            {/* Visibility & Privacy Card */}
            <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-dusk-cyan">
                <Shield className="h-4 w-4" />
                <span>Member Visibility</span>
              </div>
              <div className="mt-2 text-xs text-stone-400">
                {item.isHidden ? (
                  <p className="flex items-center gap-1.5 text-dusk-rose">
                    <EyeOff className="h-3.5 w-3.5" />
                    Hidden from other project members
                  </p>
                ) : (
                  <p className="text-stone-300">Visible to all workspace members on this diary shelf.</p>
                )}
              </div>
              {item.canToggleHidden ? (
                <Button
                  className="mt-3 w-full text-xs"
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={onToggleHidden}
                >
                  {item.isHidden ? <Eye className="mr-1.5 h-3.5 w-3.5" /> : <EyeOff className="mr-1.5 h-3.5 w-3.5" />}
                  {item.isHidden ? "Make Visible to Workspace" : "Hide from Workspace"}
                </Button>
              ) : null}
            </div>

            {/* Retro Lofi Sticker & Mindful Note */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-4">
              <Image
                alt=""
                aria-hidden="true"
                className="h-12 w-12 shrink-0 object-contain drop-shadow-md"
                height={48}
                src={lofiSticker.src}
                width={48}
              />
              <p className="text-xs leading-relaxed italic text-stone-400">
                &ldquo;{lofiSticker.quote}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}



function DiaryStatusBadges({ item }: { item: DiaryItemWithSummary }) {
  return (
    <>
      {!item.isDueToday ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-stone-400">
          Not due today
        </span>
      ) : null}
      {item.isHidden ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-rose/25 bg-dusk-rose/10 px-2 py-0.5 text-[10px] text-dusk-rose">
          <EyeOff className="h-2.5 w-2.5" />
          Hidden
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1 rounded-full border border-dusk-cyan/25 bg-dusk-cyan/10 px-2 py-0.5 text-[10px] text-dusk-cyan">
        <Repeat className="h-2.5 w-2.5" />
        {getDiarySummaryLabel(item)}
      </span>
      {item.dueTime ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/25 bg-dusk-amber/10 px-2 py-0.5 font-mono text-[10px] text-dusk-amber">
          <Clock className="h-2.5 w-2.5" />
          {item.dueTime}
        </span>
      ) : null}
    </>
  );
}

function DiaryEmptyState({ label }: { label: string }) {
  return (
    <EmptyState
      className="border-dashed bg-ink-950/25 p-5"
      title="No diary items"
      message={label}
    />
  );
}

function getDiarySummaryLabel(item: DiaryItemWithSummary) {
  if (item.checklistSummary.hasChecklist) {
    return item.checklistSummary.isDue
      ? `Due ${item.checklistSummary.completedCount}/${item.checklistSummary.dueCount} today`
      : `Checklist ${item.checklistSummary.totalCount}`;
  }

  return `Every ${item.intervalDays} day${item.intervalDays > 1 ? "s" : ""}`;
}

function DiaryItemModal({
  allowMemberPrivateItems,
  item,
  title,
  onClose,
  onDelete,
  selectedDate,
  onSubmit
}: {
  allowMemberPrivateItems: boolean;
  item?: ProjectDiaryItem;
  selectedDate: string;
  title: string;
  onClose: () => void;
  onDelete?: () => void;
  onSubmit: (payload: DiaryPayload) => void;
}) {
  const [color, setColor] = useState<CardColor>(normalizeCardColor(item?.color));
  const [isHidden, setIsHidden] = useState(item?.isHidden ?? false);
  const [intervalDays, setIntervalDays] = useState(item?.intervalDays ?? 1);
  const [startDate, setStartDate] = useState(item?.startDate.slice(0, 10) ?? selectedDate);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isRewardOpen, setIsRewardOpen] = useState((item?.rewardCoins ?? 0) > 0);
  const [rewardCoins, setRewardCoins] = useState(item?.rewardCoins ?? 0);
  const [rewardCoinType, setRewardCoinType] = useState<DiaryRewardCoinType>(item?.rewardCoinType ?? "PROJECT");
  const [checklist, setChecklist] = useState<DiaryChecklistItem[]>(
    normalizeDiaryChecklist(item?.checklist, item?.startDate ?? selectedDate)
  );
  const [titleVal, setTitleVal] = useState(item?.title ?? "");
  const [descriptionVal, setDescriptionVal] = useState(item?.description ?? "");
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const hasChanges = useMemo(() => {
    const isNew = !item;
    if (isNew) {
      return (
        titleVal.trim() !== "" ||
        descriptionVal.trim() !== "" ||
        isHidden ||
        intervalDays !== 1 ||
        startDate !== selectedDate ||
        rewardCoins > 0 ||
        checklist.length > 0
      );
    }

    const initialTitle = item.title ?? "";
    const initialDesc = item.description ?? "";
    const initialColor = normalizeCardColor(item.color);
    const initialHidden = item.isHidden ?? false;
    const initialInterval = item.intervalDays ?? 1;
    const initialStart = item.startDate.slice(0, 10);
    const initialReward = item.rewardCoins ?? 0;
    const initialRewardType = item.rewardCoinType ?? "PROJECT";

    const checklistChanged =
      checklist.length !== (item.checklist?.length ?? 0) ||
      checklist.some((checklistItem, idx) => {
        const initialItem = item.checklist?.[idx];
        return (
          !initialItem ||
          checklistItem.label !== initialItem.label ||
          checklistItem.intervalDays !== initialItem.intervalDays ||
          checklistItem.startDate.slice(0, 10) !== initialItem.startDate.slice(0, 10)
        );
      });

    return (
      titleVal !== initialTitle ||
      descriptionVal !== initialDesc ||
      color !== initialColor ||
      isHidden !== initialHidden ||
      intervalDays !== initialInterval ||
      startDate !== initialStart ||
      rewardCoins !== initialReward ||
      rewardCoinType !== initialRewardType ||
      checklistChanged
    );
  }, [
    item,
    titleVal,
    descriptionVal,
    color,
    isHidden,
    intervalDays,
    startDate,
    selectedDate,
    rewardCoins,
    rewardCoinType,
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      title: titleVal,
      description: descriptionVal,
      color,
      intervalDays,
      startDate,
      checklist: normalizeDiaryChecklist(checklist, startDate),
      rewardCoins: isRewardOpen ? rewardCoins : 0,
      rewardCoinType,
      rewardClaimedDates: item?.rewardClaimedDates ?? [],
      isStarred: item?.isStarred ?? false,
      isHidden,
      dueTime: null
    });
  }

  return (
    <AppModal
      open
      onClose={handleCloseRequest}
      labelledBy="diary-item-modal-title"
      contentClassName="max-w-5xl"
    >
        <form className="lofi-panel flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-lg p-5" onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Recurring Diary</p>
              <h2 id="diary-item-modal-title" className="mt-1 text-2xl font-semibold">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              {isRewardOpen && rewardCoins > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/35 bg-dusk-amber/15 px-2.5 py-1 text-xs font-semibold text-dusk-amber">
                  <Coins className="h-3.5 w-3.5" />
                  +{rewardCoins} {rewardCoinType === "GLOBAL" ? "Global" : "Project"} Coins
                </span>
              ) : null}
              <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={handleCloseRequest}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 2-Column Layout: Left = Details, Settings & Coins | Right = Checklist Studio */}
          <div className="grid min-h-0 flex-1 gap-6 overflow-hidden lg:grid-cols-[380px_minmax(0,1fr)]">
            {/* Left Column: Details, Settings & Coins Reward */}
            <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1 scrollbar-soft">
              {/* Details Card */}
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-dusk-lavender font-semibold">Details</p>
                <label className="block space-y-1 text-xs text-stone-400">
                  <span className="text-stone-300 font-medium">Diary title</span>
                  <Input name="title" value={titleVal} onChange={(e) => setTitleVal(e.target.value)} placeholder="Diary title" required />
                </label>
                <label className="block space-y-1 text-xs text-stone-400">
                  <span className="text-stone-300 font-medium">Description</span>
                  <Textarea className="min-h-24 resize-none" name="description" value={descriptionVal} onChange={(e) => setDescriptionVal(e.target.value)} placeholder="What should repeat?" />
                </label>
                <ColorPicker selectedColor={color} onChange={setColor} />
              </div>

              {/* Schedule & Settings Card */}
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-dusk-cyan font-semibold">Schedule & Settings</p>
                <label className="block space-y-1 text-xs text-stone-400">
                  <span className="text-stone-300 font-medium">Start date (วันเริ่มต้นหลัก)</span>
                  <Input name="startDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
                </label>
                <label
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-xs text-stone-300",
                    !allowMemberPrivateItems && "opacity-60"
                  )}
                >
                  <span>Hide from other members</span>
                  <input
                    checked={isHidden}
                    className="h-4 w-4 accent-dusk-lavender"
                    disabled={!allowMemberPrivateItems && !item?.canToggleHidden}
                    type="checkbox"
                    onChange={(event) => setIsHidden(event.target.checked)}
                  />
                </label>
              </div>

              {/* Coins Placement: Milestone Reward Card */}
              <div className="space-y-3 rounded-xl border border-dusk-amber/30 bg-dusk-amber/[0.045] p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-dusk-amber font-semibold">
                    <Coins className="h-4 w-4" />
                    <span>Milestone Reward</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isRewardOpen) {
                        setIsRewardOpen(false);
                      } else {
                        setIsRewardOpen(true);
                        if (rewardCoins === 0) setRewardCoins(10);
                      }
                    }}
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition",
                      isRewardOpen
                        ? "border-dusk-amber/40 bg-dusk-amber/20 text-dusk-amber"
                        : "border-white/10 bg-white/5 text-stone-400 hover:text-stone-200"
                    )}
                  >
                    {isRewardOpen ? "Enabled ✓" : "Off"}
                  </button>
                </div>

                {isRewardOpen ? (
                  <div className="space-y-3 pt-1">
                    <label className="block space-y-1 text-xs text-stone-400">
                      <span className="text-stone-300 font-medium">Coins to award (จำนวนเหรียญที่จะมอบให้)</span>
                      <Input
                        max={100000}
                        min={0}
                        type="number"
                        value={rewardCoins}
                        onChange={(event) => setRewardCoins(Math.max(0, Number(event.target.value) || 0))}
                      />
                      <span className="text-[11px] text-stone-500">Awarded when 100% of today&apos;s checklist is complete.</span>
                    </label>

                    <div className="space-y-1.5 text-xs text-stone-400">
                      <span className="text-stone-300 font-medium">Coin type (ประเภทเหรียญ)</span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "PROJECT" as const, label: "Project coins" },
                          { value: "GLOBAL" as const, label: "Global coins" }
                        ].map((option) => (
                          <button
                            key={option.value}
                            className={cn(
                              "flex h-9 items-center justify-between rounded-lg border px-3 text-left text-xs transition",
                              rewardCoinType === option.value
                                ? "border-dusk-amber/45 bg-dusk-amber/15 text-dusk-amber font-semibold"
                                : "border-white/10 bg-white/[0.035] text-stone-400 hover:border-dusk-amber/35"
                            )}
                            type="button"
                            onClick={() => setRewardCoinType(option.value)}
                          >
                            <span>{option.label}</span>
                            {rewardCoinType === option.value ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500">
                    ตั้งค่าให้เหรียญรางวัลเมื่อทำ routine ครบทุกข้อในแต่ละวัน
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Checklist Studio */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <DiaryChecklistEditor
                defaultRepeatDays={intervalDays}
                defaultStartDate={startDate}
                onDefaultRepeatDaysChange={setIntervalDays}
                value={checklist}
                onChange={setChecklist}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
            {onDelete ? (
              <Button type="button" variant="danger" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={handleCloseRequest}>
              Cancel
            </Button>
            <Button>
              <Save className="h-4 w-4" />
              Save diary
            </Button>
          </div>
        </form>
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
    </AppModal>
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
      label="Diary color"
      value={selectedColor}
      onChange={onChange}
    />
  );
}

function normalizeDiaryItem(item: ProjectDiaryItem): ProjectDiaryItem {
  return {
    ...item,
    color: normalizeCardColor(item.color),
    startDate: new Date(item.startDate).toISOString(),
    createdAt: new Date(item.createdAt).toISOString(),
    updatedAt: new Date(item.updatedAt).toISOString(),
    checklist: normalizeDiaryChecklist(item.checklist, item.startDate),
    rewardCoins: item.rewardCoins ?? 0,
    rewardCoinType: item.projectId ? item.rewardCoinType ?? "PROJECT" : "GLOBAL",
    rewardClaimedDates: Array.isArray(item.rewardClaimedDates) ? item.rewardClaimedDates : [],
    isStarred: item.isStarred ?? false,
    canManage: item.canManage ?? false,
    canToggleHidden: item.canToggleHidden ?? false
  };
}
