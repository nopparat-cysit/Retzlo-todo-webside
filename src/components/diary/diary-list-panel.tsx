"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Eye, EyeOff, Pencil, Plus, Repeat, Save, SlidersHorizontal, Star, Trash2, X } from "lucide-react";

import { DiaryChecklistEditor, DiaryChecklistPreview } from "@/components/diary/diary-checklist";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ModalPortal } from "@/components/ui/modal-portal";
import { getDiaryChecklistSummary, normalizeDiaryChecklist, type DiaryChecklistItem } from "@/lib/diary/checklist";
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
  isStarred: boolean;
  isHidden: boolean;
  dueTime: string | null;
}

type DiaryFilter = "all" | "today" | "upcoming" | "starred" | "hidden";

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
  const [filter, setFilter] = useState<DiaryFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const visibleItems = useMemo(() => {
    return [...items]
      .map((item) => {
        const checklistSummary = getDiaryChecklistSummary(item, selectedDate);

        return {
          ...item,
          checklistSummary,
          isDueToday: checklistSummary.isDue
        };
      })
      .filter((item) => {
        if (filter === "today") return item.isDueToday;
        if (filter === "upcoming") return !item.isDueToday;
        if (filter === "starred") return item.isStarred;
        if (filter === "hidden") return item.isHidden;
        return true;
      })
      .sort((a, b) => {
        if (a.isDueToday !== b.isDueToday) return a.isDueToday ? -1 : 1;
        if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
  }, [filter, items, selectedDate]);

  async function saveItem(url: string, method: "POST" | "PATCH", payload: Partial<DiaryPayload>) {
    setError(null);
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as { diaryItem?: ProjectDiaryItem; error?: string };

    if (!response.ok || !data.diaryItem) {
      setError(data.error ?? "Something did not sync. Try again.");
      return null;
    }

    return normalizeDiaryItem(data.diaryItem);
  }

  async function createItem(payload: DiaryPayload) {
    const item = await saveItem(`/api/projects/${projectId}/diary-items`, "POST", payload);

    if (!item) return;

    setItems((current) => [item, ...current]);
    setSelectedItem(item);
    setIsCreateOpen(false);
  }

  async function updateItem(itemId: string, payload: Partial<DiaryPayload>) {
    const item = await saveItem(`/api/diary-items/${itemId}`, "PATCH", payload);

    if (!item) return false;

    setItems((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
    setSelectedItem((current) => (current?.id === item.id ? item : current));
    return true;
  }

  async function updateChecklist(item: ProjectDiaryItem, checklist: DiaryChecklistItem[]) {
    await updateItem(item.id, { checklist: normalizeDiaryChecklist(checklist, item.startDate) });
  }

  async function deleteItem(itemId: string) {
    setError(null);
    const response = await fetch(`/api/diary-items/${itemId}`, { method: "DELETE" });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Something did not sync. Try again.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== itemId));
    setSelectedItem(null);
  }

  return (
    <section className="space-y-4">
      <div className="lofi-panel flex flex-col justify-between gap-3 rounded-lg p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-dusk-lavender" />
            <h2 className="text-2xl font-semibold">Diary List</h2>
          </div>
          <p className="mt-1 text-sm text-stone-400">
            Checklist items for {formatMediumDate(`${selectedDate}T00:00:00.000Z`)}. Not-yet-due items fade and move down.
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add diary
        </Button>
      </div>

      {!allowMemberPrivateItems && !isOwner ? (
        <div className="rounded-lg border border-dusk-amber/20 bg-dusk-amber/10 px-4 py-3 text-sm text-dusk-amber">
          This project does not allow members to hide their own diary items.
        </div>
      ) : null}

      <div className="lofi-panel flex flex-wrap gap-2 rounded-lg p-3">
        {(["all", "today", "upcoming", "starred", "hidden"] as const).map((value) => (
          <button
            key={value}
            className={cn(
              "h-8 rounded-md border px-3 text-xs capitalize transition",
              filter === value
                ? "border-dusk-lavender bg-dusk-lavender text-ink-950"
                : "border-white/10 bg-white/5 text-stone-300 hover:border-dusk-lavender/60"
            )}
            type="button"
            onClick={() => setFilter(value)}
          >
            {value}
          </button>
        ))}
      </div>

      {error ? <p className="rounded-md border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {visibleItems.length === 0 ? (
          <div className="lofi-panel rounded-lg p-8 text-center text-sm text-stone-500 md:col-span-2 2xl:col-span-3">
            No diary checklist item in this filter.
          </div>
        ) : (
          visibleItems.map((item) => {
            const colorMeta = getCardColorMeta(item.color);

            return (
              <article
                key={item.id}
                className={cn(
                  "lofi-panel flex min-h-48 flex-col rounded-lg p-4 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                  colorMeta.softClass,
                  !item.isDueToday && "opacity-50 grayscale-[0.35]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
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
                      {item.checklistSummary.hasChecklist ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-cyan/25 bg-dusk-cyan/10 px-2 py-1 text-[11px] text-dusk-cyan">
                          <Repeat className="h-3 w-3" />
                          {item.checklistSummary.isDue
                            ? `Due ${item.checklistSummary.completedCount}/${item.checklistSummary.dueCount} today`
                            : `Checklist ${item.checklistSummary.totalCount}`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-cyan/25 bg-dusk-cyan/10 px-2 py-1 text-[11px] text-dusk-cyan">
                          <Repeat className="h-3 w-3" />
                          Every {item.intervalDays} day{item.intervalDays > 1 ? "s" : ""}
                        </span>
                      )}
                      {item.dueTime ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-dusk-amber/25 bg-dusk-amber/10 px-2 py-1 text-[11px] text-dusk-amber font-mono">
                          ⏰ {item.dueTime}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="truncate text-lg font-semibold text-stone-100">{item.title}</h3>
                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-stone-400">{item.description || "No description."}</p>
                    <DiaryChecklistPreview
                      canManage={item.canManage}
                      selectedDate={selectedDate}
                      value={item.checklist}
                      onChange={(checklist) => updateChecklist(item, checklist)}
                    />
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-500 transition hover:border-dusk-amber/45 hover:text-dusk-amber",
                        item.isStarred && "border-dusk-amber/35 bg-dusk-amber/10 text-dusk-amber"
                      )}
                      type="button"
                      disabled={!item.canManage}
                      aria-label={item.isStarred ? "Unstar diary checklist" : "Star diary checklist"}
                      onClick={() => updateItem(item.id, { isStarred: !item.isStarred })}
                    >
                      <Star className={cn("h-4 w-4", item.isStarred && "fill-dusk-amber")} />
                    </button>
                    {item.canManage ? (
                    <button
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-stone-400 transition hover:border-dusk-lavender/45 hover:text-dusk-lavender"
                      type="button"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    ) : null}
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-stone-500">
                  <span>{item.author.name ?? item.author.email}</span>
                  <span>Starts {formatMediumDate(item.startDate)}</span>
                </div>
                {item.canToggleHidden ? (
                  <Button
                    className="mt-3 w-full"
                    type="button"
                    variant="ghost"
                    onClick={() => updateItem(item.id, { isHidden: !item.isHidden })}
                  >
                    {item.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {item.isHidden ? "Show item" : "Hide item"}
                  </Button>
                ) : null}
              </article>
            );
          })
        )}
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
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
      startDate: String(formData.get("startDate") ?? new Date().toISOString().slice(0, 10)),
      checklist: normalizeDiaryChecklist(checklist, String(formData.get("startDate") ?? selectedDate)),
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

        <div className={cn("grid min-h-0 flex-1 gap-5 overflow-hidden", isSettingsOpen && "lg:grid-cols-[minmax(0,1fr)_18rem]")}>
          <section className="flex min-h-0 flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.2em] text-dusk-lavender">Details</p>
            <Input name="title" defaultValue={item?.title ?? ""} placeholder="Diary title" required />
            <Textarea className="min-h-32" name="description" defaultValue={item?.description ?? ""} placeholder="What should repeat?" />
            <ColorPicker selectedColor={color} onChange={setColor} />
            <DiaryChecklistEditor
              defaultRepeatDays={intervalDays}
              defaultStartDate={item?.startDate.slice(0, 10) ?? selectedDate}
              onDefaultRepeatDaysChange={setIntervalDays}
              value={checklist}
              onChange={setChecklist}
            />
          </section>

          <aside className={cn("space-y-4 self-start rounded-lg border border-white/10 bg-white/[0.025] p-4", !isSettingsOpen && "hidden")}>
            <p className="text-xs uppercase tracking-[0.2em] text-dusk-amber">Settings</p>
            <label className="space-y-2 text-sm text-stone-300">
              <span>Start date</span>
              <Input name="startDate" type="date" defaultValue={item?.startDate.slice(0, 10) ?? new Date().toISOString().slice(0, 10)} required />
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
    isStarred: item.isStarred ?? false,
    canManage: item.canManage ?? false,
    canToggleHidden: item.canToggleHidden ?? false
  };
}
