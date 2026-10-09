"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  FileDown,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  KanbanSquare,
  Layers,
  Loader2,
  Moon,
  Sparkles,
  SunMedium,
  Table as TableIcon,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppModal, AppModalFooter } from "@/components/ui/app-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import type { CardAssignee, ColumnWithCards, CustomPriority } from "@/types/kanban";
import {
  downloadCsv,
  downloadExcel,
  exportElementToPdf,
  exportElementToPng,
  prepareExportRows
} from "@/lib/kanban/export-board";
import { BoardExportDocument } from "@/components/kanban/board-export-document";

export interface BoardExportModalProps {
  open: boolean;
  onClose: () => void;
  boardTitle: string;
  projectName?: string;
  columns: ColumnWithCards[];
  filteredColumns?: ColumnWithCards[];
  members: CardAssignee[];
  boardPriorities?: CustomPriority[];
  viewportElementId?: string;
  isFiltered?: boolean;
}

export type ExportFormat = "excel" | "csv" | "pdf" | "png";
export type ExportLayout = "kanban" | "table";
export type ExportTheme = "light" | "dark";

export function BoardExportModal({
  open,
  onClose,
  boardTitle,
  projectName,
  columns,
  filteredColumns,
  members,
  boardPriorities,
  viewportElementId = "kanban-main-viewport",
  isFiltered = false
}: BoardExportModalProps) {
  const { toast } = useToast();
  const modalCanvasRef = useRef<HTMLDivElement>(null);
  const [exportScope, setExportScope] = useState<"all" | "filtered">(isFiltered ? "filtered" : "all");
  const [exportLayout, setExportLayout] = useState<ExportLayout>("kanban");
  const [exportTheme, setExportTheme] = useState<ExportTheme>("light");
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);

  // Compute tasks count
  const allCardsCount = useMemo(
    () => columns.reduce((acc, col) => acc + (col.cards?.length || 0), 0),
    [columns]
  );
  const filteredCardsCount = useMemo(
    () => (filteredColumns || columns).reduce((acc, col) => acc + (col.cards?.length || 0), 0),
    [filteredColumns, columns]
  );

  const activeColumns = exportScope === "filtered" && filteredColumns ? filteredColumns : columns;
  const currentCount = exportScope === "filtered" ? filteredCardsCount : allCardsCount;

  // Executive summary counts
  const summaryMetrics = useMemo(() => {
    let done = 0;
    let overdue = 0;
    let points = 0;
    const now = Date.now();

    for (const col of activeColumns) {
      for (const card of col.cards) {
        if (typeof card.difficulty === "number") points += card.difficulty;
        if ((card.status || "").toUpperCase() === "DONE") done++;
        if (card.dueDate && (card.status || "").toUpperCase() !== "DONE") {
          const t = new Date(card.dueDate).getTime();
          if (!isNaN(t) && t < now) overdue++;
        }
      }
    }
    const percent = currentCount > 0 ? Math.round((done / currentCount) * 100) : 0;
    return { done, overdue, points, percent };
  }, [activeColumns, currentCount]);

  // Safe filename generator: board-name-2026-10-04
  const getFilename = () => {
    const today = new Date().toISOString().split("T")[0];
    const safeTitle = (boardTitle || "board")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "");
    const layoutSuffix = exportLayout === "table" ? "-table" : "-kanban";
    return `${safeTitle || "board"}${layoutSuffix}-export-${today}`;
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(format);
    const filename = getFilename();

    try {
      if (format === "excel") {
        const rows = prepareExportRows(activeColumns, members, boardPriorities);
        downloadExcel(rows, filename, boardTitle);
        toast({
          message: `Exported Excel (.xlsx) successfully! (${rows.length} items) 📊`,
          type: "success"
        });
        onClose();
      } else if (format === "csv") {
        const rows = prepareExportRows(activeColumns, members, boardPriorities);
        downloadCsv(rows, filename);
        toast({
          message: `Exported CSV (.csv) successfully! (${rows.length} items) 📄`,
          type: "success"
        });
        onClose();
      } else if (format === "png") {
        // Target dedicated unclipped export document canvas first
        const dedicatedEl = modalCanvasRef.current || document.getElementById("retzlo-export-render-canvas");
        const el = dedicatedEl || document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!el) {
          throw new Error("Board container not found for capture");
        }
        await exportElementToPng(el, filename, {
          backgroundColor: exportTheme === "dark" ? "#0b0c1b" : "#ffffff",
          pixelRatio: 2.2
        });
        toast({
          message: "Exported high-resolution PNG (.png) successfully! 🖼️",
          type: "success"
        });
        onClose();
      } else if (format === "pdf") {
        // Target dedicated unclipped export document canvas first
        const dedicatedEl = modalCanvasRef.current || document.getElementById("retzlo-export-render-canvas");
        const el = dedicatedEl || document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!el) {
          throw new Error("Board container not found for PDF generation");
        }
        await exportElementToPdf(el, filename, boardTitle, {
          backgroundColor: exportTheme === "dark" ? "#0b0c1b" : "#ffffff",
          orientation: "landscape"
        });
        toast({
          message: "Exported formatted PDF (.pdf) successfully! 📑",
          type: "success"
        });
        onClose();
      }
    } catch (err: unknown) {
      console.error("Export error:", err);
      const msg = err instanceof Error ? err.message : "An error occurred during export";
      toast({
        message: `Export failed: ${msg}`,
        type: "error"
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════
          OFF-SCREEN DEDICATED EXPORT DOCUMENT RENDER TARGET
          Renders 100% of columns and cards with zero scrollbar cutoff!
      ══════════════════════════════════════════════════════════════════════════ */}
      {open && (
        <div
          style={{
            position: "fixed",
            left: "-99999px",
            top: 0,
            width: "max-content",
            height: "auto",
            overflow: "visible",
            zIndex: -9999,
            pointerEvents: "none",
            opacity: 1
          }}
          aria-hidden="true"
        >
          <div
            ref={modalCanvasRef}
            id="retzlo-export-render-canvas"
            data-export-container="true"
            style={{
              position: "relative",
              left: 0,
              top: 0,
              width: "max-content",
              display: "inline-block"
            }}
          >
            <BoardExportDocument
              boardTitle={boardTitle}
              projectName={projectName}
              columns={activeColumns}
              members={members}
              boardPriorities={boardPriorities}
              scope={exportScope}
              layout={exportLayout}
              themeStyle={exportTheme}
            />
          </div>
        </div>
      )}

      <AppModal
        open={open}
        onClose={onClose}
        contentClassName="max-w-2xl rounded-2xl border border-stone-200 bg-[#faf7f2] p-0 text-stone-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0e1025] dark:text-stone-100"
        labelledBy="export-board-title"
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between border-b border-stone-200/80 px-5 py-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-dusk-lavender/20 dark:text-dusk-lavender">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 id="export-board-title" className="text-base font-bold text-stone-900 dark:text-stone-100">
                Export Board
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Board <span className="font-semibold text-indigo-600 dark:text-dusk-lavender">{boardTitle}</span> • {currentCount} tasks ({activeColumns.length} columns)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-stone-200/60 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200 cursor-pointer"
            aria-label="Close export modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* ── Scope Selector (All vs Filtered) ── */}
          {isFiltered && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 dark:border-amber-400/20 dark:bg-amber-500/10">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Export Scope:
                </span>
                <span className="text-[11px] font-mono text-amber-700 dark:text-amber-300">
                  {exportScope === "filtered" ? `Filtered Tasks (${filteredCardsCount})` : `All Tasks (${allCardsCount})`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportScope("filtered")}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition cursor-pointer text-left",
                    exportScope === "filtered"
                      ? "border-amber-500 bg-white font-bold text-amber-950 shadow-xs dark:bg-stone-800 dark:text-amber-200"
                      : "border-transparent bg-transparent text-stone-600 hover:bg-white/50 dark:text-stone-400"
                  )}
                >
                  🔍 Filtered Tasks ({filteredCardsCount} tasks)
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope("all")}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition cursor-pointer text-left",
                    exportScope === "all"
                      ? "border-amber-500 bg-white font-bold text-amber-950 shadow-xs dark:bg-stone-800 dark:text-amber-200"
                      : "border-transparent bg-transparent text-stone-600 hover:bg-white/50 dark:text-stone-400"
                  )}
                >
                  📋 All Tasks in Board ({allCardsCount} tasks)
                </button>
              </div>
            </div>
          )}

          {/* ── Layout & Theme Customization Options ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Layout Style */}
            <div className="rounded-xl border border-stone-200 bg-white/70 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-2">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                Layout View
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportLayout("kanban")}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition cursor-pointer text-xs",
                    exportLayout === "kanban"
                      ? "border-indigo-500 bg-indigo-50/70 font-bold text-indigo-950 dark:border-dusk-lavender dark:bg-dusk-lavender/15 dark:text-dusk-lavender"
                      : "border-stone-200 bg-stone-50/50 text-stone-600 hover:border-stone-300 dark:border-white/5 dark:bg-white/[0.02] dark:text-stone-400"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <KanbanSquare className="h-3.5 w-3.5" />
                    <span>Full Board</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">
                    All columns 100%
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportLayout("table")}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition cursor-pointer text-xs",
                    exportLayout === "table"
                      ? "border-indigo-500 bg-indigo-50/70 font-bold text-indigo-950 dark:border-dusk-lavender dark:bg-dusk-lavender/15 dark:text-dusk-lavender"
                      : "border-stone-200 bg-stone-50/50 text-stone-600 hover:border-stone-300 dark:border-white/5 dark:bg-white/[0.02] dark:text-stone-400"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <TableIcon className="h-3.5 w-3.5" />
                    <span>Table Report</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">
                    Suitable for slides & A4
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Theme Style */}
            <div className="rounded-xl border border-stone-200 bg-white/70 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-2">
                <SunMedium className="h-3.5 w-3.5 text-amber-500" />
                Export Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportTheme("light")}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition cursor-pointer text-xs",
                    exportTheme === "light"
                      ? "border-amber-500 bg-amber-50/70 font-bold text-amber-950 dark:border-amber-400 dark:bg-amber-400/15 dark:text-amber-200"
                      : "border-stone-200 bg-stone-50/50 text-stone-600 hover:border-stone-300 dark:border-white/5 dark:bg-white/[0.02] dark:text-stone-400"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <SunMedium className="h-3.5 w-3.5" />
                    <span>Light Paper</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">
                    Recommended for PDF / Print
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportTheme("dark")}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition cursor-pointer text-xs",
                    exportTheme === "dark"
                      ? "border-indigo-500 bg-indigo-50/70 font-bold text-indigo-950 dark:border-dusk-lavender dark:bg-dusk-lavender/15 dark:text-dusk-lavender"
                      : "border-stone-200 bg-stone-50/50 text-stone-600 hover:border-stone-300 dark:border-white/5 dark:bg-white/[0.02] dark:text-stone-400"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Moon className="h-3.5 w-3.5" />
                    <span>Dark Theme</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">
                    Retro Dark styling
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Executive KPI Summary Card ── */}
          <div className="rounded-xl border border-stone-200 bg-white/60 p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Executive Summary
              </span>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-dusk-lavender flex items-center gap-1 cursor-pointer"
              >
                {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span>{showPreview ? "Hide Document Preview" : "Show Document Preview"}</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-stone-100/70 dark:bg-white/5">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">Total Tasks</span>
                <span className="font-bold text-sm">{currentCount} tasks</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50/70 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span className="text-[10px] opacity-75 block">Completed</span>
                <span className="font-bold text-sm">{summaryMetrics.done} ({summaryMetrics.percent}%)</span>
              </div>
              <div className="p-2 rounded-lg bg-indigo-50/70 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300">
                <span className="text-[10px] opacity-75 block">Total Points</span>
                <span className="font-bold text-sm">{summaryMetrics.points} pts</span>
              </div>
              <div className={cn(
                "p-2 rounded-lg",
                summaryMetrics.overdue > 0
                  ? "bg-rose-50/80 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300 font-bold"
                  : "bg-stone-100/70 text-stone-500 dark:bg-white/5 dark:text-stone-400"
              )}>
                <span className="text-[10px] opacity-75 block">Overdue</span>
                <span className="font-bold text-sm">{summaryMetrics.overdue} tasks</span>
              </div>
            </div>

            {/* Collapsible Document Preview */}
            {showPreview && (
              <div className="mt-3 pt-3 border-t border-stone-200 dark:border-white/10">
                <div className="rounded-xl border border-stone-300/80 dark:border-white/15 overflow-hidden max-h-[260px] overflow-y-auto bg-stone-200/40 p-2">
                  <div className="scale-75 origin-top-left -mr-[33%] -mb-[33%]">
                    <BoardExportDocument
                      boardTitle={boardTitle}
                      projectName={projectName}
                      columns={activeColumns}
                      members={members}
                      boardPriorities={boardPriorities}
                      scope={exportScope}
                      layout={exportLayout}
                      themeStyle={exportTheme}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── 4 Format Cards (Excel, CSV, PDF, PNG) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. PDF (.pdf) */}
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={() => handleExport("pdf")}
              className={cn(
                "group relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all cursor-pointer shadow-xs",
                "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60 hover:bg-rose-500/10 hover:shadow-md",
                "dark:border-rose-400/20 dark:bg-rose-500/10 dark:hover:border-rose-400/40 dark:hover:bg-rose-500/15",
                isExporting === "pdf" && "ring-2 ring-rose-500/50"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400">
                    {isExporting === "pdf" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    PDF (.pdf)
                  </span>
                </div>
                <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300">
                  Formal Document
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Formatted A4 document scaled proportionally without clipping, with executive KPIs
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 group-hover:underline dark:text-rose-400">
                <span>Download PDF</span>
                <Download className="h-3 w-3" />
              </div>
            </button>

            {/* 2. PNG (.png) */}
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={() => handleExport("png")}
              className={cn(
                "group relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all cursor-pointer shadow-xs",
                "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60 hover:bg-purple-500/10 hover:shadow-md",
                "dark:border-purple-400/20 dark:bg-purple-500/10 dark:hover:border-purple-400/40 dark:hover:bg-purple-500/15",
                isExporting === "png" && "ring-2 ring-purple-500/50"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400">
                    {isExporting === "png" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    PNG (.png)
                  </span>
                </div>
                <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300">
                  2x Retina
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                High-res full panoramic canvas with all columns and cards, perfect for presentations
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-purple-600 group-hover:underline dark:text-purple-400">
                <span>Download PNG</span>
                <Download className="h-3 w-3" />
              </div>
            </button>

            {/* 3. Excel (.xlsx) */}
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={() => handleExport("excel")}
              className={cn(
                "group relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all cursor-pointer shadow-xs",
                "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:shadow-md",
                "dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:hover:border-emerald-400/40 dark:hover:bg-emerald-500/15",
                isExporting === "excel" && "ring-2 ring-emerald-500/50"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    {isExporting === "excel" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Excel (.xlsx)
                  </span>
                </div>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  Spreadsheet
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Structured columns with assignees, dates, statuses, and priority rankings
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 group-hover:underline dark:text-emerald-400">
                <span>Download Excel</span>
                <Download className="h-3 w-3" />
              </div>
            </button>

            {/* 4. CSV (.csv) */}
            <button
              type="button"
              disabled={isExporting !== null}
              onClick={() => handleExport("csv")}
              className={cn(
                "group relative flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all cursor-pointer shadow-xs",
                "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60 hover:bg-blue-500/10 hover:shadow-md",
                "dark:border-blue-400/20 dark:bg-blue-500/10 dark:hover:border-blue-400/40 dark:hover:bg-blue-500/15",
                isExporting === "csv" && "ring-2 ring-blue-500/50"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    {isExporting === "csv" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    CSV (.csv)
                  </span>
                </div>
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-blue-700 dark:text-blue-300">
                  Universal
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Standard UTF-8 BOM CSV compatible with Excel, Google Sheets, and databases
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-blue-600 group-hover:underline dark:text-blue-400">
                <span>Download CSV</span>
                <Download className="h-3 w-3" />
              </div>
            </button>
          </div>
        </div>

        <AppModalFooter className="flex items-center justify-between border-t border-stone-200/80 px-5 py-3 dark:border-white/10">
          <span className="text-[11px] text-stone-400">
            ✨ Layout is specifically formatted for export (100% unclipped columns & cards)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-300 bg-white px-4 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-300 dark:hover:bg-white/[0.1] cursor-pointer"
          >
            Close
          </button>
        </AppModalFooter>
      </AppModal>
    </>
  );
}

export interface BoardExportButtonProps {
  boardTitle: string;
  projectName?: string;
  columns: ColumnWithCards[];
  filteredColumns?: ColumnWithCards[];
  members: CardAssignee[];
  boardPriorities?: CustomPriority[];
  viewportElementId?: string;
  isFiltered?: boolean;
  className?: string;
  variant?: "default" | "compact";
}

export function BoardExportButton({
  boardTitle,
  projectName,
  columns,
  filteredColumns,
  members,
  boardPriorities,
  viewportElementId = "kanban-main-viewport",
  isFiltered = false,
  className,
  variant = "default"
}: BoardExportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const quickCanvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getFilename = () => {
    const today = new Date().toISOString().split("T")[0];
    const safeTitle = (boardTitle || "board")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "");
    return `${safeTitle || "board"}-export-${today}`;
  };

  const isDarkTheme = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  const handleQuickExport = async (format: ExportFormat) => {
    const activeColumns = isFiltered && filteredColumns ? filteredColumns : columns;
    const filename = getFilename();
    const exportBg = isDarkTheme ? "#0b0c1b" : "#ffffff";

    try {
      if (format === "excel") {
        const rows = prepareExportRows(activeColumns, members, boardPriorities);
        downloadExcel(rows, filename, boardTitle);
        toast({
          message: `Exported Excel (.xlsx) successfully (${rows.length} items) 📊`,
          type: "success"
        });
      } else if (format === "csv") {
        const rows = prepareExportRows(activeColumns, members, boardPriorities);
        downloadCsv(rows, filename);
        toast({
          message: `Exported CSV (.csv) successfully (${rows.length} items) 📄`,
          type: "success"
        });
      } else if (format === "png") {
        const dedicatedEl = quickCanvasRef.current || document.getElementById("retzlo-export-render-canvas-quick");
        const el = dedicatedEl || document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!el) throw new Error("Board container not found for capture");
        await exportElementToPng(el, filename, {
          backgroundColor: exportBg,
          pixelRatio: 2.2
        });
        toast({
          message: "Exported high quality PNG (.png) successfully 🖼️",
          type: "success"
        });
      } else if (format === "pdf") {
        const dedicatedEl = quickCanvasRef.current || document.getElementById("retzlo-export-render-canvas-quick");
        const el = dedicatedEl || document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!el) throw new Error("Board container not found for PDF generation");
        await exportElementToPdf(el, filename, boardTitle, {
          backgroundColor: exportBg,
          orientation: "landscape"
        });
        toast({
          message: "Exported formatted PDF (.pdf) successfully 📑",
          type: "success"
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during export";
      toast({ message: `Export failed: ${msg}`, type: "error" });
    }
  };

  return (
    <>
      {/* Off-screen dedicated export document for quick dropdown menu actions */}
      <div
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
          width: "max-content",
          height: "auto",
          overflow: "visible",
          zIndex: -9999,
          pointerEvents: "none",
          opacity: 1
        }}
        aria-hidden="true"
      >
        <div
          ref={quickCanvasRef}
          id="retzlo-export-render-canvas-quick"
          data-export-container="true"
          style={{
            position: "relative",
            left: 0,
            top: 0,
            width: "max-content",
            display: "inline-block"
          }}
        >
          <BoardExportDocument
            boardTitle={boardTitle}
            projectName={projectName}
            columns={isFiltered && filteredColumns ? filteredColumns : columns}
            members={members}
            boardPriorities={boardPriorities}
            scope={isFiltered ? "filtered" : "all"}
            layout="kanban"
            themeStyle={isDarkTheme ? "dark" : "light"}
          />
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 text-xs font-semibold text-stone-700 shadow-xs transition-all duration-150 cursor-pointer select-none",
              "hover:border-indigo-400 hover:text-indigo-600 active:scale-95",
              "dark:border-white/10 dark:bg-white/[0.03] dark:text-stone-300 dark:hover:border-white/20 dark:hover:text-stone-100",
              className
            )}
            title="Export Board (Excel, CSV, PDF, PNG)"
            aria-label="Export board"
          >
            <Download className="h-3.5 w-3.5 text-indigo-500 dark:text-dusk-lavender" />
            <span className={variant === "compact" ? "hidden md:inline" : "hidden sm:inline"}>
              Export
            </span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 z-[1100]">
          <DropdownMenuLabel className="text-xs font-bold text-stone-500 dark:text-stone-400">
            Export Board
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => handleQuickExport("pdf")}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <FileDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs">PDF (.pdf)</span>
              <span className="text-[10px] text-stone-400">Formatted A4 document</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleQuickExport("png")}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs">PNG (.png)</span>
              <span className="text-[10px] text-stone-400">High-res 2x panoramic image</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleQuickExport("excel")}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs">Excel (.xlsx)</span>
              <span className="text-[10px] text-stone-400">Fully structured spreadsheet</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleQuickExport("csv")}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs">CSV (.csv)</span>
              <span className="text-[10px] text-stone-400">Standard UTF-8 BOM CSV</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer py-1.5 font-medium text-xs text-indigo-600 dark:text-dusk-lavender"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Customize layout &amp; options...</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BoardExportModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        boardTitle={boardTitle}
        projectName={projectName}
        columns={columns}
        filteredColumns={filteredColumns}
        members={members}
        boardPriorities={boardPriorities}
        viewportElementId={viewportElementId}
        isFiltered={isFiltered}
      />
    </>
  );
}
