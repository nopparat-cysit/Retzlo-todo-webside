"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  KanbanSquare,
  Layers,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  Moon,
  Plus,
  RotateCcw,
  Sparkles,
  SunMedium,
  Table as TableIcon,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
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
import type { ExportCardRow } from "@/lib/kanban/export-board";
import { BoardExportDocument } from "@/components/kanban/board-export-document";
import {
  adjustExportPreviewZoom,
  EXPORT_PREVIEW_ZOOM_MAX,
  EXPORT_PREVIEW_ZOOM_MIN,
  getExportPreviewFitZoom,
  resolveExportSelection,
  type ExportView
} from "@/lib/kanban/export-config";

export interface BoardExportModalProps {
  currentView: ExportView;
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

const EXPORT_ROW_PREVIEW_COLUMNS: Array<{ key: keyof ExportCardRow; label: string }> = [
  { key: "index", label: "No." },
  { key: "title", label: "Task title" },
  { key: "status", label: "Status" },
  { key: "columnName", label: "Column" },
  { key: "priority", label: "Priority" },
  { key: "assignees", label: "Assignees" },
  { key: "difficulty", label: "Story points" },
  { key: "startDate", label: "Start date" },
  { key: "dueDate", label: "Due date" },
  { key: "isOverdue", label: "Delivery status" },
  { key: "checklistProgress", label: "Checklist" },
  { key: "isStarred", label: "Starred" },
  { key: "description", label: "Description" },
  { key: "note", label: "Note" }
];

const EXPORT_FORMAT_OPTIONS: Array<{
  format: ExportFormat;
  label: string;
  detail: string;
  icon: typeof FileDown;
}> = [
  { format: "pdf", label: "PDF (.pdf)", detail: "Formatted document", icon: FileDown },
  { format: "png", label: "PNG (.png)", detail: "High-resolution image", icon: ImageIcon },
  { format: "excel", label: "Excel (.xlsx)", detail: "Editable workbook", icon: FileSpreadsheet },
  { format: "csv", label: "CSV (.csv)", detail: "Universal spreadsheet", icon: FileText }
];

const DATA_PREVIEW_ROW_LIMIT = 12;
const EXPORT_PREVIEW_DOCUMENT_HEIGHT = 800;

export function BoardExportModal({
  currentView,
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
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const dialogTitleRef = useRef<HTMLHeadingElement>(null);
  const [exportScope, setExportScope] = useState<"all" | "filtered">(isFiltered ? "filtered" : "all");
  const [exportLayout, setExportLayout] = useState<ExportLayout>(currentView);
  const [exportTheme, setExportTheme] = useState<ExportTheme>("light");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [previewZoom, setPreviewZoom] = useState(0.7);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewViewport, setPreviewViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!open) return;

    setExportScope(isFiltered ? "filtered" : "all");
    setExportLayout(currentView);
    setSelectedFormat("pdf");
    setPreviewZoom(0.7);
    setIsExpanded(false);

    const frame = window.requestAnimationFrame(() => dialogTitleRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open, currentView, isFiltered]);

