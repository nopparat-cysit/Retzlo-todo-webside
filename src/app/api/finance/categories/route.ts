import { NextResponse } from "next/server";

import { jsonError, parseError } from "@/lib/api";
import { ensureDefaultFinanceCategories } from "@/lib/finance/defaults";
import { serializeFinanceCategory } from "@/lib/finance/serializers";
import { createFinanceCategorySchema } from "@/lib/finance/validation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return jsonError("Please sign in to continue.", 401);
  }

  await ensureDefaultFinanceCategories(userId);

  const categories = await prisma.financeCategory.findMany({
    where: { userId },
    orderBy: [{ type: "asc" }, { name: "asc" }]
  });

  return NextResponse.json({ categories: categories.map(serializeFinanceCategory) });
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Please sign in to continue.", 401);
    }

    const payload = createFinanceCategorySchema.parse(await request.json());
    const category = await prisma.financeCategory.create({
      data: {
        name: payload.name,
        type: payload.type,
        color: payload.color,
        icon: payload.icon,
        userId
      }
    });

    return NextResponse.json({ category: serializeFinanceCategory(category) }, { status: 201 });
  } catch (error) {
    return parseError(error);
  }
}
