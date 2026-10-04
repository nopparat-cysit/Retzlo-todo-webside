import * as XLSX from "xlsx";
import type { Card, CardAssignee, ColumnWithCards, CustomPriority } from "@/types/kanban";
import { getPriorityMeta, resolveBoardPriorities } from "@/lib/kanban/priority";

export interface ExportCardRow {
  index: number;
  id: string;
  title: string;
  description: string;
  note: string;
  status: string;
  statusCode: string;
  columnName: string;
  priority: string;
  priorityCode: string;
  assignees: string;
  difficulty: string;
  difficultyScore: number | null;
  startDate: string;
  dueDate: string;
  isOverdue: string;
  checklistProgress: string;
  isStarred: string;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Transforms Kanban board columns into a structured flat row list for export
 */
export function prepareExportRows(
  columns: ColumnWithCards[],
  members: CardAssignee[] = [],
  boardPriorities?: CustomPriority[]
): ExportCardRow[] {
  const resolvedPriorities = resolveBoardPriorities(boardPriorities);
  const memberMap = new Map<string, string>();
  for (const m of members) {
    memberMap.set(m.id, m.name || m.email || m.id);
  }

  const rows: ExportCardRow[] = [];
  let index = 1;

  for (const column of columns) {
    for (const card of column.cards) {
      // Map Assignees
      let assigneeNames = "-";
      if (card.assigneeIds && card.assigneeIds.length > 0) {
        assigneeNames = card.assigneeIds
          .map((id) => memberMap.get(id) || id)
          .join(", ");
      } else if (card.assignees && card.assignees.length > 0) {
        assigneeNames = card.assignees
          .map((a) => a.name || a.email || a.id)
          .join(", ");
      }

      // Map Status
      const statusLabel =
        card.status === "TODO"
          ? "ยังไม่เริ่ม (To Do)"
          : card.status === "DOING"
            ? "กำลังทำ (In Progress)"
            : card.status === "DONE"
              ? "เสร็จสิ้น (Done)"
              : card.status === "WAITING"
                ? "รอดำเนินการ (Waiting)"
                : card.status;

      // Map Priority
      const meta = getPriorityMeta(card.priority, resolvedPriorities);
      const code = `P${Math.max(0, meta.level - 1)}`;
      const priorityLabel = `${code} (${meta.label})`;

      // Checklists
      let checklistProgress = "-";
      if (card.checklist && card.checklist.length > 0) {
        const done = card.checklist.filter((item) => item.checked).length;
        checklistProgress = `${done}/${card.checklist.length} (${Math.round((done / card.checklist.length) * 100)}%)`;
      }

      // Overdue status
      let isOverdue = "ปกติ";
      if (card.dueDate && card.status !== "DONE") {
        const dueTime = new Date(card.dueDate).getTime();
        if (!isNaN(dueTime) && dueTime < Date.now()) {
          isOverdue = "เกินกำหนด (Overdue)";
        }
      }

      rows.push({
        index: index++,
        id: card.id,
        title: card.title || "",
        description: card.description || "",
        note: card.note || "",
        status: statusLabel,
        statusCode: card.status,
        columnName: column.name,
        priority: priorityLabel,
        priorityCode: code,
        assignees: assigneeNames,
        difficulty: card.difficulty ? `${card.difficulty} แต้ม` : "-",
        difficultyScore: card.difficulty ?? null,
        startDate: formatDate(card.startDate),
        dueDate: formatDate(card.dueDate),
        isOverdue,
        checklistProgress,
        isStarred: card.isStarred ? "⭐ ใช่" : "ไม่ใช่"
      });
    }
  }

  return rows;
}

/**
 * Escapes values for standard RFC 4180 CSV
 */
function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates UTF-8 encoded CSV string with BOM for Thai Excel compatibility
 */
export function generateCsvContent(rows: ExportCardRow[]): string {
  const headers = [
    "ลำดับ",
    "ชื่องาน (Task Title)",
    "สถานะ (Status)",
    "คอลัมน์ (Column)",
    "ระดับความสำคัญ (Priority)",
    "ผู้รับผิดชอบ (Assignees)",
    "คะแนนความยาก (Points)",
    "วันเริ่มต้น (Start Date)",
    "วันครบกำหนด (Due Date)",
    "สถานะส่งงาน",
    "เช็คลิสต์ (Checklist)",
    "ติดดาว (Starred)",
    "รายละเอียด (Description)",
    "โน้ต (Note)"
  ];

  const lines = [headers.map(escapeCsv).join(",")];

  for (const r of rows) {
    const line = [
      escapeCsv(r.index),
      escapeCsv(r.title),
      escapeCsv(r.status),
      escapeCsv(r.columnName),
      escapeCsv(r.priority),
      escapeCsv(r.assignees),
      escapeCsv(r.difficulty),
      escapeCsv(r.startDate),
      escapeCsv(r.dueDate),
      escapeCsv(r.isOverdue),
      escapeCsv(r.checklistProgress),
      escapeCsv(r.isStarred),
      escapeCsv(r.description),
      escapeCsv(r.note)
    ].join(",");
    lines.push(line);
  }

  return "\uFEFF" + lines.join("\r\n");
}

/**
 * Triggers a download of a CSV file
 */
export function downloadCsv(rows: ExportCardRow[], filename: string) {
  const csv = generateCsvContent(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

/**
 * Generates and downloads an Excel workbook (.xlsx)
 */
export function downloadExcel(rows: ExportCardRow[], filename: string, sheetTitle = "Tasks") {
  const sheetData = rows.map((r) => ({
    "ลำดับ": r.index,
    "ชื่องาน (Task Title)": r.title,
    "สถานะ (Status)": r.status,
    "คอลัมน์ (Column)": r.columnName,
    "ระดับความสำคัญ (Priority)": r.priority,
    "ผู้รับผิดชอบ (Assignees)": r.assignees,
    "คะแนนความยาก (Points)": r.difficulty,
    "วันเริ่มต้น (Start Date)": r.startDate,
    "วันครบกำหนด (Due Date)": r.dueDate,
    "สถานะส่งงาน": r.isOverdue,
    "เช็คลิสต์": r.checklistProgress,
    "ติดดาว": r.isStarred,
    "รายละเอียด": r.description,
    "โน้ต": r.note
  }));

  const worksheet = XLSX.utils.json_to_sheet(sheetData);

  // Set optimal column widths
  worksheet["!cols"] = [
    { wch: 8 },  // ลำดับ
    { wch: 35 }, // ชื่องาน
    { wch: 20 }, // สถานะ
    { wch: 20 }, // คอลัมน์
    { wch: 22 }, // ความสำคัญ
    { wch: 25 }, // ผู้รับผิดชอบ
    { wch: 14 }, // ความยาก
    { wch: 16 }, // วันเริ่มต้น
    { wch: 16 }, // วันครบกำหนด
    { wch: 18 }, // สถานะส่งงาน
    { wch: 16 }, // เช็คลิสต์
    { wch: 10 }, // ติดดาว
    { wch: 35 }, // รายละเอียด
    { wch: 30 }  // โน้ต
  ];

  const workbook = XLSX.utils.book_new();
  const safeSheetName = sheetTitle.replace(/[\\/?*[\]]/g, "").slice(0, 31) || "Tasks";
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export interface ImageExportOptions {
  backgroundColor?: string;
  pixelRatio?: number;
}

export interface PdfExportOptions {
  backgroundColor?: string;
  orientation?: "landscape" | "portrait" | "auto";
  margin?: number;
}

/**
 * Captures an HTML element as high-res PNG image and downloads it
 */
export async function exportElementToPng(
  element: HTMLElement,
  filename: string,
  options?: ImageExportOptions
) {
  const { toPng } = await import("html-to-image");

  // Allow brief tick for DOM and layout reflow to settle
  await new Promise((resolve) => setTimeout(resolve, 80));

  const defaultBg = document.documentElement.classList.contains("dark") ? "#0b0c1b" : "#ffffff";
  const bg = options?.backgroundColor ?? defaultBg;

  // Measure full natural dimensions
  const scrollW = element.scrollWidth || 0;
  const offsetW = element.offsetWidth || 0;
  const clientW = element.clientWidth || 0;
  const scrollH = element.scrollHeight || 0;
  const offsetH = element.offsetHeight || 0;
  const clientH = element.clientHeight || 0;

  const targetWidth = Math.max(scrollW, offsetW, clientW, 1200);
  const targetHeight = Math.max(scrollH, offsetH, clientH, 600);

  const baseOptions = {
    quality: 0.98,
    pixelRatio: options?.pixelRatio ?? 2,
    backgroundColor: bg,
    width: targetWidth,
    height: targetHeight,
    style: {
      position: "relative",
      left: "0",
      top: "0",
      margin: "0",
      transform: "none",
      opacity: "1",
      visibility: "visible",
      width: `${targetWidth}px`,
      minWidth: `${targetWidth}px`,
      height: `${targetHeight}px`
    },
    filter: (node: Node) => {
      if (node instanceof HTMLElement) {
        if (
          node.classList.contains("fab-hub-container") ||
          node.getAttribute("role") === "dialog" ||
          node.hasAttribute("data-export-exclude")
        ) {
          return false;
        }
      }
      return true;
    }
  };

  let dataUrl: string;
  try {
    dataUrl = await toPng(element, { ...baseOptions, skipFonts: false });
  } catch (fontErr) {
    console.warn("PNG export font embedding failed, falling back with skipFonts: true", fontErr);
    dataUrl = await toPng(element, { ...baseOptions, skipFonts: true });
  }

  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Captures an HTML element and downloads it as a high quality PDF document
 */
export async function exportElementToPdf(
  element: HTMLElement,
  filename: string,
  _title = "Board Export",
  options?: PdfExportOptions
) {
  const [{ jsPDF }, { toPng }] = await Promise.all([
    import("jspdf"),
    import("html-to-image")
  ]);

  // Allow brief tick for DOM and layout reflow to settle
  await new Promise((resolve) => setTimeout(resolve, 80));

  const defaultBg = document.documentElement.classList.contains("dark") ? "#0b0c1b" : "#ffffff";
  const bg = options?.backgroundColor ?? defaultBg;

  // Measure full natural dimensions
  const scrollW = element.scrollWidth || 0;
  const offsetW = element.offsetWidth || 0;
  const clientW = element.clientWidth || 0;
  const scrollH = element.scrollHeight || 0;
  const offsetH = element.offsetHeight || 0;
  const clientH = element.clientHeight || 0;

  const targetWidth = Math.max(scrollW, offsetW, clientW, 1200);
  const targetHeight = Math.max(scrollH, offsetH, clientH, 600);

  const baseOptions = {
    quality: 0.96,
    pixelRatio: 2,
    backgroundColor: bg,
    width: targetWidth,
    height: targetHeight,
    style: {
      position: "relative",
      left: "0",
      top: "0",
      margin: "0",
      transform: "none",
      opacity: "1",
      visibility: "visible",
      width: `${targetWidth}px`,
      minWidth: `${targetWidth}px`,
      height: `${targetHeight}px`
    },
    filter: (node: Node) => {
      if (node instanceof HTMLElement) {
        if (
          node.classList.contains("fab-hub-container") ||
          node.getAttribute("role") === "dialog" ||
          node.hasAttribute("data-export-exclude")
        ) {
          return false;
        }
      }
      return true;
    }
  };

  let dataUrl: string;
  try {
    dataUrl = await toPng(element, { ...baseOptions, skipFonts: false });
  } catch (fontErr) {
    console.warn("PDF export font embedding failed, falling back with skipFonts: true", fontErr);
    dataUrl = await toPng(element, { ...baseOptions, skipFonts: true });
  }

  // Load image to compute true dimensions
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("ไม่สามารถประมวลผลรูปภาพสำหรับสร้าง PDF ได้"));
  });

  if (!img.width || !img.height) {
    throw new Error("ขนาดของบอร์ดไม่ถูกต้อง ไม่สามารถแปลงเป็น PDF ได้");
  }

  const preferredOrientation =
    options?.orientation && options.orientation !== "auto"
      ? options.orientation
      : img.width >= img.height * 0.95
        ? "landscape"
        : "portrait";

  const pdf = new jsPDF({
    orientation: preferredOrientation,
    unit: "mm",
    format: "a4"
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = options?.margin ?? 10;
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;

  // Scale ratio: mm per px
  const mmPerPx = printableWidth / img.width;
  const totalHeightMm = img.height * mmPerPx;

  if (totalHeightMm <= printableHeight) {
    // Fits cleanly on 1 page: center vertically
    const yPos = margin + (printableHeight - totalHeightMm) / 2;
    pdf.addImage(dataUrl, "PNG", margin, yPos, printableWidth, totalHeightMm);
  } else if (totalHeightMm <= printableHeight * 1.25) {
    // Slightly taller than 1 page: scale down proportionally to fit 1 page comfortably
    const fitScale = printableHeight / totalHeightMm;
    const finalW = printableWidth * fitScale;
    const finalH = totalHeightMm * fitScale;
    const xPos = (pageWidth - finalW) / 2;
    pdf.addImage(dataUrl, "PNG", xPos, margin, finalW, finalH);
  } else {
    // Significantly tall content (e.g. large boards or multi-item tables): clean multi-page pagination
    const pagePxHeight = Math.floor(printableHeight / mmPerPx);
    const totalPages = Math.ceil(img.height / pagePxHeight);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const sourceY = page * pagePxHeight;
      const sourceHeight = Math.min(pagePxHeight, img.height - sourceY);

      canvas.width = img.width;
      canvas.height = sourceHeight;

      if (ctx) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          0,
          sourceY,
          img.width,
          sourceHeight,
          0,
          0,
          img.width,
          sourceHeight
        );

        const sliceDataUrl = canvas.toDataURL("image/png");
        const sliceHeightMm = sourceHeight * mmPerPx;
        pdf.addImage(sliceDataUrl, "PNG", margin, margin, printableWidth, sliceHeightMm);
      }
    }
  }

  pdf.save(`${filename}.pdf`);
}

/**
 * Helper to trigger browser download of a Blob
 */
function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
