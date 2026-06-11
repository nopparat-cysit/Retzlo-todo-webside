import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertFinanceAccountOwner, assertFinanceCategoryOwner } from "@/lib/finance/permissions";
import { serializeFinanceSubscription } from "@/lib/finance/serializers";
import { updateSubscriptionSchema } from "@/lib/finance/validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function PATCH(request: Request, { params }: { params: { subscriptionId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const existing = await prisma.subscription.findFirst({
      where: {
        id: params.subscriptionId,
        userId
      }
    });

    if (!existing) {
      return jsonError("Subscription not found.", 404);
    }

    const payload = updateSubscriptionSchema.parse(await request.json());
    const categoryError = await assertFinanceCategoryOwner(payload.categoryId, userId, "EXPENSE");
    if (categoryError) return categoryError;

    const accountError = await assertFinanceAccountOwner(payload.accountId, userId);
    if (accountError) return accountError;

    const subscription = await prisma.subscription.update({
      where: { id: params.subscriptionId },
      data: {
        name: payload.name,
        amount: payload.amount,
        billingCycle: payload.billingCycle,
        nextBillingDate: payload.nextBillingDate ? new Date(payload.nextBillingDate) : undefined,
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

    return NextResponse.json({ subscription: serializeFinanceSubscription(subscription) });
  } catch (error) {
    return parseError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { subscriptionId: string } }) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const existing = await prisma.subscription.findFirst({
      where: {
        id: params.subscriptionId,
        userId
      },
      select: { id: true }
    });

    if (!existing) {
      return jsonError("Subscription not found.", 404);
    }

    await prisma.subscription.delete({
      where: { id: params.subscriptionId }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return parseError(error);
  }
}
