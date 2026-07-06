"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ProjectNavLink, type NavIconName } from "@/components/project/project-nav-link";
import { cn } from "@/lib/utils";

export interface ProjectNavItem {
  href: string;
  iconName: NavIconName;
  label: string;
  segment: string;
}

export function ProjectSortableNav({
  canSort,
  items,
  projectId
}: {
  canSort: boolean;
  items: ProjectNavItem[];
  projectId: string;
}) {
  const storageKey = `retrod:project-nav-order:${projectId}`;
  const [orderedSegments, setOrderedSegments] = useState<string[]>(() => items.map((item) => item.segment));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    const savedOrder = window.localStorage.getItem(storageKey);
    if (!savedOrder) return;

    try {
      const parsed = JSON.parse(savedOrder) as string[];
      if (Array.isArray(parsed)) {
        setOrderedSegments(parsed);
      }
    } catch {}
  }, [storageKey]);

  const orderedItems = useMemo(() => {
    const itemMap = new Map(items.map((item) => [item.segment, item]));
    const sorted = orderedSegments
      .map((segment) => itemMap.get(segment))
      .filter((item): item is ProjectNavItem => Boolean(item));
    const missing = items.filter((item) => !orderedSegments.includes(item.segment));

    return [...sorted, ...missing];
  }, [items, orderedSegments]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const current = orderedItems.map((item) => item.segment);
    const oldIndex = current.indexOf(String(active.id));
    const newIndex = current.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(current, oldIndex, newIndex);
    setOrderedSegments(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  if (!canSort) {
    return (
      <nav className="grid gap-2" aria-label="Project navigation">
        {orderedItems.map((item) => (
          <ProjectNavLink key={item.segment} {...item} />
        ))}
      </nav>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedItems.map((item) => item.segment)} strategy={verticalListSortingStrategy}>
        <nav className="grid gap-2" aria-label="Project navigation">
          {orderedItems.map((item) => (
            <SortableNavItem key={item.segment} item={item} />
          ))}
        </nav>
      </SortableContext>
    </DndContext>
  );
}

function SortableNavItem({ item }: { item: ProjectNavItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.segment
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group/sort relative w-full", isDragging && "z-20 opacity-80")}
    >
      <ProjectNavLink {...item} />
      <button
        suppressHydrationWarning
        type="button"
        aria-label={`Reorder ${item.label}`}
        title={`Reorder ${item.label}`}
        className="sidebar-expanded-only absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 cursor-grab place-items-center rounded-md text-stone-600 opacity-0 transition hover:bg-white/10 hover:text-dusk-lavender group-hover/sort:opacity-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
