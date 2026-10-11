import { describe, expect, it } from "vitest";
import { resolveExportSelection } from "@/lib/kanban/export-config";

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
