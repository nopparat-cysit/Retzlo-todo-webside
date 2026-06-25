"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import {
  BookOpenCheck,
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
  Star,
  Trash2,
  X
} from "lucide-react";

import { DiaryChecklistEditor, DiaryChecklistPreview } from "@/components/diary/diary-checklist";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ModalPortal } from "@/components/ui/modal-portal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import {
  getDiaryChecklistSummary,
  normalizeDiaryChecklist,
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [pendingUpdatePayload, setPendingUpdatePayload] = useState<any>(null);

  const itemsWithSummary = useMemo<DiaryItemWithSummary[]>(() => {
    return [...items]
      .map((item) => {
        const checklistSummary = getDiaryChecklistSummary(item, selectedDate);

        return {
          ...item,
          checklistSummary,
          isDueToday: checklistSummary.isDue
        };
      })
      .sort((a, b) => {
        if (a.isDueToday !== b.isDueToday) return a.isDueToday ? -1 : 1;
        if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
  }, [items, selectedDate]);

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
  const queueItems = itemsWithSummary.filter((item) => !item.isDueToday).slice(0, 5);

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

  async function createItem(payload: DiaryPayload) {
    const item = await saveItem(`/api/projects/${projectId}/diary-items`, "POST", payload);

    if (!item) return;

    setItems((current) => [item, ...current]);
    setFocusedItemId(item.id);
    setSelectedItem(item);
    setIsCreateOpen(false);
    toast({ message: "Diary item created.", type: "success" });
  }

  async function updateItem(itemId: string, payload: Partial<DiaryPayload>, showToast = true) {
    const item = await saveItem(`/api/diary-items/${itemId}`, "PATCH", payload);

    if (!item) return false;

    setItems((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
    setSelectedItem((current) => (current?.id === item.id ? item : current));
    if (showToast) {
      toast({ message: "Diary item updated.", type: "success" });
    }
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
  }

  return (
    <section data-diary-layout="reward-style" className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-3">
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

      <div data-diary-filter-toolbar="open-air" className="flex flex-wrap items-center gap-2 px-1">
        {(["all", "today", "upcoming", "starred", "hidden"] as const).map((value) => (
          <button
            key={value}
            className={cn(
              "h-9 rounded-md border px-3 text-xs font-medium capitalize shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition",
              filter === value
                ? "border-dusk-lavender bg-dusk-lavender text-ink-950"
                : "border-white/10 bg-ink-950/35 text-stone-300 hover:border-dusk-lavender/55 hover:bg-white/[0.055]"
            )}
            type="button"
            onClick={() => setFilter(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 gap-3 xl:grid-cols-[20rem_minmax(0,1fr)_20rem]">
        <aside data-diary-list-rail="pinned-lists" className="lofi-panel flex min-h-0 flex-col rounded-lg p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-dusk-amber">Pinned lists</p>
              <h3 className="mt-1 text-lg font-semibold text-stone-100">Pick your ritual</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-stone-400">{visibleItems.length}</span>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-soft">
            {visibleItems.length === 0 ? (
              <DiaryEmptyState label="No diary checklist item in this filter." />
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

        <main data-diary-checklist-panel="today-checklist" className="lofi-panel flex min-h-0 flex-col rounded-lg p-4">
          {error ? <p className="mb-3 rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}
          {!allowMemberPrivateItems && !isOwner ? (
            <div className="mb-3 rounded-lg border border-dusk-amber/20 bg-dusk-amber/10 px-4 py-3 text-sm text-dusk-amber">
              This project does not allow members to hide their own diary items.
            </div>
          ) : null}

          {focusedItem ? (
            <DiaryFocusCard
              item={focusedItem}
              selectedDate={selectedDate}
              onEdit={() => setSelectedItem(focusedItem)}
              onStar={() => updateItem(focusedItem.id, { isStarred: !focusedItem.isStarred })}
              onToggleHidden={() => updateItem(focusedItem.id, { isHidden: !focusedItem.isHidden })}
              onChecklistChange={(checklist) => updateChecklist(focusedItem, checklist)}
            />
          ) : (
            <div className="grid min-h-0 flex-1 place-items-center rounded-lg border border-dashed border-white/12 bg-ink-950/25 p-8 text-center">
              <div>
                <Image
                  alt=""
                  aria-hidden="true"
                  className="mx-auto h-16 w-16 object-contain"
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

        <aside data-diary-queue="next-moments" className="lofi-panel flex min-h-0 flex-col rounded-lg p-4">
          <div className="mb-3 flex items-start justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-dusk-amber">Ritual queue</p>
              <h3 className="mt-1 text-lg font-semibold text-stone-100">Next moments</h3>
            </div>
            <Image
              alt=""
              aria-hidden="true"
              className="h-12 w-12 object-contain"
              height={56}
              src="/stickers/retro/retro-sticker-25-mascot-blob.png"
              width={56}
            />
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-soft">
            {queueItems.length > 0 ? (
              queueItems.map((item) => (
                <DiaryQueueItem key={item.id} item={item} onClick={() => setFocusedItemId(item.id)} />
              ))
            ) : (
              <DiaryEmptyState label="Nothing waiting in the queue." />
            )}
          </div>
          <div className="mt-3 rounded-lg border border-white/10 bg-ink-950/35 p-3">
            <p className="text-sm font-medium text-stone-200">Pinned bottom-right</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              Starred diary lists can stay visible from the floating quick hub.
            </p>
          </div>
        </aside>
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
          onDelete={() => deleteItem(selectedItem.id)}
          onSubmit={async (payload) => {
            const didSave = await updateItem(selectedItem.id, payload);
            if (didSave) setSelectedItem(null);
          }}
        />
      ) : null}
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

function DiaryListButton({
  item,
  onClick,
  selected
}: {
  item: DiaryItemWithSummary;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      className={cn(
        "w-full rounded-lg border p-3 text-left transition",
        selected
          ? "border-dusk-lavender/55 bg-dusk-lavender/12"
          : "border-white/10 bg-white/[0.035] hover:border-dusk-lavender/35 hover:bg-white/[0.055]",
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

function DiaryFocusCard({
  item,
  onChecklistChange,
  onEdit,
  onStar,
  onToggleHidden,
  selectedDate
}: {
  item: DiaryItemWithSummary;
  onChecklistChange: (checklist: DiaryChecklistItem[]) => void;
  onEdit: () => void;
  onStar: () => void;
  onToggleHidden: () => void;
  selectedDate: string;
}) {
  const colorMeta = getCardColorMeta(item.color);

  return (
    <article className={cn("flex min-h-0 flex-1 flex-col rounded-lg border p-4", colorMeta.softClass)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <DiaryStatusBadges item={item} />
          </div>
          <h3 className="truncate text-2xl font-semibold text-stone-100">{item.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-400">{item.description || "No description."}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            aria-label={item.isStarred ? "Unstar diary checklist" : "Star diary checklist"}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-500 transition hover:border-dusk-amber/45 hover:text-dusk-amber",
              item.isStarred && "border-dusk-amber/35 bg-dusk-amber/10 text-dusk-amber"
            )}
            disabled={!item.canManage}
            type="button"
            onClick={onStar}
          >
            <Star className={cn("h-4 w-4", item.isStarred && "fill-dusk-amber")} />
          </button>
          {item.canManage ? (
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-400 transition hover:border-dusk-lavender/45 hover:text-dusk-lavender"
              type="button"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-soft">
        <DiaryChecklistPreview
          canManage={item.canManage}
          rewardClaimedDates={item.rewardClaimedDates}
          rewardCoins={item.rewardCoins}
          rewardCoinType={item.rewardCoinType}
          selectedDate={selectedDate}
          value={item.checklist}
          onChange={onChecklistChange}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-stone-500">
        <span>{item.author.name ?? item.author.email}</span>
        <span>Starts {formatMediumDate(item.startDate)}</span>
      </div>
      {item.canToggleHidden ? (
        <Button className="mt-3 w-full" type="button" variant="ghost" onClick={onToggleHidden}>
          {item.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {item.isHidden ? "Show item" : "Hide item"}
        </Button>
      ) : null}
    </article>
  );
}

function DiaryQueueItem({ item, onClick }: { item: DiaryItemWithSummary; onClick: () => void }) {
  return (
    <button
      className="w-full rounded-lg border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-dusk-lavender/35 hover:bg-white/[0.055]"
      type="button"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-semibold text-stone-100">{item.title}</p>
        <span className="rounded-full border border-dusk-amber/20 bg-dusk-amber/10 px-2 py-0.5 text-[10px] text-dusk-amber">
          {item.intervalDays}d
        </span>
      </div>
      <p className="mt-1 text-xs text-stone-500">{getDiarySummaryLabel(item)}</p>
    </button>
  );
}

function DiaryStatusBadges({ item }: { item: DiaryItemWithSummary }) {
  return (
    <>
      {!item.isDueToday ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-stone-500">
          Not due today
        </span>
      ) : null}
      {item.isHidden ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-rose/25 bg-dusk-rose/10 px-2 py-1 text-[11px] text-dusk-rose">
          <EyeOff className="h-3 w-3" />
          Hidden
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1 rounded-full border border-dusk-cyan/25 bg-dusk-cyan/10 px-2 py-1 text-[11px] text-dusk-cyan">
        <Repeat className="h-3 w-3" />
        {getDiarySummaryLabel(item)}
      </span>
      {item.dueTime ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/25 bg-dusk-amber/10 px-2 py-1 font-mono text-[11px] text-dusk-amber">
          <Clock className="h-3 w-3" />
          {item.dueTime}
        </span>
      ) : null}
    </>
  );
}

function DiaryEmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/12 bg-ink-950/25 p-5 text-center text-sm text-stone-500">
      {label}
    </div>
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    onSubmit({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
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
    <ModalPortal>
      <div className="fixed inset-0 z-[1000] grid place-items-center bg-ink-950/85 px-4 py-4 backdrop-blur-sm">
        <form className="lofi-panel flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-lg p-5" onSubmit={handleSubmit}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Recurring Diary</p>
              <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs transition",
                  isRewardOpen
                    ? "border-dusk-amber/45 bg-dusk-amber/12 text-dusk-amber"
                    : "border-white/10 bg-white/[0.035] text-stone-300 hover:border-dusk-amber/35"
                )}
                type="button"
                onClick={() => setIsRewardOpen((current) => !current)}
              >
                <Coins className="h-4 w-4" />
                Reward
              </button>
              <button
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs transition",
                  isSettingsOpen
                    ? "border-dusk-amber/40 bg-dusk-amber/10 text-dusk-amber"
                    : "border-white/10 bg-white/[0.035] text-stone-300 hover:border-dusk-amber/35"
                )}
                type="button"
                onClick={() => setIsSettingsOpen((current) => !current)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Settings
              </button>
              <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className={cn("grid min-h-0 flex-1 gap-5 overflow-hidden", (isSettingsOpen || isRewardOpen) && "lg:grid-cols-[minmax(0,1fr)_18rem]")}>
            <section className="flex min-h-0 flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.2em] text-dusk-lavender">Details</p>
              <Input name="title" defaultValue={item?.title ?? ""} placeholder="Diary title" required />
              <Textarea className="min-h-32" name="description" defaultValue={item?.description ?? ""} placeholder="What should repeat?" />
              <ColorPicker selectedColor={color} onChange={setColor} />
              <DiaryChecklistEditor
                defaultRepeatDays={intervalDays}
                defaultStartDate={startDate}
                onDefaultRepeatDaysChange={setIntervalDays}
                value={checklist}
                onChange={setChecklist}
              />
            </section>

            <aside className={cn("space-y-4 overflow-y-auto self-start rounded-lg border border-white/10 bg-white/[0.025] p-4 scrollbar-soft", !isSettingsOpen && !isRewardOpen && "hidden")}>
              {isSettingsOpen ? (
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-dusk-amber">Settings</p>
                  <label className="space-y-2 text-sm text-stone-300">
                    <span>Start date</span>
                    <Input name="startDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
                  </label>

                  <label
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-stone-300",
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
              ) : null}

              {isRewardOpen ? (
                <div className="space-y-4 rounded-lg border border-dusk-amber/20 bg-dusk-amber/[0.045] p-3">
                  <div className="flex items-start gap-2">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-dusk-amber/25 bg-dusk-amber/10 text-dusk-amber">
                      <Coins className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-dusk-amber">Checklist reward</p>
                      <p className="mt-1 text-[11px] leading-5 text-stone-500">Awarded once per day after every due checklist item is complete.</p>
                    </div>
                  </div>

                  <label className="space-y-2 text-sm text-stone-300">
                    <span>Coins to award</span>
                    <Input
                      max={100000}
                      min={0}
                      type="number"
                      value={rewardCoins}
                      onChange={(event) => setRewardCoins(Math.max(0, Number(event.target.value) || 0))}
                    />
                  </label>

                  <div className="space-y-2 text-sm text-stone-300">
                    <span>Coin type</span>
                    <div className="grid gap-2">
                      {[
                        { value: "PROJECT" as const, label: "Project coins", disabled: false },
                        { value: "GLOBAL" as const, label: "Global coins", disabled: false }
                      ].map((option) => (
                        <button
                          key={option.value}
                          className={cn(
                            "flex h-10 items-center justify-between rounded-lg border px-3 text-left text-xs transition",
                            rewardCoinType === option.value
                              ? "border-dusk-amber/45 bg-dusk-amber/12 text-dusk-amber"
                              : "border-white/10 bg-white/[0.035] text-stone-400 hover:border-dusk-amber/35"
                          )}
                          type="button"
                          onClick={() => setRewardCoinType(option.value)}
                        >
                          <span>{option.label}</span>
                          {rewardCoinType === option.value ? <CheckCircle2 className="h-4 w-4" /> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </aside>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            {onDelete ? (
              <Button type="button" variant="danger" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button>
              <Save className="h-4 w-4" />
              Save diary
            </Button>
          </div>
        </form>
      </div>
    </ModalPortal>
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
    <div className="space-y-2 text-sm text-stone-300">
      <span>Diary color</span>
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
