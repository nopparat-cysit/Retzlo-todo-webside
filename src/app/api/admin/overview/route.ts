import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { requireAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return jsonError("Not Found", 404);
    }

    const [
      totalUsers,
      activeUsers,
      totalProjects,
      totalBoards,
      totalCards,
      totalNotes,
      totalDiaryItems,
      recentUsers,
      recentProjects
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: { not: "OFFLINE" } } }),
      prisma.project.count(),
      prisma.board.count(),
      prisma.card.count(),
      prisma.note.count(),
      prisma.diaryItem.count(),
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
      })
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalProjects,
        totalBoards,
        totalCards,
        totalNotes,
        totalDiaryItems
      },
      recentUsers,
      recentProjects,
      systemHealth: {
        database: "CONNECTED",
        environment: process.env.NODE_ENV || "development"
      }
    });
  } catch (error) {
    return parseError(error);
  }
}
