import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertFinanceAccountOwner, assertFinanceCategoryOwner } from "@/lib/finance/permissions";
import { serializeFinanceTransaction } from "@/lib/finance/serializers";
import { updateFinanceTransactionSchema } from "@/lib/finance/validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function PATCH(request: Request, { params }: { params: { transactionId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const existing = await prisma.financeTransaction.findFirst({
      where: {
        id: params.transactionId,
        createdById: userId
      }
    });

    if (!existing) {
      return jsonError("Transaction not found.", 404);
    }

    const payload = updateFinanceTransactionSchema.parse(await request.json());
    const nextType = payload.type ?? existing.type;
    const categoryIdForCheck = payload.categoryId === undefined ? existing.categoryId : payload.categoryId;
    const categoryError = await assertFinanceCategoryOwner(categoryIdForCheck, userId, nextType);
    if (categoryError) return categoryError;

    const accountError = await assertFinanceAccountOwner(payload.accountId, userId);
    if (accountError) return accountError;

    const transaction = await prisma.financeTransaction.update({
      where: { id: params.transactionId },
      data: {
        type: payload.type,
        title: payload.title,
        description: payload.description,
        amount: payload.amount,
        categoryId: payload.categoryId,
        accountId: payload.accountId,
        transactionDate: payload.transactionDate ? new Date(payload.transactionDate) : undefined,
        paymentMethod: payload.paymentMethod,
        note: payload.note
      },
      include: {
        category: true,
        account: true
      }
    });

    return NextResponse.json({ transaction: serializeFinanceTransaction(transaction) });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { transactionId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const existing = await prisma.financeTransaction.findFirst({
      where: {
        id: params.transactionId,
        createdById: userId
      },
      select: { id: true }
    });

    if (!existing) {
      return jsonError("Transaction not found.", 404);
    }

    await prisma.financeTransaction.delete({
      where: { id: params.transactionId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
