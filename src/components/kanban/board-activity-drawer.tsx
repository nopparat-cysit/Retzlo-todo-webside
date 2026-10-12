"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  FilePlus,
  FileX,
  FolderArchive,
  History,
  Loader2,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  X
} from "lucide-react";

import { getPusherClient, sanitizePusherChannel } from "@/lib/pusher/client";
import type { BoardActivityItem } from "@/types/kanban";
import { cn } from "@/lib/utils";

interface BoardActivityDrawerProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
  boardTitle: string;
}

type FilterCategory = "ALL" | "MOVES" | "CARDS" | "ARCHIVE" | "ATTACHMENTS";

export function BoardActivityDrawer({
  open,
  onClose,
  boardId,
  boardTitle
}: BoardActivityDrawerProps) {
  const [activities, setActivities] = useState<BoardActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterCategory>("ALL");
  const [newActivityIds, setNewActivityIds] = useState<Set<string>>(new Set());

  // Fetch initial activities when opened
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/boards/${boardId}/activities`)
      .then((res) => res.json())
      .then((data: { activities?: BoardActivityItem[] }) => {
        if (isMounted) {
          setActivities(data.activities || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load board activities:", err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, boardId]);

  // Real-time live Pusher subscription
  useEffect(() => {
    if (!open) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = sanitizePusherChannel(`retzlo-board-${boardId}-activity`);
    const channel = pusher.subscribe(channelName);

    const handleSync = (data: { action?: string; activity?: BoardActivityItem }) => {
      if (data?.action === "BOARD_ACTIVITY" && data.activity) {
        const item = data.activity;
        setActivities((prev) => {
          if (prev.some((a) => a.id === item.id)) return prev;
          return [item, ...prev];
        });
        setNewActivityIds((prev) => new Set([...prev, item.id]));
        setTimeout(() => {
          setNewActivityIds((prev) => {
            const next = new Set(prev);
            next.delete(item.id);
            return next;
          });
        }, 3000);
      }
    };

    channel.bind("retzlo:sync", handleSync);

    return () => {
      channel.unbind("retzlo:sync", handleSync);
      pusher.unsubscribe(channelName);
    };
  }, [open, boardId]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (filter === "ALL") return activities;
    if (filter === "MOVES") return activities.filter((a) => a.action === "CARD_MOVED");
    if (filter === "CARDS")
      return activities.filter((a) =>
        ["CARD_CREATED", "CARD_UPDATED", "CARD_DELETED"].includes(a.action)
      );
    if (filter === "ARCHIVE")
      return activities.filter((a) =>
        ["CARD_ARCHIVED", "CARD_RESTORED"].includes(a.action)
      );
    if (filter === "ATTACHMENTS")
      return activities.filter((a) =>
        ["ATTACHMENT_ADDED", "ATTACHMENT_REMOVED"].includes(a.action)
      );
    return activities;
  }, [activities, filter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-stone-200/80 bg-stone-50/95 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-right duration-250 dark:border-white/10 dark:bg-ink-950/95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/70 p-4.5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  Activity Log
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="line-clamp-1 text-xs text-stone-500 dark:text-stone-400">
                {boardTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close activity log"
            className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-200/60 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-white/10 dark:hover:text-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-stone-200/60 p-2.5 scrollbar-none dark:border-white/5">
          {(
            [
              { id: "ALL", label: "All" },
              { id: "MOVES", label: "Moves" },
              { id: "CARDS", label: "Cards" },
              { id: "ARCHIVE", label: "Archive" },
              { id: "ATTACHMENTS", label: "Files" }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer",
                filter === tab.id
                  ? "bg-indigo-600 text-white shadow-xs dark:bg-dusk-lavender dark:text-ink-950"
                  : "bg-stone-200/60 text-stone-600 hover:bg-stone-200 hover:text-stone-900 dark:bg-white/[0.05] dark:text-stone-400 dark:hover:bg-white/[0.09] dark:hover:text-stone-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timeline Content */}
        <div className="scrollbar-soft flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-500 dark:text-dusk-lavender" />
              <p className="mt-3 text-xs">Loading activity log...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200/80 py-16 text-center dark:border-white/10">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-stone-100 text-stone-400 dark:bg-white/[0.04] dark:text-stone-500">
                <Activity className="h-6 w-6" />
              </div>
              <h4 className="mt-3 text-sm font-semibold text-stone-700 dark:text-stone-300">
                No activities yet
              </h4>
              <p className="mt-1 max-w-xs text-xs text-stone-500 dark:text-stone-400">
                Actions on cards, moves, attachments, and archive events will be logged here.
              </p>
            </div>
          ) : (
            <div className="relative space-y-4 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200/80 dark:before:bg-white/10">
              {filteredActivities.map((act) => {
                const isNew = newActivityIds.has(act.id);
                return (
                  <ActivityRow key={act.id} activity={act} isNew={isNew} />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200/70 p-3.5 text-center text-[11px] text-stone-400 dark:border-white/10 dark:text-stone-500">
          Showing {filteredActivities.length} recent audit event{filteredActivities.length === 1 ? "" : "s"}
        </div>
      </aside>
    </div>
  );
}

function ActivityRow({
  activity,
  isNew
}: {
  activity: BoardActivityItem;
  isNew: boolean;
}) {
  const { action, details, createdAt, user } = activity;

  const dateObj = new Date(createdAt);
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  });
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });

  const { badge, icon: ActionIcon, description } = renderActionMeta(action, details || {});

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-xl p-2.5 transition-all duration-300",
        isNew && "bg-indigo-500/10 ring-1 ring-indigo-500/30 dark:bg-dusk-lavender/15 dark:ring-dusk-lavender/40"
      )}
    >
      {/* Avatar / Marker */}
      <div className="relative z-10 shrink-0">
        {user?.avatar ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={user.avatar}
            alt={user.name || "User"}
            className="h-7 w-7 rounded-full object-cover ring-2 ring-white dark:ring-ink-950"
          />
        ) : (
          <div className="grid h-7 w-7 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 ring-2 ring-white dark:bg-dusk-lavender/20 dark:text-dusk-lavender dark:ring-ink-950">
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-semibold text-stone-900 dark:text-stone-200">
            {user?.name || user?.email || "Someone"}
          </span>
          <span className="shrink-0 text-[10px] text-stone-400 dark:text-stone-500" title={dateObj.toISOString()}>
            {formattedDate} {formattedTime}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              badge
            )}
          >
            <ActionIcon className="h-3 w-3" />
            {action.replace(/_/g, " ")}
          </span>
        </div>

        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function renderActionMeta(
  action: string,
  details: Record<string, unknown> = {}
): {
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: React.ReactNode;
} {
  const cardTitle = (details.cardTitle as string) || "card";
  const fromColumn = (details.fromColumn as string) || "";
  const toColumn = (details.toColumn as string) || "";
  const attachmentName = (details.attachmentName as string) || "file";

  switch (action) {
    case "CARD_CREATED":
      return {
        badge: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20",
        icon: PlusCircle,
        description: (
          <span>
            created card <strong className="font-semibold text-stone-900 dark:text-stone-100">&ldquo;{cardTitle}&rdquo;</strong>
          </span>
        )
      };
    case "CARD_MOVED":
      return {
        badge: "bg-indigo-500/10 text-indigo-700 dark:bg-dusk-lavender/20 dark:text-dusk-lavender border border-indigo-500/20",
        icon: ArrowRightLeft,
        description: (
          <span className="inline-flex items-center gap-1 flex-wrap">
            moved <strong className="font-semibold text-stone-900 dark:text-stone-100">&ldquo;{cardTitle}&rdquo;</strong>
            {fromColumn && toColumn ? (
              <>
                from <span className="underline decoration-dotted">{fromColumn}</span>
                <ArrowRight className="h-3 w-3 inline text-stone-400" />
                to <span className="underline decoration-dotted">{toColumn}</span>
              </>
            ) : null}
          </span>
        )
      };
    case "CARD_UPDATED":
      return {
        badge: "bg-amber-500/10 text-amber-700 dark:bg-dusk-amber/20 dark:text-dusk-amber border border-amber-500/20",
        icon: CheckCircle2,
        description: (
          <span>
            updated card <strong className="font-semibold text-stone-900 dark:text-stone-100">&ldquo;{cardTitle}&rdquo;</strong>
          </span>
        )
      };
    case "CARD_ARCHIVED":
      return {
        badge: "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-500/20",
        icon: FolderArchive,
        description: (
          <span>
            archived card <strong className="font-semibold text-stone-900 dark:text-stone-100">&ldquo;{cardTitle}&rdquo;</strong> to trash bin
          </span>
        )
      };
    case "CARD_RESTORED":
      return {
        badge: "bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-500/20",
        icon: RotateCcw,
        description: (
          <span>
            restored card <strong className="font-semibold text-stone-900 dark:text-stone-100">&ldquo;{cardTitle}&rdquo;</strong> back to board
          </span>
        )
      };
    case "CARD_DELETED":
      return {
        badge: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-500/20",
        icon: Trash2,
        description: (
          <span>
            permanently deleted card <strong className="font-semibold text-stone-900 dark:text-stone-100">&ldquo;{cardTitle}&rdquo;</strong>
          </span>
        )
      };
    case "ATTACHMENT_ADDED":
      return {
        badge: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-500/20",
        icon: FilePlus,
        description: (
          <span>
            attached <strong className="font-semibold text-stone-900 dark:text-stone-100">&ldquo;{attachmentName}&rdquo;</strong> to card &ldquo;{cardTitle}&rdquo;
          </span>
        )
      };
    case "ATTACHMENT_REMOVED":
      return {
        badge: "bg-zinc-500/10 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300 border border-zinc-500/20",
        icon: FileX,
        description: (
          <span>
            removed attachment <strong className="font-semibold text-stone-900 dark:text-stone-100">&ldquo;{attachmentName}&rdquo;</strong>
          </span>
        )
      };
    default:
      return {
        badge: "bg-stone-500/10 text-stone-700 dark:bg-stone-500/20 dark:text-stone-300 border border-stone-500/20",
        icon: Clock,
        description: <span>performed an action on &ldquo;{cardTitle}&rdquo;</span>
      };
  }
}
