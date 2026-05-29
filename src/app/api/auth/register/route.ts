import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { parseRegisterPayload } from "@/lib/auth/register-validation";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return jsonError("Database is not configured. Add DATABASE_URL to .env.local.", 500);
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

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
