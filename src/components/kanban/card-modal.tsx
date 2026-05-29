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
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { CalendarClock, CheckSquare, GripVertical, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { applyDueShortcut, composeDueDate } from "@/lib/kanban/due-date";
import { getStatusMeta, statusOptions } from "@/lib/kanban/status";
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
    status: CardStatus;
    color: CardColor;
    checklist: ChecklistItem[];
    dueDate: string | null;
    dueDateAllDay: boolean;
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
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card?.checklist ?? []);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!open) {
      return;
    }

    setDate(dateValue(card));
    setTime(timeValue(card));
    setSelectedStatus(card?.status ?? "TODO");
    setSelectedColor(normalizeCardColor(card?.color));
    setChecklist(card?.checklist ?? []);
    setNewChecklistItem("");
  }, [card, open]);

  if (!open) {
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

    await onSubmit({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      status: selectedStatus,
      color: selectedColor,
      checklist,
      dueDate: due.dueDate,
      dueDateAllDay: due.dueDateAllDay
    });
    setIsSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
      <form className="lofi-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg p-5" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-dusk-amber">{mode === "create" ? "New card" : "Edit card"}</p>
            <h2 className="mt-1 text-2xl font-semibold">{mode === "create" ? "Create card" : "Card details"}</h2>
          </div>
          <button className="rounded-md p-2 text-stone-400 hover:bg-white/10 hover:text-stone-100" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <Input name="title" defaultValue={card?.title ?? ""} placeholder="Card title" required />
          <Textarea name="description" defaultValue={card?.description ?? ""} placeholder="Details, links, context..." />
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

        <div className="mt-5 flex justify-end gap-2">
          {footerAction}
          {mode === "edit" && onDelete ? (
            <Button type="button" variant="danger" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete card
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isSaving}>{isSaving ? "Saving..." : "Save card"}</Button>
        </div>
      </form>
    </div>
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
      <span>Card color</span>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {cardColorOptions.map((option) => {
          const meta = getCardColorMeta(option.value);

          return (
            <button
              key={option.value}
              className={cn(
                "grid h-10 place-items-center rounded-md border transition hover:scale-[1.03]",
                selectedColor === option.value ? "border-dusk-amber bg-white/10 ring-2 ring-dusk-amber/40" : "border-white/10 bg-white/[0.035]"
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
