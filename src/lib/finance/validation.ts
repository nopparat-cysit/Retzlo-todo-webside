import { z } from "zod";

export const financeTransactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);
export const financeAccountTypeSchema = z.enum(["CASH", "BANK", "WALLET", "CREDIT", "OTHER"]);
export const billingCycleSchema = z.enum(["WEEKLY", "MONTHLY", "YEARLY", "CUSTOM"]);

const optionalId = z.string().uuid().nullable().optional();
const optionalText = z.preprocess((value) => value ?? null, z.string().trim().max(1000).nullable());
const requiredDate = z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date");

export const createFinanceTransactionSchema = z.object({
  type: financeTransactionTypeSchema,
  title: z.string().trim().min(1).max(120),
  description: optionalText.optional(),
  amount: z.coerce.number().positive(),
  categoryId: optionalId,
  accountId: optionalId,
  transactionDate: requiredDate,
  paymentMethod: z.string().trim().max(80).nullable().optional(),
  note: optionalText.optional()
});

export const updateFinanceTransactionSchema = createFinanceTransactionSchema.partial();

export const createFinanceCategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: financeTransactionTypeSchema,
  color: z.string().trim().max(40).nullable().optional(),
  icon: z.string().trim().max(40).nullable().optional()
});

export const createFinanceAccountSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: financeAccountTypeSchema,
  balance: z.coerce.number().optional(),
  color: z.string().trim().max(40).nullable().optional()
});

export const createSubscriptionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  amount: z.coerce.number().positive(),
  billingCycle: billingCycleSchema,
  nextBillingDate: requiredDate,
  categoryId: optionalId,
  accountId: optionalId,
  isActive: z.boolean().default(true),
  note: optionalText.optional()
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial();
