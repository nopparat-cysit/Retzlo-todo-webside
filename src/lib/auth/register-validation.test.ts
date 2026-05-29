import { describe, expect, it } from "vitest";

import { parseRegisterPayload } from "./register-validation";

describe("parseRegisterPayload", () => {
  it("rejects mismatched password confirmation", () => {
    expect(() =>
      parseRegisterPayload({
        email: "night@example.com",
        username: "night",
        password: "Password123",
        confirmPassword: "Password456",
        name: "Night"
      })
    ).toThrow("Passwords do not match.");
  });

  it("returns normalized registration data without confirm password", () => {
    expect(
      parseRegisterPayload({
        email: "Night@Example.COM",
        username: "  Night_Rider  ",
        password: "Password123",
        confirmPassword: "Password123",
        name: "  Night  "
      })
    ).toEqual({
      email: "night@example.com",
      username: "night_rider",
      password: "Password123",
      name: "Night"
    });
  });

  it("rejects invalid usernames", () => {
    expect(() =>
      parseRegisterPayload({
        email: "night@example.com",
        username: "no spaces",
        password: "Password123",
        confirmPassword: "Password123"
      })
    ).toThrow();
  });
});
