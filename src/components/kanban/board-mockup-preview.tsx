"use client";

import { CheckSquare, Clock, Eye, FolderKanban, Globe, Lock } from "lucide-react";

import { ColumnIconGlyph } from "@/components/kanban/column-icon-picker";
import {
  getColumnThemeOption,
  type ColumnIconId,
  type ColumnThemeId
} from "@/lib/kanban/column-settings";
import { getStatusMeta } from "@/lib/kanban/status";
import { cn } from "@/lib/utils";

export interface MockupColumnItem {
  id?: string;
  name: string;
  color?: ColumnThemeId | string | null;
  icon?: ColumnIconId | string | null;
  defaultCardStatus?: string | null;
  wipLimit?: number | null;
  cardCount?: number;
  isHighlighted?: boolean;
  highlightBadge?: string;
}

export interface MockupSampleCard {
  code: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  priorityLabel: string;
  checklist: string;
  dueDate: string;
  assignee: string;
  storyPoints?: string;
}

const SAMPLE_TITLES_BY_KEYWORD: Array<{
  match: RegExp;
  cards: [string, string];
}> = [
  {
    match: /backlog|inbox|idea|todo|ready/i,
    cards: [
      "Finalize Q4 product roadmap & KPIs",
      "Design system token audit for light mode"
    ]
  },
  {
    match: /sprint|next|plan/i,
    cards: [
      "Implement real-time board sync indicator",
      "Prepare user onboarding checklist flow"
    ]
  },
  {
    match: /progress|doing|active|dev|code/i,
    cards: [
      "Integrate payment gateway webhook handler",
      "Optimize Kanban drag-and-drop animations"
    ]
  },
  {
    match: /review|qa|test|wait|block|stage/i,
    cards: [
      "Security & rate-limit verification pass",
      "Cross-browser responsive layout QA"
    ]
  },
  {
    match: /done|complete|publish|ship|release/i,
    cards: [
      "Configure automated database backups",
      "Launch v2 workspace navigation shell"
    ]
  }
];

export function buildMockupSampleCards(
  columnName: string,
  colIndex: number,
  memberInitials?: string[]
): MockupSampleCard[] {
  const matched = SAMPLE_TITLES_BY_KEYWORD.find((entry) =>
    entry.match.test(columnName)
  );
  const titles = matched?.cards ?? [
    `Prepare ${columnName || "workflow"} deliverables`,
    `Review ${columnName || "stage"} acceptance criteria`
  ];

  const pool =
    memberInitials && memberInitials.length > 0
      ? memberInitials
      : ["NP", "AI", "JD", "TK"];

  const baseCode = 101 + colIndex * 2;
  const firstPriority: "HIGH" | "MEDIUM" | "LOW" =
    colIndex === 0 ? "HIGH" : colIndex === 1 ? "MEDIUM" : "LOW";
  const secondPriority: "HIGH" | "MEDIUM" | "LOW" =
    colIndex % 2 === 0 ? "MEDIUM" : "HIGH";

  return [
    {
      code: `TSK-${baseCode}`,
      title: titles[0],
      priority: firstPriority,
      priorityLabel:
        firstPriority === "HIGH"
          ? "High"
          : firstPriority === "MEDIUM"
            ? "Medium"
            : "Low",
      checklist: colIndex >= 2 ? "4/4" : "1/4",
      dueDate: colIndex === 0 ? "Oct 14" : colIndex === 1 ? "Oct 16" : "Oct 18",
      assignee: pool[colIndex % pool.length] ?? "NP",
      storyPoints: colIndex === 0 ? "5 pts" : "3 pts"
    },
    {
      code: `TSK-${baseCode + 1}`,
      title: titles[1],
      priority: secondPriority,
      priorityLabel: secondPriority === "HIGH" ? "High" : "Medium",
      checklist: colIndex >= 2 ? "3/3" : "2/3",
      dueDate: colIndex === 0 ? "Oct 15" : "Oct 20",
      assignee: pool[(colIndex + 1) % pool.length] ?? "AI",
      storyPoints: "2 pts"
    }
  ];
}

