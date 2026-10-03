"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  Printer,
  Sparkles,
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

export interface BoardExportModalProps {
  open: boolean;
  onClose: () => void;
  boardTitle: string;
  columns: ColumnWithCards[];
  filteredColumns?: ColumnWithCards[];
  members: CardAssignee[];
  boardPriorities?: CustomPriority[];
  viewportElementId?: string;
  isFiltered?: boolean;
}

export type ExportFormat = "excel" | "csv" | "pdf" | "png";

export function BoardExportModal({
  open,
  onClose,
  boardTitle,
  columns,
  filteredColumns,
  members,
  boardPriorities,
  viewportElementId = "kanban-main-viewport",
  isFiltered = false
}: BoardExportModalProps) {
  const { toast } = useToast();
  const [exportScope, setExportScope] = useState<"all" | "filtered">(isFiltered ? "filtered" : "all");
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

  // Safe filename generator: board-name-2026-10-04
  const getFilename = () => {
    const today = new Date().toISOString().split("T")[0];
    const safeTitle = (boardTitle || "board")
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙_-]+/gi, "-")
      .replace(/^-+|-+$/g, "");
    return `${safeTitle || "board"}-export-${today}`;
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
        const el = document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!el) {
          throw new Error("ไม่พบคอนเทนเนอร์บอร์ดสำหรับจับภาพหน้าจอ");
        }
        await exportElementToPng(el, filename);
        toast({
          message: "ส่งออกรูปภาพ PNG (.png) ความละเอียดสูงสำเร็จ! 🖼️",
          type: "success"
        });
        onClose();
      } else if (format === "pdf") {
        const el = document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!el) {
          throw new Error("ไม่พบคอนเทนเนอร์บอร์ดสำหรับสร้าง PDF");
        }
        await exportElementToPdf(el, filename, boardTitle);
        toast({
          message: "ส่งออกเอกสาร PDF (.pdf) สำเร็จเรียบร้อย! 📑",
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
    <AppModal
      open={open}
      onClose={onClose}
      contentClassName="max-w-xl rounded-2xl border border-stone-200 bg-[#faf7f2] p-0 text-stone-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0e1025] dark:text-stone-100"
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
              ส่งออกข้อมูลบอร์ด (Export)
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              บอร์ด <span className="font-semibold text-indigo-600 dark:text-dusk-lavender">{boardTitle}</span> • {currentCount} รายการ
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

      <div className="p-5 space-y-4">
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

        {/* ── 4 Format Cards (Excel, CSV, PDF, PNG) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Excel (.xlsx) */}
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
              ไฟล์ Excel จัดรูปแบบคอลัมน์อัตโนมัติ พร้อมชื่อผู้รับผิดชอบ, วันที่, และระดับ Priority
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 group-hover:underline dark:text-emerald-400">
              <span>ดาวน์โหลด Excel</span>
              <Download className="h-3 w-3" />
            </div>
          </button>

          {/* 2. CSV (.csv) */}
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

          {/* 3. PDF (.pdf) */}
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
                เอกสาร
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              เอกสาร PDF จัดหน้า A4 แนวนอน/แนวตั้ง ชัดเจน เหมาะสำหรับนำเสนอหรือจัดเก็บถาวร
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 group-hover:underline dark:text-rose-400">
              <span>ดาวน์โหลด PDF</span>
              <Download className="h-3 w-3" />
            </div>
          </button>

          {/* 4. PNG (.png) */}
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
                รูปภาพ 2x
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              ภาพแคปเจอร์มุมมองบอร์ด/ตารางความละเอียดสูง (2x Retina) นำไปแปะในสไลด์ได้ทันที
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-purple-600 group-hover:underline dark:text-purple-400">
              <span>ดาวน์โหลด PNG</span>
              <Download className="h-3 w-3" />
            </div>
          </button>
        </div>
      </div>

      <AppModalFooter className="flex items-center justify-between border-t border-stone-200/80 px-5 py-3 dark:border-white/10">
        <span className="text-[11px] text-stone-400">
          💡 สกุลไฟล์ทั้งหมดพร้อมใช้งานทันทีโดยไม่ต้องตั้งค่าเพิ่มเติม
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
  );
}

export interface BoardExportButtonProps {
  boardTitle: string;
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
  const { toast } = useToast();

  const getFilename = () => {
    const today = new Date().toISOString().split("T")[0];
    const safeTitle = (boardTitle || "board")
      .toLowerCase()
      .replace(/[^a-z0-9ก-๙_-]+/gi, "-")
      .replace(/^-+|-+$/g, "");
    return `${safeTitle || "board"}-export-${today}`;
  };

  const handleQuickExport = async (format: ExportFormat) => {
    const activeColumns = isFiltered && filteredColumns ? filteredColumns : columns;
    const filename = getFilename();

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
        const el = document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!el) throw new Error("ไม่พบคอนเทนเนอร์บอร์ดสำหรับจับภาพ");
        await exportElementToPng(el, filename);
        toast({
          message: "ส่งออกรูปภาพ PNG (.png) เรียบร้อย 🖼️",
          type: "success"
        });
      } else if (format === "pdf") {
        const el = document.getElementById(viewportElementId) || document.getElementById("kanban-table-container");
        if (!el) throw new Error("ไม่พบคอนเทนเนอร์บอร์ดสำหรับสร้าง PDF");
        await exportElementToPdf(el, filename, boardTitle);
        toast({
          message: "ส่งออกเอกสาร PDF (.pdf) เรียบร้อย 📑",
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
          <DropdownMenuItem
            onClick={() => handleQuickExport("pdf")}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <FileDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs">PDF (.pdf)</span>
              <span className="text-[10px] text-stone-400">เอกสาร A4 จัดหน้าระเบียบ</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleQuickExport("png")}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-xs">PNG (.png)</span>
              <span className="text-[10px] text-stone-400">ภาพหน้าจอคมชัดสูง 2x</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer py-1.5 font-medium text-xs text-indigo-600 dark:text-dusk-lavender"
          >
            <Download className="h-3.5 w-3.5" />
            <span>หน้าต่างตัวเลือกเพิ่มเติม...</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BoardExportModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        boardTitle={boardTitle}
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
