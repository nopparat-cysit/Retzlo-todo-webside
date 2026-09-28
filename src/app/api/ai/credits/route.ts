import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { requireUserId } from "@/lib/project-auth";
import { getUserAiQuota } from "@/lib/ai/credits";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const quota = await getUserAiQuota(userId);
    return NextResponse.json({
      ok: true,
      quota
    });
  } catch (error) {
    return parseError(error);
  }
}
