"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState, useCallback } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock, ExternalLink, FileText, SlidersHorizontal, X } from "lucide-react";

import { useLiveSync } from "@/hooks/use-live-sync";
import { CardModal } from "@/components/kanban/card-modal";
import { AppModal } from "@/components/ui/app-modal";
import { Panel } from "@/components/ui/panel";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/ui/state";
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
import { AssigneeStack } from "@/components/kanban/assignee-avatar";
import { extractAssigneeIds, resolveAssignees } from "@/lib/kanban/assignees";
import { extractDifficulty } from "@/lib/kanban/difficulty";
import { extractStartDate, extractStartDateAllDay } from "@/lib/kanban/due-date";
import type { Card, CardAssignee } from "@/types/kanban";

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
  initialDiaryItems = [],
  members = [],
  currentUserId
}: {
  projectId: string;
  initialCards: CalendarCard[];
  initialNotes?: CalendarNote[];
  initialDiaryItems?: ProjectDiaryItem[];
  members?: CardAssignee[];
  currentUserId?: string;
}) {
  const [cards, setCards] = useState(initialCards);
  const [notes, setNotes] = useState(initialNotes);
  const [diaryItems, setDiaryItems] = useState(initialDiaryItems);

  const refreshCalendar = useCallback(async () => {
    try {
      const noCache = { cache: "no-store" as RequestCache, headers: { "Cache-Control": "no-cache", Pragma: "no-cache" } };
      const [cardsRes, notesRes, diaryRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/cards`, noCache),
        fetch(`/api/projects/${projectId}/notes`, noCache),
        fetch(`/api/projects/${projectId}/diary-items`, noCache)
      ]);

      if (cardsRes.ok) {
        const data = await cardsRes.json();
        if (Array.isArray(data?.cards)) {
          setCards(data.cards.map((c: any) => normalizeCalendarCard(c, members)));
        }
      }

      if (notesRes.ok) {
        const data = await notesRes.json();
        if (Array.isArray(data?.notes)) {
          const calendarNotes: CalendarNote[] = data.notes
            .filter((n: any) => Boolean(n.dueDate))
            .map((n: any) => ({
              id: n.id,
              title: n.title,
              content: n.content,
              color: normalizeCardColor(n.color),
              isStarred: Boolean(n.isStarred),
              dueDate: n.dueDate ? new Date(n.dueDate).toISOString() : new Date().toISOString(),
              dueDateAllDay: Boolean(n.dueDateAllDay)
            }));
          setNotes(calendarNotes);
        }
      }

      if (diaryRes.ok) {
        const data = await diaryRes.json();
        if (Array.isArray(data?.diaryItems)) {
          setDiaryItems(data.diaryItems.map((d: any) => ({
            ...d,
            checklist: normalizeDiaryChecklist(d.checklist, d.startDate)
          })));
        }
      }
    } catch {
      // Silent error on background sync
    }
  }, [projectId, members]);

  const { broadcastChange } = useLiveSync({
    channelKey: [`project:${projectId}`, `calendar:${projectId}`],
    intervalMs: 3000,
    canSync: () => {
      if (selectedCardId || selectedNoteId) return false;
      if (isFiltersOpen || isUpcomingOpen) return false;
      if (isUpdateConfirmOpen || isDeleteConfirmOpen) return false;
      if (typeof document !== "undefined" && document.querySelector("[role='dialog']")) return false;
      return true;
    },
    onSync: refreshCalendar
  });
  const [filters, setFilters] = useState<CalendarFilterState>(defaultCalendarFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isUpcomingOpen, setIsUpcomingOpen] = useState(false);
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

  const currentMonthLabel = useMemo(() => {
    try {
      const parts = anchorDate.split("-");
      if (parts.length >= 2) {
        const year = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const d = new Date(year, month, 1);
        return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      }
      return "";
    } catch {
      return "";
    }
  }, [anchorDate]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (!filters.showCards || !filters.showNotes || !filters.showDiaryChecklist) count++;
    const defaultStatuses = defaultCalendarFilters.statuses;
    if (
      filters.statuses.TODO !== defaultStatuses.TODO ||
      filters.statuses.DOING !== defaultStatuses.DOING ||
      filters.statuses.WAITING !== defaultStatuses.WAITING ||
      filters.statuses.DONE !== defaultStatuses.DONE
    ) {
      count++;
    }
    if (filters.noteScope !== "all") count++;
    if (filters.timeScope !== "all") count++;
    return count;
  }, [filters]);

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
      }, members);
      setCards((current) => current.map((item) => (item.id === nextCard.id ? nextCard : item)));
      setSelectedCardId(null);
      toast({ message: "Card updated.", type: "success" });
      broadcastChange();
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
        broadcastChange();
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
      broadcastChange();
    } else {
      const data = await response.json().catch(() => ({}));
      toast({ message: data.error ?? "Could not delete card.", type: "error" });
    }
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
        {/* Top Control Bar Panel */}
        <Panel className="p-4 shrink-0 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Month/Year, Range & Navigation */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender shadow-sm">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-stone-100">{currentMonthLabel}</h2>
                    <span className="rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-2.5 py-0.5 text-[11px] font-semibold text-dusk-amber">
                      {rangeLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Controls: [<] [Today] [>] */}
              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-0.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => setAnchorDate((value) => shiftDateKey(value, viewMode === "month" ? -30 : -calendarDays.length))}
                  className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 hover:bg-white/10 hover:text-stone-100 transition"
                  aria-label="Previous month or week"
                  title="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAnchorDate(todayKey)}
                  className="px-2.5 h-8 rounded-lg text-xs font-semibold text-stone-300 hover:bg-white/10 hover:text-stone-100 transition"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setAnchorDate((value) => shiftDateKey(value, viewMode === "month" ? 30 : calendarDays.length))}
                  className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 hover:bg-white/10 hover:text-stone-100 transition"
                  aria-label="Next month or week"
                  title="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right: View Switcher, Filters Toggle, Upcoming Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl
                aria-label="Calendar view"
                value={viewMode}
                items={[
                  { value: "month", label: "Month" },
                  { value: "week", label: "Week" }
                ]}
                onValueChange={(val) => setViewMode(val as CalendarViewMode)}
              />

              <button
                type="button"
                onClick={() => setIsFiltersOpen((v) => !v)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition",
                  isFiltersOpen
                    ? "border-dusk-lavender/50 bg-dusk-lavender/15 text-dusk-lavender shadow-sm"
                    : "border-white/10 bg-white/[0.03] text-stone-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-stone-100"
                )}
                aria-expanded={isFiltersOpen}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-dusk-lavender text-[9px] font-bold text-ink-950">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsUpcomingOpen((v) => !v)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition",
                  isUpcomingOpen
                    ? "border-dusk-amber/50 bg-dusk-amber/15 text-dusk-amber shadow-sm"
                    : "border-white/10 bg-white/[0.03] text-stone-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-stone-100"
                )}
                aria-expanded={isUpcomingOpen}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Upcoming</span>
                <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-semibold text-stone-400">
                  {filteredItems.length}
                </span>
              </button>
            </div>
          </div>

          {/* Horizontal Collapsible Filters Drawer */}
          {isFiltersOpen && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Sources */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Sources:</span>
                    <div className="flex items-center gap-2">
                      <FilterCheckbox label="Cards" checked={filters.showCards} onChange={(checked) => setFilters((current) => ({ ...current, showCards: checked }))} />
                      <FilterCheckbox label="Notes" checked={filters.showNotes} onChange={(checked) => setFilters((current) => ({ ...current, showNotes: checked }))} />
                      <FilterCheckbox label="Diaries" checked={filters.showDiaryChecklist} onChange={(checked) => setFilters((current) => ({ ...current, showDiaryChecklist: checked }))} />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Status:</span>
                    <div className="flex items-center gap-1.5">
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
                  </div>

                  {/* Notes Scope */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Notes:</span>
                    <FilterSelect
                      triggerClassName="h-8 text-xs"
                      value={filters.noteScope}
                      options={[
                        { value: "all", label: "All notes" },
                        { value: "starred", label: "Starred only" },
                        { value: "plain", label: "Not starred" }
                      ]}
                      onValueChange={(noteScope) => setFilters((current) => ({ ...current, noteScope }))}
                    />
                  </div>

                  {/* Time Scope */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">Time:</span>
                    <FilterSelect
                      triggerClassName="h-8 text-xs"
                      value={filters.timeScope}
                      options={[
                        { value: "all", label: "All times" },
                        { value: "allDay", label: "All-day only" },
                        { value: "timed", label: "Timed only" }
                      ]}
                      onValueChange={(timeScope) => setFilters((current) => ({ ...current, timeScope }))}
                    />
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-stone-400 hover:text-stone-200"
                    onClick={() => setFilters(defaultCalendarFilters)}
                  >
                    Reset filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </Panel>

        {/* Main Body: Full-width Calendar Grid + Collapsible Upcoming Panel */}
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          {/* Calendar Grid Container */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pr-1 scrollbar-soft">
            {filteredItems.length === 0 && calendarDays.every((day) => !(groups[day.key]?.length)) ? (
              <Panel className="grid flex-1 place-items-center p-8">
                <EmptyState
                  className="max-w-md border-dashed bg-white/[0.015] p-8"
                  title="No calendar items match"
                  message="Try widening your filters or adding due dates to tasks, notes, or diary checklists."
                />
              </Panel>
            ) : (
              <div className="lofi-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                {/* Weekday Header */}
                <div
                  className="grid border-b border-white/10 bg-white/[0.035] text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-400"
                  style={{ gridTemplateColumns: `repeat(${dayColumnCount}, minmax(0, 1fr))` }}
                >
                  {calendarDays.slice(0, dayColumnCount).map((day) => {
                    const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                    return (
                      <div key={`label-${day.key}`} className={cn("py-2.5", isWeekend ? "text-stone-500" : "text-stone-300")}>
                        {formatWeekday(day.date)}
                      </div>
                    );
                  })}
                </div>

                {/* Days Grid */}
                <div
                  className="grid min-h-0 flex-1 gap-px bg-white/10 overflow-y-auto scrollbar-soft"
                  style={{ gridTemplateColumns: `repeat(${dayColumnCount}, minmax(0, 1fr))` }}
                >
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
                          "group relative flex min-h-[110px] sm:min-h-[135px] flex-col p-2 sm:p-2.5 transition cursor-pointer",
                          current ? "bg-dusk-amber/[0.04]" : "bg-[#090817]",
                          muted ? "opacity-35 bg-[#060512]" : "hover:bg-white/[0.025]"
                        )}
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <span
                            className={cn(
                              "text-xs font-semibold transition",
                              current
                                ? "grid h-6 w-6 place-items-center rounded-full bg-dusk-amber text-ink-950 font-bold shadow-sm shadow-dusk-amber/30"
                                : muted
                                  ? "text-stone-600"
                                  : "text-stone-300 group-hover:text-stone-100"
                            )}
                          >
                            {day.date.getDate()}
                          </span>

                          {cellRenderItems.length > 3 ? (
                            <span className="rounded-full bg-dusk-lavender/10 px-2 py-0.5 text-[10px] font-semibold text-dusk-lavender group-hover:bg-dusk-lavender/20 transition">
                              +{cellRenderItems.length - 3} more
                            </span>
                          ) : null}
                        </div>

                        <div className="space-y-1.5 flex-1 min-h-0">
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
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Optional Upcoming Panel */}
          {isUpcomingOpen && (
            <Panel className="flex w-80 shrink-0 flex-col overflow-hidden p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-dusk-amber" />
                  <h3 className="text-sm font-semibold text-stone-100">Upcoming</h3>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-stone-400">
                    {filteredItems.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUpcomingOpen(false)}
                  className="rounded-lg p-1 text-stone-400 hover:bg-white/10 hover:text-stone-100 transition"
                  aria-label="Close upcoming panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-soft">
                {filteredItems.slice(0, 15).map((item) => {
                  if (item.type === "card") {
                    return <UpcomingCard key={`upcoming-card-${item.id}`} card={item} members={members} onClick={() => setSelectedCardId(item.id)} />;
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
                {filteredItems.length === 0 ? (
                  <EmptyState
                    className="border-dashed bg-white/[0.015] p-4 text-left"
                    title="No upcoming matches"
                    message="Adjust the filters or add due dates to cards, notes, and diary items."
                  />
                ) : null}
              </div>
            </Panel>
          )}
        </div>
      </div>

      {selectedCard ? (
        <CardModal
          card={selectedCard}
          mode="edit"
          open={Boolean(selectedCard)}
          members={members}
          currentUserId={currentUserId}
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
                  <EmptyState
                    className="border-dashed bg-white/[0.01] py-12"
                    title="No day matches"
                    message="This day has no visible cards, notes, or diary checklist items for the current filters."
                  />
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
                              {isCard && (
                                <>
                                  {(item as CalendarCard).description && (
                                    <p className="mt-1 line-clamp-2 text-xs text-stone-400 leading-relaxed">
                                      {(item as CalendarCard).description}
                                    </p>
                                  )}
                                  {((item as CalendarCard).assignees?.length || (item as CalendarCard).assigneeIds?.length) ? (
                                    <div className="mt-2 flex items-center gap-2">
                                      <AssigneeStack
                                        assignees={
                                          (item as CalendarCard).assignees && (item as CalendarCard).assignees!.length > 0
                                            ? (item as CalendarCard).assignees!
                                            : resolveAssignees((item as CalendarCard).assigneeIds, members)
                                        }
                                        size={20}
                                      />
                                    </div>
                                  ) : null}
                                </>
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
  const status = getStatusMeta(card.status);

  return (
    <button
      className={cn(
        "group/pill flex w-full items-center gap-1.5 rounded-md border px-2 py-1 text-left text-xs transition",
        "hover:scale-[1.01] hover:border-white/25 hover:shadow-sm",
        colorMeta.softClass
      )}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={`${card.title} • ${status.label}${card.dueDate ? ` • ${card.dueDateAllDay ? "All day" : formatTime(card.dueDate)}` : ""}`}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full border", status.badgeClass)} />
      <span className="truncate font-medium text-stone-200 flex-1">{card.title}</span>
      {!card.dueDateAllDay && card.dueDate && (
        <span className="shrink-0 text-[10px] text-dusk-cyan">
          {formatTime(card.dueDate)}
        </span>
      )}
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
  const allDone = item.completedCount === item.totalCount && item.totalCount > 0;

  return (
    <button
      className={cn(
        "group/pill flex w-full items-center gap-1.5 rounded-md border px-2 py-1 text-left text-xs transition hover:scale-[1.01] hover:border-white/25",
        colorMeta.softClass
      )}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={`Diary: ${item.diaryTitle} (${item.completedCount}/${item.totalCount})`}
    >
      <span className="text-[11px] shrink-0">📖</span>
      <span className={cn("truncate font-medium text-stone-200 flex-1", allDone && "line-through text-stone-400")}>
        {item.diaryTitle}
      </span>
      <span
        className={cn(
          "shrink-0 rounded px-1 text-[9px] font-semibold font-mono",
          allDone ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-stone-300"
        )}
      >
        {item.completedCount}/{item.totalCount}
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

function CalendarNotePill({ note, onClick }: { note: CalendarNote; onClick: () => void }) {
  const colorMeta = getCardColorMeta(note.color);

  return (
    <button
      className={cn(
        "group/pill flex w-full items-center gap-1.5 rounded-md border px-2 py-1 text-left text-xs transition hover:scale-[1.01] hover:border-white/25",
        colorMeta.softClass
      )}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={note.title}
    >
      <FileText className="h-3 w-3 shrink-0 text-dusk-amber" />
      <span className="truncate font-medium text-stone-200 flex-1">{note.title}</span>
      {!note.dueDateAllDay && note.dueDate && (
        <span className="shrink-0 text-[10px] text-dusk-amber">
          {formatTime(note.dueDate)}
        </span>
      )}
    </button>
  );
}

function CalendarNoteButton({ note, onClick }: { note: CalendarNote; onClick: () => void }) {
  return <CalendarNotePill note={note} onClick={onClick} />;
}

function UpcomingCard({ card, members = [], onClick }: { card: CalendarCard; members?: CardAssignee[]; onClick: () => void }) {
  const colorMeta = getCardColorMeta(card.color);
  const assignees = (card.assignees && card.assignees.length > 0) ? card.assignees : resolveAssignees(card.assigneeIds, members);

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
      <div className="mt-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-dusk-cyan">{formatDue(card)}</p>
          <p className="mt-0.5 text-xs text-stone-500">{card.column.name}</p>
        </div>
        {assignees.length > 0 ? <AssigneeStack assignees={assignees} size={18} /> : null}
      </div>
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

function normalizeCalendarCard(card: CalendarCard, members: CardAssignee[] = []): CalendarCard {
  const privateCoins = card.privateCoins;
  const assigneeIds = (card.assigneeIds && card.assigneeIds.length > 0)
    ? card.assigneeIds
    : extractAssigneeIds(privateCoins);
  const difficulty = card.difficulty !== undefined && card.difficulty !== null
    ? card.difficulty
    : extractDifficulty(privateCoins);
  const startDate = card.startDate !== undefined
    ? card.startDate
    : extractStartDate(privateCoins);
  const startDateAllDay = card.startDateAllDay !== undefined
    ? card.startDateAllDay
    : extractStartDateAllDay(privateCoins);

  return {
    ...card,
    checklist: Array.isArray(card.checklist) ? card.checklist : [],
    color: normalizeCardColor(card.color),
    startDate,
    startDateAllDay,
    dueDate: card.dueDate ? new Date(card.dueDate).toISOString() : null,
    dueDateAllDay: card.dueDateAllDay ?? false,
    difficulty,
    assigneeIds,
    assignees: (card.assignees && card.assignees.length > 0)
      ? card.assignees
      : resolveAssignees(assigneeIds, members)
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
