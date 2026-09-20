import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { forgotPasswordSchema, generateOtp, getOtpExpiry, hashOtp, normalizeEmail } from "@/lib/auth/password-reset";
import { sendPasswordResetOtp } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const payload = forgotPasswordSchema.parse(await request.json());
    const email = normalizeEmail(payload.email);

    // Rate limiting: 3 attempts per 10 minutes per IP & email
    const ip = getClientIp(request);
    const ipLimit = checkRateLimit(`forgot-ip:${ip}`, { max: 5, windowMs: 10 * 60 * 1000 });
    const emailLimit = checkRateLimit(`forgot-email:${email}`, { max: 3, windowMs: 10 * 60 * 1000 });

    if (!ipLimit.success || !emailLimit.success) {
      const waitTime = Math.max(ipLimit.reset, emailLimit.reset);
      return jsonError(`Too many password reset requests. Please wait ${waitTime} seconds before trying again.`, 429);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const otp = generateOtp();
    await prisma.passwordResetOtp.create({
      data: {
        email,
        userId: user.id,
        codeHash: await hashOtp(otp),
        expiresAt: getOtpExpiry()
      }
    });
    await sendPasswordResetOtp({ email, otp });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("SMTP is not configured")) {
      return jsonError(error.message, 500);
    }

    return parseError(error);
  }
}
