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
