import { redirect } from "next/navigation";

import { FinanceSubscriptionsPage } from "@/components/finance/finance-subscriptions-page";
import { ensureDefaultFinanceAccounts, ensureDefaultFinanceCategories } from "@/lib/finance/defaults";
import { serializeFinanceAccount, serializeFinanceCategory, serializeFinanceSubscription } from "@/lib/finance/serializers";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export const metadata = {
  title: "Subscriptions - RETROD Finance",
  description: "Personal finance recurring bill management."
};

interface PageProps {
  searchParams: { ledgerId?: string };
}

export default async function FinanceSubscriptionsRoute({ searchParams }: PageProps) {
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

  const [subscriptions, categories, accounts] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        userId,
        ...ledgerCondition
      },
      include: { category: true, account: true },
      orderBy: [{ isActive: "desc" }, { nextBillingDate: "asc" }]
    }),
    prisma.financeCategory.findMany({ where: { userId }, orderBy: [{ type: "asc" }, { name: "asc" }] }),
    prisma.financeAccount.findMany({ where: { userId }, orderBy: [{ type: "asc" }, { name: "asc" }] })
  ]);

  return (
    <FinanceSubscriptionsPage
      accounts={accounts.map(serializeFinanceAccount)}
      categories={categories.map(serializeFinanceCategory)}
      initialSubscriptions={subscriptions.map(serializeFinanceSubscription)}
    />
  );
}
