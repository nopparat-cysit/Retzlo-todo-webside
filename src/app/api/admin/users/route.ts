import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { requireAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const updateUserSchema = z.object({
  userId: z.string().min(1),
  globalRole: z.enum(["USER", "ADMIN"]).optional(),
  status: z.enum(["ONLINE", "OFFLINE", "BUSY", "SUSPENDED"]).optional()
});

export async function GET(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};

    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } }
      ];
    }

    if (role && role !== "ALL") {
      whereClause.globalRole = role;
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          globalRole: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              memberships: true,
              notes: true,
              diaryItems: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return parseError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const payload = updateUserSchema.parse(await request.json());

    if (payload.userId === admin.id && payload.globalRole === "USER") {
      return jsonError("You cannot demote your own admin account.", 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, globalRole: true, status: true }
    });

    if (!targetUser) {
      return jsonError("User not found.", 404);
    }

    const updateData: Record<string, string> = {};
    if (payload.globalRole) updateData.globalRole = payload.globalRole;
    if (payload.status) updateData.status = payload.status;

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        globalRole: true,
        status: true,
        createdAt: true
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return parseError(error);
  }
}
