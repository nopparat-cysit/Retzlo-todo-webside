"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, KanbanSquare, Plus, Settings, Users } from "lucide-react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommandItem {
  id: string;
  label: string;
  group: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
}

interface CommandGroup {
  label: string;
  items: CommandItem[];
}

interface CommandPaletteProps {
  projectId?: string;
  projectName?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommandPalette({ projectId, projectName }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Build command list ────────────────────────────────────────────────────

  const allGroups: CommandGroup[] = [];

  if (projectId) {
    allGroups.push({
      label: "Navigation",
      items: [
        {
          id: "board",
          label: "Go to Board",
          group: "Navigation",
          icon: <KanbanSquare className="h-4 w-4 text-dusk-lavender" />,
          href: `/project/${projectId}/board`,
        },
        {
          id: "calendar",
          label: "Go to Calendar",
          group: "Navigation",
          icon: <CalendarDays className="h-4 w-4 text-dusk-cyan" />,
          href: `/project/${projectId}/calendar`,
        },
        {
          id: "members",
          label: "Go to Members",
          group: "Navigation",
          icon: <Users className="h-4 w-4 text-dusk-amber" />,
          href: `/project/${projectId}/members`,
        },
        {
          id: "settings",
          label: "Go to Settings",
          group: "Navigation",
          icon: <Settings className="h-4 w-4 text-dusk-rose" />,
          href: `/project/${projectId}/settings`,
        },
      ],
    });
  }

  allGroups.push({
    label: "Actions",
    items: [
      {
        id: "new-card",
        label: "New Card",
        group: "Actions",
        icon: <Plus className="h-4 w-4 text-dusk-lavender" />,
        action: () => {
          // Placeholder: board modal integration comes later
          setOpen(false);
        },
      },
      {
        id: "back-projects",
        label: "Back to Projects",
        group: "Actions",
        icon: <ArrowLeft className="h-4 w-4 text-stone-400" />,
        href: "/projects",
      },
    ],
  });

  // ── Filter by query ───────────────────────────────────────────────────────

  const filteredGroups: CommandGroup[] = allGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  const flatItems: CommandItem[] = filteredGroups.flatMap((g) => g.items);

  // ── Keyboard shortcut to open/close ──────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Focus input on open ───────────────────────────────────────────────────

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      // rAF so the element is in the DOM before focusing
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // ── Keyboard navigation inside palette ───────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = flatItems[selectedIndex];
        if (!item) return;
        activateItem(item);
      }
    },
    [flatItems, selectedIndex] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function activateItem(item: CommandItem) {
    if (item.href) {
      router.push(item.href);
      setOpen(false);
    } else if (item.action) {
      item.action();
    }
  }

  // Reset selected index when query or list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[200] flex items-start justify-center bg-ink-950/70 pt-[18vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      {/* Panel */}
      <div
        className="lofi-panel w-full max-w-lg overflow-hidden rounded-xl p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="relative flex items-center border-b border-dusk-lavender/20">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls="command-palette-results"
            aria-activedescendant={
              flatItems[selectedIndex] ? `cmd-item-${flatItems[selectedIndex].id}` : undefined
            }
            placeholder={
              projectName ? `Search in ${projectName}…` : "Type a command or search…"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border-0 bg-transparent px-4 py-3.5 text-base text-stone-100 outline-none placeholder:text-stone-500"
          />
        </div>

        {/* Results */}
        <ul
          id="command-palette-results"
          role="listbox"
          className="scrollbar-soft max-h-80 overflow-y-auto"
        >
          {filteredGroups.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-stone-500">
              No commands found.
            </li>
          )}

          {filteredGroups.map((group) => {
            // Track flat index for correct keyboard highlighting
            let flatOffset = 0;
            for (const g of filteredGroups) {
              if (g.label === group.label) break;
              flatOffset += g.items.length;
            }

            return (
              <li key={group.label}>
                {/* Group label */}
                <p
                  role="presentation"
                  className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-stone-500"
                >
                  {group.label}
                </p>

                {/* Group items */}
                <ul role="group" aria-label={group.label}>
                  {group.items.map((item, idx) => {
                    const absoluteIndex = flatOffset + idx;
                    const isSelected = absoluteIndex === selectedIndex;

                    return (
                      <li
                        key={item.id}
                        id={`cmd-item-${item.id}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => activateItem(item)}
                        onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-stone-200 transition-colors",
                          isSelected
                            ? "border-l-2 border-dusk-lavender bg-dusk-lavender/15"
                            : "border-l-2 border-transparent hover:bg-dusk-lavender/10"
                        )}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-white/5 px-4 py-2">
          <p className="text-[10px] text-stone-600">
            <span className="mr-0.5">↑↓</span> navigate ·{" "}
            <span className="mr-0.5">Enter</span> select ·{" "}
            <span className="mr-0.5">Esc</span> close
          </p>
        </div>
      </div>
    </div>
  );
}
