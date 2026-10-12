import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { requireAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getDecoyTelemetry, getSystemBroadcast } from "@/lib/admin-system-state";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const tStart = performance.now();

    const [
      totalUsers,
      activeUsers,
      totalProjects,
      totalBoards,
      totalCards,
      totalNotes,
      totalDiaryItems,
      totalAttachments,
      pendingRedemptions,
      coinsAggregation,
      recentUsers,
      recentProjects,
      recentActivities
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: { not: "OFFLINE" } } }),
      prisma.project.count(),
      prisma.board.count(),
      prisma.card.count(),
      prisma.note.count(),
      prisma.diaryItem.count(),
      prisma.cardAttachment.count(),
      prisma.redemption.count({ where: { status: "PENDING" } }),
      prisma.user.aggregate({ _sum: { globalCoins: true } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          type: true,
          createdAt: true,
          _count: {
            select: {
              members: true,
              boards: true
            }
          }
        }
      }),
      prisma.boardActivity.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          details: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      })
    ]);

    const dbLatencyMs = Math.round(performance.now() - tStart);
    const decoy = getDecoyTelemetry();
    const broadcast = getSystemBroadcast();

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalProjects,
        totalBoards,
        totalCards,
        totalNotes,
        totalDiaryItems,
        totalAttachments,
        pendingRedemptions,
        totalCoinsCirculation: coinsAggregation._sum.globalCoins || 0
      },
      recentUsers,
      recentProjects,
      recentActivities,
      broadcast,
      decoyHitsCount: decoy.totalHits,
      systemHealth: {
        database: "CONNECTED",
        dbLatencyMs,
        environment: process.env.NODE_ENV || "development"
      }
    });
  } catch (error) {
    return parseError(error);
  }
}
