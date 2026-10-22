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
  generateDailyFortune,
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
  }),
  z.object({
    action: z.literal("award-dewdrop"),
    count: z.number().int().min(1).max(20).default(1)
  }),
  z.object({
    action: z.literal("award-sunlight"),
    count: z.number().int().min(1).max(20).default(1)
  }),
  z.object({
    action: z.literal("water-plot"),
    slotIndex: z.number().int().min(0).max(8)
  }),
  z.object({
    action: z.literal("bask-plot"),
    slotIndex: z.number().int().min(0).max(8)
  }),
  z.object({
    action: z.literal("plant-plot"),
    slotIndex: z.number().int().min(0).max(8),
    itemType: z.enum(["flora", "decor", "empty"]),
    itemId: z.string().nullable()
  }),
  z.object({
    action: z.literal("clear-plot"),
    slotIndex: z.number().int().min(0).max(8)
  }),
  z.object({
    action: z.literal("ring-bell")
  })
]);

function calculateGrowthStage(waterCount: number): number {
  if (waterCount >= 25) return 5; // Ancient Heritage
  if (waterCount >= 12) return 4; // Blooming
  if (waterCount >= 6) return 3;  // Sapling
  if (waterCount >= 2) return 2;  // Sprout
  return 1;                       // Seed
}

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
  const todayStr = new Date().toISOString().split("T")[0];
  if (zenGarden.lastWateredDate === todayStr && !zenGarden.dailyFortune) {
    zenGarden.dailyFortune = generateDailyFortune(todayStr, zenGarden.nurtureStreak);
  }

  return NextResponse.json({
    globalCoins: user.globalCoins,
    zenGarden,
    dailyFortune: zenGarden.lastWateredDate === todayStr ? zenGarden.dailyFortune : null
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

    const existingRawZenGarden =
      typeof user.zenGarden === "object" && user.zenGarden !== null
        ? (user.zenGarden as Record<string, unknown>)
        : {};
    const currentState = parseZenGardenState(user.zenGarden);
    const todayStr = new Date().toISOString().split("T")[0];

    // ── 1. Nurture Daily Streak & Reveal Omikuji Fortune ────────────────────
    if (body.action === "nurture") {
      const allowed = canWaterToday(currentState.lastWateredDate, todayStr);
      if (!allowed) {
        const existingFortune =
          currentState.dailyFortune && currentState.dailyFortune.date === todayStr
            ? currentState.dailyFortune
            : generateDailyFortune(todayStr, currentState.nurtureStreak);

        return NextResponse.json({
          success: false,
          alreadyNurturedToday: true,
          globalCoins: user.globalCoins,
          dailyFortune: existingFortune,
          zenGarden: {
            ...currentState,
            dailyFortune: existingFortune
          },
          message: "The sanctuary has already been watered today. Your daily fortune remains active."
        });
      }

      const newStreak = computeNewStreak(currentState.lastWateredDate, currentState.nurtureStreak, todayStr);
      const bonusCoins = 5;
      const dailyFortune = generateDailyFortune(todayStr, newStreak);

      const nextState = {
        ...currentState,
        nurtureStreak: newStreak,
        lastWateredDate: todayStr,
        dailyFortune,
        totalNourished: currentState.totalNourished + 1
      };

      const updatedUser = await prisma.$transaction(async (tx) => {
        const u = await tx.user.update({
          where: { id: userId },
          data: {
            globalCoins: { increment: bonusCoins },
            zenGarden: {
              ...existingRawZenGarden,
              ...nextState
            }
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
        summary: `User watered garden and revealed daily Omikuji fortune ${dailyFortune.gradeName} (Streak: ${newStreak}, +${bonusCoins} coins)`,
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
          newStreak,
          fortuneGrade: dailyFortune.grade
        }
      });

      return NextResponse.json({
        success: true,
        alreadyNurturedToday: false,
        awardedCoins: bonusCoins,
        globalCoins: updatedUser.globalCoins,
        dailyFortune,
        zenGarden: nextState
      });
    }

    // ── 2. Set Guardian ──────────────────────────────────────────────────────
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
        data: {
          zenGarden: {
            ...existingRawZenGarden,
            ...nextState
          }
        }
      });

      void createAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        actorName: user.name,
        actorRole: user.globalRole,
        category: "USER",
        action: "ZEN_GUARDIAN_SET",
        targetType: "User",
        targetId: user.id,
        targetName: user.name ?? user.email,
        summary: `User changed Zen Garden active guardian to ${plant.name}`,
        beforeState: { activeGuardianId: currentState.activeGuardianId },
        afterState: { activeGuardianId: plant.id },
        diff: { previousGuardian: currentState.activeGuardianId, nextGuardian: plant.id }
      });

      return NextResponse.json({
        success: true,
        zenGarden: nextState
      });
    }

    // ── 3. Complete Box Breathing ────────────────────────────────────────────
    if (body.action === "complete-breath") {
      const addedMinutes = body.minutes;
      const nextState = {
        ...currentState,
        totalZenMinutes: currentState.totalZenMinutes + addedMinutes
      };

      await prisma.user.update({
        where: { id: userId },
        data: {
          zenGarden: {
            ...existingRawZenGarden,
            ...nextState
          }
        }
      });

      void createAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        actorName: user.name,
        actorRole: user.globalRole,
        category: "USER",
        action: "ZEN_BREATH_COMPLETE",
        targetType: "User",
        targetId: user.id,
        targetName: user.name ?? user.email,
        summary: `User finished ${addedMinutes} mindful breathing minute(s)`,
        beforeState: { totalZenMinutes: currentState.totalZenMinutes },
        afterState: { totalZenMinutes: nextState.totalZenMinutes },
        diff: { addedMinutes }
      });

      return NextResponse.json({
        success: true,
        zenGarden: nextState
      });
    }

    // ── 4. Award Dewdrops ────────────────────────────────────────────────────
    if (body.action === "award-dewdrop") {
      const addedCount = body.count;
      const nextState = {
        ...currentState,
        dewdrops: currentState.dewdrops + addedCount
      };

      await prisma.user.update({
        where: { id: userId },
        data: {
          zenGarden: {
            ...existingRawZenGarden,
            ...nextState
          }
        }
      });

      void createAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        actorName: user.name,
        actorRole: user.globalRole,
        category: "USER",
        action: "ZEN_DEWDROP_AWARD",
        targetType: "User",
        targetId: user.id,
        targetName: user.name ?? user.email,
        summary: `Awarded +${addedCount} morning dewdrop(s) to Zen Garden`,
        beforeState: { dewdrops: currentState.dewdrops },
        afterState: { dewdrops: nextState.dewdrops },
        diff: { addedCount }
      });

      return NextResponse.json({
        success: true,
        awardedDewdrops: addedCount,
        zenGarden: nextState
      });
    }

    // ── 5. Award Sunlight ────────────────────────────────────────────────────
    if (body.action === "award-sunlight") {
      const addedCount = body.count;
      const nextState = {
        ...currentState,
        sunlight: currentState.sunlight + addedCount
      };

      await prisma.user.update({
        where: { id: userId },
        data: {
          zenGarden: {
            ...existingRawZenGarden,
            ...nextState
          }
        }
      });

      void createAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        actorName: user.name,
        actorRole: user.globalRole,
        category: "USER",
        action: "ZEN_SUNLIGHT_AWARD",
        targetType: "User",
        targetId: user.id,
        targetName: user.name ?? user.email,
        summary: `Awarded +${addedCount} sunlight to Zen Garden`,
        beforeState: { sunlight: currentState.sunlight },
        afterState: { sunlight: nextState.sunlight },
        diff: { addedCount }
      });

      return NextResponse.json({
        success: true,
        awardedSunlight: addedCount,
        zenGarden: nextState
      });
    }

    // ── 6. Water Plot ────────────────────────────────────────────────────────
    if (body.action === "water-plot") {
      if (currentState.dewdrops < 1) {
        return jsonError("No dewdrops available. Complete tasks on your Kanban board to gather morning dew!", 400);
      }

      const slot = currentState.plots[body.slotIndex];
      if (!slot || slot.itemType === "empty") {
        return jsonError("This plot is currently empty. Cultivate a seed first!", 400);
      }

      const newWaterCount = slot.waterCount + 1;
      const newStage = calculateGrowthStage(newWaterCount);

      const updatedPlots = currentState.plots.map((p, idx) => {
        if (idx === body.slotIndex) {
          return {
            ...p,
            waterCount: newWaterCount,
            stage: newStage,
            moisture: Math.min(100, p.moisture + 25)
          };
        }
        return p;
      });

      const nextState = {
        ...currentState,
        dewdrops: currentState.dewdrops - 1,
        totalNourished: currentState.totalNourished + 1,
        plots: updatedPlots
      };

      await prisma.user.update({
        where: { id: userId },
        data: {
          zenGarden: {
            ...existingRawZenGarden,
            ...nextState
          }
        }
      });

      void createAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        actorName: user.name,
        actorRole: user.globalRole,
        category: "USER",
        action: "ZEN_PLOT_WATER",
        targetType: "User",
        targetId: user.id,
        targetName: user.name ?? user.email,
        summary: `Nourished plot #${body.slotIndex + 1} (-1 dewdrop, new water count: ${newWaterCount})`,
        beforeState: { plot: slot, dewdrops: currentState.dewdrops },
        afterState: { plot: updatedPlots[body.slotIndex], dewdrops: nextState.dewdrops },
        diff: { slotIndex: body.slotIndex, leveledUp: newStage > slot.stage }
      });

      return NextResponse.json({
        success: true,
        leveledUp: newStage > slot.stage,
        zenGarden: nextState
      });
    }

    // ── 7. Bask Plot in Sunlight ─────────────────────────────────────────────
    if (body.action === "bask-plot") {
      if (currentState.sunlight < 1) {
        return jsonError("No sunlight available. Complete Pomodoro focus blocks to absorb solar energy!", 400);
      }

      const slot = currentState.plots[body.slotIndex];
      if (!slot || slot.itemType === "empty") {
        return jsonError("This plot is currently empty. Cultivate a seed first!", 400);
      }

      // Sunlight counts as +2 growth units
      const newWaterCount = slot.waterCount + 2;
      const newStage = calculateGrowthStage(newWaterCount);

      const updatedPlots = currentState.plots.map((p, idx) => {
        if (idx === body.slotIndex) {
          return {
            ...p,
            waterCount: newWaterCount,
            stage: newStage
          };
        }
        return p;
      });

      const nextState = {
        ...currentState,
        sunlight: currentState.sunlight - 1,
        plots: updatedPlots
      };

      await prisma.user.update({
        where: { id: userId },
        data: {
          zenGarden: {
            ...existingRawZenGarden,
            ...nextState
          }
        }
      });

      void createAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        actorName: user.name,
        actorRole: user.globalRole,
        category: "USER",
        action: "ZEN_PLOT_BASK",
        targetType: "User",
        targetId: user.id,
        targetName: user.name ?? user.email,
        summary: `Basked plot #${body.slotIndex + 1} in sunlight (-1 sun, +2 growth)`,
        beforeState: { plot: slot, sunlight: currentState.sunlight },
        afterState: { plot: updatedPlots[body.slotIndex], sunlight: nextState.sunlight },
        diff: { slotIndex: body.slotIndex, leveledUp: newStage > slot.stage }
      });

      return NextResponse.json({
        success: true,
        leveledUp: newStage > slot.stage,
        zenGarden: nextState
      });
    }

    // ── 8. Plant Plot ────────────────────────────────────────────────────────
    if (body.action === "plant-plot") {
      const updatedPlots = currentState.plots.map((p, idx) => {
        if (idx === body.slotIndex) {
          return {
            ...p,
            itemType: body.itemType,
            itemId: body.itemId,
            stage: 1, // Start at tender Seed / Sprout stage
            waterCount: 0,
            moisture: 60,
            plantedAt: new Date().toISOString()
          };
        }
        return p;
      });

      const nextState = {
        ...currentState,
        plots: updatedPlots
      };

      await prisma.user.update({
        where: { id: userId },
        data: {
          zenGarden: {
            ...existingRawZenGarden,
            ...nextState
          }
        }
      });

      void createAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        actorName: user.name,
        actorRole: user.globalRole,
        category: "USER",
        action: "ZEN_PLOT_PLANT",
        targetType: "User",
        targetId: user.id,
        targetName: user.name ?? user.email,
        summary: `Cultivated ${body.itemId} in plot #${body.slotIndex + 1}`,
        beforeState: { plot: currentState.plots[body.slotIndex] },
        afterState: { plot: updatedPlots[body.slotIndex] },
        diff: { slotIndex: body.slotIndex, itemId: body.itemId }
      });

      return NextResponse.json({
        success: true,
        zenGarden: nextState
      });
    }

    // ── 9. Clear / Dig Up Plot ───────────────────────────────────────────────
    if (body.action === "clear-plot") {
      const prevPlot = currentState.plots[body.slotIndex];
      const updatedPlots = currentState.plots.map((p, idx) => {
        if (idx === body.slotIndex) {
          return {
            slotIndex: body.slotIndex,
            itemType: "empty" as const,
            itemId: null,
            stage: 1,
            waterCount: 0,
            moisture: 50,
            plantedAt: null
          };
        }
        return p;
      });

      const nextState = {
        ...currentState,
        plots: updatedPlots
      };

      await prisma.user.update({
        where: { id: userId },
        data: {
          zenGarden: {
            ...existingRawZenGarden,
            ...nextState
          }
        }
      });

      void createAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        actorName: user.name,
        actorRole: user.globalRole,
        category: "USER",
        action: "ZEN_PLOT_CLEAR",
        targetType: "User",
        targetId: user.id,
        targetName: user.name ?? user.email,
        summary: `Cleared plot #${body.slotIndex + 1}`,
        beforeState: { plot: prevPlot },
        afterState: { plot: updatedPlots[body.slotIndex] },
        diff: { slotIndex: body.slotIndex, clearedItem: prevPlot?.itemId }
      });

      return NextResponse.json({
        success: true,
        zenGarden: nextState
      });
    }

    // ── 10. Ring Singing Bowl ────────────────────────────────────────────────
    if (body.action === "ring-bell") {
      return NextResponse.json({
        success: true,
        message: "Chime reverberated through the sanctuary."
      });
    }

    return jsonError("Unsupported action.", 400);
  } catch (error) {
    return parseError(error);
  }
}
