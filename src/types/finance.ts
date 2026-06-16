export type FinanceTransactionType = "INCOME" | "EXPENSE";
export type FinanceAccountType = "CASH" | "BANK" | "WALLET" | "CREDIT" | "OTHER";
export type BillingCycle = "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";

export interface SerializedFinanceCategory {
  id: string;
  name: string;
  type: FinanceTransactionType;
  color: string | null;
  icon: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedFinanceAccount {
  id: string;
  name: string;
  type: FinanceAccountType;
  balance: number | null;
  color: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedFinanceTransaction {
  id: string;
  type: FinanceTransactionType;
  title: string;
  description: string | null;
  amount: number;
  categoryId: string | null;
  accountId: string | null;
  ledgerId: string | null;
  transactionDate: string;
  paymentMethod: string | null;
  note: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  category: SerializedFinanceCategory | null;
  account: SerializedFinanceAccount | null;
}

export interface SerializedFinanceSubscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  categoryId: string | null;
  accountId: string | null;
  ledgerId: string | null;
  isActive: boolean;
  note: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category: SerializedFinanceCategory | null;
  account: SerializedFinanceAccount | null;
}

export interface SerializedRecurringIncome {
  id: string;
  name: string;
  amount: number;
  incomeCycle: BillingCycle;
  nextIncomeDate: string;
  categoryId: string | null;
  accountId: string | null;
  ledgerId: string | null;
  isActive: boolean;
  note: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category: SerializedFinanceCategory | null;
  account: SerializedFinanceAccount | null;
}

export interface SerializedFinanceLedger {
  id: string;
  name: string;
  color: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedFinanceBudget {
  id: string;
  amount: number;
  categoryId: string | null;
  ledgerId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
