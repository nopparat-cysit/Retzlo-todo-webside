"use client";

import Link from "next/link";
import { FolderKanban, Globe, Lock, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardTabItem {
  id: string;
  name: string;
  isPrivate: boolean;
}

interface BoardTabsBarProps {
  projectId: string;
  boards: BoardTabItem[];
  activeBoardId: string;
  canManage?: boolean;
}

export function BoardTabsBar({
  projectId,
  boards,
  activeBoardId,
  canManage = false
}: BoardTabsBarProps) {
  if (boards.length <= 1 && !canManage) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-3">
      {/* Scrollable Tabs */}
      <div className="scrollbar-soft flex items-center gap-1.5 overflow-x-auto min-w-0 pr-2">
        <span className="text-[10px] uppercase tracking-wider text-stone-500 font-mono select-none mr-1 shrink-0">
          Lanes:
        </span>
        {boards.map((b) => {
          const isActive = b.id === activeBoardId;

          return (
            <Link
              key={b.id}
              href={`/project/${projectId}/board?boardId=${b.id}`}
              className={cn(
                "group flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all select-none",
                isActive
                  ? "border-dusk-amber/50 bg-dusk-amber/15 text-dusk-amber shadow-[0_0_12px_rgba(249,199,132,0.12)] font-semibold"
                  : "border-white/10 bg-white/[0.03] text-stone-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-stone-200"
              )}
            >
              {b.isPrivate ? (
                <Lock className={cn("h-3 w-3", isActive ? "text-dusk-amber" : "text-stone-500")} />
              ) : (
                <FolderKanban className={cn("h-3 w-3", isActive ? "text-dusk-amber" : "text-stone-500")} />
              )}
              <span className="truncate max-w-[140px]">{b.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Quick Manage Link */}
      {canManage && (
        <Link
          href={`/project/${projectId}/settings`}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-xs text-stone-400 transition hover:border-dusk-lavender/40 hover:bg-dusk-lavender/10 hover:text-dusk-lavender select-none"
          title="Manage sub-projects and member access in Settings"
        >
          <Settings className="h-3 w-3" />
          <span className="hidden sm:inline">Manage Boards</span>
        </Link>
      )}
    </div>
  );
}
