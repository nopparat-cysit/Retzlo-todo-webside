import { redirect } from "next/navigation";

import { FinanceRecurringIncomePage } from "@/components/finance/finance-recurring-income-page";
import { ensureDefaultFinanceAccounts, ensureDefaultFinanceCategories } from "@/lib/finance/defaults";
import { serializeFinanceAccount, serializeFinanceCategory, serializeRecurringIncome } from "@/lib/finance/serializers";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export const metadata = {
  title: "Recurring Income - Retzlo Finance",
  description: "Personal finance recurring income management."
};

interface PageProps {
  searchParams: { ledgerId?: string };
}

export default async function FinanceRecurringIncomeRoute({ searchParams }: PageProps) {
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

  const [recurringIncomes, categories, accounts] = await Promise.all([
    prisma.recurringIncome.findMany({
      where: {
        userId,
        ...ledgerCondition
      },
      include: { category: true, account: true },
      orderBy: [{ isActive: "desc" }, { nextIncomeDate: "asc" }]
    }),
    prisma.financeCategory.findMany({ where: { userId }, orderBy: [{ type: "asc" }, { name: "asc" }] }),
    prisma.financeAccount.findMany({ where: { userId }, orderBy: [{ type: "asc" }, { name: "asc" }] })
  ]);

  return (
    <FinanceRecurringIncomePage
      accounts={accounts.map(serializeFinanceAccount)}
      categories={categories.map(serializeFinanceCategory)}
      initialRecurringIncomes={recurringIncomes.map(serializeRecurringIncome)}
    />
  );
}
