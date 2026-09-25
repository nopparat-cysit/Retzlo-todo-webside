"use client";

import { Check, Globe, Lock, Search, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BoardMemberInfo } from "./types";

export interface BoardAccessTabProps {
  isPrivate: boolean;
  onSwitchToPrivate: () => void;
  projectMembersCount: number;
  filteredMembers: BoardMemberInfo[];
  selectedMemberIds: string[];
  memberSearchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleMember: (userId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function BoardAccessTab({
  isPrivate,
  onSwitchToPrivate,
  projectMembersCount,
  filteredMembers,
  selectedMemberIds,
  memberSearchQuery,
  onSearchChange,
  onToggleMember,
  onSelectAll,
  onClearAll
}: BoardAccessTabProps) {
  if (!isPrivate) {
    return (
      <div className="pt-3 mt-0">
        <div className="rounded-xl border border-stone-200/90 bg-stone-100/50 p-5 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl border border-dusk-lavender/30 bg-dusk-lavender/10 text-dusk-lavender">
            <Globe className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-200">This board is Public</h4>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            All {projectMembersCount} workspace members automatically have access to this board.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 text-xs"
            onClick={onSwitchToPrivate}
          >
            <Lock className="h-3 w-3 mr-1.5 text-dusk-amber" />
            Switch to Private to Restrict Access
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-3 mt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Board Members Access</p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Select which workspace members can see and manage cards on this private board.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={onSelectAll}
          >
            Select All
          </Button>
          <span className="text-stone-400 dark:text-stone-600">·</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={onClearAll}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Search members */}
      <div className="group/search relative flex items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-stone-400 transition-colors group-focus-within/search:text-indigo-600 dark:text-stone-500 dark:group-focus-within/search:text-dusk-lavender" />
        <input
          type="text"
          value={memberSearchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search workspace members..."
          className="h-9.5 w-full rounded-xl border border-stone-200/90 bg-white pl-9.5 pr-8 text-xs font-medium text-stone-900 placeholder:text-stone-400 shadow-xs outline-none transition hover:border-stone-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-200 dark:placeholder:text-stone-500 dark:hover:border-white/20 dark:focus:border-dusk-lavender/50 dark:focus:bg-white/[0.07] dark:focus:ring-dusk-lavender/20"
        />
        {memberSearchQuery ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 grid h-5 w-5 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-200"
            aria-label="Clear member search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Member list */}
      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-soft rounded-xl border border-stone-200/90 bg-stone-100/70 p-2 dark:border-white/10 dark:bg-ink-950/40">
        {filteredMembers.length === 0 ? (
          <p className="py-4 text-center text-xs text-stone-500 font-mono">
            {memberSearchQuery ? "No members match search." : "No workspace members found."}
          </p>
        ) : (
          filteredMembers.map((m) => {
            const isSelected = selectedMemberIds.includes(m.id);
            return (
              <div
                key={m.id}
                onClick={() => onToggleMember(m.id)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border p-2 cursor-pointer transition select-none",
                  isSelected
                    ? "border-dusk-amber/40 bg-dusk-amber/15 text-stone-900 font-semibold dark:text-white"
                    : "border-stone-200/80 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50 dark:border-white/5 dark:bg-white/[0.02] dark:text-stone-400 dark:hover:border-white/15 dark:hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={m.avatar}
                    initials={m.name?.[0] || m.email[0]}
                    name={m.name || m.email}
                    size={28}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-stone-900 dark:text-stone-200">
                      {m.name || m.email.split("@")[0]}
                    </p>
                    <p className="truncate text-[10px] text-stone-500">{m.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {m.role && (
                    <span className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.2 text-[9px] font-mono text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
                      {m.role}
                    </span>
                  )}
                  <div className={cn(
                    "grid h-5 w-5 place-items-center rounded border transition",
                    isSelected
                      ? "border-dusk-amber bg-dusk-amber text-ink-950"
                      : "border-stone-300 bg-stone-100 dark:border-white/20 dark:bg-white/5"
                  )}>
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
