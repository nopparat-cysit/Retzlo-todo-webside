import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

const markReadSchema = z.object({
  notificationId: z.string().uuid().optional(),
  all: z.boolean().default(false),
});

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    return parseError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = markReadSchema.parse(await request.json());

    if (payload.all) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else if (payload.notificationId) {
      await prisma.notification.updateMany({
        where: { id: payload.notificationId, userId },
        data: { isRead: true },
      });
    } else {
      return jsonError("Either notificationId or all: true must be provided.", 400);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
