import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertFinanceAccountOwner, assertFinanceCategoryOwner } from "@/lib/finance/permissions";
import { serializeRecurringIncome } from "@/lib/finance/serializers";
import { createRecurringIncomeSchema } from "@/lib/finance/validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  const recurringIncomes = await prisma.recurringIncome.findMany({
    where: { userId },
    include: {
      category: true,
      account: true
    },
    orderBy: [{ isActive: "desc" }, { nextIncomeDate: "asc" }]
  });

  return NextResponse.json({
    recurringIncomes: recurringIncomes.map(serializeRecurringIncome)
  });
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = createRecurringIncomeSchema.parse(await request.json());
    const categoryError = await assertFinanceCategoryOwner(payload.categoryId, userId, "INCOME");
    if (categoryError) return categoryError;

    const accountError = await assertFinanceAccountOwner(payload.accountId, userId);
    if (accountError) return accountError;

    const recurringIncome = await prisma.recurringIncome.create({
      data: {
        name: payload.name,
        amount: payload.amount,
        incomeCycle: payload.incomeCycle,
        nextIncomeDate: new Date(payload.nextIncomeDate),
        categoryId: payload.categoryId ?? null,
        accountId: payload.accountId ?? null,
        isActive: payload.isActive,
        note: payload.note,
        userId
      },
      include: {
        category: true,
        account: true
      }
    });

    return NextResponse.json({ recurringIncome: serializeRecurringIncome(recurringIncome) }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
