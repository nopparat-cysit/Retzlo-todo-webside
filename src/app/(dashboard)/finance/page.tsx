import { redirect } from "next/navigation";

import { FinanceDashboard } from "@/components/finance/finance-dashboard";
import { FinanceBooksPage } from "@/components/finance/finance-books-page";
import { ensureDefaultFinanceAccounts, ensureDefaultFinanceCategories } from "@/lib/finance/defaults";
import {
  serializeFinanceAccount,
  serializeFinanceCategory,
  serializeRecurringIncome,
  serializeFinanceSubscription,
  serializeFinanceTransaction,
  serializeFinanceLedger,
  serializeFinanceBudget
} from "@/lib/finance/serializers";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export const metadata = {
  title: "Accounting Finance - Retzlo",
  description: "Personal finance workspace for income, expense, subscriptions, and monthly balance."
};

interface PageProps {
  searchParams: { ledgerId?: string };
}

export default async function FinancePage({ searchParams }: PageProps) {
  const userId = await requireUserId();

  if (!userId) {
    redirect("/login");
  }

  await Promise.all([ensureDefaultFinanceCategories(userId), ensureDefaultFinanceAccounts(userId)]);

  // Get user's ledgers
  let ledgers = await prisma.financeLedger.findMany({
    where: { userId },
    orderBy: { name: "asc" }
  });

  // If none exist, create a default ledger
  if (ledgers.length === 0) {
    const defaultLedger = await prisma.financeLedger.create({
      data: {
        name: "Personal",
        color: "indigo",
        userId
      }
    });
    ledgers = [defaultLedger];
  }

  const activeLedgerId = searchParams.ledgerId;

  // IF NO active ledger ID is provided, render the Ledger Books landing page!
  if (!activeLedgerId) {
    const allTransactions = await prisma.financeTransaction.findMany({
      where: { createdById: userId },
      include: { category: true, account: true }
    });

    return (
      <FinanceBooksPage
        initialLedgers={ledgers.map(serializeFinanceLedger)}
        transactions={allTransactions.map(serializeFinanceTransaction)}
      />
    );
  }

  // Active ledger specified: render full Dashboard
  const activeLedger = ledgers.find((l) => l.id === activeLedgerId) || ledgers[0];
  const selectedLedgerId = activeLedger.id;

  // Backward compatibility filter
  const isDefaultLedger = selectedLedgerId === ledgers[0].id;
  const ledgerCondition = isDefaultLedger
    ? { OR: [{ ledgerId: selectedLedgerId }, { ledgerId: null }] }
    : { ledgerId: selectedLedgerId };

  const [transactions, categories, accounts, subscriptions, recurringIncomes, budgets] = await Promise.all([
    prisma.financeTransaction.findMany({
      where: {
        createdById: userId,
        ...ledgerCondition
      },
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
      where: {
        userId,
        ...ledgerCondition
      },
      include: {
        category: true,
        account: true
      },
      orderBy: [{ isActive: "desc" }, { nextBillingDate: "asc" }]
    }),
    prisma.recurringIncome.findMany({
      where: {
        userId,
        ...ledgerCondition
      },
      include: {
        category: true,
        account: true
      },
      orderBy: [{ isActive: "desc" }, { nextIncomeDate: "asc" }]
    }),
    prisma.financeBudget.findMany({
      where: {
        userId,
        ledgerId: selectedLedgerId
      }
    })
  ]);

  return (
    <FinanceDashboard
      initialAccounts={accounts.map(serializeFinanceAccount)}
      initialCategories={categories.map(serializeFinanceCategory)}
      initialRecurringIncomes={recurringIncomes.map(serializeRecurringIncome)}
      initialSubscriptions={subscriptions.map(serializeFinanceSubscription)}
      initialTransactions={transactions.map(serializeFinanceTransaction)}
      initialLedgers={ledgers.map(serializeFinanceLedger)}
      initialBudgets={budgets.map(serializeFinanceBudget)}
      activeLedgerId={selectedLedgerId}
    />
  );
}
