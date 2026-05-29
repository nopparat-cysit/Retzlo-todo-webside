import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  generateOtp,
  getOtpExpiry,
  normalizeEmail,
  resetPasswordSchema,
  verifyResetOtpSchema
} from "./password-reset";

describe("password reset helpers", () => {
  it("normalizes email", () => {
    expect(normalizeEmail(" RETROD@Example.COM ")).toBe("retrod@example.com");
  });

  it("generates a six digit otp", () => {
    expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  it("sets otp expiry ten minutes ahead", () => {
    expect(getOtpExpiry(new Date("2026-05-25T10:00:00.000Z")).toISOString()).toBe("2026-05-25T10:10:00.000Z");
  });

  it("accepts a forgot password email payload", () => {
    expect(forgotPasswordSchema.parse({ email: "user@example.com" })).toEqual({ email: "user@example.com" });
  });

  it("accepts an OTP verification payload without a new password", () => {
    expect(verifyResetOtpSchema.parse({ email: "user@example.com", otp: "123456" })).toEqual({
      email: "user@example.com",
      otp: "123456"
    });
  });

  it("rejects mismatched reset passwords", () => {
    expect(() =>
      resetPasswordSchema.parse({
        email: "user@example.com",
        otp: "123456",
        password: "Password123",
        confirmPassword: "Password456"
      })
    ).toThrow();
  });
});
