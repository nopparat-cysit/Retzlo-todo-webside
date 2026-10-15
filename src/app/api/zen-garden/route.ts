import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { createAuditLog } from "@/lib/audit/audit-logger";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";
import {
  BOTANICAL_PLANTS,
  canWaterToday,
  computeNewStreak,
  parseZenGardenState
} from "@/lib/zen-garden/zen-state";

const postActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("nurture")
  }),
  z.object({
    action: z.literal("set-guardian"),
    guardianId: z.string().min(1)
  }),
  z.object({
    action: z.literal("complete-breath"),
    minutes: z.number().int().min(1).max(60).default(1)
  })
]);

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return jsonError("Unauthorized.", 401);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      globalCoins: true,
      zenGarden: true
    }
  });

  if (!user) return jsonError("User not found.", 404);

  const zenGarden = parseZenGardenState(user.zenGarden);

  return NextResponse.json({
    globalCoins: user.globalCoins,
    zenGarden
  });
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) return jsonError("Unauthorized.", 401);

    const body = postActionSchema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        globalRole: true,
        globalCoins: true,
        zenGarden: true
      }
    });

    if (!user) return jsonError("User not found.", 404);

    const currentState = parseZenGardenState(user.zenGarden);
    const todayStr = new Date().toISOString().split("T")[0];

    if (body.action === "nurture") {
      const allowed = canWaterToday(currentState.lastWateredDate, todayStr);
      if (!allowed) {
        return NextResponse.json({
          success: false,
          alreadyNurturedToday: true,
          globalCoins: user.globalCoins,
          zenGarden: currentState,
          message: "The sanctuary has already been nurtured today. Return tomorrow for daily serenity."
        });
      }

      const newStreak = computeNewStreak(currentState.lastWateredDate, currentState.nurtureStreak, todayStr);
      const bonusCoins = 5;

      const nextState = {
        ...currentState,
        nurtureStreak: newStreak,
        lastWateredDate: todayStr,
        totalNourished: currentState.totalNourished + 1
      };

      const updatedUser = await prisma.$transaction(async (tx) => {
        const u = await tx.user.update({
          where: { id: userId },
          data: {
            globalCoins: { increment: bonusCoins },
            zenGarden: nextState
          },
          select: {
            globalCoins: true,
            zenGarden: true
          }
        });

        return u;
      });

      void createAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        actorName: user.name,
        actorRole: user.globalRole,
        category: "USER",
        action: "ZEN_GARDEN_NURTURE",
        targetType: "User",
        targetId: user.id,
        targetName: user.name ?? user.email,
        summary: `User nurtured Solitary Zen Garden (Streak: ${newStreak}, +${bonusCoins} coins)`,
        beforeState: {
          globalCoins: user.globalCoins,
          zenGarden: currentState
        },
        afterState: {
          globalCoins: updatedUser.globalCoins,
          zenGarden: nextState
        },
        diff: {
          coinsGained: bonusCoins,
          newStreak
        }
      });

      return NextResponse.json({
        success: true,
        alreadyNurturedToday: false,
        awardedCoins: bonusCoins,
        globalCoins: updatedUser.globalCoins,
        zenGarden: nextState
      });
    }

    if (body.action === "set-guardian") {
      const plant = BOTANICAL_PLANTS.find((p) => p.id === body.guardianId);
      if (!plant) {
        return jsonError("Unknown botanical plant specimen.", 400);
      }

      if (user.globalCoins < plant.cost) {
        return jsonError(`You need ${plant.cost} coins to cultivate this botanical guardian.`, 400);
      }

      const nextState = {
        ...currentState,
        activeGuardianId: plant.id
      };

      await prisma.user.update({
        where: { id: userId },
        data: { zenGarden: nextState }
      });

      return NextResponse.json({
        success: true,
        zenGarden: nextState
      });
    }

    if (body.action === "complete-breath") {
      const addedMinutes = body.minutes;
      const nextState = {
        ...currentState,
        totalZenMinutes: currentState.totalZenMinutes + addedMinutes
      };

      await prisma.user.update({
        where: { id: userId },
        data: { zenGarden: nextState }
      });

      return NextResponse.json({
        success: true,
        zenGarden: nextState
      });
    }

    return jsonError("Unsupported action.", 400);
  } catch (error) {
    return parseError(error);
  }
}
