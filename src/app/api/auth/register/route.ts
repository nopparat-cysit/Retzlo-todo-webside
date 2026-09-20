import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { parseRegisterPayload } from "@/lib/auth/register-validation";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { seedWelcomeWorkspace } from "@/lib/onboarding";

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return jsonError("Database is not configured. Add DATABASE_URL to .env.local.", 500);
    }

    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`register:${ip}`, { max: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.success) {
      return jsonError(`Too many registration attempts. Please try again in ${rateLimit.reset} seconds.`, 429);
    }

    const payload = parseRegisterPayload(await request.json());
    const email = payload.email;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return jsonError("Email is already registered.", 409);
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: payload.username } });

    if (existingUsername) {
      return jsonError("Username is already taken.", 409);
    }

    const user = await prisma.user.create({
      data: {
        email,
        username: payload.username,
        name: payload.name,
        password: await hashPassword(payload.password)
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true
      }
    });

    // Auto-seed welcome starter workspace for new users (non-blocking)
    try {
      await seedWelcomeWorkspace(user.id, user.name || undefined);
    } catch (seedError) {
      console.error("Failed to seed welcome workspace on user registration:", seedError);
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
