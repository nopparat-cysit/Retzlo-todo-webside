import type { Prisma } from "@prisma/client";

export type FinanceTransactionWithRelations = Prisma.FinanceTransactionGetPayload<{
  include: {
    category: true;
    account: true;
  };
}>;

export type FinanceSubscriptionWithRelations = Prisma.SubscriptionGetPayload<{
  include: {
    category: true;
    account: true;
  };
}>;

export type RecurringIncomeWithRelations = Prisma.RecurringIncomeGetPayload<{
  include: {
    category: true;
    account: true;
  };
}>;

export function serializeFinanceCategory(category: {
  id: string;
  name: string;
  type: string;
  color: string | null;
  icon: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...category,
    type: category.type as "INCOME" | "EXPENSE",
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString()
  };
}

export function serializeFinanceAccount(account: {
  id: string;
  name: string;
  type: string;
  balance: unknown;
  color: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...account,
    type: account.type as "CASH" | "BANK" | "WALLET" | "CREDIT" | "OTHER",
    balance: account.balance === null || account.balance === undefined ? null : Number(account.balance),
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString()
  };
}

export function serializeFinanceTransaction(transaction: FinanceTransactionWithRelations) {
  return {
    ...transaction,
    type: transaction.type as "INCOME" | "EXPENSE",
    amount: Number(transaction.amount),
    transactionDate: transaction.transactionDate.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
    category: transaction.category ? serializeFinanceCategory(transaction.category) : null,
    account: transaction.account ? serializeFinanceAccount(transaction.account) : null
  };
}

export function serializeFinanceSubscription(subscription: FinanceSubscriptionWithRelations) {
  return {
    ...subscription,
    billingCycle: subscription.billingCycle as "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM",
    amount: Number(subscription.amount),
    nextBillingDate: subscription.nextBillingDate.toISOString(),
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString(),
    category: subscription.category ? serializeFinanceCategory(subscription.category) : null,
    account: subscription.account ? serializeFinanceAccount(subscription.account) : null
  };
}

export function serializeRecurringIncome(income: RecurringIncomeWithRelations) {
  return {
    ...income,
    incomeCycle: income.incomeCycle as "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM",
    amount: Number(income.amount),
    nextIncomeDate: income.nextIncomeDate.toISOString(),
    createdAt: income.createdAt.toISOString(),
    updatedAt: income.updatedAt.toISOString(),
    category: income.category ? serializeFinanceCategory(income.category) : null,
    account: income.account ? serializeFinanceAccount(income.account) : null
  };
}

export function serializeFinanceLedger(ledger: {
  id: string;
  name: string;
  color: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...ledger,
    createdAt: ledger.createdAt.toISOString(),
    updatedAt: ledger.updatedAt.toISOString()
  };
}

export function serializeFinanceBudget(budget: {
  id: string;
  amount: unknown;
  categoryId: string | null;
  ledgerId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...budget,
    amount: Number(budget.amount),
    createdAt: budget.createdAt.toISOString(),
    updatedAt: budget.updatedAt.toISOString()
  };
}
