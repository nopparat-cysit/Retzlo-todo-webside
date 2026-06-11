import { redirect } from "next/navigation";

import { FinanceDashboard } from "@/components/finance/finance-dashboard";
import { ensureDefaultFinanceAccounts, ensureDefaultFinanceCategories } from "@/lib/finance/defaults";
import {
  serializeFinanceAccount,
  serializeFinanceCategory,
  serializeFinanceSubscription,
  serializeFinanceTransaction
} from "@/lib/finance/serializers";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export const metadata = {
  title: "Accounting Finance - RETROD",
  description: "Personal finance workspace for income, expense, subscriptions, and monthly balance."
};

export default async function FinancePage() {
  const userId = await requireUserId();

  if (!userId) {
    redirect("/login");
  }

  await Promise.all([ensureDefaultFinanceCategories(userId), ensureDefaultFinanceAccounts(userId)]);

  const [transactions, categories, accounts, subscriptions] = await Promise.all([
    prisma.financeTransaction.findMany({
      where: { createdById: userId },
      include: {
        category: true,
        account: true
      },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
      take: 80
    }),
    prisma.financeCategory.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { name: "asc" }]
    }),
    prisma.financeAccount.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { name: "asc" }]
    }),
    prisma.subscription.findMany({
      where: { userId },
      include: {
        category: true,
        account: true
      },
      orderBy: [{ isActive: "desc" }, { nextBillingDate: "asc" }]
    })
  ]);

  return (
    <FinanceDashboard
      initialAccounts={accounts.map(serializeFinanceAccount)}
      initialCategories={categories.map(serializeFinanceCategory)}
      initialSubscriptions={subscriptions.map(serializeFinanceSubscription)}
      initialTransactions={transactions.map(serializeFinanceTransaction)}
    />
  );
}
