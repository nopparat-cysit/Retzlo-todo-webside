import { describe, expect, it } from "vitest";

import { cardColorOptions, normalizeCardColor } from "./card-colors";

describe("card colors", () => {
  it("provides default plus nine theme colors", () => {
    expect(cardColorOptions).toHaveLength(10);
    expect(cardColorOptions[0].value).toBe("DEFAULT");
  });

  it("normalizes unknown colors back to default", () => {
    expect(normalizeCardColor("LAVENDER")).toBe("LAVENDER");
    expect(normalizeCardColor("neon-green")).toBe("DEFAULT");
    expect(normalizeCardColor(null)).toBe("DEFAULT");
  });
});
