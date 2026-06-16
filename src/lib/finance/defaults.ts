import { prisma } from "@/lib/prisma";

export const defaultFinanceCategories = [
  { name: "Salary", type: "INCOME", color: "emerald", icon: "briefcase" },
  { name: "Freelance", type: "INCOME", color: "cyan", icon: "sparkles" },
  { name: "Other", type: "INCOME", color: "lavender", icon: "plus" },
  { name: "Food", type: "EXPENSE", color: "amber", icon: "utensils" },
  { name: "Rent", type: "EXPENSE", color: "rose", icon: "home" },
  { name: "Transport", type: "EXPENSE", color: "cyan", icon: "car" },
  { name: "AI", type: "EXPENSE", color: "lavender", icon: "bot" },
  { name: "Subscription", type: "EXPENSE", color: "pink", icon: "repeat" },
  { name: "Pet", type: "EXPENSE", color: "emerald", icon: "paw" },
  { name: "Health", type: "EXPENSE", color: "red", icon: "health" },
  { name: "Entertainment", type: "EXPENSE", color: "purple", icon: "film" },
  { name: "Other", type: "EXPENSE", color: "stone", icon: "circle" }
] as const;

export const defaultFinanceAccounts = [
  { name: "Cash", type: "CASH", balance: 0, color: "amber" },
  { name: "Bank", type: "BANK", balance: 0, color: "cyan" },
  { name: "Wallet", type: "WALLET", balance: 0, color: "lavender" },
  { name: "Credit Card", type: "CREDIT", balance: 0, color: "rose" }
] as const;

export async function ensureDefaultFinanceCategories(userId: string) {
  const count = await prisma.financeCategory.count({ where: { userId } });

  if (count > 0) return;

  await prisma.financeCategory.createMany({
    data: defaultFinanceCategories.map((category) => ({
      ...category,
      userId
    })),
    skipDuplicates: true
  });
}

export async function ensureDefaultFinanceAccounts(userId: string) {
  const count = await prisma.financeAccount.count({ where: { userId } });

  if (count > 0) return;

  await prisma.financeAccount.createMany({
    data: defaultFinanceAccounts.map((account) => ({
      ...account,
      userId
    })),
    skipDuplicates: true
  });
}
