import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function assertFinanceCategoryOwner(categoryId: string | null | undefined, userId: string, type?: string) {
  if (!categoryId) return null;

  const category = await prisma.financeCategory.findFirst({
    where: {
      id: categoryId,
      userId,
      ...(type ? { type } : {})
    }
  });

  if (!category) {
    return jsonError("Category not found.", 404);
  }

  return null;
}

export async function assertFinanceAccountOwner(accountId: string | null | undefined, userId: string) {
  if (!accountId) return null;

  const account = await prisma.financeAccount.findFirst({
    where: {
      id: accountId,
      userId
    }
  });

  if (!account) {
    return jsonError("Account not found.", 404);
  }

  return null;
}
