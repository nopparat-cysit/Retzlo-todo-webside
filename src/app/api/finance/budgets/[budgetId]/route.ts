import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function DELETE(
  request: Request,
  { params }: { params: { budgetId: string } }
) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const { budgetId } = params;

    // Verify ownership
    const budget = await prisma.financeBudget.findUnique({
      where: { id: budgetId }
    });

    if (!budget || budget.userId !== userId) {
      return jsonError("Budget not found or unauthorized.", 404);
    }

    await prisma.financeBudget.delete({
      where: { id: budgetId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return parseError(error);
  }
}
