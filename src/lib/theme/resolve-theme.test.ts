import { describe, expect, it } from "vitest";

import { resolveTheme } from "./resolve-theme";

describe("resolveTheme", () => {
  it("keeps an explicit light or dark preference", () => {
    expect(resolveTheme("light", "dark")).toBe("light");
    expect(resolveTheme("dark", "light")).toBe("dark");
  });

  it("follows the operating system when the preference is system", () => {
    expect(resolveTheme("system", "light")).toBe("light");
    expect(resolveTheme("system", "dark")).toBe("dark");
  });
});
