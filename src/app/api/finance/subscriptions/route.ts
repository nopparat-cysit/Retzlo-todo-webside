import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { assertFinanceAccountOwner, assertFinanceCategoryOwner } from "@/lib/finance/permissions";
import { serializeFinanceSubscription } from "@/lib/finance/serializers";
import { createSubscriptionSchema } from "@/lib/finance/validation";
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

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        ...(ledgerId ? { ledgerId } : {})
      },
      include: {
        category: true,
        account: true
      },
      orderBy: [{ isActive: "desc" }, { nextBillingDate: "asc" }]
    });

    return NextResponse.json({
      subscriptions: subscriptions.map(serializeFinanceSubscription)
    });
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

    const payload = createSubscriptionSchema.parse(await request.json());
    const categoryError = await assertFinanceCategoryOwner(payload.categoryId, userId, "EXPENSE");
    if (categoryError) return categoryError;

    const accountError = await assertFinanceAccountOwner(payload.accountId, userId);
    if (accountError) return accountError;

    const subscription = await prisma.subscription.create({
      data: {
        name: payload.name,
        amount: payload.amount,
        billingCycle: payload.billingCycle,
        nextBillingDate: new Date(payload.nextBillingDate),
        categoryId: payload.categoryId ?? null,
        accountId: payload.accountId ?? null,
        ledgerId: payload.ledgerId ?? null,
        isActive: payload.isActive,
        note: payload.note,
        userId
      },
      include: {
        category: true,
        account: true
      }
    });

    return NextResponse.json({ subscription: serializeFinanceSubscription(subscription) }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
