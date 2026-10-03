import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRIORITIES,
  MAX_BOARD_PRIORITIES,
  PRIORITY_COLOR_OPTIONS,
  getPriorityMeta,
  resolveBoardPriorities,
  sortCardsByPriority
} from "./priority";

describe("Custom Priority Module", () => {
  it("defaults to 3 standard priorities when none are provided", () => {
    const resolvedNull = resolveBoardPriorities(null);
    expect(resolvedNull).toEqual(DEFAULT_PRIORITIES);
    expect(resolvedNull).toHaveLength(3);
    expect(resolvedNull[0].id).toBe("HIGH");
    expect(resolvedNull[1].id).toBe("MEDIUM");
    expect(resolvedNull[2].id).toBe("LOW");
  });

  it("sanitizes custom priorities and caps at maximum 10 levels", () => {
    const list = Array.from({ length: 15 }, (_, i) => ({
      id: `p_${i + 1}`,
      label: `Priority ${i + 1}`,
      color: "rose",
      level: i + 1
    }));

    const resolved = resolveBoardPriorities(list);
    expect(resolved).toHaveLength(MAX_BOARD_PRIORITIES);
    expect(resolved).toHaveLength(10);
    expect(resolved[0].level).toBe(1);
    expect(resolved[9].level).toBe(10);
  });

  it("supports color selection from retro lofi palette", () => {
    const custom = [
      { id: "BLOCKER", label: "Blocker", color: "rose", level: 1 },
      { id: "URGENT", label: "Urgent", color: "orange", level: 2 },
      { id: "NORMAL", label: "Normal", color: "emerald", level: 3 },
      { id: "BACKLOG", label: "Backlog", color: "stone", level: 4 }
    ];

    const resolved = resolveBoardPriorities(custom);
    expect(resolved).toHaveLength(4);

    const blockerMeta = getPriorityMeta("BLOCKER", resolved);
    expect(blockerMeta.label).toBe("Blocker");
    expect(blockerMeta.colorConfig.id).toBe("rose");
    expect(blockerMeta.pillClass).toContain("bg-red-500/15");

    const normalMeta = getPriorityMeta("NORMAL", resolved);
    expect(normalMeta.label).toBe("Normal");
    expect(normalMeta.colorConfig.id).toBe("emerald");
    expect(normalMeta.pillClass).toContain("bg-emerald-500/15");
  });

  it("handles fallback gracefully for legacy priorities or undefined keys", () => {
    const custom = [
      { id: "CRITICAL", label: "Critical", color: "rose", level: 1 },
      { id: "MINOR", label: "Minor", color: "sky", level: 2 }
    ];

    const metaHigh = getPriorityMeta("HIGH", custom);
    expect(metaHigh.label).toBe("Critical");

    const metaLow = getPriorityMeta("LOW", custom);
    expect(metaLow.label).toBe("Minor");

    const unknownMeta = getPriorityMeta("UNKNOWN_KEY", custom);
    expect(unknownMeta.label).toBe("UNKNOWN_KEY");
    expect(unknownMeta.colorConfig).toBeDefined();
  });

  it("sorts cards by custom priority level correctly", () => {
    const custom = [
      { id: "P1", label: "Highest", color: "rose", level: 1 },
      { id: "P2", label: "High", color: "orange", level: 2 },
      { id: "P3", label: "Normal", color: "indigo", level: 3 },
      { id: "P4", label: "Low", color: "stone", level: 4 }
    ];

    const cards = [
      { id: "c1", priority: "P3" },
      { id: "c2", priority: "P1" },
      { id: "c3", priority: "P4" },
      { id: "c4", priority: "P2" }
    ];

    const urgentFirst = sortCardsByPriority(cards, "desc", custom);
    expect(urgentFirst.map((c) => c.id)).toEqual(["c2", "c4", "c1", "c3"]);

    const lowestFirst = sortCardsByPriority(cards, "asc", custom);
    expect(lowestFirst.map((c) => c.id)).toEqual(["c3", "c1", "c4", "c2"]);
  });
});
