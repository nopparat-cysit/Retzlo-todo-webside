"use client";

import type { BoardColumnInfo } from "./types";

export interface BoardColumnsTabProps {
  columns: BoardColumnInfo[];
  totalCards: number;
}

export function BoardColumnsTab({ columns, totalCards }: BoardColumnsTabProps) {
  return (
    <div className="space-y-3 pt-3 mt-0">
      <div className="flex items-center justify-between text-xs">
        <div>
          <p className="font-semibold text-stone-800 dark:text-stone-200">Board Workflow Stages</p>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Overview of columns, card limits, and stages configured on this board.
          </p>
        </div>
        <div className="rounded-lg border border-stone-200/90 bg-stone-100/80 px-2.5 py-1 text-right font-mono text-[11px] text-stone-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300">
          Total: {totalCards} {totalCards === 1 ? "card" : "cards"}
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-stone-200/90 bg-stone-100/70 p-2.5 max-h-60 overflow-y-auto scrollbar-soft dark:border-white/10 dark:bg-ink-950/40">
        {columns.length === 0 ? (
          <p className="py-6 text-center text-xs text-stone-500 font-mono">
            No columns found on this board.
          </p>
        ) : (
          columns.map((col, index) => (
            <div
              key={col.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-stone-200/80 bg-white px-3 py-2 text-xs dark:border-white/10 dark:bg-white/[0.025]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-stone-100 font-mono text-[10px] text-stone-500 dark:bg-white/5 dark:text-stone-400">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-stone-900 truncate dark:text-stone-200">{col.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-stone-500">
                    <span>Status: {col.defaultCardStatus ?? "TODO"}</span>
                    {col.wipLimit ? (
                      <span className="text-dusk-amber font-semibold">
                        · WIP Limit: {col.wipLimit}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="rounded-full border border-stone-200/80 bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-700 font-semibold dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-300">
                  {col.cardCount ?? 0} cards
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-[11px] text-stone-500 italic">
        Tip: You can reorder, rename, or configure column WIP limits directly on the Kanban board view.
      </p>
    </div>
  );
}
