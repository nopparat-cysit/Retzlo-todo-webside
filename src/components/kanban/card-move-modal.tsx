"use client";

import { ArrowRightLeft, Check, X } from "lucide-react";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { ColumnIconGlyph } from "@/components/kanban/column-icon-picker";
import { getColumnThemeOption } from "@/lib/kanban/column-settings";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";
import type { Card, ColumnWithCards } from "@/types/kanban";

export interface CardMoveModalProps {
  open: boolean;
  onClose: () => void;
  card: Card | null;
  currentColumnId: string;
  columns: ColumnWithCards[];
  onMove: (card: Card, targetColumnId: string) => Promise<void> | void;
}

export function CardMoveModal({
  open,
  onClose,
  card,
  currentColumnId,
  columns,
  onMove
}: CardMoveModalProps) {
  const { isEn } = useLanguage();

  if (!card) return null;

  const currentColumn = columns.find((c) => c.id === currentColumnId);
  const currentTheme = currentColumn ? getColumnThemeOption(currentColumn.color) : null;

  const handleSelectColumn = (targetColumnId: string) => {
    if (targetColumnId === currentColumnId) return;
    onMove(card, targetColumnId);
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      contentClassName="max-w-md w-full mx-auto overflow-hidden rounded-2xl border border-stone-300 bg-white text-stone-900 shadow-2xl dark:border-white/15 dark:bg-[#0e1025] dark:text-stone-100"
      labelledBy="card-move-modal-title"
    >
      <div className="flex h-full max-h-[85vh] flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/80 p-4 sm:p-5 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="card-move-modal-title"
                className="text-base font-semibold text-stone-900 dark:text-stone-100"
              >
                {isEn ? "Move Card" : "ย้ายการ์ด"}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs font-medium text-stone-600 dark:text-stone-300 truncate max-w-[180px] sm:max-w-[220px]">
                  {card.title}
                </p>
                {currentColumn ? (
                  <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border border-stone-200/80 bg-stone-100/80 text-stone-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-stone-300 shrink-0">
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", currentTheme?.swatchClass)} />
                    <span className="truncate max-w-[80px]">{currentColumn.name}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close move modal"
            className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-white/10 dark:hover:text-stone-200 cursor-pointer touch-manipulation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body: Columns list */}
        <div className="scrollbar-soft flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2 px-1">
            {isEn ? "Select destination column:" : "เลือกคอลัมน์ปลายทาง:"}
          </p>
          {columns.map((column) => {
            const isCurrent = column.id === currentColumnId;
            const theme = getColumnThemeOption(column.color);

            return (
              <button
                key={column.id}
                type="button"
                disabled={isCurrent}
                onClick={() => handleSelectColumn(column.id)}
                className={cn(
                  "min-h-[44px] w-full flex items-center justify-between p-2.5 rounded-xl border transition text-left cursor-pointer touch-manipulation",
                  isCurrent
                    ? "border-indigo-500 bg-indigo-50 text-indigo-900 font-semibold ring-1 ring-indigo-400/50 dark:border-dusk-lavender/60 dark:bg-dusk-lavender/15 dark:text-dusk-lavender dark:ring-dusk-lavender/30 cursor-default"
                    : "border-stone-200 bg-stone-100/70 hover:bg-stone-100 hover:border-indigo-300 text-stone-800 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-white/20 dark:text-stone-200"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={cn("h-3 w-3 rounded-full shrink-0", theme.swatchClass)} />
                  <ColumnIconGlyph icon={column.icon} className={cn("h-4 w-4 shrink-0", theme.iconColorClass)} />
                  <span className={cn("text-sm font-medium truncate", isCurrent ? "text-indigo-900 font-semibold dark:text-dusk-lavender" : "text-stone-800 dark:text-stone-200")}>
                    {column.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600 text-white dark:bg-dusk-lavender dark:text-ink-950 px-2 py-0.5 text-xs font-bold shadow-xs">
                      <Check className="h-3.5 w-3.5" />
                      <span>{isEn ? "Current" : "ปัจจุบัน"}</span>
                    </span>
                  ) : (
                    <span className="rounded-md border border-stone-200/80 bg-white px-2 py-0.5 text-xs font-semibold text-stone-600 dark:border-white/15 dark:bg-white/10 dark:text-stone-300">
                      {column.cards.length} {column.cards.length === 1 ? (isEn ? "card" : "การ์ด") : (isEn ? "cards" : "การ์ด")}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-stone-200/70 p-3.5 sm:p-4 dark:border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-10 sm:h-9 w-full sm:w-auto touch-manipulation text-xs"
          >
            {isEn ? "Cancel" : "ยกเลิก"}
          </Button>
        </div>
      </div>
    </AppModal>
  );
}
