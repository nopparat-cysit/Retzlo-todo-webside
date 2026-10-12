export type ExportView = "kanban" | "table";
export type ExportFormat = "pdf" | "png" | "excel" | "csv";
export type ExportScope = "all" | "filtered";
export type ExportTheme = "light" | "dark";

export type ExportSelectionInput = {
  format: ExportFormat;
  currentView: ExportView;
  selectedLayout?: ExportView;
  scope: ExportScope;
  theme: ExportTheme;
};

export type VisualExportSelection = {
  kind: "visual";
  format: "pdf" | "png";
  layout: ExportView;
  scope: ExportScope;
  theme: ExportTheme;
};

export type DataExportSelection = {
  kind: "data";
  format: "excel" | "csv";
  scope: ExportScope;
};

export type ExportSelection = VisualExportSelection | DataExportSelection;

export const EXPORT_PREVIEW_ZOOM_MIN = 0.25;
export const EXPORT_PREVIEW_ZOOM_MAX = 1.8;
export const EXPORT_PREVIEW_ZOOM_STEP = 0.1;
export const EXPORT_PREVIEW_DEFAULT_ZOOM = 0.9;

export function clampExportPreviewZoom(zoom: number): number {
  const bounded = Math.min(EXPORT_PREVIEW_ZOOM_MAX, Math.max(EXPORT_PREVIEW_ZOOM_MIN, zoom));
  return Math.round(bounded * 100) / 100;
}

export function adjustExportPreviewZoom(zoom: number, direction: -1 | 1): number {
  return clampExportPreviewZoom(zoom + direction * EXPORT_PREVIEW_ZOOM_STEP);
}

export interface ExportPreviewFitInput {
  viewportWidth: number;
  viewportHeight: number;
  measuredContentWidth: number;
  measuredContentHeight: number;
  fallbackContentWidth: number;
  fallbackContentHeight: number;
}

export function getExportPreviewFitZoom({
  viewportWidth,
  viewportHeight,
  measuredContentWidth,
  measuredContentHeight,
  fallbackContentWidth,
  fallbackContentHeight
}: ExportPreviewFitInput): number {
  const contentWidth = measuredContentWidth > 0 ? measuredContentWidth : fallbackContentWidth;
  const contentHeight = measuredContentHeight > 0 ? measuredContentHeight : fallbackContentHeight;
  if (viewportWidth <= 0 || viewportHeight <= 0 || contentWidth <= 0 || contentHeight <= 0) {
    return 0.7;
  }

  const fitScale = Math.min(
    (viewportWidth - 24) / contentWidth,
    (viewportHeight - 24) / contentHeight
  );
  return clampExportPreviewZoom(fitScale);
}

export function resolveExportSelection(input: ExportSelectionInput): ExportSelection {
  if (input.format === "pdf" || input.format === "png") {
    return {
      kind: "visual",
      format: input.format,
      layout: input.selectedLayout ?? input.currentView,
      scope: input.scope,
      theme: input.theme
    };
  }

  return {
    kind: "data",
    format: input.format,
    scope: input.scope
  };
}
