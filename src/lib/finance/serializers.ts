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
