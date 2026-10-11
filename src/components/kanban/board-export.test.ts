import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Board Export System (Excel, CSV, PDF, PNG)", () => {
  it("wires active view into both export entry points and resolves quick visual layout", () => {
    const modalSrc = readFileSync(join(process.cwd(), "src/components/kanban/board-export-modal.tsx"), "utf8");
    const boardSrc = readFileSync(join(process.cwd(), "src/components/kanban/board.tsx"), "utf8");
    const listSrc = readFileSync(join(process.cwd(), "src/components/kanban/board-list-view.tsx"), "utf8");
    const quickSrc = modalSrc.slice(modalSrc.indexOf("export function BoardExportButton"));

    expect(modalSrc.match(/currentView: ExportView;/g) ?? []).toHaveLength(2);
    expect(boardSrc).toContain('const currentView = viewMode === "list" ? "table" : "kanban"');
    expect(boardSrc).toContain("currentView={currentView}");
    expect(listSrc).toContain('currentView="table"');
    expect(quickSrc).toContain("currentView={currentView}");
    expect(quickSrc).toContain("resolveExportSelection({");
    expect(quickSrc).toContain("layout={quickSelection.layout}");
    expect(quickSrc).not.toContain('layout="kanban"');
    expect(quickSrc).toContain('scope: isFiltered ? "filtered" : "all"');
    expect(quickSrc).toContain("{quickScopeLabel}");
    expect(modalSrc).toContain("useState<ExportLayout>(currentView)");
    expect(modalSrc).toContain("setExportLayout(currentView)");
  });

  it("verifies BoardExportModal presents all 4 requested export formats", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/kanban/board-export-modal.tsx"),
      "utf8"
    );

    // Modal and Button exports
    expect(src).toContain("export function BoardExportModal");
    expect(src).toContain("export function BoardExportButton");

    // 4 formats
    expect(src).toContain('Excel (.xlsx)');
    expect(src).toContain('CSV (.csv)');
    expect(src).toContain('PDF (.pdf)');
    expect(src).toContain('PNG (.png)');

    // Scope selection (All vs Filtered)
    expect(src).toContain("exportScope");
    expect(src).toContain("handleExport");
  });

  it("verifies export utilities library implements all formats", () => {
    const src = readFileSync(
      join(process.cwd(), "src/lib/kanban/export-board.ts"),
      "utf8"
    );

    expect(src).toContain("export function prepareExportRows");
    expect(src).toContain("export function generateCsvContent");
    expect(src).toContain("export function downloadCsv");
    expect(src).toContain("export function downloadExcel");
    expect(src).toContain("export async function exportElementToPng");
    expect(src).toContain("export async function exportElementToPdf");

    // UTF-8 BOM for Thai Excel compatibility
    expect(src).toContain("\\uFEFF");
  });

  it("verifies board.tsx integrates BoardExportButton and defines kanban-main-viewport", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/kanban/board.tsx"),
      "utf8"
    );

    expect(src).toContain("<BoardExportButton");
    expect(src).toContain('id="kanban-main-viewport"');
  });

  it("verifies board-list-view.tsx integrates BoardExportButton and defines kanban-table-container", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/kanban/board-list-view.tsx"),
      "utf8"
    );

    expect(src).toContain("<BoardExportButton");
    expect(src).toContain('id="kanban-table-container"');
    expect(src).toContain("boardTitle");
  });

  it("verifies dedicated BoardExportDocument is implemented with executive header, KPIs, and layouts", () => {
    const docSrc = readFileSync(
      join(process.cwd(), "src/components/kanban/board-export-document.tsx"),
      "utf8"
    );

    expect(docSrc).toContain("export function BoardExportDocument");
    expect(docSrc).toContain("RETZLO WORKSPACE • PROJECT EXPORT");
    expect(docSrc).toContain("Overall Progress");
    expect(docSrc).toContain("stats.totalCards");
    expect(docSrc).toContain("stats.completionRate");
    expect(docSrc).toContain("ExportCardItem");
    expect(docSrc).toContain("layout === \"kanban\"");
    expect(docSrc).toContain("layout === \"table\"");
  });

  it("verifies BoardExportModal mounts unclipped off-screen export container and exposes layout & theme options", () => {
    const modalSrc = readFileSync(
      join(process.cwd(), "src/components/kanban/board-export-modal.tsx"),
      "utf8"
    );

    expect(modalSrc).toContain("BoardExportDocument");
    expect(modalSrc).toContain('id="retzlo-export-render-canvas"');
    expect(modalSrc).toContain('id="retzlo-export-render-canvas-quick"');
    expect(modalSrc).toContain("exportLayout");
    expect(modalSrc).toContain("exportTheme");
    expect(modalSrc).toContain("Layout View");
    expect(modalSrc).toContain("Export Theme");
  });
});

