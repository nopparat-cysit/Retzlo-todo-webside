"use client";

import { Globe, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface BoardGeneralTabProps {
  name: string;
  onNameChange: (val: string) => void;
  isPrivate: boolean;
  onPrivacyChange: (val: boolean) => void;
  canManage: boolean;
  selectedMemberCount: number;
  totalProjectMembersCount: number;
  onGoToAccessTab: () => void;
}

export function BoardGeneralTab({
  name,
  onNameChange,
  isPrivate,
  onPrivacyChange,
  canManage,
  selectedMemberCount,
  totalProjectMembersCount,
  onGoToAccessTab
}: BoardGeneralTabProps) {
  return (
    <div className="space-y-4 pt-3 mt-0">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="board-name-input" className="font-semibold text-stone-700 dark:text-stone-200">
            Board Name
          </label>
          <span className="text-stone-500 font-mono text-[11px]">{name.length}/80</span>
        </div>
        <Input
          id="board-name-input"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={80}
          required
          placeholder="e.g. Sprint 1, Marketing Campaign, Backlog"
          disabled={!canManage}
        />
      </div>

      {/* Privacy Selector */}
      <div className="rounded-xl border border-stone-200/90 bg-stone-100/60 p-4 space-y-3 dark:border-white/10 dark:bg-white/[0.03]">
        <div>
          <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Board Privacy & Access Mode</p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            Control who can discover, view, and interact with tasks on this board.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={!canManage}
            onClick={() => onPrivacyChange(false)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3 text-left transition",
              !isPrivate
                ? "border-dusk-lavender/60 bg-dusk-lavender/15 text-stone-900 ring-1 ring-dusk-lavender/30 dark:text-white"
                : "border-stone-200/80 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-300"
            )}
          >
            <div className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
              !isPrivate
                ? "border-dusk-lavender/40 bg-dusk-lavender/20 text-dusk-lavender"
                : "border-stone-200 bg-stone-100 text-stone-500 dark:border-white/10 dark:bg-white/5"
            )}>
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Public Workspace Board</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                All workspace members can view and collaborate on this board.
              </p>
            </div>
          </button>

          <button
            type="button"
            disabled={!canManage}
            onClick={() => onPrivacyChange(true)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3 text-left transition",
              isPrivate
                ? "border-dusk-amber/60 bg-dusk-amber/15 text-stone-900 ring-1 ring-dusk-amber/30 dark:text-white"
                : "border-stone-200/80 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-stone-400 dark:hover:border-white/20 dark:hover:text-stone-300"
            )}
          >
            <div className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
              isPrivate
                ? "border-dusk-amber/40 bg-dusk-amber/20 text-dusk-amber"
                : "border-stone-200 bg-stone-100 text-stone-500 dark:border-white/10 dark:bg-white/5"
            )}>
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Private Sub-Board</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                Restricted board. Only specifically selected members have access.
              </p>
            </div>
          </button>
        </div>

        {isPrivate && (
          <div className="flex items-center justify-between rounded-lg border border-dusk-amber/30 bg-dusk-amber/10 px-3 py-2 text-xs text-dusk-amber dark:border-dusk-amber/20 dark:bg-dusk-amber/5">
            <span className="font-medium">
              🔒 Currently {selectedMemberCount} of {totalProjectMembersCount} members granted access.
            </span>
            <button
              type="button"
              onClick={onGoToAccessTab}
              className="font-semibold underline hover:text-stone-900 transition dark:hover:text-white"
            >
              Configure Members →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
