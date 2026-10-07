import { describe, expect, it } from "vitest";

import { BOARD_SCOPED_TABS, SETTINGS_TABS, isBoardScopedTab, resolveSettingsTab } from "./tabs";

describe("resolveSettingsTab", () => {
  it("defaults to identity when nothing is provided", () => {
    expect(resolveSettingsTab({})).toBe("identity");
    expect(resolveSettingsTab({ tab: null, boardId: null })).toBe("identity");
  });

  it("accepts every canonical tab id", () => {
    for (const tab of SETTINGS_TABS) {
      expect(resolveSettingsTab({ tab })).toBe(tab);
    }
  });

  it("maps legacy tab ids to the consolidated structure", () => {
    expect(resolveSettingsTab({ tab: "features" })).toBe("identity");
    expect(resolveSettingsTab({ tab: "all" })).toBe("identity");
    expect(resolveSettingsTab({ tab: "board" })).toBe("board-general");
    expect(resolveSettingsTab({ tab: "columns" })).toBe("board-columns");
  });

  it("opens board details when only a boardId is provided", () => {
    expect(resolveSettingsTab({ boardId: "b1" })).toBe("board-general");
  });

  it("keeps an explicit tab even when a boardId is provided", () => {
    expect(resolveSettingsTab({ tab: "attributes", boardId: "b1" })).toBe("attributes");
  });

  it("falls back to identity for unknown tabs", () => {
    expect(resolveSettingsTab({ tab: "nope" })).toBe("identity");
    expect(resolveSettingsTab({ tab: "nope", boardId: "b1" })).toBe("board-general");
  });
});

describe("isBoardScopedTab", () => {
  it("flags only board-level tabs", () => {
    expect(BOARD_SCOPED_TABS).toEqual(["board-general", "board-columns", "attributes"]);
    expect(isBoardScopedTab("board-columns")).toBe(true);
    expect(isBoardScopedTab("boards")).toBe(false);
    expect(isBoardScopedTab("identity")).toBe(false);
  });
});
