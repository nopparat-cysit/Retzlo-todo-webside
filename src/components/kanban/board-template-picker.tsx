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
      <div>
        <h4 id="board-template-heading" className="text-sm font-semibold text-theme-foreground">
          Start with a template
        </h4>
        <p className="mt-1 text-xs text-theme-muted">
          Preview the columns and their defaults. You can edit them after the board is created.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Board templates">
        {BOARD_TEMPLATES.map((template) => {
          const isSelected = template.id === selectedId;

          return (
            <button
              key={template.id}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onSelect(template.id)}
              className={cn(
                "group flex min-h-[76px] items-center gap-3 rounded-xl border p-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/60 disabled:cursor-not-allowed disabled:opacity-60",
                isSelected
                  ? "border-theme-accent bg-theme-paper-strong text-theme-foreground shadow-sm"
                  : "border-theme-border bg-theme-paper text-theme-muted hover:border-theme-accent hover:text-theme-foreground"
              )}
            >
              <Image
                src={templateIconPaths[template.id]}
                alt=""
                aria-hidden="true"
                width={48}
                height={48}
                className="h-10 w-10 shrink-0 object-contain transition-transform group-hover:scale-105"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold leading-tight">{template.name}</span>
                  {isSelected && <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-theme-accent" />}
                </span>
                <span className="mt-1 block text-[10px] leading-snug text-theme-muted">
                  {template.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-theme-border bg-theme-panel p-2.5 sm:p-3" aria-live="polite">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-theme-foreground">{selectedTemplate.name} preview</p>
          <span className="text-[10px] text-theme-muted">{selectedTemplate.columns.length} columns</span>
        </div>
        <div
          className={cn(
            selectedTemplate.columns.length > 3
              ? "scrollbar-soft flex items-center gap-1.5 overflow-x-auto pb-1"
              : "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {selectedTemplate.columns.map((column, index) => {
            const color = getColumnThemeOption(column.color);
            const status = columnStatusOptions.find((option) => option.value === column.defaultCardStatus);
            const icon = columnIconOptions.find((option) => option.id === column.icon);
            const statusMeta = getStatusMeta(column.defaultCardStatus);
            const isFlow = selectedTemplate.columns.length > 3;

            return (
              <Fragment key={`${selectedTemplate.id}-${column.name}-${index}`}>
                <div
                  className={cn(
                    "relative min-w-0 overflow-hidden rounded-lg border p-2.5",
                    isFlow && "w-[112px] shrink-0 md:w-auto md:flex-1",
                    color.columnClass
                  )}
                >
                  <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", color.accentBarClass)} />
                  <div className="flex min-w-0 items-center gap-1.5 pl-1">
                    <ColumnIconGlyph icon={column.icon} className={cn("h-3.5 w-3.5 shrink-0", color.iconColorClass)} />
                    <span className="truncate text-[11px] font-medium text-theme-foreground">{column.name}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-1 text-[10px]">
                    <span className={cn("rounded-full border px-1.5 py-0.5", statusMeta.badgeClass)}>
                      {status?.label ?? column.defaultCardStatus}
                    </span>
                    <span className="inline-flex items-center gap-1 text-theme-muted" title={`Column color: ${color.label}; icon: ${icon?.label ?? column.icon}`}>
                      <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", color.swatchClass)} />
                      {color.label}
                    </span>
                  </div>
                </div>
                {isFlow && index < selectedTemplate.columns.length - 1 && (
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-theme-muted opacity-60" />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
      <p className="text-[10px] leading-relaxed text-theme-muted">
        Columns only—no sample cards. You can edit the board after creating it.
      </p>
    </section>
  );
}
