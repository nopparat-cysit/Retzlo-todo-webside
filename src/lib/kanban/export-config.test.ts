import { describe, expect, it } from "vitest";
import {
  adjustExportPreviewZoom,
  clampExportPreviewZoom,
  getExportPreviewFitZoom,
  resolveExportSelection
} from "@/lib/kanban/export-config";

describe("resolveExportSelection", () => {
  it("uses the current view as the default visual layout", () => {
    expect(resolveExportSelection({
      format: "pdf",
      currentView: "table",
      scope: "filtered",
      theme: "dark"
    })).toEqual({
      kind: "visual",
      format: "pdf",
      layout: "table",
      scope: "filtered",
      theme: "dark"
    });
  });

  it("uses an explicitly selected visual layout", () => {
    expect(resolveExportSelection({
      format: "png",
      currentView: "table",
      selectedLayout: "kanban",
      scope: "all",
      theme: "light"
    })).toEqual({
      kind: "visual",
      format: "png",
      layout: "kanban",
      scope: "all",
      theme: "light"
    });
  });

  it("omits visual-only options from data exports", () => {
    expect(resolveExportSelection({
      format: "csv",
      currentView: "kanban",
      scope: "filtered",
      theme: "dark"
    })).toEqual({ kind: "data", format: "csv", scope: "filtered" });
  });
});

describe("export preview zoom", () => {
  it("keeps preview zoom within the accessible viewing range", () => {
    expect(clampExportPreviewZoom(0.1)).toBe(0.25);
    expect(clampExportPreviewZoom(3)).toBe(1.8);
    expect(clampExportPreviewZoom(1.25)).toBe(1.25);
  });

  it("changes zoom in predictable tenth steps without exceeding the range", () => {
    expect(adjustExportPreviewZoom(1, 1)).toBe(1.1);
    expect(adjustExportPreviewZoom(0.25, -1)).toBe(0.25);
    expect(adjustExportPreviewZoom(1.8, 1)).toBe(1.8);
  });

  it("fits measured content dimensions before using a safe estimate", () => {
    expect(getExportPreviewFitZoom({
      viewportWidth: 1000,
      viewportHeight: 600,
      measuredContentWidth: 1240,
      measuredContentHeight: 1230,
      fallbackContentWidth: 1240,
      fallbackContentHeight: 800
    })).toBe(0.47);

    expect(getExportPreviewFitZoom({
      viewportWidth: 640,
      viewportHeight: 420,
      measuredContentWidth: 0,
      measuredContentHeight: 0,
      fallbackContentWidth: 1240,
      fallbackContentHeight: 800
    })).toBe(0.5);
  });
});
