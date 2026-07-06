"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock, ExternalLink, FileText, SlidersHorizontal, X } from "lucide-react";

import { CardModal } from "@/components/kanban/card-modal";
import { AppModal } from "@/components/ui/app-modal";
import { Panel } from "@/components/ui/panel";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  buildCalendarDays,
  defaultCalendarFilters,
  filterCalendarItems,
  groupCalendarItems,
  shiftDateKey,
  toDateKey,
  type CalendarFilterState,
  type CalendarViewMode
} from "@/lib/calendar/view";
import { formatMediumDate, formatShortDate, formatShortDue, formatTime, formatWeekday } from "@/lib/date-format";
import { getStatusMeta } from "@/lib/kanban/status";
import { getCardColorMeta, normalizeCardColor, type CardColor } from "@/lib/theme/card-colors";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/kanban";

import {
  toggleDiaryChecklistCompletion,
  normalizeDiaryChecklist,
  isDiaryChecklistItemDueOnDate,
  isDiaryChecklistItemCompletedOnDate
} from "@/lib/diary/checklist";
import type { ProjectDiaryItem } from "@/types/diary-item";

export interface CalendarCard extends Card {
  column: {
    name: string;
    boardId: string;
  };
}

export interface CalendarDiaryChecklist {
  id: string;
  diaryId: string;
  diaryTitle: string;
  checklistItemId: string;
  type: "diary_checklist";
  title: string;
  dueDate: string;
  dueDateAllDay: boolean;
  completed: boolean;
  color: string;
}

export interface CalendarNote {
  id: string;
  title: string;
  content: string;
  color: CardColor;
  dueDate: string;
  dueDateAllDay: boolean;
  isStarred: boolean;
}

