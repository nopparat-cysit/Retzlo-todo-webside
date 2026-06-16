import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { serializeFinanceBudget } from "@/lib/finance/serializers";
import { upsertBudgetSchema } from "@/lib/finance/validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function GET(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const { searchParams } = new URL(request.url);
    const ledgerId = searchParams.get("ledgerId");

    const budgets = await prisma.financeBudget.findMany({
      where: {
        userId,
        ...(ledgerId ? { ledgerId } : {})
      }
    });

    return NextResponse.json({ budgets: budgets.map(serializeFinanceBudget) });
  } catch (error) {
    return parseError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = upsertBudgetSchema.parse(await request.json());

    // Locate existing budget limit for safety
    const existing = await prisma.financeBudget.findFirst({
      where: {
        userId,
        ledgerId: payload.ledgerId ?? null,
        categoryId: payload.categoryId ?? null
      }
    });

    let budget;
    if (existing) {
      budget = await prisma.financeBudget.update({
        where: { id: existing.id },
        data: {
          amount: payload.amount
        }
      });
    } else {
      budget = await prisma.financeBudget.create({
        data: {
          amount: payload.amount,
          ledgerId: payload.ledgerId ?? null,
          categoryId: payload.categoryId ?? null,
          userId
        }
      });
    }

    return NextResponse.json({ budget: serializeFinanceBudget(budget) });
  } catch (error) {
    return parseError(error);
  }
}
