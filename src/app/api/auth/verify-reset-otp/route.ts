import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { normalizeEmail, verifyOtp, verifyResetOtpSchema } from "@/lib/auth/password-reset";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const payload = verifyResetOtpSchema.parse(await request.json());
    const email = normalizeEmail(payload.email);
    const resetOtp = await prisma.passwordResetOtp.findFirst({
      where: {
        email,
        usedAt: null
      },
      orderBy: { createdAt: "desc" }
    });

    if (!resetOtp || resetOtp.expiresAt < new Date()) {
      return jsonError("OTP is invalid or expired.", 400);
    }

    if (resetOtp.attempts >= 5) {
      return jsonError("Too many OTP attempts. Request a new code.", 429);
    }

    const isValidOtp = await verifyOtp(payload.otp, resetOtp.codeHash);

    if (!isValidOtp) {
      await prisma.passwordResetOtp.update({
        where: { id: resetOtp.id },
        data: { attempts: { increment: 1 } }
      });

      return jsonError("OTP is invalid or expired.", 400);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
