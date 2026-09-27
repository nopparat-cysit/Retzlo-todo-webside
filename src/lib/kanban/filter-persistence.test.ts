import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_BOARD_FILTERS,
  getBoardFilterStorageKey,
  getProjectFilterStorageKey,
  loadSavedBoardFilters,
  saveBoardFilters,
  sanitizeFilterPreferences
} from "./filter-persistence";

class MockStorage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

describe("filter-persistence", () => {
  const boardId = "board-123";
  const projectId = "proj-abc";
  const userId = "user-999";

  beforeEach(() => {
    (globalThis as any).window = {
      localStorage: new MockStorage()
    };
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  it("builds user-scoped storage keys", () => {
    expect(getBoardFilterStorageKey("b1", "u1")).toBe("retrod:board-filters:b1:u1");
    expect(getBoardFilterStorageKey("b1", null)).toBe("retrod:board-filters:b1:anonymous");
    expect(getProjectFilterStorageKey("p1", "u1")).toBe("retrod:project-filters:p1:u1");
    expect(getProjectFilterStorageKey(undefined, null)).toBe("retrod:project-filters:default:anonymous");
  });

  it("sanitizes filter preferences safely", () => {
    expect(sanitizeFilterPreferences(null)).toEqual(DEFAULT_BOARD_FILTERS);
    expect(sanitizeFilterPreferences({ assigneeFilter: "  user-1  " })).toEqual({
      assigneeFilter: "user-1",
      isTodayFilterActive: false,
      cardSort: "manual"
    });
    expect(
      sanitizeFilterPreferences({
        assigneeFilter: "UNASSIGNED",
        isTodayFilterActive: true,
        cardSort: "priority_desc"
      })
    ).toEqual({
      assigneeFilter: "UNASSIGNED",
      isTodayFilterActive: true,
      cardSort: "priority_desc"
    });
    // Invalid sort falls back to manual
    expect(sanitizeFilterPreferences({ cardSort: "invalid_sort" as any })).toEqual({
      assigneeFilter: "ALL",
      isTodayFilterActive: false,
      cardSort: "manual"
    });
  });

  it("saves and loads board-specific user filter preferences", () => {
    saveBoardFilters(boardId, projectId, userId, {
      assigneeFilter: userId,
      isTodayFilterActive: true,
      cardSort: "difficulty_desc"
    });

    const loaded = loadSavedBoardFilters(boardId, projectId, userId);
    expect(loaded).toEqual({
      assigneeFilter: userId,
      isTodayFilterActive: true,
      cardSort: "difficulty_desc"
    });
  });

  it("falls back to project-level user filter preferences when board has no specific filter", () => {
    // Save for another board in same project
    saveBoardFilters("other-board", projectId, userId, {
      assigneeFilter: userId,
      isTodayFilterActive: false,
      cardSort: "priority_desc"
    });

    // Load for new board without its own key
    const loaded = loadSavedBoardFilters("new-board", projectId, userId);
    expect(loaded).toEqual({
      assigneeFilter: userId,
      isTodayFilterActive: false,
      cardSort: "priority_desc"
    });
  });

  it("isolates saved filters by user", () => {
    saveBoardFilters(boardId, projectId, "user-A", {
      assigneeFilter: "user-A",
      isTodayFilterActive: true,
      cardSort: "priority_desc"
    });

    expect(loadSavedBoardFilters(boardId, projectId, "user-B")).toBeNull();
  });
});
