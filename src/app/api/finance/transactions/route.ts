import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertFinanceAccountOwner, assertFinanceCategoryOwner } from "@/lib/finance/permissions";
import { serializeFinanceTransaction } from "@/lib/finance/serializers";
import { createFinanceTransactionSchema } from "@/lib/finance/validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  const transactions = await prisma.financeTransaction.findMany({
    where: { createdById: userId },
    include: {
      category: true,
      account: true
    },
    orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({
    transactions: transactions.map(serializeFinanceTransaction)
  });
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = createFinanceTransactionSchema.parse(await request.json());
    const categoryError = await assertFinanceCategoryOwner(payload.categoryId, userId, payload.type);
    if (categoryError) return categoryError;

    const accountError = await assertFinanceAccountOwner(payload.accountId, userId);
    if (accountError) return accountError;

    const transaction = await prisma.financeTransaction.create({
      data: {
        type: payload.type,
        title: payload.title,
        description: payload.description,
        amount: payload.amount,
        categoryId: payload.categoryId ?? null,
        accountId: payload.accountId ?? null,
        transactionDate: new Date(payload.transactionDate),
        paymentMethod: payload.paymentMethod,
        note: payload.note,
        createdById: userId
      },
      include: {
        category: true,
        account: true
      }
    });

    return NextResponse.json({ transaction: serializeFinanceTransaction(transaction) }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
