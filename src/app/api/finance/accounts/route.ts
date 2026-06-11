import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { ensureDefaultFinanceAccounts } from "@/lib/finance/defaults";
import { serializeFinanceAccount } from "@/lib/finance/serializers";
import { createFinanceAccountSchema } from "@/lib/finance/validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  await ensureDefaultFinanceAccounts(userId);

  const accounts = await prisma.financeAccount.findMany({
    where: { userId },
    orderBy: [{ type: "asc" }, { name: "asc" }]
  });

  return NextResponse.json({ accounts: accounts.map(serializeFinanceAccount) });
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = createFinanceAccountSchema.parse(await request.json());
    const account = await prisma.financeAccount.create({
      data: {
        name: payload.name,
        type: payload.type,
        balance: payload.balance,
        color: payload.color,
        userId
      }
    });

    return NextResponse.json({ account: serializeFinanceAccount(account) }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