export interface BoardMockupPreviewProps {
  title?: string;
  badgeText?: string;
  subtitle?: string;
  boardName?: string;
  isPrivate?: boolean;
  memberInitials?: string[];
  totalMemberCount?: number;
  columns: MockupColumnItem[];
  showBoardHeader?: boolean;
  compact?: boolean;
  className?: string;
}

export function BoardMockupPreview({
  title = "Kanban Mockup Preview",
  badgeText,
  subtitle,
  boardName,
  isPrivate = false,
  memberInitials = [],
  totalMemberCount,
  columns,
  showBoardHeader = false,
  compact = false,
  className
}: BoardMockupPreviewProps) {
  const displayInitials =
    memberInitials.length > 0 ? memberInitials : ["NP", "AI", "JD"];

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-indigo-500/35 bg-gradient-to-b from-indigo-50/50 via-white to-indigo-50/30 p-3 sm:p-3.5 dark:border-dusk-lavender/35 dark:from-ink-950/70 dark:via-ink-950/50 dark:to-stone-900/60 shadow-xs space-y-2.5",
        className
      )}
    >
      {/* Top Preview Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-indigo-600 text-white shrink-0 shadow-2xs">
            <Eye className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-100 truncate">
                {title}
              </span>
              {badgeText && (
                <span className="rounded-md border border-indigo-200/80 bg-white/90 px-1.5 py-0.2 text-[9px] font-bold text-indigo-700 dark:border-white/10 dark:bg-white/10 dark:text-dusk-lavender">
                  {badgeText}
                </span>
              )}
              <span className="rounded-md bg-indigo-500/15 px-1.5 py-0.2 font-mono text-[10px] font-bold text-indigo-700 dark:text-dusk-lavender">
                {columns.length} {columns.length === 1 ? "column" : "columns"}
              </span>
            </div>
            {subtitle && (
              <p className="text-[11px] text-indigo-900/75 dark:text-indigo-200/75 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <span className="rounded-full border border-indigo-200/70 bg-white/80 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:text-dusk-lavender">
          Live Interactive Mockup
        </span>
      </div>

      {/* Simulated Board Topbar Header (when creating/editing a board) */}
      {showBoardHeader && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200/80 bg-white/95 px-3 py-2 shadow-2xs dark:border-white/10 dark:bg-stone-900/90">
          <div className="flex items-center gap-2 min-w-0">
            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
              <FolderKanban className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
              {boardName?.trim() ? boardName.trim() : "Untitled Board"}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold shrink-0",
                isPrivate
                  ? "border-amber-300/70 bg-amber-500/10 text-amber-700 dark:border-dusk-amber/40 dark:bg-dusk-amber/15 dark:text-dusk-amber"
                  : "border-emerald-300/70 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
              )}
            >
              {isPrivate ? (
                <>
                  <Lock className="h-2.5 w-2.5" />
                  <span>Private Sub-Board</span>
                </>
              ) : (
                <>
                  <Globe className="h-2.5 w-2.5" />
                  <span>Public Workspace</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex -space-x-1.5">
              {displayInitials.slice(0, 4).map((initials, idx) => (
                <div
                  key={`${initials}-${idx}`}
                  className="grid h-5 w-5 place-items-center rounded-full border border-white bg-indigo-100 text-[8px] font-bold text-indigo-700 shadow-2xs dark:border-stone-900 dark:bg-dusk-lavender/25 dark:text-dusk-lavender"
                >
                  {initials}
                </div>
              ))}
            </div>
            {typeof totalMemberCount === "number" && (
              <span className="font-mono text-[10px] text-stone-500 dark:text-stone-400">
                {totalMemberCount} {totalMemberCount === 1 ? "member" : "members"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Kanban Board Columns Track */}
      <div className="relative rounded-xl border border-indigo-200/70 bg-stone-100/65 dark:border-white/10 dark:bg-stone-900/55 p-2 sm:p-2.5 overflow-hidden shadow-2xs">
        <div className="flex gap-2.5 overflow-x-auto scrollbar-soft pb-1 pt-0.5">
          {columns.map((col, colIndex) => {
            const theme = getColumnThemeOption(col.color);
            const statusMeta = getStatusMeta(col.defaultCardStatus ?? "TODO");
            const sampleCards = buildMockupSampleCards(
              col.name,
              colIndex,
              displayInitials
            );
            const visibleCards = compact ? sampleCards.slice(0, 1) : sampleCards;
            const displayCount =
              typeof col.cardCount === "number"
                ? col.cardCount
                : sampleCards.length;

            return (
              <div
                key={col.id ?? `${col.name}-${colIndex}`}
                className={cn(
                  "relative flex flex-col rounded-xl border bg-white/95 dark:bg-stone-900/95 shadow-2xs overflow-hidden transition-all",
                  columns.length === 1 ? "w-full" : "w-48 sm:w-52 shrink-0",
                  col.isHighlighted
                    ? "border-2 border-indigo-500 ring-2 ring-indigo-500/20 dark:border-dusk-lavender dark:ring-dusk-lavender/25"
                    : "border-stone-200/80 dark:border-white/10"
                )}
              >

                {/* Column Header */}
                <div
                  className={cn(
                    "flex items-center justify-between gap-1.5 px-2.5 py-2 border-b border-stone-100 dark:border-white/5",
                    theme.columnClass
                  )}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ColumnIconGlyph
                      icon={(col.icon as ColumnIconId) || "kanban"}
                      className={cn("h-3.5 w-3.5 shrink-0", theme.iconColorClass)}
                    />
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">
                      {col.name?.trim() ? col.name.trim() : "Untitled Column"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {col.highlightBadge && (
                      <span className="rounded bg-indigo-600 px-1 py-0.2 text-[8px] font-bold uppercase text-white">
                        {col.highlightBadge}
                      </span>
                    )}
                    {col.wipLimit ? (
                      <span
                        className="rounded-full border border-amber-300/80 bg-amber-500/15 px-1.5 py-0.2 font-mono text-[9px] font-bold text-amber-800 dark:border-dusk-amber/40 dark:bg-dusk-amber/15 dark:text-dusk-amber"
                        title={`WIP Limit: ${col.wipLimit}`}
                      >
                        {displayCount}/{col.wipLimit}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] font-bold text-stone-500 bg-stone-200/60 dark:bg-white/10 dark:text-stone-300 px-1.5 py-0.2 rounded-full">
                        {displayCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Column Subheader: Default Status & Theme */}
                <div className="flex items-center justify-between gap-1 px-2.5 py-1 bg-stone-50/70 dark:bg-white/[0.02] border-b border-stone-100 dark:border-white/5 text-[9px]">
                  <span
                    className={cn(
                      "rounded-full border px-1.5 py-0.2 font-semibold",
                      statusMeta.badgeClass
                    )}
                  >
                    {statusMeta.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-stone-500 dark:text-stone-400">
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full", theme.swatchClass)}
                    />
                    <span>{theme.label}</span>
                  </span>
                </div>

                {/* Sample Cards List */}
                <div className="p-2 space-y-2">
                  {visibleCards.map((card) => (
                    <div
                      key={card.code}
                      className="rounded-lg border border-stone-200/80 bg-white dark:border-white/10 dark:bg-stone-800/80 p-2 space-y-1.5 shadow-2xs text-left"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-stone-300">
                          {card.code}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-1.5 py-0.2 text-[9px] font-bold border",
                            card.priority === "HIGH" &&
                              "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-400",
                            card.priority === "MEDIUM" &&
                              "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400",
                            card.priority === "LOW" &&
                              "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full shrink-0",
                              card.priority === "HIGH" && "bg-red-500",
                              card.priority === "MEDIUM" && "bg-amber-500",
                              card.priority === "LOW" && "bg-emerald-500"
                            )}
                          />
                          <span>{card.priorityLabel}</span>
                        </span>
                      </div>

                      <p className="text-[11px] font-medium text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
                        {card.title}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-white/5 text-[9px] text-stone-500 dark:text-stone-400">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 font-mono">
                            <CheckSquare className="h-2.5 w-2.5 text-stone-400" />
                            <span>{card.checklist}</span>
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5 text-stone-400" />
                            <span>{card.dueDate}</span>
                          </span>
                        </div>
                        <div className="h-4 w-4 rounded-full bg-indigo-100 text-indigo-700 dark:bg-dusk-lavender/20 dark:text-dusk-lavender font-bold text-[8px] grid place-items-center shrink-0">
                          {card.assignee}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
