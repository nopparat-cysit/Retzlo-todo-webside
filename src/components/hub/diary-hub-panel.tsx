"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, CheckCircle2, Coins, Eye, EyeOff, Pencil, Plus, Repeat, Save, SlidersHorizontal, Star, Trash2, X } from "lucide-react";

import { DiaryChecklistEditor, DiaryChecklistPreview } from "@/components/diary/diary-checklist";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ModalPortal } from "@/components/ui/modal-portal";
import { setRedStarItem } from "@/components/hub/fab-hub";
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

const FILTER_KEY = "retrod:hub:diary:filter";
const PROJECT_KEY = "retrod:hub:diary:project";

type DiaryFilter = "all" | "today" | "starred" | "hidden" | "personal";

interface HubDiaryItem extends ProjectDiaryItem {
  projectName: string | null;
}

interface DiaryHubPanelProps {
  initialItems: HubDiaryItem[];
  projects: { id: string; name: string }[];
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

export function DiaryHubPanel({ initialItems, projects }: DiaryHubPanelProps) {
  const today = new Date().toISOString().slice(0, 10);

  // Persistent filter from localStorage
  const [filter, setFilterState] = useState<DiaryFilter>("all");
  const [projectFilter, setProjectFilterState] = useState<string>("all");
  const [items, setItems] = useState<HubDiaryItem[]>(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HubDiaryItem | null>(null);
  const [redStarId, setRedStarIdState] = useState<string | null>(null);
  const loaded = useRef(false);

  // Load persisted filters
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      const f = localStorage.getItem(FILTER_KEY) as DiaryFilter | null;
      const p = localStorage.getItem(PROJECT_KEY);
      if (f) setFilterState(f);
      if (p) setProjectFilterState(p);
      const star = localStorage.getItem("retrod:redStar");
      if (star) {
        const parsed = JSON.parse(star) as { type: string; id: string };
        if (parsed.type === "diary") setRedStarIdState(parsed.id);
      }
    } catch {}
  }, []);

  function setFilter(f: DiaryFilter) {
    setFilterState(f);
    localStorage.setItem(FILTER_KEY, f);
  }

  function setProjectFilter(p: string) {
    setProjectFilterState(p);
    localStorage.setItem(PROJECT_KEY, p);
  }

  const visibleItems = useMemo(() => {
    return [...items]
      .map((item) => {
        const checklistSummary = getDiaryChecklistSummary(item, today);

        return {
          ...item,
          checklistSummary,
          isDueToday: checklistSummary.isDue
        };
      })
      .filter((item) => {
        if (projectFilter !== "all") {
          if (projectFilter === "personal") {
            if (item.projectId !== null) return false;
          } else {
            if (item.projectId !== projectFilter) return false;
          }
        }
        if (filter === "today") return item.isDueToday;
        if (filter === "starred") return item.isStarred;
        if (filter === "hidden") return item.isHidden;
        if (filter === "personal") return item.projectId === null;
        return true;
      })
      .sort((a, b) => {
        if (a.isDueToday !== b.isDueToday) return a.isDueToday ? -1 : 1;
        if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
  }, [filter, projectFilter, items, today]);

  async function saveItem(url: string, method: "POST" | "PATCH", payload: Partial<DiaryPayload>) {
    setError(null);
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { diaryItem?: HubDiaryItem; error?: string };
    if (!response.ok || !data.diaryItem) {
      setError(data.error ?? "Something went wrong.");
      return null;
    }
    return normalizeItem(data.diaryItem);
  }

  async function createItem(payload: DiaryPayload) {
    const item = await saveItem("/api/hub/diary", "POST", payload);
    if (!item) return;
    setItems((cur) => [item, ...cur]);
    setIsCreateOpen(false);
  }

  async function updateItem(itemId: string, payload: Partial<DiaryPayload>) {
    const item = await saveItem(`/api/diary-items/${itemId}`, "PATCH", payload);
    if (!item) return false;
    setItems((cur) => cur.map((i) => (i.id === item.id ? item : i)));
    setSelectedItem((cur) => (cur?.id === item.id ? item : cur));
    return true;
  }

  async function updateChecklist(item: HubDiaryItem, checklist: DiaryChecklistItem[]) {
    await updateItem(item.id, { checklist: normalizeDiaryChecklist(checklist, item.startDate), selectedDate: today });
  }

  async function deleteItem(itemId: string) {
    setError(null);
    const response = await fetch(`/api/diary-items/${itemId}`, { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Delete failed.");
      return;
    }
    setItems((cur) => cur.filter((i) => i.id !== itemId));
    setSelectedItem(null);
  }

  function toggleRedStar(item: HubDiaryItem) {
    setRedStarIdState(item.id);
    setRedStarItem({ type: "diary", id: item.id, title: item.title, href: "/hub/diary" });
  }

  const FILTER_TABS: { value: DiaryFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "today", label: "Due Today" },
    { value: "starred", label: "Starred" },
    { value: "personal", label: "My Diary" },
    { value: "hidden", label: "Hidden" }
  ];

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="lofi-panel flex flex-col justify-between gap-3 rounded-xl p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-dusk-lavender" />
          <div>
            <h1 className="text-2xl font-semibold">Diary Hub</h1>
            <p className="mt-0.5 text-sm text-stone-400">All diary checklists across every project.</p>
          </div>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          My Diary
        </Button>
      </div>

      {/* Filters */}
      <div className="lofi-panel flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={cn(
                "h-8 rounded-lg border px-3 text-xs capitalize transition",
                filter === value
                  ? "border-dusk-lavender bg-dusk-lavender text-ink-950"
                  : "border-white/10 bg-white/5 text-stone-300 hover:border-dusk-lavender/50"
              )}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Project filter */}
        <select
          className="h-8 rounded-lg border border-white/10 bg-ink-950/50 px-3 text-xs text-stone-100 outline-none"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="all">All projects</option>
          <option value="personal">My Diary only</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>
      )}

      {/* Items grid */}
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {visibleItems.length === 0 ? (
          <div className="lofi-panel rounded-xl p-10 text-center text-sm text-stone-500 md:col-span-2 2xl:col-span-3">
            No diary items in this filter.
          </div>
        ) : (
          visibleItems.map((item) => {
            const colorMeta = getCardColorMeta(item.color);
            const isRedStarred = redStarId === item.id;

            return (
              <article
                key={item.id}
                className={cn(
                  "lofi-panel flex min-h-44 flex-col rounded-xl p-4 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                  colorMeta.softClass,
                  !item.isDueToday && "opacity-55 grayscale-[0.3]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      {/* Project badge */}
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-stone-400">
                        {item.projectName ?? "My Diary"}
                      </span>
                      {!item.isDueToday && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-stone-500">
                          Not due today
                        </span>
                      )}
                      {item.isHidden && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-rose/25 bg-dusk-rose/10 px-2 py-0.5 text-[10px] text-dusk-rose">
                          <EyeOff className="h-3 w-3" /> Hidden
                        </span>
                      )}
                      {item.checklistSummary.hasChecklist ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-cyan/25 bg-dusk-cyan/10 px-2 py-0.5 text-[10px] text-dusk-cyan">
                          <Repeat className="h-3 w-3" />
                          {item.checklistSummary.isDue
                            ? `Due ${item.checklistSummary.completedCount}/${item.checklistSummary.dueCount}`
                            : `Checklist ${item.checklistSummary.totalCount}`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-cyan/25 bg-dusk-cyan/10 px-2 py-0.5 text-[10px] text-dusk-cyan">
                          <Repeat className="h-3 w-3" />
                          Every {item.intervalDays}d
                        </span>
                      )}
                      {item.dueTime && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/25 bg-dusk-amber/10 px-2 py-0.5 text-[10px] text-dusk-amber font-mono">
                          ⏰ {item.dueTime}
                        </span>
                      )}
                    </div>
                    <h3 className="truncate text-base font-semibold text-stone-100">{item.title}</h3>
                    <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-stone-400">
                      {item.description || "No description."}
                    </p>
                    <DiaryChecklistPreview
                      canManage={item.canManage}
                      rewardClaimedDates={item.rewardClaimedDates}
                      rewardCoins={item.rewardCoins}
                      rewardCoinType={item.rewardCoinType}
                      selectedDate={today}
                      value={item.checklist}
                      onChange={(checklist) => updateChecklist(item, checklist)}
                    />
                  </div>

                  <div className="flex shrink-0 flex-col gap-1.5">
                    {/* Red star */}
                    {item.canManage && (
                      <button
                        type="button"
                        className={cn(
                          "grid h-7 w-7 place-items-center rounded-lg border text-stone-500 transition hover:border-red-400/50 hover:text-red-400",
                          isRedStarred
                            ? "border-red-400/40 bg-red-500/10 text-red-400"
                            : "border-white/10 bg-white/[0.04]"
                        )}
                        aria-label={isRedStarred ? "Pinned to FAB" : "Pin to FAB (red star)"}
                        onClick={() => toggleRedStar(item)}
                      >
                        <Star className={cn("h-3.5 w-3.5", isRedStarred && "fill-red-400")} />
                      </button>
                    )}
                    {/* Edit */}
                    {item.canManage && (
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-stone-400 transition hover:border-dusk-lavender/45 hover:text-dusk-lavender"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-auto border-t border-white/10 pt-3 text-xs text-stone-500">
                  {item.author.name ?? item.author.email} · {formatMediumDate(item.startDate)}
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Create My Diary modal */}
      {isCreateOpen && (
        <DiaryItemModal
          title="New My Diary"
          isPersonal
          selectedDate={today}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={createItem}
        />
      )}
      {/* Edit modal */}
      {selectedItem && (
        <DiaryItemModal
          item={selectedItem}
          title="Edit diary"
          isPersonal={selectedItem.projectId === null}
          selectedDate={today}
          onClose={() => setSelectedItem(null)}
          onDelete={() => deleteItem(selectedItem.id)}
          onSubmit={async (p) => {
            const didSave = await updateItem(selectedItem.id, p);
            if (didSave) setSelectedItem(null);
          }}
        />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

function DiaryItemModal({
  item,
  title,
  isPersonal,
  onClose,
  onDelete,
  selectedDate,
  onSubmit
}: {
  item?: HubDiaryItem;
  title: string;
  isPersonal: boolean;
  selectedDate: string;
  onClose: () => void;
  onDelete?: () => void;
  onSubmit: (payload: DiaryPayload) => void;
}) {
  const [color, setColor] = useState<CardColor>(normalizeCardColor(item?.color));
  const [intervalDays, setIntervalDays] = useState(item?.intervalDays ?? 1);
  const [startDate, setStartDate] = useState(item?.startDate.slice(0, 10) ?? selectedDate);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isRewardOpen, setIsRewardOpen] = useState((item?.rewardCoins ?? 0) > 0);
  const [rewardCoins, setRewardCoins] = useState(item?.rewardCoins ?? 0);
  const [rewardCoinType, setRewardCoinType] = useState<DiaryRewardCoinType>(isPersonal ? "GLOBAL" : item?.rewardCoinType ?? "PROJECT");
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
      rewardCoinType: isPersonal ? "GLOBAL" : rewardCoinType,
      rewardClaimedDates: item?.rewardClaimedDates ?? [],
      isStarred: item?.isStarred ?? false,
      isHidden: false,
      dueTime: null
    });
  }

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-ink-950/85 px-4 py-4 backdrop-blur-sm">
      <form className="lofi-panel flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl p-5" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">
              {isPersonal ? "Personal" : "Project"} · Recurring
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs transition",
                isRewardOpen
                  ? "border-dusk-amber/40 bg-dusk-amber/10 text-dusk-amber"
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
            <button className="rounded-md p-2 text-stone-400 hover:bg-white/10" type="button" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className={cn("grid min-h-0 flex-1 gap-5 overflow-hidden", (isSettingsOpen || isRewardOpen) && "lg:grid-cols-[minmax(0,1fr)_18rem]")}>
          <section className="flex min-h-0 flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.2em] text-dusk-lavender">Details</p>
            <Input name="title" defaultValue={item?.title ?? ""} placeholder="Diary title" required />
            <Textarea className="min-h-28" name="description" defaultValue={item?.description ?? ""} placeholder="What should repeat?" />
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
                  <Input
                    name="startDate"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    required
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
                      { value: "GLOBAL" as const, label: "Global coins", disabled: false },
                      { value: "PROJECT" as const, label: "Project coins", disabled: isPersonal }
                    ].map((option) => (
                      <button
                        key={option.value}
                        className={cn(
                          "flex h-10 items-center justify-between rounded-lg border px-3 text-left text-xs transition",
                          rewardCoinType === option.value
                            ? "border-dusk-amber/45 bg-dusk-amber/12 text-dusk-amber"
                            : "border-white/10 bg-white/[0.035] text-stone-400 hover:border-dusk-amber/35",
                          option.disabled && "cursor-not-allowed opacity-45"
                        )}
                        disabled={option.disabled}
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
          {onDelete && (
            <Button type="button" variant="danger" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
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

// ---------------------------------------------------------------------------
// Color picker (local)
// ---------------------------------------------------------------------------

function ColorPicker({ selectedColor, onChange }: { selectedColor: CardColor; onChange: (c: CardColor) => void }) {
  return (
    <div className="space-y-2 text-sm text-stone-300">
      <span>Color</span>
      <div className="flex flex-wrap gap-2">
        {cardColorOptions.map((option) => {
          const meta = getCardColorMeta(option.value);
          return (
            <button
              key={option.value}
              type="button"
              title={option.label}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full border bg-white/[0.035] transition hover:scale-105",
                selectedColor === option.value
                  ? "border-dusk-amber ring-2 ring-dusk-amber/45 ring-offset-2 ring-offset-ink-950"
                  : "border-white/10"
              )}
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

function normalizeItem(item: HubDiaryItem): HubDiaryItem {
  return {
    ...item,
    color: normalizeCardColor(item.color),
    startDate: new Date(item.startDate).toISOString(),
    checklist: normalizeDiaryChecklist(item.checklist, item.startDate),
    rewardCoins: item.rewardCoins ?? 0,
    rewardCoinType: item.projectId ? item.rewardCoinType ?? "PROJECT" : "GLOBAL",
    rewardClaimedDates: Array.isArray(item.rewardClaimedDates) ? item.rewardClaimedDates : [],
    createdAt: new Date(item.createdAt).toISOString(),
    updatedAt: new Date(item.updatedAt).toISOString()
  };
}
