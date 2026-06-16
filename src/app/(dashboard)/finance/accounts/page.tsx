import { redirect } from "next/navigation";

import { FinanceAccountsPage } from "@/components/finance/finance-accounts-page";
import { ensureDefaultFinanceAccounts } from "@/lib/finance/defaults";
import { serializeFinanceAccount } from "@/lib/finance/serializers";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/project-auth";

export const metadata = {
  title: "Accounts - RETROD Finance",
  description: "Personal finance account management."
};

interface PageProps {
  searchParams: { ledgerId?: string };
}

export default async function FinanceAccountsRoute({ searchParams }: PageProps) {
  const userId = await requireUserId();

  if (!userId) redirect("/login");

  const ledgerId = searchParams.ledgerId;
  if (!ledgerId) {
    redirect("/finance");
  }

  await ensureDefaultFinanceAccounts(userId);

  const accounts = await prisma.financeAccount.findMany({
    where: { userId },
    orderBy: [{ type: "asc" }, { name: "asc" }]
  });

  return <FinanceAccountsPage initialAccounts={accounts.map(serializeFinanceAccount)} />;
}
