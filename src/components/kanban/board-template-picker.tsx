"use client";

import { Fragment } from "react";
import { Check, ChevronRight } from "lucide-react";
import Image from "next/image";

import { ColumnIconGlyph } from "@/components/kanban/column-icon-picker";
import { cn } from "@/lib/utils";
import { BOARD_TEMPLATES, type BoardTemplateId } from "@/lib/kanban/board-templates";
import { getColumnThemeOption, columnIconOptions, columnStatusOptions } from "@/lib/kanban/column-settings";
import { getStatusMeta } from "@/lib/kanban/status";

const templateIconPaths: Record<BoardTemplateId, string> = {
  standard: "/board-templates/standard.png",
  scrum: "/board-templates/scrum.png",
  software: "/board-templates/software.png",
  marketing: "/board-templates/marketing.png",
  personal: "/board-templates/personal.png"
};

export function BoardTemplatePicker({
  selectedId,
  onSelect,
  disabled = false
}: {
  selectedId: BoardTemplateId;
  onSelect: (id: BoardTemplateId) => void;
  disabled?: boolean;
}) {
  const selectedTemplate = BOARD_TEMPLATES.find((template) => template.id === selectedId) ?? BOARD_TEMPLATES[0];

  return (
    <section aria-labelledby="board-template-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h4 id="board-template-heading" className="text-xs font-semibold text-theme-foreground">
            Select Board Template
          </h4>
          <p className="mt-0.5 text-[11px] text-theme-muted">
            Choose a workflow pipeline that matches your project needs
          </p>
        </div>
        <span className="rounded-full border border-theme-border bg-theme-paper px-2 py-0.5 font-mono text-[10px] text-theme-muted shrink-0">
          5 Templates
        </span>
      </div>

      {/* Responsive 5-column balanced grid — no awkward empty slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2" aria-label="Board templates">
        {BOARD_TEMPLATES.map((template, index) => {
          const isSelected = template.id === selectedId;
          const isLastOdd = index === 4;

          return (
            <button
              key={template.id}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onSelect(template.id)}
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border p-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/60 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer",
                isLastOdd && "sm:col-span-2 lg:col-span-1",
                isSelected
                  ? "border-theme-accent bg-theme-paper-strong text-theme-foreground shadow-xs ring-1 ring-theme-accent/40"
                  : "border-theme-border bg-theme-paper text-theme-muted hover:border-theme-accent/60 hover:text-theme-foreground"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="relative h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                    <Image
                      src={templateIconPaths[template.id]}
                      alt=""
                      aria-hidden="true"
                      width={32}
                      height={32}
                      className="h-full w-full object-contain transition-transform group-hover:scale-105"
                    />
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 font-mono text-[9px] font-semibold border transition-colors",
                      isSelected
                        ? "border-theme-accent/40 bg-theme-accent/15 text-theme-foreground"
                        : "border-theme-border bg-theme-panel text-theme-muted"
                    )}
                  >
                    {template.columns.length} Steps
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold leading-tight text-theme-foreground truncate">
                      {template.name}
                    </span>
                    {isSelected && (
                      <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-theme-accent text-white dark:text-stone-900 shadow-2xs">
                        <Check aria-hidden="true" className="h-2 w-2 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] leading-snug text-theme-muted line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Connected workflow pipeline preview */}
      <div className="rounded-xl border border-theme-border bg-theme-panel p-2.5 sm:p-3" aria-live="polite">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-theme-foreground truncate">
              {selectedTemplate.name}
            </span>
            <span className="rounded-md border border-theme-border bg-theme-paper px-1.5 py-0.2 font-mono text-[10px] text-theme-muted shrink-0">
              {selectedTemplate.columns.length} Columns
            </span>
          </div>
          <span className="text-[10px] text-theme-muted hidden sm:inline shrink-0">
            Default Workflow Sequence
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-soft pb-1">
          {selectedTemplate.columns.map((column, index) => {
            const color = getColumnThemeOption(column.color);
            const status = columnStatusOptions.find((option) => option.value === column.defaultCardStatus);
            const icon = columnIconOptions.find((option) => option.id === column.icon);
            const statusMeta = getStatusMeta(column.defaultCardStatus);

            return (
              <Fragment key={`${selectedTemplate.id}-${column.name}-${index}`}>
                <div
                  className={cn(
                    "relative min-w-[110px] sm:min-w-[125px] flex-1 overflow-hidden rounded-lg border p-2",
                    color.columnClass
                  )}
                >
                  <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", color.accentBarClass)} />
                  <div className="flex min-w-0 items-center gap-1.5 pl-1">
                    <ColumnIconGlyph icon={column.icon} className={cn("h-3.5 w-3.5 shrink-0", color.iconColorClass)} />
                    <span className="truncate text-[11px] font-medium text-theme-foreground">{column.name}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1 pl-1 text-[9px]">
                    <span className={cn("rounded-full border px-1.5 py-0.2", statusMeta.badgeClass)}>
                      {status?.label ?? column.defaultCardStatus}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-theme-muted" title={`Column color: ${color.label}; icon: ${icon?.label ?? column.icon}`}>
                      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", color.swatchClass)} />
                      {color.label}
                    </span>
                  </div>
                </div>
                {index < selectedTemplate.columns.length - 1 && (
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-theme-muted opacity-40" />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
      <p className="text-[10px] leading-relaxed text-theme-muted">
        💡 This board will be created with the workflow columns shown above. You can add, remove, or customize columns at any time.
      </p>
    </section>
  );
}
