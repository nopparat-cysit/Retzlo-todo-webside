import { describe, expect, it } from "vitest";

import { isAdminRole } from "./admin-auth";

describe("isAdminRole", () => {
  it("returns true when role is ADMIN or SUPERADMIN", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("SUPERADMIN")).toBe(true);
  });

  it("returns false for regular USER role", () => {
    expect(isAdminRole("USER")).toBe(false);
  });

  it("returns false for undefined, null, or empty string", () => {
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole("")).toBe(false);
  });

  it("returns false for case-mismatched or arbitrary strings", () => {
    expect(isAdminRole("admin")).toBe(false);
    expect(isAdminRole("MEMBER")).toBe(false);
    expect(isAdminRole("GUEST")).toBe(false);
  });
});
