import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { requireAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { setAdminUserAiQuota, getUserAiQuota } from "@/lib/ai/credits";
import { recordAdminAudit } from "@/lib/admin-system-state";
import { createAuditLog } from "@/lib/audit/audit-logger";

export const dynamic = "force-dynamic";

const updateUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().trim().min(1).max(100).optional(),
  globalRole: z.enum(["USER", "ADMIN"]).optional(),
  status: z.enum(["ONLINE", "OFFLINE", "BUSY", "SUSPENDED"]).optional(),
  globalCoins: z.number().int().min(0).max(999999).optional(),
  aiTier: z.enum(["FREE", "PRO"]).optional(),
  aiCredits: z.number().int().min(0).max(999999).optional()
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
    const status = searchParams.get("status")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
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

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const [total, rawUsers] = await Promise.all([
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
          bio: true,
          globalRole: true,
          status: true,
          globalCoins: true,
          zenGarden: true,
          createdAt: true,
          _count: {
            select: {
              memberships: true,
              notes: true,
              diaryItems: true,
              cardComments: true
            }
          }
        }
      })
    ]);

    const users = await Promise.all(
      rawUsers.map(async (u) => {
        const aiQuota = await getUserAiQuota(u.id);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          username: u.username,
          avatar: u.avatar,
          bio: u.bio,
          globalRole: u.globalRole,
          status: u.status,
          globalCoins: u.globalCoins,
          aiQuota,
          createdAt: u.createdAt,
          counts: u._count
        };
      })
    );

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
      select: { id: true, email: true, name: true, globalRole: true, status: true, globalCoins: true }
    });

    if (!targetUser) {
      return jsonError("User not found.", 404);
    }

    const updateData: Record<string, unknown> = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.globalRole !== undefined) updateData.globalRole = payload.globalRole;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.globalCoins !== undefined) updateData.globalCoins = payload.globalCoins;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: payload.userId },
        data: updateData
      });
    }

    if (payload.aiTier !== undefined || payload.aiCredits !== undefined) {
      await setAdminUserAiQuota(payload.userId, {
        tier: payload.aiTier,
        credits: payload.aiCredits
      });
    }

    // Log admin audit
    recordAdminAudit({
      adminEmail: admin.email,
      action: "UPDATE_USER",
      targetType: "USER",
      targetId: payload.userId,
      targetName: targetUser.email,
      details: {
        roleChanged: payload.globalRole,
        statusChanged: payload.status,
        coinsSet: payload.globalCoins,
        aiTierSet: payload.aiTier,
        aiCreditsSet: payload.aiCredits
      }
    });

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (request.headers.get("x-real-ip") || null);
    const userAgent = request.headers.get("user-agent") || null;

    void createAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorName: admin.name,
      actorRole: admin.globalRole,
      ipAddress: ip,
      userAgent,
      requestPath: "/api/admin/users",
      requestMethod: "PATCH",
      category: "USER",
      action: "ADMIN_USER_UPDATED",
      severity: payload.status === "SUSPENDED" || payload.globalRole ? "WARNING" : "NOTICE",
      status: "SUCCESS",
      targetType: "USER",
      targetId: payload.userId,
      targetName: targetUser.email,
      summary: `Admin ${admin.email} modified settings for user ${targetUser.email} (Role: ${payload.globalRole || targetUser.globalRole}, Status: ${payload.status || targetUser.status})`,
      beforeState: targetUser,
      afterState: {
        ...targetUser,
        ...updateData,
        aiTier: payload.aiTier,
        aiCredits: payload.aiCredits
      },
      metadata: {
        roleChanged: payload.globalRole,
        statusChanged: payload.status,
        coinsSet: payload.globalCoins,
        aiTierSet: payload.aiTier,
        aiCreditsSet: payload.aiCredits
      }
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        globalRole: true,
        status: true,
        globalCoins: true,
        createdAt: true
      }
    });

    const aiQuota = await getUserAiQuota(payload.userId);

    return NextResponse.json({
      user: {
        ...updatedUser,
        aiQuota
      }
    });
  } catch (error) {
    return parseError(error);
  }
}
