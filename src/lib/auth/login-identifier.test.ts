import { describe, expect, it } from "vitest";

import { normalizeLoginIdentifier } from "./login-identifier";

describe("normalizeLoginIdentifier", () => {
  it("normalizes email identifiers", () => {
    expect(normalizeLoginIdentifier(" Night@Example.COM ")).toEqual({
      type: "email",
      value: "night@example.com"
    });
  });

  it("normalizes username identifiers", () => {
    expect(normalizeLoginIdentifier(" Night_Rider ")).toEqual({
      type: "username",
      value: "night_rider"
    });
  });
});
