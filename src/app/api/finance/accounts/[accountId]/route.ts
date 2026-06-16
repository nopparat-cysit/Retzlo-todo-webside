import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { serializeFinanceAccount } from "@/lib/finance/serializers";
import { updateFinanceAccountSchema } from "@/lib/finance/validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function PATCH(request: Request, { params }: { params: { accountId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const existing = await prisma.financeAccount.findFirst({
      where: { id: params.accountId, userId },
      select: { id: true }
    });

    if (!existing) {
      return jsonError("Account not found.", 404);
    }

    const payload = updateFinanceAccountSchema.parse(await request.json());
    const account = await prisma.financeAccount.update({
      where: { id: params.accountId },
      data: {
        name: payload.name,
        type: payload.type,
        balance: payload.balance,
        color: payload.color
      }
    });

    return NextResponse.json({ account: serializeFinanceAccount(account) });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { accountId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const existing = await prisma.financeAccount.findFirst({
      where: { id: params.accountId, userId },
      select: { id: true }
    });

    if (!existing) {
      return jsonError("Account not found.", 404);
    }

    await prisma.$transaction([
      prisma.financeTransaction.updateMany({
        where: { accountId: params.accountId, createdById: userId },
        data: { accountId: null }
      }),
      prisma.subscription.updateMany({
        where: { accountId: params.accountId, userId },
        data: { accountId: null }
      }),
      prisma.recurringIncome.updateMany({
        where: { accountId: params.accountId, userId },
        data: { accountId: null }
      }),
      prisma.financeAccount.delete({
        where: { id: params.accountId }
      })
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
