import { describe, expect, it } from "vitest";

import { getStatusMeta } from "./status";

describe("getStatusMeta", () => {
  it("returns distinct display metadata for every card status", () => {
    const statuses = ["TODO", "DOING", "WAITING", "DONE"] as const;
    const classes = statuses.map((status) => getStatusMeta(status).badgeClass);

    expect(new Set(classes).size).toBe(statuses.length);
  });
});
