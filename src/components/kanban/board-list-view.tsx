"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Coins,
  Edit2,
  FileText,
  ListFilter,
  MoreVertical,
  Paperclip,
  Plus,
  Search,
  Sparkles,
  Star,
  Table2,
  Trash2,
  User as UserIcon,
  X,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Card, CardAssignee, CardPriority, CardStatus, ColumnWithCards } from "@/types/kanban";
import { playCardDoneSound } from "@/lib/sound";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getColumnThemeOption } from "@/lib/kanban/column-settings";

function checkIsOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  return !isNaN(d.getTime()) && d.getTime() < Date.now();
}

function formatTableDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function toInputDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

interface BoardListViewProps {
  columns: ColumnWithCards[];
  allColumns: ColumnWithCards[];
  members: CardAssignee[];
  currentUserId?: string;
  onEditCard: (card: Card) => void;
  onCreateCard: (columnId: string, title: string) => Promise<void> | void;
  onCardDeleted?: (cardId: string) => void;
  onCardSaved?: (card: Card) => void;
}

// Priority mapping with P0, P1, P2 matching user spreadsheet reference
const PRIORITY_CONFIG: Record<
  CardPriority,
  {
    code: string;
    label: string;
    shortLabel: string;
    icon: typeof ArrowUp;
    pillClass: string;
  }
> = {
  HIGH: {
    code: "P0",
    label: "P0 (High / Urgent)",
    shortLabel: "High",
    icon: ArrowUp,
    pillClass:
      "border-red-500/30 bg-red-500/15 text-red-600 dark:border-red-400/30 dark:bg-red-500/20 dark:text-red-300"
  },
  MEDIUM: {
    code: "P1",
    label: "P1 (Medium)",
    shortLabel: "Medium",
    icon: ArrowRight,
    pillClass:
      "border-indigo-500/30 bg-indigo-500/15 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-300"
  },
  LOW: {
    code: "P2",
    label: "P2 (Low)",
    shortLabel: "Low",
    icon: ArrowDown,
    pillClass:
      "border-sky-500/30 bg-sky-500/15 text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-300"
  }
};

// Status mapping matching user spreadsheet reference pills
const STATUS_PILL_CONFIG: Record<
  CardStatus,
  {
    label: string;
    pillClass: string;
    dotClass: string;
  }
> = {
  DONE: {
    label: "Done",
    pillClass:
      "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300",
    dotClass: "bg-emerald-500"
  },
  DOING: {
    label: "In Progress",
    pillClass:
      "border-amber-500/30 bg-amber-500/15 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-300",
    dotClass: "bg-amber-500 animate-pulse"
  },
  TODO: {
    label: "To Do",
    pillClass:
      "border-blue-500/30 bg-blue-500/15 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-300",
    dotClass: "bg-blue-500"
  },
  WAITING: {
    label: "Review",
    pillClass:
      "border-purple-500/30 bg-purple-500/15 text-purple-700 dark:border-purple-400/30 dark:bg-purple-500/20 dark:text-purple-300",
    dotClass: "bg-purple-500"
  }
};

