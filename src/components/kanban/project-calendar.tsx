"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock, ExternalLink, FileText, SlidersHorizontal } from "lucide-react";

import { CardModal } from "@/components/kanban/card-modal";
import { Panel } from "@/components/ui/panel";
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

export interface CalendarCard extends Card {
  column: {
    name: string;
    boardId: string;
  };
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
  initialNotes = []
}: {
  projectId: string;
  initialCards: CalendarCard[];
  initialNotes?: CalendarNote[];
}) {
  const [cards, setCards] = useState(initialCards);
  const [notes] = useState(initialNotes);
  const [filters, setFilters] = useState<CalendarFilterState>(defaultCalendarFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [customDays, setCustomDays] = useState(5);
  const [anchorDate, setAnchorDate] = useState(() => toDateKey(new Date()));
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? null;
  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null;
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const calendarDays = useMemo(
    () => buildCalendarDays({ anchorDate, mode: viewMode, customDays }),
    [anchorDate, customDays, viewMode]
  );
  const allItems = useMemo<CalendarEntry[]>(
    () => [
      ...cards
        .filter((card): card is CalendarCard & { dueDate: string } => Boolean(card.dueDate))
        .map((card) => ({ ...card, type: "card" as const })),
      ...notes.map((note) => ({ ...note, type: "note" as const }))
    ],
    [cards, notes]
  );
  const filteredItems = useMemo(() => filterCalendarItems(allItems, filters), [allItems, filters]);
  const groups = useMemo(() => groupCalendarItems(filteredItems), [filteredItems]);
  const rangeLabel = formatRangeLabel(calendarDays);
  const dayColumnCount = viewMode === "month" ? 7 : calendarDays.length;

  async function saveCard(
    card: CalendarCard,
    payload: {
      title: string;
      description: string | null;
      status: Card["status"];
      color: Card["color"];
      checklist: Card["checklist"];
      dueDate: string | null;
      dueDateAllDay: boolean;
    }
  ) {
    const response = await fetch("/api/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: card.id,
        ...payload
      })
    });
    const data = (await response.json()) as { card?: Card };

    if (data.card) {
      const nextCard = normalizeCalendarCard({
        ...card,
        ...data.card
      });
      setCards((current) => current.map((item) => (item.id === nextCard.id ? nextCard : item)));
      setSelectedCardId(null);
    }
  }

  async function deleteCard(cardId: string) {
    const response = await fetch(`/api/cards?cardId=${cardId}`, {
      method: "DELETE"
    });

    if (response.ok) {
      setCards((current) => current.filter((card) => card.id !== cardId));
      setSelectedCardId(null);
    }
  }

  return (
    <>
      <div className="grid h-full min-h-0 gap-4 overflow-y-auto pr-1 scrollbar-soft xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <Panel className="p-5">
          <button
            aria-expanded={isFiltersOpen}
            className="flex w-full items-center justify-between gap-3 text-left"
            type="button"
            onClick={() => setIsFiltersOpen((current) => !current)}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-dusk-lavender" />
              <div>
                <h3 className="font-semibold">Calendar Filters</h3>
                <p className="text-xs text-stone-500">Choose what appears.</p>
              </div>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-stone-500 transition", !isFiltersOpen && "-rotate-90")} />
          </button>

          {isFiltersOpen ? <div className="mt-5 space-y-5">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-stone-500">Sources</p>
              <FilterCheckbox label="Cards" checked={filters.showCards} onChange={(checked) => setFilters((current) => ({ ...current, showCards: checked }))} />
              <FilterCheckbox label="Notes" checked={filters.showNotes} onChange={(checked) => setFilters((current) => ({ ...current, showNotes: checked }))} />
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
              <select
                className="h-10 w-full rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
                value={filters.noteScope}
                onChange={(event) => setFilters((current) => ({ ...current, noteScope: event.target.value as CalendarFilterState["noteScope"] }))}
              >
                <option value="all">All notes</option>
                <option value="starred">Starred only</option>
                <option value="plain">Not starred</option>
              </select>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-stone-500">Time</p>
              <select
                className="h-10 w-full rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
                value={filters.timeScope}
                onChange={(event) => setFilters((current) => ({ ...current, timeScope: event.target.value as CalendarFilterState["timeScope"] }))}
              >
                <option value="all">All times</option>
                <option value="allDay">All-day only</option>
                <option value="timed">Timed only</option>
              </select>
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
              <input
                className="h-10 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
                type="date"
                value={anchorDate}
                onChange={(event) => setAnchorDate(event.target.value)}
              />
              <select
                className="h-10 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
                value={viewMode}
                onChange={(event) => setViewMode(event.target.value as CalendarViewMode)}
              >
                <option value="month">Month</option>
                <option value="day3">3 days</option>
                <option value="day5">5 days</option>
                <option value="week">7 days</option>
                <option value="custom">Custom</option>
              </select>
              {viewMode === "custom" ? (
                <input
                  className="h-10 w-20 rounded-md border border-white/10 bg-ink-950/60 px-3 text-sm text-stone-100 outline-none focus:border-dusk-lavender/70"
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

                  return (
                    <section
                      key={key}
                      className={cn(
                        "min-h-36 rounded-md border p-2",
                        current ? "border-dusk-amber/50 bg-dusk-amber/10" : "border-white/10 bg-ink-950/45",
                        muted && "opacity-55"
                      )}
                    >
                      <h3 className="mb-2 text-sm font-semibold text-stone-200">{day.date.getDate()}</h3>
                      <div className="space-y-1.5">
                        {datedItems.slice(0, 3).map((entry) => (
                          entry.type === "card" ? (
                            <CalendarCardButton key={`card-${entry.id}`} card={entry} onClick={() => setSelectedCardId(entry.id)} />
                          ) : (
                            <CalendarNoteButton key={`note-${entry.id}`} note={entry} onClick={() => setSelectedNoteId(entry.id)} />
                          )
                        ))}
                        {datedItems.length > 3 ? (
                          <p className="text-xs text-stone-500">+{datedItems.length - 3} more</p>
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
            {filteredItems.slice(0, 10).map((item) =>
              item.type === "card" ? (
                <UpcomingCard key={`upcoming-card-${item.id}`} card={item} onClick={() => setSelectedCardId(item.id)} />
              ) : (
                <UpcomingNote key={`upcoming-note-${item.id}`} note={item} onClick={() => setSelectedNoteId(item.id)} />
              )
            )}
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
          onDelete={() => deleteCard(selectedCard.id)}
          onSubmit={(payload) => saveCard(selectedCard, payload)}
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
      {selectedNote ? (
        <div className="fixed inset-0 z-[180] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
          <div className="lofi-panel w-full max-w-lg rounded-lg p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">Calendar Note</p>
                <h2 className="mt-1 text-2xl font-semibold">{selectedNote.title}</h2>
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
          </div>
        </div>
      ) : null}
    </>
  );
}

type CalendarEntry = (CalendarCard & { type: "card"; dueDate: string }) | (CalendarNote & { type: "note" });

function CalendarCardButton({ card, onClick }: { card: CalendarCard; onClick: () => void }) {
  const colorMeta = getCardColorMeta(card.color);

  return (
    <button
      className={cn("block w-full rounded border px-2 py-1.5 text-left text-xs hover:border-dusk-lavender/60", colorMeta.softClass)}
      type="button"
      onClick={onClick}
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

function CalendarNoteButton({ note, onClick }: { note: CalendarNote; onClick: () => void }) {
  const colorMeta = getCardColorMeta(note.color);

  return (
    <button
      className={cn("block w-full rounded border px-2 py-1.5 text-left text-xs hover:border-dusk-amber/60", colorMeta.softClass)}
      type="button"
      onClick={onClick}
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
