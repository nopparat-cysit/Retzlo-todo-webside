import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { normalizeEmail, resetPasswordSchema, verifyOtp } from "@/lib/auth/password-reset";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`reset-password:${ip}`, { max: 10, windowMs: 15 * 60 * 1000 });
    if (!rl.success) {
      return jsonError("Too many attempts. Please try again later.", 429);
    }

    const payload = resetPasswordSchema.parse(await request.json());
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

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetOtp.userId },
        data: { password: await hashPassword(payload.password) }
      }),
      prisma.passwordResetOtp.update({
        where: { id: resetOtp.id },
        data: { usedAt: new Date() }
      })
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