export function BoardListView({
  columns,
  allColumns,
  members,
  currentUserId,
  onEditCard,
  onCreateCard,
  onCardDeleted,
  onCardSaved
}: BoardListViewProps) {
  const { toast } = useToast();

  // View presentation mode: "table" (Spreadsheet flat grid) vs "grouped" (Column accordions)
  const [displayMode, setDisplayMode] = useState<"table" | "grouped">("table");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Table filters & sorting
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"title" | "priority" | "status" | "dueDate" | "startDate" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Quick inline creation
  const [addingInColumnId, setAddingInColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [bottomNewTitle, setBottomNewTitle] = useState("");
  const [bottomSelectedColumnId, setBottomSelectedColumnId] = useState<string>(columns[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline title editing
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");

  // Delete confirmation modal state
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [isDeletingCard, setIsDeletingCard] = useState(false);

  // Date editing state
  const [editingDateCardId, setEditingDateCardId] = useState<string | null>(null);
  const [editingDateField, setEditingDateField] = useState<"startDate" | "dueDate" | null>(null);

  const toggleGroup = (columnId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const handleSort = (field: "title" | "priority" | "status" | "dueDate" | "startDate") => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Quick add from group header or bottom row
  const handleQuickAdd = async (columnId: string, customTitle?: string) => {
    const title = (customTitle ?? newCardTitle).trim();
    if (!title || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onCreateCard(columnId, title);
      setNewCardTitle("");
      setBottomNewTitle("");
      setAddingInColumnId(null);
      toast({ message: "Task created successfully!", type: "success" });
    } catch {
      toast({ message: "Failed to create task.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle card complete with audio feedback
  const handleToggleCardComplete = async (card: Card, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isDone = card.status === "DONE";
    const nextStatus: CardStatus = isDone ? "TODO" : "DONE";

    const targetCol =
      allColumns.find((c) => c.defaultCardStatus === nextStatus) ||
      (nextStatus === "DONE" ? allColumns[allColumns.length - 1] : allColumns[0]);

    if (!targetCol) return;

    if (!isDone) {
      playCardDoneSound();
    }

    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          status: nextStatus,
          columnId: targetCol.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.card && onCardSaved) {
          onCardSaved(data.card);
        }
        toast({
          message: isDone ? "Marked as incomplete" : "Completed task! 🌟",
          type: "success"
        });
      } else {
        toast({ message: "Failed to update status", type: "error" });
      }
    } catch {
      toast({ message: "Network error updating task", type: "error" });
    }
  };

  // Direct move column / status
  const handleMoveColumn = async (card: Card, targetColumn: ColumnWithCards) => {
    if (card.columnId === targetColumn.id) return;
    const nextStatus = targetColumn.defaultCardStatus || card.status;

    if (nextStatus === "DONE" && card.status !== "DONE") {
      playCardDoneSound();
    }

    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          status: nextStatus,
          columnId: targetColumn.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.card && onCardSaved) {
          onCardSaved(data.card);
        }
        toast({ message: `Moved to ${targetColumn.name}`, type: "success" });
      } else {
        toast({ message: "Failed to move card", type: "error" });
      }
    } catch {
      toast({ message: "Network error moving card", type: "error" });
    }
  };

  // Direct priority update
  const handleUpdatePriority = async (card: Card, priority: CardPriority) => {
    if (card.priority === priority) return;
    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, priority })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.card && onCardSaved) {
          onCardSaved(data.card);
        }
        toast({ message: `Priority set to ${PRIORITY_CONFIG[priority].code}`, type: "success" });
      } else {
        toast({ message: "Failed to update priority", type: "error" });
      }
    } catch {
      toast({ message: "Network error updating priority", type: "error" });
    }
  };

  // Direct assignee update
  const handleUpdateAssignee = async (card: Card, memberId: string | null) => {
    try {
      const assigneeIds = memberId ? [memberId] : [];
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, assigneeIds })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.card && onCardSaved) {
          onCardSaved(data.card);
        }
        toast({ message: memberId ? "Assignee updated" : "Unassigned task", type: "success" });
      } else {
        toast({ message: "Failed to update assignee", type: "error" });
      }
    } catch {
      toast({ message: "Network error updating assignee", type: "error" });
    }
  };

  // Direct star toggle
  const handleToggleStar = async (card: Card, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextStar = !card.isStarred;
    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, isStarred: nextStar })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.card && onCardSaved) {
          onCardSaved(data.card);
        }
        toast({ message: nextStar ? "Starred task ⭐" : "Unstarred task", type: "success" });
      }
    } catch {}
  };

  // Direct inline title rename
  const handleSaveTitle = async (card: Card) => {
    const trimmed = editingTitleValue.trim();
    if (!trimmed || trimmed === card.title) {
      setEditingCardId(null);
      return;
    }
    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, title: trimmed })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.card && onCardSaved) {
          onCardSaved(data.card);
        }
        toast({ message: "Task renamed", type: "success" });
      }
    } finally {
      setEditingCardId(null);
    }
  };

  // Direct date update
  const handleSaveDate = async (card: Card, field: "startDate" | "dueDate", value: string) => {
    const payloadVal = value ? new Date(value).toISOString() : null;
    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: card.id,
          [field]: payloadVal
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.card && onCardSaved) {
          onCardSaved(data.card);
        }
        toast({ message: field === "startDate" ? "Start date updated" : "Due date updated", type: "success" });
      }
    } finally {
      setEditingDateCardId(null);
      setEditingDateField(null);
    }
  };

  // Direct delete confirmation
  const handleConfirmDelete = async () => {
    if (!cardToDelete || !onCardDeleted) return;
    setIsDeletingCard(true);
    try {
      await onCardDeleted(cardToDelete.id);
      toast({ message: "Task deleted successfully", type: "success" });
      setCardToDelete(null);
    } catch {
      toast({ message: "Failed to delete task", type: "error" });
    } finally {
      setIsDeletingCard(false);
    }
  };

  // Flattened and sorted cards list for Spreadsheet Table View
  const allCards = useMemo(() => {
    const flat: Array<Card & { column: ColumnWithCards }> = [];
    columns.forEach((col) => {
      col.cards.forEach((card) => {
        flat.push({ ...card, column: col });
      });
    });

    let filtered = flat;

    // Filter by text search
    if (tableSearch.trim()) {
      const query = tableSearch.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          (c.description && c.description.toLowerCase().includes(query)) ||
          c.column.name.toLowerCase().includes(query)
      );
    }

    // Filter by status pill
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let valA: string | number = "";
        let valB: string | number = "";

        if (sortField === "title") {
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
        } else if (sortField === "priority") {
          const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          valA = rank[a.priority] || 0;
          valB = rank[b.priority] || 0;
        } else if (sortField === "status") {
          valA = a.status;
          valB = b.status;
        } else if (sortField === "dueDate") {
          valA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          valB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        } else if (sortField === "startDate") {
          valA = a.startDate ? new Date(a.startDate).getTime() : 0;
          valB = b.startDate ? new Date(b.startDate).getTime() : 0;
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [columns, tableSearch, statusFilter, sortField, sortDirection]);

  const totalCardsCount = columns.reduce((acc, col) => acc + col.cards.length, 0);
  const doneCardsCount = allCards.filter((c) => c.status === "DONE").length;
  const inProgressCount = allCards.filter((c) => c.status === "DOING").length;

  if (columns.length === 0) {
    return (
      <div className="lofi-panel mt-4 flex min-h-[320px] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <h3 className="text-base font-semibold text-stone-100">No columns on this board yet</h3>
        <p className="mt-1 text-xs text-stone-400">Switch to Board view to add your first column.</p>
      </div>
    );
  }

  return (
    <div className="relative mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white/80 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-ink-950/50">
      {/* ── Table Topbar (Spreadsheet Tab Header) ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-stone-200/80 bg-stone-50/90 px-3.5 py-2 dark:border-white/10 dark:bg-stone-900/80">
        <div className="flex items-center gap-2">
          {/* Active sheet tab pill */}
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300/80 bg-white px-3 py-1 text-xs font-bold text-stone-800 shadow-2xs dark:border-white/15 dark:bg-stone-800 dark:text-stone-100">
            <Table2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Table</span>
          </div>

          {/* Search within table */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search tasks..."
              className="h-7 w-36 rounded-lg border border-stone-200 bg-white pl-8 pr-2 text-xs text-stone-800 placeholder:text-stone-400 focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-200 sm:w-48"
            />
            {tableSearch && (
              <button
                type="button"
                onClick={() => setTableSearch("")}
                className="absolute right-2 grid h-4 w-4 place-items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Status filters & view presentation toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-stone-200 bg-white/80 p-0.5 text-[11px] font-medium dark:border-white/10 dark:bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={cn(
                "rounded px-2.5 py-0.5 transition cursor-pointer",
                statusFilter === "ALL"
                  ? "bg-stone-200/80 font-bold text-stone-900 dark:bg-white/10 dark:text-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("TODO")}
              className={cn(
                "rounded px-2.5 py-0.5 transition cursor-pointer",
                statusFilter === "TODO"
                  ? "bg-blue-500/20 font-bold text-blue-700 dark:bg-blue-500/30 dark:text-blue-300"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              )}
            >
              To Do
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("DOING")}
              className={cn(
                "rounded px-2.5 py-0.5 transition cursor-pointer",
                statusFilter === "DOING"
                  ? "bg-amber-500/20 font-bold text-amber-700 dark:bg-amber-500/30 dark:text-amber-300"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              )}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("DONE")}
              className={cn(
                "rounded px-2.5 py-0.5 transition cursor-pointer",
                statusFilter === "DONE"
                  ? "bg-emerald-500/20 font-bold text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-300"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              )}
            >
              Done
            </button>
          </div>

          {/* Toggle between Flat Spreadsheet Table vs Grouped Status View */}
          <div className="flex items-center rounded-lg border border-stone-200 bg-white/80 p-0.5 text-[11px] font-medium dark:border-white/10 dark:bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setDisplayMode("table")}
              title="Table View (flat rows)"
              className={cn(
                "flex items-center gap-1 rounded px-2.5 py-0.5 transition cursor-pointer",
                displayMode === "table"
                  ? "bg-stone-200/80 font-bold text-stone-900 dark:bg-white/10 dark:text-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              )}
            >
              <Table2 className="h-3 w-3" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("grouped")}
              title="Group by Status"
              className={cn(
                "flex items-center gap-1 rounded px-2.5 py-0.5 transition cursor-pointer",
                displayMode === "grouped"
                  ? "bg-stone-200/80 font-bold text-stone-900 dark:bg-white/10 dark:text-stone-100"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              )}
            >
              <ListFilter className="h-3 w-3" />
              <span>Group</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable Spreadsheet Grid ── */}
      <div className="scrollbar-soft flex-1 overflow-x-auto overflow-y-auto pb-16">
        <div className="min-w-[1240px] text-xs">
          {/* ── Table Header (Exact Columns from User Reference Screenshot) ── */}
          <div className="sticky top-0 z-20 flex items-center border-b border-stone-200/80 bg-stone-100/95 font-semibold text-stone-700 backdrop-blur-md dark:border-white/10 dark:bg-stone-900/95 dark:text-stone-300">
            {/* Index / Checkbox */}
            <div className="w-12 py-2.5 text-center text-[11px] font-mono text-stone-400">#</div>

            {/* 1. Task Title */}
            <div
              onClick={() => handleSort("title")}
              className="flex-1 min-w-[280px] px-3 py-2.5 flex items-center gap-1.5 cursor-pointer select-none hover:text-indigo-600 dark:hover:text-dusk-lavender transition"
            >
              <span className="font-bold text-stone-500 dark:text-stone-400 text-[10px] font-mono">Tt</span>
              <span className="font-bold">Task Title</span>
              {sortField === "title" ? (
                <ArrowUpDown className="h-3 w-3 text-indigo-500" />
              ) : (
                <ChevronDown className="h-3 w-3 text-stone-400 opacity-60" />
              )}
            </div>

            {/* 2. Priority */}
            <div
              onClick={() => handleSort("priority")}
              className="w-32 px-2 py-2.5 flex items-center justify-center gap-1 cursor-pointer select-none hover:text-indigo-600 dark:hover:text-dusk-lavender transition"
            >
              <span className="font-bold">Priority</span>
              <ChevronDown className="h-3 w-3 text-stone-400 opacity-60" />
            </div>

            {/* 3. Assignee */}
            <div className="w-40 px-2 py-2.5 flex items-center gap-1 select-none">
              <UserIcon className="h-3.5 w-3.5 text-stone-500" />
              <span className="font-bold">Assignee</span>
              <ChevronDown className="h-3 w-3 text-stone-400 opacity-60" />
            </div>

            {/* 4. Status */}
            <div
              onClick={() => handleSort("status")}
              className="w-36 px-2 py-2.5 flex items-center justify-center gap-1 cursor-pointer select-none hover:text-indigo-600 dark:hover:text-dusk-lavender transition"
            >
              <span className="font-bold">Status</span>
              <ChevronDown className="h-3 w-3 text-stone-400 opacity-60" />
            </div>

            {/* 5. Start Date */}
            <div
              onClick={() => handleSort("startDate")}
              className="w-36 px-2 py-2.5 flex items-center justify-center gap-1 cursor-pointer select-none hover:text-indigo-600 dark:hover:text-dusk-lavender transition"
            >
              <Calendar className="h-3 w-3 text-stone-400" />
              <span className="font-bold">Start Date</span>
              <ChevronDown className="h-3 w-3 text-stone-400 opacity-60" />
            </div>

            {/* 6. Due Date */}
            <div
              onClick={() => handleSort("dueDate")}
              className="w-36 px-2 py-2.5 flex items-center justify-center gap-1 cursor-pointer select-none hover:text-indigo-600 dark:hover:text-dusk-lavender transition"
            >
              <Calendar className="h-3 w-3 text-stone-400" />
              <span className="font-bold">Due Date</span>
              <ChevronDown className="h-3 w-3 text-stone-400 opacity-60" />
            </div>

            {/* 7. Story Points */}
            <div className="w-28 px-2 py-2.5 flex items-center justify-center gap-1 select-none">
              <Zap className="h-3 w-3 text-amber-500" />
              <span className="font-bold">Story Points</span>
            </div>

            {/* 8. Files / Checklist */}
            <div className="w-28 px-2 py-2.5 flex items-center justify-center gap-1 select-none">
              <Paperclip className="h-3 w-3 text-stone-400" />
              <span className="font-bold">Files</span>
            </div>

            {/* 9. Notes */}
            <div className="w-24 px-2 py-2.5 flex items-center justify-center gap-1 select-none">
              <FileText className="h-3 w-3 text-stone-400" />
              <span className="font-bold">Notes</span>
            </div>

            {/* 10. Actions */}
            <div className="w-14 py-2.5 text-center text-stone-400">•••</div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              MODE 1: FLAT SPREADSHEET TABLE (Default - User Reference)
             ═══════════════════════════════════════════════════════════ */}
          {displayMode === "table" ? (
            <div className="divide-y divide-stone-200/50 dark:divide-white/[0.04]">
              {allCards.map((card, index) => {
                const priorityConfig = PRIORITY_CONFIG[card.priority] || PRIORITY_CONFIG.MEDIUM;
                const PriorityIcon = priorityConfig.icon;
                const statusPill = STATUS_PILL_CONFIG[card.status] || STATUS_PILL_CONFIG.TODO;
                const isCardDone = card.status === "DONE";
                const cardOverdue = checkIsOverdue(card.dueDate);
                const checklistTotal = card.checklist.length;
                const checklistDone = card.checklist.filter((i) => i.checked).length;
                const firstAssignee = card.assignees?.[0];

                return (
                  <div
                    key={card.id}
                    onClick={() => onEditCard(card)}
                    className={cn(
                      "group/row flex cursor-pointer items-center transition-colors",
                      "hover:bg-indigo-50/50 dark:hover:bg-white/[0.04]",
                      index % 2 === 1 && "bg-stone-50/30 dark:bg-white/[0.01]",
                      isCardDone && "bg-stone-50/60 opacity-80 dark:bg-black/20"
                    )}
                  >
                    {/* Index & Checkbox Complete */}
                    <div className="w-12 text-center flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleToggleCardComplete(card, e)}
                        title={isCardDone ? "Mark incomplete" : "Mark as Done"}
                        className={cn(
                          "grid h-4 w-4 place-items-center rounded border transition-all cursor-pointer",
                          isCardDone
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-stone-300 bg-white hover:border-emerald-500 dark:border-stone-600 dark:bg-transparent"
                        )}
                      >
                        {isCardDone && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </button>
                      <span className="font-mono text-[10px] text-stone-400 w-4 text-left">{index + 1}</span>
                    </div>

                    {/* 1. Work (Task Title) */}
                    <div className="flex-1 min-w-[260px] px-3 py-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleToggleStar(card, e)}
                        className="grid h-4 w-4 place-items-center rounded text-stone-300 hover:text-amber-400 dark:text-stone-600"
                        title={card.isStarred ? "Unstar" : "Star"}
                      >
                        <Star
                          className={cn(
                            "h-3.5 w-3.5 transition",
                            card.isStarred
                              ? "fill-amber-400 text-amber-400"
                              : "text-stone-400 opacity-40 hover:opacity-100"
                          )}
                        />
                      </button>

                      {editingCardId === card.id ? (
                        <div className="flex flex-1 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingTitleValue}
                            onChange={(e) => setEditingTitleValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void handleSaveTitle(card);
                              if (e.key === "Escape") setEditingCardId(null);
                            }}
                            onBlur={() => void handleSaveTitle(card)}
                            autoFocus
                            className="h-6 w-full rounded border border-indigo-400 bg-white px-2 text-xs font-semibold text-stone-900 shadow-2xs outline-none dark:bg-stone-800 dark:text-stone-100"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-1 items-center justify-between min-w-0 pr-2">
                          <span
                            className={cn(
                              "font-medium text-stone-900 transition-colors group-hover/row:text-indigo-600 dark:text-stone-100 dark:group-hover/row:text-dusk-lavender truncate",
                              isCardDone && "line-through text-stone-400 dark:text-stone-500"
                            )}
                          >
                            {card.title}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCardId(card.id);
                              setEditingTitleValue(card.title);
                            }}
                            className="opacity-0 group-hover/row:opacity-100 transition grid h-5 w-5 place-items-center rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                            title="Edit title inline"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 2. Priority Pill Dropdown */}
                    <div className="w-32 px-2 py-1.5 flex justify-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-bold shadow-2xs transition hover:brightness-105 cursor-pointer",
                              priorityConfig.pillClass
                            )}
                          >
                            <PriorityIcon className="h-3 w-3 shrink-0" />
                            <span>{priorityConfig.shortLabel}</span>
                            <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48 z-[1200]">
                          <DropdownMenuLabel className="text-xs">Priority</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => void handleUpdatePriority(card, "HIGH")}
                            className="cursor-pointer text-xs flex items-center justify-between font-semibold text-red-600 dark:text-red-400"
                          >
                            <span className="flex items-center gap-1.5">
                              <ArrowUp className="h-3.5 w-3.5" />
                              <span>High (Urgent)</span>
                            </span>
                            {card.priority === "HIGH" && <Check className="h-3.5 w-3.5" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => void handleUpdatePriority(card, "MEDIUM")}
                            className="cursor-pointer text-xs flex items-center justify-between font-semibold text-indigo-600 dark:text-indigo-400"
                          >
                            <span className="flex items-center gap-1.5">
                              <ArrowRight className="h-3.5 w-3.5" />
                              <span>Medium</span>
                            </span>
                            {card.priority === "MEDIUM" && <Check className="h-3.5 w-3.5" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => void handleUpdatePriority(card, "LOW")}
                            className="cursor-pointer text-xs flex items-center justify-between font-semibold text-sky-600 dark:text-sky-400"
                          >
                            <span className="flex items-center gap-1.5">
                              <ArrowDown className="h-3.5 w-3.5" />
                              <span>Low</span>
                            </span>
                            {card.priority === "LOW" && <Check className="h-3.5 w-3.5" />}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* 3. Assignee Dropdown */}
                    <div className="w-40 px-2 py-1.5 truncate" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex w-full items-center gap-1.5 rounded-lg border border-transparent px-1.5 py-1 text-left text-xs text-stone-700 hover:border-stone-200 hover:bg-stone-100/60 dark:text-stone-300 dark:hover:border-white/10 dark:hover:bg-white/[0.04] transition cursor-pointer"
                          >
                            {firstAssignee ? (
                              <>
                                <div className="grid h-5 w-5 place-items-center rounded-full bg-dusk-lavender/30 text-[9px] font-bold text-stone-900 dark:text-stone-100 shrink-0">
                                  {(firstAssignee.name?.[0] ?? firstAssignee.email[0]).toUpperCase()}
                                </div>
                                <span className="truncate font-medium text-stone-800 dark:text-stone-200">
                                  {firstAssignee.name ?? firstAssignee.email}
                                </span>
                              </>
                            ) : (
                              <span className="flex items-center gap-1 text-stone-400 italic">
                                <UserIcon className="h-3.5 w-3.5" />
                                <span>Unassigned</span>
                              </span>
                            )}
                            <ChevronDown className="ml-auto h-3 w-3 text-stone-400 shrink-0 opacity-60" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52 z-[1200]">
                          <DropdownMenuLabel className="text-xs">Assignee</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {members.map((member) => {
                            const isAssigned = card.assigneeIds?.includes(member.id);
                            return (
                              <DropdownMenuItem
                                key={member.id}
                                onClick={() => void handleUpdateAssignee(card, member.id)}
                                className={cn(
                                  "cursor-pointer text-xs flex items-center justify-between",
                                  isAssigned && "font-bold text-dusk-lavender"
                                )}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="grid h-5 w-5 place-items-center rounded-full bg-stone-200 text-[9px] font-bold text-stone-800 dark:bg-stone-700 dark:text-stone-200 shrink-0">
                                    {(member.name?.[0] ?? member.email[0]).toUpperCase()}
                                  </div>
                                  <span className="truncate">{member.name ?? member.email}</span>
                                </div>
                                {isAssigned && <Check className="h-3.5 w-3.5 shrink-0" />}
                              </DropdownMenuItem>
                            );
                          })}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => void handleUpdateAssignee(card, null)}
                            className="cursor-pointer text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                          >
                            Unassign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* 4. Status Pill Dropdown */}
                    <div className="w-36 px-2 py-1.5 flex justify-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "inline-flex h-6 w-full items-center justify-between rounded-full border px-2.5 text-[11px] font-bold shadow-2xs transition hover:brightness-105 cursor-pointer",
                              statusPill.pillClass
                            )}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusPill.dotClass)} />
                              <span className="truncate">{statusPill.label}</span>
                            </span>
                            <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48 z-[1200]">
                          <DropdownMenuLabel className="text-xs">Move Column / Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {allColumns.map((col) => {
                            const isCurrentCol = col.id === card.columnId;
                            const colTheme = getColumnThemeOption(col.color);
                            return (
                              <DropdownMenuItem
                                key={col.id}
                                onClick={() => void handleMoveColumn(card, col)}
                                className={cn(
                                  "cursor-pointer text-xs flex items-center justify-between",
                                  isCurrentCol && "font-bold text-dusk-lavender"
                                )}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <span className={cn("h-2 w-2 rounded-full shrink-0", colTheme.swatchClass)} />
                                  <span className="truncate">{col.name}</span>
                                </span>
                                {isCurrentCol && <Check className="h-3.5 w-3.5 shrink-0" />}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* 5. Start Date */}
                    <div className="w-36 px-1.5 py-1 text-center font-mono text-[11px]" onClick={(e) => e.stopPropagation()}>
                      <DatePicker
                        value={card.startDate}
                        onChange={(nextDate) => void handleSaveDate(card, "startDate", nextDate)}
                        placeholder="-"
                        triggerClassName="h-6 w-full border-transparent bg-transparent px-2 py-0 text-center text-[11px] shadow-none hover:border-stone-200 hover:bg-stone-100 dark:hover:border-white/10 dark:hover:bg-white/10"
                      />
                    </div>

                    {/* 6. Due Date */}
                    <div className="w-36 px-1.5 py-1 text-center font-mono text-[11px]" onClick={(e) => e.stopPropagation()}>
                      <DatePicker
                        value={card.dueDate}
                        onChange={(nextDate) => void handleSaveDate(card, "dueDate", nextDate)}
                        placeholder="DD/MM/YYYY"
                        triggerClassName={cn(
                          "h-6 w-full border-transparent bg-transparent px-2 py-0 text-center text-[11px] shadow-none hover:border-stone-200 hover:bg-stone-100 dark:hover:border-white/10 dark:hover:bg-white/10",
                          cardOverdue && !isCardDone && "font-bold text-red-600 dark:text-red-400 bg-red-500/10"
                        )}
                      />
                    </div>

                    {/* 7. Story Points */}
                    <div className="w-28 px-2 py-1.5 text-center font-mono text-[11px] text-stone-600 dark:text-stone-400">
                      {card.difficulty ? (
                        <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-1.5 py-0.5 font-bold text-amber-600 dark:bg-white/5 dark:text-amber-400">
                          ⚡ {card.difficulty}
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </div>

                    {/* 8. Files / Checklist */}
                    <div className="w-28 px-2 py-1.5 text-center font-mono text-[11px] text-stone-600 dark:text-stone-400">
                      {checklistTotal > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600 dark:bg-white/10 dark:text-stone-400">
                          <CheckSquare className="h-3 w-3" />
                          <span>
                            {checklistDone}/{checklistTotal}
                          </span>
                        </span>
                      ) : (
                        <span className="text-stone-400 flex items-center justify-center gap-1">
                          <Paperclip className="h-3 w-3 opacity-60" />
                          <span>0 files</span>
                        </span>
                      )}
                    </div>

                    {/* 9. Notes */}
                    <div className="w-24 px-2 py-1.5 text-center text-[11px] text-stone-500">
                      {card.description || card.note ? (
                        <span className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-dusk-lavender">
                          <FileText className="h-3 w-3" />
                          <span>Note</span>
                        </span>
                      ) : (
                        <span className="text-stone-400">-</span>
                      )}
                    </div>

                    {/* 10. Actions (•••) */}
                    <div className="w-14 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="grid h-6 w-6 place-items-center rounded text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200 cursor-pointer"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 z-[1200]">
                          <DropdownMenuItem onClick={() => onEditCard(card)} className="cursor-pointer text-xs">
                            Edit task
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => void handleToggleStar(card, e)} className="cursor-pointer text-xs">
                            {card.isStarred ? "Unstar" : "Star"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {onCardDeleted && (
                            <DropdownMenuItem
                              onClick={() => setCardToDelete(card)}
                              className="cursor-pointer text-xs text-red-600 focus:text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Delete task
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}

              {/* ── Quick Add Row at Bottom (Like Google Sheets / Airtable) ── */}
              <div className="flex items-center bg-stone-50/70 px-2 py-1.5 dark:bg-white/[0.02]">
                <div className="w-12 text-center text-stone-400">
                  <Plus className="mx-auto h-4 w-4 text-dusk-lavender" />
                </div>
                <div className="flex-1 min-w-[280px] px-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={bottomNewTitle}
                    onChange={(e) => setBottomNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleQuickAdd(bottomSelectedColumnId || columns[0].id, bottomNewTitle);
                    }}
                    placeholder="+ Add new task (type title and press Enter)..."
                    className="h-7 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-stone-800 dark:text-stone-100"
                  />
                </div>
                <div className="w-32 px-2 flex justify-center">
                  <span className="text-[10px] text-stone-400 italic">Default Medium</span>
                </div>
                <div className="w-40 px-2">
                  <span className="text-[10px] text-stone-400 italic">Unassigned</span>
                </div>
                <div className="w-36 px-2">
                  <select
                    value={bottomSelectedColumnId}
                    onChange={(e) => setBottomSelectedColumnId(e.target.value)}
                    className="h-7 w-full rounded border border-stone-200 bg-white px-1.5 text-[11px] font-medium text-stone-700 outline-none dark:border-white/10 dark:bg-stone-800 dark:text-stone-300"
                  >
                    {columns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-36 px-2 text-center text-[10px] text-stone-400">-</div>
                <div className="w-36 px-2 text-center text-[10px] text-stone-400">-</div>
                <div className="w-28 px-2 text-center text-[10px] text-stone-400">-</div>
                <div className="w-28 px-2 text-center text-[10px] text-stone-400">-</div>
                <div className="w-24 px-2 text-center text-[10px] text-stone-400">-</div>
                <div className="w-14 text-center">
                  <button
                    type="button"
                    onClick={() => void handleQuickAdd(bottomSelectedColumnId || columns[0].id, bottomNewTitle)}
                    disabled={!bottomNewTitle.trim() || isSubmitting}
                    className="rounded bg-dusk-lavender px-2 py-1 text-[10px] font-bold text-stone-950 transition hover:bg-dusk-lavender/90 disabled:opacity-30 cursor-pointer"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════════
               MODE 2: GROUPED ACCORDION VIEW (By Column Status)
               ═══════════════════════════════════════════════════════════ */
            <div className="divide-y divide-stone-200/50 dark:divide-white/5">
              {columns.map((column) => {
                const isCollapsed = collapsedGroups[column.id] ?? false;
                const themeOption = getColumnThemeOption(column.color);
                const cardCount = column.cards.length;

                return (
                  <div key={column.id} className="group/section">
                    {/* Section Accordion Header */}
                    <div
                      onClick={() => toggleGroup(column.id)}
                      className="flex cursor-pointer select-none items-center justify-between bg-stone-50/70 px-4 py-2 transition-colors hover:bg-stone-100/70 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={isCollapsed ? `Expand ${column.name}` : `Collapse ${column.name}`}
                          className="grid h-5 w-5 place-items-center rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                        >
                          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0 shadow-xs", themeOption.swatchClass)} />
                        <span className="font-bold text-stone-800 dark:text-stone-200">{column.name}</span>
                        <span className="rounded-full bg-stone-200/70 px-2 py-0.5 font-mono text-[10px] font-semibold text-stone-600 dark:bg-white/10 dark:text-stone-400">
                          {cardCount}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingInColumnId(column.id);
                            setCollapsedGroups((prev) => ({ ...prev, [column.id]: false }));
                          }}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-stone-500 hover:bg-white/10 hover:text-dusk-lavender transition"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Task</span>
                        </button>
                      </div>
                    </div>

                    {/* Cards inside this group */}
                    {!isCollapsed && (
                      <div className="divide-y divide-stone-200/40 dark:divide-white/[0.03]">
                        {column.cards.map((card, idx) => {
                          const priorityConfig = PRIORITY_CONFIG[card.priority] || PRIORITY_CONFIG.MEDIUM;
                          const PriorityIcon = priorityConfig.icon;
                          const isCardDone = card.status === "DONE";
                          const cardOverdue = checkIsOverdue(card.dueDate);
                          const checklistTotal = card.checklist.length;
                          const checklistDone = card.checklist.filter((i) => i.checked).length;
                          const firstAssignee = card.assignees?.[0];

                          return (
                            <div
                              key={card.id}
                              onClick={() => onEditCard(card)}
                              className={cn(
                                "group/row flex cursor-pointer items-center transition-colors hover:bg-stone-50 dark:hover:bg-white/[0.04]",
                                isCardDone && "bg-stone-50/40 opacity-75 dark:bg-black/20"
                              )}
                            >
                              <div className="w-12 text-center flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleCardComplete(card, e)}
                                  title={isCardDone ? "Mark incomplete" : "Mark as Done"}
                                  className={cn(
                                    "grid h-4 w-4 place-items-center rounded border transition-all cursor-pointer",
                                    isCardDone
                                      ? "border-emerald-500 bg-emerald-500 text-white"
                                      : "border-stone-300 bg-white hover:border-emerald-500 dark:border-stone-600 dark:bg-transparent"
                                  )}
                                >
                                  {isCardDone && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                </button>
                                <span className="font-mono text-[10px] text-stone-400 w-4 text-left">{idx + 1}</span>
                              </div>

                              <div className="flex-1 min-w-[280px] px-3 py-2 flex items-center gap-2">
                                <span
                                  className={cn(
                                    "font-medium text-stone-900 transition-colors group-hover/row:text-indigo-600 dark:text-stone-100 dark:group-hover/row:text-dusk-lavender truncate",
                                    isCardDone && "line-through text-stone-400 dark:text-stone-500"
                                  )}
                                >
                                  {card.title}
                                </span>
                              </div>

                              {/* 2. Priority Pill Dropdown */}
                              <div className="w-32 px-2 py-1.5 flex justify-center" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className={cn(
                                        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-bold shadow-2xs transition hover:brightness-105 cursor-pointer",
                                        priorityConfig.pillClass
                                      )}
                                    >
                                      <PriorityIcon className="h-3 w-3 shrink-0" />
                                      <span>{priorityConfig.shortLabel}</span>
                                      <ChevronDown className="h-3 w-3 opacity-70 shrink-0" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="center" className="w-48 z-[1200]">
                                    <DropdownMenuLabel className="text-xs">Set Priority</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => void handleUpdatePriority(card, "HIGH")}
                                      className="cursor-pointer text-xs flex items-center justify-between font-semibold text-red-600 dark:text-red-400"
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <ArrowUp className="h-3.5 w-3.5" />
                                        <span>High (Urgent)</span>
                                      </span>
                                      {card.priority === "HIGH" && <Check className="h-3.5 w-3.5" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => void handleUpdatePriority(card, "MEDIUM")}
                                      className="cursor-pointer text-xs flex items-center justify-between font-semibold text-indigo-600 dark:text-indigo-400"
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <ArrowRight className="h-3.5 w-3.5" />
                                        <span>Medium</span>
                                      </span>
                                      {card.priority === "MEDIUM" && <Check className="h-3.5 w-3.5" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => void handleUpdatePriority(card, "LOW")}
                                      className="cursor-pointer text-xs flex items-center justify-between font-semibold text-sky-600 dark:text-sky-400"
                                    >
                                      <span className="flex items-center gap-1.5">
                                        <ArrowDown className="h-3.5 w-3.5" />
                                        <span>Low</span>
                                      </span>
                                      {card.priority === "LOW" && <Check className="h-3.5 w-3.5" />}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="w-40 px-2 py-1.5 truncate">
                                {firstAssignee ? (
                                  <span className="truncate text-stone-700 dark:text-stone-300">
                                    {firstAssignee.name ?? firstAssignee.email}
                                  </span>
                                ) : (
                                  <span className="text-stone-400 italic">Unassigned</span>
                                )}
                              </div>

                              <div className="w-36 px-2 py-1.5 flex justify-center" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className="flex w-full items-center justify-between rounded-md border border-stone-200/80 bg-white px-2 py-1 text-[11px] font-medium text-stone-700 hover:border-stone-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300"
                                    >
                                      <span className="truncate">{column.name}</span>
                                      <ChevronDown className="h-3 w-3 shrink-0 text-stone-400" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start" className="w-44 z-[1200]">
                                    <DropdownMenuLabel className="text-xs">Move to column</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {allColumns.map((col) => (
                                      <DropdownMenuItem
                                        key={col.id}
                                        onClick={() => void handleMoveColumn(card, col)}
                                        className={cn(
                                          "cursor-pointer text-xs flex items-center justify-between",
                                          col.id === column.id && "font-bold text-dusk-lavender"
                                        )}
                                      >
                                        <span>{col.name}</span>
                                        {col.id === column.id && <Check className="h-3.5 w-3.5" />}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="w-36 px-2 py-1.5 text-center font-mono text-[11px] text-stone-500">
                                {formatTableDate(card.startDate)}
                              </div>

                              <div className="w-36 px-2 py-1.5 text-center font-mono text-[11px] text-stone-500">
                                {formatTableDate(card.dueDate)}
                              </div>

                              <div className="w-28 px-2 py-1.5 text-center font-mono text-[11px] text-stone-500">
                                {card.difficulty ? `⚡ ${card.difficulty}` : "-"}
                              </div>

                              <div className="w-28 px-2 py-1.5 text-center font-mono text-[11px] text-stone-500">
                                {checklistTotal > 0 ? `${checklistDone}/${checklistTotal}` : "0 files"}
                              </div>

                              <div className="w-24 px-2 py-1.5 text-center text-stone-500">
                                {card.description ? "Note" : "-"}
                              </div>

                              <div className="w-14 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      className="grid h-6 w-6 place-items-center rounded text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200"
                                    >
                                      <MoreVertical className="h-3.5 w-3.5" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40 z-[1200]">
                                    <DropdownMenuItem onClick={() => onEditCard(card)} className="cursor-pointer text-xs">
                                      Edit task
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {onCardDeleted && (
                                      <DropdownMenuItem
                                        onClick={() => setCardToDelete(card)}
                                        className="cursor-pointer text-xs text-red-600 focus:text-red-600 dark:text-red-400"
                                      >
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                        Delete task
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          );
                        })}

                        {/* Inline quick create row in group */}
                        {addingInColumnId === column.id ? (
                          <div className="flex items-center gap-2 bg-stone-100/60 px-4 py-2 dark:bg-white/[0.03]">
                            <Plus className="h-4 w-4 text-dusk-lavender shrink-0" />
                            <input
                              type="text"
                              value={newCardTitle}
                              onChange={(e) => setNewCardTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") void handleQuickAdd(column.id);
                                if (e.key === "Escape") {
                                  setAddingInColumnId(null);
                                  setNewCardTitle("");
                                }
                              }}
                              autoFocus
                              placeholder="Type a title and press Enter..."
                              className="flex-1 bg-transparent text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none dark:text-stone-100"
                            />
                            <button
                              type="button"
                              onClick={() => void handleQuickAdd(column.id)}
                              disabled={!newCardTitle.trim() || isSubmitting}
                              className="rounded-md bg-dusk-lavender px-2.5 py-1 text-[11px] font-semibold text-stone-950 transition hover:bg-dusk-lavender/90 disabled:opacity-40"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAddingInColumnId(null);
                                setNewCardTitle("");
                              }}
                              className="grid h-6 w-6 place-items-center rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => setAddingInColumnId(column.id)}
                            className="flex cursor-pointer items-center gap-2 px-4 py-2 text-stone-400 transition hover:bg-stone-50 hover:text-dusk-lavender dark:hover:bg-white/[0.02]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-medium">+ Create task in {column.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Summary Footer ── */}
          <div className="flex items-center justify-between border-t border-stone-200/80 bg-stone-50/70 px-4 py-2.5 text-[11px] text-stone-600 dark:border-white/10 dark:bg-stone-900/60 dark:text-stone-400">
            <div className="flex items-center gap-3">
              <span>
                Total: <strong>{totalCardsCount}</strong> tasks
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                Done: <strong>{doneCardsCount}</strong>
              </span>
              <span className="text-amber-600 dark:text-amber-400">
                In progress: <strong>{inProgressCount}</strong>
              </span>
            </div>
            <span className="text-stone-400 hidden sm:inline">
              Click any row to view details • Click cells to update status, assignee, priority, or dates inline
            </span>
          </div>
        </div>
      </div>

      {/* ── Confirm Delete Modal ── */}
      <ConfirmModal
        open={Boolean(cardToDelete)}
        title="Delete Task"
        message={`Are you sure you want to delete "${cardToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete task"
        variant="danger"
        isLoading={isDeletingCard}
        onConfirm={handleConfirmDelete}
        onClose={() => setCardToDelete(null)}
      />
    </div>
  );
}
