"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Flame,
  KanbanSquare,
  ListChecks,
  Sparkles,
  Star,
  Table,
  Zap
} from "lucide-react";
import type { Card, CardAssignee, ColumnWithCards, CustomPriority } from "@/types/kanban";
import { getPriorityMeta, resolveBoardPriorities } from "@/lib/kanban/priority";
import { getStatusMeta } from "@/lib/kanban/status";
import { getColumnThemeOption } from "@/lib/kanban/column-settings";
import { cn } from "@/lib/utils";

export interface BoardExportDocumentProps {
  boardTitle: string;
  projectName?: string;
  columns: ColumnWithCards[];
  members?: CardAssignee[];
  boardPriorities?: CustomPriority[];
  scope?: "all" | "filtered";
  layout?: "kanban" | "table";
  themeStyle?: "light" | "dark";
  timestamp?: string;
}

function formatExportDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}`;
}

export function BoardExportDocument({
  boardTitle,
  projectName,
  columns,
  members = [],
  boardPriorities,
  scope = "all",
  layout = "kanban",
  themeStyle = "light",
  timestamp
}: BoardExportDocumentProps) {
  const resolvedPriorities = useMemo(
    () => resolveBoardPriorities(boardPriorities),
    [boardPriorities]
  );

  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) {
      map.set(m.id, m.name || m.email || m.id);
    }
    return map;
  }, [members]);

  // Compute metrics
  const stats = useMemo(() => {
    let totalCards = 0;
    let totalPoints = 0;
    let todoCount = 0;
    let doingCount = 0;
    let waitingCount = 0;
    let doneCount = 0;
    let overdueCount = 0;

    const now = Date.now();

    for (const col of columns) {
      for (const card of col.cards) {
        totalCards++;
        if (typeof card.difficulty === "number") {
          totalPoints += card.difficulty;
        }

        const upper = (card.status || "").toUpperCase();
        if (upper === "DONE") {
          doneCount++;
        } else if (upper === "DOING") {
          doingCount++;
        } else if (upper === "WAITING") {
          waitingCount++;
        } else {
          todoCount++;
        }

        if (card.dueDate && upper !== "DONE") {
          const dueTime = new Date(card.dueDate).getTime();
          if (!isNaN(dueTime) && dueTime < now) {
            overdueCount++;
          }
        }
      }
    }

    const completionRate = totalCards > 0 ? Math.round((doneCount / totalCards) * 100) : 0;

    return {
      totalCards,
      totalPoints,
      todoCount,
      doingCount,
      waitingCount,
      doneCount,
      overdueCount,
      completionRate
    };
  }, [columns]);

  const formattedTimestamp = useMemo(() => {
    if (timestamp) return timestamp;
    const now = new Date();
    const d = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = now.getFullYear();
    const hr = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    return `${d}/${m}/${y} ${hr}:${min}`;
  }, [timestamp]);

  const isDark = themeStyle === "dark";

  // Calculate dynamic width for Kanban so no columns ever clip
  const kanbanWidth = Math.max(1200, columns.length * 340 + 64);

  return (
    <div
      className={cn(
        "font-sans antialiased text-left p-8 transition-colors select-none",
        isDark ? "bg-[#0b0c1b] text-stone-100" : "bg-[#fcfbf9] text-stone-900"
      )}
      style={{
        width: layout === "kanban" ? `${kanbanWidth}px` : "1240px",
        minHeight: "800px",
        boxSizing: "border-box"
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          EXECUTIVE DOCUMENT HEADER
      ══════════════════════════════════════════════════════════════════════════ */}
      <header
        className={cn(
          "rounded-2xl p-6 border mb-6 shadow-sm",
          isDark
            ? "border-white/10 bg-[#12142d]/80 backdrop-blur-md"
            : "border-stone-200/90 bg-white"
        )}
      >
        <div className="flex items-start justify-between gap-6 pb-6 border-b border-stone-200/60 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase",
                  isDark
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                )}
              >
                <Sparkles className="h-3 w-3" />
                RETZLO WORKSPACE • PROJECT EXPORT
              </span>
              {projectName && (
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded",
                    isDark ? "bg-white/5 text-stone-400" : "bg-stone-100 text-stone-600"
                  )}
                >
                  {projectName}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight">
              {boardTitle || "Kanban Board"}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  isDark ? "text-stone-400" : "text-stone-500"
                )}
              >
                <CalendarDays className="h-3.5 w-3.5 opacity-70" />
                Exported: <span className="font-medium">{formattedTimestamp}</span>
              </span>
              <span className="opacity-30">•</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  isDark ? "text-stone-400" : "text-stone-500"
                )}
              >
                <KanbanSquare className="h-3.5 w-3.5 opacity-70" />
                Scope:{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {scope === "filtered" ? "Current Filter" : "All Tasks in Board"}
                </span>
              </span>
              <span className="opacity-30">•</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  isDark ? "text-stone-400" : "text-stone-500"
                )}
              >
                Structure: <span className="font-medium">{columns.length} Columns</span>
              </span>
            </div>
          </div>

          {/* Completion Rate Badge */}
          <div
            className={cn(
              "flex flex-col items-center justify-center px-6 py-3.5 rounded-xl border min-w-[150px] text-center",
              isDark
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-emerald-200 bg-emerald-50/70 text-emerald-800"
            )}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
              Overall Progress
            </span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-3xl font-black">{stats.completionRate}</span>
              <span className="text-lg font-bold">%</span>
            </div>
            <span className="text-[10px] opacity-75">
              Completed {stats.doneCount} of {stats.totalCards} tasks
            </span>
          </div>
        </div>

        {/* ── KPI Stat Metrics Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-5">
          {/* 1. Total tasks */}
          <div
            className={cn(
              "p-3 rounded-xl border flex flex-col justify-between",
              isDark ? "border-white/5 bg-white/[0.03]" : "border-stone-200/80 bg-stone-50/80"
            )}
          >
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
              Total Tasks
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold">{stats.totalCards}</span>
              {stats.totalPoints > 0 && (
                <span className="text-[10px] font-mono text-stone-400">
                  {stats.totalPoints} pts
                </span>
              )}
            </div>
          </div>

          {/* 2. To Do */}
          <div
            className={cn(
              "p-3 rounded-xl border flex flex-col justify-between",
              isDark ? "border-indigo-500/20 bg-indigo-500/5" : "border-indigo-100 bg-indigo-50/40"
            )}
          >
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
              To Do
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                {stats.todoCount}
              </span>
            </div>
          </div>

          {/* 3. In Progress */}
          <div
            className={cn(
              "p-3 rounded-xl border flex flex-col justify-between",
              isDark ? "border-teal-500/20 bg-teal-500/5" : "border-teal-100 bg-teal-50/40"
            )}
          >
            <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">
              In Progress
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-teal-700 dark:text-teal-300">
                {stats.doingCount}
              </span>
            </div>
          </div>

          {/* 4. Waiting */}
          <div
            className={cn(
              "p-3 rounded-xl border flex flex-col justify-between",
              isDark ? "border-amber-500/20 bg-amber-500/5" : "border-amber-100 bg-amber-50/40"
            )}
          >
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              Waiting
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-amber-700 dark:text-amber-300">
                {stats.waitingCount}
              </span>
            </div>
          </div>

          {/* 5. Done */}
          <div
            className={cn(
              "p-3 rounded-xl border flex flex-col justify-between",
              isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-100 bg-emerald-50/40"
            )}
          >
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Done
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {stats.doneCount}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {stats.completionRate}%
              </span>
            </div>
          </div>

          {/* 6. Overdue */}
          <div
            className={cn(
              "p-3 rounded-xl border flex flex-col justify-between",
              stats.overdueCount > 0
                ? isDark
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                  : "border-rose-200 bg-rose-50/80 text-rose-800"
                : isDark
                  ? "border-white/5 bg-white/[0.03] text-stone-500"
                  : "border-stone-200/80 bg-stone-50/80 text-stone-400"
            )}
          >
            <span className="text-[11px] font-medium flex items-center gap-1">
              {stats.overdueCount > 0 && <AlertTriangle className="h-3 w-3 text-rose-500" />}
              Overdue
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold">{stats.overdueCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYOUT 1: FULL PANORAMIC KANBAN BOARD (100% Columns)
      ══════════════════════════════════════════════════════════════════════════ */}
      {layout === "kanban" && (
        <main className="flex items-start gap-4 overflow-visible pb-12">
          {columns.map((column) => {
            const themeOption = getColumnThemeOption(column.color);

            return (
              <section
                key={column.id}
                className={cn(
                  "flex flex-col rounded-2xl border transition-colors shrink-0",
                  isDark
                    ? "border-white/10 bg-[#12142d]/50"
                    : "border-stone-200/90 bg-[#f4f2ee]"
                )}
                style={{ width: "320px" }}
              >
                {/* ── Column Header ── */}
                <div
                  className={cn(
                    "flex items-center justify-between border-b px-3.5 py-3 rounded-t-2xl",
                    isDark ? "border-white/10 bg-white/[0.02]" : "border-stone-200/80 bg-stone-100/80"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        themeOption.swatchClass || "bg-indigo-500"
                      )}
                    />
                    <h2 className="text-sm font-bold truncate">
                      {column.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold",
                        isDark ? "bg-white/10 text-stone-300" : "bg-white text-stone-700 shadow-2xs"
                      )}
                    >
                      {column.cards.length}
                    </span>
                    {typeof column.wipLimit === "number" && (
                      <span className="text-[10px] font-mono text-stone-400">
                        /{column.wipLimit}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Cards Stack (Zero Scroll, Natural Height) ── */}
                <div className="p-2.5 space-y-2.5">
                  {column.cards.length === 0 ? (
                    <div
                      className={cn(
                        "rounded-xl border border-dashed py-8 text-center text-xs",
                        isDark ? "border-white/10 text-stone-500" : "border-stone-300 text-stone-400"
                      )}
                    >
                      No cards in this column
                    </div>
                  ) : (
                    column.cards.map((card) => (
                      <ExportCardItem
                        key={card.id}
                        card={card}
                        memberMap={memberMap}
                        priorities={resolvedPriorities}
                        isDark={isDark}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </main>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYOUT 2: EXECUTIVE REPORT TABLE
      ══════════════════════════════════════════════════════════════════════════ */}
      {layout === "table" && (
        <main
          className={cn(
            "rounded-2xl border overflow-hidden shadow-sm",
            isDark ? "border-white/10 bg-[#12142d]/80" : "border-stone-200/90 bg-white"
          )}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr
                  className={cn(
                    "border-b font-bold tracking-wider uppercase text-[11px]",
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-stone-400"
                      : "border-stone-200 bg-stone-100/80 text-stone-600"
                  )}
                >
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3 w-32">Column</th>
                  <th className="py-3 px-4 min-w-[220px]">Task Title</th>
                  <th className="py-3 px-3 w-28 text-center">Status</th>
                  <th className="py-3 px-3 w-28 text-center">Priority</th>
                  <th className="py-3 px-3 w-36">Assignees</th>
                  <th className="py-3 px-3 w-28 text-center">Due Date</th>
                  <th className="py-3 px-3 w-24 text-center">Checklist</th>
                  <th className="py-3 px-3 w-16 text-center">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/60 dark:divide-white/5">
                {columns.flatMap((col) => col.cards.map((card, idx) => ({ card, col, idx }))).length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-stone-400">
                      No task data found for export
                    </td>
                  </tr>
                ) : (
                  columns.flatMap((col) =>
                    col.cards.map((card, idx) => {
                      const priorityMeta = getPriorityMeta(card.priority, resolvedPriorities);
                      const statusMeta = getStatusMeta(card.status);

                      // Assignee names
                      let assignees = "-";
                      if (card.assigneeIds && card.assigneeIds.length > 0) {
                        assignees = card.assigneeIds
                          .map((id) => memberMap.get(id) || id)
                          .join(", ");
                      } else if (card.assignees && card.assignees.length > 0) {
                        assignees = card.assignees
                          .map((a) => a.name || a.email || a.id)
                          .join(", ");
                      }

                      // Checklist progress
                      let checklistProgress = "-";
                      if (card.checklist && card.checklist.length > 0) {
                        const done = card.checklist.filter((i) => i.checked).length;
                        checklistProgress = `${done}/${card.checklist.length}`;
                      }

                      // Overdue
                      const isOverdue =
                        card.dueDate &&
                        card.status !== "DONE" &&
                        new Date(card.dueDate).getTime() < Date.now();

                      return (
                        <tr
                          key={card.id}
                          className={cn(
                            "transition-colors",
                            idx % 2 === 1
                              ? isDark
                                ? "bg-white/[0.015]"
                                : "bg-stone-50/50"
                              : "bg-transparent"
                          )}
                        >
                          <td className="py-2.5 px-3 text-center font-mono opacity-60">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-stone-700 dark:text-stone-300">
                            {col.name}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-stone-900 dark:text-stone-100">
                            <div className="flex items-center gap-1.5">
                              {card.isStarred && (
                                <Star className="h-3 w-3 fill-amber-400 text-amber-500 shrink-0" />
                              )}
                              <span>{card.title}</span>
                            </div>
                            {card.description && (
                              <p className="text-[11px] font-normal text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                                {card.description}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={cn(
                                "inline-block px-2 py-0.5 rounded text-[11px] font-bold border",
                                statusMeta.badgeClass
                              )}
                            >
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={cn(
                                "inline-block px-2 py-0.5 rounded text-[11px] font-semibold border",
                                priorityMeta.pillClass
                              )}
                            >
                              {priorityMeta.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-stone-600 dark:text-stone-300 truncate max-w-[150px]">
                            {assignees}
                          </td>
                          <td
                            className={cn(
                              "py-2.5 px-3 text-center font-mono text-[11px]",
                              isOverdue
                                ? "font-bold text-rose-600 dark:text-rose-400"
                                : "text-stone-600 dark:text-stone-400"
                            )}
                          >
                            {formatExportDate(card.dueDate)}
                            {isOverdue && <span className="block text-[9px]">⚠️ Overdue</span>}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-[11px] text-stone-600 dark:text-stone-400">
                            {checklistProgress}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-stone-700 dark:text-stone-300">
                            {card.difficulty ?? "-"}
                          </td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* ── Document Footer ── */}
      <footer className="mt-8 pt-4 border-t border-stone-200/80 dark:border-white/10 flex items-center justify-between text-[11px] text-stone-400">
        <span>
          Retzlo Work &amp; Life Management • Formatted specifically for export documents
        </span>
        <span>Page 1/1</span>
      </footer>
    </div>
  );
}

/**
 * Clean unclipped card item for export layout
 */
function ExportCardItem({
  card,
  memberMap,
  priorities,
  isDark
}: {
  card: Card;
  memberMap: Map<string, string>;
  priorities: CustomPriority[];
  isDark: boolean;
}) {
  const priorityMeta = getPriorityMeta(card.priority, priorities);
  const statusMeta = getStatusMeta(card.status);

  // Assignees
  const assigneeNames: string[] = [];
  if (card.assigneeIds && card.assigneeIds.length > 0) {
    for (const id of card.assigneeIds) {
      assigneeNames.push(memberMap.get(id) || id);
    }
  } else if (card.assignees && card.assignees.length > 0) {
    for (const a of card.assignees) {
      assigneeNames.push(a.name || a.email || a.id);
    }
  }

  // Checklists
  const checklistCount = card.checklist?.length || 0;
  const checklistDone = card.checklist?.filter((i) => i.checked).length || 0;

  // Overdue
  const isOverdue =
    card.dueDate &&
    card.status !== "DONE" &&
    new Date(card.dueDate).getTime() < Date.now();

  return (
    <article
      className={cn(
        "rounded-xl border p-3 shadow-xs transition-colors",
        isDark
          ? "border-white/10 bg-[#161836] text-stone-100"
          : "border-stone-200/90 bg-white text-stone-900"
      )}
    >
      {/* Top badges: Priority + Status + Star */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold border",
              priorityMeta.pillClass
            )}
          >
            {priorityMeta.label}
          </span>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold border",
              statusMeta.badgeClass
            )}
          >
            {statusMeta.label}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {card.difficulty && (
            <span
              className={cn(
                "px-1.5 py-0.2 rounded text-[10px] font-mono font-bold",
                isDark ? "bg-white/10 text-stone-300" : "bg-stone-100 text-stone-700"
              )}
            >
              {card.difficulty} pts
            </span>
          )}
          {card.isStarred && (
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 shrink-0" />
          )}
        </div>
      </div>

      {/* Card Title */}
      <h3 className="font-bold text-sm leading-snug break-words">
        {card.title}
      </h3>

      {/* Description Snippet */}
      {card.description && (
        <p
          className={cn(
            "text-xs leading-relaxed mt-1 line-clamp-2",
            isDark ? "text-stone-400" : "text-stone-500"
          )}
        >
          {card.description}
        </p>
      )}

      {/* Card Meta Footer (Due Date, Checklists, Assignees) */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-stone-200/60 dark:border-white/5 text-[11px]">
        <div className="flex items-center gap-2 flex-wrap">
          {card.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono font-medium",
                isOverdue
                  ? "text-rose-600 dark:text-rose-400 font-bold"
                  : isDark
                    ? "text-stone-400"
                    : "text-stone-500"
              )}
            >
              <Clock3 className="h-3 w-3" />
              {formatExportDate(card.dueDate)}
            </span>
          )}

          {checklistCount > 0 && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono",
                checklistDone === checklistCount
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : isDark
                    ? "text-stone-400"
                    : "text-stone-500"
              )}
            >
              <ListChecks className="h-3 w-3" />
              {checklistDone}/{checklistCount}
            </span>
          )}
        </div>

        {/* Assignees initials/names */}
        {assigneeNames.length > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-medium max-w-[120px] truncate",
                isDark ? "bg-white/10 text-stone-300" : "bg-stone-100 text-stone-700"
              )}
              title={assigneeNames.join(", ")}
            >
              👤 {assigneeNames[0]}
              {assigneeNames.length > 1 ? ` +${assigneeNames.length - 1}` : ""}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
