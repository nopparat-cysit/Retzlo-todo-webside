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
      .replace(/[^a-z0-9ก-๙_-]+/gi, "-")
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
          message: `ส่งออกไฟล์ Excel (.xlsx) สำเร็จ! (${rows.length} รายการ) 📊`,
          type: "success"
        });
        onClose();
      } else if (format === "csv") {
        const rows = prepareExportRows(activeColumns, members, boardPriorities);
        downloadCsv(rows, filename);
        toast({
          message: `ส่งออกไฟล์ CSV (.csv) สำเร็จ! (${rows.length} รายการ) 📄`,
          type: "success"
        });
        onClose();
      } else if (format === "png") {
        // Target dedicated unclipped export document canvas first
        const dedicatedEl = modalCanvasRef.current || document.getElementById("retzlo-export-render-canvas");
        const el = dedicatedEl || document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!el) {
          throw new Error("ไม่พบคอนเทนเนอร์บอร์ดสำหรับจับภาพ");
        }
        await exportElementToPng(el, filename, {
          backgroundColor: exportTheme === "dark" ? "#0b0c1b" : "#ffffff",
          pixelRatio: 2.2
        });
        toast({
          message: "ส่งออกรูปภาพ PNG (.png) ความละเอียดสูงสมบูรณ์แบบ! 🖼️",
          type: "success"
        });
        onClose();
      } else if (format === "pdf") {
        // Target dedicated unclipped export document canvas first
        const dedicatedEl = modalCanvasRef.current || document.getElementById("retzlo-export-render-canvas");
        const el = dedicatedEl || document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!el) {
          throw new Error("ไม่พบคอนเทนเนอร์บอร์ดสำหรับสร้าง PDF");
        }
        await exportElementToPdf(el, filename, boardTitle, {
          backgroundColor: exportTheme === "dark" ? "#0b0c1b" : "#ffffff",
          orientation: "landscape"
        });
        toast({
          message: "ส่งออกเอกสาร PDF (.pdf) จัดหน้าสวยงามเรียบร้อย! 📑",
          type: "success"
        });
        onClose();
      }
    } catch (err: unknown) {
      console.error("Export error:", err);
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการส่งออกไฟล์";
      toast({
        message: `ส่งออกไม่สำเร็จ: ${msg}`,
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
                ส่งออกข้อมูลบอร์ด (Export Board)
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                บอร์ด <span className="font-semibold text-indigo-600 dark:text-dusk-lavender">{boardTitle}</span> • {currentCount} รายการ ({activeColumns.length} คอลัมน์)
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
                  ขอบเขตข้อมูลที่ต้องการส่งออก:
                </span>
                <span className="text-[11px] font-mono text-amber-700 dark:text-amber-300">
                  {exportScope === "filtered" ? `ตัวกรองปัจจุบัน (${filteredCardsCount})` : `ทั้งหมด (${allCardsCount})`}
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
                  🔍 เฉพาะที่แสดงอยู่ ({filteredCardsCount} งาน)
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
                  📋 งานทั้งหมดในบอร์ด ({allCardsCount} งาน)
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
                รูปแบบการจัดวาง (Layout View)
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
                    <span>บอร์ดเต็มแผ่น</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">
                    ครบทุกคอลัมน์ 100%
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
                    <span>ตารางรายงาน</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">
                    เหมาะสำหรับสไลด์/A4
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Theme Style */}
            <div className="rounded-xl border border-stone-200 bg-white/70 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-2">
                <SunMedium className="h-3.5 w-3.5 text-amber-500" />
                โทนสีเอกสาร (Export Theme)
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
                    <span>กระดาษขาว</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">
                    แนะนำสำหรับ PDF/พิมพ์
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
                    <span>ดาร์กโหมด</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-normal">
                    สไตล์ Retro Dark
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
                สรุปสถิติที่จะถูกส่งออก (Executive Summary)
              </span>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-dusk-lavender flex items-center gap-1 cursor-pointer"
              >
                {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span>{showPreview ? "ซ่อนตัวอย่างเอกสาร" : "ดูตัวอย่างเอกสาร"}</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-stone-100/70 dark:bg-white/5">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">งานทั้งหมด</span>
                <span className="font-bold text-sm">{currentCount} งาน</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50/70 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span className="text-[10px] opacity-75 block">เสร็จสิ้นแล้ว</span>
                <span className="font-bold text-sm">{summaryMetrics.done} ({summaryMetrics.percent}%)</span>
              </div>
              <div className="p-2 rounded-lg bg-indigo-50/70 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300">
                <span className="text-[10px] opacity-75 block">แต้มรวม</span>
                <span className="font-bold text-sm">{summaryMetrics.points} pts</span>
              </div>
              <div className={cn(
                "p-2 rounded-lg",
                summaryMetrics.overdue > 0
                  ? "bg-rose-50/80 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300 font-bold"
                  : "bg-stone-100/70 text-stone-500 dark:bg-white/5 dark:text-stone-400"
              )}>
                <span className="text-[10px] opacity-75 block">เกินกำหนด</span>
                <span className="font-bold text-sm">{summaryMetrics.overdue} งาน</span>
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
                  เอกสารทางการ
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                จัดหน้าเอกสาร A4 ปรับสเกลสวยงาม ไม่ตัดทอนคอลัมน์ พร้อมหัวตารางและสรุป KPI
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 group-hover:underline dark:text-rose-400">
                <span>ดาวน์โหลด PDF</span>
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
                ภาพความละเอียดสูงเต็มแผ่น ครบทุกคอลัมน์และใบงาน 100% เหมาะสำหรับนำเสนอสไลด์
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-purple-600 group-hover:underline dark:text-purple-400">
                <span>ดาวน์โหลด PNG</span>
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
                  สเปรดชีต
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                จัดรูปแบบคอลัมน์สมบูรณ์ พร้อมชื่อผู้รับผิดชอบ, วันที่, สถานะ, และระดับ Priority
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 group-hover:underline dark:text-emerald-400">
                <span>ดาวน์โหลด Excel</span>
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
                  สากล
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                ไฟล์ข้อความสากล UTF-8 BOM รองรับภาษาไทยสมบูรณ์แบบ นำเข้า Google Sheets ได้ทันที
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-blue-600 group-hover:underline dark:text-blue-400">
                <span>ดาวน์โหลด CSV</span>
                <Download className="h-3 w-3" />
              </div>
            </button>
          </div>
        </div>

        <AppModalFooter className="flex items-center justify-between border-t border-stone-200/80 px-5 py-3 dark:border-white/10">
          <span className="text-[11px] text-stone-400">
            ✨ เลย์เอาต์ถูกจัดรูปแบบสำหรับ Export โดยเฉพาะ (ครบ 100% ทุกคอลัมน์และใบงาน)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-300 bg-white px-4 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-300 dark:hover:bg-white/[0.1] cursor-pointer"
          >
            ปิด
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
      .replace(/[^a-z0-9ก-๙_-]+/gi, "-")
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
          message: `ส่งออก Excel (.xlsx) เรียบร้อย (${rows.length} รายการ) 📊`,
          type: "success"
        });
      } else if (format === "csv") {
        const rows = prepareExportRows(activeColumns, members, boardPriorities);
        downloadCsv(rows, filename);
        toast({
          message: `ส่งออก CSV (.csv) เรียบร้อย (${rows.length} รายการ) 📄`,
          type: "success"
        });
      } else if (format === "png") {
        const dedicatedEl = quickCanvasRef.current || document.getElementById("retzlo-export-render-canvas-quick");
        const el = dedicatedEl || document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!el) throw new Error("ไม่พบคอนเทนเนอร์บอร์ดสำหรับจับภาพ");
        await exportElementToPng(el, filename, {
          backgroundColor: exportBg,
          pixelRatio: 2.2
        });
        toast({
          message: "ส่งออกรูปภาพ PNG (.png) คุณภาพสูงเรียบร้อย 🖼️",
          type: "success"
        });
      } else if (format === "pdf") {
        const dedicatedEl = quickCanvasRef.current || document.getElementById("retzlo-export-render-canvas-quick");
        const el = dedicatedEl || document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!el) throw new Error("ไม่พบคอนเทนเนอร์บอร์ดสำหรับสร้าง PDF");
        await exportElementToPdf(el, filename, boardTitle, {
          backgroundColor: exportBg,
          orientation: "landscape"
        });
        toast({
          message: "ส่งออกเอกสาร PDF (.pdf) จัดหน้าสวยงามเรียบร้อย 📑",
          type: "success"
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการส่งออก";
      toast({ message: `ส่งออกไม่สำเร็จ: ${msg}`, type: "error" });
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
            title="ส่งออกข้อมูลบอร์ด (Excel, CSV, PDF, PNG)"
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
            ส่งออกข้อมูล (Export)
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => handleQuickExport("pdf")}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <FileDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs">PDF (.pdf)</span>
              <span className="text-[10px] text-stone-400">เอกสาร A4 จัดหน้าสวยงาม</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleQuickExport("png")}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs">PNG (.png)</span>
              <span className="text-[10px] text-stone-400">ภาพความละเอียดสูง 2x เต็มบอร์ด</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleQuickExport("excel")}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs">Excel (.xlsx)</span>
              <span className="text-[10px] text-stone-400">สเปรดชีตจัดรูปแบบสมบูรณ์</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleQuickExport("csv")}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs">CSV (.csv)</span>
              <span className="text-[10px] text-stone-400">รองรับภาษาไทย UTF-8 BOM</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer py-1.5 font-medium text-xs text-indigo-600 dark:text-dusk-lavender"
          >
            <Download className="h-3.5 w-3.5" />
            <span>ปรับแต่งเลย์เอาต์ &amp; ตัวเลือกเพิ่มเติม...</span>
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
