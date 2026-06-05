import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

const updateProfileSchema = z.object({
  name: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(300).nullable().optional(),
  status: z.enum(["ONLINE", "OFFLINE", "BUSY"]).optional(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized.", 401);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatar: true,
      bio: true,
      status: true,
      globalCoins: true,
      createdAt: true,
      memberships: {
        select: {
          projectId: true,
          role: true,
          coins: true,
          project: {
            select: {
              id: true,
              name: true,
              coinName: true,
              coinSymbol: true
            }
          }
        }
      }
    },
  });

  if (!user) return jsonError("User not found.", 404);
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) return jsonError("Unauthorized.", 401);

    const payload = updateProfileSchema.parse(await request.json());

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(payload.name !== undefined && { name: payload.name }),
        ...(payload.bio !== undefined && { bio: payload.bio }),
        ...(payload.status !== undefined && { status: payload.status }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        status: true,
        globalCoins: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return parseError(error);
  }
}
