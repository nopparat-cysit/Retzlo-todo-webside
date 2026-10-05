import { describe, expect, it } from "vitest";

import { getStatusMeta, STATUS_WORKFLOW_TEMPLATES } from "./status";

describe("getStatusMeta", () => {
  it("returns distinct display metadata for every card status", () => {
    const statuses = ["TODO", "DOING", "WAITING", "DONE"] as const;
    const classes = statuses.map((status) => getStatusMeta(status).badgeClass);

    expect(new Set(classes).size).toBe(statuses.length);
  });
});

describe("STATUS_WORKFLOW_TEMPLATES", () => {
  it("defines standard, software, scrum, marketing, bug_tracker, design, sales templates", () => {
    const templateKeys = Object.keys(STATUS_WORKFLOW_TEMPLATES);
    expect(templateKeys).toContain("standard");
    expect(templateKeys).toContain("software");
    expect(templateKeys).toContain("scrum");
    expect(templateKeys).toContain("marketing");
    expect(templateKeys).toContain("bug_tracker");
    expect(templateKeys).toContain("design");
    expect(templateKeys).toContain("sales");
  });

  it("ensures each template has valid name, category, icon, and at least 3 statuses", () => {
    Object.values(STATUS_WORKFLOW_TEMPLATES).forEach((tpl) => {
      expect(tpl.id).toBeTruthy();
      expect(tpl.name).toBeTruthy();
      expect(tpl.category).toBeTruthy();
      expect(tpl.icon).toBeTruthy();
      expect(tpl.statuses.length).toBeGreaterThanOrEqual(3);

      tpl.statuses.forEach((st) => {
        expect(st.value).toBeTruthy();
        expect(st.label).toBeTruthy();
      });
    });
  });
});
