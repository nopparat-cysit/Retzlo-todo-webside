import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { forgotPasswordSchema, generateOtp, getOtpExpiry, hashOtp, normalizeEmail } from "@/lib/auth/password-reset";
import { sendPasswordResetOtp } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const payload = forgotPasswordSchema.parse(await request.json());
    const email = normalizeEmail(payload.email);
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
