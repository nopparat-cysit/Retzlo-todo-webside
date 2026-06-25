import { describe, expect, it } from "vitest";

import { sortProjectsByStarred } from "@/lib/projects/sort";

describe("project sorting", () => {
  it("moves starred projects before unstarred projects while preserving each group order", () => {
    const projects = [
      { id: "project-a" },
      { id: "project-b" },
      { id: "project-c" },
      { id: "project-d" }
    ];

    expect(sortProjectsByStarred(projects, new Set(["project-c", "project-b"])).map((project) => project.id)).toEqual([
      "project-b",
      "project-c",
      "project-a",
      "project-d"
    ]);
  });
});
