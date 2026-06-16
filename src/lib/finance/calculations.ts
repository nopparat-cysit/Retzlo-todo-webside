import type { SerializedFinanceSubscription, SerializedFinanceTransaction, SerializedRecurringIncome } from "@/types/finance";

export function getMonthWindow(date = new Date()) {
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  return { from, to };
}

export function getSubscriptionMonthlyCost(subscription: Pick<SerializedFinanceSubscription, "amount" | "billingCycle">) {
  if (subscription.billingCycle === "YEARLY") return subscription.amount / 12;
  if (subscription.billingCycle === "WEEKLY") return subscription.amount * 4;

  return subscription.amount;
}

export function getRecurringIncomeMonthlyAmount(income: Pick<SerializedRecurringIncome, "amount" | "incomeCycle">) {
  if (income.incomeCycle === "YEARLY") return income.amount / 12;
  if (income.incomeCycle === "WEEKLY") return income.amount * 4;

  return income.amount;
}

export function calculateFinanceSummary(
  transactions: SerializedFinanceTransaction[],
  subscriptions: SerializedFinanceSubscription[],
  date = new Date()
) {
  const { from, to } = getMonthWindow(date);
  const monthTransactions = transactions.filter((transaction) => {
    const current = new Date(transaction.transactionDate);

    return current >= from && current < to;
  });
  const income = monthTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expense = monthTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const subscriptionMonthlyCost = subscriptions
    .filter((subscription) => subscription.isActive)
    .reduce((sum, subscription) => sum + getSubscriptionMonthlyCost(subscription), 0);

  return {
    income,
    expense,
    balance: income - expense,
    subscriptionMonthlyCost
  };
}

export function calculateExpenseBreakdown(transactions: SerializedFinanceTransaction[], date = new Date()) {
  const { from, to } = getMonthWindow(date);
  const breakdown = new Map<string, number>();

  for (const transaction of transactions) {
    const current = new Date(transaction.transactionDate);

    if (transaction.type !== "EXPENSE" || current < from || current >= to) continue;

    const label = transaction.category?.name ?? "Uncategorized";
    breakdown.set(label, (breakdown.get(label) ?? 0) + transaction.amount);
  }

  return [...breakdown.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}
