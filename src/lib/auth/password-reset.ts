import bcrypt from "bcryptjs";
import { z } from "zod";

export const OTP_TTL_MINUTES = 10;
export const OTP_LENGTH = 6;

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const verifyResetOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/)
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().regex(/^\d{6}$/),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((payload) => payload.password === payload.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function getOtpExpiry(from = new Date()) {
  return new Date(from.getTime() + OTP_TTL_MINUTES * 60 * 1000);
}

export function hashOtp(otp: string) {
  return bcrypt.hash(otp, 12);
}

export function verifyOtp(otp: string, codeHash: string) {
  return bcrypt.compare(otp, codeHash);
}
