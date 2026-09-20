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
  projectName?: string;
  boards: BoardTabItem[];
  activeBoardId: string;
  canManage?: boolean;
}

export function BoardTabsBar({
  projectId,
  projectName,
  boards,
  activeBoardId,
  canManage = false
}: BoardTabsBarProps) {
  if (boards.length <= 1 && !canManage) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3">
      {/* Scrollable Tabs */}
      <div className="scrollbar-soft flex items-center gap-1.5 overflow-x-auto min-w-0 pr-2">
        {projectName ? (
          <div className="flex items-center gap-1.5 text-xs shrink-0 mr-2">
            <span className="font-semibold text-stone-100 truncate max-w-[130px] sm:max-w-[180px]" title={projectName}>
              {projectName}
            </span>
            <span className="text-stone-600 font-mono select-none">/</span>
            <span className="text-[10px] uppercase tracking-wider text-dusk-amber/90 font-mono select-none font-semibold">
              Boards:
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-dusk-amber/90 font-mono select-none mr-2 shrink-0 font-semibold">
            <FolderKanban className="h-3.5 w-3.5 text-dusk-amber" />
            <span>Boards:</span>
          </div>
        )}
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
                  : "border-white/10 bg-white/[0.04] text-stone-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              )}
            >
              {b.isPrivate ? (
                <Lock className={cn("h-3 w-3", isActive ? "text-dusk-amber" : "text-stone-400")} />
              ) : (
                <FolderKanban className={cn("h-3 w-3", isActive ? "text-dusk-amber" : "text-stone-400")} />
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