export function ProjectCalendar({
  projectId,
  initialCards,
  initialNotes = [],
  initialDiaryItems = []
}: {
  projectId: string;
  initialCards: CalendarCard[];
  initialNotes?: CalendarNote[];
  initialDiaryItems?: ProjectDiaryItem[];
}) {
  const [cards, setCards] = useState(initialCards);
  const [notes] = useState(initialNotes);
  const [diaryItems, setDiaryItems] = useState(initialDiaryItems);
  const [filters, setFilters] = useState<CalendarFilterState>(defaultCalendarFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [customDays, setCustomDays] = useState(5);
  const [anchorDate, setAnchorDate] = useState(() => toDateKey(new Date()));
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const { toast } = useToast();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [dayTypeFilter, setDayTypeFilter] = useState<"all" | "tasks" | "notes" | "diaries">("all");
  const [dayStatusFilter, setDayStatusFilter] = useState<"all" | "pending" | "done">("all");
  const [daySortBy, setDaySortBy] = useState<"time" | "title" | "priority">("time");
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [pendingUpdatePayload, setPendingUpdatePayload] = useState<any>(null);
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? null;
  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null;
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const calendarDays = useMemo(
    () => buildCalendarDays({ anchorDate, mode: viewMode, customDays }),
    [anchorDate, customDays, viewMode]
  );
  const diaryChecklistEntries = useMemo(() => {
    const entries: CalendarDiaryChecklist[] = [];
    for (const day of calendarDays) {
      if (day.key > todayKey) {
        continue;
      }
      for (const diary of diaryItems) {
        const checklist = normalizeDiaryChecklist(diary.checklist, diary.startDate);
        for (const cli of checklist) {
          if (isDiaryChecklistItemDueOnDate(cli, day.key)) {
            entries.push({
              id: `${diary.id}:${cli.id}:${day.key}`,
              diaryId: diary.id,
              diaryTitle: diary.title,
              checklistItemId: cli.id,
              type: "diary_checklist" as const,
              title: cli.label,
              dueDate: day.key + (cli.dueTime ? `T${cli.dueTime}:00` : ""),
              dueDateAllDay: !cli.dueTime,
              completed: isDiaryChecklistItemCompletedOnDate(cli, day.key),
              color: diary.color
            });
          }
        }
      }
    }
    return entries;
  }, [diaryItems, calendarDays, todayKey]);

  const allItems = useMemo<CalendarEntry[]>(
    () => [
      ...cards
        .filter((card): card is CalendarCard & { dueDate: string } => Boolean(card.dueDate))
        .map((card) => ({ ...card, type: "card" as const })),
      ...notes.map((note) => ({ ...note, type: "note" as const })),
      ...diaryChecklistEntries
    ],
    [cards, notes, diaryChecklistEntries]
  );
  const filteredItems = useMemo(() => filterCalendarItems(allItems, filters), [allItems, filters]);
  const groups = useMemo(() => groupCalendarItems(filteredItems), [filteredItems]);
  const selectedDateLabel = selectedDayKey
    ? formatMediumDate(new Date(selectedDayKey + "T00:00:00.000Z"))
    : "";

  const selectedDayItems = useMemo(() => {
    if (!selectedDayKey) return [];
    const items = groups[selectedDayKey] ?? [];
    return [...items]
      .filter((item) => {
        if (dayTypeFilter === "tasks" && item.type !== "card") return false;
        if (dayTypeFilter === "notes" && item.type !== "note") return false;
        if (dayTypeFilter === "diaries" && item.type !== "diary_checklist") return false;
        if (dayStatusFilter === "pending") {
          if (item.type === "card" && item.status === "DONE") return false;
          if (item.type === "note" && (item as any).completedAt) return false;
          if (item.type === "diary_checklist" && (item as any).completed) return false;
        }
        if (dayStatusFilter === "done") {
          if (item.type === "card" && item.status !== "DONE") return false;
          if (item.type === "note" && !(item as any).completedAt) return false;
          if (item.type === "diary_checklist" && !(item as any).completed) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aCompleted = a.type === "card"
          ? a.status === "DONE"
          : a.type === "diary_checklist"
            ? a.completed
            : Boolean((a as any).completedAt);

        const bCompleted = b.type === "card"
          ? b.status === "DONE"
          : b.type === "diary_checklist"
            ? b.completed
            : Boolean((b as any).completedAt);

        if (aCompleted !== bCompleted) {
          return aCompleted ? 1 : -1;
        }

        if (daySortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        if (daySortBy === "priority") {
          const getPriorityVal = (item: any) => {
            if (item.type === "card") {
              if (item.priority === "HIGH") return 3;
              if (item.priority === "MEDIUM") return 2;
              if (item.priority === "LOW") return 1;
            }
            return 0;
          };
          return getPriorityVal(b) - getPriorityVal(a);
        }
        const getAmPmTime = (item: any) => {
          if (item.dueDateAllDay) return -1;
          return item.dueDate ? new Date(item.dueDate).getTime() : 0;
        };
        return getAmPmTime(a) - getAmPmTime(b);
      });
  }, [selectedDayKey, groups, dayTypeFilter, dayStatusFilter, daySortBy]);
  const rangeLabel = formatRangeLabel(calendarDays);
  const dayColumnCount = viewMode === "month" ? 7 : calendarDays.length;

  async function handleSaveIntent(payload: any) {
    setPendingUpdatePayload(payload);
    setIsUpdateConfirmOpen(true);
  }

  async function executeSaveCard() {
    if (!selectedCard || !pendingUpdatePayload) return;
    const response = await fetch("/api/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: selectedCard.id,
        ...pendingUpdatePayload
      })
    });
    const data = (await response.json()) as { card?: Card; error?: string };

    setIsUpdateConfirmOpen(false);

    if (data.card) {
      const nextCard = normalizeCalendarCard({
        ...selectedCard,
        ...data.card
      });
      setCards((current) => current.map((item) => (item.id === nextCard.id ? nextCard : item)));
      setSelectedCardId(null);
      toast({ message: "Card updated.", type: "success" });
    } else {
      toast({ message: data.error ?? "Could not save card.", type: "error" });
    }
  }

  async function handleToggleDiaryChecklist(diaryId: string, checklistItemId: string, dateKey: string, checked: boolean) {
    const targetDate = dateKey.slice(0, 10);
    const diary = diaryItems.find((d) => d.id === diaryId);
    if (!diary) return;

    const checklist = normalizeDiaryChecklist(diary.checklist, diary.startDate);
    const updatedChecklist = toggleDiaryChecklistCompletion(checklist, checklistItemId, targetDate, checked);

    const updatedDiaryItems = diaryItems.map((d) => {
      if (d.id === diaryId) {
        return {
          ...d,
          checklist: updatedChecklist
        };
      }
      return d;
    });
    setDiaryItems(updatedDiaryItems);

    try {
      const response = await fetch(`/api/diary-items/${diaryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklist: updatedChecklist,
          selectedDate: targetDate
        })
      });
      const data = await response.json();
      if (response.ok && data.diaryItem) {
        const normalized = {
          ...data.diaryItem,
          checklist: normalizeDiaryChecklist(data.diaryItem.checklist, data.diaryItem.startDate)
        };
        setDiaryItems((current) => current.map((d) => (d.id === diaryId ? normalized : d)));
        toast({ message: "Diary checklist updated.", type: "success" });
      } else {
        setDiaryItems(diaryItems);
        toast({ message: data.error ?? "Failed to update checklist item.", type: "error" });
      }
    } catch (e) {
      setDiaryItems(diaryItems);
      toast({ message: "Failed to update checklist item.", type: "error" });
    }
  }

  async function executeDeleteCard() {
    if (!selectedCard) return;
    setIsDeleteConfirmOpen(false);
    const response = await fetch(`/api/cards?cardId=${selectedCard.id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      setCards((current) => current.filter((card) => card.id !== selectedCard.id));
      setSelectedCardId(null);
      toast({ message: "Card deleted.", type: "success" });
    } else {
      const data = await response.json().catch(() => ({}));
      toast({ message: data.error ?? "Could not delete card.", type: "error" });
    }
  }

  return (
    <>
      <div
        className="grid h-full min-h-0 gap-4 overflow-y-auto pr-1 scrollbar-soft xl:grid-cols-[var(--calendar-filter-width)_minmax(0,1fr)_340px]"
        style={{
          "--calendar-filter-width": isFiltersOpen ? "280px" : "64px"
        } as CSSProperties}
      >
        <Panel className={cn("overflow-hidden transition-[padding] duration-200", isFiltersOpen ? "p-5" : "p-2")}>
          <button
            aria-expanded={isFiltersOpen}
            aria-label={isFiltersOpen ? "Collapse calendar filters" : "Expand calendar filters"}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg text-left transition hover:bg-white/[0.04]",
              isFiltersOpen ? "justify-between p-0" : "h-12 justify-center"
            )}
            type="button"
            onClick={() => setIsFiltersOpen((current) => !current)}
            title={isFiltersOpen ? "Collapse filters" : "Expand filters"}
          >
            <div className={cn("flex items-center gap-2", !isFiltersOpen && "justify-center")}>
              <SlidersHorizontal className="h-5 w-5 shrink-0 text-dusk-lavender" />
              <div>
                <h3 className={cn("font-semibold", !isFiltersOpen && "sr-only")}>Calendar Filters</h3>
                <p className={cn("text-xs text-stone-500", !isFiltersOpen && "sr-only")}>Choose what appears.</p>
              </div>
            </div>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-stone-500 transition", !isFiltersOpen && "-rotate-90")} />
          </button>

          {isFiltersOpen ? <div className="mt-5 space-y-5">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-stone-500">Sources</p>
              <FilterCheckbox label="Cards" checked={filters.showCards} onChange={(checked) => setFilters((current) => ({ ...current, showCards: checked }))} />
              <FilterCheckbox label="Notes" checked={filters.showNotes} onChange={(checked) => setFilters((current) => ({ ...current, showNotes: checked }))} />
              <FilterCheckbox label="Diary Checklist" checked={filters.showDiaryChecklist} onChange={(checked) => setFilters((current) => ({ ...current, showDiaryChecklist: checked }))} />
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-stone-500">Card Status</p>
              {(["TODO", "DOING", "WAITING", "DONE"] as const).map((status) => {
                const meta = getStatusMeta(status);

                return (
                  <FilterCheckbox
                    key={status}
                    label={meta.label}
                    checked={filters.statuses[status]}
                    swatchClassName={meta.badgeClass}
                    onChange={(checked) =>
                      setFilters((current) => ({
                        ...current,
                        statuses: { ...current.statuses, [status]: checked }
                      }))
                    }
                  />
                );
              })}
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-stone-500">Notes</p>
              <FilterSelect
                value={filters.noteScope}
                options={[
                  { value: "all", label: "All notes" },
                  { value: "starred", label: "Starred only" },
                  { value: "plain", label: "Not starred" }
                ]}
                onValueChange={(noteScope) => setFilters((current) => ({ ...current, noteScope }))}
              />
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-stone-500">Time</p>
              <FilterSelect
                value={filters.timeScope}
                options={[
                  { value: "all", label: "All times" },
                  { value: "allDay", label: "All-day only" },
                  { value: "timed", label: "Timed only" }
                ]}
                onValueChange={(timeScope) => setFilters((current) => ({ ...current, timeScope }))}
              />
            </div>
          </div> : null}
        </Panel>

        <Panel className="p-5">
          <div className="mb-5 flex flex-col justify-between gap-3 2xl:flex-row 2xl:items-end">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-dusk-lavender" />
                <h2 className="text-2xl font-semibold">Calendar</h2>
              </div>
              <p className="mt-1 text-sm text-stone-400">Cards and notes with dates gather here.</p>
              <p className="mt-1 text-xs text-dusk-amber">{rangeLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <IconButton label="Previous" onClick={() => setAnchorDate((value) => shiftDateKey(value, viewMode === "month" ? -30 : -calendarDays.length))}>
                <ChevronLeft className="h-4 w-4" />
              </IconButton>
              <IconButton label="Today" onClick={() => setAnchorDate(todayKey)}>
                Today
              </IconButton>
              <IconButton label="Next" onClick={() => setAnchorDate((value) => shiftDateKey(value, viewMode === "month" ? 30 : calendarDays.length))}>
                <ChevronRight className="h-4 w-4" />
              </IconButton>
              <Input
                className="w-auto min-w-40"
                type="date"
                value={anchorDate}
                onChange={(event) => setAnchorDate(event.target.value)}
              />
              <SegmentedControl
                aria-label="Calendar view"
                value={viewMode}
                items={[
                  { value: "month", label: "Month" },
                  { value: "day3", label: "3 days" },
                  { value: "day5", label: "5 days" },
                  { value: "week", label: "7 days" },
                  { value: "custom", label: "Custom" }
                ]}
                onValueChange={setViewMode}
              />
              {viewMode === "custom" ? (
                <Input
                  className="w-20"
                  max={14}
                  min={1}
                  type="number"
                  value={customDays}
                  onChange={(event) => setCustomDays(Number(event.target.value))}
                />
              ) : null}
            </div>
          </div>
          {filteredItems.length === 0 ? (
            <div className="rounded-md border border-dashed border-white/10 p-8 text-center">
              <h3 className="text-lg font-semibold">No matching calendar items</h3>
              <p className="mt-2 text-sm text-stone-400">Try widening the filters or changing the date range.</p>
            </div>
          ) : (
            <div>
              <div className="mb-2 grid gap-2 text-center text-xs uppercase tracking-[0.2em] text-stone-500" style={{ gridTemplateColumns: `repeat(${dayColumnCount}, minmax(0, 1fr))` }}>
                {calendarDays.slice(0, dayColumnCount).map((day) => (
                  <span key={`label-${day.key}`}>{formatWeekday(day.date)}</span>
                ))}
              </div>
              <div className="grid gap-2 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${dayColumnCount}, minmax(8rem, 1fr))` }}>
                {calendarDays.map((day) => {
                  const key = day.key;
                  const datedItems = groups[key] ?? [];
                  const muted = !day.isCurrentMonth && viewMode === "month";
                  const current = key === todayKey;

                  const cardsAndNotes = datedItems.filter((i) => i.type === "card" || i.type === "note");
                  const diaryChecklists = datedItems.filter((i): i is CalendarDiaryChecklist => i.type === "diary_checklist");

                  const groupedDiariesMap = new Map<string, CalendarDiaryChecklist[]>();
                  for (const d of diaryChecklists) {
                    const existing = groupedDiariesMap.get(d.diaryId) ?? [];
                    existing.push(d);
                    groupedDiariesMap.set(d.diaryId, existing);
                  }

                  const diarySummaries = Array.from(groupedDiariesMap.entries()).map(([diaryId, items]) => {
                    const completedCount = items.filter((i) => i.completed).length;
                    const totalCount = items.length;
                    return {
                      type: "diary_summary" as const,
                      id: `${diaryId}-${items[0].dueDate}`,
                      diaryId,
                      diaryTitle: items[0].diaryTitle,
                      completedCount,
                      totalCount,
                      color: items[0].color,
                      dueDate: items[0].dueDate
                    };
                  });

                  const cellRenderItems = [...cardsAndNotes, ...diarySummaries];

                  return (
                    <section
                      key={key}
                      onClick={() => setSelectedDayKey(key)}
                      className={cn(
                        "min-h-36 rounded-md border p-2 cursor-pointer transition hover:border-dusk-lavender/40 hover:bg-white/[0.02]",
                        current ? "border-dusk-amber/50 bg-dusk-amber/10" : "border-white/10 bg-ink-950/45",
                        muted && "opacity-55"
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        {cellRenderItems.length > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDayKey(key);
                            }}
                            className="text-xs font-semibold text-dusk-lavender hover:text-dusk-lavender/80 underline decoration-dotted"
                          >
                            all
                          </button>
                        ) : (
                          <div />
                        )}
                        <span className="text-sm font-semibold text-stone-200">{day.date.getDate()}</span>
                      </div>
                      <div className="space-y-1.5">
                        {cellRenderItems.slice(0, 3).map((entry) => {
                          if (entry.type === "card") {
                            return <CalendarCardButton key={`card-${entry.id}`} card={entry} onClick={() => setSelectedCardId(entry.id)} />;
                          } else if (entry.type === "note") {
                            return <CalendarNoteButton key={`note-${entry.id}`} note={entry} onClick={() => setSelectedNoteId(entry.id)} />;
                          } else {
                            return (
                              <CalendarDiarySummaryButton
                                key={`diary-summary-${entry.id}`}
                                item={entry}
                                onClick={() => setSelectedDayKey(key)}
                              />
                            );
                          }
                        })}
                        {cellRenderItems.length > 3 ? (
                          <p className="text-xs text-stone-500">+{cellRenderItems.length - 3} more</p>
                        ) : null}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          )}
        </Panel>
        <Panel className="p-5">
          <h3 className="mb-3 text-lg font-semibold">Upcoming</h3>
          <div className="space-y-2">
            {filteredItems.slice(0, 10).map((item) => {
              if (item.type === "card") {
                return <UpcomingCard key={`upcoming-card-${item.id}`} card={item} onClick={() => setSelectedCardId(item.id)} />;
              } else if (item.type === "note") {
                return <UpcomingNote key={`upcoming-note-${item.id}`} note={item} onClick={() => setSelectedNoteId(item.id)} />;
              } else {
                return (
                  <UpcomingDiaryChecklist
                    key={`upcoming-diary-${item.id}`}
                    item={item}
                    onToggle={(checked) => handleToggleDiaryChecklist(item.diaryId, item.checklistItemId, item.dueDate, checked)}
                  />
                );
              }
            })}
            {filteredItems.length === 0 ? <p className="text-sm text-stone-500">No upcoming matching items.</p> : null}
          </div>
        </Panel>
      </div>

      {selectedCard ? (
        <CardModal
          card={selectedCard}
          mode="edit"
          open={Boolean(selectedCard)}
          onClose={() => setSelectedCardId(null)}
          onDelete={async () => {
            setIsDeleteConfirmOpen(true);
          }}
          onSubmit={handleSaveIntent}
          footerAction={
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 text-sm font-medium text-stone-100 transition hover:border-dusk-lavender/50 hover:bg-white/10"
              href={`/project/${projectId}/board#card-${selectedCard.id}`}
            >
              <ExternalLink className="h-4 w-4" />
              Go to board
            </Link>
          }
        />
      ) : null}

      <ConfirmModal
        open={isDeleteConfirmOpen}
        title="Delete card"
        message={`Are you sure you want to delete "${selectedCard?.title}"? This action cannot be undone.`}
        confirmLabel="Delete card"
        variant="danger"
        isLoading={false}
        onConfirm={executeDeleteCard}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />

      <ConfirmModal
        open={isUpdateConfirmOpen}
        title="Save card changes"
        message={`Are you sure you want to save changes to this card?`}
        confirmLabel="Save"
        isLoading={false}
        onConfirm={executeSaveCard}
        onClose={() => setIsUpdateConfirmOpen(false)}
      />
      {selectedNote ? (
        <AppModal
          open
          onClose={() => setSelectedNoteId(null)}
          labelledBy="calendar-note-title"
          contentClassName="lofi-panel max-w-lg rounded-lg p-5"
        >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Calendar Note</p>
                <h2 id="calendar-note-title" className="mt-1 text-2xl font-semibold">{selectedNote.title}</h2>
              </div>
              <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={() => setSelectedNoteId(null)}>
                X
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-stone-300">{selectedNote.content || "No content."}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 text-sm font-medium text-stone-100 transition hover:border-dusk-lavender/50 hover:bg-white/10"
                href={`/project/${projectId}/notes`}
              >
                <ExternalLink className="h-4 w-4" />
                Go to notes
              </Link>
            </div>
        </AppModal>
      ) : null}

      {selectedDayKey && (
        <AppModal
          open
          onClose={() => setSelectedDayKey(null)}
          labelledBy="calendar-day-title"
          contentClassName="lofi-panel flex max-h-[calc(100vh-2rem)] max-w-2xl flex-col overflow-hidden rounded-2xl"
        >
              <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Day View</p>
                  <h2 id="calendar-day-title" className="mt-1 text-2xl font-semibold">Items on {selectedDateLabel}</h2>
                </div>
                <button
                  className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100"
                  type="button"
                  onClick={() => setSelectedDayKey(null)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filters & Sorting controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.015] px-5 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Type Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-stone-500 uppercase tracking-wide">Type:</span>
                    <FilterSelect
                      triggerClassName="h-8"
                      value={dayTypeFilter}
                      options={[
                        { value: "all", label: "All" },
                        { value: "tasks", label: "Tasks" },
                        { value: "notes", label: "Notes" },
                        { value: "diaries", label: "Diaries" }
                      ]}
                      onValueChange={setDayTypeFilter}
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-stone-500 uppercase tracking-wide">Status:</span>
                    <FilterSelect
                      triggerClassName="h-8"
                      value={dayStatusFilter}
                      options={[
                        { value: "all", label: "All" },
                        { value: "pending", label: "Pending" },
                        { value: "done", label: "Done" }
                      ]}
                      onValueChange={setDayStatusFilter}
                    />
                  </div>
                </div>

                {/* Sort control */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-stone-500 uppercase tracking-wide">Sort:</span>
                  <FilterSelect
                    triggerClassName="h-8"
                    value={daySortBy}
                    options={[
                      { value: "time", label: "Time" },
                      { value: "title", label: "Title" },
                      { value: "priority", label: "Priority" }
                    ]}
                    onValueChange={setDaySortBy}
                  />
                </div>
              </div>

              {/* Main List */}
              <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto p-5">
                {selectedDayItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.01] py-12 text-center text-sm text-stone-500">
                    No items match the selected filters for this day.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayItems.map((item) => {
                      const colorMeta = getCardColorMeta(item.color);
                      const isCard = item.type === "card";
                      const isNote = item.type === "note";
                      const isDiaryChecklist = item.type === "diary_checklist";
                      const isCompleted = isCard
                        ? (item as CalendarCard).status === "DONE"
                        : isDiaryChecklist
                          ? (item as CalendarDiaryChecklist).completed
                          : false;

                      return (
                        <div
                          key={`${item.type}-${item.id}`}
                          onClick={() => {
                            if (isCard) {
                              setSelectedCardId(item.id);
                            } else if (isNote) {
                              setSelectedNoteId(item.id);
                            }
                          }}
                          className={cn(
                            "relative flex items-start justify-between rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                            isCard || isNote ? "cursor-pointer" : "cursor-default",
                            colorMeta.softClass ?? "border-white/10 bg-white/5",
                            isCompleted && "opacity-75"
                          )}
                        >
                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            {isDiaryChecklist && (
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const dc = item as CalendarDiaryChecklist;
                                  handleToggleDiaryChecklist(dc.diaryId, dc.checklistItemId, dc.dueDate, e.target.checked);
                                }}
                                className="mt-1.5 h-4 w-4 shrink-0 accent-dusk-lavender cursor-pointer"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {isCard && (
                                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] uppercase font-semibold", getStatusMeta((item as CalendarCard).status).badgeClass)}>
                                    {getStatusMeta((item as CalendarCard).status).label}
                                  </span>
                                )}
                                {isNote && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full border border-dusk-amber/25 bg-dusk-amber/10 px-2 py-0.5 text-[10px] text-dusk-amber font-semibold">
                                    <FileText className="h-2.5 w-2.5" /> Note
                                  </span>
                                )}
                                {isDiaryChecklist && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-dusk-lavender/25 bg-dusk-lavender/10 px-2 py-0.5 text-[10px] text-dusk-lavender font-semibold">
                                    📖 Diary Checklist
                                  </span>
                                )}

                                {isCard && (item as CalendarCard).priority && (
                                  <span className={cn(
                                    "rounded-full border px-2 py-0.5 text-[10px] uppercase font-semibold",
                                    (item as CalendarCard).priority === "HIGH" && "border-red-400/20 bg-red-400/10 text-red-400",
                                    (item as CalendarCard).priority === "MEDIUM" && "border-dusk-amber/20 bg-dusk-amber/10 text-dusk-amber",
                                    (item as CalendarCard).priority === "LOW" && "border-white/5 bg-white/5 text-stone-400"
                                  )}>
                                    {(item as CalendarCard).priority}
                                  </span>
                                )}
                              </div>

                              <h3 className={cn(
                                "mt-2 text-base font-semibold text-stone-100 truncate",
                                isCompleted && "line-through text-stone-500"
                              )}>
                                {item.title}
                              </h3>

                              {isNote && (item as CalendarNote).content && (
                                <p className="mt-1 line-clamp-2 text-xs text-stone-400 leading-relaxed">
                                  {(item as CalendarNote).content}
                                </p>
                              )}
                              {isCard && (item as CalendarCard).description && (
                                <p className="mt-1 line-clamp-2 text-xs text-stone-400 leading-relaxed">
                                  {(item as CalendarCard).description}
                                </p>
                              )}
                              {isDiaryChecklist && (
                                <p className="mt-1 text-xs text-stone-500 font-medium">
                                  From diary: {(item as CalendarDiaryChecklist).diaryTitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="ml-4 flex flex-col items-end gap-1.5 text-xs text-stone-500 shrink-0">
                            {item.dueDate && !item.dueDateAllDay && (
                              <span className="inline-flex items-center gap-1 text-dusk-cyan">
                                <Clock className="h-3.5 w-3.5" />
                                {formatTime(item.dueDate)}
                              </span>
                            )}
                            {item.dueDateAllDay && (
                              <span className="text-dusk-cyan font-medium">All day</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
                <Button type="button" variant="ghost" onClick={() => setSelectedDayKey(null)}>
                  Close
                </Button>
              </div>
        </AppModal>
      )}
    </>
  );
}

type CalendarEntry = (CalendarCard & { type: "card"; dueDate: string }) | (CalendarNote & { type: "note" }) | CalendarDiaryChecklist;

function CalendarCardButton({ card, onClick }: { card: CalendarCard; onClick: () => void }) {
  const colorMeta = getCardColorMeta(card.color);

  return (
    <button
      className={cn("block w-full rounded border px-2 py-1.5 text-left text-xs hover:border-dusk-lavender/60", colorMeta.softClass)}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <span className="block truncate font-medium text-stone-100">{card.title}</span>
      <span className="mt-1 flex items-center gap-1 text-[11px] text-dusk-cyan">
        <Clock className="h-3 w-3" />
        {card.dueDateAllDay
          ? "All day"
          : card.dueDate
            ? formatTime(card.dueDate)
            : ""}
      </span>
      <span className="mt-1 inline-flex">
        <StatusBadge status={card.status} />
      </span>
    </button>
  );
}

function CalendarDiarySummaryButton({
  item,
  onClick
}: {
  item: {
    diaryId: string;
    diaryTitle: string;
    completedCount: number;
    totalCount: number;
    color: string;
  };
  onClick: () => void;
}) {
  const colorMeta = getCardColorMeta(item.color);

  return (
    <button
      className={cn(
        "flex w-full items-center gap-1.5 rounded border px-2 py-1.5 text-left text-xs transition font-medium text-stone-200 hover:border-white/20",
        colorMeta.softClass
      )}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <span className="truncate flex-1">📖 {item.diaryTitle}</span>
      <span className="text-[10px] text-stone-400 shrink-0 font-semibold">
        ({item.completedCount}/{item.totalCount})
      </span>
    </button>
  );
}

function CalendarDiaryChecklistButton({
  item,
  onToggle
}: {
  item: CalendarDiaryChecklist;
  onToggle: (checked: boolean) => void;
}) {
  const colorMeta = getCardColorMeta(item.color);

  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 rounded border px-2 py-1.5 text-left text-xs",
        colorMeta.softClass
      )}
    >
      <input
        type="checkbox"
        checked={item.completed}
        onChange={(e) => {
          e.stopPropagation();
          onToggle(e.target.checked);
        }}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-dusk-lavender cursor-pointer"
      />
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate font-medium text-stone-100",
            item.completed && "line-through text-stone-500"
          )}
          title={item.title}
        >
          {item.title}
        </span>
        <span className="mt-0.5 block truncate text-[9px] text-stone-400" title={`Diary: ${item.diaryTitle}`}>
          📖 {item.diaryTitle}
        </span>
      </div>
    </div>
  );
}

function UpcomingDiaryChecklist({
  item,
  onToggle
}: {
  item: CalendarDiaryChecklist;
  onToggle: (checked: boolean) => void;
}) {
  const colorMeta = getCardColorMeta(item.color);

  return (
    <div
      className={cn(
        "w-full rounded-md border p-3 text-left text-sm transition hover:border-dusk-lavender/60 flex items-start gap-2",
        colorMeta.softClass
      )}
    >
      <input
        type="checkbox"
        checked={item.completed}
        onChange={(e) => onToggle(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-dusk-lavender cursor-pointer"
      />
      <div className="min-w-0 flex-1">
        <p className={cn("font-medium", item.completed && "line-through text-stone-500")}>{item.title}</p>
        <p className="mt-1 text-xs text-dusk-cyan">{formatDue(item)}</p>
        <p className="mt-1 text-xs text-stone-500">📖 {item.diaryTitle}</p>
      </div>
    </div>
  );
}

function CalendarNoteButton({ note, onClick }: { note: CalendarNote; onClick: () => void }) {
  const colorMeta = getCardColorMeta(note.color);

  return (
    <button
      className={cn("block w-full rounded border px-2 py-1.5 text-left text-xs hover:border-dusk-amber/60", colorMeta.softClass)}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <span className="flex items-center gap-1 truncate font-medium text-stone-100">
        <FileText className="h-3 w-3 text-dusk-amber" />
        {note.title}
      </span>
      <span className="mt-1 block text-[11px] text-dusk-amber">{note.dueDateAllDay ? "All day" : formatTime(note.dueDate)}</span>
    </button>
  );
}

function UpcomingCard({ card, onClick }: { card: CalendarCard; onClick: () => void }) {
  const colorMeta = getCardColorMeta(card.color);

  return (
    <button
      className={cn("w-full rounded-md border p-3 text-left text-sm transition hover:border-dusk-lavender/60", colorMeta.softClass)}
      type="button"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{card.title}</p>
        <StatusBadge status={card.status} />
      </div>
      <p className="mt-1 text-xs text-dusk-cyan">{formatDue(card)}</p>
      <p className="mt-1 text-xs text-stone-500">{card.column.name}</p>
    </button>
  );
}

function UpcomingNote({ note, onClick }: { note: CalendarNote; onClick: () => void }) {
  const colorMeta = getCardColorMeta(note.color);

  return (
    <button
      className={cn("w-full rounded-md border p-3 text-left text-sm transition hover:border-dusk-lavender/60", colorMeta.softClass)}
      type="button"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <FileText className="mt-0.5 h-4 w-4 text-dusk-amber" />
        <p className="font-medium">{note.title}</p>
      </div>
      <p className="mt-1 text-xs text-dusk-cyan">{formatDue(note)}</p>
      <p className="mt-1 text-xs text-stone-500">{note.isStarred ? "Starred note" : "Note"}</p>
    </button>
  );
}

function FilterCheckbox({
  label,
  checked,
  swatchClassName,
  onChange
}: {
  label: string;
  checked: boolean;
  swatchClassName?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-3 rounded-md px-2 text-sm text-stone-300 transition hover:bg-white/[0.04]">
      <input
        checked={checked}
        className="h-4 w-4 accent-dusk-lavender"
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      {swatchClassName ? <span className={cn("h-2.5 w-2.5 rounded-full", swatchClassName)} /> : null}
      <span>{label}</span>
    </label>
  );
}

function IconButton({
  children,
  label,
  onClick
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-stone-100 transition hover:border-dusk-lavender/50 hover:bg-white/[0.08]"
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: Card["status"] }) {
  const meta = getStatusMeta(status);

  return <span className={cn("rounded border px-2 py-1 text-[11px]", meta.badgeClass)}>{meta.label}</span>;
}

function normalizeCalendarCard(card: CalendarCard): CalendarCard {
  return {
    ...card,
    checklist: Array.isArray(card.checklist) ? card.checklist : [],
    color: normalizeCardColor(card.color),
    dueDate: card.dueDate ? new Date(card.dueDate).toISOString() : null,
    dueDateAllDay: card.dueDateAllDay ?? false
  };
}

function formatDue(item: { dueDate: string | null; dueDateAllDay: boolean }) {
  return formatShortDue(item.dueDate, item.dueDateAllDay);
}

function formatRangeLabel(days: Array<{ date: Date }>) {
  const first = days[0]?.date;
  const last = days.at(-1)?.date;

  if (!first || !last) return "";
  if (toDateKey(first) === toDateKey(last)) {
    return formatMediumDate(first);
  }

  return `${formatShortDate(first)} - ${formatMediumDate(last)}`;
}