  useEffect(() => {
    if (!open) return;
    const previewViewportElement = previewScrollRef.current;
    if (!previewViewportElement) return;

    const updatePreviewViewport = () => {
      setPreviewViewport({
        width: previewViewportElement.clientWidth,
        height: previewViewportElement.clientHeight
      });
    };
    updatePreviewViewport();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updatePreviewViewport);
      observer.observe(previewViewportElement);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updatePreviewViewport);
    return () => window.removeEventListener("resize", updatePreviewViewport);
  }, [open, isExpanded, selectedFormat]);

  const filteredCardsCount = useMemo(
    () => (filteredColumns || columns).reduce((count, column) => count + column.cards.length, 0),
    [filteredColumns, columns]
  );
  const activeColumns = exportScope === "filtered" && filteredColumns ? filteredColumns : columns;
  const exportRows = useMemo(
    () => prepareExportRows(activeColumns, members, boardPriorities),
    [activeColumns, members, boardPriorities]
  );
  const currentCount = exportRows.length;
  const selection = useMemo(
    () => resolveExportSelection({
      format: selectedFormat,
      currentView,
      selectedLayout: exportLayout,
      scope: exportScope,
      theme: exportTheme
    }),
    [selectedFormat, currentView, exportLayout, exportScope, exportTheme]
  );
  const previewDocumentWidth = exportLayout === "table"
    ? 1240
    : Math.max(1200, activeColumns.length * 340 + 64);
  const fallbackPreviewContentWidth = selection.kind === "visual" ? previewDocumentWidth : 1920;
  const fallbackPreviewContentHeight = selection.kind === "visual"
    ? EXPORT_PREVIEW_DOCUMENT_HEIGHT
    : Math.max(420, 56 + Math.min(exportRows.length, DATA_PREVIEW_ROW_LIMIT) * 100);

  const summaryMetrics = useMemo(() => {
    let done = 0;
    let overdue = 0;
    let points = 0;
    const now = Date.now();

    for (const column of activeColumns) {
      for (const card of column.cards) {
        if (typeof card.difficulty === "number") points += card.difficulty;
        if ((card.status || "").toUpperCase() === "DONE") done++;
        if (card.dueDate && (card.status || "").toUpperCase() !== "DONE") {
          const dueDate = new Date(card.dueDate).getTime();
          if (!Number.isNaN(dueDate) && dueDate < now) overdue++;
        }
      }
    }

    return {
      done,
      overdue,
      points,
      percent: currentCount > 0 ? Math.round((done / currentCount) * 100) : 0
    };
  }, [activeColumns, currentCount]);

  const getFilename = (layout: ExportLayout) => {
    const today = new Date().toISOString().split("T")[0];
    const safeTitle = (boardTitle || "board")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "");
    const layoutSuffix = layout === "table" ? "-table" : "-kanban";
    return `${safeTitle || "board"}${layoutSuffix}-export-${today}`;
  };

  const fitPreview = () => {
    const renderedContent = previewContentRef.current?.getBoundingClientRect();
    const currentZoom = previewZoom > 0 ? previewZoom : 1;
    setPreviewZoom(getExportPreviewFitZoom({
      viewportWidth: previewViewport.width,
      viewportHeight: previewViewport.height,
      measuredContentWidth: renderedContent ? renderedContent.width / currentZoom : 0,
      measuredContentHeight: renderedContent ? renderedContent.height / currentZoom : 0,
      fallbackContentWidth: fallbackPreviewContentWidth,
      fallbackContentHeight: fallbackPreviewContentHeight
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    const filename = getFilename(selection.kind === "visual" ? selection.layout : currentView);

    try {
      if (selection.kind === "data" && selection.format === "excel") {
        downloadExcel(exportRows, filename, boardTitle);
        toast({
          message: `Exported Excel (.xlsx) successfully! (${exportRows.length} items) 📊`,
          type: "success"
        });
      } else if (selection.kind === "data" && selection.format === "csv") {
        downloadCsv(exportRows, filename);
        toast({
          message: `Exported CSV (.csv) successfully! (${exportRows.length} items) 📄`,
          type: "success"
        });
      } else if (selection.kind === "visual") {
        const dedicatedElement = modalCanvasRef.current || document.getElementById("retzlo-export-render-canvas");
        const element = dedicatedElement || document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!element) {
          throw new Error(selection.format === "png"
            ? "Board container not found for capture"
            : "Board container not found for PDF generation");
        }

        const backgroundColor = selection.theme === "dark" ? "#0b0c1b" : "#ffffff";
        if (selection.format === "png") {
          await exportElementToPng(element, filename, {
            backgroundColor,
            pixelRatio: 2.2
          });
          toast({
            message: "Exported high-resolution PNG (.png) successfully! 🖼️",
            type: "success"
          });
        } else {
          await exportElementToPdf(element, filename, boardTitle, {
            backgroundColor,
            orientation: "landscape"
          });
          toast({
            message: "Exported formatted PDF (.pdf) successfully! 📑",
            type: "success"
          });
        }
      }

      onClose();
    } catch (error: unknown) {
      console.error("Export error:", error);
      const message = error instanceof Error ? error.message : "An error occurred during export";
      toast({ message: `Export failed: ${message}`, type: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  const previewToolbarButtonClass = "h-8 w-8 rounded-lg text-theme-muted hover:bg-theme-paper-strong hover:text-theme-foreground focus-visible:ring-offset-theme-panel";
  const modalContentClass = cn(
    "flex w-full flex-col overflow-hidden rounded-none border border-theme-border bg-theme-background text-theme-foreground shadow-2xl sm:rounded-2xl",
    isExpanded
      ? "m-2 h-[calc(100dvh-1rem)] max-h-none max-w-none sm:m-3 sm:h-[calc(100dvh-1.5rem)]"
      : "h-[90dvh] max-h-[100dvh] max-w-[1320px] sm:max-h-[calc(100dvh-2rem)]"
  );

  return (
    <>
      {/* Dedicated unclipped export document used by the selected PDF/PNG action. */}
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
            style={{ position: "relative", left: 0, top: 0, width: "max-content", display: "inline-block" }}
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
        trapFocus
        contentClassName={modalContentClass}
        labelledBy="export-board-title"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-theme-border bg-theme-panel px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-theme-border bg-theme-paper text-theme-accent">
              <Download className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2
                ref={dialogTitleRef}
                id="export-board-title"
                tabIndex={-1}
                className="rounded-sm text-base font-bold outline-none focus:ring-2 focus:ring-theme-accent/70 focus:ring-offset-2 focus:ring-offset-theme-panel sm:text-lg"
              >
                Export board
              </h2>
              <p className="truncate text-xs text-theme-muted">
                {boardTitle} <span aria-hidden="true">·</span> {currentCount} {currentCount === 1 ? "task" : "tasks"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-theme-muted transition hover:bg-theme-paper-strong hover:text-theme-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70"
            aria-label="Close export dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(19rem,0.82fr)_minmax(0,1.18fr)] lg:overflow-hidden">
          <section aria-label="Export settings" className="min-h-0 space-y-5 p-4 sm:p-5 lg:overflow-y-auto">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">Choose a format</h3>
                <span className="text-xs text-theme-muted">Preview updates as you choose</span>
              </div>
              <div role="group" aria-label="Export format" className="grid grid-cols-2 gap-2">
                {EXPORT_FORMAT_OPTIONS.map(({ format, label, detail, icon: FormatIcon }) => {
                  const isSelected = selectedFormat === format;
                  return (
                    <button
                      key={format}
                      type="button"
                      aria-pressed={isSelected}
                      disabled={isExporting}
                      onClick={() => setSelectedFormat(format)}
                      className={cn(
                        "flex min-h-[76px] items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-background disabled:cursor-wait disabled:opacity-60",
                        isSelected
                          ? "border-theme-accent bg-theme-paper text-theme-foreground shadow-sm ring-1 ring-theme-accent/35"
                          : "border-theme-border bg-theme-panel text-theme-foreground hover:border-theme-accent/50 hover:bg-theme-paper"
                      )}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-theme-border bg-theme-background text-theme-accent">
                        <FormatIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{label}</span>
                        <span className="block text-[11px] leading-4 text-theme-muted">{detail}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-theme-border bg-theme-panel p-3.5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Layers className="h-4 w-4 text-theme-accent" aria-hidden="true" />
                  Export scope
                </h3>
                <span className="text-xs text-theme-muted">{currentCount} tasks</span>
              </div>
              {isFiltered ? (
                <div role="group" aria-label="Export scope" className="grid grid-cols-2 gap-2">
                  {([
                    { value: "filtered" as const, label: "Filtered", count: filteredCardsCount },
                    { value: "all" as const, label: "Entire board", count: columns.reduce((total, column) => total + column.cards.length, 0) }
                  ]).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={exportScope === option.value}
                      disabled={isExporting}
                      onClick={() => setExportScope(option.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70",
                        exportScope === option.value
                          ? "border-theme-accent bg-theme-paper font-semibold text-theme-foreground"
                          : "border-theme-border bg-theme-background text-theme-muted hover:bg-theme-paper"
                      )}
                    >
                      <span className="block font-semibold">{option.label}</span>
                      <span className="mt-0.5 block text-theme-muted">{option.count} cards</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg bg-theme-background px-3 py-2 text-xs text-theme-muted">All cards in this board</p>
              )}
            </div>

            {selection.kind === "visual" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <fieldset className="rounded-xl border border-theme-border bg-theme-panel p-3.5">
                  <legend className="px-1 text-xs font-semibold">Layout View</legend>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {([
                      { value: "kanban" as const, label: "Board", icon: KanbanSquare },
                      { value: "table" as const, label: "Table", icon: TableIcon }
                    ]).map(({ value, label, icon: LayoutIcon }) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={exportLayout === value}
                        disabled={isExporting}
                        onClick={() => setExportLayout(value)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70",
                          exportLayout === value
                            ? "border-theme-accent bg-theme-paper text-theme-foreground"
                            : "border-theme-border bg-theme-background text-theme-muted hover:bg-theme-paper"
                        )}
                      >
                        <LayoutIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="rounded-xl border border-theme-border bg-theme-panel p-3.5">
                  <legend className="px-1 text-xs font-semibold">Export Theme</legend>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {([
                      { value: "light" as const, label: "Light", icon: SunMedium },
                      { value: "dark" as const, label: "Dark", icon: Moon }
                    ]).map(({ value, label, icon: ThemeIcon }) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={exportTheme === value}
                        disabled={isExporting}
                        onClick={() => setExportTheme(value)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dusk-lavender/70",
                          exportTheme === value
                            ? "border-theme-accent bg-theme-paper text-theme-foreground"
                            : "border-theme-border bg-theme-background text-theme-muted hover:bg-theme-paper"
                        )}
                      >
                        <ThemeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            ) : (
              <div className="rounded-xl border border-theme-border bg-theme-panel px-3.5 py-3 text-xs text-theme-muted">
                Spreadsheet exports include task fields and ignore visual layout and theme settings.
              </div>
            )}

            <section aria-label="Board summary" className="rounded-xl border border-theme-border bg-theme-panel p-3.5">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold">
                <Sparkles className="h-4 w-4 text-theme-accent" aria-hidden="true" />
                Board snapshot
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg bg-theme-background px-2.5 py-2">
                  <span className="block text-[10px] text-theme-muted">Tasks</span>
                  <span className="text-sm font-bold">{currentCount}</span>
                </div>
                <div className="rounded-lg bg-theme-background px-2.5 py-2">
                  <span className="block text-[10px] text-theme-muted">Complete</span>
                  <span className="flex items-center gap-1 text-sm font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-theme-success" aria-hidden="true" />
                    {summaryMetrics.percent}%
                  </span>
                </div>
                <div className="rounded-lg bg-theme-background px-2.5 py-2">
                  <span className="block text-[10px] text-theme-muted">Story points</span>
                  <span className="text-sm font-bold">{summaryMetrics.points}</span>
                </div>
                <div className="rounded-lg bg-theme-background px-2.5 py-2">
                  <span className="block text-[10px] text-theme-muted">Overdue</span>
                  <span className="text-sm font-bold">{summaryMetrics.overdue}</span>
                </div>
              </div>
            </section>
          </section>

          <aside aria-label="Live export preview" className="flex h-[min(64dvh,620px)] min-h-[430px] flex-col border-t border-theme-border bg-theme-panel lg:h-auto lg:min-h-0 lg:border-l lg:border-t-0">
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-theme-border bg-theme-panel/95 px-3 py-2.5 backdrop-blur sm:px-4">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">Live preview</h3>
                <p className="truncate text-[11px] text-theme-muted">
                  {selectedFormat.toUpperCase()} <span aria-hidden="true">·</span> {selection.kind === "visual" ? `${selection.layout === "table" ? "Table" : "Board"} layout` : `${currentCount} rows`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={previewToolbarButtonClass}
                  onClick={() => setPreviewZoom((zoom) => adjustExportPreviewZoom(zoom, -1))}
                  disabled={previewZoom <= EXPORT_PREVIEW_ZOOM_MIN}
                  aria-label="Zoom out preview"
                  title="Zoom out"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </Button>
                <span className="w-10 text-center text-[11px] tabular-nums text-theme-muted" aria-live="polite">
                  {Math.round(previewZoom * 100)}%
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={previewToolbarButtonClass}
                  onClick={() => setPreviewZoom((zoom) => adjustExportPreviewZoom(zoom, 1))}
                  disabled={previewZoom >= EXPORT_PREVIEW_ZOOM_MAX}
                  aria-label="Zoom in preview"
                  title="Zoom in"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={previewToolbarButtonClass}
                  onClick={fitPreview}
                  aria-label="Fit preview to panel"
                  title="Fit preview"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </Button>
                <span className="mx-1 h-5 w-px bg-theme-border" aria-hidden="true" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={previewToolbarButtonClass}
                  onClick={() => setIsExpanded((expanded) => !expanded)}
                  aria-label={isExpanded ? "Restore export dialog size" : "Expand export preview"}
                  aria-pressed={isExpanded}
                  title={isExpanded ? "Restore dialog size" : "Expand preview"}
                >
                  {isExpanded
                    ? <Minimize2 className="h-4 w-4" aria-hidden="true" />
                    : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
                </Button>
              </div>
            </div>

            <div
              ref={previewScrollRef}
              className="min-h-0 flex-1 overflow-auto overscroll-contain p-3 sm:p-4"
              tabIndex={0}
              aria-label="Scrollable export preview"
            >
              <div ref={previewContentRef} style={{ zoom: previewZoom, width: "max-content" }}>
                {currentCount === 0 ? (
                  <div className="grid min-h-[360px] w-[min(80vw,520px)] place-items-center rounded-xl border border-dashed border-theme-border bg-theme-background p-6 text-center">
                    <div className="max-w-sm">
                      <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-theme-paper text-theme-muted">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <h4 className="text-sm font-semibold">No cards in this scope</h4>
                      <p className="mt-1 text-xs leading-5 text-theme-muted">
                        Choose a different scope to preview tasks available on this board.
                      </p>
                      {exportScope === "filtered" && isFiltered && (
                        <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={() => setExportScope("all")}>
                          Preview all cards
                        </Button>
                      )}
                    </div>
                  </div>
                ) : selection.kind === "visual" ? (
                  <div style={{ width: previewDocumentWidth, minHeight: EXPORT_PREVIEW_DOCUMENT_HEIGHT }}>
                    <BoardExportDocument
                      boardTitle={boardTitle}
                      projectName={projectName}
                      columns={activeColumns}
                      members={members}
                      boardPriorities={boardPriorities}
                      scope={selection.scope}
                      layout={selection.layout}
                      themeStyle={selection.theme}
                    />
                  </div>
                ) : (
                  <>
                  <table
                    aria-label={`${selectedFormat.toUpperCase()} spreadsheet preview`}
                    className="min-w-[1920px] table-fixed border-separate border-spacing-0 overflow-hidden rounded-lg border border-theme-border bg-theme-background text-left text-xs"
                  >
                    <caption className="sr-only">Read-only sample of the rows prepared for this spreadsheet export</caption>
                    <thead className="sticky top-0 z-[1] bg-theme-paper">
                      <tr>
                        {EXPORT_ROW_PREVIEW_COLUMNS.map((column) => (
                          <th
                            key={column.key}
                            scope="col"
                            className="border-b border-r border-theme-border px-3 py-2.5 text-[11px] font-semibold text-theme-foreground last:border-r-0"
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {exportRows.slice(0, DATA_PREVIEW_ROW_LIMIT).map((row) => (
                        <tr key={row.id} className="odd:bg-theme-panel even:bg-theme-background">
                          {EXPORT_ROW_PREVIEW_COLUMNS.map((column) => (
                            <td
                              key={column.key}
                              title={row[column.key] == null ? "" : String(row[column.key])}
                              className="max-w-64 border-b border-r border-theme-border px-3 py-2 align-top text-theme-foreground last:border-r-0"
                            >
                              <span className="block max-h-20 overflow-hidden whitespace-normal break-words">
                                {row[column.key] == null || row[column.key] === "" ? "—" : String(row[column.key])}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {currentCount > DATA_PREVIEW_ROW_LIMIT && (
                    <p className="mt-2 text-[11px] text-theme-muted">
                      Showing {DATA_PREVIEW_ROW_LIMIT} of {currentCount} rows. The download contains every row in the selected scope.
                    </p>
                  )}
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>

        <footer className="flex shrink-0 flex-col-reverse items-stretch justify-between gap-2 border-t border-theme-border bg-theme-panel px-4 py-3 pb-safe sm:flex-row sm:items-center sm:px-6">
          <p className="text-center text-[11px] text-theme-muted sm:text-left">
            {selection.kind === "visual"
              ? `${selection.layout === "table" ? "Table" : "Board"} layout · ${selection.theme} document · ${currentCount} cards`
              : `${selection.format === "excel" ? "Excel workbook" : "CSV file"} · ${currentCount} rows`}
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            disabled={isExporting || currentCount === 0}
            onClick={() => void handleExport()}
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
            {isExporting ? "Preparing export…" : currentCount === 0 ? "No cards to export" : `Download ${selectedFormat.toUpperCase()}`}
          </Button>
        </footer>
      </AppModal>
    </>
  );
}
export interface BoardExportButtonProps {
  currentView: ExportView;
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
  currentView,
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
  const exportTriggerRef = useRef<HTMLButtonElement>(null);
  const wasModalOpenRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (wasModalOpenRef.current && !isModalOpen) {
      const frame = window.requestAnimationFrame(() => exportTriggerRef.current?.focus());
      wasModalOpenRef.current = false;
      return () => window.cancelAnimationFrame(frame);
    }

    wasModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  const getFilename = () => {
    const today = new Date().toISOString().split("T")[0];
    const safeTitle = (boardTitle || "board")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "");
    return `${safeTitle || "board"}-export-${today}`;
  };

  const isDarkTheme = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const activeColumns = isFiltered && filteredColumns ? filteredColumns : columns;
  const quickSelection = resolveExportSelection({
    format: "pdf",
    currentView,
    scope: isFiltered ? "filtered" : "all",
    theme: isDarkTheme ? "dark" : "light"
  });
  const activeCount = activeColumns.reduce((count, column) => count + column.cards.length, 0);
  const quickScopeLabel = `${currentView === "table" ? "Table view" : "Kanban view"}${isFiltered ? ` • ${activeCount} filtered items` : ""}`;

  const handleQuickExport = async (format: ExportFormat) => {
    const selection = resolveExportSelection({
      format,
      currentView,
      scope: isFiltered ? "filtered" : "all",
      theme: isDarkTheme ? "dark" : "light"
    });
    const filename = getFilename();
    const exportBg = selection.kind === "visual" && selection.theme === "dark" ? "#0b0c1b" : "#ffffff";

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
          {quickSelection.kind === "visual" && <BoardExportDocument
            boardTitle={boardTitle}
            projectName={projectName}
            columns={activeColumns}
            members={members}
            boardPriorities={boardPriorities}
            scope={quickSelection.scope}
            layout={quickSelection.layout}
            themeStyle={quickSelection.theme}
          />}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            ref={exportTriggerRef}
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
              <span className="text-[10px] text-stone-400">{quickScopeLabel}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleQuickExport("png")}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs">PNG (.png)</span>
              <span className="text-[10px] text-stone-400">{quickScopeLabel}</span>
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
        currentView={currentView}
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
