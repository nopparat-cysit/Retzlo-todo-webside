import { redirect } from "next/navigation";

import { FinanceLedgerPage } from "@/components/finance/finance-ledger-page";
import { ensureDefaultFinanceAccounts, ensureDefaultFinanceCategories } from "@/lib/finance/defaults";
import { serializeFinanceAccount, serializeFinanceCategory, serializeFinanceTransaction } from "@/lib/finance/serializers";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export const metadata = {
  title: "Expenses - Retzlo Finance",
  description: "Personal finance expense history."
};

interface PageProps {
  searchParams: { ledgerId?: string };
}

export default async function FinanceExpensesPage({ searchParams }: PageProps) {
  const userId = await requireUserId();

  if (!userId) redirect("/login");

  const ledgerId = searchParams.ledgerId;
  if (!ledgerId) {
    redirect("/finance");
  }

  await Promise.all([ensureDefaultFinanceCategories(userId), ensureDefaultFinanceAccounts(userId)]);

  const ledgers = await prisma.financeLedger.findMany({
    where: { userId },
    orderBy: { name: "asc" }
  });

  if (ledgers.length === 0) {
    redirect("/finance");
  }

  const isDefaultLedger = ledgerId === ledgers[0].id;
  const ledgerCondition = isDefaultLedger
    ? { OR: [{ ledgerId }, { ledgerId: null }] }
    : { ledgerId };

  const [transactions, categories, accounts] = await Promise.all([
    prisma.financeTransaction.findMany({
      where: {
        createdById: userId,
        type: "EXPENSE",
        ...ledgerCondition
      },
      include: { category: true, account: true },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }]
    }),
    prisma.financeCategory.findMany({ where: { userId }, orderBy: [{ type: "asc" }, { name: "asc" }] }),
    prisma.financeAccount.findMany({ where: { userId }, orderBy: [{ type: "asc" }, { name: "asc" }] })
  ]);

  return (
    <FinanceLedgerPage
      accounts={accounts.map(serializeFinanceAccount)}
      categories={categories.map(serializeFinanceCategory)}
      initialTransactions={transactions.map(serializeFinanceTransaction)}
      type="EXPENSE"
    />
  );
}
