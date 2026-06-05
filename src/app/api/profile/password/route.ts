import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { requireUserId } from "@/lib/project-auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters.")
    .max(128),
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) return jsonError("Unauthorized.", 401);

    const payload = changePasswordSchema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) return jsonError("User not found.", 404);

    const isValid = await verifyPassword(payload.currentPassword, user.password);
    if (!isValid) return jsonError("Current password is incorrect.", 400);

    const hashed = await hashPassword(payload.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return parseError(error);
  }
}
