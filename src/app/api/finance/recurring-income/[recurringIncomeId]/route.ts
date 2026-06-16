import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertFinanceAccountOwner, assertFinanceCategoryOwner } from "@/lib/finance/permissions";
import { serializeRecurringIncome } from "@/lib/finance/serializers";
import { updateRecurringIncomeSchema } from "@/lib/finance/validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function PATCH(request: Request, { params }: { params: { recurringIncomeId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const existing = await prisma.recurringIncome.findFirst({
      where: {
        id: params.recurringIncomeId,
        userId
      }
    });

    if (!existing) {
      return jsonError("Recurring income not found.", 404);
    }

    const payload = updateRecurringIncomeSchema.parse(await request.json());
    const categoryIdForCheck = payload.categoryId === undefined ? existing.categoryId : payload.categoryId;
    const categoryError = await assertFinanceCategoryOwner(categoryIdForCheck, userId, "INCOME");
    if (categoryError) return categoryError;

    const accountError = await assertFinanceAccountOwner(payload.accountId, userId);
    if (accountError) return accountError;

    const recurringIncome = await prisma.recurringIncome.update({
      where: { id: params.recurringIncomeId },
      data: {
        name: payload.name,
        amount: payload.amount,
        incomeCycle: payload.incomeCycle,
        nextIncomeDate: payload.nextIncomeDate ? new Date(payload.nextIncomeDate) : undefined,
        categoryId: payload.categoryId,
        accountId: payload.accountId,
        isActive: payload.isActive,
        note: payload.note
      },
      include: {
        category: true,
        account: true
      }
    });

    return NextResponse.json({ recurringIncome: serializeRecurringIncome(recurringIncome) });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { recurringIncomeId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const existing = await prisma.recurringIncome.findFirst({
      where: {
        id: params.recurringIncomeId,
        userId
      },
      select: { id: true }
    });

    if (!existing) {
      return jsonError("Recurring income not found.", 404);
    }

    await prisma.recurringIncome.delete({
      where: { id: params.recurringIncomeId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
