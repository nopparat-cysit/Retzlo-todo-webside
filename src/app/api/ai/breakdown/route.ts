import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { requireUserId } from "@/lib/project-auth";
import { AI_CREDIT_COSTS, deductUserAiCredit, getUserAiQuota } from "@/lib/ai/credits";
import { generateTaskBreakdown } from "@/lib/ai/engine";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const breakdownSchema = z.object({
  title: z.string().trim().min(1, "กรุณาระบุชื่องานที่ต้องการแตกเช็กลิสต์"),
  description: z.string().nullable().optional(),
  customGoal: z.string().nullable().optional(),
  depth: z.enum(["standard", "detailed"]).optional().default("detailed"),
  itemCount: z.number().int().min(1).max(20).optional()
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("กรุณาเข้าสู่ระบบก่อนใช้งาน AI Assistant", 401);
    }

    const body = await request.json().catch(() => ({}));
    const payload = breakdownSchema.parse(body);

    // 1. Verify user has enough quota before calling AI
    const quota = await getUserAiQuota(userId);
    if (!quota.unlimited && quota.credits < AI_CREDIT_COSTS.BREAKDOWN) {
      return jsonError(`โควตา AI Credits ไม่เพียงพอ (คงเหลือ ${quota.credits} เครดิต)`, 402);
    }

    const clientApiKey =
      request.headers.get("x-ai-api-key")?.trim() ||
      request.headers.get("x-deepseek-api-key")?.trim() ||
      undefined;

    const clientModel = request.headers.get("x-ai-model")?.trim() || undefined;

    // 2. Call AI Engine
    const result = await generateTaskBreakdown({
      title: payload.title,
      description: payload.description,
      customGoal: payload.customGoal,
      depth: payload.depth,
      itemCount: payload.itemCount,
      apiKey: clientApiKey,
      model: clientModel
    });

    // 3. Deduct credit only on successful generation
    const creditResult = await deductUserAiCredit(
      userId,
      AI_CREDIT_COSTS.BREAKDOWN,
      "BREAKDOWN"
    );

    return NextResponse.json({
      ok: true,
      items: result.items,
      suggestedDifficulty: result.suggestedDifficulty,
      suggestedPriority: result.suggestedPriority,
      summary: result.summary,
      remainingCredits: creditResult.remainingCredits
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("ข้อมูลที่ส่งมาไม่ถูกต้อง", 422);
    }
    const message =
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการประมวลผล AI";
    return jsonError(message, 500);
  }
}
