import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError, parseError } from "@/lib/api";
import { requireUserId } from "@/lib/project-auth";
import { AI_CREDIT_COSTS, deductUserAiCredit } from "@/lib/ai/credits";
import { generateTaskBreakdown } from "@/lib/ai/deepseek";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const breakdownSchema = z.object({
  title: z.string().trim().min(1, "กรุณาระบุชื่องานที่ต้องการแตกเช็กลิสต์"),
  description: z.string().nullable().optional(),
  customGoal: z.string().nullable().optional(),
  depth: z.enum(["standard", "detailed"]).optional().default("detailed")
});

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("กรุณาเข้าสู่ระบบก่อนใช้งาน AI Assistant", 401);
    }

    const body = await request.json().catch(() => ({}));
    const payload = breakdownSchema.parse(body);

    // 1. Deduct 1 AI Credit atomically
    const creditResult = await deductUserAiCredit(
      userId,
      AI_CREDIT_COSTS.BREAKDOWN,
      "BREAKDOWN"
    );

    if (!creditResult.ok) {
      return jsonError(creditResult.error || "โควตา AI Credits ไม่เพียงพอ", 402);
    }

    // 2. Call DeepSeek Engine
    const result = await generateTaskBreakdown({
      title: payload.title,
      description: payload.description,
      customGoal: payload.customGoal,
      depth: payload.depth
    });

    return NextResponse.json({
      ok: true,
      items: result.items,
      suggestedDifficulty: result.suggestedDifficulty,
      suggestedPriority: result.suggestedPriority,
      summary: result.summary,
      remainingCredits: creditResult.remainingCredits
    });
  } catch (error) {
    return parseError(error);
  }
}
