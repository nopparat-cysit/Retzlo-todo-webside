"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  KanbanSquare,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  Zap
} from "lucide-react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
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

interface SearchResults {
  cards: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    column: { name: string; board: { name: string } };
  }>;
  notes: Array<{
    id: string;
    title: string;
    emoji: string;
  }>;
  boards: Array<{
    id: string;
    name: string;
    isPrivate: boolean;
  }>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommandPalette({ projectId, projectName }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResults>({
    cards: [],
    notes: [],
    boards: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Debounced Search ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId || query.trim().length < 2) {
      setSearchResults({ cards: [], notes: [], boards: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = (await res.json()) as SearchResults;
          setSearchResults(data);
        }
      } catch {
        // Silent error
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, projectId]);

  // ── Build command groups ──────────────────────────────────────────────────
  const allGroups: CommandGroup[] = [];

  // Search Results Groups
  if (searchResults.cards.length > 0) {
    allGroups.push({
      label: `Cards (${searchResults.cards.length})`,
      items: searchResults.cards.map((c) => ({
        id: `card-${c.id}`,
        label: c.title,
        sublabel: `${c.column.board.name} → ${c.column.name} • ${c.status}`,
        group: "Cards",
        icon: <KanbanSquare className="h-4 w-4 text-dusk-lavender" />,
        action: () => {
          setOpen(false);
          router.push(`/project/${projectId}/board?cardId=${c.id}`);
        }
      }))
    });
  }

  if (searchResults.notes.length > 0) {
    allGroups.push({
      label: `Notes (${searchResults.notes.length})`,
      items: searchResults.notes.map((n) => ({
        id: `note-${n.id}`,
        label: `${n.emoji || "📝"} ${n.title}`,
        group: "Notes",
        icon: <FileText className="h-4 w-4 text-dusk-cyan" />,
        action: () => {
          setOpen(false);
          router.push(`/project/${projectId}/notes`);
        }
      }))
    });
  }

  if (searchResults.boards.length > 0) {
    allGroups.push({
      label: `Boards (${searchResults.boards.length})`,
      items: searchResults.boards.map((b) => ({
        id: `board-${b.id}`,
        label: b.name,
        sublabel: b.isPrivate ? "🔒 Private board" : "🌐 Public board",
        group: "Boards",
        icon: <LayoutGrid className="h-4 w-4 text-dusk-amber" />,
        action: () => {
          setOpen(false);
          router.push(`/project/${projectId}/board?boardId=${b.id}`);
        }
      }))
    });
  }

  // Navigation Group
  if (projectId) {
    allGroups.push({
      label: "Navigation",
      items: [
        {
          id: "nav-board",
          label: "Go to Kanban Board",
          group: "Navigation",
          icon: <KanbanSquare className="h-4 w-4 text-dusk-lavender" />,
          href: `/project/${projectId}/board`
        },
        {
          id: "nav-calendar",
          label: "Go to Calendar",
          group: "Navigation",
          icon: <CalendarDays className="h-4 w-4 text-dusk-cyan" />,
          href: `/project/${projectId}/calendar`
        },
        {
          id: "nav-notes",
          label: "Go to Note Studio",
          group: "Navigation",
          icon: <FileText className="h-4 w-4 text-dusk-lavender" />,
          href: `/project/${projectId}/notes`
        },
        {
          id: "nav-members",
          label: "Go to Members",
          group: "Navigation",
          icon: <Users className="h-4 w-4 text-dusk-amber" />,
          href: `/project/${projectId}/members`
        },
        {
          id: "nav-settings",
          label: "Go to Project Settings",
          group: "Navigation",
          icon: <Settings className="h-4 w-4 text-dusk-rose" />,
          href: `/project/${projectId}/settings`
        }
      ]
    });
  }

  // Actions Group
  allGroups.push({
    label: "Actions",
    items: [
      {
        id: "act-new-card",
        label: "Create New Task",
        sublabel: "Press N on board for Quick Add",
        group: "Actions",
        icon: <Plus className="h-4 w-4 text-dusk-lavender" />,
        action: () => {
          setOpen(false);
          if (projectId) {
            router.push(`/project/${projectId}/board`);
            window.dispatchEvent(new CustomEvent("focus-quick-add"));
          }
        }
      },
      {
        id: "act-focus-mode",
        label: "Toggle Focus Mode",
        sublabel: "Press F anytime to toggle",
        group: "Actions",
        icon: <Zap className="h-4 w-4 text-amber-400" />,
        action: () => {
          setOpen(false);
          document.body.classList.toggle("focus-mode");
          window.dispatchEvent(
            new CustomEvent("focus-mode-toggle", {
              detail: { isFocusMode: document.body.classList.contains("focus-mode") }
            })
          );
        }
      },
      {
        id: "act-back-projects",
        label: "Back to Workspace Dashboard",
        group: "Actions",
        icon: <ArrowLeft className="h-4 w-4 text-stone-400" />,
        href: "/projects"
      }
    ]
  });

  // Filter groups by query when not displaying direct search results
  const filteredGroups: CommandGroup[] = allGroups
    .map((group) => {
      // Don't re-filter search results that came directly from the backend
      if (group.label.startsWith("Cards") || group.label.startsWith("Notes") || group.label.startsWith("Boards")) {
        return group;
      }
      return {
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            (item.sublabel && item.sublabel.toLowerCase().includes(query.toLowerCase()))
        )
      };
    })
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

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[200] flex items-start justify-center bg-ink-950/75 pt-[16vh] backdrop-blur-md"
      onClick={() => setOpen(false)}
    >
      {/* Panel */}
      <div
        className="lofi-panel w-full max-w-lg overflow-hidden rounded-2xl p-0 shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="relative flex items-center border-b border-white/10 px-3">
          <Search className="h-4 w-4 text-stone-500 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls="command-palette-results"
            placeholder={
              projectName ? `Search tasks, notes, boards in ${projectName}…` : "Type a command or search…"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border-0 bg-transparent px-3 py-3.5 text-sm text-stone-100 outline-none placeholder:text-stone-500"
          />
          {isSearching && (
            <span className="text-[10px] text-stone-500 animate-pulse font-mono shrink-0 mr-2">
              searching...
            </span>
          )}
        </div>

        {/* Results */}
        <ul
          id="command-palette-results"
          role="listbox"
          className="scrollbar-soft max-h-84 overflow-y-auto p-1.5 space-y-1"
        >
          {filteredGroups.length === 0 && (
            <li className="px-4 py-8 text-center text-xs text-stone-500">
              No matching tasks, notes, or commands found.
            </li>
          )}

          {filteredGroups.map((group) => {
            let flatOffset = 0;
            for (const g of filteredGroups) {
              if (g.label === group.label) break;
              flatOffset += g.items.length;
            }

            return (
              <li key={group.label} className="space-y-0.5">
                {/* Group label */}
                <p
                  role="presentation"
                  className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-stone-500 font-semibold"
                >
                  {group.label}
                </p>

                {/* Group items */}
                <ul role="group" aria-label={group.label} className="space-y-0.5">
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
                          "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs transition-colors",
                          isSelected
                            ? "bg-dusk-lavender/15 text-stone-100 border border-dusk-lavender/30"
                            : "text-stone-300 hover:bg-white/[0.04] border border-transparent"
                        )}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                          {item.icon}
                        </span>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-medium truncate">{item.label}</span>
                          {item.sublabel && (
                            <span className="text-[10px] text-stone-400 truncate">
                              {item.sublabel}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 bg-white/[0.01]">
          <p className="text-[10px] text-stone-500">
            <span className="mr-0.5 font-mono">↑↓</span> navigate ·{" "}
            <span className="mr-0.5 font-mono">Enter</span> select ·{" "}
            <span className="mr-0.5 font-mono">Esc</span> close
          </p>
          <span className="text-[10px] text-stone-600 font-mono">Ctrl + K</span>
        </div>
      </div>
    </div>
  );
}
