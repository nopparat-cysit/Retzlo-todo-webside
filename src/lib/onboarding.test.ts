import { describe, expect, it } from "vitest";

describe("Onboarding Template Configuration", () => {
  it("defines standard starter columns matching the workflow", () => {
    const defaultColumns = [
      { name: "Backlog", defaultCardStatus: "TODO", position: 0 },
      { name: "In Progress", defaultCardStatus: "DOING", position: 1 },
      { name: "Done", defaultCardStatus: "DONE", position: 2 }
    ];

    expect(defaultColumns).toHaveLength(3);
    expect(defaultColumns[0].name).toBe("Backlog");
    expect(defaultColumns[1].name).toBe("In Progress");
    expect(defaultColumns[2].name).toBe("Done");
  });

  it("formats starter card titles with personalized display name", () => {
    const formatWelcomeTitle = (name?: string) => `👋 Welcome to Retzlo, ${name?.trim() || "Dreamer"}!`;
    expect(formatWelcomeTitle("Nopparat")).toBe("👋 Welcome to Retzlo, Nopparat!");
    expect(formatWelcomeTitle("   ")).toBe("👋 Welcome to Retzlo, Dreamer!");
    expect(formatWelcomeTitle(undefined)).toBe("👋 Welcome to Retzlo, Dreamer!");
  });
});
